import type { PortalBookingEmailParams } from "@/lib/portal-booking-emails";

/* Ecopro Innovation e-mail identity: bright, airy, EcoPro blue → cyan. Table-based, client-safe. */

type Lang = "hu" | "en" | "ko";

export const ECO_CONTACT = {
  name: "Balog Sebastian Máté",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

const FONT =
  "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** `**bold**` fragments → <strong>, everything else escaped. */
function rich(s: string) {
  return s
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((p) =>
      p.startsWith("**") && p.endsWith("**")
        ? `<strong style="color:#0B2540;">${esc(p.slice(2, -2))}</strong>`
        : esc(p),
    )
    .join("");
}

export function ecoPara(text: string, opts?: { size?: number; color?: string; margin?: string }) {
  const size = opts?.size ?? 15;
  const color = opts?.color ?? "#334155";
  const margin = opts?.margin ?? "0 0 14px 0";
  return `<p style="margin:${margin}; font-size:${size}px; line-height:1.7; color:${color};">${rich(text)}</p>`;
}

export function ecoButton(href: string, label: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 30px 0;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="#0E86D4" style="border-radius:12px; background-image:linear-gradient(135deg,#0E86D4 0%,#00A3D9 100%);">
<a href="${href}" style="display:inline-block; padding:16px 38px; font-size:14px; font-weight:700; color:#FFFFFF; text-decoration:none; letter-spacing:.4px; border-radius:12px;">${esc(label)}</a>
</td></tr></table></td></tr></table>`;
}

export function ecoInfoRow(left: { label: string; value: string }, right: { label: string; value: string }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F8FD; border:1px solid #DCEBF7; border-radius:12px; margin-bottom:24px;"><tr>
<td width="50%" valign="top" style="padding:16px 18px; border-right:1px solid #DCEBF7;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#7A93AB; margin-bottom:5px;">${esc(left.label)}</div>
<div style="font-size:14px; font-weight:600; color:#0B2540; word-break:break-all;">${esc(left.value)}</div>
</td>
<td width="50%" valign="top" style="padding:16px 18px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#7A93AB; margin-bottom:5px;">${esc(right.label)}</div>
<div style="font-size:14px; font-weight:600; color:#0B2540;">${esc(right.value)}</div>
</td></tr></table>`;
}

const DIVIDER_LABEL: Record<Lang, string> = { hu: "Magyar", en: "English", ko: "한국어" };

/** Language sections in order; every section after the first gets a labelled divider. */
export function ecoMultilingual(sections: { lang: Lang; html: string }[]) {
  return sections
    .map((sec, i) =>
      i === 0
        ? sec.html
        : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 18px 0;"><tr>
<td style="border-top:1px solid #DCEBF7; font-size:0; line-height:0;" height="1">&nbsp;</td>
<td width="1" style="padding:0 12px; white-space:nowrap; font-size:10px; font-weight:700; letter-spacing:1.6px; color:#0E86D4; text-transform:uppercase;">${DIVIDER_LABEL[sec.lang]}</td>
<td style="border-top:1px solid #DCEBF7; font-size:0; line-height:0;" height="1">&nbsp;</td>
</tr></table>
${sec.html}`,
    )
    .join("\n");
}

function contactBlock(label: string, role: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #DCEBF7;"><tr><td style="padding-top:22px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#7A93AB; margin-bottom:12px;">${esc(label)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="46" valign="top" style="width:46px;"><div style="width:46px; height:46px; line-height:46px; text-align:center; background:#0B3F8F; border-radius:23px; color:#FFFFFF; font-size:15px; font-weight:700;">BS</div></td>
<td valign="top" style="padding-left:14px; font-size:13px; line-height:1.65; color:#475569;">
<div style="font-size:15px; font-weight:700; color:#0B2540;">${esc(ECO_CONTACT.name)}</div>
<div>${esc(role)}</div>
<div><a href="mailto:${ECO_CONTACT.email}" style="color:#0E86D4; text-decoration:none;">${ECO_CONTACT.email}</a></div>
<div><a href="tel:${ECO_CONTACT.phoneHref}" style="color:#0E86D4; text-decoration:none;">${ECO_CONTACT.phone}</a></div>
</td></tr></table>
</td></tr></table>`;
}

const FOOTERS: Record<Lang, { sent: string; rights: string }> = {
  hu: {
    sent: "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte. Ha nem Ön kérte, kérjük, hagyja figyelmen kívül.",
    rights: "Minden jog fenntartva.",
  },
  en: {
    sent: "This message was sent by the Pannon Transfer Komplex system. If you did not request it, please disregard it.",
    rights: "All rights reserved.",
  },
  ko: {
    sent: "이 메시지는 Pannon Transfer Komplex 시스템에서 발송되었습니다. 본인이 요청하지 않으셨다면 이 메일을 무시해 주십시오.",
    rights: "모든 권리 보유.",
  },
};

/** Branded e-mail shell. `langs` decides footer language(s) and contact label. */
export function ecoEmailShell(opts: {
  origin: string;
  preheader: string;
  eyebrow: string;
  headline: string;
  subHeadline?: string;
  bodyHtml: string;
  langs: Lang[] | "tri";
  topRight?: string;
}) {
  const year = new Date().getFullYear();
  const origin = opts.origin.replace(/\/$/, "");
  const ptLogo = origin ? `${origin}/brand/pannon-transfer-logo.png` : "";
  const ecoLogo = origin ? `${origin}/partners/ecoproinnovation/logo.png` : "";
  const langs: Lang[] = opts.langs === "tri" ? ["hu", "en", "ko"] : opts.langs;
  const primary = langs[0];

  const logos =
    ptLogo && ecoLogo
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr>
<td valign="middle" style="background:#FFFFFF; border-radius:10px; padding:9px 14px;"><img src="${ptLogo}" width="120" height="24" alt="Pannon Transfer" style="display:block; border:0; height:24px; width:120px;"></td>
<td width="12"></td>
<td valign="middle" style="background:#FFFFFF; border-radius:10px; padding:10px 14px;"><img src="${ecoLogo}" width="92" height="22" alt="Ecopro Innovation" style="display:block; border:0; height:22px; width:92px;"></td>
</tr></table>`
      : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr><td style="background:#FFFFFF; border-radius:10px; padding:10px 16px; font-size:15px; font-weight:800; color:#0E86D4;">Ecopro Innovation</td></tr></table>`;

  const multi = langs.length > 1;
  const contactLabel = multi
    ? "Kapcsolat · Contact · 문의"
    : primary === "ko"
      ? "담당자"
      : primary === "en"
        ? "Your contact"
        : "Kapcsolattartó";
  const contactRole = multi
    ? "Fejlesztő · Developer · 개발자"
    : primary === "ko"
      ? "개발자"
      : primary === "en"
        ? "Developer"
        : "Fejlesztő";

  const footerBlocks = multi
    ? `${langs.map((l) => esc(FOOTERS[l].sent)).join("<br>")}<br>&copy; ${year} Pannon Transfer. ${langs
        .map((l) => esc(FOOTERS[l].rights))
        .join(" · ")}`
    : `${esc(FOOTERS[primary].sent)}<br>&copy; ${year} Pannon Transfer. ${esc(FOOTERS[primary].rights)}`;

  return `<!DOCTYPE html>
<html lang="${primary}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${esc(opts.headline.replace(/<[^>]+>/g, " "))}</title>
</head>
<body style="margin:0; padding:0; background:#EAF3FB; font-family:${FONT}; -webkit-font-smoothing:antialiased;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${esc(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#EAF3FB"><tr><td align="center" style="padding:36px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
<tr><td style="padding:0 6px 14px 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:12px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase; color:#5B7691;">Pannon Transfer</td>
<td align="right" style="font-size:12px; color:#7A93AB;">${esc(opts.topRight || "Ecopro Innovation Portal")}</td>
</tr></table>
</td></tr>
<tr><td style="background:#FFFFFF; border-radius:18px; overflow:hidden; box-shadow:0 8px 30px rgba(14,134,212,.12);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td bgcolor="#0E86D4" style="padding:34px 40px 34px 40px; background-image:linear-gradient(135deg,#0B3F8F 0%,#0E86D4 58%,#00B4D8 100%);">
${logos}
<div style="font-size:11px; font-weight:700; letter-spacing:2.6px; text-transform:uppercase; color:#BFE6F8; margin-bottom:10px;">${esc(opts.eyebrow)}</div>
<div style="font-size:26px; line-height:1.25; font-weight:700; color:#FFFFFF;">${opts.headline}</div>
${opts.subHeadline ? `<div style="margin-top:8px; font-size:15px; line-height:1.4; font-weight:500; color:#D7F0FB;">${opts.subHeadline}</div>` : ""}
</td></tr>
<tr><td style="padding:36px 40px 6px 40px;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:0 40px 36px 40px;">
${contactBlock(contactLabel, contactRole)}
</td></tr>
<tr><td bgcolor="#F6FAFE" style="padding:22px 40px; border-top:1px solid #DCEBF7;">
<p style="margin:0; font-size:11px; line-height:1.7; color:#7A93AB; text-align:center;">
${footerBlocks}
</p>
</td></tr>
</table></td></tr></table>
</td></tr></table>
</body></html>`;
}

/* -------------------------------------------------------------------------- */
/*  Welcome e-mail (after the password was set) – HU / EN / KO                */
/* -------------------------------------------------------------------------- */

export function buildWelcomeEmail(params: {
  recipientEmail: string;
  loginLink: string;
  twoFactorRequired: boolean;
  origin: string;
}) {
  const { recipientEmail, loginLink, twoFactorRequired, origin } = params;
  const year = new Date().getFullYear();

  const hu =
    ecoPara("Tisztelt Partnerünk!", { size: 16, color: "#0B2540", margin: "0 0 14px 0" }) +
    ecoPara("A jelszavát sikeresen beállította, így fiókja az Ecopro Innovation dedikált portálján mostantól aktív. Üdvözöljük!") +
    ecoPara(
      "A portálra **kizárólag az alábbi személyes belépési linkkel** léphet be – nyilvános bejelentkező oldal nincs." +
        (twoFactorRequired
          ? " Mivel a fiókjához kétfaktoros hitelesítés (2FA) tartozik, belépéskor a hitelesítő alkalmazás 6 számjegyű kódját is meg kell adnia."
          : ""),
      { margin: "0 0 10px 0" },
    );

  const en =
    ecoPara("Dear Partner,", { size: 16, color: "#0B2540", margin: "0 0 14px 0" }) +
    ecoPara("Your password has been set successfully, so your account on the Ecopro Innovation dedicated portal is now active. Welcome!") +
    ecoPara(
      "You can access the portal **only through your personal sign-in link below** – there is no public sign-in page." +
        (twoFactorRequired
          ? " Because your account uses two-factor authentication (2FA), you will also need to enter the 6-digit code from your authenticator app when signing in."
          : ""),
      { margin: "0 0 10px 0" },
    );

  const ko =
    ecoPara("안녕하세요, 파트너님.", { size: 16, color: "#0B2540", margin: "0 0 14px 0" }) +
    ecoPara("비밀번호 설정이 완료되어 Ecopro Innovation 전용 포털 계정이 활성화되었습니다. 환영합니다!") +
    ecoPara(
      "포털에는 **아래 개인 로그인 링크로만** 접속할 수 있으며, 공개 로그인 페이지는 없습니다." +
        (twoFactorRequired ? " 계정에 2단계 인증(2FA)이 설정되어 있어 로그인 시 인증 앱의 6자리 코드도 입력하셔야 합니다." : ""),
      { margin: "0 0 10px 0" },
    );

  const bodyHtml =
    ecoMultilingual([
      { lang: "hu", html: hu },
      { lang: "en", html: en },
      { lang: "ko", html: ko },
    ]) +
    ecoButton(loginLink, "Belépés a portálra · Open the portal · 포털 로그인") +
    ecoInfoRow(
      { label: "Fiók · Account · 계정", value: recipientEmail },
      {
        label: "Hozzáférés · Access · 접근",
        value: twoFactorRequired
          ? "Dedikált partner · 2FA kötelező / 2FA required / 2단계 인증 필수"
          : "Dedikált partner / Dedicated partner / 전용 파트너",
      },
    ) +
    ecoPara(
      "**Biztonság:** ez a link személyes, 30 napig érvényes. Kérjük, ne ossza meg senkivel. Lejárta után új meghívót kérhet a Pannon Transfertől.",
      { size: 13, color: "#64748B", margin: "0 0 8px 0" },
    ) +
    ecoPara(
      "**Security:** this link is personal and valid for 30 days. Please do not share it with anyone. After it expires you can request a new invitation from Pannon Transfer.",
      { size: 13, color: "#64748B", margin: "0 0 8px 0" },
    ) +
    ecoPara(
      "**보안:** 이 링크는 개인 전용이며 30일간 유효합니다. 다른 사람과 공유하지 마세요. 만료 후에는 Pannon Transfer에 새 초대를 요청해 주세요.",
      { size: 13, color: "#64748B", margin: "0 0 28px 0" },
    );

  const html = ecoEmailShell({
    origin,
    preheader: "Fiókja aktív · Your account is active · 계정이 활성화되었습니다.",
    eyebrow: "Fiók aktiválva · Account activated · 계정 활성화",
    headline: "Üdvözöljük az Ecopro Innovation portálon",
    subHeadline: "Welcome to the Ecopro Innovation portal · Ecopro Innovation 포털에 오신 것을 환영합니다",
    bodyHtml,
    langs: "tri",
    topRight: "Welcome · 환영합니다",
  });

  const text = [
    "PANNON TRANSFER – ECOPRO INNOVATION",
    "",
    "Tisztelt Partnerünk!",
    "A jelszavát sikeresen beállította, a fiókja mostantól aktív.",
    twoFactorRequired ? "A belépéshez kétfaktoros hitelesítés (2FA) szükséges." : "",
    "Belépés kizárólag a személyes linkkel (nyilvános bejelentkező oldal nincs):",
    loginLink,
    "Fiók: " + recipientEmail,
    "A link 30 napig érvényes. Lejárta után kérjen új meghívót a Pannon Transfertől.",
    "",
    "--- English ---",
    "Dear Partner,",
    "Your password has been set successfully and your account is now active.",
    twoFactorRequired ? "Two-factor authentication (2FA) is required to sign in." : "",
    "Sign in only with your personal link (there is no public sign-in page):",
    loginLink,
    "Account: " + recipientEmail,
    "The link is valid for 30 days. After it expires, please request a new invitation from Pannon Transfer.",
    "",
    "--- 한국어 ---",
    "안녕하세요, 파트너님.",
    "비밀번호 설정이 완료되어 계정이 활성화되었습니다.",
    twoFactorRequired ? "로그인에는 2단계 인증(2FA)이 필요합니다." : "",
    "포털에는 아래 개인 링크로만 접속할 수 있습니다 (공개 로그인 페이지 없음):",
    loginLink,
    "계정: " + recipientEmail,
    "링크는 30일간 유효하며, 만료 후에는 Pannon Transfer에 새 초대를 요청해 주세요.",
    "",
    `${ECO_CONTACT.name} – Fejlesztő / Developer / 개발자`,
    ECO_CONTACT.email,
    ECO_CONTACT.phone,
    "",
    "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte.",
    "This message was sent by the Pannon Transfer Komplex system.",
    "이 메시지는 Pannon Transfer Komplex 시스템에서 발송되었습니다.",
    `© ${year} Pannon Transfer. Minden jog fenntartva. / All rights reserved. / 모든 권리 보유.`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return {
    subject: "Ecopro Innovation portál – Fiók aktiválva · Account activated · 계정 활성화 완료",
    html,
    text,
  };
}

/* -------------------------------------------------------------------------- */
/*  Booking confirmation – single language (the booker's UI language)         */
/* -------------------------------------------------------------------------- */

const CONFIRM_COPY: Record<
  Lang,
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
    secTransfer: string;
    secPassenger: string;
    when: string;
    from: string;
    to: string;
    flight: string;
    service: string;
    standard: string;
    executive: string;
    pax: string;
    luggage: string;
    name: string;
    phone: string;
    email: string;
    email2: string;
    phone2: string;
    notes: string;
    change: string;
    topRight: string;
  }
> = {
  hu: {
    subject: (code) => `Foglalás visszaigazolása – #${code} | Ecopro Innovation × Pannon Transfer`,
    preheader: (code, name, date) => `A(z) #${code} foglalás beérkezett – ${name}, ${date}.`,
    eyebrow: "Foglalás visszaigazolása",
    headline: "Megkaptuk a transzferfoglalását",
    greeting: "Tisztelt Partnerünk!",
    intro: (name) =>
      `Köszönjük a foglalást. Megkaptuk **${name}** transzferkérését. Diszpécserünk áttekinti, és hamarosan megerősíti.`,
    ref: "Foglalási kód",
    status: "Állapot",
    statusValue: "Beérkezett · megerősítésre vár",
    secTransfer: "Az út adatai",
    secPassenger: "Utas",
    when: "Felvétel ideje",
    from: "Felvételi hely",
    to: "Érkezési hely",
    flight: "Járatszám",
    service: "Szolgáltatási szint",
    standard: "Standard",
    executive: "Executive",
    pax: "Utasok száma",
    luggage: "Poggyász",
    name: "Név",
    phone: "Telefonszám",
    email: "E-mail",
    email2: "2. utas e-mail címe",
    phone2: "2. utas telefonszáma",
    notes: "Megjegyzés",
    change: "Módosítani vagy lemondani szeretne? Nyissa meg a **Foglalásaim** oldalt az Ecopro Innovation portálon, vagy keresse munkatársunkat az alábbi elérhetőségeken.",
    topRight: "Ecopro Innovation portál",
  },
  en: {
    subject: (code) => `Booking confirmation – #${code} | Ecopro Innovation × Pannon Transfer`,
    preheader: (code, name, date) => `Booking #${code} received – ${name}, ${date}.`,
    eyebrow: "Booking confirmation",
    headline: "We've received your transfer request",
    greeting: "Dear Partner,",
    intro: (name) =>
      `Thank you for your booking. We have received the transfer request for **${name}**. Our dispatcher will review it and confirm it shortly.`,
    ref: "Booking reference",
    status: "Status",
    statusValue: "Received · awaiting confirmation",
    secTransfer: "Transfer details",
    secPassenger: "Passenger",
    when: "Pick-up date & time",
    from: "Pick-up location",
    to: "Drop-off location",
    flight: "Flight number",
    service: "Service class",
    standard: "Standard",
    executive: "Executive",
    pax: "Passengers",
    luggage: "Luggage",
    name: "Name",
    phone: "Phone",
    email: "Email",
    email2: "2nd passenger email",
    phone2: "2nd passenger phone",
    notes: "Notes",
    change: "Need to change or cancel? Open **My bookings** in the Ecopro Innovation portal, or contact us using the details below.",
    topRight: "Ecopro Innovation portal",
  },
  ko: {
    subject: (code) => `예약 확인서 – #${code} | Ecopro Innovation × Pannon Transfer`,
    preheader: (code, name, date) => `예약 #${code}이(가) 접수되었습니다 – ${name}, ${date}.`,
    eyebrow: "예약 확인서",
    headline: "이동 예약이 접수되었습니다",
    greeting: "안녕하세요, 파트너님.",
    intro: (name) =>
      `예약해 주셔서 감사합니다. **${name}** 님의 이동 요청이 접수되었습니다. 배차 담당자가 검토 후 곧 확정해 드리겠습니다.`,
    ref: "예약 번호",
    status: "상태",
    statusValue: "접수됨 · 확정 대기",
    secTransfer: "이동 정보",
    secPassenger: "승객",
    when: "픽업 일시",
    from: "픽업 장소",
    to: "도착 장소",
    flight: "항공편 번호",
    service: "서비스 등급",
    standard: "스탠더드",
    executive: "이그제큐티브",
    pax: "승객 수",
    luggage: "수하물",
    name: "이름",
    phone: "전화번호",
    email: "이메일",
    email2: "두 번째 승객 이메일",
    phone2: "두 번째 승객 전화번호",
    notes: "비고",
    change: "변경 또는 취소가 필요하신가요? Ecopro Innovation 포털의 **내 예약** 페이지에서 처리하시거나 아래 연락처로 문의해 주세요.",
    topRight: "Ecopro Innovation 포털",
  },
};

function fmtWhen(lang: Lang, date: string, time: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date || "");
  if (!m) return `${date} ${time}`.trim();
  if (lang === "ko") return `${m[1]}년 ${Number(m[2])}월 ${Number(m[3])}일 ${time}`.trim();
  if (lang === "en") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${Number(m[3])} ${months[Number(m[2]) - 1]} ${m[1]}, ${time}`.trim();
  }
  return `${m[1]}. ${m[2]}. ${m[3]}. ${time}`.trim();
}

/** Booking confirmation (basic data only – no price, no payment, no tracking link). `null` never: always branded. */
export function buildBookingConfirmationEmail(
  params: PortalBookingEmailParams,
): { subject: string; html: string } | null {
  const lang: Lang = params.language === "ko" || params.language === "en" ? params.language : "hu";
  const c = CONFIRM_COPY[lang];
  const row = (label: string, value: string) =>
    `<tr><td style="padding:11px 0; border-bottom:1px solid #E6F0F8; font-size:13px; color:#64748B; width:42%; vertical-align:top;">${esc(label)}</td><td style="padding:11px 0; border-bottom:1px solid #E6F0F8; font-size:14px; font-weight:600; color:#0B2540; vertical-align:top;">${esc(value || "—")}</td></tr>`;
  const sectionTitle = (title: string) =>
    `<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#0E86D4; margin:0 0 4px 0;">${esc(title)}</div>`;

  const bodyHtml =
    ecoPara(c.greeting, { size: 16, color: "#0B2540", margin: "0 0 14px 0" }) +
    ecoPara(c.intro(params.travelerName), { margin: "0 0 24px 0" }) +
    ecoInfoRow({ label: c.ref, value: "#" + params.bookingCode }, { label: c.status, value: c.statusValue }) +
    sectionTitle(c.secTransfer) +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(c.when, fmtWhen(lang, params.pickupDate, params.pickupTime))}
${row(c.from, params.fromAddress)}
${row(c.to, params.toAddress)}
${params.flightNumber ? row(c.flight, params.flightNumber) : ""}
${row(c.service, params.transferType === "executive" ? c.executive : c.standard)}
${row(c.pax, String(params.travelers))}
${row(c.luggage, String(params.luggage))}
</table>` +
    sectionTitle(c.secPassenger) +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(c.name, params.travelerName)}
${row(c.phone, params.travelerPhone)}
${row(c.email, params.travelerEmail)}
${params.secondTravelerEmail ? row(c.email2, params.secondTravelerEmail) : ""}
${params.secondTravelerPhone ? row(c.phone2, params.secondTravelerPhone) : ""}
${params.comment ? row(c.notes, params.comment) : ""}
</table>` +
    ecoPara(c.change, { size: 13, color: "#64748B", margin: "0 0 30px 0" });

  const html = ecoEmailShell({
    origin: params.origin,
    preheader: c.preheader(params.bookingCode, params.travelerName, params.pickupDate),
    eyebrow: c.eyebrow,
    headline: c.headline,
    bodyHtml,
    langs: [lang],
    topRight: c.topRight,
  });

  return { subject: c.subject(params.bookingCode), html };
}
