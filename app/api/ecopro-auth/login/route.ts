import { NextResponse } from "next/server";
import { authenticateEcoproByPassword, createEcoproSessionToken, setEcoproSessionCookie } from "@/lib/ecopro-auth";
import { signEcoproLoginChallenge } from "@/lib/ecopro-auth-login-challenge";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, remember } = body || {};
    const result = await authenticateEcoproByPassword(String(email || ""), String(password || ""));
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
      const challengeToken = signEcoproLoginChallenge({
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
    const token = createEcoproSessionToken(user);
    await setEcoproSessionCookie(token, remember !== false);
    return NextResponse.json({
      success: true,
      needTwoFactor: false,
      user: {
        email: user.email,
        company: "ECOPRO Hungary Kft.",
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
