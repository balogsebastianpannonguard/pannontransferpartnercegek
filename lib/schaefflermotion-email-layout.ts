import type { PortalBookingEmailParams } from "@/lib/portal-booking-emails";

/**
 * Schaeffler Motion e-mail design: graphite header with Schaeffler-green signal bar,
 * monospace technical labels, dark contact footer. All markup is table based and inline
 * styled so it renders consistently in Outlook, Gmail and Apple Mail.
 */

export const MX_CONTACT = {
  name: "Balog Sebastian Máté",
  roleHu: "Fejlesztő, Pannon Transfer",
  roleEn: "Developer, Pannon Transfer",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

export type MxMailLang = "hu" | "en";

const GREEN = "#00893D";
const NEON = "#3DDC84";
const GRAPHITE = "#0E1412";
const MONO = "'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace";

export function mxEsc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function mxMailButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 26px 0;"><tr>
<td bgcolor="${GREEN}" style="border-radius:5px;">
<a href="${href}" style="display:inline-block; padding:16px 36px; font-family:${MONO}; font-size:12px; font-weight:700; color:#FFFFFF; text-decoration:none; letter-spacing:2px; text-transform:uppercase; border-radius:5px;">${label} &rarr;</a>
</td></tr></table>`;
}

/** Two "spec" cells (label + value) side by side. */
export function mxMailSpecPair(left: { label: string; value: string }, right: { label: string; value: string }) {
  const cell = (c: { label: string; value: string }, border: boolean) => `<td width="50%" valign="top" style="padding:16px 18px;${border ? " border-right:1px solid #DDE5E0;" : ""}">
<div style="font-family:${MONO}; font-size:10px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; color:#7A8A82; margin-bottom:6px;">${mxEsc(c.label)}</div>
<div style="font-size:14px; font-weight:700; color:${GRAPHITE}; word-break:break-word; overflow-wrap:anywhere;">${mxEsc(c.value)}</div>
</td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F8F5; border:1px solid #DDE5E0; border-left:4px solid ${GREEN}; border-radius:6px; margin-bottom:24px;"><tr>${cell(left, true)}${cell(right, false)}</tr></table>`;
}

/** Group heading + key/value rows. */
export function mxMailRows(title: string, rows: [string, string][]) {
  const body = rows
    .filter(([, v]) => v !== "")
    .map(
      ([k, v]) => `<tr><td style="padding:10px 0; border-bottom:1px solid #E7EDE9; font-size:13px; color:#6B7B73; width:40%; vertical-align:top;">${mxEsc(k)}</td><td style="padding:10px 0; border-bottom:1px solid #E7EDE9; font-size:14px; font-weight:600; color:${GRAPHITE}; vertical-align:top;">${v}</td></tr>`,
    )
    .join("");
  return `<div style="font-family:${MONO}; font-size:10px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:${GREEN}; margin:0 0 4px 0;">${mxEsc(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">${body}</table>`;
}

export function mxMailPara(html: string, opts?: { size?: number; color?: string; mb?: number; weight?: number }) {
  return `<p style="margin:0 0 ${opts?.mb ?? 16}px 0; font-size:${opts?.size ?? 15}px; line-height:1.7; color:${opts?.color ?? "#33423B"};${opts?.weight ? ` font-weight:${opts.weight};` : ""}">${html}</p>`;
}

/** Hungarian block, divider, English block. */
export function mxMailBilingual(hu: string, en: string, enLabel = "English") {
  return `${hu}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 26px 0;"><tr>
<td style="border-top:1px solid #DDE5E0; font-size:0; line-height:0;" width="42%">&nbsp;</td>
<td align="center" style="padding:0 12px; font-family:${MONO}; font-size:10px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase; color:#7A8A82; white-space:nowrap;">${mxEsc(enLabel)}</td>
<td style="border-top:1px solid #DDE5E0; font-size:0; line-height:0;" width="42%">&nbsp;</td>
</tr></table>
${en}`;
}

export function mxMailFooterNote(lang: MxMailLang | "both", invite = false) {
  const hu = invite
    ? "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte. Ha nem kérte a meghívást, kérjük, hagyja figyelmen kívül."
    : "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte.";
  const en = invite
    ? "This message was sent by the Pannon Transfer Komplex system. If you did not request this invitation, please disregard it."
    : "This message was sent by the Pannon Transfer Komplex system.";
  const year = new Date().getFullYear();
  const rights = lang === "hu" ? "Minden jog fenntartva." : lang === "en" ? "All rights reserved." : "Minden jog fenntartva. / All rights reserved.";
  const text = lang === "hu" ? hu : lang === "en" ? en : `${hu}<br>${en}`;
  return `${text}<br>&copy; ${year} Pannon Transfer. ${rights}`;
}

