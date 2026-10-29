import type { EcoproBmLang } from "./lang";

type Dict = Record<string, string>;

const hu: Dict = {
  navLabel: "Ecopro BM Transfer Desk",
  navSubline: "Dedikált Ecopro BM portál",
  navBooking: "Foglalás",
  navMyBookings: "Foglalásaim",
  signOut: "Kijelentkezés",
  language: "Nyelv",

  checkingAccess: "Hozzáférés és munkamenet ellenőrzése…",
  checkingAccessSub: "Pannon Transfer · Hozzáférés ellenőrzése",
  portalName: "Ecopro BM Portál",
  preparing: "A portál előkészítése…",
  premiumTag: "Prémium céges transzfer",

  heroEyebrow: "Dedikált céges portál",
  heroTitle: "Foglalja le|transzferét",
  heroSubtitle:
    "Repülőtéri és városi transzferek az Ecopro BM munkatársai és vendégei számára, a Pannon Transfer diszpécsereinek szervezésében.",

  progress: "Kitöltött kötelező mezők",

  secTraveler: "Utas és cég",
  secTravelerSub: "Ki utazik, és hogyan érjük el",
  secService: "Szolgáltatás és fizetés",
  secServiceSub: "Válassza ki a szolgáltatási szintet és a fizetési módot",
  secRoute: "Útvonal és időpont",
  secRouteSub: "Felvétel, érkezés, járat és időpont",

  fEmail: "Az utas e-mail címe",
  fEmailPh: "nev@ceg.hu",
  fName: "Az utas teljes neve",
  fNamePh: "Teljes név",
  fCompany: "Cég",
  fPhone: "Telefonszám",
  fPhonePh: "+36…",
  fPhoneHint: "Csak számjegyek, országhívóval együtt",
  secondTraveler: "Második utas",
  optional: "opcionális",
  optionalPh: "Opcionális",
  fSecondEmail: "A második utas e-mail címe",
  fSecondPhone: "A második utas telefonszáma",

  fPayment: "Fizetési mód",
  payCard: "Bankkártya a sofőrnél",
  payBank: "Banki átutalás",
  fTransferType: "Szolgáltatási szint",
  typeStandard: "Standard",
  typeStandardSub: "Economy osztály",
  typeExecutive: "Executive",
  typeExecutiveSub: "Business osztály",
  upToPax: "Legfeljebb {n} utas",

  fFrom: "Felvétel",
  fTo: "Érkezés",
  typeAirport: "Repülőtér",
  typeOther: "Egyéb cím",
  fFromAddress: "Felvételi cím",
  fToAddress: "Érkezési cím",
  phFromAirport: "pl. Budapest Liszt Ferenc Repülőtér (BUD)",
  phFromOther: "pl. Ecopro BM debreceni üzem",
  phToAirport: "pl. Budapest Liszt Ferenc Repülőtér (BUD)",
  phToOther: "pl. 4031 Debrecen, …",
  fFlight: "Járatszám",
  phFlight: "pl. LH1234",
  flightHint:
    "Minden foglaláshoz kötelező, hogy a sofőr követni tudja az érkezést vagy az indulást.",
  fDate: "Dátum",
  fTime: "Időpont",
  advanceHint: "Kérjük, legalább {h} órával az indulás előtt foglaljon.",
  fTravelers: "Utasok száma",
  fLuggage: "Csomagok száma",
  luggageHint: "Összesen legfeljebb {n} darab",
  fComment: "Megjegyzés",
  phComment: "Különleges kérés vagy útmutatás (opcionális)",
  decrease: "Csökkentés",
  increase: "Növelés",

  submit: "Foglalás elküldése",
  sending: "Foglalás küldése…",
  submitHint: "A beküldés után azonnal e-mailben visszaigazolást küldünk.",

  errFixTitle: "Kérjük, javítsa az alábbiakat:",
  errRequired: "{field} megadása kötelező",
  errEmail: "Kérjük, adjon meg érvényes e-mail címet",
  errInvalid: "A megadott adatok érvénytelenek. Kérjük, ellenőrizze az űrlapot.",
  errServer: "Szerverhiba történt. Kérjük, próbálja újra.",
  errUnexpected: "Váratlan hiba történt. Kérjük, próbálja újra.",
  errNetwork: "Hálózati hiba történt. Kérjük, próbálja újra.",

  okTitle: "A foglalás beérkezett",
  okSub: "A visszaigazoló e-mailt elküldtük a megadott címre.",
  okCode: "Foglalási azonosító",
  okNote:
    "Amint diszpécserünk visszaigazolja a foglalást, e-mailben értesítjük.",
  okMyBookings: "Foglalásaim",
  okNew: "Új foglalás",

  sumTitle: "Foglalás összegzése",
  sumEmpty: "Töltse ki az űrlapot, és itt azonnal látni fogja az összegzést.",
  sumRoute: "Útvonal",
  sumWhen: "Időpont",
  sumPassengers: "Utasok",
  sumFlight: "Járat",
  sumClass: "Szint",
  sumPassengerLine: "{p} fő · {l} csomag",
  sumNoteTitle: "Tudnivalók",
  sumNote1: "A foglalás a diszpécser visszaigazolása után válik véglegessé.",
  sumNote2: "Módosítás és lemondás a Foglalásaim oldalon lehetséges.",
  sumNote3: "Minden változásról e-mailben értesítjük.",

  needHelp: "Segítségre van szüksége?",
  supportRole: "Fejlesztő",
  rights: "Minden jog fenntartva.",

  srvFlightRequired: "A járatszám megadása kötelező",
  srvTravelerEmail: "Az utas e-mail címének megadása kötelező",
  srvTravelerName: "Az utas nevének megadása kötelező",
  srvTravelerPhone: "Az utas telefonszámának megadása kötelező",
  srvFromRequired: "A felvételi cím megadása kötelező",
  srvToRequired: "Az érkezési cím megadása kötelező",
  srvDateRequired: "A felvétel dátumának megadása kötelező",
  srvTimeRequired: "A felvétel időpontjának megadása kötelező",
  srvMinPax: "Legalább 1 utas szükséges",
  srvLuggageNegative: "A csomagok száma nem lehet negatív",
  srvBadDateTime: "Érvénytelen felvételi dátum vagy időpont",
  srvMinAdvance: "A felvételnek legalább {n} órával a jövőben kell lennie",
  srvMaxAdvance: "A felvétel legfeljebb {n} nappal lehet a jövőben",
  srvCityHours: "Városi transzfer csak {a} és {b} között foglalható",
  srvMaxPax: "{type} szinten legfeljebb {n} utas utazhat",
  srvMaxLuggage:
    "{type} szinten utasonként legfeljebb {n} csomag engedélyezett (összesen {m})",
};

