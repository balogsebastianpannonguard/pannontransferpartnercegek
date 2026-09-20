import { NextResponse } from "next/server";
import { getActiveCompanyBookingToken } from "@/lib/company-booking-tokens";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const record = await getActiveCompanyBookingToken(token);
  if (!record) {
    return NextResponse.json(
      { success: false, message: "Érvénytelen vagy inaktív foglalási link." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    companyName: record.companyName,
    portal: record.portal,
    label: record.label || null,
  });
}
