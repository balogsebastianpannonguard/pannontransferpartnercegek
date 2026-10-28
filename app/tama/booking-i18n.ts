import type { TamaLang } from "./lang";

type Dict = Record<string, string>;

const hu: Dict = {
  navLabel: "TAMA Foglalási Pult",
  navSubline: "Dedikált TAMA partnerportál",
  navBooking: "Foglalás",
  navMyBookings: "Foglalásaim",
  signOut: "Kijelentkezés",
  language: "Nyelv",

  checkingAccess: "Hozzáférés és munkamenet ellenőrzése…",
  checkingAccessSub: "Pannon Transfer · Hozzáférés ellenőrzése",
  portalName: "TAMA portál",
  preparing: "A portál előkészítése…",
  premiumTag: "Prémium vállalati transzfer",

  heroEyebrow: "Dedikált vállalati portál",
  heroTitle: "Foglalja le transzferét",
  heroSubtitle:
    "Reptéri és városi transzferek a TAMA Hungary Kft. munkatársai és vendégei számára – a részletekről a Pannon Transfer diszpécserei gondoskodnak.",

  progress: "Kitöltött kötelező mezők",

  secTraveler: "Utas és cég adatai",
  secTravelerSub: "Ki utazik, és hogyan érhetjük el",
  secService: "Szolgáltatás és fizetés",
  secServiceSub: "Válassza ki a járműkategóriát és a fizetési módot",
  secRoute: "Útvonal és időpont",
  secRouteSub: "Felvétel, érkezés, járat és időzítés",

  fEmail: "Az utas e-mail címe",
  fEmailPh: "nev@ceg.hu",
  fName: "Az utas teljes neve",
  fNamePh: "Teljes név",
  fCompany: "Cég",
  fPhone: "Telefonszám",
  fPhonePh: "+36…",
  fPhoneHint: "Csak számok, országhívóval együtt",
  secondTraveler: "Második utas",
  optional: "nem kötelező",
  optionalPh: "Nem kötelező",
  fSecondEmail: "A második utas e-mail címe",
  fSecondPhone: "A második utas telefonszáma",

  fPayment: "Fizetési mód",
  payCard: "Bankkártyával a sofőrnél",
  payBank: "Banki átutalás",
  fTransferType: "Transzfer típusa",
  typeStandard: "Standard",
  typeStandardSub: "Gazdaságos kategória",
  typeExecutive: "Executive",
  typeExecutiveSub: "Üzleti kategória",
  upToPax: "Legfeljebb {n} utas",

  fFrom: "Felvétel",
  fTo: "Érkezés",
  typeAirport: "Repülőtér",
  typeOther: "Egyéb cím",
  fFromAddress: "Felvételi cím",
  fToAddress: "Érkezési cím",
  phFromAirport: "pl. Budapest Liszt Ferenc Repülőtér (BUD)",
  phFromOther: "pl. 4031 Debrecen, …",
  phToAirport: "pl. Budapest Liszt Ferenc Repülőtér (BUD)",
  phToOther: "pl. 4031 Debrecen, …",
  fFlight: "Járatszám",
  phFlight: "pl. LH1234",
  flightHint: "Minden foglaláshoz kötelező, hogy a sofőr nyomon követhesse az érkezést vagy az indulást.",
  fDate: "Dátum",
  fTime: "Időpont",
  advanceHint: "Kérjük, legalább {h} órával az indulás előtt foglaljon.",
  fTravelers: "Utasok száma",
  fLuggage: "Csomagok száma",
  luggageHint: "Összesen legfeljebb {n} darab",
  fComment: "Megjegyzés",
  phComment: "Különleges kérés vagy útmutatás (nem kötelező)",
  decrease: "Csökkentés",
  increase: "Növelés",

  submit: "Foglalás elküldése",
  sending: "Foglalás küldése…",
  submitHint: "A beküldés után azonnal e-mailben visszaigazoljuk a foglalását.",

  errFixTitle: "Kérjük, javítsa az alábbiakat:",
  errRequired: "{field} megadása kötelező",
  errEmail: "Adjon meg érvényes e-mail címet",
  errInvalid: "A megadott adatok érvénytelenek. Kérjük, ellenőrizze az űrlapot.",
  errServer: "Szerverhiba történt. Kérjük, próbálja újra.",
  errUnexpected: "Váratlan hiba történt. Kérjük, próbálja újra.",
  errNetwork: "Hálózati hiba történt. Kérjük, próbálja újra.",

  okTitle: "A foglalás elküldve",
  okSub: "A visszaigazoló e-mailt elküldtük a címére.",
  okCode: "Foglalási azonosító",
  okNote: "Amint diszpécserünk megerősíti a foglalást, e-mailben értesítjük.",
  okMyBookings: "Foglalásaim",
  okNew: "Új foglalás",

  needHelp: "Segítségre van szüksége?",
  supportRole: "Fejlesztő",
  rights: "Minden jog fenntartva.",
  footerTag: "Dedikált ügyfélportál",

  srvFlightRequired: "A járatszám megadása kötelező",
  srvTravelerEmail: "Az utas e-mail címe kötelező",
  srvTravelerName: "Az utas neve kötelező",
  srvTravelerPhone: "Az utas telefonszáma kötelező",
  srvFromRequired: "A felvételi cím megadása kötelező",
  srvToRequired: "Az érkezési cím megadása kötelező",
  srvDateRequired: "A felvétel dátuma kötelező",
  srvTimeRequired: "A felvétel időpontja kötelező",
  srvMinPax: "Legalább 1 utas szükséges",
  srvLuggageNegative: "A csomagok száma nem lehet negatív",
  srvBadDateTime: "Érvénytelen felvételi dátum vagy időpont",
  srvMinAdvance: "A felvételnek legalább {n} órával a jövőben kell lennie",
  srvMaxAdvance: "A felvétel legfeljebb {n} nappal előre foglalható",
  srvCityHours: "Városi transzfer csak {a} és {b} között foglalható",
  srvMaxPax: "{type} transzferen legfeljebb {n} utas utazhat",
  srvMaxLuggage: "{type} transzferen utasonként legfeljebb {n} csomag engedélyezett (összesen {m})",
};

