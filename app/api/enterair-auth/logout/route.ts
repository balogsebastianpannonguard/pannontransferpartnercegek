import { NextResponse } from "next/server";
import { clearEnterairSessionCookie } from "@/lib/enterair-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearEnterairSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
