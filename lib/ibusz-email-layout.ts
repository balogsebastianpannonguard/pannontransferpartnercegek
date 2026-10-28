import type { PortalBookingEmailParams } from "@/lib/portal-booking-emails";

/**
 * IBUSZ Hungary Kft. – saját arculatú e-mail sablonok (Pannon Transfer × IBUSZ).
 * Meghívó és üdvözlő levél: kétnyelvű (magyar + angol). Foglalás-visszaigazolás:
 * a foglaláskor használt felületi nyelven.
 */

export const IBUSZ_CONTACT = {
  name: "Balog Sebastian Máté",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

const BLUE = "#004A8D";
const BLUE_DARK = "#00386B";
const SKY = "#0C6BB5";
const ORANGE = "#F39200";
const ORANGE_SOFT = "#FFF3DF";
const BLUE_SOFT = "#E8F1FA";
const INK = "#0F2238";

export function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ibuszButton(href: string, label: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 26px 0;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="${BLUE}" style="border-radius:999px; background:linear-gradient(90deg,${BLUE},${SKY});">
<a href="${href}" style="display:inline-block; padding:16px 38px; font-size:14px; font-weight:700; color:#FFFFFF; text-decoration:none; letter-spacing:.4px; border-radius:999px;">${label} &rarr;</a>
</td></tr></table></td></tr></table>`;
}

export function ibuszInfoRow(
  left: { label: string; value: string },
  right: { label: string; value: string },
) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BLUE_SOFT}; border:1px solid #D3E3F3; border-radius:14px; margin-bottom:22px;"><tr>
<td width="50%" valign="top" style="padding:16px 20px; border-right:1px solid #D3E3F3;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#5D7692; margin-bottom:6px;">${esc(left.label)}</div>
<div style="font-size:14px; font-weight:700; color:${INK}; word-break:break-all;">${esc(left.value)}</div>
</td>
<td width="50%" valign="top" style="padding:16px 20px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#5D7692; margin-bottom:6px;">${esc(right.label)}</div>
<div style="font-size:14px; font-weight:700; color:${INK};">${esc(right.value)}</div>
</td></tr></table>`;
}

/** Hungarian block, a divider, then the English block. */
export function ibuszBilingual(huHtml: string, enHtml: string) {
  return `${huHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:30px 0 26px 0;"><tr>
<td style="border-top:1px solid #E1E8F0; font-size:0; line-height:0;" width="42%">&nbsp;</td>
<td align="center" style="padding:0 12px; white-space:nowrap;"><span style="display:inline-block; font-size:10px; font-weight:800; letter-spacing:2.2px; color:${ORANGE}; text-transform:uppercase;">English</span></td>
<td style="border-top:1px solid #E1E8F0; font-size:0; line-height:0;" width="42%">&nbsp;</td>
</tr></table>
${enHtml}`;
}

export function ibuszContactBlock(lang: "hu" | "en" | "both") {
  const title =
    lang === "hu" ? "Kapcsolattartó" : lang === "en" ? "Your contact" : "Kapcsolattartó · Your contact";
  const role = lang === "hu" ? "Fejlesztő, Pannon Transfer" : lang === "en" ? "Developer, Pannon Transfer" : "Fejlesztő / Developer, Pannon Transfer";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E1E8F0;"><tr><td style="padding-top:22px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#8497AD; margin-bottom:12px;">${title}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="46" valign="top" style="width:46px;"><div style="width:46px; height:46px; line-height:46px; text-align:center; background:${BLUE}; border-radius:23px; color:#FFFFFF; font-size:15px; font-weight:700; border:3px solid ${ORANGE_SOFT};">BS</div></td>
<td valign="top" style="padding-left:14px; font-size:13px; line-height:1.65; color:#4B5F76;">
<div style="font-size:15px; font-weight:700; color:${INK};">${IBUSZ_CONTACT.name}</div>
<div>${role}</div>
<div><a href="mailto:${IBUSZ_CONTACT.email}" style="color:${BLUE}; text-decoration:none;">${IBUSZ_CONTACT.email}</a></div>
<div><a href="tel:${IBUSZ_CONTACT.phoneHref}" style="color:${BLUE}; text-decoration:none;">${IBUSZ_CONTACT.phone}</a></div>
</td></tr></table>
</td></tr></table>`;
}

export type IbuszFooterKind = "invite" | "welcome" | "booking-hu" | "booking-en";

function footerHtml(kind: IbuszFooterKind, year: number) {
  const hu =
    kind === "invite"
      ? "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte. Ha nem kérte a meghívást, kérjük, hagyja figyelmen kívül."
      : "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte.";
  const en =
    kind === "invite"
      ? "This message was sent by the Pannon Transfer Komplex system. If you did not request this invitation, please disregard it."
      : "This message was sent by the Pannon Transfer Komplex system.";
  if (kind === "booking-hu") {
    return `${hu}<br>&copy; ${year} Pannon Transfer. Minden jog fenntartva.`;
  }
  if (kind === "booking-en") {
    return `${en}<br>&copy; ${year} Pannon Transfer. All rights reserved.`;
  }
  return `${hu}<br>${en}<br>&copy; ${year} Pannon Transfer. Minden jog fenntartva. / All rights reserved.`;
}

/**
 * IBUSZ arculatú levélkeret. `origin` – abszolút URL a logókhoz (üres: szöveges tartalék).
 */
export function ibuszEmailShell(opts: {
  origin: string;
  lang: "hu" | "en" | "both";
  preheader: string;
  eyebrow: string;
  headline: string;
  bodyHtml: string;
  topRight?: string;
  footerKind: IbuszFooterKind;
}) {
  const year = new Date().getFullYear();
  const origin = opts.origin.replace(/\/$/, "");
  const ptLogo = origin ? `${origin}/brand/pannon-transfer-logo.png` : "";
  const ibLogo = origin ? `${origin}/partners/ibusz/logo.png` : "";

  const logos =
    ptLogo && ibLogo
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr>
<td valign="middle" style="background:#FFFFFF; border-radius:10px; padding:9px 14px;"><img src="${ptLogo}" width="116" height="24" alt="Pannon Transfer" style="display:block; border:0; height:24px; width:116px;"></td>
<td width="12" style="color:rgba(255,255,255,.55); text-align:center; font-size:16px;">&times;</td>
<td valign="middle" style="background:#FFFFFF; border-radius:10px; padding:6px 14px;"><img src="${ibLogo}" width="68" height="24" alt="IBUSZ" style="display:block; border:0; height:24px; width:68px;"></td>
</tr></table>`
      : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr><td style="background:#FFFFFF; border-radius:10px; padding:9px 16px; font-size:16px; font-weight:900; color:${BLUE};">IBUSZ</td></tr></table>`;

  const htmlLang = opts.lang === "en" ? "en" : "hu";

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${esc(opts.headline.replace(/<[^>]+>/g, " ").replace(/&rsquo;/g, "’"))}</title>
</head>
<body style="margin:0; padding:0; background:#EDF2F8; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${esc(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#EDF2F8"><tr><td align="center" style="padding:34px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;">
<tr><td style="padding:0 8px 14px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:12px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase; color:#5D7692;">Pannon Transfer</td>
<td align="right" style="font-size:12px; color:#8497AD;">${esc(opts.topRight || "IBUSZ Hungary Kft.")}</td>
</tr></table>
</td></tr>
<tr><td style="background:#FFFFFF; border-radius:18px; overflow:hidden; box-shadow:0 2px 10px rgba(15,34,56,.08);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td bgcolor="${BLUE}" style="background:${BLUE}; background-image:linear-gradient(135deg,${BLUE_DARK} 0%,${BLUE} 55%,${SKY} 100%); padding:34px 40px 30px 40px; position:relative;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="top">
${logos}
<div style="font-size:11px; font-weight:700; letter-spacing:2.6px; text-transform:uppercase; color:#FFC24D; margin-bottom:8px;">${esc(opts.eyebrow)}</div>
<div style="font-family:Georgia, 'Times New Roman', serif; font-size:26px; line-height:1.28; color:#FFFFFF;">${opts.headline}</div>
</td>
<td width="86" valign="top" align="right" style="padding-left:12px;"><div style="width:76px; height:76px; border-radius:38px; background:${ORANGE}; background-image:radial-gradient(circle at 35% 35%,#FFC24D,${ORANGE} 70%); box-shadow:0 0 0 10px rgba(255,194,77,.18), 0 0 0 22px rgba(255,194,77,.09);"></div></td>
</tr></table>
</td></tr>
<tr><td height="5" style="height:5px; line-height:5px; font-size:0; background:${ORANGE};">&nbsp;</td></tr>
<tr><td style="padding:36px 40px 6px 40px;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:0 40px 36px 40px;">
${ibuszContactBlock(opts.lang)}
</td></tr>
<tr><td bgcolor="#F6F9FC" style="padding:22px 40px; border-top:1px solid #E1E8F0;">
<p style="margin:0; font-size:11px; line-height:1.7; color:#8497AD; text-align:center;">
${footerHtml(opts.footerKind, year)}
</p>
</td></tr>
</table></td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/* ------------------------------------------------------------------ */
/* Booking confirmation (single language)                              */
/* ------------------------------------------------------------------ */

type L = "hu" | "en";

const BOOKING_COPY: Record<
  L,
  {
    subject: (code: string) => string;
    preheader: (code: string, name: string, date: string) => string;
    eyebrow: string;
    headline: string;
    greeting: string;
    intro: (name: string) => string;
    ref: string;
    status: string;
    statusValue: string;
    transfer: string;
    passenger: string;
    pickupAt: string;
    from: string;
    to: string;
    flight: string;
    klass: string;
    pax: string;
    luggage: string;
    name: string;
    phone: string;
    email: string;
    second: string;
    secondPhone: string;
    notes: string;
    standard: string;
    executive: string;
    change: string;
  }
> = {
  hu: {
    subject: (c) => `Foglalás visszaigazolása - #${c} | IBUSZ × Pannon Transfer`,
    preheader: (c, n, d) => `A(z) #${c} foglalás beérkezett – ${n}, ${d}.`,
    eyebrow: "Foglalás visszaigazolása",
    headline: "Megkaptuk<br>transzferkérését",
    greeting: "Kedves Partnerünk!",
    intro: (n) =>
      `Köszönjük a foglalást. <strong style="color:${INK};">${esc(n)}</strong> transzferkérését megkaptuk, diszpécserünk hamarosan áttekinti és visszaigazolja.`,
    ref: "Foglalási kód",
    status: "Állapot",
    statusValue: "Beérkezett · visszaigazolásra vár",
    transfer: "Az út adatai",
    passenger: "Utas",
    pickupAt: "Felvétel ideje",
    from: "Felvételi hely",
    to: "Leadási hely",
    flight: "Járatszám",
    klass: "Szolgáltatási kategória",
    pax: "Utasok száma",
    luggage: "Csomagok száma",
    name: "Név",
    phone: "Telefon",
    email: "E-mail",
    second: "Második utas e-mail címe",
    secondPhone: "Második utas telefonszáma",
    notes: "Megjegyzés",
    standard: "Standard",
    executive: "Executive",
    change: "Módosítás vagy lemondás szükséges? Nyissa meg a <strong style=\"color:" + INK + ";\">Foglalásaim</strong> oldalt az IBUSZ portálon, vagy forduljon hozzánk az alábbi elérhetőségeken.",
  },
  en: {
    subject: (c) => `Booking confirmation - #${c} | IBUSZ × Pannon Transfer`,
    preheader: (c, n, d) => `Booking #${c} received – ${n}, ${d}.`,
    eyebrow: "Booking confirmation",
    headline: "We&rsquo;ve received<br>your transfer request",
    greeting: "Dear Partner,",
    intro: (n) =>
      `Thank you for your booking. We have received your transfer request for <strong style="color:${INK};">${esc(n)}</strong>. Our dispatch team will review it and confirm it with you shortly.`,
    ref: "Booking reference",
    status: "Status",
    statusValue: "Received · awaiting confirmation",
    transfer: "Transfer details",
    passenger: "Passenger",
    pickupAt: "Pick-up date & time",
    from: "Pick-up location",
    to: "Drop-off location",
    flight: "Flight number",
    klass: "Service class",
    pax: "Passengers",
    luggage: "Luggage",
    name: "Name",
    phone: "Phone",
    email: "Email",
    second: "2nd passenger email",
    secondPhone: "2nd passenger phone",
    notes: "Notes",
    standard: "Standard",
    executive: "Executive",
    change: "Need to change or cancel? Open <strong style=\"color:" + INK + ";\">My bookings</strong> in the IBUSZ portal, or contact us using the details below.",
  },
};

