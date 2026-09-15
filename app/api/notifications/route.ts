import { NextResponse } from "next/server";
import {
  getCurrentPartnerSession,
  getCurrentPartnerSessionForPortal,
  type PartnerPortal,
} from "@/lib/partner-session";
import {
  listUserBookings,
  getBookingsCollection,
  buildPortalScopeFilter,
  type Booking,
} from "@/lib/bookings";

export const dynamic = "force-dynamic";

function getRequestedPortal(request: Request): PartnerPortal | null {
  const portal = request.headers.get("x-partner-portal");
  return portal &&
    ["catl", "ecopro", "eccoino", "vitesco", "schaeffler", "krones", "enterair", "tama", "ni"].includes(portal)
    ? (portal as PartnerPortal)
    : null;
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

    // Parse lastPollTimestamp from query params
    const { searchParams } = new URL(request.url);
    const lastPollParam = searchParams.get("lastPollTimestamp");
    const lastPollTimestamp = lastPollParam
      ? Number(lastPollParam)
      : Date.now() - 60000;

    // Query bookings updated since last poll
    const col = await getBookingsCollection();
    const portalFilter = buildPortalScopeFilter(session.portal);

    const updatedDocs = await col
      .find({
        userEmail: session.email,
        ...portalFilter,
        updatedAt: { $gt: lastPollTimestamp },
      } as import("mongodb").Filter<Booking>)
      .sort({ updatedAt: -1 })
      .toArray();

    const statusChanges = updatedDocs
      .filter((doc) => {
        const trail = doc.auditTrail;
        if (!trail || trail.length === 0) return false;
        const lastEntry = trail[trail.length - 1];
        return lastEntry.action === "status-change";
      })
      .map((doc) => {
        const trail = doc.auditTrail!;
        const lastEntry = trail[trail.length - 1];

        // Determine old status from the previous audit trail entry or default
        let oldStatus = "pending";
        for (let i = trail.length - 2; i >= 0; i--) {
          if (trail[i].action === "status-change") {
            // Extract status from details like "Státusz módosítva: confirmed"
            const match = trail[i].details?.match(/:\s*(.+)$/);
            if (match) {
              oldStatus = match[1].trim();
            }
            break;
          }
        }

        return {
          _id: doc._id ? doc._id.toString() : "",
          bookingCode: doc.bookingCode,
          travelerName: doc.travelerName,
          oldStatus,
          newStatus: doc.status,
          updatedAt: doc.updatedAt,
          details: lastEntry.details,
        };
      });

    return NextResponse.json({ success: true, pendingCount, statusChanges });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ismeretlen hiba történt.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
