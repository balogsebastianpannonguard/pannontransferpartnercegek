import { getDb } from "@/lib/mongodb";

export type FeedbackLanguage = "hu" | "en";

export const FEEDBACK_REQUESTS_COLLECTION = "feedback_requests";
export const FEEDBACKS_COLLECTION = "feedbacks";

export const CONCERN_AREAS = ["booking", "notifications", "driver", "vehicle", "other"] as const;
export type ConcernArea = (typeof CONCERN_AREAS)[number];

export const BOOKING_EASE_LEVELS = ["very_easy", "easy", "neutral", "difficult", "very_difficult"] as const;
export type BookingEase = (typeof BOOKING_EASE_LEVELS)[number];

/** A sofőr lezárásakor létrejövő, utasonkénti visszajelzés-kérés (a levélben lévő link tokenje). */
export interface FeedbackRequest {
  token: string;
  bookingId: string;
  bookingCode: string;
  portal?: string;
  companyName?: string;
  travelerName: string;
  email: string;
  language: FeedbackLanguage;
  pickupDate?: string;
  pickupTime?: string;
  fromAddress?: string;
  toAddress?: string;
  driverName?: string;
  vehicleName?: string;
  createdAt: number;
  submittedAt?: number;
}

/** A leadott visszajelzés – ezt olvassa a diszpécser felület „Visszajelzések” füle. */
export interface FeedbackAnswers {
  satisfied: boolean;
  concerns: ConcernArea[];
  concernOther?: string;
  experience?: string;
  notificationReceived: boolean;
  bookingEase: BookingEase;
  difficulties?: string;
}

export interface FeedbackRecord extends FeedbackAnswers {
  requestToken: string;
  bookingId: string;
  bookingCode: string;
  portal?: string;
  companyName?: string;
  respondentName: string;
  respondentEmail: string;
  language: FeedbackLanguage;
  pickupDate?: string;
  pickupTime?: string;
  fromAddress?: string;
  toAddress?: string;
  driverName?: string;
  vehicleName?: string;
  createdAt: number;
}

const MAX_TEXT = 2000;

function cleanText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, MAX_TEXT);
  return trimmed || undefined;
}

export type ParseResult = { ok: true; answers: FeedbackAnswers } | { ok: false; error: string };

/** Ellenőrzi a beküldött válaszokat a kérdőív logikája szerint (elégedett / nem elégedett ág + közös blokk). */
export function parseFeedbackAnswers(input: unknown): ParseResult {
  if (!input || typeof input !== "object") return { ok: false, error: "invalid_body" };
  const body = input as Record<string, unknown>;

  if (typeof body.satisfied !== "boolean") return { ok: false, error: "satisfied_required" };
  if (typeof body.notificationReceived !== "boolean") return { ok: false, error: "notification_required" };
  if (typeof body.bookingEase !== "string" || !(BOOKING_EASE_LEVELS as readonly string[]).includes(body.bookingEase)) {
    return { ok: false, error: "booking_ease_required" };
  }

  let concerns: ConcernArea[] = [];
  let concernOther: string | undefined;
  let experience: string | undefined;

  if (!body.satisfied) {
    const raw = Array.isArray(body.concerns) ? body.concerns : [];
    concerns = Array.from(new Set(raw.filter((c): c is ConcernArea => (CONCERN_AREAS as readonly string[]).includes(c as string))));
    if (concerns.length === 0) return { ok: false, error: "concerns_required" };
    if (concerns.includes("other")) {
      concernOther = cleanText(body.concernOther);
      if (!concernOther) return { ok: false, error: "concern_other_required" };
    }
    experience = cleanText(body.experience);
  }

  return {
    ok: true,
    answers: {
      satisfied: body.satisfied,
      concerns,
      concernOther,
      experience,
      notificationReceived: body.notificationReceived,
      bookingEase: body.bookingEase as BookingEase,
      difficulties: cleanText(body.difficulties),
    },
  };
}

export async function getFeedbackRequest(token: string): Promise<FeedbackRequest | null> {
  if (!/^[a-f0-9]{32,64}$/i.test(token)) return null;
  const db = await getDb();
  return (await db.collection<FeedbackRequest>(FEEDBACK_REQUESTS_COLLECTION).findOne({ token }, { projection: { _id: 0 } })) ?? null;
}
