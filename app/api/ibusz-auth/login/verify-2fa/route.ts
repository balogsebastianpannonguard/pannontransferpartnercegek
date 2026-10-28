import { NextResponse } from "next/server";
import { createIbuszSessionToken, setIbuszSessionCookie } from "@/lib/ibusz-auth";
import { verifyIbuszLoginChallenge } from "@/lib/ibusz-auth-login-challenge";
import {
  getIbuszCollection,
  verifyIbuszTwoFactorToken,
  consumeIbuszTwoFactorBackupCode,
  recordIbuszLogin,
} from "@/lib/ibusz-portal-users";
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

    const challenge = verifyIbuszLoginChallenge(challengeToken);
    if (!challenge) {
      return NextResponse.json(
        { success: false, message: "Érvénytelen vagy lejárt kihívás. Kezdje újra a bejelentkezést." },
        { status: 410 }
      );
    }

    const cleanCode = useBackup ? rawCode.toUpperCase().replace(/[^A-Z0-9-]/g, "") : rawCode.replace(/\s+/g, "");
    if (!cleanCode || (useBackup ? cleanCode.length < 6 : cleanCode.length !== 6)) {
      return NextResponse.json(
        {
          success: false,
          message: useBackup
            ? "Kérjük, adjon meg egy érvényes biztonsági kódot."
            : "Kérjük, adja meg az Authenticator alkalmazás által generált 6 számjegyű kódot.",
        },
        { status: 400 }
      );
    }

    const col = await getIbuszCollection();
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
      ok = await consumeIbuszTwoFactorBackupCode(user._id!, cleanCode);
    } else {
      const res = verifyIbuszTwoFactorToken(user, cleanCode);
      ok = !!res.valid;
    }

    if (!ok) {
      return NextResponse.json(
        { success: false, message: useBackup ? "Hibás vagy már felhasznált biztonsági kód." : "Helytelen vagy lejárt 6 számjegyű kód." },
        { status: 401 }
      );
    }

    await recordIbuszLogin(user._id!);
    const sessionToken = createIbuszSessionToken(user);
    await setIbuszSessionCookie(sessionToken, true);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        company: "IBUSZ Hungary Kft.",
        role: "partner",
        requireTwoFactor: !!user.requireTwoFactor,
        twoFactorEnabled: !!user.twoFactorEnabled,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hiba történt." },
      { status: 500 }
    );
  }
}
