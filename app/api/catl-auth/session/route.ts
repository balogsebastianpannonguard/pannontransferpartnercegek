import { NextResponse } from "next/server";
import { getCurrentCatlSession } from "@/lib/catl-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentCatlSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Nincs aktív munkamenet." }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      user: {
        userId: session.userId,
        email: session.email,
        company: "CATL Hungary Kft.",
        role: "partner",
        requireTwoFactor: session.requireTwoFactor,
        twoFactorEnabled: session.twoFactorEnabled,
        loginAt: session.loginAt,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Hiba a munkamenet ellenőrzésekor." }, { status: 500 });
  }
}
