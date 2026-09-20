import { NextResponse } from "next/server";
import { getCurrentPartnerSessionForPortal } from "@/lib/partner-session";
import {
  createCompanyBookingToken,
  listCompanyBookingTokens,
} from "@/lib/company-booking-tokens";

export const dynamic = "force-dynamic";

async function requireNiAdmin() {
  const session = await getCurrentPartnerSessionForPortal("ni");
  if (!session) {
    return { session: null, error: NextResponse.json({ success: false, message: "Nincs aktív munkamenet." }, { status: 401 }) };
  }
  if (session.role !== "admin-ni") {
    return { session: null, error: NextResponse.json({ success: false, message: "Ehhez a művelethez admin NI jogosultság szükséges." }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function GET() {
  const { session, error } = await requireNiAdmin();
  if (error) return error;

  const tokens = await listCompanyBookingTokens("ni");
  return NextResponse.json({ success: true, tokens });
}

export async function POST(request: Request) {
  const { session, error } = await requireNiAdmin();
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  const label = typeof body?.label === "string" ? body.label.trim() : undefined;

  const created = await createCompanyBookingToken({
    portal: "ni",
    companyName: "National Instruments",
    createdBy: session!.email,
    label: label || undefined,
  });

  return NextResponse.json({ success: true, token: created });
}
