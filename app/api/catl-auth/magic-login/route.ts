import { NextResponse } from "next/server";
import {
  findCatlUserByMagicLoginToken,
  recordCatlLogin,
} from "@/lib/catl-portal-users";
import { createCatlSessionToken, setCatlSessionCookie } from "@/lib/catl-auth";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

/**
 * /catl/auth?token=<magicRaw> oldal POST-ezni ide (1. lépés):
 *  - Meghatározza, hogy a felhasználónak 2FA kell-e (requireTwoFactor + twoFactorEnabled)
 *  - Ha NINCS 2FA kötelező → azonnal session cookie (JWT httpOnly) + success
 *  - Ha VAN 2FA kötelező → need2FA=true visszaadása, NEM session (a 2. lépés jön a verify-2fa-vel)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body?.token || "").trim();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing token." },
        { status: 400 }
      );
    }

    const user = await findCatlUserByMagicLoginToken(token, false);
    if (!user) {
      // További debug: ha lejárt token, hibaüzenetnek írd ki hogy kérjen új linket
      const maybeExpired = await findCatlUserByMagicLoginToken(token, true);
      if (maybeExpired) {
        return NextResponse.json(
          { success: false, message: "This personal sign-in link has expired. Please request a new invitation from Pannon Transfer." },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { success: false, message: "This sign-in link is invalid or does not exist." },
        { status: 404 }
      );
    }

    if (!user.isActivated) {
      return NextResponse.json(
        { success: false, message: "This account has not been activated yet — please use the password setup link from your invitation." },
        { status: 400 }
      );
    }

    // 2FA required check
    const need2FA = !!user.requireTwoFactor && !!user.twoFactorEnabled;
    if (!need2FA && user.requireTwoFactor && !user.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Two-factor authentication is required for your account but has not been activated yet. Please request a new invitation and complete the 2FA setup.",
        },
        { status: 403 }
      );
    }

    if (need2FA) {
      // NEM állítunk session-t. A usernek a 2FA kóddal kell visszaellenőrizni a POST /verify-2fa-t.
      return NextResponse.json({
        success: true,
        needTwoFactor: true,
        email: user.email,
      });
    }

    // 2FA NINCS szükséges → autentikáció OK
    const sid = user._id as ObjectId;
    await recordCatlLogin(sid);
    const jwt = createCatlSessionToken(user);
    await setCatlSessionCookie(jwt, true);

    return NextResponse.json({
      success: true,
      needTwoFactor: false,
      redirect: "/catl",
      email: user.email,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hiba" },
      { status: 500 }
    );
  }
}
