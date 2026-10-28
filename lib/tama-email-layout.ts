import type { PortalBookingEmailParams } from "@/lib/portal-booking-emails";

/* ------------------------------------------------------------------ */
/*  TAMA arculatú, e-mail-kliens-biztos (táblázatos) sablonok           */
/*  olajzöld #4B6A0E · logózöld #7B9824 · krém #F6F2E4 · búza #C9A24D   */
/* ------------------------------------------------------------------ */

export const TAMA_CONTACT = {
  name: "Balog Sebastian Máté",
  roleHu: "Fejlesztő, Pannon Transfer",
  roleEn: "Developer, Pannon Transfer",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

type Lang = "hu" | "en";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const SERIF = "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,'Times New Roman',serif";
const SANS = "'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif";

export function tamaEmailButton(href: string, label: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 30px 0;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="#5F8016" style="border-radius:999px;">
<a href="${href}" style="display:inline-block; padding:16px 44px; font-family:${SANS}; font-size:14px; font-weight:700; color:#FFFFFF; text-decoration:none; letter-spacing:.5px; border-radius:999px;">${label}</a>
</td></tr></table></td></tr></table>`;
}

export function tamaEmailInfoRow(left: { label: string; value: string }, right: { label: string; value: string }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FBF8EC; border:1px solid #EEE5C6; border-radius:16px; margin-bottom:26px;"><tr>
<td width="50%" valign="top" style="padding:18px 20px; border-right:1px solid #EEE5C6;">
<div style="font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#8B917D; margin-bottom:6px;">${esc(left.label)}</div>
<div style="font-family:${SANS}; font-size:14px; font-weight:600; color:#26301B; word-break:break-all;">${esc(left.value)}</div>
</td>
<td width="50%" valign="top" style="padding:18px 20px;">
<div style="font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#8B917D; margin-bottom:6px;">${esc(right.label)}</div>
<div style="font-family:${SANS}; font-size:14px; font-weight:600; color:#26301B;">${esc(right.value)}</div>
</td></tr></table>`;
}

function contactBlock(lang: Lang, bilingual = false) {
  const label = bilingual ? "Az Ön kapcsolattartója · Your contact" : lang === "hu" ? "Az Ön kapcsolattartója" : "Your contact";
  const role = bilingual ? "Fejlesztő / Developer, Pannon Transfer" : lang === "hu" ? TAMA_CONTACT.roleHu : TAMA_CONTACT.roleEn;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #EEE5C6;"><tr><td style="padding-top:22px;">
<div style="font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#8B917D; margin-bottom:12px;">${label}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="46" valign="top" style="width:46px;"><div style="width:46px; height:46px; line-height:46px; text-align:center; background:#4B6A0E; border-radius:23px; color:#FFFFFF; font-family:${SANS}; font-size:16px; font-weight:700;">BS</div></td>
<td valign="top" style="padding-left:14px; font-family:${SANS}; font-size:13px; line-height:1.65; color:#5B6450;">
<div style="font-size:15px; font-weight:700; color:#26301B;">${esc(TAMA_CONTACT.name)}</div>
<div>${esc(role)}</div>
<div><a href="mailto:${TAMA_CONTACT.email}" style="color:#4B6A0E; text-decoration:none;">${TAMA_CONTACT.email}</a></div>
<div><a href="tel:${TAMA_CONTACT.phoneHref}" style="color:#4B6A0E; text-decoration:none;">${TAMA_CONTACT.phone}</a></div>
</td></tr></table>
</td></tr></table>`;
}

/**
 * TAMA arculatú levélkeret. `origin` a logók abszolút URL-jéhez kell;
 * `footerLines` HTML-sorok (nyelvenként), `contactLangs` a kapcsolat-blokk nyelve(i).
 */
export function tamaEmailShell(opts: {
  origin: string;
  lang: Lang;
  preheader: string;
  eyebrow: string;
  headline: string;
  bodyHtml: string;
  topRight?: string;
  footerLines: string[];
  rights: string;
  contactLangs?: Lang[];
}) {
  const origin = opts.origin.replace(/\/$/, "");
  const year = new Date().getFullYear();
  const ptLogo = origin ? `${origin}/brand/pannon-transfer-logo.png` : "";
  const tamaLogo = origin ? `${origin}/partners/tama/logo.png` : "";

  const logos =
    ptLogo && tamaLogo
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="background:#FFFFFF; border:1px solid #E4DDC7; border-radius:999px; padding:9px 16px;"><img src="${ptLogo}" width="116" height="24" alt="Pannon Transfer" style="display:block; border:0; height:24px; width:116px;"></td>
<td width="12"></td>
<td valign="middle" style="padding:0 4px;"><img src="${tamaLogo}" width="62" height="24" alt="TAMA Hungary Kft." style="display:block; border:0; height:24px; width:62px;"></td>
</tr></table>`
      : `<div style="font-family:${SANS}; font-size:16px; font-weight:800; color:#5F8016; letter-spacing:1px;">TAMA</div>`;

  const contacts = contactBlock(opts.lang, (opts.contactLangs?.length ?? 0) > 1);

  return `<!DOCTYPE html>
<html lang="${opts.lang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${esc(opts.headline.replace(/<[^>]+>/g, " ").replace(/&rsquo;/g, "’"))}</title>
</head>
<body style="margin:0; padding:0; background:#F1EDDD; font-family:${SANS}; -webkit-font-smoothing:antialiased;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${esc(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#F1EDDD"><tr><td align="center" style="padding:34px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;">
<tr><td style="background:#FFFFFF; border-radius:24px; overflow:hidden; box-shadow:0 2px 10px rgba(70,80,30,.10);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

<tr><td bgcolor="#FBF9F3" style="padding:22px 36px; border-bottom:1px solid #EEE5C6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle">${logos}</td>
<td valign="middle" align="right" style="font-family:${SANS}; font-size:11px; color:#8B917D; letter-spacing:.4px;">${esc(opts.topRight || "TAMA Hungary Kft.")}</td>
</tr></table>
</td></tr>

<tr><td bgcolor="#4B6A0E" style="padding:38px 40px 34px 40px; border-bottom:4px solid #C9A24D;">
<div style="font-family:${SANS}; font-size:11px; font-weight:700; letter-spacing:2.6px; text-transform:uppercase; color:#CFDDA0; margin-bottom:10px;">${esc(opts.eyebrow)}</div>
<div style="font-family:${SERIF}; font-size:28px; line-height:1.25; color:#FFFFFF;">${opts.headline}</div>
</td></tr>

<tr><td style="padding:36px 40px 6px 40px;">
${opts.bodyHtml}
</td></tr>

<tr><td style="padding:0 40px 36px 40px;">
${contacts}
</td></tr>

<tr><td bgcolor="#F6F2E4" style="padding:22px 40px; border-top:1px solid #EEE5C6;">
<p style="margin:0; font-family:${SANS}; font-size:11px; line-height:1.7; color:#8B917D; text-align:center;">
${opts.footerLines.join("<br>")}<br>
&copy; ${year} Pannon Transfer. ${esc(opts.rights)}
</p>
</td></tr>

</table></td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/* ------------------------------------------------------------------ */
/*  Üdvözlő e-mail jelszó beállítása után (kétnyelvű: magyar + angol)   */
/* ------------------------------------------------------------------ */

export function buildTamaWelcomeEmail(params: {
  origin: string;
  recipientEmail: string;
  loginLink: string;
  twoFactorRequired: boolean;
}) {
  const { origin, recipientEmail, loginLink, twoFactorRequired } = params;
  const p = (html: string, mb = 14) =>
    `<p style="margin:0 0 ${mb}px 0; font-family:${SANS}; font-size:15px; line-height:1.7; color:#3B4530;">${html}</p>`;

  const huBlock = `
${p("<strong style=\"color:#26301B;\">Kedves Partnerünk!</strong>", 12)}
${p("A jelszava sikeresen beállítva, a TAMA dedikált portálon lévő fiókja mostantól aktív. Üdvözöljük!")}
${p(`A belépés <strong>kizárólag az alábbi személyes linkkel</strong> lehetséges – nyilvános belépő oldal nincs.${
    twoFactorRequired
      ? " Mivel a fiókjához kétfaktoros hitelesítés (2FA) szükséges, belépéskor az Authenticator alkalmazás 6 számjegyű kódját is kérni fogjuk."
      : ""
  }`, 22)}
${tamaEmailButton(loginLink, "Belépés a TAMA portálra")}
${tamaEmailInfoRow(
  { label: "Az Ön fiókja", value: recipientEmail },
  { label: "Hozzáférés", value: twoFactorRequired ? "Dedikált partner · 2FA szükséges" : "Dedikált partner" },
)}
${p("<strong style=\"color:#26301B;\">Biztonság:</strong> a link személyes és 30 napig érvényes, kérjük, ne ossza meg senkivel. Lejárta után kérjen új meghívót a Pannon Transfertől.", 6)}`;

  const enBlock = `
${p("<strong style=\"color:#26301B;\">Dear Partner,</strong>", 12)}
${p("Your password has been set and your account on the dedicated TAMA portal is now active. Welcome aboard.")}
${p(`Access is available <strong>exclusively through your personal sign-in link</strong> above — there is no public login page.${
    twoFactorRequired
      ? " Because two-factor authentication (2FA) is mandatory for your account, you will also be asked for the 6-digit code from your authenticator app when you sign in."
      : ""
  }`, 14)}
${p("<strong style=\"color:#26301B;\">Security:</strong> this link is personal and valid for 30 days. Please do not forward or share it. After it expires, ask Pannon Transfer for a new invitation.", 6)}`;

  const divider = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 24px 0;"><tr>
<td style="border-top:1px solid #E4DDC7;" width="40%"></td>
<td align="center" style="padding:0 12px; font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:2px; color:#C9A24D; white-space:nowrap;">ENGLISH</td>
<td style="border-top:1px solid #E4DDC7;" width="40%"></td></tr></table>`;

  const html = tamaEmailShell({
    origin,
    lang: "hu",
    preheader: "A TAMA portál fiókja aktív. Használja a személyes belépési linkjét. / Your TAMA portal account is active.",
    eyebrow: "Fiók aktiválva · Account activated",
    headline: "Üdvözöljük a TAMA<br>foglalási portálon",
    bodyHtml: `${huBlock}${divider}${enBlock}`,
    topRight: "Welcome · Üdvözöljük",
    footerLines: [
      "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte.",
      "This message was sent by the Pannon Transfer Komplex system.",
    ],
    rights: "Minden jog fenntartva. / All rights reserved.",
    contactLangs: ["hu", "en"],
  });

  const year = new Date().getFullYear();
  const text = [
    "PANNON TRANSFER – TAMA DEDIKÁLT PORTÁL",
    "",
    "Kedves Partnerünk!",
    "A jelszava sikeresen beállítva, a TAMA portál fiókja mostantól aktív.",
    twoFactorRequired ? "A belépéshez kétfaktoros hitelesítés (2FA) szükséges." : "A fiókhoz nincs bekapcsolva 2FA.",
    "Belépés kizárólag az alábbi személyes linkkel lehetséges:",
    loginLink,
    "Fiók: " + recipientEmail,
    "A link 30 napig érvényes. Lejárta után kérjen új meghívót.",
    "",
    "----- ENGLISH -----",
    "Dear Partner,",
    "Your password has been set and your TAMA portal account is now active.",
    twoFactorRequired ? "Two-factor authentication (2FA) is mandatory for your account." : "Two-factor authentication is not enabled for your account.",
    "Access is only available through your personal sign-in link (above).",
    "The link is valid for 30 days. After it expires, please ask Pannon Transfer for a new invitation.",
    "",
    `${TAMA_CONTACT.name} – ${TAMA_CONTACT.roleEn}`,
    TAMA_CONTACT.email,
    TAMA_CONTACT.phone,
    "",
    "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte. / This message was sent by the Pannon Transfer Komplex system.",
    `© ${year} Pannon Transfer.`,
  ].join("\n");

  return { html, text };
}

/* ------------------------------------------------------------------ */
/*  Foglalás-visszaigazoló (a foglaláskor használt felület nyelvén)      */
/* ------------------------------------------------------------------ */

const CONFIRM_TEXT = {
  hu: {
    subject: (code: string) => `Foglalás visszaigazolása - #${code} | TAMA x Pannon Transfer`,
    preheader: (code: string, name: string, date: string) =>
      `A(z) #${code} foglalás megérkezett – ${name}, ${date}.`,
    eyebrow: "Foglalás visszaigazolása",
    headline: "Megkaptuk<br>transzferkérését",
    greet: "Kedves Partnerünk!",
    intro: (name: string) =>
      `Köszönjük a foglalást! <strong style="color:#26301B;">${name}</strong> transzferkérése megérkezett hozzánk. Diszpécserünk hamarosan átnézi, és visszaigazolja Önnek.`,
    ref: "Foglalási azonosító",
    status: "Állapot",
    statusValue: "Beérkezett · megerősítésre vár",
    sTransfer: "Transzfer részletei",
    pickupAt: "Felvétel időpontja",
    pickupLoc: "Felvételi hely",
    dropLoc: "Érkezési hely",
    flight: "Járatszám",
    cls: "Transzfer típusa",
    pax: "Utasok száma",
    bags: "Csomagok száma",
    sPassenger: "Utas",
    name: "Név",
    phone: "Telefon",
    email: "E-mail",
    email2: "2. utas e-mail címe",
    phone2: "2. utas telefonszáma",
    notes: "Megjegyzés",
    changeNote:
      "Módosítás vagy lemondás szükséges? Nyissa meg a TAMA portál <strong style=\"color:#26301B;\">Foglalásaim</strong> oldalát, vagy keresse kapcsolattartónkat az alábbi elérhetőségeken.",
    footer: ["Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte."],
    topRight: "Foglalás visszaigazolása",
  },
  en: {
    subject: (code: string) => `Booking confirmation - #${code} | TAMA x Pannon Transfer`,
    preheader: (code: string, name: string, date: string) =>
      `Booking #${code} received – transfer for ${name} on ${date}.`,
    eyebrow: "Booking confirmation",
    headline: "We&rsquo;ve received<br>your transfer request",
    greet: "Dear Partner,",
    intro: (name: string) =>
      `Thank you for your booking. We have received your transfer request for <strong style="color:#26301B;">${name}</strong>. Our dispatch team will review it and confirm it with you shortly.`,
    ref: "Booking reference",
    status: "Status",
    statusValue: "Received · awaiting confirmation",
    sTransfer: "Transfer details",
    pickupAt: "Pick-up date & time",
    pickupLoc: "Pick-up location",
    dropLoc: "Drop-off location",
    flight: "Flight number",
    cls: "Transfer type",
    pax: "Passengers",
    bags: "Luggage",
    sPassenger: "Passenger",
    name: "Name",
    phone: "Phone",
    email: "Email",
    email2: "2nd passenger email",
    phone2: "2nd passenger phone",
    notes: "Notes",
    changeNote:
      "Need to change or cancel? Open <strong style=\"color:#26301B;\">My bookings</strong> in the TAMA portal, or contact us using the details below.",
    footer: ["This message was sent by the Pannon Transfer Komplex system."],
    topRight: "Booking confirmation",
  },
} as const;

function longDate(dateStr: string, lang: Lang): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || "");
  if (!m) return dateStr || "—";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat(lang === "hu" ? "hu-HU" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** TAMA foglalás-visszaigazoló: csak alapadatok (ár, fizetési mód, követő link nélkül). */
export function buildBookingConfirmationEmail(
  params: PortalBookingEmailParams,
): { subject: string; html: string } | null {
  const lang: Lang = params.language === "en" ? "en" : "hu";
  const T = CONFIRM_TEXT[lang];
  const e = (v?: string) => esc(v && v.trim() ? v : "—");
  const row = (label: string, value: string) =>
    `<tr><td style="padding:11px 0; border-bottom:1px solid #EFE9D7; font-family:${SANS}; font-size:13px; color:#8B917D; width:40%; vertical-align:top;">${esc(label)}</td><td style="padding:11px 0; border-bottom:1px solid #EFE9D7; font-family:${SANS}; font-size:14px; font-weight:600; color:#26301B; vertical-align:top;">${value}</td></tr>`;
  const heading = (t: string) =>
    `<div style="font-family:${SANS}; font-size:10px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:#C9A24D; margin:0 0 2px 0;">${esc(t)}</div>`;

  const classLabel = params.transferType === "executive" ? "Executive" : "Standard";
  const bodyHtml = `
<p style="margin:0 0 12px 0; font-family:${SANS}; font-size:16px; font-weight:700; color:#26301B;">${T.greet}</p>
<p style="margin:0 0 24px 0; font-family:${SANS}; font-size:15px; line-height:1.7; color:#3B4530;">${T.intro(esc(params.travelerName))}</p>
${tamaEmailInfoRow({ label: T.ref, value: "#" + params.bookingCode }, { label: T.status, value: T.statusValue })}

${heading(T.sTransfer)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(T.pickupAt, e(`${longDate(params.pickupDate, lang)} · ${params.pickupTime}`))}
${row(T.pickupLoc, e(params.fromAddress))}
${row(T.dropLoc, e(params.toAddress))}
${params.flightNumber ? row(T.flight, e(params.flightNumber)) : ""}
${row(T.cls, classLabel)}
${row(T.pax, String(params.travelers))}
${row(T.bags, String(params.luggage))}
</table>

${heading(T.sPassenger)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(T.name, e(params.travelerName))}
${row(T.phone, e(params.travelerPhone))}
${row(T.email, e(params.travelerEmail))}
${params.secondTravelerEmail ? row(T.email2, e(params.secondTravelerEmail)) : ""}
${params.secondTravelerPhone ? row(T.phone2, e(params.secondTravelerPhone)) : ""}
${params.comment ? row(T.notes, e(params.comment)) : ""}
</table>

<p style="margin:0 0 28px 0; font-family:${SANS}; font-size:13px; line-height:1.7; color:#6B705C;">${T.changeNote}</p>`;

  const html = tamaEmailShell({
    origin: params.origin,
    lang,
    preheader: T.preheader(params.bookingCode, params.travelerName, params.pickupDate),
    eyebrow: T.eyebrow,
    headline: T.headline,
    bodyHtml,
    topRight: T.topRight,
    footerLines: [...T.footer],
    rights: lang === "hu" ? "Minden jog fenntartva." : "All rights reserved.",
  });

  return { subject: T.subject(params.bookingCode), html };
}
