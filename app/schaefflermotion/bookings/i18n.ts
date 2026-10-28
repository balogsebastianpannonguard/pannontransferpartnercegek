import type { MxLang } from "../lang";
import { MX_LOCALE } from "../lang";

export type { MxLang };

const en = {
  navBooking: "Booking",
  navMyBookings: "My Bookings",
  portalLabel: "Dedicated Schaeffler Motion Portal",
  signOut: "Sign out",
  verifyingAccess: "Verifying your access and session…",
  preparingWorkspace: "Preparing your workspace…",
  premiumTagline: "Premium Corporate Transfer",
  footerPortal: "Schaeffler Motion Dedicated Client Portal",
  footerSupport: "Dedicated customer support",
  rightsReserved: "All rights reserved.",
  timesNote: "All times are shown in Budapest time (CET/CEST).",

  eyebrow: "Booking Manager",
  pageTitle: "My Bookings",
  pageSubtitle: "Live status and full details of every transfer booked by your account.",
  refresh: "Refresh",
  newBooking: "New booking",
  searchPlaceholder: "Search by code, passenger, address or flight…",
  lastUpdated: "Auto-refreshes every 15 seconds",

  statTotal: "All bookings",
  statPending: "Awaiting confirmation",
  statConfirmed: "Confirmed",
  statClosed: "Completed / cancelled",
  badgePending: "Pending",
  badgeActive: "Active",
  badgeClosed: "Closed",

  filterAll: "All",
  filterPending: "Pending",
  filterConfirmed: "Confirmed",
  filterClosed: "Closed",

  statusPending: "Pending",
  statusModified: "Modified",
  statusConfirmed: "Confirmed",
  statusInProgress: "In progress",
  statusCompleted: "Completed",
  statusCancelled: "Cancelled",

  loadingBookings: "Loading your bookings…",
  emptyTitle: "No bookings found",
  emptyBody: "There are no bookings for the current filter. Create a new transfer on the booking page.",
  emptySearch: "No booking matches your search.",
  goBook: "Go to the booking page",
  clearSearch: "Clear search",

  from: "From",
  to: "To",
  pickup: "Pickup",
  flight: "Flight number",
  noFlight: "Not provided",
  vehicleClass: "Transfer type",
  passengers: "Passengers",
  luggage: "Luggage",
  payment: "Payment",
  driverVehicle: "Driver & vehicle",
  driverPending: "Assignment pending",
  driverNotified: "Driver notified",
  driverAcknowledged: "Driver acknowledged",
  standard: "Standard",
  standardSub: "Economy Class",
  executive: "Executive",
  executiveSub: "Business Class",
  payCard: "Credit card to the driver",
  payBank: "Bank transfer",
  payCash: "Cash",
  paxUnit: "{n} pax",
  bagUnit: "{n} pcs",

  details: "Details",
  hideDetails: "Hide details",
  modify: "Modify",
  cancel: "Cancel",

  secTrip: "Trip",
  secPassenger: "Passenger",
  secSecond: "Second passenger",
  secCompany: "Company & payment",
  secDriver: "Driver & vehicle",
  secComment: "Comment",
  secTimeline: "Booking history",
  secTracking: "Passenger tracking",
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  price: "Price",
  priceNotSet: "To be confirmed",
  portal: "Portal",
  bookingCode: "Booking code",
  noComment: "No comment",
  createdAt: "Created",
  updatedAt: "Last updated",
  statusChangedAt: "Status last changed",
  statusChange: "{from} → {to}",
  trackingHint: "Share this link with your passenger to follow the transfer.",
  openTracking: "Open tracking page",
  copyTracking: "Copy link",
  copied: "Link copied to clipboard.",
  trackingInactive: "The tracking link is no longer active.",

  notifTitle: "Status updates",
  dismissAll: "Dismiss all",
  view: "View",
  dismiss: "Dismiss",
  notifConfirmed: "Your booking has been confirmed.",
  notifModified: "The dispatcher has modified your booking.",
  notifCancelled: "Your booking has been cancelled.",
  notifInProgress: "Your booking is now in progress.",
  notifCompleted: "Your booking has been completed.",
  notifDefault: "The status of your booking has changed.",
  dispatcherModified: "The dispatcher modified the booking.",

  editTitle: "Modify booking",
  date: "Date",
  time: "Time",
  fromAddress: "Pickup address",
  toAddress: "Destination address",
  paxCount: "Number of passengers",
  bagCount: "Number of bags",
  commentLabel: "Comment",
  commentPlaceholder: "Special requests or instructions…",
  phoneLabel: "Passenger phone number",
  flightLabel: "Flight number",
  flightPlaceholder: "e.g. LH1234",
  flightRequired: "The flight number is required for airport transfers.",
  required: "This field is required.",
  fixErrors: "Please correct the issues below.",
  noticeTitle: "Please note",
  noticeBody: "Changes are checked against the booking conditions (minimum notice, capacity and operating hours).",
  back: "Back",
  saving: "Saving…",
  saveChanges: "Save changes",

  cancelTitle: "Are you sure you want to cancel this booking?",
  refundTitle: "Refund",
  refundBody: "No refund is available after cancellation.",
  driverTitle: "Driver",
  driverBody: "The assigned driver is released automatically.",
  keepBooking: "Keep booking",
  processing: "Processing…",
  confirmCancel: "Cancel booking",

  toastUpdated: "Booking updated successfully.",
  toastCancelled: "Booking cancelled successfully.",
  toastNetwork: "A network error occurred. Please try again.",
  toastUpdateFailed: "The update could not be completed.",
  toastCancelFailed: "The cancellation could not be completed.",
  toastGeneric: "The request could not be completed. Please check your details and try again.",

  srvSession: "Your session has expired. Please sign in again.",
  srvNotFound: "The booking could not be found.",
  srvForbidden: "You do not have permission to change this booking.",
  srvUpdateFailed: "The booking could not be updated.",
  srvMinAdvance: "The pickup must be at least {n} hours in the future.",
  srvMaxAdvance: "The pickup cannot be more than {n} days in the future.",
  srvCityHours: "City transfers are only available between {a} and {b}.",
  srvMaxPax: "{type} transfers can carry a maximum of {n} passengers.",
  srvMaxBags: "{type} transfers allow up to {n} bags per passenger ({t} in total).",
  srvFlight: "The flight number is required for airport transfers.",
  srvInvalidTime: "The pickup time is invalid.",
  srvFrom: "The pickup address is required.",
  srvTo: "The destination address is required.",
  srvDate: "The pickup date is required.",
  srvTimeReq: "The pickup time is required.",
  srvPax: "At least 1 passenger is required.",
  srvBags: "The number of bags cannot be negative.",
  srvPhone: "The passenger phone number is required.",

  fieldPickupDate: "Pickup date",
  fieldPickupTime: "Pickup time",
  fieldFromAddress: "Pickup address",
  fieldToAddress: "Destination address",
  fieldFlight: "Flight number",
  fieldPax: "Passengers",
  fieldBags: "Bags",
  fieldComment: "Dispatcher comment",
  fieldDriver: "Driver",
  fieldVehicle: "Vehicle",
  fieldStatus: "Booking status",
  fieldPrice: "Price",
  fieldCompany: "Company name",
  fieldPayment: "Payment method",
  fieldGeneric: "Detail",
} as const;

