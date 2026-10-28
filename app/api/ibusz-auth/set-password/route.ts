import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { setIbuszPasswordByInvite } from "@/lib/ibusz-auth";
import {
  markIbuszWelcomeEmailSent,
  rotateMagicLoginToken,
  generateIbuszTwoFactorSecret,
  setIbuszTwoFactorSecret,
  TWO_FACTOR_ISSUER,
} from "@/lib/ibusz-portal-users";
import { ObjectId } from "mongodb";
import { ibuszBilingual, ibuszButton, ibuszEmailShell, ibuszInfoRow, IBUSZ_CONTACT } from "@/lib/ibusz-email-layout";

export const dynamic = "force-dynamic";

function buildWelcomeEmail(recipientEmail: string, loginLink: string, twoFactorRequired: boolean, origin: string) {
  const year = new Date().getFullYear();
  const huBody = `
<p style="margin:0 0 14px 0; font-size:16px; font-weight:600; color:#0F2238;">Kedves Partnerünk!</p>
<p style="margin:0 0 14px 0; font-size:15px; line-height:1.7; color:#3C5068;">
A jelszó beállítva, az IBUSZ dedikált portálon lévő fiókja mostantól aktív. Üdvözöljük!
</p>
<p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#3C5068;">
A belépés <strong>kizárólag az alábbi személyes linken</strong> keresztül lehetséges – nyilvános belépési oldal nincs.${
    twoFactorRequired
      ? " Mivel a fiókjához kétfaktoros hitelesítés (2FA) kötelező, belépéskor a hitelesítő alkalmazás 6 számjegyű kódját is meg kell adnia."
      : ""
  }
</p>
${ibuszButton(loginLink, "Belépés az IBUSZ portálra")}
${ibuszInfoRow(
  { label: "Belépési fiók", value: recipientEmail },
  { label: "Hozzáférés", value: twoFactorRequired ? "Dedikált partner · 2FA kötelező" : "Dedikált partner" },
)}
<p style="margin:0; font-size:13px; line-height:1.7; color:#6B7F96;">
<strong style="color:#0F2238;">Biztonság:</strong> ez a link személyes, 30 napig érvényes. Kérjük, ne továbbítsa és ne ossza meg senkivel. Lejárta után kérjen új meghívót a Pannon Transfertől.
</p>`;
  const enBody = `
<p style="margin:0 0 14px 0; font-size:16px; font-weight:600; color:#0F2238;">Dear Partner,</p>
<p style="margin:0 0 14px 0; font-size:15px; line-height:1.7; color:#3C5068;">
Your password has been set and your account on the dedicated IBUSZ portal is now active. Welcome aboard.
</p>
<p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#3C5068;">
Access is available <strong>exclusively through your personal sign-in link</strong> below &mdash; there is no public login page.${
    twoFactorRequired
      ? " Because two-factor authentication is mandatory for your account, you will also be asked for the 6-digit code from your authenticator app when you sign in."
      : ""
  }
</p>
${ibuszButton(loginLink, "Open the IBUSZ portal")}
<p style="margin:0; font-size:13px; line-height:1.7; color:#6B7F96;">
<strong style="color:#0F2238;">Security:</strong> this link is personal and valid for 30 days. Please do not forward or share it. After it expires, ask Pannon Transfer for a new invitation.
</p>`;
  const html = ibuszEmailShell({
    origin,
    lang: "both",
    preheader:
      "Az IBUSZ portálfiókja aktív – használja személyes belépési linkjét. / Your IBUSZ portal account is active – use your personal sign-in link.",
    eyebrow: "Fiók aktiválva · Account activated",
    headline: "Üdvözöljük az<br>IBUSZ foglalási portálon",
    bodyHtml: ibuszBilingual(huBody, enBody),
    topRight: "IBUSZ Hungary Kft.",
    footerKind: "welcome",
  });
  const text = [
    "PANNON TRANSFER x IBUSZ HUNGARY KFT. - DEDIKÁLT PORTÁL / DEDICATED PORTAL",
    "",
    "Kedves Partnerünk!",
    "A jelszó beállítva, az IBUSZ portálfiókja mostantól aktív.",
    twoFactorRequired
      ? "A belépéshez kétfaktoros hitelesítés (2FA) kötelező."
      : "Kétfaktoros hitelesítés nincs bekapcsolva.",
    "Belépés kizárólag személyes linken (nincs nyilvános belépési oldal):",
    loginLink,
    "Belépési fiók: " + recipientEmail,
    "A link 30 napig érvényes. Lejárta után kérjen új meghívót a Pannon Transfertől.",
    "",
    "----------------------------------------",
    "Dear Partner,",
    "Your password has been set and your IBUSZ portal account is now active.",
    twoFactorRequired
      ? "Two-factor authentication (2FA) is mandatory for your account."
      : "Two-factor authentication is not enabled for your account.",
    "Access is available only through your personal sign-in link (there is no public login page):",
    loginLink,
    "Your account: " + recipientEmail,
    "The link is valid for 30 days. After it expires, please ask Pannon Transfer for a new invitation.",
    "",
    `${IBUSZ_CONTACT.name} - Fejlesztő / Developer`,
    IBUSZ_CONTACT.email,
    IBUSZ_CONTACT.phone,
    "",
    "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte. / This message was sent by the Pannon Transfer Komplex system.",
    `© ${year} Pannon Transfer. Minden jog fenntartva. / All rights reserved.`,
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
        { success: false, message: "Hiányzó token vagy jelszó." },
        { status: 400 }
      );
    }

    const res = await setIbuszPasswordByInvite(token, password);
    if (!res.success || !res.user) {
      return NextResponse.json(
        { success: false, message: res.message || "A jelszó beállítása sikertelen." },
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
      const tfa = generateIbuszTwoFactorSecret(res.user.email);
      twoFactorSetup = {
        issuer: TWO_FACTOR_ISSUER,
        label: res.user.email,
        secretBase32: tfa.secretBase32,
        uri: tfa.uri,
        backupCodes: tfa.backupCodes,
      };
      // Előre tároljuk a secret + backup kódokat, de még NEM kapcsoljuk be a twoFactorEnabled-et.
      // Csak a setup-password 2. lépésben, amikor a user beírja az első TOTP kódot és validál → akkor vált enabled=true.
      await setIbuszTwoFactorSecret(userId, {
        secretBase32: tfa.secretBase32,
        backupCodes: tfa.backupCodes,
      });
      twoFactorSetup.qrDataUrl = await tfa.qrDataUrl;
    }

    // 3) Welcome email küldés az EGYEDI magic login linkkel (nem publikus /ibusz!)
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

      const magicLink = `${loginBase}/ibusz/auth?token=${encodeURIComponent(magicRaw)}`;
      const { html, text } = buildWelcomeEmail(res.user.email, magicLink, require2FA, loginBase);

      console.log("\n=========== IBUSZ HUNGARY KFT. WELCOME EMAIL (TEST MODE) ===========");
      console.log("Címzett:", res.user.email);
      console.log("2FA kötelező:", require2FA);
      console.log("Egyedi belépési link (magic):", magicLink);
      console.log("====================================================\n");

      const emailRes = await sendEmail({
        to: res.user.email,
        subject: require2FA
          ? "IBUSZ portál – Fiók aktív · 2FA kötelező · Személyes belépési link / Account active · 2FA required"
          : "IBUSZ portál – Fiók aktív · Személyes belépési link / Account active · Personal sign-in link",
        html,
        text,
      });

      if (emailRes.success) {
        await markIbuszWelcomeEmailSent(userId);
      }
    } catch (err) {
      console.warn("[IBUSZ HUNGARY KFT. welcome email] Nem küldhető el:", err);
    }

    // ⚠ FONTOS: NEM KAPUNK SESSION COOKIE-T a setup-password végén (történelmi beépítés ellen).
    // A belépés CSAK a welcome emailben küldött EGYEDI /ibusz/auth?token= linken keresztül lehetséges.

    return NextResponse.json({
      success: true,
      message: require2FA
        ? "A jelszó beállítva! Most állítsa be a kétfaktoros hitelesítést — az egyedi belépési linket e-mailben kapja meg."
        : "A jelszó sikeresen beállítva. Hamarosan e-mailt kap az egyedi belépési linkkel.",
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
      { success: false, message: error instanceof Error ? error.message : "Hiba történt." },
      { status: 500 }
    );
  }
}
