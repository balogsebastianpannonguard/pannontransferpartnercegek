import { NextResponse } from "next/server";
import { clearEccoinoSessionCookie } from "@/lib/eccoino-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearEccoinoSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
