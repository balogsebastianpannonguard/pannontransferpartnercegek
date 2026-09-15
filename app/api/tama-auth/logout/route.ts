import { NextResponse } from "next/server";
import { clearTamaSessionCookie } from "@/lib/tama-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearTamaSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
