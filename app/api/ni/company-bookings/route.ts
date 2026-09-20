import { NextResponse } from "next/server";
import { getCurrentPartnerSessionForPortal } from "@/lib/partner-session";
import { listSharedLinkBookings } from "@/lib/bookings";

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

  const bookings = await listSharedLinkBookings("ni");

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

  return NextResponse.json({ success: true, groups, total: bookings.length });
}
