"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/* -------------------------------------------------------------------------- */
/*  Language state (Hungarian / Korean only)                                  */
/* -------------------------------------------------------------------------- */

export type EcoLang = "hu" | "ko";

export const ECO_LANG_STORAGE_KEY = "ecoproinnovation_lang";
const LANG_EVENT = "ecoproinnovation-lang-change";

export const ECO_LANGS: { id: EcoLang; label: string; full: string }[] = [
  { id: "hu", label: "HU", full: "Magyar" },
  { id: "ko", label: "한국어", full: "한국어" },
];

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANG_EVENT, onChange);
  };
}

function getSnapshot(): EcoLang {
  try {
    return localStorage.getItem(ECO_LANG_STORAGE_KEY) === "ko" ? "ko" : "hu";
  } catch {
    return "hu";
  }
}

function getServerSnapshot(): EcoLang {
  return "hu";
}

/** Active portal language (default Hungarian), persisted in localStorage. */
export function useEcoLang(): [EcoLang, (next: EcoLang) => void] {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang === "ko" ? "ko" : "hu";
  }, [lang]);

  const setLang = useCallback((next: EcoLang) => {
    try {
      localStorage.setItem(ECO_LANG_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  return [lang, setLang];
}

/* -------------------------------------------------------------------------- */
/*  Dictionaries                                                              */
/* -------------------------------------------------------------------------- */

const hu = {
  /* shell / navigation */
  navLabel: "Ecopro Innovation Mobility Desk",
  navSubline: "Dedikált partnerportál",
  navBooking: "Foglalás",
  navMyBookings: "Foglalásaim",
  signOut: "Kijelentkezés",
  language: "Nyelv",
  rights: "Minden jog fenntartva.",
  needHelp: "Segítségre van szüksége?",
  supportRole: "Fejlesztő",
  support: "Támogatás",
  footerTag: "Dedikált ügyfélportál",
  footerSupport: "Dedikált ügyféltámogatás",
  timesNote: "Az időpontok budapesti idő szerint (CET/CEST) szerepelnek.",

  /* access check / boot */
  checkingAccess: "Hozzáférés és munkamenet ellenőrzése…",
  checkingAccessSub: "Pannon Transfer · Hozzáférés ellenőrzése",
  portalName: "Ecopro Innovation Portál",
  preparing: "A portál előkészítése…",
  premiumTag: "Prémium céges transzfer",
  preparingWorkspace: "A munkafelület előkészítése…",

  /* hero */
  heroEyebrow: "Dedikált céges portál",
  heroTitle: "Foglalja le a transzferét",
  heroSubtitle:
    "Reptéri és városi transzferek az Ecopro Innovation munkatársai és vendégei számára, a Pannon Transfer diszpécsercsapatának szervezésében.",
  progress: "Kitöltött kötelező mezők",

  /* summary side card */
  sumTitle: "Foglalás összegzése",
  sumRoute: "Útvonal",
  sumFrom: "Felvétel",
  sumTo: "Érkezés",
  sumWhen: "Időpont",
  sumPax: "Utasok",
  sumBags: "Poggyász",
  sumClass: "Szolgáltatási szint",
  sumEmpty: "Még nincs megadva",

  /* form sections */
  secTraveler: "Utas és cég",
  secTravelerSub: "Ki utazik, és hogyan érjük el",
  secService: "Szolgáltatás és fizetés",
  secServiceSub: "Válassza ki a szolgáltatási szintet és a fizetési módot",
  secRoute: "Útvonal és időpont",
  secRouteSub: "Felvétel, érkezés, járat és időzítés",

  fEmail: "Az utas e-mail címe",
  fEmailPh: "nev@ceg.hu",
  fName: "Az utas teljes neve",
  fNamePh: "Teljes név",
  fCompany: "Cég",
  fPhone: "Telefonszám",
  fPhonePh: "+36…",
  fPhoneHint: "Csak számok, az országhívóval együtt",
  secondTraveler: "Második utas",
  optional: "nem kötelező",
  optionalPh: "Nem kötelező",
  fSecondEmail: "A második utas e-mail címe",
  fSecondPhone: "A második utas telefonszáma",

  fPayment: "Fizetési mód",
  payCard: "Bankkártya a sofőrnél",
  payBank: "Banki átutalás",
  payCash: "Készpénz",
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
  phFromAirport: "pl. Budapest Liszt Ferenc repülőtér (BUD)",
  phFromOther: "pl. Ecopro gyár, Debrecen",
  phToAirport: "pl. Budapest Liszt Ferenc repülőtér (BUD)",
  phToOther: "pl. 4031 Debrecen, …",
  fFlight: "Járatszám",
  phFlight: "pl. LH1234",
  flightHint: "Minden foglalásnál kötelező, hogy a sofőr követni tudja az érkezést vagy az indulást.",
  fDate: "Dátum",
  fTime: "Időpont",
  advanceHint: "Kérjük, legalább {h} órával az indulás előtt foglaljon.",
  fTravelers: "Utasok száma",
  fLuggage: "Poggyász (db)",
  luggageHint: "Összesen legfeljebb {n} darab",
  fComment: "Megjegyzés",
  phComment: "Különleges kérés vagy útmutatás (nem kötelező)",
  decrease: "Csökkentés",
  increase: "Növelés",

  submit: "Foglalás elküldése",
  sending: "A foglalás küldése folyamatban…",
  submitHint: "A beküldés után azonnal e-mailes visszaigazolást kap.",

  errFixTitle: "Kérjük, javítsa a következőket:",
  errRequired: "{field} megadása kötelező",
  errEmail: "Kérjük, érvényes e-mail címet adjon meg",
  errInvalid: "A megadott adatok érvénytelenek, kérjük, ellenőrizze az űrlapot.",
  errServer: "Szerverhiba történt, kérjük, próbálja újra.",
  errUnexpected: "Váratlan hiba történt, kérjük, próbálja újra.",
  errNetwork: "Hálózati hiba történt, kérjük, próbálja újra.",

  okTitle: "A foglalás elküldve",
  okSub: "A visszaigazoló e-mailt elküldtük a címére.",
  okCode: "Foglalási kód",
  okNote: "Amint diszpécserünk megerősíti a foglalást, e-mailben értesítjük.",
  okMyBookings: "Foglalásaim",
  okNew: "Új foglalás",

  /* login */
  loginHeaderSub: "Pannon Transfer · Dedikált partnerbelépés",
  loginTitle: "Belépés az Ecopro Innovation portálra",
  loginLead:
    "Adja meg a céges e-mail címét és a fiókjához tartozó jelszót. Ha a fiókja kétfaktoros hitelesítést (2FA) használ, a következő lépésben azt is kérjük.",
  loginPanelTitle: "Üdvözöljük az Ecopro Innovation partnerportálon",
  loginPanelBody: "Egy helyen foglalhat transzfert, követheti a foglalásait, és érheti el a megállapodás szerinti díjszabást.",
  loginFeat1: "Reptéri és városi transzferek",
  loginFeat2: "Élő foglalási állapot és értesítések",
  loginFeat3: "Kétfaktoros védelem a fiókjához",
  loginKnow: "Jó, ha tudja",
  loginKnow1: "A Pannon Transfer által kiosztott céges címmel lépjen be.",
  loginKnow2: "Ha 2FA szükséges, adja meg a hitelesítő alkalmazás 6 számjegyű kódját vagy egy tartalék kódot.",
  loginKnow3: "Ha problémája van a belépéssel, forduljon az ügyféltámogatáshoz.",
  emailAddress: "E-mail cím",
  emailPh: "nev@ceg.hu",
  password: "Jelszó",
  remember: "Megjegyzés ezen az eszközön (7 nap)",
  loginBtn: "Belépés",
  verifying: "Ellenőrzés…",
  noAccess: "Még nincs hozzáférése, vagy elfelejtette a jelszavát?",
  errNeedCreds: "Kérjük, adja meg az e-mail címét és a jelszavát.",
  errLoginFailed: "A belépés nem sikerült.",
  errLoginUnexpected: "Váratlan hiba történt a belépés során.",
  tfaStep: "2. lépés · Kétfaktoros hitelesítés",
  tfaTitle: "Erősítse meg a belépést",
  tfaLead: "A fiókjához **2FA szükséges**. Adja meg a hitelesítő alkalmazás **6 számjegyű kódját**, vagy használjon tartalék kódot.",
  signingInAs: "Belépés mint",
  tfaCodeLabel: "Hitelesítő kód (6 számjegy)",
  tfaBackupLabel: "Tartalék kód",
  tfaBackupPh: "pl. A1B2-C3D4-E5",
  tfaUseBackup: "Tartalék kód használata (ha nem fér hozzá a hitelesítő alkalmazáshoz)",
  tfaUseBackupLong: "Tartalék kód használata (jelenleg nem férek hozzá a hitelesítő alkalmazáshoz)",
  errNeedBackup: "Kérjük, adja meg a tartalék kódját.",
  errNeedCode6: "Kérjük, adja meg a hitelesítő alkalmazás 6 számjegyű kódját.",
  errBadCode: "Hibás 2FA kód.",
  errUnexpectedShort: "Váratlan hiba történt.",
  back: "Vissza",
  processing: "Feldolgozás…",
  verifyAndSignIn: "Ellenőrzés és belépés",
  authSuccess: "Sikeres azonosítás",
  secureConnection: "Biztonságos kapcsolat létesítése…",
  secureAccessLabel: "Pannon Transfer · Biztonságos belépés",

  /* magic-link page */
  authHeaderSub: "Pannon Transfer · Személyes belépés",
  backHome: "Vissza a kezdőlapra",
  verifyingLink: "A belépési link ellenőrzése…",
  redirecting: "Átirányítás…",
  accessDenied: "A hozzáférés elutasítva",
  linkInvalidBody:
    "Ez a személyes link nem létezik, lejárt vagy már felhasználták. Kérjük, használja a legutóbbi e-mailben kapott linket, vagy kérjen új meghívót.",
  requestInvite: "Új meghívó kérése",
  requestNewLink: "Új belépési link kérése",
  tfaPageTitle: "Kétfaktoros hitelesítés",
  tfaPageLead: "A fiókjához 2FA szükséges. Adja meg a hitelesítő alkalmazás **6 számjegyű kódját**, vagy használjon tartalék kódot.",
  authFooter: "Ecopro Innovation dedikált ügyfélportál · Kizárólag személyes linkkel érhető el",
  loading: "Betöltés…",
  errLinkInvalid: "Ez a link érvénytelen vagy lejárt.",
  errCodeShortBackup: "A tartalék kód túl rövid.",
  errCodeShort6: "A hitelesítő kód 6 számjegyből áll.",
  errWrongCode: "Hibás kód.",
  errNetworkShort: "Hálózati hiba. Kérjük, próbálja újra.",

  /* setup password */
  stepPassword: "Jelszó",
  stepTfa: "2FA",
  stepDone: "Kész",
  securePill: "Biztonságos aktiválás",
  setupHeroPill: "Ecopro Innovation dedikált portál",
  setupHeroTitle: "Üdvözöljük az Ecopro Innovation dedikált foglalási portálján.",
  setupHeroBody:
    "Aktiválja személyes fiókját néhány egyszerű lépésben. Utána megtekintheti a megállapodás szerinti díjszabást, transzfert foglalhat, és egy biztonságos helyen követheti minden foglalását.",
  tileAccess: "Hozzáférés",
  tileAccessValue: "Személyes, meghívóhoz kötött aktiválás",
  tileSecurity: "Biztonság",
  tileSecurity2fa: "Kétfaktoros hitelesítés kötelező",
  tileSecurityPwd: "Erős jelszavas védelem",
  tileSignIn: "Belépés",
  tileSignInValue: "E-mailben kapott személyes linken keresztül",
  tilePortal: "Portál",
  tilePortalValue: "Ecopro Innovation díjszabás és foglalások",
  contact: "Kapcsolat",
  verifyingInvite: "A meghívó ellenőrzése…",
  invalidTitle: "Érvénytelen vagy lejárt link",
  invalidBody: "Ez a hozzáférési link nem létezik, lejárt, vagy már felhasználták. Kérjük, kérjen új meghívót.",
  canClose: "Nyugodtan bezárhatja ezt az oldalt.",
  step1of2: "1/2. lépés · Jelszó",
  step1: "1. lépés · Jelszó",
  setPasswordTitle: "Állítsa be a jelszavát",
  setPasswordLead2fa:
    "Válasszon erős jelszót, amelyet csak Ön ismer. A következő lépésben a fokozott védelem érdekében kétfaktoros hitelesítést is beállít.",
  setPasswordLead: "Válasszon erős jelszót, amelyet csak Ön ismer. Ezzel véglegesíti az Ecopro Innovation portál aktiválását.",
  alreadyActiveLead:
    "Ez a fiók már aktív. Új személyes belépési link kéréséhez kérjük, vegye fel velünk a kapcsolatot az alábbi elérhetőségeken.",
  invitedAccount: "Meghívott fiók",
  twofaRequired: "2FA kötelező",
  newPassword: "Új jelszó",
  newPasswordPh: "Válasszon erős jelszót",
  confirmPassword: "Jelszó megerősítése",
  confirmPasswordPh: "Írja be újra a jelszót",
  showPassword: "Jelszó megjelenítése",
  hidePassword: "Jelszó elrejtése",
  strength0: "Túl gyenge",
  strength1: "Gyenge",
  strength2: "Elfogadható",
  strength3: "Erős",
  strength4: "Nagyon erős",
  strength5: "Kiváló",
  rule8: "Legalább 8 karakter",
  ruleLower: "Egy kisbetű",
  ruleUpper: "Egy nagybetű",
  ruleDigit: "Egy szám",
  setPasswordBtn: "Jelszó beállítása",
  setPasswordBtn2fa: "Jelszó beállítása és tovább a 2FA-hoz",
  setupTerms: "A jelszó beállításával elfogadja a céges hozzáférési feltételeket.",
  requestNewLinkTitle: "Új link kérése",
  requestNewLinkBody: "Írjon nekünk, és újra elküldjük a személyes belépési linkjét:",
  errAlreadyActivated:
    "Ez a fiók már aktiválva van. A folytatáshoz használja a kapott személyes belépési linket, vagy kérjen új meghívót a Pannon Transfertől.",
  errPwdShort: "A jelszónak legalább 8 karakter hosszúnak kell lennie.",
  errPwdMismatch: "A két jelszó nem egyezik.",
  errPwdWeak: "A jelszó túl gyenge. Használjon kis- és nagybetűt, valamint számot.",
  errSetPwd: "Hiba történt a jelszó beállítása közben.",
  errCodeDigits: "A hitelesítő kód 6 számjegyből áll.",
  errBackupFormat: "A tartalék kód formátuma: A1B2-C3D4-E5",
  errIncorrectCode: "Hibás kód.",
  tfaSetupStep: "2/2. lépés · Kétfaktoros hitelesítés",
  tfaSetupTitle: "Állítsa be a kétfaktoros hitelesítést",
  tfaSetupLead:
    "Ezt a fiókot **2FA** védi. Kövesse az alábbi lépéseket egy hitelesítő alkalmazás (pl. Google Authenticator, Microsoft Authenticator, 1Password vagy Authy) összekapcsolásához.",
  tfaStep1: "1 · Olvassa be a QR-kódot",
  tfaStep1Body: "Nyissa meg a hitelesítő alkalmazást, koppintson a **„+”** gombra, és olvassa be a QR-kódot, vagy írja be az alábbi kulcsot.",
  tfaManualKey: "Kézi kulcs (ha a QR-kód nem olvasható be)",
  copyKey: "Kulcs másolása",
  tfaStep2: "2 · Mentse el a tartalék kódokat",
  downloadTxt: "Letöltés (.txt)",
  downloaded: "Letöltve",
  tfaBackupImportant:
    "**Fontos:** őrizze meg ezeket a kódokat biztonságos helyen. Ha elveszíti a telefonját vagy a hitelesítő alkalmazást, ezekkel tud belépni. Minden kód csak egyszer használható.",
  tfaStep3: "3 · Adja meg az első kódot",
  tfaCode6: "6 számjegyű hitelesítő kód",
  tfaBackupInput: "Tartalék kód (pl. A1B2-C3D4-E5)",
  activate2fa: "2FA aktiválása és befejezés",
  doneTitle: "Minden kész",
  doneBody: "Köszönjük – az Ecopro Innovation portál fiókja elkészült.",
  doneBodyStrong: "Hamarosan e-mailt kap a(z) {email} címre a személyes belépési linkkel.",
  doneAddressFallback: "a megadott címre",
  checkInbox: "Nézze meg a postaládáját (és a spam mappát)",
  checkInboxBody: "Kizárólag az e-mailben kapott személyes linken keresztül léphet be – nyilvános belépési űrlap nincs.",
  checkInbox2fa: "A belépéskor a hitelesítő alkalmazás 6 számjegyű kódját is meg kell adnia.",
  closePage: "Most már bezárhatja ezt az oldalt.",
  emailNotArriving: "Nem érkezik meg az e-mail? Írjon nekünk:",
  qrAlt: "2FA QR-kód",
  backupFileTitle: "Ecopro Innovation Portál – Kétfaktoros hitelesítés – Tartalék kódok",
  backupFileAccount: "Fiók",
  backupFileDate: "Dátum",
  backupFileUse: "Egyszerre egy kódot használjon, ha nem fér hozzá a hitelesítő alkalmazáshoz.",
  backupFileOnce: "Minden kód csak egyszer használható.",
  backupFileKeep: "Kérjük, őrizze meg ezeket a kódokat biztonságos helyen.",
  backupFileFooter: "© Pannon Transfer – Ecopro Innovation dedikált ügyfélportál",
  mailSubjectNewLink: "Ecopro Innovation Portál - Új személyes belépési link",
  mailBodyNewLink: "Kérem, küldjenek új személyes belépési linket az Ecopro Innovation portálhoz erre a címre: ",
  mailSubjectNoWelcome: "Ecopro Innovation Portál - Nem érkezett meg az üdvözlő e-mail",
  mailBodyNoWelcome: "Kérem, küldjenek új személyes belépési linket az Ecopro Innovation portálhoz erre a címre: ",
  mailSubjectAccess: "Ecopro Innovation Portál - Hozzáférés kérése",
  contactLine: "Balog Sebastian Máté · Fejlesztő",

  /* my bookings */
  portalLabel: "Ecopro Innovation dedikált portál",
  verifyingAccess: "A hozzáférés és a munkamenet ellenőrzése…",
  footerPortal: "Ecopro Innovation dedikált ügyfélportál",
  rightsReserved: "Minden jog fenntartva.",
  eyebrow: "Foglaláskezelő",
  pageTitle: "Foglalásaim",
  pageSubtitle: "A fiókjával leadott minden transzfer élő állapota és teljes részletei egy helyen.",
  refresh: "Frissítés",
  newBooking: "Új foglalás",
  searchPlaceholder: "Keresés kód, utas, cím vagy járat alapján…",
  lastUpdated: "15 másodpercenként automatikusan frissül",

  statTotal: "Összes foglalás",
  statPending: "Megerősítésre vár",
  statConfirmed: "Megerősített",
  statClosed: "Lezárt / lemondott",
  badgePending: "Függőben",
  badgeActive: "Aktív",
  badgeClosed: "Lezárva",

  filterAll: "Mind",
  filterPending: "Függőben",
  filterConfirmed: "Jóváhagyott",
  filterClosed: "Lezárt",

  statusPending: "Függőben",
  statusModified: "Módosítva",
  statusConfirmed: "Jóváhagyott",
  statusInProgress: "Folyamatban",
  statusCompleted: "Lezárt",
  statusCancelled: "Lemondott",

  loadingBookings: "A foglalások betöltése…",
  emptyTitle: "Nincs foglalás",
  emptyBody: "A kiválasztott szűrőhöz nem tartozik foglalás. Új transzfert a foglalási oldalon adhat le.",
  emptySearch: "Nincs a keresésnek megfelelő foglalás.",
  goBook: "Tovább a foglaláshoz",
  clearSearch: "Keresés törlése",

  from: "Honnan",
  to: "Hova",
  pickup: "Felvétel",
  flight: "Járatszám",
  noFlight: "Nincs megadva",
  vehicleClass: "Szolgáltatási szint",
  passengers: "Utasok",
  luggage: "Poggyász",
  payment: "Fizetés",
  driverVehicle: "Sofőr és jármű",
  driverPending: "Hozzárendelés folyamatban",
  driverNotified: "Sofőr értesítve",
  driverAcknowledged: "Sofőr visszaigazolta",
  standard: "Standard",
  standardSub: "Economy osztály",
  executive: "Executive",
  executiveSub: "Business osztály",
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
  trackingInactive: "A követőlink már nem aktív.",

  notifTitle: "Állapotváltozások",
  dismissAll: "Összes elrejtése",
  view: "Megtekintés",
  dismiss: "Elrejtés",
  notifConfirmed: "A foglalását jóváhagyták.",
  notifModified: "A diszpécser módosította a foglalását.",
  notifCancelled: "A foglalását lemondták.",
  notifInProgress: "A foglalása folyamatban van.",
  notifCompleted: "A foglalása lezárult.",
  notifDefault: "A foglalás állapota megváltozott.",
  dispatcherModified: "A diszpécser módosította a foglalást.",

  editTitle: "Foglalás módosítása",
  date: "Dátum",
  time: "Időpont",
  fromAddress: "Felvételi cím",
  toAddress: "Érkezési cím",
  paxCount: "Utasok száma",
  bagCount: "Poggyászok száma",
  commentLabel: "Megjegyzés",
  commentPlaceholder: "Különleges kérés vagy útmutatás…",
  phoneLabel: "Az utas telefonszáma",
  flightLabel: "Járatszám",
  flightPlaceholder: "pl. LH1234",
  flightRequired: "Reptéri transzfernél a járatszám megadása kötelező.",
  required: "Ez a mező kötelező.",
  fixErrors: "Kérjük, javítsa az alábbi hibákat.",
  noticeTitle: "Kérjük, vegye figyelembe",
  noticeBody: "A módosításokat a foglalási feltételek (minimális előfoglalási idő, kapacitás, üzemidő) szerint ellenőrizzük.",
  saving: "Mentés…",
  saveChanges: "Módosítások mentése",

  cancelTitle: "Biztosan lemondja ezt a foglalást?",
  refundTitle: "Visszatérítés",
  refundBody: "A lemondás után pénzvisszatérítésre nincs lehetőség.",
  driverTitle: "Sofőr",
  driverBody: "A hozzárendelt sofőr automatikusan felszabadul.",
  keepBooking: "Foglalás megtartása",
  confirmCancel: "Foglalás lemondása",

  toastUpdated: "A foglalás módosítása sikerült.",
  toastCancelled: "A foglalás lemondása sikerült.",
  toastNetwork: "Hálózati hiba történt, kérjük, próbálja újra.",
  toastUpdateFailed: "A módosítás nem sikerült.",
  toastCancelFailed: "A lemondás nem sikerült.",
  toastGeneric: "A kérést nem sikerült teljesíteni. Kérjük, ellenőrizze az adatokat, és próbálja újra.",

  fieldDriver: "Sofőr",
  fieldVehicle: "Jármű",
  fieldPickupDate: "Felvétel dátuma",
  fieldPickupTime: "Felvételi időpont",
  fieldFromAddress: "Felvételi cím",
  fieldToAddress: "Érkezési cím",
  fieldFlight: "Járatszám",
  fieldPax: "Utasok száma",
  fieldBags: "Poggyászok száma",
  fieldComment: "Diszpécseri megjegyzés",
  fieldStatus: "Foglalás állapota",
  fieldPrice: "Ár",
  fieldCompany: "Cégnév",
  fieldPayment: "Fizetési mód",
  fieldGeneric: "Adat",

  /* generic server fallbacks */
  srvGeneric: "A kérés feldolgozása közben hiba történt. Kérjük, próbálja újra.",
} as const;

export type EcoKey = keyof typeof hu;

const ko: Record<EcoKey, string> = {
  navLabel: "Ecopro Innovation 모빌리티 데스크",
  navSubline: "전용 파트너 포털",
  navBooking: "예약",
  navMyBookings: "내 예약",
  signOut: "로그아웃",
  language: "언어",
  rights: "모든 권리 보유.",
  needHelp: "도움이 필요하신가요?",
  supportRole: "개발자",
  support: "지원",
  footerTag: "전용 고객 포털",
  footerSupport: "전용 고객 지원",
  timesNote: "모든 시간은 부다페스트 현지 시간(CET/CEST) 기준입니다.",

  checkingAccess: "접근 권한과 세션을 확인하는 중…",
  checkingAccessSub: "Pannon Transfer · 접근 권한 확인",
  portalName: "Ecopro Innovation 포털",
  preparing: "포털을 준비하는 중…",
  premiumTag: "프리미엄 기업 이동 서비스",
  preparingWorkspace: "작업 환경을 준비하는 중…",

  heroEyebrow: "전용 기업 포털",
  heroTitle: "이동 서비스를 예약하세요",
  heroSubtitle:
    "Pannon Transfer 배차팀이 Ecopro Innovation 임직원과 방문객을 위한 공항 및 시내 이동을 준비해 드립니다.",
  progress: "작성한 필수 항목",

  sumTitle: "예약 요약",
  sumRoute: "경로",
  sumFrom: "출발",
  sumTo: "도착",
  sumWhen: "일시",
  sumPax: "승객",
  sumBags: "수하물",
  sumClass: "서비스 등급",
  sumEmpty: "아직 입력되지 않음",

  secTraveler: "승객 및 회사",
  secTravelerSub: "탑승자와 연락 방법",
  secService: "서비스 및 결제",
  secServiceSub: "서비스 등급과 결제 방법을 선택해 주세요",
  secRoute: "경로 및 일정",
  secRouteSub: "출발지, 도착지, 항공편 및 시간",

  fEmail: "승객 이메일 주소",
  fEmailPh: "name@company.com",
  fName: "승객 성명",
  fNamePh: "성명",
  fCompany: "회사",
  fPhone: "전화번호",
  fPhonePh: "+36…",
  fPhoneHint: "국가번호를 포함한 숫자만 입력해 주세요",
  secondTraveler: "두 번째 승객",
  optional: "선택",
  optionalPh: "선택 사항",
  fSecondEmail: "두 번째 승객 이메일",
  fSecondPhone: "두 번째 승객 전화번호",

  fPayment: "결제 방법",
  payCard: "기사에게 카드 결제",
  payBank: "계좌 이체",
  payCash: "현금",
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
  phFromOther: "예: 에코프로 공장, 데브레첸",
  phToAirport: "예: 부다페스트 리스트 페렌츠 공항 (BUD)",
  phToOther: "예: 4031 데브레첸 …",
  fFlight: "항공편 번호",
  phFlight: "예: LH1234",
  flightHint: "기사가 도착 또는 출발 항공편을 확인할 수 있도록 모든 예약에 필수입니다.",
  fDate: "날짜",
  fTime: "시간",
  advanceHint: "출발 최소 {h}시간 전에 예약해 주세요.",
  fTravelers: "승객 수",
  fLuggage: "수하물 (개)",
  luggageHint: "총 최대 {n}개",
  fComment: "비고",
  phComment: "특별 요청 또는 안내 사항 (선택)",
  decrease: "줄이기",
  increase: "늘리기",

  submit: "예약 제출",
  sending: "예약을 제출하는 중…",
  submitHint: "제출 즉시 이메일로 예약 확인서가 발송됩니다.",

  errFixTitle: "다음 항목을 수정해 주세요:",
  errRequired: "{field} 입력이 필요합니다",
  errEmail: "올바른 이메일 주소를 입력해 주세요",
  errInvalid: "입력하신 정보가 올바르지 않습니다. 양식을 확인해 주세요.",
  errServer: "서버 오류가 발생했습니다. 다시 시도해 주세요.",
  errUnexpected: "예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.",
  errNetwork: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",

  okTitle: "예약이 제출되었습니다",
  okSub: "확인 이메일을 보내 드렸습니다.",
  okCode: "예약 번호",
  okNote: "배차 담당자가 예약을 확정하는 즉시 이메일로 알려 드립니다.",
  okMyBookings: "내 예약",
  okNew: "새 예약",

  loginHeaderSub: "Pannon Transfer · 전용 파트너 로그인",
  loginTitle: "Ecopro Innovation 포털 로그인",
  loginLead:
    "회사 이메일 주소와 계정 비밀번호를 입력해 주세요. 계정에 2단계 인증(2FA)이 설정되어 있으면 다음 단계에서 인증 코드를 요청합니다.",
  loginPanelTitle: "Ecopro Innovation 파트너 포털에 오신 것을 환영합니다",
  loginPanelBody: "한곳에서 이동 서비스를 예약하고, 예약 현황을 확인하며, 협의된 요금표를 조회할 수 있습니다.",
  loginFeat1: "공항 및 시내 이동 서비스",
  loginFeat2: "실시간 예약 상태 및 알림",
  loginFeat3: "2단계 인증으로 계정 보호",
  loginKnow: "알아 두세요",
  loginKnow1: "Pannon Transfer에서 발급한 회사 이메일 주소로 로그인해 주세요.",
  loginKnow2: "2단계 인증이 필요한 경우 인증 앱의 6자리 코드 또는 백업 코드를 입력해 주세요.",
  loginKnow3: "로그인에 문제가 있으면 고객 지원팀에 문의해 주세요.",
  emailAddress: "이메일 주소",
  emailPh: "name@company.com",
  password: "비밀번호",
  remember: "이 기기에서 로그인 유지 (7일)",
  loginBtn: "로그인",
  verifying: "확인 중…",
  noAccess: "아직 접근 권한이 없거나 비밀번호를 잊으셨나요?",
  errNeedCreds: "이메일 주소와 비밀번호를 입력해 주세요.",
  errLoginFailed: "로그인에 실패했습니다.",
  errLoginUnexpected: "로그인 중 예기치 않은 오류가 발생했습니다.",
  tfaStep: "2단계 · 2단계 인증",
  tfaTitle: "로그인을 확인해 주세요",
  tfaLead: "계정에 **2단계 인증이 필요합니다**. 인증 앱에서 생성된 **6자리 코드**를 입력하거나 백업 코드를 사용해 주세요.",
  signingInAs: "로그인 계정",
  tfaCodeLabel: "인증 코드 (6자리)",
  tfaBackupLabel: "백업 코드",
  tfaBackupPh: "예: A1B2-C3D4-E5",
  tfaUseBackup: "백업 코드 사용 (인증 앱을 사용할 수 없는 경우)",
  tfaUseBackupLong: "백업 코드 사용 (지금은 인증 앱을 사용할 수 없습니다)",
  errNeedBackup: "백업 코드를 입력해 주세요.",
  errNeedCode6: "인증 앱에서 생성된 6자리 코드를 입력해 주세요.",
  errBadCode: "2단계 인증 코드가 올바르지 않습니다.",
  errUnexpectedShort: "예기치 않은 오류가 발생했습니다.",
  back: "뒤로",
  processing: "처리 중…",
  verifyAndSignIn: "확인 후 로그인",
  authSuccess: "인증이 완료되었습니다",
  secureConnection: "보안 연결을 설정하는 중…",
  secureAccessLabel: "Pannon Transfer · 보안 로그인",

  authHeaderSub: "Pannon Transfer · 개인 로그인",
  backHome: "홈으로 돌아가기",
  verifyingLink: "로그인 링크를 확인하는 중…",
  redirecting: "이동하는 중…",
  accessDenied: "접근이 거부되었습니다",
  linkInvalidBody:
    "이 개인 링크는 존재하지 않거나 만료되었거나 이미 사용되었습니다. 가장 최근에 받은 이메일의 링크를 사용하시거나 새 초대를 요청해 주세요.",
  requestInvite: "새 초대 요청",
  requestNewLink: "새 로그인 링크 요청",
  tfaPageTitle: "2단계 인증",
  tfaPageLead: "계정에 2단계 인증이 필요합니다. 인증 앱에서 생성된 **6자리 코드**를 입력하거나 백업 코드를 사용해 주세요.",
  authFooter: "Ecopro Innovation 전용 고객 포털 · 개인 링크로만 접근 가능",
  loading: "불러오는 중…",
  errLinkInvalid: "이 링크는 유효하지 않거나 만료되었습니다.",
  errCodeShortBackup: "백업 코드가 너무 짧습니다.",
  errCodeShort6: "인증 코드는 6자리 숫자입니다.",
  errWrongCode: "코드가 올바르지 않습니다.",
  errNetworkShort: "네트워크 오류입니다. 다시 시도해 주세요.",

  stepPassword: "비밀번호",
  stepTfa: "2단계 인증",
  stepDone: "완료",
  securePill: "보안 활성화",
  setupHeroPill: "Ecopro Innovation 전용 포털",
  setupHeroTitle: "Ecopro Innovation 전용 예약 포털에 오신 것을 환영합니다.",
  setupHeroBody:
    "몇 단계만 거치면 개인 계정이 활성화됩니다. 활성화 후에는 협의된 요금표를 확인하고, 이동 서비스를 예약하며, 모든 예약을 한곳에서 안전하게 관리할 수 있습니다.",
  tileAccess: "접근",
  tileAccessValue: "초대 기반의 개인 계정 활성화",
  tileSecurity: "보안",
  tileSecurity2fa: "2단계 인증 필수",
  tileSecurityPwd: "강력한 비밀번호 보호",
  tileSignIn: "로그인",
  tileSignInValue: "이메일로 받은 개인 링크를 통해 접속",
  tilePortal: "포털",
  tilePortalValue: "Ecopro Innovation 요금표 및 예약",
  contact: "문의",
  verifyingInvite: "초대 링크를 확인하는 중…",
  invalidTitle: "유효하지 않거나 만료된 링크",
  invalidBody: "이 접근 링크는 존재하지 않거나 만료되었거나 이미 사용되었습니다. 새 초대를 요청해 주세요.",
  canClose: "이 페이지는 닫으셔도 됩니다.",
  step1of2: "1/2단계 · 비밀번호",
  step1: "1단계 · 비밀번호",
  setPasswordTitle: "비밀번호를 설정해 주세요",
  setPasswordLead2fa:
    "본인만 아는 강력한 비밀번호를 선택해 주세요. 다음 단계에서 추가 보호를 위해 2단계 인증도 설정합니다.",
  setPasswordLead: "본인만 아는 강력한 비밀번호를 선택해 주세요. 이 단계로 Ecopro Innovation 포털 활성화가 완료됩니다.",
  alreadyActiveLead:
    "이미 활성화된 계정입니다. 새 개인 로그인 링크가 필요하시면 아래 연락처로 문의해 주세요.",
  invitedAccount: "초대된 계정",
  twofaRequired: "2단계 인증 필수",
  newPassword: "새 비밀번호",
  newPasswordPh: "강력한 비밀번호를 입력하세요",
  confirmPassword: "비밀번호 확인",
  confirmPasswordPh: "비밀번호를 다시 입력하세요",
  showPassword: "비밀번호 표시",
  hidePassword: "비밀번호 숨기기",
  strength0: "매우 약함",
  strength1: "약함",
  strength2: "보통",
  strength3: "강함",
  strength4: "매우 강함",
  strength5: "최상",
  rule8: "8자 이상",
  ruleLower: "소문자 포함",
  ruleUpper: "대문자 포함",
  ruleDigit: "숫자 포함",
  setPasswordBtn: "비밀번호 설정",
  setPasswordBtn2fa: "비밀번호 설정 후 2단계 인증으로 이동",
  setupTerms: "비밀번호를 설정하면 회사 접근 약관에 동의하는 것으로 간주됩니다.",
  requestNewLinkTitle: "새 링크 요청",
  requestNewLinkBody: "아래 주소로 문의해 주시면 개인 로그인 링크를 다시 보내 드립니다:",
  errAlreadyActivated:
    "이미 활성화된 계정입니다. 계속하려면 받으신 개인 로그인 링크를 사용하시거나 Pannon Transfer에 새 초대를 요청해 주세요.",
  errPwdShort: "비밀번호는 8자 이상이어야 합니다.",
  errPwdMismatch: "두 비밀번호가 일치하지 않습니다.",
  errPwdWeak: "비밀번호가 너무 약합니다. 소문자, 대문자, 숫자를 포함해 주세요.",
  errSetPwd: "비밀번호를 설정하는 중 오류가 발생했습니다.",
  errCodeDigits: "인증 코드는 6자리 숫자입니다.",
  errBackupFormat: "백업 코드 형식: A1B2-C3D4-E5",
  errIncorrectCode: "코드가 올바르지 않습니다.",
  tfaSetupStep: "2/2단계 · 2단계 인증",
  tfaSetupTitle: "2단계 인증을 설정해 주세요",
  tfaSetupLead:
    "이 계정은 **2단계 인증**으로 보호됩니다. 아래 단계를 따라 인증 앱(Google Authenticator, Microsoft Authenticator, 1Password, Authy 등)을 연결해 주세요.",
  tfaStep1: "1 · QR 코드 스캔",
  tfaStep1Body: "인증 앱을 열고 **“+”** 를 눌러 QR 코드를 스캔하거나 아래 수동 키를 입력해 주세요.",
  tfaManualKey: "수동 키 (QR 코드를 스캔할 수 없는 경우)",
  copyKey: "키 복사",
  tfaStep2: "2 · 백업 코드 저장",
  downloadTxt: "다운로드 (.txt)",
  downloaded: "다운로드 완료",
  tfaBackupImportant:
    "**중요:** 이 코드를 안전한 곳에 보관해 주세요. 휴대폰이나 인증 앱을 분실했을 때 로그인할 수 있는 유일한 수단입니다. 각 코드는 한 번만 사용할 수 있습니다.",
  tfaStep3: "3 · 첫 번째 코드 입력",
  tfaCode6: "6자리 인증 코드",
  tfaBackupInput: "백업 코드 (예: A1B2-C3D4-E5)",
  activate2fa: "2단계 인증 활성화 및 완료",
  doneTitle: "모든 설정이 완료되었습니다",
  doneBody: "감사합니다. Ecopro Innovation 포털 계정이 준비되었습니다.",
  doneBodyStrong: "곧 {email} 주소로 개인 로그인 링크가 담긴 이메일이 발송됩니다.",
  doneAddressFallback: "입력하신 주소",
  checkInbox: "받은편지함(및 스팸함)을 확인해 주세요",
  checkInboxBody: "이메일에 포함된 개인 링크로만 로그인할 수 있으며, 공개 로그인 양식은 없습니다.",
  checkInbox2fa: "로그인 시 인증 앱의 6자리 코드도 필요합니다.",
  closePage: "이제 이 페이지를 닫으셔도 됩니다.",
  emailNotArriving: "이메일이 도착하지 않았나요? 아래로 문의해 주세요:",
  qrAlt: "2단계 인증 QR 코드",
  backupFileTitle: "Ecopro Innovation 포털 – 2단계 인증 – 백업 코드",
  backupFileAccount: "계정",
  backupFileDate: "날짜",
  backupFileUse: "인증 앱을 사용할 수 없을 때 코드를 한 번에 하나씩 사용하세요.",
  backupFileOnce: "각 코드는 한 번만 사용할 수 있습니다.",
  backupFileKeep: "이 코드를 안전한 곳에 보관해 주세요.",
  backupFileFooter: "© Pannon Transfer – Ecopro Innovation 전용 고객 포털",
  mailSubjectNewLink: "Ecopro Innovation 포털 - 새 개인 로그인 링크 요청",
  mailBodyNewLink: "Ecopro Innovation 포털의 새 개인 로그인 링크를 아래 주소로 보내 주십시오: ",
  mailSubjectNoWelcome: "Ecopro Innovation 포털 - 환영 이메일을 받지 못했습니다",
  mailBodyNoWelcome: "Ecopro Innovation 포털의 새 개인 로그인 링크를 아래 주소로 보내 주십시오: ",
  mailSubjectAccess: "Ecopro Innovation 포털 - 접근 권한 요청",
  contactLine: "Balog Sebastian Máté · 개발자",

  portalLabel: "Ecopro Innovation 전용 포털",
  verifyingAccess: "접근 권한과 세션을 확인하는 중…",
  footerPortal: "Ecopro Innovation 전용 고객 포털",
  rightsReserved: "모든 권리 보유.",
  eyebrow: "예약 관리",
  pageTitle: "내 예약",
  pageSubtitle: "계정으로 접수된 모든 이동 예약의 실시간 상태와 상세 정보를 한곳에서 확인하세요.",
  refresh: "새로 고침",
  newBooking: "새 예약",
  searchPlaceholder: "예약 번호, 승객, 주소 또는 항공편으로 검색…",
  lastUpdated: "15초마다 자동으로 새로 고침됩니다",

  statTotal: "전체 예약",
  statPending: "확정 대기",
  statConfirmed: "확정됨",
  statClosed: "종료 / 취소",
  badgePending: "대기 중",
  badgeActive: "진행",
  badgeClosed: "종료",

  filterAll: "전체",
  filterPending: "대기 중",
  filterConfirmed: "승인됨",
  filterClosed: "종료",

  statusPending: "대기 중",
  statusModified: "변경됨",
  statusConfirmed: "승인됨",
  statusInProgress: "진행 중",
  statusCompleted: "종료됨",
  statusCancelled: "취소됨",

  loadingBookings: "예약을 불러오는 중…",
  emptyTitle: "예약이 없습니다",
  emptyBody: "선택한 필터에 해당하는 예약이 없습니다. 예약 페이지에서 새 이동을 등록해 주세요.",
  emptySearch: "검색 조건에 맞는 예약이 없습니다.",
  goBook: "예약 페이지로 이동",
  clearSearch: "검색 지우기",

  from: "출발",
  to: "도착",
  pickup: "픽업",
  flight: "항공편 번호",
  noFlight: "미입력",
  vehicleClass: "서비스 등급",
  passengers: "승객",
  luggage: "수하물",
  payment: "결제",
  driverVehicle: "기사 및 차량",
  driverPending: "배정 대기 중",
  driverNotified: "기사에게 통보됨",
  driverAcknowledged: "기사 확인 완료",
  standard: "스탠더드",
  standardSub: "이코노미 등급",
  executive: "이그제큐티브",
  executiveSub: "비즈니스 등급",
  paxUnit: "{n}명",
  bagUnit: "{n}개",

  details: "상세 보기",
  hideDetails: "상세 접기",
  modify: "변경",
  cancel: "취소",

  secTrip: "이동 정보",
  secPassenger: "승객",
  secSecond: "두 번째 승객",
  secCompany: "회사 및 결제",
  secDriver: "기사 및 차량",
  secComment: "비고",
  secTimeline: "예약 이력",
  secTracking: "승객 추적",
  name: "이름",
  email: "이메일",
  phone: "전화번호",
  company: "회사",
  price: "요금",
  priceNotSet: "확인 중",
  bookingCode: "예약 번호",
  noComment: "비고 없음",
  createdAt: "등록 일시",
  updatedAt: "마지막 수정",
  statusChangedAt: "최근 상태 변경",
  statusChange: "{from} → {to}",
  trackingHint: "이 링크를 승객과 공유하면 이동 상황을 실시간으로 확인할 수 있습니다.",
  openTracking: "추적 페이지 열기",
  copyTracking: "링크 복사",
  copied: "링크가 클립보드에 복사되었습니다.",
  trackingInactive: "추적 링크가 더 이상 유효하지 않습니다.",

  notifTitle: "상태 변경 알림",
  dismissAll: "모두 닫기",
  view: "보기",
  dismiss: "닫기",
  notifConfirmed: "예약이 승인되었습니다.",
  notifModified: "배차 담당자가 예약을 변경했습니다.",
  notifCancelled: "예약이 취소되었습니다.",
  notifInProgress: "예약이 진행 중입니다.",
  notifCompleted: "예약이 종료되었습니다.",
  notifDefault: "예약 상태가 변경되었습니다.",
  dispatcherModified: "배차 담당자가 예약을 변경했습니다.",

  editTitle: "예약 변경",
  date: "날짜",
  time: "시간",
  fromAddress: "출발 주소",
  toAddress: "도착 주소",
  paxCount: "승객 수",
  bagCount: "수하물 개수",
  commentLabel: "비고",
  commentPlaceholder: "특별 요청 또는 안내 사항…",
  phoneLabel: "승객 전화번호",
  flightLabel: "항공편 번호",
  flightPlaceholder: "예: LH1234",
  flightRequired: "공항 이동에는 항공편 번호가 필수입니다.",
  required: "필수 입력 항목입니다.",
  fixErrors: "아래 항목을 수정해 주세요.",
  noticeTitle: "안내",
  noticeBody: "변경 사항은 예약 조건(최소 예약 시간, 탑승 인원, 운행 시간)에 따라 검토됩니다.",
  saving: "저장 중…",
  saveChanges: "변경 사항 저장",

  cancelTitle: "이 예약을 취소하시겠습니까?",
  refundTitle: "환불",
  refundBody: "취소 후에는 환불이 불가능합니다.",
  driverTitle: "기사",
  driverBody: "배정된 기사는 자동으로 해제됩니다.",
  keepBooking: "예약 유지",
  confirmCancel: "예약 취소",

  toastUpdated: "예약이 변경되었습니다.",
  toastCancelled: "예약이 취소되었습니다.",
  toastNetwork: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
  toastUpdateFailed: "변경을 완료하지 못했습니다.",
  toastCancelFailed: "취소를 완료하지 못했습니다.",
  toastGeneric: "요청을 처리하지 못했습니다. 입력 내용을 확인한 후 다시 시도해 주세요.",

  fieldDriver: "기사",
  fieldVehicle: "차량",
  fieldPickupDate: "픽업 날짜",
  fieldPickupTime: "픽업 시간",
  fieldFromAddress: "출발 주소",
  fieldToAddress: "도착 주소",
  fieldFlight: "항공편 번호",
  fieldPax: "승객 수",
  fieldBags: "수하물 개수",
  fieldComment: "배차 담당자 비고",
  fieldStatus: "예약 상태",
  fieldPrice: "요금",
  fieldCompany: "회사명",
  fieldPayment: "결제 방법",
  fieldGeneric: "정보",

  srvGeneric: "요청을 처리하는 중 오류가 발생했습니다. 다시 시도해 주세요.",
};

const DICTS: Record<EcoLang, Record<EcoKey, string>> = { hu: hu as unknown as Record<EcoKey, string>, ko };

export type EcoTranslator = (key: EcoKey, params?: Record<string, string | number>) => string;

export function makeT(lang: EcoLang): EcoTranslator {
  return (key, params) => {
    let text: string = DICTS[lang][key] ?? DICTS.hu[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.split(`{${k}}`).join(String(v));
      }
    }
    return text;
  };
}

/** Renders `**bold**` fragments of a dictionary string into a plain array of parts. */
export function splitBold(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**")
        ? { text: part.slice(2, -2), bold: true }
        : { text: part, bold: false },
    );
}

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                */
/* -------------------------------------------------------------------------- */

const LOCALE: Record<EcoLang, string> = { hu: "hu-HU", ko: "ko-KR" };

export function formatPickupDate(dateStr: string, lang: EcoLang): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || "");
  if (!m) return dateStr || "—";
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return new Intl.DateTimeFormat(LOCALE[lang], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatTimestamp(ts: number | undefined, lang: EcoLang): string {
  if (!ts) return "—";
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Budapest",
  }).format(new Date(ts));
}

