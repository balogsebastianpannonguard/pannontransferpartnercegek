import { NextResponse } from "next/server";
import { authenticateEccoinoByPassword, createEccoinoSessionToken, setEccoinoSessionCookie } from "@/lib/eccoino-auth";
import { signEccoinoLoginChallenge } from "@/lib/eccoino-auth-login-challenge";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, remember } = body || {};
    const result = await authenticateEccoinoByPassword(String(email || ""), String(password || ""));
    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, message: result.message || "Hibás hitelesítő adatok." },
        { status: 401 }
      );
    }
    if (result.user.requireTwoFactor && !result.user.twoFactorEnabled) {
      return NextResponse.json(
        { success: false, message: "Ez a fiók igényel kétfaktoros hitelesítést, amely még nincs aktiválva. Kérjük először állítsd be a 2FA-t a meghívó e-mailben kapott linken." },
        { status: 403 }
      );
    }

    const user = result.user;

    // Ha 2FA bekapcsolt → 1. lépés: challenge token küldése (még NINCS session)
    if (user.requireTwoFactor && user.twoFactorEnabled) {
      const challengeToken = signEccoinoLoginChallenge({
        userId: user._id!.toString(),
        email: user.email,
        requireTwoFactor: true,
      });
      return NextResponse.json({
        success: true,
        needTwoFactor: true,
        email: user.email,
        challengeToken,
      });
    }

    // Nincs 2FA → közvetlen session + belépés
    const token = createEccoinoSessionToken(user);
    await setEccoinoSessionCookie(token, remember !== false);
    return NextResponse.json({
      success: true,
      needTwoFactor: false,
      user: {
        email: user.email,
        company: "Eccoino",
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
