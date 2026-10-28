import { NextResponse } from "next/server";
import {
  findCatlUserByMagicLoginToken,
  verifyCatlTwoFactorToken,
  consumeCatlTwoFactorBackupCode,
  recordCatlLogin,
} from "@/lib/catl-portal-users";
import { createCatlSessionToken, setCatlSessionCookie } from "@/lib/catl-auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * 2. lépés a magic link bejelentkezéshez, ha a felhasználónak 2FA kötelező.
 * Beolvassa a magic token-t, ellenőrzi a TOTP 6 számjegyű kódot (vagy backup kódot),
 * és ha valid → session cookie beállítása + redirect /catl-re.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body?.token || "").trim();
    const code = String(body?.code || "").trim().replace(/\s+/g, "");
    const useBackup = !!body?.useBackup;

    if (!token || !code) {
      return NextResponse.json(
        { success: false, message: "Missing token or code." },
        { status: 400 }
      );
    }

    const user = await findCatlUserByMagicLoginToken(token, false);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "The sign-in link is invalid or has expired." },
        { status: 404 }
      );
    }

    if (!user.isActivated) {
      return NextResponse.json(
        { success: false, message: "The account has not been activated yet." },
        { status: 400 }
      );
    }

    let valid = false;
    let usedBackup = false;
    if (useBackup) {
      valid = await consumeCatlTwoFactorBackupCode(user._id as ObjectId, code);
      usedBackup = valid;
    } else {
      if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        return NextResponse.json(
          { success: false, message: "The authenticator code consists of 6 digits." },
          { status: 400 }
        );
      }
      const v = verifyCatlTwoFactorToken(user, code);
      valid = !!v.valid;
    }

    if (!valid) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The two-factor code is incorrect. Try again in 30 seconds, or use one of your saved backup codes.",
        },
        { status: 401 }
      );
    }

    const sid = user._id as ObjectId;
    await recordCatlLogin(sid);
    const jwt = createCatlSessionToken(user);
    await setCatlSessionCookie(jwt, true);

    return NextResponse.json({
      success: true,
      redirect: "/catl",
      usedBackup,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hiba" },
      { status: 500 }
    );
  }
}
