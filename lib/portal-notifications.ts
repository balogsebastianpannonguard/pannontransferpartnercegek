import { sendEmail } from "@/lib/email";
import { buildDispatcherNotificationEmail } from "@/lib/email-templates";
import { getDb } from "@/lib/mongodb";
import { isValidEmail } from "@/lib/ni-notifications";
import { buildPortalBookingConfirmation, type PortalBookingEmailParams } from "@/lib/portal-booking-emails";
import type { PortalEmailVariant } from "@/lib/portal-email-variants";
import type { Booking } from "@/lib/bookings";

/**
 * A nem NI portálok (CATL, TAMA, Ecopro BM, Ecopro Innovation, IBUSZ, Schaeffler Debrecen, Schaeffler Motion)
 * e-mail értesítései – ugyanaz a működés, mint az NI-nál, csak a cég saját arculatú sablonjával:
 * a foglaló és (ha nem ugyanaz) az utas is megkapja a visszaigazolást és a lemondási értesítőt.
 * Az NI-specifikus címzettek (admin, Location Support) itt nincsenek.
 */

export type PortalRecipientRole = "booker" | "traveler";

type BookingForEmail = Pick<
  Booking,
  | "bookingCode"
  | "travelerName"
  | "travelerEmail"
  | "travelerPhone"
  | "pickupDate"
  | "pickupTime"
  | "fromAddress"
  | "toAddress"
  | "flightNumber"
  | "travelers"
  | "luggage"
  | "transferType"
  | "secondTravelerEmail"
  | "secondTravelerPhone"
  | "comment"
  | "language"
> & { userEmail?: string; portal?: string; companyName?: string };

export function portalEmailParamsFromBooking(booking: BookingForEmail, origin: string): PortalBookingEmailParams {
  return {
    origin,
    bookingCode: booking.bookingCode,
    travelerName: booking.travelerName,
    travelerEmail: booking.travelerEmail,
    travelerPhone: booking.travelerPhone,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    fromAddress: booking.fromAddress,
    toAddress: booking.toAddress,
    flightNumber: booking.flightNumber,
    travelers: booking.travelers,
    luggage: booking.luggage,
    transferType: booking.transferType,
    secondTravelerEmail: booking.secondTravelerEmail,
    secondTravelerPhone: booking.secondTravelerPhone,
    comment: booking.comment,
    language: booking.language ?? "hu",
  };
}

/** Foglaló, majd az utas (ha érvényes és más cím); kis/nagybetűtől függetlenül egyszer szerepel egy cím. */
export function buildPortalRecipients(params: {
  bookerEmail?: string;
  travelerEmail?: string;
}): Array<{ email: string; role: PortalRecipientRole }> {
  const seen = new Set<string>();
  const out: Array<{ email: string; role: PortalRecipientRole }> = [];
  const add = (email: string | undefined, role: PortalRecipientRole) => {
    if (!isValidEmail(email)) return;
    const clean = email.trim();
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ email: clean, role });
  };
  add(params.bookerEmail, "booker");
  add(params.travelerEmail, "traveler");
  return out;
}

/**
 * Elküldi a cég arculatú e-mailt a megadott címzetteknek (szerepenként saját szöveggel).
 * Egy-egy sikertelen küldés nem akadályozza a többit, és sosem dob hibát.
 */
export async function sendPortalBookingEmails(params: {
  portal: string;
  emailParams: PortalBookingEmailParams;
  recipients: Array<{ email: string; role: PortalRecipientRole }>;
  variant: PortalEmailVariant;
  logTag: string;
}): Promise<Array<{ email: string; role: PortalRecipientRole; sent: boolean }>> {
  const results: Array<{ email: string; role: PortalRecipientRole; sent: boolean }> = [];
  for (const recipient of params.recipients) {
    let sent = false;
    try {
      const email = buildPortalBookingConfirmation(params.portal, {
        ...params.emailParams,
        variant: params.variant,
        forTraveler: recipient.role === "traveler",
      });
      if (!email) {
        console.error(`[${params.logTag}] No ${params.variant} template for portal ${params.portal}`);
      } else {
        const result = await sendEmail({ to: recipient.email, subject: email.subject, html: email.html });
        sent = result.success;
        if (!result.success) {
          console.error(`[${params.logTag}] ${params.variant} email failed for ${recipient.role}`, result.error);
        }
      }
    } catch (error) {
      console.error(`[${params.logTag}] ${params.variant} email threw for ${recipient.role}`, error);
    }
    results.push({ ...recipient, sent });
  }
  return results;
}

/** A partner lemondta a foglalást: a foglaló és az utas cég arculatú értesítőt kap (az NI-nak saját folyamata van). */
export async function sendPortalCancellationNotifications(params: {
  booking: BookingForEmail;
  origin: string;
  logTag: string;
}) {
  const portal = params.booking.portal;
  if (!portal || portal === "ni") return [];
  try {
    return await sendPortalBookingEmails({
      portal,
      emailParams: portalEmailParamsFromBooking(params.booking, params.origin),
      recipients: buildPortalRecipients({
        bookerEmail: params.booking.userEmail,
        travelerEmail: params.booking.travelerEmail,
      }),
      variant: "cancellation",
      logTag: params.logTag,
    });
  } catch (error) {
    console.error(`[${params.logTag}] Portal cancellation notifications failed`, error);
    return [];
  }
}

/** Az aktív diszpécser/admin felhasználók címei; ha nincs ilyen, a DISPATCHER_EMAIL tartalék cím. */
export async function getDispatcherEmailTargets(): Promise<string[]> {
  const db = await getDb();
  const staffUsers = await db
    .collection("staff_users")
    .find({ role: { $in: ["dispatcher", "admin"] }, status: "active" })
    .project({ email: 1, _id: 0 })
    .toArray();
  const emails = (staffUsers as Array<{ email?: unknown }>)
    .map((user) => user.email)
    .filter((email): email is string => typeof email === "string" && email.includes("@"));
  return emails.length > 0
    ? Array.from(new Set(emails))
    : [process.env.DISPATCHER_EMAIL || "balogh.sebastian@pannonguard.hu"];
}

/** Nem NI portáloknál: a diszpécserek e-mailt kapnak, ha a partner lemondta a foglalást (az NI-t nem érinti). */
export async function sendDispatcherCancellationNotification(params: {
  booking: BookingForEmail;
  logTag: string;
}): Promise<string[]> {
  const { booking } = params;
  if (booking.portal === "ni") return [];
  try {
    const targets = await getDispatcherEmailTargets();
    const html = buildDispatcherNotificationEmail({
      bookingCode: booking.bookingCode,
      travelerName: booking.travelerName,
      travelerEmail: booking.travelerEmail,
      travelerPhone: booking.travelerPhone,
      companyName: booking.companyName || "",
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      fromAddress: booking.fromAddress,
      toAddress: booking.toAddress,
      flightNumber: booking.flightNumber,
      travelers: booking.travelers,
      luggage: booking.luggage,
      transferType: booking.transferType,
      kind: "cancelled",
    });
    for (const target of targets) {
      try {
        await sendEmail({ to: target, subject: `FOGLALÁS LEMONDVA - #${booking.bookingCode}`, html });
      } catch (error) {
        console.error(`[${params.logTag}] Dispatcher cancellation email failed for ${target}`, error);
      }
    }
    return targets;
  } catch (error) {
    console.error(`[${params.logTag}] Dispatcher cancellation notification failed`, error);
    return [];
  }
}
