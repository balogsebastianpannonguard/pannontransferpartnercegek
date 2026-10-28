import { NextResponse } from "next/server";
import { clearSchaefflerDebrecenSessionCookie } from "@/lib/schaefflerdebrecen-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearSchaefflerDebrecenSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
