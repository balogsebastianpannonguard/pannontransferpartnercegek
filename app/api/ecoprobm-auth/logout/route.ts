import { NextResponse } from "next/server";
import { clearEcoproBmSessionCookie } from "@/lib/ecoprobm-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearEcoproBmSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
