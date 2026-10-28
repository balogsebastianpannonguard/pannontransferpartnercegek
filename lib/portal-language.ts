export type PortalLanguage = "hu" | "en";

export function normalizePortalLanguage(value: unknown): PortalLanguage {
  return value === "en" ? "en" : "hu";
}

export type BookingLanguage = "hu" | "en" | "zh" | "ko";

/** Foglaláshoz mentett felületi nyelv (visszaigazoló e-mail nyelvéhez). */
export function normalizeBookingLanguage(value: unknown): BookingLanguage | undefined {
  return value === "hu" || value === "en" || value === "zh" || value === "ko" ? value : undefined;
}