export type MxKey = keyof typeof en;

const hu: Record<MxKey, string> = {
  navBooking: "Foglalás",
  navMyBookings: "Foglalásaim",
  portalLabel: "Dedikált Schaeffler Motion portál",
  signOut: "Kijelentkezés",
  verifyingAccess: "Hozzáférés és munkamenet ellenőrzése…",
  preparingWorkspace: "Munkaterület előkészítése…",
  premiumTagline: "Prémium céges transzfer",
  footerPortal: "Schaeffler Motion dedikált ügyfélportál",
  footerSupport: "Dedikált ügyfélszolgálat",
  rightsReserved: "Minden jog fenntartva.",
  timesNote: "Minden időpont budapesti idő szerint (CET/CEST) látható.",

  eyebrow: "Foglaláskezelő",
  pageTitle: "Foglalásaim",
  pageSubtitle: "A fiókjával leadott minden transzfer élő állapota és teljes részletei.",
  refresh: "Frissítés",
  newBooking: "Új foglalás",
  searchPlaceholder: "Keresés kód, utas, cím vagy járat alapján…",
  lastUpdated: "15 másodpercenként automatikusan frissül",

  statTotal: "Összes foglalás",
  statPending: "Megerősítésre vár",
  statConfirmed: "Megerősítve",
  statClosed: "Teljesítve / lemondva",
  badgePending: "Függőben",
  badgeActive: "Aktív",
  badgeClosed: "Lezárt",

  filterAll: "Összes",
  filterPending: "Függőben",
  filterConfirmed: "Megerősítve",
  filterClosed: "Lezárt",

  statusPending: "Beérkezett",
  statusModified: "Módosított",
  statusConfirmed: "Megerősítve",
  statusInProgress: "Folyamatban",
  statusCompleted: "Teljesítve",
  statusCancelled: "Lemondva",

  loadingBookings: "Foglalások betöltése…",
  emptyTitle: "Nincs foglalás",
  emptyBody: "A jelenlegi szűrőre nincs foglalás. Hozzon létre új transzfert a foglalási oldalon.",
  emptySearch: "A keresésnek egyetlen foglalás sem felel meg.",
  goBook: "Tovább a foglaláshoz",
  clearSearch: "Keresés törlése",

  from: "Honnan",
  to: "Hova",
  pickup: "Felvétel",
  flight: "Járatszám",
  noFlight: "Nincs megadva",
  vehicleClass: "Transzfer típusa",
  passengers: "Utasok",
  luggage: "Csomagok",
  payment: "Fizetés",
  driverVehicle: "Sofőr és jármű",
  driverPending: "Beosztás folyamatban",
  driverNotified: "Sofőr értesítve",
  driverAcknowledged: "Sofőr visszaigazolta",
  standard: "Standard",
  standardSub: "Economy osztály",
  executive: "Executive",
  executiveSub: "Business osztály",
  payCard: "Bankkártya a sofőrnél",
  payBank: "Banki átutalás",
  payCash: "Készpénz",
  paxUnit: "{n} fő",
  bagUnit: "{n} db",

  details: "Részletek",
  hideDetails: "Részletek elrejtése",
  modify: "Módosítás",
  cancel: "Lemondás",

  secTrip: "Út",
  secPassenger: "Utas",
  secSecond: "Második utas",
  secCompany: "Cég és fizetés",
  secDriver: "Sofőr és jármű",
  secComment: "Megjegyzés",
  secTimeline: "Foglalási előzmények",
  secTracking: "Utaskövetés",
  name: "Név",
  email: "E-mail",
  phone: "Telefon",
  company: "Cég",
  price: "Ár",
  priceNotSet: "Megerősítés alatt",
  portal: "Portál",
  bookingCode: "Foglalási kód",
  noComment: "Nincs megjegyzés",
  createdAt: "Létrehozva",
  updatedAt: "Utoljára módosítva",
  statusChangedAt: "Állapot utolsó változása",
  statusChange: "{from} → {to}",
  trackingHint: "Ossza meg ezt a linket az utasával, hogy követhesse a transzfert.",
  openTracking: "Követőoldal megnyitása",
  copyTracking: "Link másolása",
  copied: "A link a vágólapra került.",
  trackingInactive: "A követő link már nem aktív.",

  notifTitle: "Állapotfrissítések",
  dismissAll: "Mind elrejtése",
  view: "Megnyitás",
  dismiss: "Elrejtés",
  notifConfirmed: "A foglalását megerősítettük.",
  notifModified: "A diszpécser módosította a foglalását.",
  notifCancelled: "A foglalását lemondták.",
  notifInProgress: "A foglalása folyamatban van.",
  notifCompleted: "A foglalása teljesült.",
  notifDefault: "A foglalása állapota megváltozott.",
  dispatcherModified: "A diszpécser módosította a foglalást.",

  editTitle: "Foglalás módosítása",
  date: "Dátum",
  time: "Időpont",
  fromAddress: "Felvételi cím",
  toAddress: "Úti cél címe",
  paxCount: "Utasok száma",
  bagCount: "Csomagok száma",
  commentLabel: "Megjegyzés",
  commentPlaceholder: "Különleges kérés vagy útmutatás…",
  phoneLabel: "Utas telefonszáma",
  flightLabel: "Járatszám",
  flightPlaceholder: "pl. LH1234",
  flightRequired: "Repülőtéri transzfernél a járatszám megadása kötelező.",
  required: "Ez a mező kötelező.",
  fixErrors: "Kérjük, javítsa az alábbi hibákat.",
  noticeTitle: "Kérjük, vegye figyelembe",
  noticeBody: "A módosításokat ellenőrizzük a foglalási feltételek (minimális előfoglalási idő, kapacitás és üzemidő) szerint.",
  back: "Vissza",
  saving: "Mentés…",
  saveChanges: "Módosítások mentése",

  cancelTitle: "Biztosan lemondja ezt a foglalást?",
  refundTitle: "Visszatérítés",
  refundBody: "A lemondás után nem jár visszatérítés.",
  driverTitle: "Sofőr",
  driverBody: "A beosztott sofőr automatikusan felszabadul.",
  keepBooking: "Foglalás megtartása",
  processing: "Feldolgozás…",
  confirmCancel: "Foglalás lemondása",

  toastUpdated: "A foglalás sikeresen módosítva.",
  toastCancelled: "A foglalás sikeresen lemondva.",
  toastNetwork: "Hálózati hiba történt. Kérjük, próbálja újra.",
  toastUpdateFailed: "A módosítást nem sikerült végrehajtani.",
  toastCancelFailed: "A lemondást nem sikerült végrehajtani.",
  toastGeneric: "A kérést nem sikerült teljesíteni. Kérjük, ellenőrizze az adatokat, és próbálja újra.",

  srvSession: "A munkamenet lejárt. Kérjük, jelentkezzen be újra.",
  srvNotFound: "A foglalás nem található.",
  srvForbidden: "Nincs jogosultsága módosítani ezt a foglalást.",
  srvUpdateFailed: "A foglalást nem sikerült módosítani.",
  srvMinAdvance: "Az átvételnek legalább {n} órával a jövőben kell lennie.",
  srvMaxAdvance: "Az átvétel nem lehet több mint {n} nap a jövőben.",
  srvCityHours: "Városi transzferek csak {a} és {b} között engedélyezettek.",
  srvMaxPax: "{type} transzferen legfeljebb {n} utas utazhat.",
  srvMaxBags: "{type} transzferen legfeljebb {n} csomag/utas engedélyezett (összesen {t}).",
  srvFlight: "Repülőtéri transzfernél a járatszám megadása kötelező.",
  srvInvalidTime: "Érvénytelen átvételi időpont.",
  srvFrom: "A felvételi cím megadása kötelező.",
  srvTo: "Az úti cél címének megadása kötelező.",
  srvDate: "Az átvétel dátumának megadása kötelező.",
  srvTimeReq: "Az átvétel időpontjának megadása kötelező.",
  srvPax: "Legalább 1 utas szükséges.",
  srvBags: "A csomagok száma nem lehet negatív.",
  srvPhone: "Az utas telefonszámának megadása kötelező.",

  fieldPickupDate: "Felvétel dátuma",
  fieldPickupTime: "Felvételi időpont",
  fieldFromAddress: "Felvételi cím",
  fieldToAddress: "Úti cél címe",
  fieldFlight: "Járatszám",
  fieldPax: "Utasok",
  fieldBags: "Csomagok",
  fieldComment: "Diszpécseri megjegyzés",
  fieldDriver: "Sofőr",
  fieldVehicle: "Jármű",
  fieldStatus: "Foglalás állapota",
  fieldPrice: "Ár",
  fieldCompany: "Cégnév",
  fieldPayment: "Fizetési mód",
  fieldGeneric: "Adat",
};

