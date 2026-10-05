import type { FeedbackRecord } from "@/lib/feedback";

function esc(value: string | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

const CONCERN_LABEL: Record<string, string> = {
  booking: "Booking process",
  notifications: "Notifications",
  driver: "Driver",
  vehicle: "Vehicle",
  other: "Other",
};

const EASE_LABEL: Record<string, string> = {
  very_easy: "Very easy",
  easy: "Easy",
  neutral: "Neutral",
  difficult: "Difficult",
  very_difficult: "Very difficult",
};

/** A Location Supportnak (és bárkinek, aki a visszajelzést megkapja) küldött, semleges hangú összefoglaló. Angolul, mert az Emerson felé megy. */
export function buildFeedbackNotificationEmail(feedback: FeedbackRecord): string {
  const row = (label: string, value: string | undefined) =>
    value
      ? `<tr><td style="padding:8px 0;width:46%;font-size:12px;color:#7A7A7A;vertical-align:top;">${esc(label)}</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1A1A1A;">${value}</td></tr>`
      : "";

  const verdict = feedback.satisfied ? "Satisfied" : "Not satisfied";
  const verdictColor = feedback.satisfied ? "#15803D" : "#B45309";
  const concerns = feedback.concerns
    .map((c) => (c === "other" && feedback.concernOther ? `Other: ${esc(feedback.concernOther)}` : esc(CONCERN_LABEL[c] ?? c)))
    .join(", ");
  const route = [feedback.fromAddress, feedback.toAddress].filter(Boolean).map(esc).join(" → ");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF8F5;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td style="background:#0B1A2A;border-radius:12px 12px 0 0;padding:26px 32px;"><p style="margin:0;font-size:12px;font-weight:700;color:#C9A962;letter-spacing:4px;">PANNON TRANSFER</p></td></tr>
<tr><td style="height:3px;background:#C9A962;"></td></tr>
<tr><td style="background:#fff;border:1px solid #E8E3DA;border-top:0;padding:30px 32px;">
<p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#1A1A1A;">Passenger feedback received</p>
<p style="margin:0 0 20px;font-size:14px;color:#7A7A7A;line-height:1.6;">Transfer <strong>#${esc(feedback.bookingCode)}</strong> &middot; <span style="color:${verdictColor};font-weight:700;">${verdict}</span></p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #EEE9DF;">
${row("Passenger", esc(feedback.respondentName))}
${row("Date", esc([feedback.pickupDate, feedback.pickupTime].filter(Boolean).join(" ")))}
${row("Route", route)}
${row("Driver", esc(feedback.driverName))}
${row("Area of concern", feedback.satisfied ? undefined : concerns)}
${row("Experience", feedback.satisfied ? undefined : esc(feedback.experience))}
${row("Received the driver details e-mail 12-24 h before the trip", feedback.notificationReceived ? "Yes" : "No")}
${row("Ease of using the online booking platform", esc(EASE_LABEL[feedback.bookingEase] ?? feedback.bookingEase))}
${row("Difficulties described", esc(feedback.difficulties))}
</table>
</td></tr>
<tr><td style="background:#0B1A2A;border-radius:0 0 12px 12px;padding:18px 32px;text-align:center;"><p style="margin:0;font-size:10px;color:#7A7A7A;">&copy; Pannon Transfer Executive Travel</p></td></tr>
</table></td></tr></table></body></html>`;
}
