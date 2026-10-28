import type { PortalBookingEmailParams } from "@/lib/portal-booking-emails";

/**
 * Ecopro BM arculatú e-mail sablonok (magyar / koreai).
 * Tábla alapú, e-mail kliensekkel kompatibilis elrendezés; a logók abszolút URL-ről töltődnek.
 */

export const ECOPROBM_CONTACT = {
  name: "Balog Sebastian Máté",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

const C = {
  navy: "#071B38",
  navyDeep: "#050F20",
  blue: "#1E73BE",
  blueDark: "#0B3C7A",
  blueLight: "#8CC4F5",
  orange: "#F28C28",
  orangeLight: "#FFB366",
  ink: "#0F172A",
  text: "#334155",
  muted: "#64748B",
  faint: "#94A3B8",
  line: "#E2E8F0",
  panel: "#F5F8FC",
  page: "#EAF0F8",
};

type Lang = "hu" | "ko";

export function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function ecoproBmButton(href: string, label: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 30px 0;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td align="center" bgcolor="${C.orange}" style="border-radius:10px;">
<a href="${href}" style="display:inline-block; padding:16px 40px; font-size:14px; font-weight:800; color:${C.navyDeep}; text-decoration:none; letter-spacing:.5px; border-radius:10px;">${label}</a>
</td></tr></table></td></tr></table>`;
}

export function ecoproBmInfoRow(
  left: { label: string; value: string },
  right: { label: string; value: string },
) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.panel}; border:1px solid ${C.line}; border-radius:10px; margin:0 0 24px 0;"><tr>
<td width="50%" valign="top" style="padding:16px 18px; border-right:1px solid ${C.line};">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:${C.faint}; margin-bottom:6px;">${esc(left.label)}</div>
<div style="font-size:14px; font-weight:700; color:${C.ink}; word-break:break-all;">${esc(left.value)}</div>
</td>
<td width="50%" valign="top" style="padding:16px 18px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:${C.faint}; margin-bottom:6px;">${esc(right.label)}</div>
<div style="font-size:14px; font-weight:700; color:${C.ink};">${esc(right.value)}</div>
</td></tr></table>`;
}

/** Két nyelvű tartalom: magyar blokk, elválasztó, koreai blokk. */
export function ecoproBmBilingual(huHtml: string, koHtml: string) {
  return `${huHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 26px 0;"><tr>
<td style="border-top:1px solid ${C.line}; height:1px; font-size:0; line-height:0;" width="42%">&nbsp;</td>
<td align="center" style="padding:0 12px; white-space:nowrap;"><span style="display:inline-block; padding:4px 12px; border-radius:20px; background:${C.panel}; border:1px solid ${C.line}; font-size:10px; font-weight:800; letter-spacing:1.6px; color:${C.muted};">한국어</span></td>
<td style="border-top:1px solid ${C.line}; height:1px; font-size:0; line-height:0;" width="42%">&nbsp;</td>
</tr></table>
${koHtml}`;
}

export function ecoproBmPara(text: string, opts: { strong?: boolean; last?: boolean } = {}) {
  return `<p style="margin:0 0 ${opts.last ? 26 : 14}px 0; font-size:15px; line-height:1.75; color:${C.text}; word-break:keep-all;${opts.strong ? " font-weight:600;" : ""}">${text}</p>`;
}

export function ecoproBmGreeting(text: string) {
  return `<p style="margin:0 0 14px 0; font-size:16px; font-weight:700; color:${C.ink};">${text}</p>`;
}

export function ecoproBmNote(label: string, text: string) {
  return `<p style="margin:0 0 24px 0; font-size:13px; line-height:1.7; color:${C.muted};"><strong style="color:${C.ink};">${label}</strong> ${text}</p>`;
}

/** Ecopro BM arculatú e-mail keret. `lang` = "both" esetén kétnyelvű lábléc. */
export function ecoproBmEmailShell(opts: {
  origin: string;
  lang: Lang | "both";
  preheader: string;
  eyebrow: string;
  headline: string;
  headlineSub?: string;
  bodyHtml: string;
  topRight?: string;
}) {
  const year = new Date().getFullYear();
  const origin = (opts.origin || "").replace(/\/$/, "");
  const ptLogo = origin ? `${origin}/brand/pannon-transfer-logo.png` : "";
  const bmLogo = origin ? `${origin}/partners/ecoprobm/logo.png` : "";

  const logos =
    ptLogo && bmLogo
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr>
<td valign="middle" style="background:#FFFFFF; border-radius:9px; padding:9px 14px;"><img src="${ptLogo}" width="118" height="24" alt="Pannon Transfer" style="display:block; border:0; height:24px; width:118px;"></td>
<td width="12"></td>
<td valign="middle" style="background:#FFFFFF; border-radius:9px; padding:10px 14px;"><img src="${bmLogo}" width="104" height="23" alt="Ecopro BM" style="display:block; border:0; height:23px; width:104px;"></td>
</tr></table>`
      : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;"><tr><td style="background:#FFFFFF; border-radius:9px; padding:10px 16px; font-size:16px; font-weight:900; color:${C.blue};">Ecopro <span style="color:${C.orange};">BM</span></td></tr></table>`;

  const roleHu = "Fejlesztő";
  const roleKo = "개발자";
  const role = opts.lang === "hu" ? roleHu : opts.lang === "ko" ? roleKo : `${roleHu} · ${roleKo}`;
  const contactLabel =
    opts.lang === "hu" ? "Az Ön kapcsolattartója" : opts.lang === "ko" ? "담당자 연락처" : "Kapcsolattartó · 담당자 연락처";

  const footerHu =
    "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte. Ha nem számított erre az üzenetre, kérjük, hagyja figyelmen kívül.";
  const footerKo = "이 메일은 Pannon Transfer Komplex 시스템에서 발송되었습니다. 예상하지 못한 메일이라면 무시해 주세요.";
  const rightsHu = "Minden jog fenntartva.";
  const rightsKo = "모든 권리 보유.";
  const footer =
    opts.lang === "hu"
      ? `${footerHu}<br>&copy; ${year} Pannon Transfer. ${rightsHu}`
      : opts.lang === "ko"
        ? `${footerKo}<br>&copy; ${year} Pannon Transfer. ${rightsKo}`
        : `${footerHu}<br>${footerKo}<br>&copy; ${year} Pannon Transfer. ${rightsHu} / ${rightsKo}`;

  return `<!DOCTYPE html>
<html lang="${opts.lang === "ko" ? "ko" : "hu"}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${esc(opts.headline.replace(/<[^>]+>/g, " ").replace(/&rsquo;/g, "’"))}</title>
</head>
<body style="margin:0; padding:0; background:${C.page}; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif; -webkit-font-smoothing:antialiased;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${esc(opts.preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.page}"><tr><td align="center" style="padding:36px 14px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
<tr><td style="padding:0 6px 14px 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-size:12px; font-weight:700; letter-spacing:2.4px; text-transform:uppercase; color:${C.muted};">Pannon Transfer</td>
<td align="right" style="font-size:12px; color:${C.faint};">${esc(opts.topRight || "Ecopro BM")}</td>
</tr></table>
</td></tr>
<tr><td style="background:#FFFFFF; border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(7,27,56,.10);">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td bgcolor="${C.orange}" height="5" style="height:5px; font-size:0; line-height:0;">&nbsp;</td></tr>
<tr><td bgcolor="${C.navy}" style="padding:34px 40px 32px 40px; border-bottom:4px solid ${C.blue};">
${logos}
<div style="font-size:11px; font-weight:700; letter-spacing:2.6px; text-transform:uppercase; color:${C.orangeLight}; margin-bottom:10px;">${esc(opts.eyebrow)}</div>
<div style="font-family:Georgia, 'Times New Roman', serif; font-size:26px; line-height:1.28; color:#FFFFFF;">${opts.headline}</div>${
    opts.headlineSub
      ? `\n<div style="margin-top:8px; font-size:15px; line-height:1.4; color:${C.blueLight};">${opts.headlineSub}</div>`
      : ""
  }
</td></tr>
<tr><td style="padding:38px 40px 6px 40px;">
${opts.bodyHtml}
</td></tr>
<tr><td style="padding:0 40px 36px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line};"><tr><td style="padding-top:22px;">
<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:${C.faint}; margin-bottom:12px;">${contactLabel}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="46" valign="top" style="width:46px;"><div style="width:46px; height:46px; line-height:46px; text-align:center; background:${C.navy}; border-radius:23px; color:${C.orangeLight}; font-size:16px; font-weight:700;">BS</div></td>
<td valign="top" style="padding-left:14px; font-size:13px; line-height:1.65; color:#475569;">
<div style="font-size:15px; font-weight:700; color:${C.ink};">${ECOPROBM_CONTACT.name}</div>
<div>${role}, Pannon Transfer</div>
<div><a href="mailto:${ECOPROBM_CONTACT.email}" style="color:${C.blue}; text-decoration:none;">${ECOPROBM_CONTACT.email}</a></div>
<div><a href="tel:${ECOPROBM_CONTACT.phoneHref}" style="color:${C.blue}; text-decoration:none;">${ECOPROBM_CONTACT.phone}</a></div>
</td></tr></table>
</td></tr></table>
</td></tr>
<tr><td bgcolor="${C.panel}" style="padding:22px 40px; border-top:1px solid ${C.line};">
<p style="margin:0; font-size:11px; line-height:1.7; color:${C.faint}; text-align:center;">${footer}</p>
</td></tr>
</table></td></tr></table>
</td></tr></table>
</body></html>`;
}

/* ------------------------------------------------------------------ */
/* Foglalás-visszaigazoló e-mail (a foglaláskor használt nyelven)       */
/* ------------------------------------------------------------------ */

const CONFIRM_TEXT = {
  hu: {
    subject: (code: string) => `Foglalás visszaigazolása - #${code} | Ecopro BM x Pannon Transfer`,
    preheader: (code: string, name: string, date: string) => `A(z) #${code} foglalás beérkezett – ${name}, ${date}.`,
    eyebrow: "Foglalás visszaigazolása",
    headline: "Megkaptuk<br>transzferkérését",
    greeting: "Tisztelt Partnerünk!",
    intro: (name: string) =>
      `Köszönjük a foglalását. <strong style="color:#0F172A;">${name}</strong> transzferkérése megérkezett hozzánk. Diszpécserünk áttekinti, és hamarosan visszaigazolja.`,
    ref: "Foglalási azonosító",
    status: "Állapot",
    statusValue: "Beérkezett · visszaigazolásra vár",
    tripTitle: "A transzfer adatai",
    when: "Felvétel dátuma és időpontja",
    from: "Felvételi hely",
    to: "Érkezési hely",
    flight: "Járatszám",
    cls: "Szolgáltatási szint",
    pax: "Utasok száma",
    bags: "Csomagok száma",
    paxTitle: "Utas",
    name: "Név",
    phone: "Telefonszám",
    email: "E-mail",
    email2: "2. utas e-mail címe",
    phone2: "2. utas telefonszáma",
    notes: "Megjegyzés",
    standard: "Standard",
    executive: "Executive",
    help:
      "Módosítani vagy lemondani szeretne? Nyissa meg a <strong style=\"color:#0F172A;\">Foglalásaim</strong> oldalt az Ecopro BM portálon, vagy forduljon hozzánk az alábbi elérhetőségeken.",
  },
  ko: {
    subject: (code: string) => `예약 확인 - #${code} | Ecopro BM x Pannon Transfer`,
    preheader: (code: string, name: string, date: string) => `예약 #${code}이(가) 접수되었습니다 – ${name}, ${date}.`,
    eyebrow: "예약 확인",
    headline: "이동 요청이<br>접수되었습니다",
    greeting: "고객님께,",
    intro: (name: string) =>
      `예약해 주셔서 감사합니다. <strong style="color:#0F172A;">${name}</strong> 님의 이동 요청이 접수되었습니다. 배차 담당자가 검토 후 곧 확정해 드리겠습니다.`,
    ref: "예약 번호",
    status: "상태",
    statusValue: "접수됨 · 확정 대기",
    tripTitle: "이동 정보",
    when: "탑승 날짜 및 시간",
    from: "출발지",
    to: "도착지",
    flight: "항공편명",
    cls: "서비스 등급",
    pax: "탑승 인원",
    bags: "수하물 개수",
    paxTitle: "탑승자",
    name: "성명",
    phone: "전화번호",
    email: "이메일",
    email2: "두 번째 탑승자 이메일",
    phone2: "두 번째 탑승자 전화번호",
    notes: "요청 사항",
    standard: "스탠더드",
    executive: "이그제큐티브",
    help:
      "변경 또는 취소가 필요하신가요? Ecopro BM 포털의 <strong style=\"color:#0F172A;\">내 예약</strong> 페이지에서 처리하시거나 아래 연락처로 문의해 주세요.",
  },
} as const;

export function buildBookingConfirmationEmail(
  params: PortalBookingEmailParams,
): { subject: string; html: string } | null {
  const lang: Lang = params.language === "ko" ? "ko" : "hu";
  const t = CONFIRM_TEXT[lang];
  const row = (label: string, value: string) =>
    `<tr><td style="padding:11px 0; border-bottom:1px solid #EEF2F7; font-size:13px; color:${C.muted}; width:42%; vertical-align:top;">${esc(label)}</td><td style="padding:11px 0; border-bottom:1px solid #EEF2F7; font-size:14px; font-weight:600; color:${C.ink}; vertical-align:top;">${value}</td></tr>`;
  const e = (v: string | undefined) => esc(v && v.trim() ? v : "—");
  const sectionTitle = (text: string) =>
    `<div style="font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:${C.orange}; margin:0 0 4px 0;">${esc(text)}</div>`;

  const bodyHtml = `
${ecoproBmGreeting(t.greeting)}
${ecoproBmPara(t.intro(esc(params.travelerName)), { last: true })}
${ecoproBmInfoRow({ label: t.ref, value: `#${params.bookingCode}` }, { label: t.status, value: t.statusValue })}

${sectionTitle(t.tripTitle)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(t.when, e(`${params.pickupDate}  ${params.pickupTime}`))}
${row(t.from, e(params.fromAddress))}
${row(t.to, e(params.toAddress))}
${params.flightNumber ? row(t.flight, e(params.flightNumber)) : ""}
${row(t.cls, params.transferType === "executive" ? t.executive : t.standard)}
${row(t.pax, String(params.travelers))}
${row(t.bags, String(params.luggage))}
</table>

${sectionTitle(t.paxTitle)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:26px;">
${row(t.name, e(params.travelerName))}
${row(t.phone, e(params.travelerPhone))}
${row(t.email, e(params.travelerEmail))}
${params.secondTravelerEmail ? row(t.email2, e(params.secondTravelerEmail)) : ""}
${params.secondTravelerPhone ? row(t.phone2, e(params.secondTravelerPhone)) : ""}
${params.comment ? row(t.notes, e(params.comment)) : ""}
</table>

<p style="margin:0 0 30px 0; font-size:13px; line-height:1.7; color:${C.muted};">${t.help}</p>`;

  const html = ecoproBmEmailShell({
    origin: params.origin,
    lang,
    preheader: t.preheader(params.bookingCode, params.travelerName, params.pickupDate),
    eyebrow: t.eyebrow,
    headline: t.headline,
    bodyHtml,
    topRight: "Ecopro BM",
  });

  return { subject: t.subject(params.bookingCode), html };
}

/* ------------------------------------------------------------------ */
/* Üdvözlő e-mail jelszóbeállítás után (két nyelvű: magyar + koreai)     */
/* ------------------------------------------------------------------ */

export function buildEcoproBmWelcomeEmail(opts: {
  recipientEmail: string;
  loginLink: string;
  twoFactorRequired: boolean;
  origin: string;
}) {
  const { recipientEmail, loginLink, twoFactorRequired, origin } = opts;

  const hu =
    ecoproBmGreeting("Tisztelt Partnerünk!") +
    ecoproBmPara("A jelszavát sikeresen beállította, az Ecopro BM dedikált portálon lévő fiókja mostantól aktív. Üdvözöljük!") +
    ecoproBmPara(
      `A portálhoz való hozzáférés <strong>kizárólag az alábbi személyes belépési linken</strong> keresztül érhető el – nyilvános belépési oldal nincs.${
        twoFactorRequired
          ? " Mivel a fiókjához kétfaktoros hitelesítés (2FA) tartozik, belépéskor az Authenticator alkalmazás 6 számjegyű kódját is kérni fogjuk."
          : ""
      }`,
      { last: true },
    ) +
    ecoproBmButton(loginLink, "Belépés az Ecopro BM portálra") +
    ecoproBmInfoRow(
      { label: "Az Ön fiókja", value: recipientEmail },
      { label: "Hozzáférés", value: twoFactorRequired ? "Dedikált partner · 2FA kötelező" : "Dedikált partner" },
    ) +
    ecoproBmNote(
      "Biztonság:",
      "ez a link személyes, 30 napig érvényes. Kérjük, ne ossza meg senkivel. Lejárta után új meghívót kérhet a Pannon Transfertől.",
    );

  const ko =
    ecoproBmGreeting("고객님께,") +
    ecoproBmPara("비밀번호가 설정되어 Ecopro BM 전용 포털 계정이 활성화되었습니다. 환영합니다!") +
    ecoproBmPara(
      `포털은 <strong>아래의 개인 로그인 링크로만</strong> 접속할 수 있으며, 공개 로그인 페이지는 없습니다.${
        twoFactorRequired
          ? " 이 계정에는 2단계 인증(2FA)이 필수이므로 로그인 시 인증 앱의 6자리 코드도 요청됩니다."
          : ""
      }`,
      { last: true },
    ) +
    ecoproBmButton(loginLink, "Ecopro BM 포털 로그인") +
    ecoproBmInfoRow(
      { label: "계정", value: recipientEmail },
      { label: "접근 권한", value: twoFactorRequired ? "전용 파트너 · 2FA 필수" : "전용 파트너" },
    ) +
    ecoproBmNote(
      "보안 안내:",
      "이 링크는 개인 전용이며 30일간 유효합니다. 다른 사람과 공유하지 마세요. 만료된 경우 Pannon Transfer에 새 초대를 요청해 주세요.",
    );

  const html = ecoproBmEmailShell({
    origin,
    lang: "both",
    preheader: "Fiókja aktív – használja személyes belépési linkjét. / 계정이 활성화되었습니다. 개인 로그인 링크를 사용하세요.",
    eyebrow: "Fiók aktiválva · 계정 활성화",
    headline: "Üdvözöljük az<br>Ecopro BM portálon",
    headlineSub: "Ecopro BM 전용 포털에 오신 것을 환영합니다",
    bodyHtml: ecoproBmBilingual(hu, ko),
    topRight: "Ecopro BM",
  });

  const text = [
    "PANNON TRANSFER - ECOPRO BM",
    "",
    "Tisztelt Partnerünk!",
    "",
    "A jelszavát sikeresen beállította, a fiókja mostantól aktív.",
    twoFactorRequired
      ? "A fiókjához kétfaktoros hitelesítés (2FA) kötelező."
      : "A fiókjához nincs bekapcsolva kétfaktoros hitelesítés.",
    "A belépés kizárólag az alábbi személyes linken lehetséges:",
    loginLink,
    "",
    `Fiók: ${recipientEmail}`,
    "A link 30 napig érvényes. Lejárta után kérjen új meghívót a Pannon Transfertől.",
    "",
    "--------------------",
    "",
    "고객님께,",
    "",
    "비밀번호가 설정되어 계정이 활성화되었습니다.",
    twoFactorRequired ? "이 계정에는 2단계 인증(2FA)이 필수입니다." : "이 계정에는 2단계 인증이 설정되어 있지 않습니다.",
    "로그인은 아래의 개인 링크로만 가능합니다:",
    loginLink,
    "",
    `계정: ${recipientEmail}`,
    "링크는 30일간 유효하며, 만료 시 Pannon Transfer에 새 초대를 요청해 주세요.",
    "",
    "--------------------",
    `${ECOPROBM_CONTACT.name} - Fejlesztő / 개발자`,
    ECOPROBM_CONTACT.email,
    ECOPROBM_CONTACT.phone,
    "",
    "Ezt az üzenetet a Pannon Transfer Komplex rendszere küldte. / 이 메일은 Pannon Transfer Komplex 시스템에서 발송되었습니다.",
    `© ${new Date().getFullYear()} Pannon Transfer.`,
  ].join("\n");

  return {
    subject: twoFactorRequired
      ? "Ecopro BM portál – fiókja aktív, 2FA kötelező / 계정 활성화 · 2FA 필수"
      : "Ecopro BM portál – fiókja aktív / 계정이 활성화되었습니다",
    html,
    text,
  };
}
