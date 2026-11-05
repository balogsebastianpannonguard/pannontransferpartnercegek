import type { PortalBookingEmailParams } from "@/lib/portal-booking-emails";

/**
 * A cégenkénti (nem NI) foglalási e-mailek változatai:
 *  - "confirmation" + forTraveler: a visszaigazolás utasnak szóló megszólítása és szövege,
 *  - "cancellation": lemondási értesítő (a foglalónak és az utasnak külön szöveggel).
 * A sablonok a saját arculatukat és adattábláikat megtartják, csak az itt visszaadott szövegeket cserélik.
 */

export type PortalEmailVariant = "confirmation" | "cancellation";
type VLang = "hu" | "en" | "ko";

export interface PortalEmailVariantCopy {
  subject: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  greeting: string;
  intro: string;
  statusValue: string;
  note: string;
}

export interface PortalEmailVariantOptions {
  /** A cég neve a tárgysorban és a szövegben (pl. "TAMA"). */
  brand: string;
  /** Az utas neve a sablon saját formázásában (már escape-elve vagy a sablon jelölésével kiemelve). */
  name: string;
  /** Kiemelés a sablon saját formájában (HTML <strong> vagy `**…**`). */
  bold: (text: string) => string;
  /** Sortörés a címsorban (alapból `<br>`; a sima szöveges címsorú sablonoknál szóköz). */
  br?: string;
  /** A sablon saját visszaigazoló tárgysora: a lemondásé ugyanebben az írásmódban készül (pl. „–”, „×”). */
  confirmSubject?: string;
}

const COPY = {
  hu: {
    travelerGreeting: "Kedves Utasunk!",
    travelerConfirmIntro: (brand: string, name: string) =>
      `A(z) ${brand} portálon transzfert foglaltak az Ön részére (${name}). Diszpécserünk hamarosan áttekinti és visszaigazolja. Az út adatait alább találja.`,
    travelerNote:
      "Kérdés vagy módosítás esetén keresse a foglalást rögzítő kollégáját, vagy minket az alábbi elérhetőségeken.",
    cancelSubject: (brand: string, code: string) => `Foglalás lemondva - #${code} | ${brand} x Pannon Transfer`,
    cancelPreheader: (code: string, name: string, date: string) => `A(z) #${code} foglalás lemondva – ${name}, ${date}.`,
    cancelEyebrow: "Foglalás lemondva",
    cancelHeadline: (br: string) => `A foglalást${br}lemondták`,
    cancelIntroBooker: (name: string, b: (s: string) => string) =>
      `${name} transzferfoglalását ${b("lemondták")}. Erre a foglalásra transzfer nem fog történni.`,
    cancelIntroTraveler: (name: string, b: (s: string) => string) =>
      `Tájékoztatjuk, hogy az Ön (${name}) alábbi transzferfoglalását ${b("lemondták")}. Erre a foglalásra transzfer nem fog történni.`,
    cancelStatus: "Lemondva",
    cancelNoteBooker: (brand: string) =>
      `Ha a lemondás tévedés volt, kérjük, adjon le új foglalást a(z) ${brand} portálon, vagy keressen minket az alábbi elérhetőségeken.`,
  },
  en: {
    travelerGreeting: "Dear Passenger,",
    travelerConfirmIntro: (brand: string, name: string) =>
      `A transfer has been booked for you (${name}) via the ${brand} portal. Our dispatch team will review and confirm it shortly. You will find the trip details below.`,
    travelerNote:
      "If you have any questions or need a change, please contact the colleague who made the booking, or reach us using the details below.",
    cancelSubject: (brand: string, code: string) => `Booking cancelled - #${code} | ${brand} x Pannon Transfer`,
    cancelPreheader: (code: string, name: string, date: string) => `Booking #${code} cancelled – ${name}, ${date}.`,
    cancelEyebrow: "Booking cancelled",
    cancelHeadline: (br: string) => `Your booking${br}has been cancelled`,
    cancelIntroBooker: (name: string, b: (s: string) => string) =>
      `The transfer booking for ${name} has been ${b("cancelled")}. No transfer will take place for this booking.`,
    cancelIntroTraveler: (name: string, b: (s: string) => string) =>
      `We confirm that your transfer booking below (${name}) has been ${b("cancelled")}. No transfer will take place for this booking.`,
    cancelStatus: "Cancelled",
    cancelNoteBooker: (brand: string) =>
      `If this cancellation was a mistake, please place a new booking in the ${brand} portal, or contact us using the details below.`,
  },
  ko: {
    travelerGreeting: "탑승자님께,",
    travelerConfirmIntro: (brand: string, name: string) =>
      `${brand} 포털을 통해 고객님(${name})의 이동이 예약되었습니다. 배차 담당자가 검토 후 곧 확정해 드리겠습니다. 이동 정보는 아래에서 확인하실 수 있습니다.`,
    travelerNote: "문의 사항이나 변경이 필요하시면 예약하신 담당자 또는 아래 연락처로 문의해 주세요.",
    cancelSubject: (brand: string, code: string) => `예약 취소 - #${code} | ${brand} x Pannon Transfer`,
    cancelPreheader: (code: string, name: string, date: string) => `예약 #${code}이(가) 취소되었습니다 – ${name}, ${date}.`,
    cancelEyebrow: "예약 취소",
    cancelHeadline: (br: string) => `예약이${br}취소되었습니다`,
    cancelIntroBooker: (name: string, b: (s: string) => string) =>
      `${name} 님의 이동 예약이 ${b("취소")}되었습니다. 이 예약에 대한 이동은 진행되지 않습니다.`,
    cancelIntroTraveler: (name: string, b: (s: string) => string) =>
      `고객님(${name})의 아래 이동 예약이 ${b("취소")}되었습니다. 이 예약에 대한 이동은 진행되지 않습니다.`,
    cancelStatus: "취소됨",
    cancelNoteBooker: (brand: string) =>
      `취소가 잘못된 경우 ${brand} 포털에서 새로 예약하시거나 아래 연락처로 문의해 주세요.`,
  },
} as const;

