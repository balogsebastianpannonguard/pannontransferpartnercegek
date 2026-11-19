/**
 * További utasok egy foglaláson (a fő utason kívül).
 * A név kötelező; az e-mail, a telefonszám és az egyedi felvételi hely opcionális.
 * Ha nincs egyedi felvételi hely megadva, az utast a foglalás fő felvételi címén vesszük fel.
 */
export interface AdditionalPassenger {
  name: string;
  email?: string;
  phone?: string;
  /** Eltérő felvételi hely ennek az utasnak (üres = a foglalás fő felvételi címe). */
  pickupAddress?: string;
}

/** Egy foglaláson legfeljebb ennyi további utas adható meg (a legnagyobb járműkapacitás 9 fő). */
export const MAX_ADDITIONAL_PASSENGERS = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export interface SanitizedPassengers {
  passengers: AdditionalPassenger[];
  errors: string[];
}

/**
 * A kliensről érkező, nem megbízható listát tisztítja és ellenőrzi.
 * - teljesen üres sorokat (se név, se más adat) eldobja,
 * - név nélküli, de más adatot tartalmazó sorra hibát ad,
 * - érvénytelen e-mail címre hibát ad,
 * - a telefonszámból csak a számjegyeket tartja meg (mint a fő utasnál).
 */
export function sanitizeAdditionalPassengers(raw: unknown): SanitizedPassengers {
  const errors: string[] = [];
  const passengers: AdditionalPassenger[] = [];

  if (raw === undefined || raw === null) return { passengers, errors };
  if (!Array.isArray(raw)) {
    return { passengers, errors: ["A további utasok listája érvénytelen"] };
  }

  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const source = item as Record<string, unknown>;
    const name = clean(source.name, 200);
    const email = clean(source.email, 200);
    const phone = clean(source.phone, 40).replace(/[^\d]/g, "");
    const pickupAddress = clean(source.pickupAddress, 500);
    const position = index + 2; // a fő utas az 1.

    if (!name && !email && !phone && !pickupAddress) return;

    if (!name) {
      errors.push(`A(z) ${position}. utas nevének megadása kötelező`);
      return;
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      errors.push(`A(z) ${position}. utas e-mail címének formátuma érvénytelen`);
      return;
    }

    passengers.push({
      name,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(pickupAddress ? { pickupAddress } : {}),
    });
  });

  if (passengers.length > MAX_ADDITIONAL_PASSENGERS) {
    errors.push(`Legfeljebb ${MAX_ADDITIONAL_PASSENGERS} további utas adható meg`);
  }

  return { passengers, errors };
}

/** Egy már eltárolt foglalás additionalPassengers mezőjét biztonságosan listává alakítja (megjelenítéshez). */
export function readAdditionalPassengers(value: unknown): AdditionalPassenger[] {
  if (!Array.isArray(value)) return [];
  const result: AdditionalPassenger[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const source = item as Record<string, unknown>;
    const name = typeof source.name === "string" ? source.name.trim() : "";
    if (!name) continue;
    const email = typeof source.email === "string" ? source.email.trim() : "";
    const phone = typeof source.phone === "string" ? source.phone.trim() : "";
    const pickupAddress = typeof source.pickupAddress === "string" ? source.pickupAddress.trim() : "";
    result.push({
      name,
      ...(email ? { email } : {}),
      ...(phone ? { phone } : {}),
      ...(pickupAddress ? { pickupAddress } : {}),
    });
  }
  return result;
}
