import { NextResponse } from "next/server";
import { clearIbuszSessionCookie } from "@/lib/ibusz-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearIbuszSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
