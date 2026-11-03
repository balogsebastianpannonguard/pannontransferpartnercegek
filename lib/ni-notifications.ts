import { sendEmail } from "@/lib/email";
import { buildNiCancellationEmail } from "@/lib/email-templates";

/**
 * A Location Support központi címzett: MINDEN NI foglalásról megkapja a visszaigazolást,
 * függetlenül attól, hogy ki és kinek foglal. Felülírható a LOCATION_SUPPORT_EMAIL környezeti változóval.
 */
export const LOCATION_SUPPORT_EMAIL =
  process.env.LOCATION_SUPPORT_EMAIL?.trim() || "locationsupport.request@emerson.com";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim());
}

export type NiConfirmationRole = "traveler" | "admin" | "location-support";

export interface NiConfirmationRecipient {
  email: string;
  role: NiConfirmationRole;
}

/**
 * Összeállítja a címzetteket: utas, admin (megadott admin e-mail, ennek hiányában a foglalást rögzítő
 * felhasználó), valamint a Location Support. Kis/nagybetűtől függetlenül egyszer szerepel egy cím;
 * ha egy ember több szerepben is van, az első (utas > admin > Location Support) érvényes.
 */
export function buildNiConfirmationRecipients(params: {
  travelerEmail?: string;
  adminEmail?: string;
  bookerEmail?: string;
}): NiConfirmationRecipient[] {
  const seen = new Set<string>();
  const recipients: NiConfirmationRecipient[] = [];

  const add = (email: string | undefined, role: NiConfirmationRole) => {
    if (!isValidEmail(email)) return;
    const clean = email.trim();
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    recipients.push({ email: clean, role });
  };

  add(params.travelerEmail, "traveler");
  add(params.adminEmail || params.bookerEmail, "admin");
  add(LOCATION_SUPPORT_EMAIL, "location-support");

  return recipients;
}

/**
 * Elküldi a visszaigazolást minden címzettnek. Egy-egy sikertelen küldés nem akadályozza a többit,
 * és nem buktatja meg a foglalást sem.
 */
export async function sendNiBookingConfirmations(params: {
  recipients: NiConfirmationRecipient[];
  subject: string;
  htmlFor: (role: NiConfirmationRole) => string;
  logTag: string;
}): Promise<Array<NiConfirmationRecipient & { sent: boolean }>> {
  const results: Array<NiConfirmationRecipient & { sent: boolean }> = [];
  for (const recipient of params.recipients) {
    let sent = false;
    try {
      const result = await sendEmail({
        to: recipient.email,
        subject: params.subject,
        html: params.htmlFor(recipient.role),
      });
      sent = result.success;
      if (!result.success) {
        console.error(`[${params.logTag}] Confirmation email failed for ${recipient.role}`, result.error);
      }
    } catch (error) {
      console.error(`[${params.logTag}] Confirmation email threw for ${recipient.role}`, error);
    }
    results.push({ ...recipient, sent });
  }
  return results;
}

/**
 * NI foglalás lemondásakor értesítést küld ugyanazoknak, akik a visszaigazolást is megkapták
 * (utas, admin / foglaló, Location Support). Hiba esetén csak naplóz, a lemondást nem buktatja meg.
 */
export async function sendNiCancellationNotifications(params: {
  booking: {
    bookingCode: string;
    travelerName: string;
    travelerEmail: string;
    userEmail?: string;
    adminEmail?: string;
    pickupDate: string;
    pickupTime: string;
    fromAddress: string;
    toAddress: string;
    flightNumber?: string;
    travelers: number;
    luggage: number;
    transferType: "standard" | "executive";
    language?: string;
  };
  cancelledBy?: string;
  logTag: string;
}) {
  const { booking } = params;
  const en = booking.language === "en";
  try {
    return await sendNiBookingConfirmations({
      recipients: buildNiConfirmationRecipients({
        travelerEmail: booking.travelerEmail,
        adminEmail: booking.adminEmail,
        bookerEmail: booking.userEmail,
      }),
      subject: en
        ? `Booking cancelled - #${booking.bookingCode}`
        : `Foglalás lemondva - #${booking.bookingCode}`,
      htmlFor: (role) =>
        buildNiCancellationEmail({
          bookingCode: booking.bookingCode,
          travelerName: booking.travelerName,
          forTraveler: role === "traveler",
          pickupDate: booking.pickupDate,
          pickupTime: booking.pickupTime,
          fromAddress: booking.fromAddress,
          toAddress: booking.toAddress,
          flightNumber: booking.flightNumber,
          travelers: booking.travelers,
          luggage: booking.luggage,
          transferType: booking.transferType,
          cancelledBy: params.cancelledBy,
          language: en ? "en" : "hu",
        }),
      logTag: params.logTag,
    });
  } catch (error) {
    console.error(`[${params.logTag}] NI cancellation notifications failed`, error);
    return [];
  }
}
