import type { MxLang } from "./lang";

type Dict = Record<string, string>;

const hu: Dict = {
  // ── Common / shell ───────────────────────────────────────────
  navLabel: "Schaeffler Motion",
  navSubline: "Transfer Desk",
  navBooking: "Foglalás",
  navMyBookings: "Foglalásaim",
  signOut: "Kijelentkezés",
  language: "Nyelv",
  portalName: "Schaeffler Motion portál",
  checkingAccess: "Hozzáférés és munkamenet ellenőrzése…",
  checkingAccessSub: "Pannon Transfer · Hozzáférés ellenőrzése",
  preparing: "Portál előkészítése…",
  premiumTag: "Prémium céges transzfer",
  needHelp: "Segítségre van szüksége?",
  supportRole: "Fejlesztő",
  rights: "Minden jog fenntartva.",
  contact: "Kapcsolat",
  support: "Támogatás",
  backHome: "Vissza a főoldalra",

  // ── Booking page: hero ───────────────────────────────────────
  heroEyebrow: "Schaeffler Motion · Transfer Desk",
  heroTitle: "Foglaljon transzfert",
  heroSubtitle:
    "Repülőtéri és városi transzferek a Schaeffler Motion munkatársai és vendégei számára, a Pannon Transfer diszpécserközpont szervezésében.",
  progress: "Kötelező mezők kitöltve",
  summaryTitle: "Foglalási összegzés",
  summaryRoute: "Útvonal",
  summaryWhen: "Időpont",
  summaryParty: "Utasok és csomagok",
  summaryClass: "Szolgáltatási osztály",
  summaryEmpty: "Még nincs megadva",
  summaryPax: "Utasok: {n}",
  summaryBags: "Csomag: {n}",
  summaryNote: "A foglalás után e-mailben visszaigazolást küldünk, a diszpécser pedig megerősíti az utat.",

  // ── Sections ─────────────────────────────────────────────────
  secTraveler: "Utas és cég",
  secTravelerSub: "Ki utazik, és hogyan érjük el",
  secService: "Szolgáltatás és fizetés",
  secServiceSub: "Válassza ki a járműosztályt és a fizetés módját",
  secRoute: "Útvonal és időpont",
  secRouteSub: "Felvétel, leadás, járat és időzítés",

  fEmail: "Utas e-mail címe",
  fEmailPh: "nev@ceg.hu",
  fName: "Utas teljes neve",
  fNamePh: "Teljes név",
  fCompany: "Cég",
  fPhone: "Telefonszám",
  fPhonePh: "+36…",
  fPhoneHint: "Csak számjegyek, országhívóval együtt",
  secondTraveler: "Második utas",
  optional: "opcionális",
  optionalPh: "Opcionális",
  fSecondEmail: "Második utas e-mail címe",
  fSecondPhone: "Második utas telefonszáma",

  fPayment: "Fizetési mód",
  payCard: "Bankkártya a sofőrnél",
  payBank: "Banki átutalás",
  fTransferType: "Transzfer típusa",
  typeStandard: "Standard",
  typeStandardSub: "Economy osztály",
  typeExecutive: "Executive",
  typeExecutiveSub: "Business osztály",
  upToPax: "Legfeljebb {n} utas",

  fFrom: "Felvétel",
  fTo: "Leadás",
  typeAirport: "Repülőtér",
  typeOther: "Egyéb cím",
  fFromAddress: "Felvételi cím",
  fToAddress: "Érkezési cím",
  phFromAirport: "pl. Budapest Liszt Ferenc repülőtér (BUD)",
  phFromOther: "pl. Schaeffler Motion üzem, Debrecen",
  phToAirport: "pl. Budapest Liszt Ferenc repülőtér (BUD)",
  phToOther: "pl. 4031 Debrecen, …",
  fFlight: "Járatszám",
  phFlight: "pl. LH1234",
  flightHint:
    "Minden foglalásnál kötelező, hogy a sofőr követhesse az érkezést vagy az indulást.",
  fDate: "Dátum",
  fTime: "Időpont",
  advanceHint: "Kérjük, legalább {h} órával korábban foglaljon.",
  fTravelers: "Utasok száma",
  fLuggage: "Csomagok száma",
  luggageHint: "Összesen legfeljebb {n}",
  fComment: "Megjegyzés",
  phComment: "Különleges kérés vagy útmutatás (opcionális)",
  decrease: "Csökkentés",
  increase: "Növelés",

  submit: "Foglalás elküldése",
  sending: "Foglalás küldése…",
  submitHint: "A beküldés után azonnal e-mailes visszaigazolást kap.",

  errFixTitle: "Kérjük, javítsa az alábbiakat:",
  errRequired: "{field} megadása kötelező",
  errEmail: "Kérjük, adjon meg érvényes e-mail címet",
  errInvalid: "A megadott adatok érvénytelenek. Kérjük, ellenőrizze az űrlapot.",
  errServer: "Szerverhiba történt. Kérjük, próbálja újra.",
  errUnexpected: "Váratlan hiba történt. Kérjük, próbálja újra.",
  errNetwork: "Hálózati hiba történt. Kérjük, próbálja újra.",

  okTitle: "Foglalás elküldve",
  okSub: "A visszaigazoló e-mailt elküldtük a megadott címre.",
  okCode: "Foglalási kód",
  okNote:
    "E-mailben értesítjük, amint a diszpécser megerősíti a foglalását.",
  okMyBookings: "Foglalásaim",
  okNew: "Új foglalás",

  // Booking API messages (Hungarian originals pass through, these cover the fallbacks)
  srvFlightRequired: "A járatszám megadása kötelező",
  srvTravelerEmail: "Az utas e-mail címe kötelező",
  srvTravelerName: "Az utas neve kötelező",
  srvTravelerPhone: "Az utas telefonszáma kötelező",
  srvFromRequired: "A felvételi cím kötelező",
  srvToRequired: "Az érkezési cím kötelező",
  srvDateRequired: "Az átvétel dátuma kötelező",
  srvTimeRequired: "Az átvétel időpontja kötelező",
  srvMinPax: "Legalább 1 utas szükséges",
  srvLuggageNegative: "A csomagok száma nem lehet negatív",
  srvBadDateTime: "Érvénytelen átvételi időpont",
  srvMinAdvance: "Az átvételnek legalább {n} órával a jövőben kell lennie",
  srvMaxAdvance: "Az átvétel nem lehet több mint {n} nap a jövőben",
  srvCityHours: "Városi transzferek csak {a} és {b} között engedélyezettek",
  srvMaxPax: "{type} transzferen legfeljebb {n} utas utazhat",
  srvMaxLuggage:
    "{type} transzferen legfeljebb {n} csomag/utas engedélyezett (összesen {m})",

  // ── Login ────────────────────────────────────────────────────
  loginTag: "Biztonságos partnerbelépés",
  loginBrandTitle: "Schaeffler Motion\ntransfer desk.",
  loginBrandText:
    "Dedikált foglalási felület a Schaeffler Motion vállalati utazásaihoz: gyors, nyomon követhető, a diszpécserközponttal összekötve.",
  loginFeat1: "Személyes, meghívásos hozzáférés",
  loginFeat2: "Kétfaktoros védelem (2FA)",
  loginFeat3: "Valós idejű foglalási állapotok",
  loginTitle: "Belépés a portálra",
  loginText:
    "Adja meg a Pannon Transfer által kiadott céges e-mail címet és a hozzá tartozó jelszót. Ha a fiókja kétfaktoros hitelesítést használ, a következő lépésben kérjük a kódot.",
  loginTip1: "A Pannon Transfer által hozzárendelt céges címmel lépjen be.",
  loginTip2: "2FA esetén a hitelesítő alkalmazás 6 számjegyű kódját vagy egy mentett kódot adjon meg.",
  loginTip3: "Belépési gond esetén forduljon a támogatáshoz.",
  loginGoodToKnow: "Jó tudni",
  email: "E-mail cím",
  password: "Jelszó",
  emailPh: "nev@schaeffler.com",
  remember: "Emlékezzen rám ezen az eszközön (7 nap)",
  signIn: "Belépés",
  verifying: "Ellenőrzés…",
  loginNoAccess: "Még nincs hozzáférése, vagy elfelejtette a jelszavát?",
  loginPleaseFill: "Kérjük, adja meg az e-mail címét és a jelszavát.",
  loginFailed: "A belépés sikertelen.",
  loginUnexpected: "Váratlan hiba történt a belépés közben.",
  networkError: "Hálózati hiba. Kérjük, próbálja újra.",
  step2Tag: "2. lépés · Kétfaktoros hitelesítés",
  step2Title: "Erősítse meg a belépést",
  step2Text:
    "A fiókjához 2FA szükséges. Adja meg a hitelesítő alkalmazás 6 számjegyű kódját, vagy használjon mentett kódot.",
  signingInAs: "Belépés mint",
  authCode: "Hitelesítő kód (6 számjegy)",
  backupCode: "Mentett kód",
  backupPh: "pl. A1B2-C3D4-E5",
  useBackup: "Mentett kód használata (ha nem fér hozzá a hitelesítő alkalmazáshoz)",
  back: "Vissza",
  processing: "Feldolgozás…",
  verifyAndSignIn: "Ellenőrzés és belépés",
  enterBackup: "Kérjük, adja meg a mentett kódot.",
  enterCode6: "Kérjük, adja meg a hitelesítő alkalmazás 6 számjegyű kódját.",
  wrong2fa: "Hibás 2FA kód.",
  authSuccess: "Sikeres azonosítás",
  secureConn: "Biztonságos kapcsolat kiépítése…",
  loginSecureFooter: "Dedikált partnerportál · kizárólag meghívással",

  // ── Magic link page ──────────────────────────────────────────
  authPersonalTag: "Személyes belépés",
  authVerifyingLink: "Belépési link ellenőrzése…",
  authRedirecting: "Átirányítás…",
  authDeniedTitle: "A hozzáférés megtagadva",
  authDeniedText:
    "Ez a személyes link nem létezik, lejárt, vagy már felhasználták. Kérjük, használja a legutóbbi e-mailben kapott linket, vagy kérjen új meghívót.",
  authRequestNew: "Új meghívó kérése",
  authRequestLink: "Új belépési link kérése",
  authSubjectNew: "Schaeffler Motion portál - Új belépési link",
  authTwoFactorTitle: "Erősítse meg a belépést",
  authTwoFactorText:
    "A fiókjához kétfaktoros hitelesítés szükséges. Adja meg a hitelesítő alkalmazás 6 számjegyű kódját, vagy egy mentett kódot.",
  authBackupShort: "A mentett kód túl rövid.",
  authCodeSixDigits: "A hitelesítő kód 6 számjegyből áll.",
  authIncorrect: "Hibás kód.",
  authDoneTitle: "Sikeres azonosítás",
  authDoneText: "Átirányítjuk a foglalási felületre…",
  authLinkInvalid: "Ez a link érvénytelen vagy lejárt.",

  // ── Setup password ───────────────────────────────────────────
  setupSecure: "Biztonságos aktiválás",
  setupHeroTag: "Dedikált Schaeffler Motion portál",
  setupHeroTitle: "Üdvözöljük a dedikált Schaeffler Motion foglalási portálon.",
  setupHeroText:
    "Aktiválja személyes fiókját néhány gyors lépésben. Ezután megtekintheti a megállapodott árakat, transzfereket foglalhat, és egy helyen követheti az összes foglalását.",
  tileAccess: "Hozzáférés",
  tileAccessV: "Személyes, meghívásos aktiválás",
  tileSecurity: "Biztonság",
  tileSecurity2fa: "Kétfaktoros hitelesítés kötelező",
  tileSecurityPwd: "Erős jelszavas védelem",
  tileSignIn: "Belépés",
  tileSignInV: "A személyes e-mail linkkel",
  tilePortal: "Portál",
  tilePortalV: "Schaeffler Motion árak és foglalások",
  helpTitle: "Segítségre van szüksége?",
  verifyingInvite: "Meghívó ellenőrzése…",
  invalidTitle: "Érvénytelen vagy lejárt link",
  invalidText:
    "Ez a hozzáférési link nem létezik, lejárt, vagy már felhasználták. Kérjen új meghívót.",
  closePage: "Ezt az oldalt nyugodtan bezárhatja.",
  step1of2: "1/2. lépés · Jelszó",
  step1: "1. lépés · Jelszó",
  setPassword: "Állítsa be a jelszavát",
  setPasswordTextActive:
    "Ez a fiók már aktív. Új személyes belépési link kéréséhez forduljon hozzánk az alábbi elérhetőségeken.",
  setPasswordText:
    "Válasszon erős jelszót, amelyet csak Ön ismer. ",
  setPasswordText2fa: "A következő lépésben kétfaktoros hitelesítést is beállít a fokozott védelemért.",
  setPasswordTextNo2fa: "Ezzel befejeződik a Schaeffler Motion portál aktiválása.",
  invitedAccount: "Meghívott fiók",
  loadingEllipsis: "Betöltés…",
  twoFaRequired: "2FA kötelező",
  newPassword: "Új jelszó",
  newPasswordPh: "Hozzon létre erős jelszót",
  confirmPassword: "Jelszó megerősítése",
  confirmPasswordPh: "Írja be újra a jelszót",
  showPwd: "Jelszó megjelenítése",
  hidePwd: "Jelszó elrejtése",
  ruleLen: "Legalább 8 karakter",
  ruleLower: "Egy kisbetű",
  ruleUpper: "Egy nagybetű",
  ruleDigit: "Egy szám",
  strength0: "Túl gyenge",
  strength1: "Gyenge",
  strength2: "Közepes",
  strength3: "Erős",
  strength4: "Nagyon erős",
  strength5: "Kiváló",
  setPwdContinue2fa: "Jelszó beállítása és tovább a 2FA-hoz",
  setPwdBtn: "Jelszó beállítása",
  termsNote: "A jelszó beállításával elfogadja a céges hozzáférési feltételeket.",
  alreadyActivatedMsg:
    "Ez a fiók már aktiválva van. A folytatáshoz használja a megkapott személyes belépési linket, vagy kérjen új meghívót a Pannon Transfertől.",
  requestNewLink: "Új link kérése",
  requestNewLinkText: "Írjon nekünk, és újraküldjük a személyes belépési linket:",
  errPwdShort: "A jelszónak legalább 8 karakter hosszúnak kell lennie.",
  errPwdMismatch: "A két jelszó nem egyezik.",
  errPwdWeak:
    "A jelszó túl gyenge. Használjon kis- és nagybetűt, valamint számot.",
  errPwdGeneric: "Hiba történt a jelszó beállításakor.",
  errNetworkLong: "Hálózati hiba. Ellenőrizze az internetkapcsolatot, és próbálja újra.",
  tfaStepTag: "2/2. lépés · Kétfaktoros hitelesítés",
  tfaTitle: "Kétfaktoros hitelesítés beállítása",
  tfaText:
    "A fiókot 2FA védi. Kövesse az alábbi lépéseket egy hitelesítő alkalmazás (pl. Google Authenticator, Microsoft Authenticator, 1Password vagy Authy) összekapcsolásához.",
  tfa1: "1 · Olvassa be a QR-kódot",
  tfa1Text:
    "Nyissa meg a hitelesítő alkalmazást, koppintson a „+” gombra, és olvassa be a QR-kódot, vagy adja meg kézzel az alábbi kulcsot.",
  tfaManualKey: "Kézi kulcs (ha a QR-kód nem olvasható be)",
  copyKey: "Kulcs másolása",
  tfa2: "2 · Mentse el a tartalék kódokat",
  tfaDownload: "Letöltés (.txt)",
  tfaDownloaded: "Letöltve",
  tfaImportant:
    "Fontos: tárolja ezeket a kódokat biztonságos helyen. Ha elveszíti a telefonját vagy a hitelesítő alkalmazást, ezekkel tud belépni. Minden kód csak egyszer használható.",
  tfa3: "3 · Adja meg az első kódot",
  tfaCodeLabel: "6 számjegyű hitelesítő kód",
  tfaBackupLabel: "Mentett kód (pl. A1B2-C3D4-E5)",
  tfaUseBackup: "Mentett kódot használok (most nem érem el a hitelesítő alkalmazást)",
  tfaActivate: "2FA aktiválása és befejezés",
  errTfa6: "A hitelesítő kód 6 számjegyből áll.",
  errTfaBackup: "A mentett kód formátuma: A1B2-C3D4-E5",
  errCodeWrong: "Hibás kód.",
  doneTitle: "Minden kész",
  doneText: "Köszönjük, a Schaeffler Motion portál fiókja elkészült.",
  doneEmail: "Hamarosan e-mailt kap a(z) {email} címre a személyes belépési linkkel.",
  doneEmailFallback: "a megadott címére",
  doneCheckInbox: "Nézze meg a postaládáját (és a spam mappát is)",
  doneSignInOnly: "Kizárólag az e-mailben kapott személyes linken keresztül léphet be, nyilvános belépési űrlap nincs.",
  doneTwoFa: "Belépéskor a hitelesítő alkalmazás 6 számjegyű kódját is kérni fogjuk.",
  doneNotArriving: "Nem érkezik meg az e-mail? Írjon nekünk:",
  backupFileTitle: "Schaeffler Motion portál – Kétfaktoros hitelesítés – Tartalék kódok",
  backupFileAccount: "Fiók",
  backupFileDate: "Dátum",
  backupFileBody1: "Ha nem fér hozzá a hitelesítő alkalmazáshoz, egyszerre egy kódot használjon.",
  backupFileBody2: "Minden kód csak egyszer használható.",
  backupFileSafe: "Kérjük, tárolja ezeket a kódokat biztonságos helyen.",
  backupFileFooter: "© Pannon Transfer – Schaeffler Motion partnerportál",
};

