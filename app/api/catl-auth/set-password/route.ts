import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { setCatlPasswordByInvite } from "@/lib/catl-auth";
import {
  markCatlWelcomeEmailSent,
  rotateMagicLoginToken,
  generateCatlTwoFactorSecret,
  setCatlTwoFactorSecret,
  TWO_FACTOR_ISSUER,
} from "@/lib/catl-portal-users";
import { ObjectId } from "mongodb";
import { catlEmailShell, catlEmailButton, catlEmailInfoRow, CATL_CONTACT } from "@/lib/catl-email-layout";

export const dynamic = "force-dynamic";

function buildWelcomeEmail(recipientEmail: string, loginLink: string, twoFactorRequired: boolean, origin: string) {
  const year = new Date().getFullYear();
  const bodyHtml = `
<p style="margin:0 0 16px 0; font-size:16px; font-weight:600; color:#0F172A;">Dear Partner,</p>
<p style="margin:0 0 14px 0; font-size:15px; line-height:1.7; color:#334155;">
Your password has been set and your account on the dedicated CATL portal is now active. Welcome aboard.
</p>
<p style="margin:0 0 28px 0; font-size:15px; line-height:1.7; color:#334155;">
Access is available <strong>exclusively through your personal sign-in link</strong> below &mdash; there is no public login page.${
    twoFactorRequired
      ? " Because two-factor authentication is mandatory for your account, you will also be asked for the 6-digit code from your authenticator app when you sign in."
      : ""
  }
</p>
${catlEmailButton(loginLink, "Open the CATL portal")}
${catlEmailInfoRow(
  { label: "Your account", value: recipientEmail },
  { label: "Access", value: twoFactorRequired ? "Dedicated partner · 2FA required" : "Dedicated partner" }
)}
<p style="margin:0 0 30px 0; font-size:13px; line-height:1.7; color:#64748B;">
<strong style="color:#0F172A;">Security:</strong> this link is personal and valid for 30 days. Please do not forward or share it. After it expires, ask Pannon Transfer for a new invitation.
</p>`;
  const html = catlEmailShell({
    origin,
    preheader: "Your CATL portal account is active. Use your personal sign-in link to get started.",
    eyebrow: "Account activated",
    headline: "Welcome to the<br>CATL Booking Portal",
    bodyHtml,
    topRight: "Welcome",
  });
  const text = [
    "PANNON TRANSFER - CATL DEDICATED PORTAL",
    "",
    "Dear Partner,",
    "",
    "Your password has been set and your CATL portal account is now active.",
    twoFactorRequired
      ? "Two-factor authentication (2FA) is mandatory for your account."
      : "Two-factor authentication is not enabled for your account.",
    "",
    "Access is available only through your personal sign-in link (there is no public login page):",
    loginLink,
    "",
    "Your account: " + recipientEmail,
    "The link is valid for 30 days. After it expires, please ask Pannon Transfer for a new invitation.",
    "",
    "YOUR CONTACT",
    `${CATL_CONTACT.name} - ${CATL_CONTACT.role}`,
    CATL_CONTACT.email,
    CATL_CONTACT.phone,
    "",
    "This message was sent by the Pannon Transfer Komplex system.",
    `© ${year} Pannon Transfer. All rights reserved.`,
  ].join("\n");
  return { html, text };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body?.token || "");
    const password = String(body?.password || "");

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Missing token or password." },
        { status: 400 }
      );
    }

    const res = await setCatlPasswordByInvite(token, password);
    if (!res.success || !res.user) {
      return NextResponse.json(
        { success: false, message: res.message || "Password setup failed." },
        { status: 400 }
      );
    }

    const userId = res.user._id as ObjectId;
    const require2FA = !!res.user.requireTwoFactor;

    // 1) Magic login token (emailben küldött egyedi link)
    const { raw: magicRaw } = await rotateMagicLoginToken(userId);

    // 2) 2FA secret előkészítés HA KÖTELEZŐ (a usernek még be kell mutatnia, hogy tudja használni → 2FA step setup-password oldalon)
    let twoFactorSetup: null | { issuer: string; label: string; secretBase32: string; uri: string; backupCodes: string[]; qrDataUrl?: string } = null;
    if (require2FA) {
      const tfa = generateCatlTwoFactorSecret(res.user.email);
      twoFactorSetup = {
        issuer: TWO_FACTOR_ISSUER,
        label: res.user.email,
        secretBase32: tfa.secretBase32,
        uri: tfa.uri,
        backupCodes: tfa.backupCodes,
      };
      // Előre tároljuk a secret + backup kódokat, de még NEM kapcsoljuk be a twoFactorEnabled-et.
      // Csak a setup-password 2. lépésben, amikor a user beírja az első TOTP kódot és validál → akkor vált enabled=true.
      await setCatlTwoFactorSecret(userId, {
        secretBase32: tfa.secretBase32,
        backupCodes: tfa.backupCodes,
      });
      twoFactorSetup.qrDataUrl = await tfa.qrDataUrl;
    }

    // 3) Welcome email küldés az EGYEDI magic login linkkel (nem publikus /catl!)
    try {
      let origin = "";
      try {
        origin = new URL(request.url).origin;
      } catch {}

      let loginBase = origin;
      if (loginBase) {
        try {
          const u = new URL(loginBase);
          if ((u.hostname === "localhost" || u.hostname === "127.0.0.1") && u.port === "3000") {
            u.port = "3001";
            loginBase = u.origin;
          }
        } catch {}
      } else {
        loginBase = "http://localhost:3001";
      }

      const magicLink = `${loginBase}/catl/auth?token=${encodeURIComponent(magicRaw)}`;
      const { html, text } = buildWelcomeEmail(res.user.email, magicLink, require2FA, loginBase);

      console.log("\n=========== CATL WELCOME EMAIL (TEST MODE) ===========");
      console.log("Címzett:", res.user.email);
      console.log("2FA kötelező:", require2FA);
      console.log("Egyedi belépési link (magic):", magicLink);
      console.log("====================================================\n");

      const emailRes = await sendEmail({
        to: res.user.email,
        subject: require2FA
          ? "Your CATL portal account is active – personal sign-in link (2FA required)"
          : "Your CATL portal account is active – personal sign-in link",
        html,
        text,
      });

      if (emailRes.success) {
        await markCatlWelcomeEmailSent(userId);
      }
    } catch (err) {
      console.warn("[CATL welcome email] Nem küldhető el:", err);
    }

    // ⚠ FONTOS: NEM KAPUNK SESSION COOKIE-T a setup-password végén (történelmi beépítés ellen).
    // A belépés CSAK a welcome emailben küldött EGYEDI /catl/auth?token= linken keresztül lehetséges.

    return NextResponse.json({
      success: true,
      message: require2FA
        ? "Password set. Now set up two-factor authentication — you will receive your personal sign-in link by email."
        : "Password set successfully. You will shortly receive an email with your personal sign-in link.",
      requireTwoFactorSetup: require2FA,
      twoFactorSetup,
      user: {
        email: res.user.email,
        activatedAt: res.user.activatedAt,
      },
      noAutoLogin: true,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hiba" },
      { status: 500 }
    );
  }
}