export function formatPrice(price: number, lang: EcoLang): string {
  return lang === "hu" ? `${price.toLocaleString("hu-HU")} Ft` : `${price.toLocaleString("ko-KR")} HUF`;
}

export const STATUS_KEY: Record<string, EcoKey> = {
  pending: "statusPending",
  modified: "statusModified",
  confirmed: "statusConfirmed",
  "in-progress": "statusInProgress",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

/* -------------------------------------------------------------------------- */
/*  Server message translation (the shared APIs answer in Hungarian)          */
/* -------------------------------------------------------------------------- */

const HU_CHARS = /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/;

function transferTypeLabel(raw: string, lang: EcoLang): string {
  const t = makeT(lang);
  return /executive/i.test(raw) ? t("typeExecutive") : t("typeStandard");
}

interface FixedMessage {
  match: string;
  hu: string;
  ko: string;
}

const FIXED_MESSAGES: FixedMessage[] = [
  /* auth */
  { match: "Hiányzó token.", hu: "Hiányzik a token.", ko: "토큰이 없습니다." },
  {
    match: "Ez az egyedi belépési link lejárt. Kérj új meghívót a Pannon Transfer Ügyvezetőtől.",
    hu: "Ez a személyes belépési link lejárt. Kérjen új meghívót a Pannon Transfertől.",
    ko: "이 개인 로그인 링크가 만료되었습니다. Pannon Transfer에 새 초대를 요청해 주세요.",
  },
  {
    match: "Érvénytelen vagy nem létező belépési link.",
    hu: "Érvénytelen vagy nem létező belépési link.",
    ko: "유효하지 않거나 존재하지 않는 로그인 링크입니다.",
  },
  {
    match: "Ez a fiók még nincs aktiválva — használd a jelszóbeállítási linket.",
    hu: "Ez a fiók még nincs aktiválva – kérjük, használja a jelszóbeállító linket.",
    ko: "아직 활성화되지 않은 계정입니다. 비밀번호 설정 링크를 이용해 주세요.",
  },
  { match: "Hibás hitelesítő adatok.", hu: "Hibás hitelesítő adatok.", ko: "인증 정보가 올바르지 않습니다." },
  {
    match: "Ez a fiók igényel kétfaktoros hitelesítést, amely még nincs aktiválva.",
    hu: "Ehhez a fiókhoz kétfaktoros hitelesítés szükséges, amely még nincs aktiválva. Kérjük, előbb állítsa be a 2FA-t a meghívó e-mailben kapott linken.",
    ko: "이 계정은 2단계 인증이 필요하지만 아직 활성화되지 않았습니다. 초대 이메일의 링크에서 먼저 2단계 인증을 설정해 주세요.",
  },
  { match: "Hiányzó token vagy jelszó.", hu: "Hiányzik a token vagy a jelszó.", ko: "토큰 또는 비밀번호가 없습니다." },
  { match: "Jelszó beállítás sikertelen.", hu: "A jelszó beállítása nem sikerült.", ko: "비밀번호 설정에 실패했습니다." },
  { match: "Hiányzó meghívó token.", hu: "Hiányzik a meghívó tokenje.", ko: "초대 토큰이 없습니다." },
  {
    match: "Érvénytelen vagy lejárt meghívó link.",
    hu: "Érvénytelen vagy lejárt meghívó link.",
    ko: "유효하지 않거나 만료된 초대 링크입니다.",
  },
  { match: "Hiányzó hitelesítő adatok.", hu: "Hiányoznak a hitelesítő adatok.", ko: "인증 정보가 누락되었습니다." },
  { match: "Hibás email vagy jelszó.", hu: "Hibás e-mail cím vagy jelszó.", ko: "이메일 또는 비밀번호가 올바르지 않습니다." },
  {
    match: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül.",
    hu: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül.",
    ko: "이 계정은 먼저 초대 링크를 통해 비밀번호를 설정해야 합니다.",
  },
  {
    match: "A jelszó már be van állítva ehhez a fiókhoz.",
    hu: "Ehhez a fiókhoz már be van állítva jelszó.",
    ko: "이 계정에는 이미 비밀번호가 설정되어 있습니다.",
  },
  {
    match: "A jelszónak minimum 8 karakter hosszúnak kell lennie.",
    hu: "A jelszónak legalább 8 karakter hosszúnak kell lennie.",
    ko: "비밀번호는 8자 이상이어야 합니다.",
  },
  { match: "Jelszó módosítás sikertelen.", hu: "A jelszó módosítása nem sikerült.", ko: "비밀번호 변경에 실패했습니다." },
  { match: "Hiányzó token vagy kód.", hu: "Hiányzik a token vagy a kód.", ko: "토큰 또는 코드가 없습니다." },
  {
    match: "Nincs ilyen aktivált felhasználó a megadott linkhez.",
    hu: "A megadott linkhez nem tartozik aktivált felhasználó.",
    ko: "해당 링크에 연결된 활성 사용자를 찾을 수 없습니다.",
  },
  {
    match: "A kétfaktoros hitelesítés még nem lett inicializálva a fiókodhoz.",
    hu: "A fiókjához a kétfaktoros hitelesítés még nincs inicializálva.",
    ko: "계정에 2단계 인증이 아직 초기화되지 않았습니다.",
  },
  {
    match: "Az Authenticator kód 6 számjegyből áll.",
    hu: "A hitelesítő kód 6 számjegyből áll.",
    ko: "인증 앱 코드는 6자리 숫자입니다.",
  },
  {
    match: "A kód helytelen. Próbáld újra 30 mp múlva, vagy használd az egyik mentett backup kódot.",
    hu: "A kód helytelen. Próbálja újra 30 másodperc múlva, vagy használja az egyik mentett tartalék kódot.",
    ko: "코드가 올바르지 않습니다. 30초 후 다시 시도하거나 저장해 둔 백업 코드를 사용해 주세요.",
  },
  {
    match: "A fiókodhoz kétfaktoros hitelesítés be van kérve, de még nincs aktiválva.",
    hu: "A fiókjához kétfaktoros hitelesítés szükséges, de még nincs aktiválva. Kérjen új meghívót, és állítsa be újra a 2FA-t.",
    ko: "계정에 2단계 인증이 필요하지만 아직 활성화되지 않았습니다. 새 초대를 요청하여 2단계 인증을 다시 설정해 주세요.",
  },
  {
    match: "A belépési link érvénytelen vagy lejárt.",
    hu: "A belépési link érvénytelen vagy lejárt.",
    ko: "로그인 링크가 유효하지 않거나 만료되었습니다.",
  },
  { match: "A fiók még nincs aktiválva.", hu: "A fiók még nincs aktiválva.", ko: "계정이 아직 활성화되지 않았습니다." },
  {
    match: "A kétfaktoros kód helytelen.",
    hu: "A kétfaktoros kód helytelen. Próbálja újra 30 másodperc múlva, vagy használja az egyik mentett tartalék kódot.",
    ko: "2단계 인증 코드가 올바르지 않습니다. 30초 후 다시 시도하거나 저장해 둔 백업 코드를 사용해 주세요.",
  },
  { match: "Nincs aktív munkamenet.", hu: "Nincs aktív munkamenet.", ko: "활성 세션이 없습니다." },
  {
    match: "Hiba a munkamenet ellenőrzésekor.",
    hu: "Hiba történt a munkamenet ellenőrzésekor.",
    ko: "세션을 확인하는 중 오류가 발생했습니다.",
  },
  { match: "Érvénytelen vagy lejárt link.", hu: "Érvénytelen vagy lejárt link.", ko: "유효하지 않거나 만료된 링크입니다." },
  {
    match: "Hiányzó hitelesítési kihívás token.",
    hu: "Hiányzik a hitelesítési kihívás tokenje.",
    ko: "인증 요청 토큰이 없습니다.",
  },
  {
    match: "Érvénytelen vagy lejárt kihívás.",
    hu: "Érvénytelen vagy lejárt hitelesítési kérés. Kérjük, kezdje újra a belépést.",
    ko: "유효하지 않거나 만료된 인증 요청입니다. 로그인을 처음부터 다시 진행해 주세요.",
  },
  {
    match: "Kérjük, adj meg egy érvényes biztonsági mentett kódot.",
    hu: "Kérjük, adjon meg érvényes tartalék kódot.",
    ko: "유효한 백업 코드를 입력해 주세요.",
  },
  {
    match: "Kérjük, adj meg az Authenticator által generált 6 számjegyű kódot.",
    hu: "Kérjük, adja meg a hitelesítő alkalmazás 6 számjegyű kódját.",
    ko: "인증 앱에서 생성된 6자리 코드를 입력해 주세요.",
  },
  { match: "A felhasználó nem található.", hu: "A felhasználó nem található.", ko: "사용자를 찾을 수 없습니다." },
  {
    match: "Ehhez a fiókhoz nincs kétfaktoros hitelesítés bekapcsolva.",
    hu: "Ehhez a fiókhoz nincs bekapcsolva kétfaktoros hitelesítés.",
    ko: "이 계정에는 2단계 인증이 켜져 있지 않습니다.",
  },
  {
    match: "Hibás vagy már felhasznált biztonsági kód.",
    hu: "Hibás vagy már felhasznált tartalék kód.",
    ko: "잘못되었거나 이미 사용된 백업 코드입니다.",
  },
  {
    match: "Helytelen vagy lejárt 6 számjegyű kód.",
    hu: "Helytelen vagy lejárt 6 számjegyű kód.",
    ko: "잘못되었거나 만료된 6자리 코드입니다.",
  },
  /* booking validation (create) */
  { match: "Az utas e-mail címe kötelező", hu: "Az utas e-mail címének megadása kötelező.", ko: "승객 이메일 주소를 입력해 주세요." },
  { match: "Az utas neve kötelező", hu: "Az utas nevének megadása kötelező.", ko: "승객 이름을 입력해 주세요." },
  { match: "Az utas telefonszáma kötelező", hu: "Az utas telefonszámának megadása kötelező.", ko: "승객 전화번호를 입력해 주세요." },
  { match: "A kiindulási cím kötelező", hu: "A felvételi cím megadása kötelező.", ko: "출발 주소를 입력해 주세요." },
  { match: "A célállomás címe kötelező", hu: "Az érkezési cím megadása kötelező.", ko: "도착 주소를 입력해 주세요." },
  {
    match: "Reptéri transzfernél a járatszám megadása kötelező",
    hu: "A járatszám megadása kötelező.",
    ko: "항공편 번호를 입력해 주세요.",
  },
  { match: "Az átvétel dátuma kötelező", hu: "A felvétel dátumának megadása kötelező.", ko: "픽업 날짜를 입력해 주세요." },
  { match: "Az átvétel időpontja kötelező", hu: "A felvétel időpontjának megadása kötelező.", ko: "픽업 시간을 입력해 주세요." },
  { match: "Legalább 1 utas szükséges", hu: "Legalább 1 utas szükséges.", ko: "승객이 최소 1명 필요합니다." },
  {
    match: "A csomagok száma nem lehet negatív",
    hu: "A poggyászok száma nem lehet negatív.",
    ko: "수하물 개수는 음수일 수 없습니다.",
  },
  { match: "Érvénytelen átvétel időpont", hu: "Érvénytelen felvételi időpont.", ko: "픽업 날짜 또는 시간이 올바르지 않습니다." },
  /* booking modification */
  { match: "Nincs aktív munkamenet", hu: "A munkamenet lejárt, kérjük, jelentkezzen be újra.", ko: "세션이 만료되었습니다. 다시 로그인해 주세요." },
  { match: "A foglalás nem található", hu: "A foglalás nem található.", ko: "예약을 찾을 수 없습니다." },
  { match: "Nincs jogosultság", hu: "Nincs jogosultsága a foglalás módosításához.", ko: "이 예약을 변경할 권한이 없습니다." },
];

function fixedMessage(raw: string, lang: EcoLang): string | null {
  for (const f of FIXED_MESSAGES) {
    if (raw === f.match || raw.startsWith(f.match)) return lang === "ko" ? f.ko : f.hu;
  }
  return null;
}

/**
 * Translates the (Hungarian) messages returned by the shared booking/auth APIs
 * into the active portal language. Unknown messages fall back to a generic,
 * localized text so that no wrong-language text is ever displayed.
 */
export function translateServerMessage(raw: string | undefined | null, lang: EcoLang): string {
  const t = makeT(lang);
  const msg = String(raw || "").trim();
  if (!msg) return t("toastGeneric");

  const fixed = fixedMessage(msg, lang);
  if (fixed) return fixed;

  let m: RegExpExecArray | null;
  if ((m = /legalább (\d+) órával a jövőben/i.exec(msg))) {
    return lang === "ko"
      ? `픽업은 현재 시각으로부터 최소 ${m[1]}시간 이후여야 합니다.`
      : `A felvételnek legalább ${m[1]} órával a jövőben kell lennie.`;
  }
  if ((m = /nem lehet több mint (\d+) nap a jövőben/i.exec(msg))) {
    return lang === "ko"
      ? `픽업은 최대 ${m[1]}일 이내로만 예약할 수 있습니다.`
      : `A felvétel legfeljebb ${m[1]} nappal előre foglalható.`;
  }
  if ((m = /csak (\S+) és (\S+) között engedélyezettek/i.exec(msg))) {
    return lang === "ko"
      ? `시내 이동은 ${m[1]}~${m[2]} 사이에만 이용할 수 있습니다.`
      : `A városi transzferek csak ${m[1]} és ${m[2]} között érhetők el.`;
  }
  if ((m = /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)/i.exec(msg))) {
    const type = transferTypeLabel(m[1], lang);
    return lang === "ko"
      ? `${type} 서비스는 승객 1인당 수하물 최대 ${m[2]}개까지 가능합니다 (총 ${m[3]}개).`
      : `${type} transzferen utasonként legfeljebb ${m[2]} poggyász engedélyezett (összesen ${m[3]}).`;
  }
  if ((m = /^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat/i.exec(msg))) {
    const type = transferTypeLabel(m[1], lang);
    return lang === "ko"
      ? `${type} 서비스는 최대 ${m[2]}명까지 탑승할 수 있습니다.`
      : `${type} transzferen legfeljebb ${m[2]} utas utazhat.`;
  }
  if (/járatszám megadása kötelező/i.test(msg)) return fixedMessage("Reptéri transzfernél a járatszám megadása kötelező", lang) as string;
  if (/A foglalás módosítása sikertelen|Módosítás sikertelen/i.test(msg)) {
    return lang === "ko" ? "예약을 변경하지 못했습니다." : "A foglalás módosítása nem sikerült.";
  }

  if (HU_CHARS.test(msg) || /\b(foglal|utas|hiba|sikertelen|kötelező|diszpécser|sofőr)/i.test(msg)) {
    return lang === "ko" ? t("toastGeneric") : msg;
  }
  return lang === "ko" && !/^[\x20-\x7E]+$/.test(msg) ? t("toastGeneric") : msg;
}

const FIELD_LABEL_KEY: Record<string, EcoKey> = {
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

function localizeChangeValue(value: string, lang: EcoLang): string {
  const t = makeT(lang);
  const statusKey = STATUS_KEY[value];
  if (statusKey) return t(statusKey);
  if (value === "card") return t("payCard");
  if (value === "bank") return t("payBank");
  if (value === "cash") return t("payCash");
  return value;
}

/** Translates the dispatcher's modification text shown in the notification panel. */
export function localizeNotificationDetails(raw: string | undefined, lang: EcoLang): string | undefined {
  if (!raw) return undefined;
  const t = makeT(lang);
  let text = raw.trim();
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

  if (lang === "ko" && /diszpécser|foglalás|módosít|időpont|címe?\b|utas|csomag|megjegyzés/i.test(text)) {
    return t("dispatcherModified");
  }
  return text;
}
