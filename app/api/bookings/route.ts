import { NextResponse } from "next/server";
import { getCurrentCatlSession } from "@/lib/catl-auth";
import {
  createBooking,
  listUserBookings,
  validateTravelConditions,
  type CreateBookingData,
} from "@/lib/bookings";
import { sendEmail } from "@/lib/email";
import {
  buildCustomerConfirmationEmail,
  buildDispatcherNotificationEmail,
} from "@/lib/email-templates";
import { getDb } from "@/lib/mongodb";

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
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ismeretlen hiba történt.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentCatlSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nincs aktív munkamenet." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const companyName = body.companyName || "CATL Hungary Kft.";

    const bookingData: CreateBookingData = {
      userEmail: session.email,
      travelerEmail: body.travelerEmail,
      travelerName: body.travelerName,
      travelerPhone: body.travelerPhone,
      secondTravelerEmail: body.secondTravelerEmail,
      secondTravelerPhone: body.secondTravelerPhone,
      companyName,
      paymentMethod: body.paymentMethod,
      transferType: body.transferType,
      fromType: body.fromType,
      fromAddress: body.fromAddress,
      toType: body.toType,
      toAddress: body.toAddress,
      pickupDate: body.pickupDate,
      pickupTime: body.pickupTime,
      travelers: body.travelers,
      luggage: body.luggage,
      comment: body.comment,
    };

    const validation = validateTravelConditions(bookingData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const createdBooking = await createBooking(bookingData);

    const customerHtml = buildCustomerConfirmationEmail({
      bookingCode: createdBooking.bookingCode,
      travelerName: createdBooking.travelerName,
      pickupDate: createdBooking.pickupDate,
      pickupTime: createdBooking.pickupTime,
      fromAddress: createdBooking.fromAddress,
      toAddress: createdBooking.toAddress,
      travelers: createdBooking.travelers,
      luggage: createdBooking.luggage,
      transferType: createdBooking.transferType,
      paymentMethod: createdBooking.paymentMethod,
      comment: createdBooking.comment,
      price: createdBooking.price,
    });

    await sendEmail({
      to: createdBooking.travelerEmail,
      subject: `Foglalás visszaigazolása - #${createdBooking.bookingCode}`,
      html: customerHtml,
    });

    const db = await getDb();
    const staffUsers = await db
      .collection("staff_users")
      .find({
        role: { $in: ["dispatcher", "admin"] },
        status: "active",
      })
      .project({ email: 1, _id: 0 })
      .toArray();
    const dispatcherEmails = staffUsers
      .map((u: any) => u.email)
      .filter((e: any) => typeof e === "string" && e.includes("@"));
    const dispatcherFallback =
      process.env.DISPATCHER_EMAIL || "minimalwebsoft@gmail.com";
    const uniqueDispatcherTargets = Array.from(
      new Set([...dispatcherEmails, dispatcherFallback])
    );

    const dispatcherHtml = buildDispatcherNotificationEmail({
      bookingCode: createdBooking.bookingCode,
      travelerName: createdBooking.travelerName,
      travelerEmail: createdBooking.travelerEmail,
      travelerPhone: createdBooking.travelerPhone,
      companyName: createdBooking.companyName,
      pickupDate: createdBooking.pickupDate,
      pickupTime: createdBooking.pickupTime,
      fromAddress: createdBooking.fromAddress,
      toAddress: createdBooking.toAddress,
      travelers: createdBooking.travelers,
      luggage: createdBooking.luggage,
      transferType: createdBooking.transferType,
    });

    for (const targetEmail of uniqueDispatcherTargets) {
      try {
        await sendEmail({
          to: targetEmail,
          subject: `ÚJ FOGLALÁS ÉRKEZETT - #${createdBooking.bookingCode}`,
          html: dispatcherHtml,
        });
      } catch (err) {
        console.error(`[booking] Dispatcher email failed for ${targetEmail}`, err);
      }
    }

    await db.collection("audit_logs").insertOne({
      type: "notification_created",
      bookingId: createdBooking._id,
      bookingCode: createdBooking.bookingCode,
      userEmail: session.email,
      createdAt: Date.now(),
      sentTo: uniqueDispatcherTargets,
      details: "Diszpécser értesítés létrehozva új foglalásról",
    });

    return NextResponse.json(
      { success: true, booking: createdBooking },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ismeretlen hiba történt.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
