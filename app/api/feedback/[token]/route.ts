import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendEmail } from "@/lib/email";
import { buildFeedbackNotificationEmail } from "@/lib/feedback-email";
import { LOCATION_SUPPORT_EMAIL } from "@/lib/ni-notifications";
import {
  FEEDBACKS_COLLECTION,
  FEEDBACK_REQUESTS_COLLECTION,
  getFeedbackRequest,
  parseFeedbackAnswers,
  type FeedbackRecord,
  type FeedbackRequest,
} from "@/lib/feedback";

export const dynamic = "force-dynamic";

/** A kérdőív megjelenítéséhez szükséges (nem érzékeny) adatok. */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const feedbackRequest = await getFeedbackRequest(token);
  if (!feedbackRequest) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    request: {
      bookingCode: feedbackRequest.bookingCode,
      travelerName: feedbackRequest.travelerName,
      language: feedbackRequest.language,
      submitted: Boolean(feedbackRequest.submittedAt),
    },
  });
}

/** Egy link = egy kitöltés. A válasz mentődik, a Location Support pedig értesítést kap. */
export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const feedbackRequest = await getFeedbackRequest(token);
    if (!feedbackRequest) {
      return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
    }

    const parsed = parseFeedbackAnswers(await request.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
    }

    const db = await getDb();
    const now = Date.now();

    // Atomikus "lefoglalás": két párhuzamos beküldésből csak az egyik mehet át
    const claimed = await db
      .collection<FeedbackRequest>(FEEDBACK_REQUESTS_COLLECTION)
      .findOneAndUpdate({ token, submittedAt: { $exists: false } }, { $set: { submittedAt: now } });
    if (!claimed) {
      return NextResponse.json({ success: false, error: "already_submitted" }, { status: 409 });
    }

    const record: FeedbackRecord = {
      ...parsed.answers,
      requestToken: token,
      bookingId: feedbackRequest.bookingId,
      bookingCode: feedbackRequest.bookingCode,
      portal: feedbackRequest.portal,
      companyName: feedbackRequest.companyName,
      respondentName: feedbackRequest.travelerName,
      respondentEmail: feedbackRequest.email,
      language: feedbackRequest.language,
      pickupDate: feedbackRequest.pickupDate,
      pickupTime: feedbackRequest.pickupTime,
      fromAddress: feedbackRequest.fromAddress,
      toAddress: feedbackRequest.toAddress,
      driverName: feedbackRequest.driverName,
      vehicleName: feedbackRequest.vehicleName,
      createdAt: now,
    };

    try {
      await db.collection(FEEDBACKS_COLLECTION).insertOne({ ...record });
    } catch (error) {
      await db
        .collection<FeedbackRequest>(FEEDBACK_REQUESTS_COLLECTION)
        .updateOne({ token }, { $unset: { submittedAt: "" } });
      throw error;
    }

    // A Location Support is megkapja a visszajelzést; a küldés hibája nem akadályozza a mentést
    try {
      const result = await sendEmail({
        to: LOCATION_SUPPORT_EMAIL,
        subject: `Passenger feedback – #${record.bookingCode} – ${record.satisfied ? "Satisfied" : "Not satisfied"}`,
        html: buildFeedbackNotificationEmail(record),
      });
      if (!result.success) console.error("[feedback] Location Support notification failed", result.error);
    } catch (error) {
      console.error("[feedback] Location Support notification threw", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[feedback] submit failed", error);
    return NextResponse.json({ success: false, error: "server_error" }, { status: 500 });
  }
}
