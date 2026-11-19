import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getBookingsCollection } from "@/lib/bookings";
import { buildPortalBookingConfirmation } from "@/lib/portal-booking-emails";
import {
  buildPortalRecipients,
  portalEmailParamsFromBooking,
  sendPortalBookingEmails,
} from "@/lib/portal-notifications";
import { buildCustomerConfirmationEmail, buildNiCustomerConfirmationEmail } from "@/lib/email-templates";
import { buildNiConfirmationRecipients, sendNiBookingConfirmations, LOCATION_SUPPORT_EMAIL } from "@/lib/ni-notifications";
import { normalizeBookingLanguage } from "@/lib/portal-language";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Belső végpont: a diszpécser felületen rögzített foglalásról is kimegy a cég arculatú, a foglalás nyelvén írt
 * "megkaptuk az utat" levél (ugyanaz a sablon, mint a partnerportálos foglalásoknál).
 * Csak a közös INTERNAL_API_SECRET-tel hívható; egy foglalásra legfeljebb egyszer küld (receivedEmailSentAt).
 */
export async function POST(request: Request) {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret || request.headers.get("x-internal-secret") !== secret) {
    return NextResponse.json({ success: false, message: "Nincs jogosultság." }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { bookingId?: string };
    if (!body.bookingId || !ObjectId.isValid(body.bookingId)) {
      return NextResponse.json({ success: false, message: "Érvénytelen foglalás." }, { status: 400 });
    }

    const col = await getBookingsCollection();
    const oid = new ObjectId(body.bookingId);
    const booking = await col.findOne({ _id: oid as never });
    if (!booking) return NextResponse.json({ success: false, message: "Nincs ilyen foglalás." }, { status: 404 });

    if (!booking.travelerEmail || !String(booking.travelerEmail).includes("@")) {
      return NextResponse.json({ success: true, skipped: "no-traveler-email" });
    }

    // Egyszeri küldés: ha már elment, vagy közben más kérés lefoglalta, nem küldünk újra.
    const claim = await col.updateOne(
      { _id: oid as never, receivedEmailSentAt: { $exists: false } } as never,
      { $set: { receivedEmailSentAt: Date.now() } } as never
    );
    if (claim.modifiedCount === 0) return NextResponse.json({ success: true, skipped: "already-sent" });

    const origin = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    const language = normalizeBookingLanguage(booking.language) ?? "hu";
    const portal = booking.portal as string | undefined;
    const emailParams = {
      bookingCode: booking.bookingCode,
      travelerName: booking.travelerName,
      userEmail: booking.userEmail,
      travelerEmail: booking.travelerEmail,
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      fromAddress: booking.fromAddress,
      toAddress: booking.toAddress,
      flightNumber: booking.flightNumber,
      travelers: booking.travelers,
      luggage: booking.luggage,
      transferType: booking.transferType,
      paymentMethod: booking.paymentMethod === "card" ? ("card" as const) : ("bank" as const),
      comment: booking.comment,
      price: booking.price,
      additionalPassengers: booking.additionalPassengers,
      origin,
      language: language === "en" ? ("en" as const) : ("hu" as const),
    };

    let sent = 0;
    if (portal === "ni") {
      const adminTarget = booking.adminEmail || booking.userEmail;
      const partnerViewer =
        adminTarget && adminTarget.toLowerCase() !== booking.travelerEmail.toLowerCase() ? adminTarget : LOCATION_SUPPORT_EMAIL;
      const results = await sendNiBookingConfirmations({
        recipients: buildNiConfirmationRecipients({
          travelerEmail: booking.travelerEmail,
          secondTravelerEmail: booking.secondTravelerEmail,
          additionalPassengers: booking.additionalPassengers,
          adminEmail: booking.adminEmail,
          bookerEmail: booking.userEmail,
        }),
        subject:
          language === "en"
            ? `Booking confirmation - #${booking.bookingCode}`
            : `Foglalás visszaigazolása - #${booking.bookingCode}`,
        htmlFor: (role) =>
          role === "traveler"
            ? buildNiCustomerConfirmationEmail({ ...emailParams, userEmail: booking.travelerEmail })
            : buildNiCustomerConfirmationEmail({ ...emailParams, userEmail: partnerViewer }),
        logTag: "booking-received",
      });
      sent = results.filter((r) => r.sent).length;
    } else {
      const portalParams = portalEmailParamsFromBooking({ ...booking, userEmail: booking.userEmail }, origin);
      if (portal && buildPortalBookingConfirmation(portal, portalParams)) {
        const results = await sendPortalBookingEmails({
          portal,
          emailParams: { ...portalParams, language },
          recipients: buildPortalRecipients({ bookerEmail: booking.userEmail, travelerEmail: booking.travelerEmail }),
          variant: "confirmation",
          logTag: "booking-received",
        });
        sent = results.filter((r) => r.sent).length;
      } else {
        // Ismeretlen / nem portálos cég: a Pannon Transfer alap sablonja.
        const r = await sendEmail({
          to: booking.travelerEmail,
          subject:
            language === "en"
              ? `Booking confirmation - #${booking.bookingCode}`
              : `Foglalás visszaigazolása - #${booking.bookingCode}`,
          html: buildCustomerConfirmationEmail({
            ...emailParams,
            paymentMethod: booking.paymentMethod,
          } as Parameters<typeof buildCustomerConfirmationEmail>[0]),
        });
        sent = r.success ? 1 : 0;
      }
    }

    if (sent === 0) {
      // Nem ment ki semmi: engedjük, hogy újra lehessen próbálni.
      await col.updateOne({ _id: oid as never } as never, { $unset: { receivedEmailSentAt: "" } } as never);
      return NextResponse.json({ success: false, message: "Az e-mail küldése nem sikerült." }, { status: 502 });
    }
    return NextResponse.json({ success: true, sent });
  } catch (error) {
    console.error("[booking-received] error", error);
    return NextResponse.json({ success: false, message: "Szerver hiba." }, { status: 500 });
  }
}
