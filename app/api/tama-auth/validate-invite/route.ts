import { NextResponse } from "next/server";
import { findTamaUserByInviteToken } from "@/lib/tama-portal-users";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawToken = String(body?.token || "").trim();
    if (!rawToken) {
      return NextResponse.json(
        { success: false, message: "Hiányzó token." },
        { status: 400 }
      );
    }

    // 1) Valid (non-expired) token first
    let user = await findTamaUserByInviteToken(rawToken);
    let expiredButActivated = false;

    // 2) Fallback: expired but already activated user — avoid "invalid link" error
    if (!user) {
      const maybeUser = await findTamaUserByInviteToken(rawToken, {
        allowExpired: true,
      });
      if (maybeUser && maybeUser.isActivated) {
        user = maybeUser;
        expiredButActivated = true;
      } else {
        return NextResponse.json(
          { success: false, message: "Érvénytelen vagy lejárt link." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      requireTwoFactor: !!user.requireTwoFactor,
      alreadyActivated: !!user.isActivated,
      inviteExpiresAt: user.inviteExpiresAt,
      expiredButActivated,
      hint: expiredButActivated
        ? "A link lejárt, de a fiókod már aktív. Lépj be a TAMA Hungary Kft. Portálon keresztül."
        : null,
    });
  } catch (error) {
    console.error("[TAMA Hungary Kft. validate-invite] ERROR:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hiba" },
      { status: 500 }
    );
  }
}
