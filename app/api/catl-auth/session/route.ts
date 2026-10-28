import { NextResponse } from "next/server";
import { getCurrentCatlSession } from "@/lib/catl-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentCatlSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "No active session." }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      user: {
        userId: session.userId,
        email: session.email,
        company: "CATL",
        role: "partner",
        requireTwoFactor: session.requireTwoFactor,
        twoFactorEnabled: session.twoFactorEnabled,
        loginAt: session.loginAt,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Error while checking the session." }, { status: 500 });
  }
}
