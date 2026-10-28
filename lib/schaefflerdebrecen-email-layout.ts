import type { PortalBookingEmailParams } from "@/lib/portal-booking-emails";

/*
 * Schaeffler Debrecen – e-mail arculat: mélyzöld fejléc, Schaeffler-zöld gomb,
 * világos tartalom. A kétnyelvű (HU + EN) levelek magyarul kezdődnek.
 */

const GREEN = "#00893D";
const FOREST = "#0B3D2A";

export const SD_CONTACT = {
  name: "Balog Sebastian Máté",
  roleHu: "Fejlesztő, Pannon Transfer",
  roleEn: "Developer, Pannon Transfer",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function sdEmailButton(href: string, label: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 26px 0;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="${GREEN}" style="border-radius:8px;">
<a href="${href}" style="display:inline-block; padding:16px 40px; font-size:14px; font-weight:700; color:#FFFFFF; text-decoration:none; letter-spacing:.5px; border-radius:8px;">${label}</a>
</td></tr></table></td></tr></table>`;
}

export function sdEmailInfoRow(left: { label: string; value: string }, right: { label: string; value: string }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F8F4; border:1px solid #D9EBE0; border-radius:10px; margin-bottom:24px;"><tr>
<td width="58%" valign="top" style="padding:16px 18px; border-right:1px solid #D9EBE0;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#6F8C7C; margin-bottom:5px;">${esc(left.label)}</div>
<div style="font-size:14px; font-weight:600; color:#0E1A14; word-break:break-word; overflow-wrap:anywhere;">${esc(left.value)}</div>
</td>
<td width="42%" valign="top" style="padding:16px 18px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#6F8C7C; margin-bottom:5px;">${esc(right.label)}</div>
<div style="font-size:14px; font-weight:600; color:#0E1A14;">${esc(right.value)}</div>
</td></tr></table>`;
}

/** Kétnyelvű blokk: magyar rész, elválasztó, majd a második nyelv. */
export function sdBilingual(huHtml: string, enHtml: string, secondLabel = "English") {
  return `${huHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 22px 0;"><tr>
<td style="border-top:1px solid #E3E9E5; height:1px; font-size:0; line-height:0;">&nbsp;</td>
<td width="1" style="white-space:nowrap; padding:0 12px; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#8AA095;">${esc(secondLabel)}</td>
<td style="border-top:1px solid #E3E9E5; height:1px; font-size:0; line-height:0;">&nbsp;</td>
</tr></table>
${enHtml}`;
}

export function sdEmailShell(opts: {
  origin: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  bodyHtml: string;
  topRight?: string;
  lang?: "hu" | "en";
  bilingual?: boolean;
}) {
  const year = new Date().getFullYear();
  const origin = opts.origin.replace(/\/$/, "");
  const ptLogo = origin ? `${origin}/brand/pannon-transfer-logo.png` : "";
  const sdLogo = origin ? `${origin}/partners/schaefflerdebrecen/logo.png` : "";
  const bi = !!opts.bilingual;
  const lang = opts.lang || "hu";

  const logos =
    ptLogo && sdLogo
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr>
<td valign="middle" style="background:#FFFFFF; border-radius:8px; padding:9px 14px;"><img src="${ptLogo}" width="120" height="24" alt="Pannon Transfer" style="display:block; border:0; height:24px; width:120px;"></td>
<td width="14"></td>
<td valign="middle" style="background:#FFFFFF; border-radius:8px; padding:8px 14px;"><img src="${sdLogo}" width="96" height="24" alt="Schaeffler" style="display:block; border:0; height:24px; width:96px;"></td>
</tr></table>`
      : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr><td style="background:#FFFFFF; border-radius:8px; padding:9px 16px; font-size:15px; font-weight:800; color:${GREEN}; letter-spacing:1px;">SCHAEFFLER</td></tr></table>`;

  const contactTitle = bi ? "Kapcsolat · Your contact" : lang === "hu" ? "Kapcsolattartó" : "Your contact";
  const role = bi ? `${SD_CONTACT.roleHu} · ${SD_CONTACT.roleEn}` : lang === "hu" ? SD_CONTACT.roleHu : SD_CONTACT.roleEn;
  const footerHu =
    "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte. Ha nem Ön kérte, kérjük, hagyja figyelmen kívül.";
  const footerEn = "This message was sent by the Pannon Transfer Komplex system. If you did not expect it, please disregard it.";
  const rightsHu = "Minden jog fenntartva.";
  const rightsEn = "All rights reserved.";
  const footer = bi
    ? `${footerHu}<br>${footerEn}<br>&copy; ${year} Pannon Transfer. ${rightsHu} · ${rightsEn}`
    : lang === "hu"
      ? `${footerHu}<br>&copy; ${year} Pannon Transfer. ${rightsHu}`
      : `${footerEn}<br>&copy; ${year} Pannon Transfer. ${rightsEn}`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${esc(opts.headline.replace(/<[^>]+>/g, " ").replace(/&rsquo;/g, "’").replace(/&amp;/g, "&"))}</title>
</head>
<body style="margin:0; padding:0; background:#EEF3EF; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${esc(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#EEF3EF"><tr><td align="center" style="padding:34px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
<tr><td style="padding:0 6px 14px 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:12px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase; color:#5F7469;">Pannon Transfer</td>
<td align="right" style="font-size:12px; color:#8AA095;">${esc(opts.topRight || "Schaeffler Debrecen")}</td>
</tr></table>
</td></tr>
<tr><td style="background:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(11,61,42,.10);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td bgcolor="${FOREST}" style="padding:32px 40px 30px 40px; border-bottom:4px solid ${GREEN};">
${logos}
<div style="font-size:11px; font-weight:700; letter-spacing:2.6px; text-transform:uppercase; color:#7BE0A6; margin-bottom:9px;">${esc(opts.eyebrow)}</div>
<div style="font-size:25px; line-height:1.28; font-weight:600; color:#FFFFFF; letter-spacing:-0.2px;">${opts.headline}</div>
</td></tr>
<tr><td style="padding:36px 40px 8px 40px;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:0 40px 36px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E3E9E5;"><tr><td style="padding-top:22px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#8AA095; margin-bottom:12px;">${contactTitle}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="46" valign="top" style="width:46px;"><div style="width:46px; height:46px; line-height:46px; text-align:center; background:${FOREST}; border-radius:23px; color:#FFFFFF; font-size:16px; font-weight:700;">BS</div></td>
<td valign="top" style="padding-left:14px; font-size:13px; line-height:1.65; color:#4A5D53;">
<div style="font-size:15px; font-weight:700; color:#0E1A14;">Balog Sebastian M&aacute;t&eacute;</div>
<div>${esc(role)}</div>
<div><a href="mailto:${SD_CONTACT.email}" style="color:${GREEN}; text-decoration:none;">${SD_CONTACT.email}</a></div>
<div><a href="tel:${SD_CONTACT.phoneHref}" style="color:${GREEN}; text-decoration:none;">${SD_CONTACT.phone}</a></div>
</td></tr></table>
</td></tr></table>
</td></tr>
<tr><td bgcolor="#F5F8F6" style="padding:22px 40px; border-top:1px solid #E3E9E5;">
<p style="margin:0; font-size:11px; line-height:1.7; color:#8AA095; text-align:center;">
${footer}
</p>
</td></tr>
</table>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/* ---------------------------------------------------------------- welcome */

export function buildSdWelcomeEmail(opts: {
  origin: string;
  recipientEmail: string;
  loginLink: string;
  twoFactorRequired: boolean;
}) {
  const { recipientEmail, loginLink, twoFactorRequired } = opts;

  const hu = `
<p style="margin:0 0 14px 0; font-size:16px; font-weight:600; color:#0E1A14;">Kedves Partnerünk!</p>
<p style="margin:0 0 14px 0; font-size:15px; line-height:1.7; color:#334155;">
Jelszavát sikeresen beállította, a Schaeffler Debrecen dedikált portálon lévő fiókja mostantól aktív. Üdvözöljük!
</p>
<p style="margin:0 0 22px 0; font-size:15px; line-height:1.7; color:#334155;">
A belépés <strong>kizárólag az alábbi személyes linken keresztül</strong> lehetséges &mdash; nyilvános belépési oldal nincs.${
    twoFactorRequired
      ? " Mivel fiókjához kétfaktoros hitelesítés (2FA) tartozik, belépéskor a hitelesítő alkalmazás 6 számjegyű kódját is meg kell adnia."
      : ""
  }
</p>
${sdEmailButton(loginLink, "Belépés a portálra")}
${sdEmailInfoRow(
  { label: "Fiók", value: recipientEmail },
  { label: "Hozzáférés", value: twoFactorRequired ? "Dedikált partner · 2FA kötelező" : "Dedikált partner" }
)}
<p style="margin:0 0 22px 0; font-size:13px; line-height:1.7; color:#64748B;">
<strong style="color:#0E1A14;">Biztonság:</strong> a link személyes, 30 napig érvényes. Kérjük, ne ossza meg senkivel. Lejárta után új meghívót a Pannon Transfertől kérhet.
</p>`;

  const en = `
<p style="margin:0 0 14px 0; font-size:16px; font-weight:600; color:#0E1A14;">Dear Partner,</p>
<p style="margin:0 0 14px 0; font-size:15px; line-height:1.7; color:#334155;">
Your password has been set and your account on the dedicated Schaeffler Debrecen portal is now active. Welcome aboard.
</p>
<p style="margin:0 0 22px 0; font-size:15px; line-height:1.7; color:#334155;">
Access is available <strong>exclusively through your personal sign-in link</strong> &mdash; there is no public login page.${
    twoFactorRequired
      ? " Because two-factor authentication (2FA) is mandatory for your account, you will also be asked for the 6-digit code from your authenticator app."
      : ""
  }
</p>
<p style="margin:0 0 30px 0; font-size:13px; line-height:1.7; color:#64748B;">
<strong style="color:#0E1A14;">Security:</strong> this link is personal and valid for 30 days. Please do not forward or share it. After it expires, ask Pannon Transfer for a new invitation.
</p>`;

  const html = sdEmailShell({
    origin: opts.origin,
    preheader: "Fiókja aktív – használja személyes belépési linkjét. · Your account is active – use your personal sign-in link.",
    eyebrow: "Üdvözöljük · Welcome",
    headline: "A fiókja aktív<br><span style=\"font-weight:400; color:#BFE9D0;\">Your account is active</span>",
    bodyHtml: sdBilingual(hu, en),
    bilingual: true,
    topRight: "Schaeffler Debrecen · Dedikált portál",
  });

  const text = [
    "SCHAEFFLER DEBRECEN – DEDIKÁLT PORTÁL / DEDICATED PORTAL",
    "",
    "Kedves Partnerünk! A jelszava be van állítva, a fiókja aktív.",
    twoFactorRequired ? "A 2FA (kétfaktoros hitelesítés) kötelező a belépéshez." : "",
    "Belépés kizárólag a személyes linken keresztül:",
    loginLink,
    "Fiók: " + recipientEmail,
    "A link 30 napig érvényes, kérjük, ne ossza meg.",
    "",
    "Dear Partner, your password is set and your account is active.",
    twoFactorRequired ? "Two-factor authentication (2FA) is mandatory for sign-in." : "",
    "Sign in only via your personal link above (valid for 30 days, please do not share it).",
    "",
    `${SD_CONTACT.name} – ${SD_CONTACT.roleHu} · ${SD_CONTACT.roleEn}`,
    `${SD_CONTACT.email} · ${SD_CONTACT.phone}`,
    `© ${new Date().getFullYear()} Pannon Transfer. Minden jog fenntartva. / All rights reserved.`,
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");

  return { html, text };
}

/* ------------------------------------------------- booking confirmation */

function formatDate(iso: string, lang: "hu" | "en") {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return iso || "—";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat(lang === "hu" ? "hu-HU" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

const T = {
  hu: {
    dear: "Kedves Partnerünk!",
    intro: (name: string) =>
      `Köszönjük a foglalását. <strong style="color:#0E1A14;">${name}</strong> részére rögzítettük a transzferkérést. Diszpécserünk hamarosan átnézi, és visszaigazolja.`,
    ref: "Foglalási kód",
    status: "Állapot",
    statusVal: "Beérkezett · visszaigazolásra vár",
    transfer: "Transzfer adatai",
    pickupAt: "Felvétel ideje",
    from: "Felvételi hely",
    to: "Leadási hely",
    flight: "Járatszám",
    cls: "Szolgáltatási osztály",
    pax: "Utasok száma",
    bags: "Csomagok száma",
    passenger: "Utas",
    name: "Név",
    phone: "Telefon",
    email: "E-mail",
    email2: "2. utas e-mail-címe",
    phone2: "2. utas telefonszáma",
    notes: "Megjegyzés",
    change: "Módosítani vagy lemondani szeretne? Nyissa meg a <strong style=\"color:#0E1A14;\">Foglalásaim</strong> oldalt a portálon, vagy keresse a lenti elérhetőségeket.",
    eyebrow: "Foglalás visszaigazolása",
    headline: "Megkaptuk<br>a transzferkérését",
    subject: (c: string) => `Foglalás visszaigazolása – #${c} | Schaeffler Debrecen × Pannon Transfer`,
    pre: (c: string, n: string, d: string) => `A(z) #${c} foglalás beérkezett – ${n}, ${d}.`,
    top: "Schaeffler Debrecen · Dedikált portál",
  },
  en: {
    dear: "Dear Partner,",
    intro: (name: string) =>
      `Thank you for your booking. We have received your transfer request for <strong style="color:#0E1A14;">${name}</strong>. Our dispatch team will review it and confirm it with you shortly.`,
    ref: "Booking reference",
    status: "Status",
    statusVal: "Received · awaiting confirmation",
    transfer: "Transfer details",
    pickupAt: "Pick-up date & time",
    from: "Pick-up location",
    to: "Drop-off location",
    flight: "Flight number",
    cls: "Service class",
    pax: "Passengers",
    bags: "Luggage",
    passenger: "Passenger",
    name: "Name",
    phone: "Phone",
    email: "Email",
    email2: "2nd passenger email",
    phone2: "2nd passenger phone",
    notes: "Notes",
    change: "Need to change or cancel? Open <strong style=\"color:#0E1A14;\">My bookings</strong> in the portal, or contact us using the details below.",
    eyebrow: "Booking confirmation",
    headline: "We&rsquo;ve received<br>your transfer request",
    subject: (c: string) => `Booking confirmation – #${c} | Schaeffler Debrecen × Pannon Transfer`,
    pre: (c: string, n: string, d: string) => `Booking #${c} received – transfer for ${n} on ${d}.`,
    top: "Schaeffler Debrecen · Dedicated portal",
  },
} as const;

export function buildBookingConfirmationEmail(
  p: PortalBookingEmailParams
): { subject: string; html: string } {
  const lang: "hu" | "en" = p.language === "en" ? "en" : "hu";
  const tr = T[lang];
  const e = (v: string) => esc(v || "—");
  const row = (label: string, value: string) =>
    `<tr><td style="padding:11px 0; border-bottom:1px solid #EAF0EC; font-size:13px; color:#5F7469; width:42%; vertical-align:top;">${esc(label)}</td><td style="padding:11px 0; border-bottom:1px solid #EAF0EC; font-size:14px; font-weight:600; color:#0E1A14; vertical-align:top;">${value}</td></tr>`;
  const cap = (title: string) =>
    `<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#8AA095; margin:0 0 4px 0;">${esc(title)}</div>`;

  const classLabel = p.transferType === "executive" ? "Executive" : "Standard";
  const when = `${formatDate(p.pickupDate, lang)} · ${p.pickupTime}`;

  const bodyHtml = `
<p style="margin:0 0 16px 0; font-size:16px; font-weight:600; color:#0E1A14;">${tr.dear}</p>
<p style="margin:0 0 24px 0; font-size:15px; line-height:1.7; color:#334155;">${tr.intro(e(p.travelerName))}</p>
${sdEmailInfoRow({ label: tr.ref, value: "#" + p.bookingCode }, { label: tr.status, value: tr.statusVal })}

${cap(tr.transfer)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(tr.pickupAt, e(when))}
${row(tr.from, e(p.fromAddress))}
${row(tr.to, e(p.toAddress))}
${p.flightNumber ? row(tr.flight, e(p.flightNumber)) : ""}
${row(tr.cls, classLabel)}
${row(tr.pax, String(p.travelers))}
${row(tr.bags, String(p.luggage))}
</table>

${cap(tr.passenger)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(tr.name, e(p.travelerName))}
${row(tr.phone, e(p.travelerPhone))}
${row(tr.email, e(p.travelerEmail))}
${p.secondTravelerEmail ? row(tr.email2, e(p.secondTravelerEmail)) : ""}
${p.secondTravelerPhone ? row(tr.phone2, e(p.secondTravelerPhone)) : ""}
${p.comment ? row(tr.notes, e(p.comment)) : ""}
</table>

<p style="margin:0 0 28px 0; font-size:13px; line-height:1.7; color:#64748B;">${tr.change}</p>`;

  const html = sdEmailShell({
    origin: p.origin,
    preheader: tr.pre(p.bookingCode, p.travelerName, p.pickupDate),
    eyebrow: tr.eyebrow,
    headline: tr.headline,
    bodyHtml,
    lang,
    topRight: tr.top,
  });
  return { subject: tr.subject(p.bookingCode), html };
}