const en: Dict = {
  navLabel: "TAMA Booking Desk",
  navSubline: "Dedicated TAMA partner portal",
  navBooking: "Booking",
  navMyBookings: "My bookings",
  signOut: "Sign out",
  language: "Language",

  checkingAccess: "Checking access and session…",
  checkingAccessSub: "Pannon Transfer · Verifying access",
  portalName: "TAMA portal",
  preparing: "Preparing your portal…",
  premiumTag: "Premium corporate transfer",

  heroEyebrow: "Dedicated corporate portal",
  heroTitle: "Book your transfer",
  heroSubtitle:
    "Airport and city transfers for TAMA Hungary Kft. colleagues and guests, arranged by the Pannon Transfer dispatch team.",

  progress: "Required fields completed",

  secTraveler: "Traveler & company",
  secTravelerSub: "Who is travelling and how we can reach them",
  secService: "Service & payment",
  secServiceSub: "Choose the vehicle class and how you would like to pay",
  secRoute: "Route & schedule",
  secRouteSub: "Pick-up, drop-off, flight and timing",

  fEmail: "Traveler's email address",
  fEmailPh: "name@company.com",
  fName: "Traveler's full name",
  fNamePh: "Full name",
  fCompany: "Company",
  fPhone: "Phone number",
  fPhonePh: "+36…",
  fPhoneHint: "Digits only, including the country code",
  secondTraveler: "Second traveler",
  optional: "optional",
  optionalPh: "Optional",
  fSecondEmail: "Second traveler's email",
  fSecondPhone: "Second traveler's phone",

  fPayment: "Payment method",
  payCard: "Credit card at the driver",
  payBank: "Bank transfer",
  fTransferType: "Transfer type",
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
  phFromAirport: "e.g. Budapest Airport (BUD)",
  phFromOther: "e.g. 4031 Debrecen, …",
  phToAirport: "e.g. Budapest Airport (BUD)",
  phToOther: "e.g. 4031 Debrecen, …",
  fFlight: "Flight number",
  phFlight: "e.g. LH1234",
  flightHint: "Required for every booking so the driver can follow your arrival or departure.",
  fDate: "Date",
  fTime: "Time",
  advanceHint: "Please book at least {h} hours in advance.",
  fTravelers: "Passengers",
  fLuggage: "Luggage items",
  luggageHint: "Up to {n} in total",
  fComment: "Notes",
  phComment: "Special requests or instructions (optional)",
  decrease: "Decrease",
  increase: "Increase",

  submit: "Submit booking",
  sending: "Sending your booking…",
  submitHint: "You will receive an email confirmation right after submitting.",

  errFixTitle: "Please correct the following:",
  errRequired: "{field} is required",
  errEmail: "Please enter a valid email address",
  errInvalid: "The submitted data is invalid. Please check the form.",
  errServer: "A server error occurred. Please try again.",
  errUnexpected: "An unexpected error occurred. Please try again.",
  errNetwork: "A network error occurred. Please try again.",

  okTitle: "Booking submitted",
  okSub: "A confirmation email has been sent to your address.",
  okCode: "Booking code",
  okNote: "You will receive an email notification as soon as our dispatcher confirms your booking.",
  okMyBookings: "My bookings",
  okNew: "New booking",

  needHelp: "Need help?",
  supportRole: "Developer",
  rights: "All rights reserved.",
  footerTag: "Dedicated customer portal",

  srvFlightRequired: "The flight number is required",
  srvTravelerEmail: "The traveler's email address is required",
  srvTravelerName: "The traveler's name is required",
  srvTravelerPhone: "The traveler's phone number is required",
  srvFromRequired: "The pick-up address is required",
  srvToRequired: "The drop-off address is required",
  srvDateRequired: "The pick-up date is required",
  srvTimeRequired: "The pick-up time is required",
  srvMinPax: "At least 1 passenger is required",
  srvLuggageNegative: "The number of luggage items cannot be negative",
  srvBadDateTime: "Invalid pick-up date or time",
  srvMinAdvance: "The pick-up must be at least {n} hours in the future",
  srvMaxAdvance: "The pick-up cannot be more than {n} days in the future",
  srvCityHours: "City transfers are only available between {a} and {b}",
  srvMaxPax: "{type} transfers allow at most {n} passengers",
  srvMaxLuggage: "{type} transfers allow at most {n} luggage items per passenger (total {m})",
};

