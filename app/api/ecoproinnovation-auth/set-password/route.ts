import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { setEcoproInnovationPasswordByInvite } from "@/lib/ecoproinnovation-auth";
import {
  markEcoproInnovationWelcomeEmailSent,
  rotateMagicLoginToken,
  generateEcoproInnovationTwoFactorSecret,
  setEcoproInnovationTwoFactorSecret,
  TWO_FACTOR_ISSUER,
} from "@/lib/ecoproinnovation-portal-users";
import { ObjectId } from "mongodb";
import { buildWelcomeEmail } from "@/lib/ecoproinnovation-email-layout";

export const dynamic = "force-dynamic";

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

    const res = await setEcoproInnovationPasswordByInvite(token, password);
    if (!res.success || !res.user) {
      return NextResponse.json(
        { success: false, message: res.message || "Jelszó beállítás sikertelen." },
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
      const tfa = generateEcoproInnovationTwoFactorSecret(res.user.email);
      twoFactorSetup = {
        issuer: TWO_FACTOR_ISSUER,
        label: res.user.email,
        secretBase32: tfa.secretBase32,
        uri: tfa.uri,
        backupCodes: tfa.backupCodes,
      };
      // Előre tároljuk a secret + backup kódokat, de még NEM kapcsoljuk be a twoFactorEnabled-et.
      // Csak a setup-password 2. lépésben, amikor a user beírja az első TOTP kódot és validál → akkor vált enabled=true.
      await setEcoproInnovationTwoFactorSecret(userId, {
        secretBase32: tfa.secretBase32,
        backupCodes: tfa.backupCodes,
      });
      twoFactorSetup.qrDataUrl = await tfa.qrDataUrl;
    }

    // 3) Welcome email küldés az EGYEDI magic login linkkel (nem publikus /ecoproinnovation!)
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

      const magicLink = `${loginBase}/ecoproinnovation/auth?token=${encodeURIComponent(magicRaw)}`;
      const { subject, html, text } = buildWelcomeEmail({
        recipientEmail: res.user.email,
        loginLink: magicLink,
        twoFactorRequired: require2FA,
        origin: loginBase,
      });

      console.log("\n=========== ECOPRO INNOVATION WELCOME EMAIL (TEST MODE) ===========");
      console.log("Címzett:", res.user.email);
      console.log("2FA kötelező:", require2FA);
      console.log("Egyedi belépési link (magic):", magicLink);
      console.log("====================================================\n");

      const emailRes = await sendEmail({
        to: res.user.email,
        subject,
        html,
        text,
      });

      if (emailRes.success) {
        await markEcoproInnovationWelcomeEmailSent(userId);
      }
    } catch (err) {
      console.warn("[ECOPRO INNOVATION welcome email] Nem küldhető el:", err);
    }

    // ⚠ FONTOS: NEM KAPUNK SESSION COOKIE-T a setup-password végén (történelmi beépítés ellen).
    // A belépés CSAK a welcome emailben küldött EGYEDI /ecoproinnovation/auth?token= linken keresztül lehetséges.

    return NextResponse.json({
      success: true,
      message: require2FA
        ? "Jelszó beállítva! Most állítsd be a kétfaktoros hitelesítést — az egyedi belépési linket emailben kapsz majd."
        : "Jelszó sikeresen beállítva. Hamarosan kapsz egy emailt az egyedi belépési linkkel.",
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
