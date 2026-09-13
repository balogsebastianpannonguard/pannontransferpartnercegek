import { NextResponse } from "next/server";
import { clearEcoproSessionCookie } from "@/lib/ecopro-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearEcoproSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