const en: Dict = {
  navLabel: "Schaeffler Motion",
  navSubline: "Transfer Desk",
  navBooking: "Booking",
  navMyBookings: "My bookings",
  signOut: "Sign out",
  language: "Language",
  portalName: "Schaeffler Motion portal",
  checkingAccess: "Checking access and session…",
  checkingAccessSub: "Pannon Transfer · Verifying access",
  preparing: "Preparing your portal…",
  premiumTag: "Premium Corporate Transfer",
  needHelp: "Need help?",
  supportRole: "Developer",
  rights: "All rights reserved.",
  contact: "Contact",
  support: "Support",
  backHome: "Back to home",

  heroEyebrow: "Schaeffler Motion · Transfer Desk",
  heroTitle: "Book your transfer",
  heroSubtitle:
    "Airport and city transfers for Schaeffler Motion colleagues and guests, arranged by the Pannon Transfer dispatch team.",
  progress: "Required fields completed",
  summaryTitle: "Booking summary",
  summaryRoute: "Route",
  summaryWhen: "Schedule",
  summaryParty: "Passengers & luggage",
  summaryClass: "Service class",
  summaryEmpty: "Not set yet",
  summaryPax: "Passengers: {n}",
  summaryBags: "Luggage: {n}",
  summaryNote:
    "You will receive an email confirmation after booking, and our dispatcher will confirm the transfer.",

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
  phFromOther: "e.g. Schaeffler Motion plant, Debrecen",
  phToAirport: "e.g. Budapest Airport (BUD)",
  phToOther: "e.g. 4031 Debrecen, …",
  fFlight: "Flight number",
  phFlight: "e.g. LH1234",
  flightHint:
    "Required for every booking so the driver can follow your arrival or departure.",
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
  okNote:
    "You will receive an email notification as soon as our dispatcher confirms your booking.",
  okMyBookings: "My bookings",
  okNew: "New booking",

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
  srvMaxLuggage:
    "{type} transfers allow at most {n} luggage items per passenger (total {m})",

  loginTag: "Secure partner sign-in",
  loginBrandTitle: "Schaeffler Motion\ntransfer desk.",
  loginBrandText:
    "A dedicated booking interface for Schaeffler Motion business travel: fast, trackable and connected to our dispatch centre.",
  loginFeat1: "Personal, invitation-only access",
  loginFeat2: "Two-factor protection (2FA)",
  loginFeat3: "Real-time booking status",
  loginTitle: "Sign in to the portal",
  loginText:
    "Enter the company email address issued by Pannon Transfer and its password. If your account uses two-factor authentication (2FA), you will be asked for it in the next step.",
  loginTip1: "Sign in with the company address assigned by Pannon Transfer.",
  loginTip2: "If 2FA is required, enter the 6-digit authenticator code or a backup code.",
  loginTip3: "If you have trouble signing in, please contact support.",
  loginGoodToKnow: "Good to know",
  email: "Email address",
  password: "Password",
  emailPh: "name@schaeffler.com",
  remember: "Remember me on this device (7 days)",
  signIn: "Sign in",
  verifying: "Verifying…",
  loginNoAccess: "Don't have access yet, or forgot your password?",
  loginPleaseFill: "Please enter your email address and password.",
  loginFailed: "Sign-in failed.",
  loginUnexpected: "An unexpected error occurred while signing in.",
  networkError: "Network error. Please try again.",
  step2Tag: "Step 2 · Two-factor authentication",
  step2Title: "Confirm your sign-in",
  step2Text:
    "2FA is required for your account. Enter the 6-digit code generated by your authenticator app, or use a backup code.",
  signingInAs: "Signing in as",
  authCode: "Authenticator code (6 digits)",
  backupCode: "Backup code",
  backupPh: "e.g. A1B2-C3D4-E5",
  useBackup: "Use a backup code (if you cannot access your authenticator app)",
  back: "Back",
  processing: "Processing…",
  verifyAndSignIn: "Verify & sign in",
  enterBackup: "Please enter your backup code.",
  enterCode6: "Please enter the 6-digit code generated by your authenticator app.",
  wrong2fa: "Incorrect 2FA code.",
  authSuccess: "Authentication successful",
  secureConn: "Establishing a secure connection…",
  loginSecureFooter: "Dedicated partner portal · invitation only",

  authPersonalTag: "Personal sign-in",
  authVerifyingLink: "Verifying your sign-in link…",
  authRedirecting: "Redirecting…",
  authDeniedTitle: "Access denied",
  authDeniedText:
    "This personal link does not exist, has expired, or has already been used. Please use the link from your most recent email, or request a new invitation.",
  authRequestNew: "Request a new invitation",
  authRequestLink: "Request a new sign-in link",
  authSubjectNew: "Schaeffler Motion Portal - New sign-in link",
  authTwoFactorTitle: "Confirm your sign-in",
  authTwoFactorText:
    "Two-factor authentication is required for your account. Enter the 6-digit code from your authenticator app, or a backup code.",
  authBackupShort: "The backup code is too short.",
  authCodeSixDigits: "The authenticator code consists of 6 digits.",
  authIncorrect: "Incorrect code.",
  authDoneTitle: "Authentication successful",
  authDoneText: "Taking you to the booking page…",
  authLinkInvalid: "This link is invalid or has expired.",

  setupSecure: "Secure activation",
  setupHeroTag: "Dedicated Schaeffler Motion portal",
  setupHeroTitle: "Welcome to your dedicated Schaeffler Motion booking portal.",
  setupHeroText:
    "Activate your personal account in a few quick steps. Once active, you can review your agreed rate structure, book transfers and follow every booking in one secure place.",
  tileAccess: "Access",
  tileAccessV: "Personal, invitation-only activation",
  tileSecurity: "Security",
  tileSecurity2fa: "Two-factor authentication required",
  tileSecurityPwd: "Strong password protection",
  tileSignIn: "Sign-in",
  tileSignInV: "Via your personal link, sent by email",
  tilePortal: "Portal",
  tilePortalV: "Schaeffler Motion rates and bookings",
  helpTitle: "Need help?",
  verifyingInvite: "Verifying your invitation…",
  invalidTitle: "Invalid or expired link",
  invalidText:
    "This access link does not exist, has expired, or has already been used. Please request a new invitation.",
  closePage: "You can safely close this page.",
  step1of2: "Step 1 of 2 · Password",
  step1: "Step 1 · Password",
  setPassword: "Set your password",
  setPasswordTextActive:
    "This account is already active. To request a new personal sign-in link, please contact us using the details below.",
  setPasswordText: "Choose a strong password that only you know. ",
  setPasswordText2fa:
    "In the next step you will also set up two-factor authentication for extra protection.",
  setPasswordTextNo2fa: "This completes your Schaeffler Motion portal activation.",
  invitedAccount: "Invited account",
  loadingEllipsis: "Loading…",
  twoFaRequired: "2FA required",
  newPassword: "New password",
  newPasswordPh: "Create a strong password",
  confirmPassword: "Confirm password",
  confirmPasswordPh: "Re-enter your password",
  showPwd: "Show password",
  hidePwd: "Hide password",
  ruleLen: "At least 8 characters",
  ruleLower: "A lowercase letter",
  ruleUpper: "An uppercase letter",
  ruleDigit: "A number",
  strength0: "Too weak",
  strength1: "Weak",
  strength2: "Fair",
  strength3: "Strong",
  strength4: "Very strong",
  strength5: "Excellent",
  setPwdContinue2fa: "Set password & continue to 2FA",
  setPwdBtn: "Set password",
  termsNote: "By setting a password you accept the company access terms.",
  alreadyActivatedMsg:
    "This account has already been activated. To continue, use the personal sign-in link sent to you, or contact Pannon Transfer to request a new invitation.",
  requestNewLink: "Request a new link",
  requestNewLinkText: "Contact us to have your personal sign-in link re-sent:",
  errPwdShort: "Your password must be at least 8 characters long.",
  errPwdMismatch: "The two passwords do not match.",
  errPwdWeak:
    "This password is too weak. Please include lowercase and uppercase letters and a number.",
  errPwdGeneric: "Something went wrong while setting your password.",
  errNetworkLong: "Network error. Please check your internet connection and try again.",
  tfaStepTag: "Step 2 of 2 · Two-factor authentication",
  tfaTitle: "Set up two-factor authentication",
  tfaText:
    "This account is protected by 2FA. Follow the steps below to link an authenticator app (e.g. Google Authenticator, Microsoft Authenticator, 1Password or Authy).",
  tfa1: "1 · Scan the QR code",
  tfa1Text:
    "Open your authenticator app, tap “+” and scan the QR code, or enter the manual key below.",
  tfaManualKey: "Manual key (if the QR code cannot be scanned)",
  copyKey: "Copy key",
  tfa2: "2 · Save your backup codes",
  tfaDownload: "Download (.txt)",
  tfaDownloaded: "Downloaded",
  tfaImportant:
    "Important: keep these codes somewhere safe. If you lose your phone or authenticator app, they let you sign in. Each code can be used only once.",
  tfa3: "3 · Enter your first code",
  tfaCodeLabel: "6-digit authenticator code",
  tfaBackupLabel: "Backup code (e.g. A1B2-C3D4-E5)",
  tfaUseBackup: "Use a backup code (I cannot access my authenticator app right now)",
  tfaActivate: "Activate 2FA & finish",
  errTfa6: "The authenticator code consists of 6 digits.",
  errTfaBackup: "Backup code format: A1B2-C3D4-E5",
  errCodeWrong: "Incorrect code.",
  doneTitle: "You’re all set",
  doneText: "Thank you — your Schaeffler Motion portal account is ready.",
  doneEmail: "You will shortly receive an email at {email} containing your personal sign-in link.",
  doneEmailFallback: "your address",
  doneCheckInbox: "Check your inbox (and spam folder)",
  doneSignInOnly:
    "Sign in only through the personal link in that email — there is no public login form.",
  doneTwoFa: "You will also be asked for the 6-digit code from your authenticator app.",
  doneNotArriving: "Email not arriving? Contact us at",
  backupFileTitle: "Schaeffler Motion Portal – Two-factor authentication – Backup codes",
  backupFileAccount: "Account",
  backupFileDate: "Date",
  backupFileBody1: "Use one code at a time if you cannot access your authenticator app.",
  backupFileBody2: "Each code can be used only once.",
  backupFileSafe: "Please store these codes in a safe place.",
  backupFileFooter: "© Pannon Transfer – Schaeffler Motion partner portal",
};