const DICTS: Record<TamaLang, Dict> = { hu, en };

export function tamaText(
  lang: TamaLang,
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

function typeName(lang: TamaLang, raw: string): string {
  return raw === "Standard" ? tamaText(lang, "typeStandard") : tamaText(lang, "typeExecutive");
}

/**
 * A foglalási API magyar validációs üzeneteit a felület nyelvére fordítja.
 * Ismeretlen üzenet esetén általános, lokalizált hibaüzenet jelenik meg.
 */
export function translateTamaServerMessage(lang: TamaLang, message: string): string {
  const trimmed = String(message || "").trim();
  if (!trimmed) return tamaText(lang, "errInvalid");

  const exactKey = EXACT_SERVER[trimmed];
  if (exactKey) return tamaText(lang, exactKey);

  let m = trimmed.match(/^Az átvételnek legalább (\d+) órával a jövőben kell lennie$/);
  if (m) return tamaText(lang, "srvMinAdvance", { n: m[1] });

  m = trimmed.match(/^Az átvétel nem lehet több mint (\d+) nap a jövőben$/);
  if (m) return tamaText(lang, "srvMaxAdvance", { n: m[1] });

  m = trimmed.match(/^Városi transzferek csak (\S+) és (\S+) között engedélyezettek$/);
  if (m) return tamaText(lang, "srvCityHours", { a: m[1], b: m[2] });

  m = trimmed.match(/^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat$/);
  if (m) return tamaText(lang, "srvMaxPax", { type: typeName(lang, m[1]), n: m[2] });

  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)$/,
  );
  if (m) return tamaText(lang, "srvMaxLuggage", { type: typeName(lang, m[1]), n: m[2], m: m[3] });

  // Már angol nyelvű (kliens oldali) szöveg változatlanul átmegy angol felületen.
  if (lang === "en" && /^[\x20-\x7E]+$/.test(trimmed)) return trimmed;
  // Magyar felületen a (magyar) szerverüzenet közvetlenül megjeleníthető.
  if (lang === "hu") return trimmed;
  return tamaText(lang, "errInvalid");
}
