import { NextResponse } from "next/server";
import { createKronesSessionToken, setKronesSessionCookie } from "@/lib/krones-auth";
import { verifyKronesLoginChallenge } from "@/lib/krones-auth-login-challenge";
import {
  getKronesCollection,
  verifyKronesTwoFactorToken,
  consumeKronesTwoFactorBackupCode,
  recordKronesLogin,
} from "@/lib/krones-portal-users";
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

    const challenge = verifyKronesLoginChallenge(challengeToken);
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

    const col = await getKronesCollection();
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
      ok = await consumeKronesTwoFactorBackupCode(user._id!, cleanCode);
    } else {
      const res = verifyKronesTwoFactorToken(user, cleanCode);
      ok = !!res.valid;
    }

    if (!ok) {
      return NextResponse.json(
        { success: false, message: useBackup ? "Hibás vagy már felhasznált biztonsági kód." : "Helytelen vagy lejárt 6 számjegyű kód." },
        { status: 401 }
      );
    }

    await recordKronesLogin(user._id!);
    const sessionToken = createKronesSessionToken(user);
    await setKronesSessionCookie(sessionToken, true);

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        company: "Krones AG",
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
