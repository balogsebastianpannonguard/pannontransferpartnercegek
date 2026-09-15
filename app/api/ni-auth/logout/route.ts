import { NextResponse } from "next/server";
import { clearNiSessionCookie } from "@/lib/ni-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearNiSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
