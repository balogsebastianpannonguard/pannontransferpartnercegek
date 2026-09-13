import { NextResponse } from "next/server";
import {
  getCurrentPartnerSession,
  getCurrentPartnerSessionForPortal,
  type PartnerPortal,
} from "@/lib/partner-session";
import { listUserBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";

function getRequestedPortal(request: Request): PartnerPortal | null {
  const portal = request.headers.get("x-partner-portal");
  return portal === "catl" || portal === "ecopro" ? portal : null;
}

export async function GET(request: Request) {
  try {
    const requestedPortal = getRequestedPortal(request);
    const session = requestedPortal
      ? await getCurrentPartnerSessionForPortal(requestedPortal)
      : await getCurrentPartnerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nincs aktív munkamenet." },
        { status: 401 }
      );
    }

    const bookings = await listUserBookings(session.email, session.portal);
    const pendingCount = bookings.filter(
      (b) => b.status !== "completed" && b.status !== "cancelled"
    ).length;

    return NextResponse.json({ success: true, pendingCount });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ismeretlen hiba történt.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
