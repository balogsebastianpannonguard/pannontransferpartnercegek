import { NextResponse } from "next/server";
import { getCurrentNiSession } from "@/lib/ni-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentNiSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Nincs aktív munkamenet." }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      user: {
        userId: session.userId,
        email: session.email,
        company: "National Instruments",
        role: session.role === "admin-ni" ? "admin-ni" : "normal",
        displayName: session.displayName || null,
        requireTwoFactor: session.requireTwoFactor,
        twoFactorEnabled: session.twoFactorEnabled,
        loginAt: session.loginAt,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Hiba a munkamenet ellenőrzésekor." }, { status: 500 });
  }
}