function formatPickup(l: L, ymd: string, time: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || "");
  if (!m) return `${ymd || "—"}  ${time || ""}`.trim();
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  const date = new Intl.DateTimeFormat(l === "hu" ? "hu-HU" : "en-GB", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(d);
  return `${date}, ${time}`;
}

export function buildBookingConfirmationEmail(
  p: PortalBookingEmailParams,
): { subject: string; html: string } | null {
  const l: L = p.language === "en" ? "en" : "hu";
  const c = BOOKING_COPY[l];
  const e = (v: string) => esc(v || "—");
  const row = (label: string, value: string) =>
    `<tr><td style="padding:11px 0; border-bottom:1px solid #EAF0F6; font-size:13px; color:#6B7F96; width:42%; vertical-align:top;">${esc(label)}</td><td style="padding:11px 0; border-bottom:1px solid #EAF0F6; font-size:14px; font-weight:600; color:${INK}; vertical-align:top;">${value}</td></tr>`;
  const sectionTitle = (t: string) =>
    `<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:${ORANGE}; margin:0 0 4px 0;">${esc(t)}</div>`;

  const bodyHtml = `
<p style="margin:0 0 14px 0; font-size:16px; font-weight:600; color:${INK};">${c.greeting}</p>
<p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#3C5068;">${c.intro(p.travelerName)}</p>
${ibuszInfoRow({ label: c.ref, value: "#" + p.bookingCode }, { label: c.status, value: c.statusValue })}

${sectionTitle(c.transfer)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(c.pickupAt, e(formatPickup(l, p.pickupDate, p.pickupTime)))}
${row(c.from, e(p.fromAddress))}
${row(c.to, e(p.toAddress))}
${p.flightNumber ? row(c.flight, e(p.flightNumber)) : ""}
${row(c.klass, p.transferType === "executive" ? c.executive : c.standard)}
${row(c.pax, String(p.travelers))}
${row(c.luggage, String(p.luggage))}
</table>

${sectionTitle(c.passenger)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(c.name, e(p.travelerName))}
${row(c.phone, e(p.travelerPhone))}
${row(c.email, e(p.travelerEmail))}
${p.secondTravelerEmail ? row(c.second, e(p.secondTravelerEmail)) : ""}
${p.secondTravelerPhone ? row(c.secondPhone, e(p.secondTravelerPhone)) : ""}
${p.comment ? row(c.notes, e(p.comment)) : ""}
</table>

<p style="margin:0 0 30px 0; font-size:13px; line-height:1.7; color:#6B7F96;">${c.change}</p>`;

  const html = ibuszEmailShell({
    origin: p.origin,
    lang: l,
    preheader: c.preheader(p.bookingCode, p.travelerName, p.pickupDate),
    eyebrow: c.eyebrow,
    headline: c.headline,
    bodyHtml,
    topRight: "IBUSZ Hungary Kft.",
    footerKind: l === "hu" ? "booking-hu" : "booking-en",
  });
  return { subject: c.subject(p.bookingCode), html };
}