const DICTS: Record<MxLang, Dict> = { hu, en };

export function mxText(
  lang: MxLang,
  key: string,
  params?: Record<string, string | number>,
): string {
  let text = DICTS[lang][key] ?? DICTS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}

export type MxTx = (key: string, params?: Record<string, string | number>) => string;

export function makeTx(lang: MxLang): MxTx {
  return (key, params) => mxText(lang, key, params);
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

function transferTypeName(lang: MxLang, raw: string): string {
  return raw === "Standard" ? mxText(lang, "typeStandard") : mxText(lang, "typeExecutive");
}

/**
 * The booking API answers in Hungarian. In Hungarian mode the message is shown
 * as-is; in English mode the known messages are translated and unknown ones fall
 * back to a generic English error, so no Hungarian leaks into the English UI.
 */
export function translateServerMessage(lang: MxLang, message: string): string {
  const trimmed = String(message || "").trim();
  if (!trimmed) return mxText(lang, "errInvalid");
  if (lang === "hu") return trimmed;

  const exactKey = EXACT_SERVER[trimmed];
  if (exactKey) return mxText(lang, exactKey);

  let m = trimmed.match(/^Az átvételnek legalább (\d+) órával a jövőben kell lennie$/);
  if (m) return mxText(lang, "srvMinAdvance", { n: m[1] });
  m = trimmed.match(/^Az átvétel nem lehet több mint (\d+) nap a jövőben$/);
  if (m) return mxText(lang, "srvMaxAdvance", { n: m[1] });
  m = trimmed.match(/^Városi transzferek csak (\S+) és (\S+) között engedélyezettek$/);
  if (m) return mxText(lang, "srvCityHours", { a: m[1], b: m[2] });
  m = trimmed.match(/^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat$/);
  if (m) return mxText(lang, "srvMaxPax", { type: transferTypeName(lang, m[1]), n: m[2] });
  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)$/,
  );
  if (m) {
    return mxText(lang, "srvMaxLuggage", {
      type: transferTypeName(lang, m[1]),
      n: m[2],
      m: m[3],
    });
  }
  if (/^[\x20-\x7E]+$/.test(trimmed)) return trimmed;
  return mxText(lang, "errInvalid");
}