export function mxMailShell(opts: {
  origin: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  bodyHtml: string;
  lang: MxMailLang | "both";
  invite?: boolean;
  topRight?: string;
}) {
  const origin = (opts.origin || "").replace(/\/$/, "");
  const ptLogo = origin ? `${origin}/brand/pannon-transfer-logo.png` : "";
  const schLogo = origin ? `${origin}/partners/schaefflermotion/logo.png` : "";

  const logos =
    ptLogo && schLogo
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr>
<td valign="middle" style="background:#FFFFFF; border-radius:5px; padding:9px 14px;"><img src="${ptLogo}" width="120" height="24" alt="Pannon Transfer" style="display:block; border:0; height:24px; width:120px;"></td>
<td width="12"></td>
<td valign="middle" style="background:#FFFFFF; border-radius:5px; padding:11px 14px;"><img src="${schLogo}" width="104" height="26" alt="Schaeffler" style="display:block; border:0; height:26px; width:104px;"></td>
</tr></table>`
      : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr><td style="background:#FFFFFF; border-radius:5px; padding:10px 16px; font-size:15px; font-weight:800; color:${GREEN}; letter-spacing:1px;">SCHAEFFLER</td></tr></table>`;

  const contactRole = opts.lang === "en" ? MX_CONTACT.roleEn : opts.lang === "hu" ? MX_CONTACT.roleHu : "Fejlesztő / Developer, Pannon Transfer";
  const contactTitle = opts.lang === "en" ? "Your contact" : opts.lang === "hu" ? "Kapcsolattartó" : "Kapcsolattartó / Your contact";
  const pageLang = opts.lang === "en" ? "en" : "hu";

  return `<!DOCTYPE html>
<html lang="${pageLang}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${mxEsc(opts.headline.replace(/<[^>]+>/g, " ").replace(/&rsquo;/g, "’"))}</title>
</head>
<body style="margin:0; padding:0; background:#E9EEEA; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${mxEsc(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#E9EEEA"><tr><td align="center" style="padding:34px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;">

<tr><td style="padding:0 2px 12px 2px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${MONO}; font-size:11px; font-weight:700; letter-spacing:2.6px; text-transform:uppercase; color:#52645B;">Pannon Transfer</td>
<td align="right" style="font-family:${MONO}; font-size:11px; letter-spacing:1.6px; text-transform:uppercase; color:#7A8A82;">${mxEsc(opts.topRight || "Schaeffler Motion")}</td>
</tr></table>
</td></tr>

<tr><td style="background:#FFFFFF; border-radius:10px; overflow:hidden; box-shadow:0 2px 6px rgba(14,20,18,.10);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">

<tr><td height="6" style="background:${GREEN}; font-size:0; line-height:0;">&nbsp;</td></tr>
<tr><td bgcolor="${GRAPHITE}" style="padding:34px 40px 34px 40px;">
${logos}
<div style="font-family:${MONO}; font-size:11px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:${NEON}; margin-bottom:12px;">${mxEsc(opts.eyebrow)}</div>
<div style="font-family:Georgia, 'Times New Roman', serif; font-size:26px; line-height:1.28; color:#FFFFFF;">${opts.headline}</div>
</td></tr>
<tr><td height="3" style="background:linear-gradient(90deg,${GREEN},${NEON}); background-color:${GREEN}; font-size:0; line-height:0;">&nbsp;</td></tr>

<tr><td style="padding:38px 40px 14px 40px;">
${opts.bodyHtml}
</td></tr>

<tr><td bgcolor="${GRAPHITE}" style="padding:28px 40px;">
<div style="font-family:${MONO}; font-size:10px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase; color:${NEON}; margin-bottom:14px;">${contactTitle}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="44" valign="top"><div style="width:44px; height:44px; line-height:44px; text-align:center; background:${GREEN}; border-radius:5px; color:#FFFFFF; font-size:15px; font-weight:800;">BS</div></td>
<td valign="top" style="padding-left:14px; font-size:13px; line-height:1.65; color:#AEBBB4;">
<div style="font-size:15px; font-weight:700; color:#FFFFFF;">${MX_CONTACT.name}</div>
<div>${contactRole}</div>
<div><a href="mailto:${MX_CONTACT.email}" style="color:${NEON}; text-decoration:none;">${MX_CONTACT.email}</a> &nbsp;·&nbsp; <a href="tel:${MX_CONTACT.phoneHref}" style="color:${NEON}; text-decoration:none;">${MX_CONTACT.phone}</a></div>
</td></tr></table>
</td></tr>
<tr><td bgcolor="#0A0F0D" style="padding:20px 40px;">
<p style="margin:0; font-size:11px; line-height:1.7; color:#6B7B73; text-align:center;">${mxMailFooterNote(opts.lang, opts.invite)}</p>
</td></tr>

</table>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/* ───────────────────────── Booking confirmation (single language) ───────────────────────── */

const CONF = {
  hu: {
    subject: (code: string) => `Foglalás visszaigazolása – #${code} | Schaeffler Motion × Pannon Transfer`,
    preheader: (code: string, name: string, date: string) => `A(z) #${code} foglalás megérkezett – ${name}, ${date}.`,
    eyebrow: "Foglalás visszaigazolása",
    headline: "Megkaptuk<br>a transzferkérését",
    dear: "Tisztelt Partnerünk!",
    intro: (name: string) =>
      `Köszönjük a foglalást. A(z) <strong style="color:#0E1412;">${name}</strong> részére leadott transzferkérést megkaptuk, a diszpécserünk hamarosan átnézi és visszaigazolja.`,
    ref: "Foglalási kód",
    status: "Állapot",
    statusValue: "Beérkezett · megerősítésre vár",
    detailsTitle: "Transzfer adatai",
    when: "Felvétel dátuma és ideje",
    from: "Felvételi hely",
    to: "Leadási hely",
    flight: "Járatszám",
    cls: "Szolgáltatási osztály",
    pax: "Utasok száma",
    bags: "Csomagok száma",
    paxTitle: "Utas",
    pName: "Név",
    pPhone: "Telefon",
    pEmail: "E-mail",
    p2Email: "2. utas e-mail címe",
    p2Phone: "2. utas telefonszáma",
    notes: "Megjegyzés",
    foot: "Módosítani vagy lemondani szeretne? Nyissa meg a <strong style=\"color:#0E1412;\">Foglalásaim</strong> oldalt a Schaeffler Motion portálon, vagy keressen minket az alábbi elérhetőségeken.",
  },
  en: {
    subject: (code: string) => `Booking confirmation – #${code} | Schaeffler Motion × Pannon Transfer`,
    preheader: (code: string, name: string, date: string) => `Booking #${code} received – ${name}, ${date}.`,
    eyebrow: "Booking confirmation",
    headline: "We&rsquo;ve received<br>your transfer request",
    dear: "Dear Partner,",
    intro: (name: string) =>
      `Thank you for your booking. We have received your transfer request for <strong style="color:#0E1412;">${name}</strong>. Our dispatch team will review it and confirm it with you shortly.`,
    ref: "Booking reference",
    status: "Status",
    statusValue: "Received · awaiting confirmation",
    detailsTitle: "Transfer details",
    when: "Pick-up date & time",
    from: "Pick-up location",
    to: "Drop-off location",
    flight: "Flight number",
    cls: "Service class",
    pax: "Passengers",
    bags: "Luggage",
    paxTitle: "Passenger",
    pName: "Name",
    pPhone: "Phone",
    pEmail: "Email",
    p2Email: "2nd passenger email",
    p2Phone: "2nd passenger phone",
    notes: "Notes",
    foot: "Need to change or cancel? Open <strong style=\"color:#0E1412;\">My bookings</strong> in the Schaeffler Motion portal, or contact us using the details below.",
  },
} as const;

