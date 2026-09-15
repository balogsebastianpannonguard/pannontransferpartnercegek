import { NextResponse } from "next/server";
import { clearSchaefflerSessionCookie } from "@/lib/schaeffler-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearSchaefflerSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