const ko: Dict = {
  navLabel: "Ecopro BM 이동 서비스 데스크",
  navSubline: "Ecopro BM 전용 포털",
  navBooking: "예약",
  navMyBookings: "내 예약",
  signOut: "로그아웃",
  language: "언어",

  checkingAccess: "접근 권한과 세션을 확인하는 중…",
  checkingAccessSub: "Pannon Transfer · 접근 권한 확인",
  portalName: "Ecopro BM 포털",
  preparing: "포털을 준비하는 중…",
  premiumTag: "프리미엄 기업 이동 서비스",

  heroEyebrow: "전용 기업 포털",
  heroTitle: "이동을|간편하게 예약하세요",
  heroSubtitle:
    "Ecopro BM 임직원과 방문객을 위한 공항 및 시내 이동 서비스를 Pannon Transfer 배차팀이 직접 운영합니다.",

  progress: "작성된 필수 항목",

  secTraveler: "탑승자 및 회사",
  secTravelerSub: "탑승자 정보와 연락처",
  secService: "서비스 및 결제",
  secServiceSub: "서비스 등급과 결제 방법을 선택하세요",
  secRoute: "경로 및 일정",
  secRouteSub: "출발지, 도착지, 항공편 및 시간",

  fEmail: "탑승자 이메일",
  fEmailPh: "name@company.com",
  fName: "탑승자 성명",
  fNamePh: "성명",
  fCompany: "회사",
  fPhone: "전화번호",
  fPhonePh: "+36…",
  fPhoneHint: "숫자만 입력하고 국가번호를 포함해 주세요",
  secondTraveler: "두 번째 탑승자",
  optional: "선택",
  optionalPh: "선택 사항",
  fSecondEmail: "두 번째 탑승자 이메일",
  fSecondPhone: "두 번째 탑승자 전화번호",

  fPayment: "결제 방법",
  payCard: "기사에게 신용카드 결제",
  payBank: "계좌 이체",
  fTransferType: "서비스 등급",
  typeStandard: "스탠더드",
  typeStandardSub: "이코노미 등급",
  typeExecutive: "이그제큐티브",
  typeExecutiveSub: "비즈니스 등급",
  upToPax: "최대 {n}명",

  fFrom: "출발",
  fTo: "도착",
  typeAirport: "공항",
  typeOther: "기타 주소",
  fFromAddress: "출발 주소",
  fToAddress: "도착 주소",
  phFromAirport: "예: 부다페스트 리스트 페렌츠 공항 (BUD)",
  phFromOther: "예: Ecopro BM 데브레첸 공장",
  phToAirport: "예: 부다페스트 리스트 페렌츠 공항 (BUD)",
  phToOther: "예: 4031 데브레첸, …",
  fFlight: "항공편명",
  phFlight: "예: LH1234",
  flightHint:
    "기사가 도착 또는 출발 항공편을 확인할 수 있도록 모든 예약에 필수입니다.",
  fDate: "날짜",
  fTime: "시간",
  advanceHint: "출발 {h}시간 전까지 예약해 주세요.",
  fTravelers: "탑승 인원",
  fLuggage: "수하물 개수",
  luggageHint: "총 최대 {n}개",
  fComment: "요청 사항",
  phComment: "특별 요청 또는 안내 사항 (선택)",
  decrease: "감소",
  increase: "증가",

  submit: "예약 제출",
  sending: "예약을 전송하는 중…",
  submitHint: "제출 직후 이메일로 확인 메일이 발송됩니다.",

  errFixTitle: "다음 항목을 수정해 주세요:",
  errRequired: "{field}을(를) 입력해 주세요",
  errEmail: "올바른 이메일 주소를 입력해 주세요",
  errInvalid: "입력한 정보가 올바르지 않습니다. 양식을 확인해 주세요.",
  errServer: "서버 오류가 발생했습니다. 다시 시도해 주세요.",
  errUnexpected: "예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.",
  errNetwork: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",

  okTitle: "예약이 접수되었습니다",
  okSub: "입력하신 주소로 확인 이메일을 보내 드렸습니다.",
  okCode: "예약 번호",
  okNote: "배차 담당자가 예약을 확정하는 즉시 이메일로 알려 드립니다.",
  okMyBookings: "내 예약",
  okNew: "새 예약",

  sumTitle: "예약 요약",
  sumEmpty: "양식을 작성하면 여기에 요약이 바로 표시됩니다.",
  sumRoute: "경로",
  sumWhen: "일시",
  sumPassengers: "인원",
  sumFlight: "항공편",
  sumClass: "등급",
  sumPassengerLine: "{p}명 · 수하물 {l}개",
  sumNoteTitle: "안내 사항",
  sumNote1: "예약은 배차 담당자의 확인 후 확정됩니다.",
  sumNote2: "변경 및 취소는 ‘내 예약’ 페이지에서 가능합니다.",
  sumNote3: "모든 변경 사항은 이메일로 알려 드립니다.",

  needHelp: "도움이 필요하신가요?",
  supportRole: "개발자",
  rights: "모든 권리 보유.",

  srvFlightRequired: "항공편명을 입력해 주세요",
  srvTravelerEmail: "탑승자 이메일을 입력해 주세요",
  srvTravelerName: "탑승자 성명을 입력해 주세요",
  srvTravelerPhone: "탑승자 전화번호를 입력해 주세요",
  srvFromRequired: "출발 주소를 입력해 주세요",
  srvToRequired: "도착 주소를 입력해 주세요",
  srvDateRequired: "탑승 날짜를 입력해 주세요",
  srvTimeRequired: "탑승 시간을 입력해 주세요",
  srvMinPax: "최소 1명의 탑승자가 필요합니다",
  srvLuggageNegative: "수하물 개수는 음수일 수 없습니다",
  srvBadDateTime: "탑승 날짜 또는 시간이 올바르지 않습니다",
  srvMinAdvance: "탑승 시각은 지금부터 최소 {n}시간 이후여야 합니다",
  srvMaxAdvance: "탑승 시각은 지금부터 {n}일 이내여야 합니다",
  srvCityHours: "시내 이동은 {a}부터 {b}까지만 예약할 수 있습니다",
  srvMaxPax: "{type} 등급은 최대 {n}명까지 탑승할 수 있습니다",
  srvMaxLuggage: "{type} 등급은 1인당 최대 {n}개의 수하물이 허용됩니다 (총 {m}개)",
};