export function buildBookingConfirmationEmail(p: PortalBookingEmailParams): { subject: string; html: string } | null {
  const lang: MxMailLang = p.language === "en" ? "en" : "hu";
  const c = CONF[lang];
  const e = (v?: string) => mxEsc(v || "") || "—";

  const body =
    mxMailPara(c.dear, { size: 16, weight: 600, color: "#0E1412" }) +
    mxMailPara(c.intro(e(p.travelerName)), { mb: 24 }) +
    mxMailSpecPair({ label: c.ref, value: `#${p.bookingCode}` }, { label: c.status, value: c.statusValue }) +
    mxMailRows(c.detailsTitle, [
      [c.when, e(`${p.pickupDate}  ${p.pickupTime}`)],
      [c.from, e(p.fromAddress)],
      [c.to, e(p.toAddress)],
      [c.flight, p.flightNumber ? e(p.flightNumber) : ""],
      [c.cls, p.transferType === "executive" ? "Executive" : "Standard"],
      [c.pax, String(p.travelers)],
      [c.bags, String(p.luggage)],
    ]) +
    mxMailRows(c.paxTitle, [
      [c.pName, e(p.travelerName)],
      [c.pPhone, e(p.travelerPhone)],
      [c.pEmail, e(p.travelerEmail)],
      [c.p2Email, p.secondTravelerEmail ? e(p.secondTravelerEmail) : ""],
      [c.p2Phone, p.secondTravelerPhone ? e(p.secondTravelerPhone) : ""],
      [c.notes, p.comment ? e(p.comment) : ""],
    ]) +
    mxMailPara(c.foot, { size: 13, color: "#6B7B73", mb: 26 });

  return {
    subject: c.subject(p.bookingCode),
    html: mxMailShell({
      origin: p.origin,
      preheader: c.preheader(p.bookingCode, p.travelerName, p.pickupDate),
      eyebrow: c.eyebrow,
      headline: c.headline,
      bodyHtml: body,
      lang,
      topRight: "Schaeffler Motion",
    }),
  };
}

