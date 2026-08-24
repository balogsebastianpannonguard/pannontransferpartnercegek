import { NextResponse } from "next/server";
import { findCatlUserByInviteToken, hashToken, CATL_SHARED_DB_NAME } from "@/lib/catl-portal-users";

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

    // ===== DEBUG LOG a futó Next.js konzolba (localhost:3001 terminál) =====
    const peek =
      rawToken.length > 14
        ? `${rawToken.slice(0, 8)}...${rawToken.slice(-4)} (${rawToken.length} chars)`
        : rawToken;
    const hashPreview = await hashToken(rawToken);
    console.log("\n=== [CATL validate-invite] REQUEST ===");
    console.log("Shared DB:", CATL_SHARED_DB_NAME);
    console.log("Raw token:", peek);
    console.log("SHA256 hash:", hashPreview);
    // =========================================================================

    // 1) Valid (non-expired) token first
    let user = await findCatlUserByInviteToken(rawToken);
    let expiredButActivated = false;

    // 2) Fallback: expired but already activated user — avoid "invalid link" error
    if (!user) {
      const maybeUser = await findCatlUserByInviteToken(rawToken, {
        allowExpired: true,
      });
      if (maybeUser && maybeUser.isActivated) {
        user = maybeUser;
        expiredButActivated = true;
      } else {
        console.log("[CATL validate-invite] NINCS TALÁLAT a közös DB-ben -> invalid link.");
        console.log("====================================================\n");
        return NextResponse.json(
          { success: false, message: "Érvénytelen vagy lejárt link." },
          { status: 404 }
        );
      }
    }

    console.log("[CATL validate-invite] TALÁLAT:", {
      email: user.email,
      isActivated: !!user.isActivated,
      require2FA: !!user.requireTwoFactor,
      inviteExpiresAt: new Date(user.inviteExpiresAt).toLocaleString("hu-HU"),
      expiredButActivated,
    });
    console.log("====================================================\n");

    return NextResponse.json({
      success: true,
      email: user.email,
      requireTwoFactor: !!user.requireTwoFactor,
      alreadyActivated: !!user.isActivated,
      inviteExpiresAt: user.inviteExpiresAt,
      expiredButActivated,
      hint: expiredButActivated
        ? "A link lejárt, de a fiókod már aktív. Lépj be a CATL Portálon keresztül."
        : null,
    });
  } catch (error) {
    console.error("[CATL validate-invite] ERROR:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Hiba" },
      { status: 500 }
    );
  }
}