const en: Dict = {
  navLabel: "Ecopro BM Transfer Desk",
  navSubline: "Dedicated Ecopro BM portal",
  navBooking: "Booking",
  navMyBookings: "My bookings",
  signOut: "Sign out",
  language: "Language",

  checkingAccess: "Verifying access and session…",
  checkingAccessSub: "Pannon Transfer · Access check",
  portalName: "Ecopro BM Portal",
  preparing: "Preparing the portal…",
  premiumTag: "Premium corporate transfers",

  heroEyebrow: "Dedicated corporate portal",
  heroTitle: "Book your|transfer",
  heroSubtitle:
    "Airport and city transfers for Ecopro BM employees and guests, organised by the Pannon Transfer dispatch team.",

  progress: "Required fields completed",

  secTraveler: "Passenger & company",
  secTravelerSub: "Who is travelling and how we can reach them",
  secService: "Service & payment",
  secServiceSub: "Choose the service class and the payment method",
  secRoute: "Route & schedule",
  secRouteSub: "Pick-up, drop-off, flight and time",

  fEmail: "Passenger's email address",
  fEmailPh: "name@company.com",
  fName: "Passenger's full name",
  fNamePh: "Full name",
  fCompany: "Company",
  fPhone: "Phone number",
  fPhonePh: "+36…",
  fPhoneHint: "Digits only, including the country code",
  secondTraveler: "Second passenger",
  optional: "optional",
  optionalPh: "Optional",
  fSecondEmail: "Second passenger's email address",
  fSecondPhone: "Second passenger's phone number",

  fPayment: "Payment method",
  payCard: "Credit card to the driver",
  payBank: "Bank transfer",
  fTransferType: "Service class",
  typeStandard: "Standard",
  typeStandardSub: "Economy class",
  typeExecutive: "Executive",
  typeExecutiveSub: "Business class",
  upToPax: "Up to {n} passengers",

  fFrom: "Pick-up",
  fTo: "Drop-off",
  typeAirport: "Airport",
  typeOther: "Other address",
  fFromAddress: "Pick-up address",
  fToAddress: "Drop-off address",
  phFromAirport: "e.g. Budapest Liszt Ferenc Airport (BUD)",
  phFromOther: "e.g. Ecopro BM plant in Debrecen",
  phToAirport: "e.g. Budapest Liszt Ferenc Airport (BUD)",
  phToOther: "e.g. 4031 Debrecen, …",
  fFlight: "Flight number",
  phFlight: "e.g. LH1234",
  flightHint:
    "Required for every booking so that the driver can track the arrival or departure.",
  fDate: "Date",
  fTime: "Time",
  advanceHint: "Please book at least {h} hours before departure.",
  fTravelers: "Number of passengers",
  fLuggage: "Number of luggage items",
  luggageHint: "Up to {n} items in total",
  fComment: "Notes",
  phComment: "Special request or instructions (optional)",
  decrease: "Decrease",
  increase: "Increase",

  submit: "Submit booking",
  sending: "Sending booking…",
  submitHint: "We send an email confirmation immediately after submission.",

  errFixTitle: "Please correct the following:",
  errRequired: "{field} is required",
  errEmail: "Please enter a valid email address",
  errInvalid: "The details provided are invalid. Please check the form.",
  errServer: "A server error occurred. Please try again.",
  errUnexpected: "An unexpected error occurred. Please try again.",
  errNetwork: "A network error occurred. Please try again.",

  okTitle: "Your booking has been received",
  okSub: "We have sent a confirmation email to the address provided.",
  okCode: "Booking reference",
  okNote:
    "We will notify you by email as soon as our dispatcher confirms the booking.",
  okMyBookings: "My bookings",
  okNew: "New booking",

  sumTitle: "Booking summary",
  sumEmpty: "Fill in the form and your summary will appear here instantly.",
  sumRoute: "Route",
  sumWhen: "Date & time",
  sumPassengers: "Passengers",
  sumFlight: "Flight",
  sumClass: "Class",
  sumPassengerLine: "{p} passengers · {l} luggage",
  sumNoteTitle: "Good to know",
  sumNote1: "The booking becomes final once the dispatcher confirms it.",
  sumNote2: "You can modify or cancel it on the My bookings page.",
  sumNote3: "We notify you by email about every change.",

  needHelp: "Need help?",
  supportRole: "Developer",
  rights: "All rights reserved.",

  srvFlightRequired: "A flight number is required",
  srvTravelerEmail: "The passenger's email address is required",
  srvTravelerName: "The passenger's name is required",
  srvTravelerPhone: "The passenger's phone number is required",
  srvFromRequired: "The pick-up address is required",
  srvToRequired: "The drop-off address is required",
  srvDateRequired: "The pick-up date is required",
  srvTimeRequired: "The pick-up time is required",
  srvMinPax: "At least 1 passenger is required",
  srvLuggageNegative: "The number of luggage items cannot be negative",
  srvBadDateTime: "The pick-up date or time is invalid",
  srvMinAdvance: "The pick-up must be at least {n} hours in the future",
  srvMaxAdvance: "The pick-up can be at most {n} days in the future",
  srvCityHours: "City transfers can only be booked between {a} and {b}",
  srvMaxPax: "A maximum of {n} passengers can travel in the {type} class",
  srvMaxLuggage:
    "The {type} class allows up to {n} luggage items per passenger ({m} in total)",
};

