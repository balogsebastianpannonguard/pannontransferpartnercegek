import { sendEmail } from "@/lib/email";

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