export const DICT: Record<MxLang, Record<MxKey, string>> = { en, hu };

export type Translator = (key: MxKey, params?: Record<string, string | number>) => string;

export function makeT(lang: MxLang): Translator {
  return (key, params) => {
    let text: string = DICT[lang][key] ?? DICT.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.split(`{${k}}`).join(String(v));
      }
    }
    return text;
  };
}

export function formatPickupDate(dateStr: string, lang: MxLang): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || "");
  if (!m) return dateStr || "—";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat(MX_LOCALE[lang], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatTimestamp(ts: number | undefined, lang: MxLang): string {
  if (!ts) return "—";
  return new Intl.DateTimeFormat(MX_LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Budapest",
  }).format(new Date(ts));
}

export function formatPrice(price: number, lang: MxLang): string {
  return lang === "hu" ? `${price.toLocaleString(MX_LOCALE.hu)} Ft` : `${price.toLocaleString(MX_LOCALE.en)} HUF`;
}

export const STATUS_KEY: Record<string, MxKey> = {
  pending: "statusPending",
  modified: "statusModified",
  confirmed: "statusConfirmed",
  "in-progress": "statusInProgress",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

const HU_CHARS = /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/;

function transferTypeLabel(raw: string): string {
  return /executive/i.test(raw) ? "Executive" : "Standard";
}

/** The shared API answers in Hungarian: kept as-is in Hungarian mode, translated in English mode. */
export function translateServerMessage(raw: string | undefined | null, lang: MxLang): string {
  const t = makeT(lang);
  const msg = String(raw || "").trim();
  if (!msg) return t("toastGeneric");
  if (lang === "hu") return msg;

  let m: RegExpExecArray | null;
  if (/Nincs aktív munkamenet/i.test(msg)) return t("srvSession");
  if (/A foglalás nem található/i.test(msg)) return t("srvNotFound");
  if (/Nincs jogosultság/i.test(msg)) return t("srvForbidden");
  if (/A foglalás módosítása sikertelen|Módosítás sikertelen/i.test(msg)) return t("srvUpdateFailed");
  if ((m = /legalább (\d+) órával a jövőben/i.exec(msg))) return t("srvMinAdvance", { n: m[1] });
  if ((m = /nem lehet több mint (\d+) nap a jövőben/i.exec(msg))) return t("srvMaxAdvance", { n: m[1] });
  if ((m = /csak (\S+) és (\S+) között engedélyezettek/i.exec(msg))) return t("srvCityHours", { a: m[1], b: m[2] });
  if ((m = /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)/i.exec(msg))) {
    return t("srvMaxBags", { type: transferTypeLabel(m[1]), n: m[2], t: m[3] });
  }
  if ((m = /^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat/i.exec(msg))) {
    return t("srvMaxPax", { type: transferTypeLabel(m[1]), n: m[2] });
  }
  if (/járatszám megadása kötelező/i.test(msg)) return t("srvFlight");
  if (/Érvénytelen átvétel időpont/i.test(msg)) return t("srvInvalidTime");
  if (/kiindulási cím kötelező/i.test(msg)) return t("srvFrom");
  if (/célállomás címe kötelező/i.test(msg)) return t("srvTo");
  if (/átvétel dátuma kötelező/i.test(msg)) return t("srvDate");
  if (/átvétel időpontja kötelező/i.test(msg)) return t("srvTimeReq");
  if (/Legalább 1 utas/i.test(msg)) return t("srvPax");
  if (/csomagok száma nem lehet negatív/i.test(msg)) return t("srvBags");
  if (/telefonszáma kötelező/i.test(msg)) return t("srvPhone");

  if (HU_CHARS.test(msg) || /\b(foglal|utas|hiba|sikertelen|kötelező|diszpécser|sofőr)/i.test(msg)) {
    return t("toastGeneric");
  }
  return msg;
}