/* ───────────────────────── Welcome email after password setup (bilingual) ───────────────────────── */

export function buildWelcomeEmail(params: { origin: string; email: string; loginLink: string; twoFactorRequired: boolean }) {
  const { origin, email, loginLink, twoFactorRequired } = params;

  const hu =
    mxMailPara("Tisztelt Partnerünk!", { size: 16, weight: 600, color: "#0E1412" }) +
    mxMailPara("A jelszava beállítva, a dedikált Schaeffler Motion portálon lévő fiókja aktív. Üdvözöljük!") +
    mxMailPara(
      `A belépés <strong style="color:#0E1412;">kizárólag az alábbi személyes linken</strong> keresztül lehetséges, nyilvános belépési oldal nincs.${
        twoFactorRequired
          ? " Mivel a fiókjához kétfaktoros hitelesítés kötelező, belépéskor a hitelesítő alkalmazás 6 számjegyű kódját is kérni fogjuk."
          : ""
      }`,
      { mb: 22 },
    ) +
    mxMailButton(loginLink, "Belépés a portálra") +
    mxMailSpecPair(
      { label: "Fiók", value: email },
      { label: "Hozzáférés", value: twoFactorRequired ? "Dedikált partner · 2FA kötelező" : "Dedikált partner" },
    ) +
    mxMailPara(
      '<strong style="color:#0E1412;">Biztonság:</strong> ez a link személyes és 30 napig érvényes. Kérjük, ne továbbítsa és ne ossza meg senkivel. Lejárat után kérjen új meghívót a Pannon Transfertől.',
      { size: 13, color: "#6B7B73", mb: 8 },
    );

  const en =
    mxMailPara("Dear Partner,", { size: 16, weight: 600, color: "#0E1412" }) +
    mxMailPara("Your password has been set and your account on the dedicated Schaeffler Motion portal is now active. Welcome aboard.") +
    mxMailPara(
      `Access is available <strong style="color:#0E1412;">exclusively through your personal sign-in link</strong> above &mdash; there is no public login page.${
        twoFactorRequired
          ? " Because two-factor authentication is mandatory for your account, you will also be asked for the 6-digit code from your authenticator app when you sign in."
          : ""
      }`,
      { mb: 22 },
    ) +
    mxMailPara(
      '<strong style="color:#0E1412;">Security:</strong> this link is personal and valid for 30 days. Please do not forward or share it. After it expires, ask Pannon Transfer for a new invitation.',
      { size: 13, color: "#6B7B73", mb: 26 },
    );

  const html = mxMailShell({
    origin,
    preheader: "A Schaeffler Motion portálfiókja aktív. / Your Schaeffler Motion portal account is active.",
    eyebrow: "Fiók aktiválva · Account activated",
    headline: "Üdvözöljük a<br>Schaeffler Motion portálon",
    bodyHtml: mxMailBilingual(hu, en),
    lang: "both",
    topRight: "Welcome",
  });

  const text = [
    "PANNON TRANSFER - SCHAEFFLER MOTION PORTÁL / PORTAL",
    "",
    "Tisztelt Partnerünk!",
    "A jelszava beállítva, a Schaeffler Motion portálfiókja aktív.",
    twoFactorRequired ? "A fiókjához kétfaktoros hitelesítés (2FA) kötelező." : "",
    "Belépés kizárólag a személyes linken keresztül:",
    loginLink,
    "A link 30 napig érvényes, kérjük, ne ossza meg senkivel.",
    "",
    "Dear Partner,",
    "Your password has been set and your Schaeffler Motion portal account is now active.",
    twoFactorRequired ? "Two-factor authentication (2FA) is mandatory for your account." : "",
    "Sign in only through your personal link (above). It is valid for 30 days; please do not share it.",
    "",
    `Account / Fiók: ${email}`,
    "",
    `${MX_CONTACT.name} - ${MX_CONTACT.roleEn}`,
    MX_CONTACT.email,
    MX_CONTACT.phone,
    "",
    `© ${new Date().getFullYear()} Pannon Transfer.`,
  ]
    .filter((l, i, a) => l !== "" || a[i - 1] !== "")
    .join("\n");

  return {
    subject: twoFactorRequired
      ? "Schaeffler Motion portál – Fiók aktiválva · 2FA kötelező / Account activated · 2FA required"
      : "Schaeffler Motion portál – Üdvözöljük! Fiók aktiválva / Welcome! Account activated",
    html,
    text,
  };
}
