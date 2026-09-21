import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { setNiPasswordByInvite } from "@/lib/ni-auth";
import {
  markNiWelcomeEmailSent,
  rotateMagicLoginToken,
  generateNiTwoFactorSecret,
  setNiTwoFactorSecret,
  TWO_FACTOR_ISSUER,
} from "@/lib/ni-portal-users";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

function buildWelcomeEmail(recipientEmail: string, loginLink: string, twoFactorRequired: boolean) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0; padding:0; background:#F3F4F6; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0;">
Az NI Portál hozzáférése elkészült. Az alábbi egyedi linken tud belépni.
</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#F3F4F6">
  <tr>
    <td align="center" style="padding:40px 14px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
        <tr>
          <td style="padding-bottom:16px; text-align:center; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#94A3B8; font-weight:700;">
            Pannon Transfer · NI Portál · Egyedi belépési link
          </td>
        </tr>
        <tr>
          <td style="background:#FFFFFF; border-radius:24px; overflow:hidden; box-shadow:0 12px 40px rgba(15,23,42,0.08);">
            <!-- HEADER SECTION -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding:40px 32px; background:linear-gradient(135deg, #0B172D 0%, #163669 100%);">
                  
                  <!-- Tags -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                    <tr>
                      <td bgcolor="#DCFCE7" style="padding:8px 16px; border-radius:12px;">
                        <span style="font-size:16px; font-weight:900; color:#166534;">NI</span>
                        <span style="font-size:13px; font-weight:700; color:#166534; margin-left:6px;">Portal Access</span>
                      </td>
                    </tr>
                  </table>
                  
                  <div style="display:inline-block; padding:6px 12px; margin-bottom:16px; border-radius:999px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#E2E8F0;">
                    Aktiválás kész · Hozzáférés engedélyezve
                  </div>
                  
                  <h1 style="margin:0 0 16px 0; font-size:28px; line-height:1.2; color:#FFFFFF; font-weight:800;">
                    Sikeres aktiválás
                  </h1>
                  
                  <p style="margin:0 0 32px 0; font-size:15px; line-height:1.6; color:#CBD5E1;">
                    Jelszavát sikeresen beállította. Az NI dedikált portálhoz tartozó vállalati hozzáférése mostantól aktív.
                  </p>
                  
                  <!-- Info boxes -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="48%" style="padding-right:8px;">
                        <div style="background:rgba(255,255,255,0.08); border-radius:16px; padding:16px; border:1px solid rgba(255,255,255,0.1);">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#94A3B8; margin-bottom:6px;">Belépési fiók</div>
                          <div style="font-size:14px; font-weight:600; color:#60A5FA; word-break:break-all;">${recipientEmail}</div>
                        </div>
                      </td>
                      <td width="48%" style="padding-left:8px;">
                        <div style="background:rgba(255,255,255,0.08); border-radius:16px; padding:16px; border:1px solid rgba(255,255,255,0.1);">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#94A3B8; margin-bottom:6px;">Hozzáférés típusa</div>
                          <div style="font-size:14px; font-weight:600; color:#FFFFFF;">NI partner · ${twoFactorRequired ? "2FA kötelező" : "egyedi link"}</div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
              <!-- BODY SECTION -->
              <tr>
                <td style="padding:32px;">
                  
                  <!-- Rule box -->
                  <div style="border:1px solid #E2E8F0; border-radius:16px; padding:20px; margin-bottom:28px;">
                    <div style="font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#64748B; margin-bottom:12px;">
                      Belépési szabály
                    </div>
                    <div style="font-size:15px; line-height:1.6; color:#334155;">
                      <strong style="color:#0F172A;">Kizárólag az alábbi egyedi linken keresztül tud belépni</strong> a portálra. Publikus bejelentkező oldal nincs.
                      ${twoFactorRequired ? "<br><br><strong style='color:#0F172A;'>2FA kötelező:</strong> A link megnyitása után az Authenticator alkalmazás 6 számjegyű kódját is meg kell adnia." : ""}
                    </div>
                  </div>
                  
                  <!-- Button -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td align="center" bgcolor="#22C55E" style="border-radius:999px; box-shadow:0 8px 20px rgba(34,197,94,0.3);">
                              <a href="${loginLink}" style="display:inline-block; padding:16px 32px; font-size:14px; font-weight:700; color:#0B2B1B; text-decoration:none; letter-spacing:1px; text-transform:uppercase; border-radius:999px;">
                                Egyedi belépés az NI Portálra
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Additional info boxes -->
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
                    <tr>
                      <td width="48%" style="padding-right:8px;" valign="top">
                        <div style="height:100%; border:1px solid #E2E8F0; border-radius:16px; padding:16px; background:#F8FAFC;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#64748B; margin-bottom:8px;">Megjegyzés</div>
                          <div style="font-size:13px; line-height:1.6; color:#475569;">
                            Ez az aktiválási link szigorúan személyes hozzáférés, ezért <strong style="color:#0F172A;">harmadik féllel nem osztható meg</strong>.
                          </div>
                        </div>
                      </td>
                      <td width="48%" style="padding-left:8px;" valign="top">
                        <div style="height:100%; border:1px solid #E2E8F0; border-radius:16px; padding:16px; background:#F8FAFC;">
                          <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#64748B; margin-bottom:8px;">Érvényesség</div>
                          <div style="font-size:13px; line-height:1.6; color:#475569;">
                            A belépési link 30 napig használható. Ezután új link igénylése szükséges.
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Support box -->
                  <div style="background:#0F172A; border-radius:16px; padding:20px; color:#F8FAFC;">
                    <div style="font-size:10px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#4ADE80; margin-bottom:8px;">
                      Támogatás
                    </div>
                    <div style="font-size:13px; line-height:1.6;">
                      Amennyiben ezt a meghívót tévedésből kapta, kérjük, hagyja figyelmen kívül. Segítség vagy kérdés esetén forduljon a Pannon Transfer dedikált kapcsolattartójához.
                    </div>
                  </div>
                  
                </td>
              </tr>
              
              <!-- FOOTER SECTION -->
              <tr>
                <td bgcolor="#F8FAFC" style="padding:24px 32px; border-top:1px solid #E2E8F0; text-align:center;">
                  <p style="margin:0; font-size:11px; line-height:1.6; color:#94A3B8;">
                    Ezt az üzenetet a Pannon Transfer NI Portál rendszere küldte.<br>
                    Kérdés esetén: Vezető fejlesztő - Balog Sebastian Máté (balogh.sebastian@pannonguard.hu, +36 30 665 4135)<br>
                    © ${new Date().getFullYear()} Pannon Transfer. Minden jog fenntartva.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body></html>`;
  const text = [
    "Sikeres aktiválás az NI Portálon!",
    "",
    "Jelszavát sikeresen beállította. A vállalati fiókja mostantól aktív.",
    twoFactorRequired ? "A kétfaktoros hitelesítés (2FA) beállítása kötelező a rendszerhez." : "A 2FA hitelesítés nincs bekapcsolva.",
    "",
    "Kizárólag az alábbi EGYEDI linken keresztül tud belépni az NI Portálra (publikus bejelentkezési oldal nincs):",
    loginLink,
    "",
    "Belépési fiók: " + recipientEmail,
    "",
    "A link 30 napig érvényes. Lejárta után kérjük, igényeljen új linket az ügyvezetőtől.",
    "",
    "Tisztelettel:",
    "Pannon Transfer - NI dedikált portál",
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

    const res = await setNiPasswordByInvite(token, password);
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
      const tfa = generateNiTwoFactorSecret(res.user.email);
      twoFactorSetup = {
        issuer: TWO_FACTOR_ISSUER,
        label: res.user.email,
        secretBase32: tfa.secretBase32,
        uri: tfa.uri,
        backupCodes: tfa.backupCodes,
      };
      // Előre tároljuk a secret + backup kódokat, de még NEM kapcsoljuk be a twoFactorEnabled-et.
      // Csak a setup-password 2. lépésben, amikor a user beírja az első TOTP kódot és validál → akkor vált enabled=true.
      await setNiTwoFactorSecret(userId, {
        secretBase32: tfa.secretBase32,
        backupCodes: tfa.backupCodes,
      });
      twoFactorSetup.qrDataUrl = await tfa.qrDataUrl;
    }

    // 3) Welcome email küldés az EGYEDI magic login linkkel (nem publikus /ni!)
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

      const magicLink = `${loginBase}/ni/auth?token=${encodeURIComponent(magicRaw)}`;
      const { html, text } = buildWelcomeEmail(res.user.email, magicLink, require2FA);

      console.log("\n=========== NI WELCOME EMAIL (TEST MODE) ===========");
      console.log("Címzett:", res.user.email);
      console.log("2FA kötelező:", require2FA);
      console.log("Egyedi belépési link (magic):", magicLink);
      console.log("====================================================\n");

      const emailRes = await sendEmail({
        to: res.user.email,
        subject: require2FA
          ? "NI Portál – Jelszó beállítva · 2FA kötelező · Egyedi belépési link"
          : "NI Portál – Üdvözlünk! Jelszó beállítva · Egyedi belépési link",
        html,
        text,
      });

      if (emailRes.success) {
        await markNiWelcomeEmailSent(userId);
      }
    } catch (err) {
      console.warn("[NI welcome email] Nem küldhető el:", err);
    }

    // ⚠ FONTOS: NEM KAPUNK SESSION COOKIE-T a setup-password végén (történelmi beépítés ellen).
    // A belépés CSAK a welcome emailben küldött EGYEDI /ni/auth?token= linken keresztül lehetséges.

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
