import { NextResponse } from "next/server";
import { clearSchaefflerMotionSessionCookie } from "@/lib/schaefflermotion-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearSchaefflerMotionSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
