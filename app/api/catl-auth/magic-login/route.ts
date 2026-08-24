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
        { success: false, message: "Hiányzó token." },
        { status: 400 }
      );
    }

    const user = await findCatlUserByMagicLoginToken(token, false);
    if (!user) {
      // További debug: ha lejárt token, hibaüzenetnek írd ki hogy kérjen új linket
      const maybeExpired = await findCatlUserByMagicLoginToken(token, true);
      if (maybeExpired) {
        return NextResponse.json(
          { success: false, message: "Ez az egyedi belépési link lejárt. Kérj új meghívót a Pannon Transfer Ügyvezetőtől." },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Érvénytelen vagy nem létező belépési link." },
        { status: 404 }
      );
    }

    if (!user.isActivated) {
      return NextResponse.json(
        { success: false, message: "Ez a fiók még nincs aktiválva — használd a jelszóbeállítási linket." },
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
            "A fiókodhoz kétfaktoros hitelesítés be van kérve, de még nincs aktiválva. Kérj új meghívót és vedd fel újra a 2FA beállítását.",
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
