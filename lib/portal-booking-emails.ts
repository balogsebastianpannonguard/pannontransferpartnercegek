import { buildCatlBookingConfirmationEmail } from "@/lib/catl-email-layout";
import type { BookingLanguage } from "@/lib/portal-language";
import type { PortalEmailVariant } from "@/lib/portal-email-variants";
import { buildBookingConfirmationEmail as buildTama } from "@/lib/tama-email-layout";
import { buildBookingConfirmationEmail as buildEcoproInnovation } from "@/lib/ecoproinnovation-email-layout";
import { buildBookingConfirmationEmail as buildEcoproBm } from "@/lib/ecoprobm-email-layout";
import { buildBookingConfirmationEmail as buildSchaefflerMotion } from "@/lib/schaefflermotion-email-layout";
import { buildBookingConfirmationEmail as buildSchaefflerDebrecen } from "@/lib/schaefflerdebrecen-email-layout";
import { buildBookingConfirmationEmail as buildIbusz } from "@/lib/ibusz-email-layout";

export interface PortalBookingEmailParams {
  origin: string;
  bookingCode: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone: string;
  pickupDate: string;
  pickupTime: string;
  fromAddress: string;
  toAddress: string;
  flightNumber?: string;
  travelers: number;
  luggage: number;
  transferType: "standard" | "executive";
  secondTravelerEmail?: string;
  secondTravelerPhone?: string;
  comment?: string;
  /** A foglaláskor használt felületi nyelv (hu/en/ko/zh). */
  language: BookingLanguage;
  /** Visszaigazolás (alap) vagy lemondási értesítő. */
  variant?: PortalEmailVariant;
  /** Az utasnak szóló példány (más megszólítás és szöveg, mint a foglalóé). */
  forTraveler?: boolean;
}

/** Cégenkénti, saját arculatú visszaigazoló e-mail. `null` = nincs egyedi sablon. */
export function buildPortalBookingConfirmation(
  portal: string,
  params: PortalBookingEmailParams
): { subject: string; html: string } | null {
  switch (portal) {
    case "catl":
      return buildCatlBookingConfirmationEmail(params);
    case "tama":
      return buildTama(params);
    case "ecoproinnovation":
      return buildEcoproInnovation(params);
    case "ecoprobm":
      return buildEcoproBm(params);
    case "schaefflermotion":
      return buildSchaefflerMotion(params);
    case "schaefflerdebrecen":
      return buildSchaefflerDebrecen(params);
    case "ibusz":
      return buildIbusz(params);
    default:
      return null;
  }
}