const AUTH_EN: Record<string, string> = {
  "Hiányzó token.": "Missing token.",
  "Hiányzó token vagy kód.": "Missing token or code.",
  "Hiányzó token vagy jelszó.": "Missing token or password.",
  "Hiányzó meghívó token.": "Missing invitation token.",
  "Hiányzó hitelesítő adatok.": "Missing credentials.",
  "Hibás email vagy jelszó.": "Incorrect email or password.",
  "Hibás hitelesítő adatok.": "Incorrect credentials.",
  "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül.":
    "The password for this account must first be set using the invitation link.",
  "A jelszó már be van állítva ehhez a fiókhoz.": "The password is already set for this account.",
  "A jelszónak minimum 8 karakter hosszúnak kell lennie.": "Your password must be at least 8 characters long.",
  "Jelszó módosítás sikertelen.": "The password could not be changed.",
  "Jelszó beállítás sikertelen.": "Password setup failed.",
  "Érvénytelen vagy lejárt meghívó link.": "This invitation link is invalid or has expired.",
  "Érvénytelen vagy lejárt link.": "This link is invalid or has expired.",
  "Érvénytelen vagy nem létező belépési link.": "This sign-in link is invalid or does not exist.",
  "A belépési link érvénytelen vagy lejárt.": "This sign-in link is invalid or has expired.",
  "Ez az egyedi belépési link lejárt. Kérj új meghívót a Pannon Transfer Ügyvezetőtől.":
    "This personal sign-in link has expired. Please request a new invitation from Pannon Transfer.",
  "Ez a fiók még nincs aktiválva — használd a jelszóbeállítási linket.":
    "This account is not activated yet — please use the password setup link.",
  "A fiók még nincs aktiválva.": "This account is not activated yet.",
  "Az Authenticator kód 6 számjegyből áll.": "The authenticator code consists of 6 digits.",
  "A kód helytelen. Próbáld újra 30 mp múlva, vagy használd az egyik mentett backup kódot.":
    "The code is incorrect. Try again in 30 seconds, or use one of your saved backup codes.",
  "A kétfaktoros kód helytelen. Próbáld újra 30 mp múlva, vagy használd az egyik mentett biztonsági kódot.":
    "The two-factor code is incorrect. Try again in 30 seconds, or use one of your saved backup codes.",
  "Nincs ilyen aktivált felhasználó a megadott linkhez.": "No activated user exists for this link.",
  "A kétfaktoros hitelesítés még nem lett inicializálva a fiókodhoz.":
    "Two-factor authentication has not been initialised for your account yet.",
  "A fiókodhoz kétfaktoros hitelesítés be van kérve, de még nincs aktiválva. Kérj új meghívót és vedd fel újra a 2FA beállítását.":
    "Two-factor authentication is required for your account but not activated yet. Please request a new invitation and set up 2FA again.",
  "Ez a fiók igényel kétfaktoros hitelesítést, amely még nincs aktiválva. Kérjük először állítsd be a 2FA-t a meghívó e-mailben kapott linken.":
    "This account requires two-factor authentication, which is not activated yet. Please set up 2FA first using the link in your invitation email.",
  "Hiányzó hitelesítési kihívás token.": "Missing authentication challenge token.",
  "Érvénytelen vagy lejárt kihívás. Kezd újra a bejelentkezést.":
    "This sign-in challenge is invalid or has expired. Please start the sign-in again.",
  "A felhasználó nem található.": "User not found.",
  "Ehhez a fiókhoz nincs kétfaktoros hitelesítés bekapcsolva.":
    "Two-factor authentication is not enabled for this account.",
  "Hibás vagy már felhasznált biztonsági kód.": "The backup code is incorrect or has already been used.",
  "Helytelen vagy lejárt 6 számjegyű kód.": "The 6-digit code is incorrect or has expired.",
  "Kérjük, adj meg egy érvényes biztonsági mentett kódot.": "Please enter a valid backup code.",
  "Kérjük, adj meg az Authenticator által generált 6 számjegyű kódot.":
    "Please enter the 6-digit code generated by your authenticator app.",
  "Nincs aktív munkamenet.": "There is no active session.",
  "Hiba a munkamenet ellenőrzésekor.": "An error occurred while checking your session.",
  "Hiba": "An error occurred.",
};

/** Auth API messages are Hungarian; show them as-is in Hungarian mode and translate in English mode. */
export function translateAuthMessage(lang: MxLang, message: string | undefined | null, fallbackKey: string): string {
  const msg = String(message || "").trim();
  if (!msg) return mxText(lang, fallbackKey);
  if (lang === "hu") return msg;
  if (AUTH_EN[msg]) return AUTH_EN[msg];
  if (/^[\x20-\x7E]+$/.test(msg)) return msg;
  return mxText(lang, fallbackKey);
}
