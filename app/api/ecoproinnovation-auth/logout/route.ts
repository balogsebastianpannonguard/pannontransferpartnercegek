import { NextResponse } from "next/server";
import { clearEcoproInnovationSessionCookie } from "@/lib/ecoproinnovation-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearEcoproInnovationSessionCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