const DICTS: Record<EcoproBmLang, Dict> = { hu, en, ko };

export function ecoproBmText(
  lang: EcoproBmLang,
  key: string,
  params?: Record<string, string | number>,
): string {
  let text = DICTS[lang][key] ?? DICTS.hu[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}

const EXACT_SERVER: Record<string, string> = {
  "Az utas e-mail címe kötelező": "srvTravelerEmail",
  "Az utas neve kötelező": "srvTravelerName",
  "Az utas telefonszáma kötelező": "srvTravelerPhone",
  "A kiindulási cím kötelező": "srvFromRequired",
  "A célállomás címe kötelező": "srvToRequired",
  "Reptéri transzfernél a járatszám megadása kötelező": "srvFlightRequired",
  "Az átvétel dátuma kötelező": "srvDateRequired",
  "Az átvétel időpontja kötelező": "srvTimeRequired",
  "Legalább 1 utas szükséges": "srvMinPax",
  "A csomagok száma nem lehet negatív": "srvLuggageNegative",
  "Érvénytelen átvétel időpont": "srvBadDateTime",
};

function transferTypeName(lang: EcoproBmLang, raw: string): string {
  return raw === "Standard"
    ? ecoproBmText(lang, "typeStandard")
    : ecoproBmText(lang, "typeExecutive");
}

/**
 * A foglalási API magyar nyelvű hibaüzeneteit a portál nyelvére fordítja.
 * Ismeretlen üzenet esetén általános, lokalizált hibaüzenetet ad, így nem
 * jelenik meg idegen nyelvű szöveg a felületen.
 */
export function translateEcoproBmServerMessage(
  lang: EcoproBmLang,
  message: string,
): string {
  const trimmed = String(message || "").trim();
  if (!trimmed) return ecoproBmText(lang, "errInvalid");

  const exactKey = EXACT_SERVER[trimmed];
  if (exactKey) return ecoproBmText(lang, exactKey);

  let m = trimmed.match(
    /^Az átvételnek legalább (\d+) órával a jövőben kell lennie$/,
  );
  if (m) return ecoproBmText(lang, "srvMinAdvance", { n: m[1] });

  m = trimmed.match(/^Az átvétel nem lehet több mint (\d+) nap a jövőben$/);
  if (m) return ecoproBmText(lang, "srvMaxAdvance", { n: m[1] });

  m = trimmed.match(
    /^Városi transzferek csak (\S+) és (\S+) között engedélyezettek$/,
  );
  if (m) return ecoproBmText(lang, "srvCityHours", { a: m[1], b: m[2] });

  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat$/,
  );
  if (m) {
    return ecoproBmText(lang, "srvMaxPax", {
      type: transferTypeName(lang, m[1]),
      n: m[2],
    });
  }

  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)$/,
  );
  if (m) {
    return ecoproBmText(lang, "srvMaxLuggage", {
      type: transferTypeName(lang, m[1]),
      n: m[2],
      m: m[3],
    });
  }

  return ecoproBmText(lang, "errInvalid");
}
