import { NextResponse } from "next/server";
import { clearKronesSessionCookie } from "@/lib/krones-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearKronesSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