const FIELD_LABEL_KEY: Record<string, MxKey> = {
  "Felvétel dátuma": "fieldPickupDate",
  "Felvételi időpont": "fieldPickupTime",
  "Felvételi cím": "fieldFromAddress",
  "Érkezési cím": "fieldToAddress",
  "Flight number / Járatszám": "fieldFlight",
  "Utasok száma": "fieldPax",
  "Csomagok száma": "fieldBags",
  "Diszpécseri megjegyzés": "fieldComment",
  "Sofőr": "fieldDriver",
  "Jármű": "fieldVehicle",
  "Foglalás állapota": "fieldStatus",
  "Ár": "fieldPrice",
  "Cégnév": "fieldCompany",
  "Fizetési mód": "fieldPayment",
};

function localizeChangeValue(value: string, lang: MxLang): string {
  const t = makeT(lang);
  const statusKey = STATUS_KEY[value];
  if (statusKey) return t(statusKey);
  if (value === "card") return t("payCard");
  if (value === "bank") return t("payBank");
  if (value === "cash") return t("payCash");
  return value;
}

/** Dispatcher modification text for the notification panel (Hungarian passes through, English is translated). */
export function localizeNotificationDetails(raw: string | undefined, lang: MxLang): string | undefined {
  if (!raw) return undefined;
  const t = makeT(lang);
  let text = raw.trim();
  if (lang === "hu") {
    return text.split(";").map((part) => {
      const arrow = part.split("→");
      if (arrow.length !== 2) return part;
      const [left, right] = arrow;
      const colon = left.lastIndexOf(":");
      const prefix = colon >= 0 ? left.slice(0, colon + 1) : "";
      const oldVal = (colon >= 0 ? left.slice(colon + 1) : left).trim();
      return `${prefix} ${localizeChangeValue(oldVal, lang)} → ${localizeChangeValue(right.trim(), lang)}`.trim();
    }).join("; ");
  }
  text = text.replace(/A diszpécser módosította a foglalás(át)?\.?/gi, t("dispatcherModified"));

  const known = Object.keys(FIELD_LABEL_KEY).sort((a, b) => b.length - a.length);
  for (const label of known) {
    if (text.includes(label)) {
      text = text.split(`${label}:`).join(`${t(FIELD_LABEL_KEY[label])}:`);
    }
  }
  text = text.replace(/Adat:/g, `${t("fieldGeneric")}:`);
  text = text
    .split(";")
    .map((part) => {
      const arrow = part.split("→");
      if (arrow.length !== 2) return part;
      const [left, right] = arrow;
      const colon = left.lastIndexOf(":");
      const prefix = colon >= 0 ? left.slice(0, colon + 1) : "";
      const oldVal = (colon >= 0 ? left.slice(colon + 1) : left).trim();
      const newVal = right.trim();
      return `${prefix} ${localizeChangeValue(oldVal, lang)} → ${localizeChangeValue(newVal, lang)}`.trim();
    })
    .join("; ");

  if (/diszpécser|foglalás|módosít|időpont|címe?\b|utas|csomag|megjegyzés/i.test(text)) {
    return t("dispatcherModified");
  }
  return text;
}
