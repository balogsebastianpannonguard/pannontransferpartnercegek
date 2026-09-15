import { NextResponse } from "next/server";
import { clearVitescoSessionCookie } from "@/lib/vitesco-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearVitescoSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
