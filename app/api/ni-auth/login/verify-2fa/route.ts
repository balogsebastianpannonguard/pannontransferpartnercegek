import { NextResponse } from "next/server";
import { createNiSessionToken, setNiSessionCookie } from "@/lib/ni-auth";
import { verifyNiLoginChallenge } from "@/lib/ni-auth-login-challenge";
import {
  getNiCollection,
  verifyNiTwoFactorToken,
  consumeNiTwoFactorBackupCode,
  recordNiLogin,
} from "@/lib/ni-portal-users";
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

    const challenge = verifyNiLoginChallenge(challengeToken);
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

    const col = await getNiCollection();
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
      ok = await consumeNiTwoFactorBackupCode(user._id!, cleanCode);
    } else {
      const res = verifyNiTwoFactorToken(user, cleanCode);
      ok = !!res.valid;
    }

    if (!ok) {
      return NextResponse.json(
        { success: false, message: useBackup ? "Hibás vagy már felhasznált biztonsági kód." : "Helytelen vagy lejárt 6 számjegyű kód." },
        { status: 401 }
      );
    }

    await recordNiLogin(user._id!);
    const sessionToken = createNiSessionToken(user);
    await setNiSessionCookie(sessionToken, true);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        company: "National Instruments",
        role: user.role === "admin-ni" ? "admin-ni" : "normal",
        displayName: user.displayName || null,
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
