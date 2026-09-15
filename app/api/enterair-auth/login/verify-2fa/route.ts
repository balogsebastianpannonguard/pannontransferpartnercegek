import { NextResponse } from "next/server";
import { createEnterairSessionToken, setEnterairSessionCookie } from "@/lib/enterair-auth";
import { verifyEnterairLoginChallenge } from "@/lib/enterair-auth-login-challenge";
import {
  getEnterairCollection,
  verifyEnterairTwoFactorToken,
  consumeEnterairTwoFactorBackupCode,
  recordEnterairLogin,
} from "@/lib/enterair-portal-users";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const challengeToken = String(body?.challengeToken || "").trim();
    const rawCode = String(body?.code || "").trim();
    const useBackup = !!body?.useBackup;

    if (!challengeToken) {
      return NextResponse.json(
        { success: false, message: "Hiányzó hitelesítési kihívás token." },
        { status: 400 }
      );
    }

    const challenge = verifyEnterairLoginChallenge(challengeToken);
    if (!challenge) {
      return NextResponse.json(
        { success: false, message: "Érvénytelen vagy lejárt kihívás. Kezd újra a bejelentkezést." },
        { status: 410 }
      );
    }

    const cleanCode = useBackup ? rawCode.toUpperCase().replace(/[^A-Z0-9-]/g, "") : rawCode.replace(/\s+/g, "");
    if (!cleanCode || (useBackup ? cleanCode.length < 6 : cleanCode.length !== 6)) {
      return NextResponse.json(
        {
          success: false,
          message: useBackup
            ? "Kérjük, adj meg egy érvényes biztonsági mentett kódot."
            : "Kérjük, adj meg az Authenticator által generált 6 számjegyű kódot.",
        },
        { status: 400 }
      );
    }

    const col = await getEnterairCollection();
    const user = await col.findOne({ _id: new ObjectId(challenge.userId) });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "A felhasználó nem található." },
        { status: 404 }
      );
    }
    if (!user.requireTwoFactor || !user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, message: "Ehhez a fiókhoz nincs kétfaktoros hitelesítés bekapcsolva." },
        { status: 400 }
      );
    }

    let ok = false;
    if (useBackup) {
      ok = await consumeEnterairTwoFactorBackupCode(user._id!, cleanCode);
    } else {
      const res = verifyEnterairTwoFactorToken(user, cleanCode);
      ok = !!res.valid;
    }

    if (!ok) {
      return NextResponse.json(
        { success: false, message: useBackup ? "Hibás vagy már felhasznált biztonsági kód." : "Helytelen vagy lejárt 6 számjegyű kód." },
        { status: 401 }
      );
    }

    await recordEnterairLogin(user._id!);
    const sessionToken = createEnterairSessionToken(user);
    await setEnterairSessionCookie(sessionToken, true);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        company: "Enter Air",
        role: "partner",
        requireTwoFactor: !!user.requireTwoFactor,
        twoFactorEnabled: !!user.twoFactorEnabled,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hiba" },
      { status: 500 }
    );
  }
}
