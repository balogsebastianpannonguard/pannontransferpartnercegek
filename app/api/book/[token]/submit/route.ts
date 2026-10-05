import { NextResponse } from "next/server";
import {
  getActiveCompanyBookingToken,
  incrementCompanyBookingTokenUsage,
} from "@/lib/company-booking-tokens";
import {
  createBooking,
  validateTravelConditions,
  type CreateBookingData,
} from "@/lib/bookings";
import { sendEmail } from "@/lib/email";
import {
  buildCustomerConfirmationEmail,
  buildNiCustomerConfirmationEmail,
  buildDispatcherNotificationEmail,
} from "@/lib/email-templates";
import { getDb } from "@/lib/mongodb";
import { normalizePortalLanguage } from "@/lib/portal-language";
import {
  LOCATION_SUPPORT_EMAIL,
  buildNiConfirmationRecipients,
  sendNiBookingConfirmations,
} from "@/lib/ni-notifications";

export const dynamic = "force-dynamic";

interface StaffEmailRecord {
  email?: string;
}

function getRequestOrigin(request: Request): string {
  const originHeader = request.headers.get("origin");
  if (originHeader) return originHeader.replace(/\/$/, "");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host");
  if (host) return `${forwardedProto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL || "";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const linkRecord = await getActiveCompanyBookingToken(token);
    if (!linkRecord) {
      return NextResponse.json(
        { success: false, message: "Érvénytelen vagy inaktív foglalási link." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const bookingData: CreateBookingData = {
      portal: linkRecord.portal,
      userEmail: body.travelerEmail,
      travelerEmail: body.travelerEmail,
      travelerName: body.travelerName,
      travelerPhone: body.travelerPhone,
      secondTravelerEmail: body.secondTravelerEmail,
      secondTravelerPhone: body.secondTravelerPhone,
      ...(linkRecord.portal === "ni" && typeof body.adminEmail === "string" && body.adminEmail.trim()
        ? { adminEmail: body.adminEmail.trim() }
        : {}),
      companyName: linkRecord.companyName,
      paymentMethod: "card",
      transferType: body.transferType,
      fromType: body.fromType,
      fromAddress: body.fromAddress,
      toType: body.toType,
      toAddress: body.toAddress,
      flightNumber: body.flightNumber,
      pickupDate: body.pickupDate,
      pickupTime: body.pickupTime,
      travelers: body.travelers,
      luggage: body.luggage,
      comment: body.comment,
      sharedLinkToken: token,
      ...(linkRecord.portal === "ni" ? { language: normalizePortalLanguage(body.language) } : {}),
    };

    const validation = await validateTravelConditions(bookingData);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const createdBooking = await createBooking(bookingData);
    await incrementCompanyBookingTokenUsage(token);

    const trackUrl = createdBooking.bookingTrackToken
      ? `${getRequestOrigin(request)}/track/${createdBooking.bookingTrackToken}`
      : undefined;

    const emailParams = {
      bookingCode: createdBooking.bookingCode,
      travelerName: createdBooking.travelerName,
      userEmail: createdBooking.userEmail,
      travelerEmail: createdBooking.travelerEmail,
      pickupDate: createdBooking.pickupDate,
      pickupTime: createdBooking.pickupTime,
      fromAddress: createdBooking.fromAddress,
      toAddress: createdBooking.toAddress,
      flightNumber: createdBooking.flightNumber,
      travelers: createdBooking.travelers,
      luggage: createdBooking.luggage,
      transferType: createdBooking.transferType,
      paymentMethod: createdBooking.paymentMethod,
      comment: createdBooking.comment,
      price: createdBooking.price,
      trackUrl,
      language: createdBooking.language,
    };

    const customerHtml =
      linkRecord.portal === "ni"
        ? buildNiCustomerConfirmationEmail(emailParams)
        : buildCustomerConfirmationEmail(emailParams);

    const confirmationSubject =
      linkRecord.portal === "ni" && createdBooking.language === "en"
        ? `Booking confirmation - #${createdBooking.bookingCode}`
        : `Foglalás visszaigazolása - #${createdBooking.bookingCode}`;

    if (linkRecord.portal === "ni") {
      // NI: az utas, a megadott admin és a Location Support is megkapja.
      const partnerViewer =
        createdBooking.adminEmail && createdBooking.adminEmail.toLowerCase() !== createdBooking.travelerEmail.toLowerCase()
          ? createdBooking.adminEmail
          : LOCATION_SUPPORT_EMAIL;
      await sendNiBookingConfirmations({
        recipients: buildNiConfirmationRecipients({
          travelerEmail: createdBooking.travelerEmail,
          adminEmail: createdBooking.adminEmail,
        }),
        subject: confirmationSubject,
        htmlFor: (role) =>
          role === "traveler"
            ? customerHtml
            : buildNiCustomerConfirmationEmail({ ...emailParams, userEmail: partnerViewer }),
        logTag: "book/submit",
      });
    } else if (createdBooking.travelerEmail) {
      await sendEmail({
        to: createdBooking.travelerEmail,
        subject: confirmationSubject,
        html: customerHtml,
      });
    }

    const db = await getDb();
    const staffUsers = await db
      .collection("staff_users")
      .find({ role: { $in: ["dispatcher", "admin"] }, status: "active" })
      .project({ email: 1, _id: 0 })
      .toArray();
    const dispatcherEmails = (staffUsers as StaffEmailRecord[])
      .map((user) => user.email)
      .filter((email): email is string => typeof email === "string" && email.includes("@"));
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
      flightNumber: createdBooking.flightNumber,
      travelers: createdBooking.travelers,
      luggage: createdBooking.luggage,
      transferType: createdBooking.transferType,
    });

    for (const targetEmail of uniqueDispatcherTargets) {
      try {
        await sendEmail({
          to: targetEmail,
          subject: `ÚJ FOGLALÁS ÉRKEZETT (Céges link) - #${createdBooking.bookingCode}`,
          html: dispatcherHtml,
        });
      } catch (err) {
        console.error(`[book/submit] Dispatcher email failed for ${targetEmail}`, err);
      }
    }

    await db.collection("audit_logs").insertOne({
      type: "notification_created",
      bookingId: createdBooking._id,
      bookingCode: createdBooking.bookingCode,
      userEmail: createdBooking.userEmail,
      createdAt: Date.now(),
      sentTo: uniqueDispatcherTargets,
      details: "Diszpécser értesítés létrehozva céges (shared-link) foglalásról",
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          bookingCode: createdBooking.bookingCode,
          bookingTrackToken: createdBooking.bookingTrackToken,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ismeretlen hiba történt.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
