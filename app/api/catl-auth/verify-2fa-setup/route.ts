import { NextResponse } from "next/server";
import {
  findCatlUserByInviteToken,
  verifyCatlTwoFactorToken,
  consumeCatlTwoFactorBackupCode,
  setCatlTwoFactorEnabled,
} from "@/lib/catl-portal-users";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * Használat: a setup-password oldal 2. lépésében, amikor a felhasználó
 * már beállította a jelszavát (isActivated=true), és a kötelező 2FA miatt
 * most az első alkalommal beírja az Authenticator app generált 6 számot
 * (vagy egy backup kódot).
 *
 * Ha a TOTP kód vagy backup kód érvényes:
 *   - twoFactorEnabled flag = true
 *   - (Nem adjunk session cookie-t itt! A belépés a welcome emailben lévő
 *     magic linken keresztül történik, ahogy a specifikáció írja.)
 *   - sikeres response
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const inviteToken = String(body?.inviteToken || "").trim();
    const code = String(body?.code || "").trim().replace(/\s+/g, "");
    const useBackup = !!body?.useBackup;

    if (!inviteToken || !code) {
      return NextResponse.json(
        { success: false, message: "Missing token or code." },
        { status: 400 }
      );
    }

    // A setup folyamatban a userhez az invite token-t használjuk (az URL-ből)
    const user = await findCatlUserByInviteToken(inviteToken, { allowExpired: true });
    if (!user || !user.isActivated) {
      return NextResponse.json(
        { success: false, message: "No activated account was found for this link." },
        { status: 404 }
      );
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { success: false, message: "Two-factor authentication has not been initialised for your account yet." },
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
        { success: false, message: "The code is incorrect. Try again in 30 seconds, or use one of your saved backup codes." },
        { status: 401 }
      );
    }

    await setCatlTwoFactorEnabled(user._id as ObjectId, true);

    return NextResponse.json({
      success: true,
      message: usedBackup
        ? "Backup code accepted. Two-factor authentication is now active — we will email you your personal sign-in link."
        : "Two-factor authentication is now active. You will shortly receive an email with your personal sign-in link.",
      usedBackup,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hiba" },
      { status: 500 }
    );
  }
}
