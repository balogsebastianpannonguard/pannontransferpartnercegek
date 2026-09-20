import { NextResponse } from "next/server";
import { getCurrentPartnerSessionForPortal } from "@/lib/partner-session";
import { deactivateCompanyBookingToken } from "@/lib/company-booking-tokens";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentPartnerSessionForPortal("ni");
  if (!session) {
    return NextResponse.json({ success: false, message: "Nincs aktív munkamenet." }, { status: 401 });
  }
  if (session.role !== "admin-ni") {
    return NextResponse.json(
      { success: false, message: "Ehhez a művelethez admin NI jogosultság szükséges." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const ok = await deactivateCompanyBookingToken(id, "ni");
  if (!ok) {
    return NextResponse.json({ success: false, message: "A link nem található, vagy már inaktív." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
