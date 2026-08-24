import { NextResponse } from "next/server";
import { clearCatlSessionCookie } from "@/lib/catl-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearCatlSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
