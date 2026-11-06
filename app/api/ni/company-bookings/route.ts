import { NextResponse } from "next/server";
import { getCurrentPartnerSessionForPortal } from "@/lib/partner-session";
import { buildPortalScopeFilter, getBookingsCollection, listSharedLinkBookings, type Booking } from "@/lib/bookings";
import { isNiSupervisor } from "@/lib/ni-notifications";

export const dynamic = "force-dynamic";

export async function GET() {
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

  // Az NI felügyelő (Zsuzsi) minden NI foglalást lát – a portálon, linken és a diszpécser által rögzítetteket is –,
  // a többi admin csak a céges linken érkezetteket.
  const allBookings = isNiSupervisor(session.email);
  const bookings = allBookings ? await listAllNiBookings() : await listSharedLinkBookings("ni");

  const groupsMap = new Map<string, typeof bookings>();
  for (const booking of bookings) {
    const key = booking.travelerEmail || "ismeretlen";
    const list = groupsMap.get(key) || [];
    list.push(booking);
    groupsMap.set(key, list);
  }

  const groups = Array.from(groupsMap.entries()).map(([travelerEmail, items]) => ({
    travelerEmail,
    travelerName: items[0]?.travelerName || "",
    count: items.length,
    bookings: items,
  }));

  groups.sort((a, b) => (b.bookings[0]?.createdAt || 0) - (a.bookings[0]?.createdAt || 0));

  return NextResponse.json({ success: true, groups, total: bookings.length, allBookings });
}

async function listAllNiBookings(): Promise<Booking[]> {
  const col = await getBookingsCollection();
  const docs = await col.find(buildPortalScopeFilter("ni")).sort({ pickupDate: -1, pickupTime: -1, createdAt: -1 }).toArray();
  return docs.map((doc) => ({ ...doc, _id: String(doc._id) }) as unknown as Booking);
}
