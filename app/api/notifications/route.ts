import { NextResponse } from "next/server";
import { getCurrentCatlSession } from "@/lib/catl-auth";
import { listUserBookings } from "@/lib/bookings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentCatlSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nincs aktív munkamenet." },
        { status: 401 }
      );
    }

    const bookings = await listUserBookings(session.email);
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
