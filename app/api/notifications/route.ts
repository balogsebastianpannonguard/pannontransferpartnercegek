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
        auditTrail: {
          $elemMatch: {
            action: { $in: ["status-change", "modified"] },
            timestamp: { $gt: lastPollTimestamp },
          },
        },
      } as import("mongodb").Filter<Booking>)
      .sort({ updatedAt: -1 })
      .toArray();

    const statusChanges = updatedDocs.flatMap((doc) => {
      const trail = doc.auditTrail || [];
      return trail
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) =>
          (entry.action === "status-change" || entry.action === "modified") &&
          typeof entry.timestamp === "number" &&
          entry.timestamp > lastPollTimestamp
        )
        .map(({ entry, index }) => {
          if (entry.action === "modified") {
            let details = entry.details || "A diszpécser módosította a foglalást.";
            try {
              const parsed = JSON.parse(entry.details || "{}") as {
                message?: string;
                changes?: Array<{ field?: string; oldValue?: unknown; newValue?: unknown }>;
              };
              const changes = (parsed.changes || [])
                .map((change) => `${change.field || "Adat"}: ${change.oldValue ?? "—"} → ${change.newValue ?? "—"}`)
                .join("; ");
              details = changes ? `${parsed.message || "A diszpécser módosította a foglalást."} ${changes}` : (parsed.message || details);
            } catch {
              // Older audit entries contain plain text; keep that message.
            }
            return {
              _id: doc._id ? doc._id.toString() : "",
              bookingCode: doc.bookingCode,
              travelerName: doc.travelerName,
              oldStatus: doc.status,
              newStatus: "modified",
              updatedAt: entry.timestamp,
              details,
            };
          }
          let oldStatus = "pending";
          for (let i = index - 1; i >= 0; i -= 1) {
            if (trail[i].action === "status-change") {
              const match = trail[i].details?.match(/:\s*(.+)$/);
              if (match) oldStatus = match[1].trim();
              break;
            }
          }

          const statusMatch = entry.details?.match(/:\s*(.+)$/);
          const newStatus = statusMatch?.[1]?.trim() || doc.status;
          return {
            _id: doc._id ? doc._id.toString() : "",
            bookingCode: doc.bookingCode,
            travelerName: doc.travelerName,
            oldStatus,
            newStatus,
            updatedAt: entry.timestamp,
            details: entry.details,
          };
        });
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
