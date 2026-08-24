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

export const dynamic = "force-dynamic";

function buildWelcomeEmail(recipientEmail: string, loginLink: string, twoFactorRequired: boolean) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0; padding:0; background:#F3F4F6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#F3F4F6"><tr><td align="center" style="padding:40px 15px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:580px; background:#FFFFFF; border-radius:12px; overflow:hidden;">
<tr><td bgcolor="#040914" style="padding:44px 40px; border-bottom:3px solid #0047BA;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:22px;"><tr>
<td width="64" height="64" align="center" valign="middle" bgcolor="#FFFFFF" style="border-radius:14px;">
<span style="font-family:-apple-system, sans-serif; font-size:22px; font-weight:900; color:#0047BA;">CATL</span>
</td></tr></table>
<h1 style="margin:0 0 8px 0; font-family:Georgia, serif; color:#FFFFFF; font-size:26px; letter-spacing:.5px;">Üdvözlünk, ${recipientEmail}!</h1>
<p style="margin:0; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:#60A5FA;">Pannon Transfer CATL Portál</p>
</td></tr>
<tr><td style="padding:44px 40px;">
<h2 style="margin:0 0 20px 0; font-family:Georgia, serif; font-size:22px; color:#0F172A;">
Jelszavad sikeresen beállítva!
</h2>
<p style="margin:0 0 10px 0; font-size:15px; line-height:1.7; color:#475569;">
Kedves Partner!<br><br>
Köszöntjük a CATL Dedikált Portálon. A fiókod mostantól aktív.
</p>
<p style="margin:0 0 30px 0; font-size:15px; line-height:1.7; color:#475569;">
<strong>Kizárólag az alábbi egyedi linken keresztül tudsz belépni</strong> a szolgáltatásokhoz és a dedikált árstruktúrához (publikus bejelentkező oldal NINCS!).
${twoFactorRequired ? `<br><br><strong style="color:#0F172A;">2FA / Kétfaktoros hitelesítés kötelező:</strong> A linkre kattintva az első bejelentkezés során a beállított Authenticator app által generált 6 számjegyű kódot is meg kell adnod.` : ""}
</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:30px;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="#0047BA" style="border-radius:10px;">
<a href="${loginLink}" style="display:inline-block; padding:18px 40px; font-size:14px; font-weight:800; color:#FFFFFF; text-decoration:none; letter-spacing:1.5px; text-transform:uppercase; border-radius:10px;">
Egyedi belépés a CATL Portálra →
</a>
</td></tr></table>
</td></tr></table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #E2E8F0; border-bottom:1px solid #E2E8F0; margin-bottom:28px;"><tr>
<td width="50%" style="padding:20px 20px 20px 0; border-right:1px solid #E2E8F0;">
<p style="margin:0 0 6px 0; font-size:10px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:#94A3B8;">Belépési fiók</p>
<p style="margin:0; font-size:14px; font-weight:700; color:#0F172A; word-break:break-all;">${recipientEmail}</p>
</td>
<td width="50%" style="padding:20px 0 20px 20px;">
<p style="margin:0 0 6px 0; font-size:10px; font-weight:800; letter-spacing:1.2px; text-transform:uppercase; color:#94A3B8;">Hozzáférés típusa</p>
<p style="margin:0; font-size:14px; font-weight:700; color:#0F172A;">CATL Dedikált Partner · ${twoFactorRequired ? "2FA kötelező" : "2FA nélkül"}</p>
</td>
</tr></table>
<p style="margin:0; font-size:13px; line-height:1.6; color:#64748B;">
<strong style="color:#0F172A;">Fontos:</strong> Ez a link és a hozzáférés <strong>egyedi</strong>, csak a Te használatodra lett kiküldve. Kérjük ne oszd meg senkivel. A link 30 napig érvényes; lejárta után kérj új meghívót az ügyvezetődtől.
</p>
</td></tr>
<tr><td bgcolor="#F8FAFC" style="padding:30px 40px; border-top:1px solid #E2E8F0;">
<p style="margin:0; font-size:11px; line-height:1.6; color:#94A3B8; text-align:center;">
Ezt az üzenetet a Pannon Transfer CATL Portál rendszere küldte.<br>
Kérdés esetén: Ügyvezető - Balog Sebastian Máté<br>
© ${new Date().getFullYear()} Pannon Transfer. Minden jog fenntartva.
</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
  const text = [
    "Üdvözölünk a CATL Portálon!",
    "",
    "Jelszavad sikeresen be lett állítva. A fiókod mostantól aktív.",
    twoFactorRequired ? "2FA (kétfaktoros hitelesítés) kötelező a belépéshez." : "2FA nincs bekapcsolva.",
    "",
    "Kizárólag az alábbi EGYEDI linken keresztül tudsz belépni a CATL Portálra (publikus login nincs):",
    loginLink,
    "",
    "Belépési fiókod: " + recipientEmail,
    "",
    "A link 30 napig érvényes. Lejárta után kérj új meghívót az ügyvezetődtől.",
    "",
    "Üdvözlettel:",
    "Pannon Transfer - CATL Dedikált Portál",
    `© ${new Date().getFullYear()} Pannon Transfer. Minden jog fenntartva.`,
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

    const res = await setCatlPasswordByInvite(token, password);
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
    let twoFactorSetup: any = null;
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
      const { html, text } = buildWelcomeEmail(res.user.email, magicLink, require2FA);

      console.log("\n=========== CATL WELCOME EMAIL (TEST MODE) ===========");
      console.log("Címzett:", res.user.email);
      console.log("2FA kötelező:", require2FA);
      console.log("Egyedi belépési link (magic):", magicLink);
      console.log("====================================================\n");

      const emailRes = await sendEmail({
        to: res.user.email,
        subject: require2FA
          ? "CATL Portál – Jelszó beállítva · 2FA kötelező · Egyedi belépési link"
          : "CATL Portál – Üdvözlünk! Jelszó beállítva · Egyedi belépési link",
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
