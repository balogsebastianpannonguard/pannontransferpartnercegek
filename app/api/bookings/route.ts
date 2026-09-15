import { NextResponse } from "next/server";
import {
  getCurrentPartnerSession,
  getCurrentPartnerSessionForPortal,
  type PartnerPortal,
} from "@/lib/partner-session";
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

interface StaffEmailRecord {
  email?: string;
}

const DEFAULT_COMPANY_BY_PORTAL: Record<PartnerPortal, string> = {
  catl: "CATL Hungary Kft.",
  ecopro: "EcoPro BM Hungary",
  eccoino: "Eccoino",
  vitesco: "Vitesco Technologies",
  schaeffler: "Schaeffler",
  krones: "Krones AG",
  enterair: "Enter Air",
  tama: "Tama",
  ni: "National Instruments",
};

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

    const body = await request.json();
    const companyName = body.companyName || DEFAULT_COMPANY_BY_PORTAL[session.portal];

    const bookingData: CreateBookingData = {
      portal: session.portal,
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

    const validation = await validateTravelConditions(bookingData);
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
    const dispatcherEmails = (staffUsers as StaffEmailRecord[])
      .map((user) => user.email)
      .filter((email): email is string => typeof email === "string" && email.includes("@"));

    // Ha a DB-ben nincs aktív dispatcher, használjuk a fallback env emailt
    const uniqueDispatcherTargets: string[] =
      dispatcherEmails.length > 0
        ? Array.from(new Set(dispatcherEmails))
        : [process.env.DISPATCHER_EMAIL || "balogh.sebastian@pannonguard.hu"];


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