/** "Booking confirmation – #X | Brand × Pannon Transfer" → "Booking cancelled – #X | Brand × Pannon Transfer". */
function cancelSubjectFrom(confirmSubject: string | undefined, label: string): string | null {
  if (!confirmSubject) return null;
  const m = /^(.*?)(\s[-–]\s#.*)$/.exec(confirmSubject);
  return m ? `${label}${m[2]}` : null;
}

/**
 * A sablon alapszövegét felülíró mezők. Üres objektum = a sablon eredeti (foglalónak szóló) visszaigazolása.
 */
export function portalEmailVariant(
  params: PortalBookingEmailParams,
  lang: VLang,
  opts: PortalEmailVariantOptions,
): Partial<PortalEmailVariantCopy> {
  const t = COPY[lang];
  const forTraveler = params.forTraveler === true;
  const br = opts.br ?? "<br>";
  const name = opts.bold(opts.name);

  if (params.variant === "cancellation") {
    return {
      subject: cancelSubjectFrom(opts.confirmSubject, t.cancelEyebrow) ?? t.cancelSubject(opts.brand, params.bookingCode),
      preheader: t.cancelPreheader(params.bookingCode, params.travelerName, params.pickupDate),
      eyebrow: t.cancelEyebrow,
      headline: t.cancelHeadline(br),
      ...(forTraveler ? { greeting: t.travelerGreeting } : {}),
      intro: forTraveler ? t.cancelIntroTraveler(name, opts.bold) : t.cancelIntroBooker(name, opts.bold),
      statusValue: t.cancelStatus,
      note: forTraveler ? t.travelerNote : t.cancelNoteBooker(opts.brand),
    };
  }

  if (forTraveler) {
    return {
      greeting: t.travelerGreeting,
      intro: t.travelerConfirmIntro(opts.brand, name),
      note: t.travelerNote,
    };
  }

  return {};
}
