import type { IbuszLang } from "./lang";
import { translateIbuszMessage } from "@/lib/ibusz-messages";

type Dict = Record<string, string>;

const hu = {
  // Navigation / chrome
  navLabel: "IBUSZ Transfer Desk",
  navSubline: "Dedikált IBUSZ portál",
  navBooking: "Foglalás",
  navMyBookings: "Foglalásaim",
  signOut: "Kijelentkezés",
  language: "Nyelv",
  portalName: "IBUSZ portál",
  premiumTag: "Prémium üzleti transzfer",
  rights: "Minden jog fenntartva.",
  needHelp: "Segítségre van szüksége?",
  supportRole: "Fejlesztő",
  support: "Ügyfélszolgálat",
  yourContact: "Kapcsolattartó",

  // Session / boot
  checkingAccess: "Hozzáférés és munkamenet ellenőrzése…",
  checkingAccessSub: "Pannon Transfer · Hozzáférés ellenőrzése",
  preparing: "A portál előkészítése…",

  // Booking hero
  heroEyebrow: "Dedikált üzleti portál",
  heroTitle: "Foglalja le transzferét",
  heroSubtitle:
    "Reptéri és városi transzferek az IBUSZ munkatársai és vendégei számára, a Pannon Transfer diszpécserei szervezésében.",
  progress: "Kitöltött kötelező mezők",

  secTraveler: "Utas és cég adatai",
  secTravelerSub: "Ki utazik, és hogyan érjük el",
  secService: "Szolgáltatás és fizetés",
  secServiceSub: "Válassza ki a járműkategóriát és a fizetési módot",
  secRoute: "Útvonal és időpont",
  secRouteSub: "Felvétel, leadás, járat és időpont",

  fEmail: "Az utas e-mail címe",
  fEmailPh: "nev@ceg.hu",
  fName: "Az utas neve",
  fNamePh: "Teljes név",
  fCompany: "Cég",
  fPhone: "Telefonszám",
  fPhonePh: "+36…",
  fPhoneHint: "Csak számjegyek, országhívó számmal",
  secondTraveler: "Második utas",
  optional: "opcionális",
  optionalPh: "Opcionális",
  fSecondEmail: "A második utas e-mail címe",
  fSecondPhone: "A második utas telefonszáma",

  fPayment: "Fizetési mód",
  payCard: "Bankkártya a sofőrnél",
  payBank: "Banki átutalás",
  fTransferType: "Transzfer típusa",
  typeStandard: "Standard",
  typeStandardSub: "Economy kategória",
  typeExecutive: "Executive",
  typeExecutiveSub: "Business kategória",
  upToPax: "Legfeljebb {n} utas",

  fFrom: "Felvétel",
  fTo: "Leadás",
  typeAirport: "Repülőtér",
  typeOther: "Egyéb cím",
  fFromAddress: "Felvételi cím",
  fToAddress: "Leadási cím",
  phFromAirport: "pl. Budapest Liszt Ferenc repülőtér (BUD)",
  phFromOther: "pl. 1052 Budapest, Váci utca 1.",
  phToAirport: "pl. Budapest Liszt Ferenc repülőtér (BUD)",
  phToOther: "pl. 4025 Debrecen, Piac utca 1.",
  fFlight: "Járatszám",
  phFlight: "pl. LH1234",
  flightHint:
    "Minden foglalásnál kötelező, hogy a sofőr követni tudja az érkezést vagy az indulást.",
  fDate: "Dátum",
  fTime: "Időpont",
  advanceHint: "Kérjük, legalább {h} órával az indulás előtt foglaljon.",
  fTravelers: "Utasok száma",
  fLuggage: "Csomagok száma",
  luggageHint: "Összesen legfeljebb {n} csomag",
  fComment: "Megjegyzés",
  phComment: "Különleges kérés vagy útmutatás (opcionális)",
  decrease: "Csökkentés",
  increase: "Növelés",

  submit: "Foglalás elküldése",
  sending: "Foglalás küldése…",
  submitHint: "A beküldés után azonnal e-mailes visszaigazolást küldünk.",

  errFixTitle: "Kérjük, javítsa az alábbiakat:",
  errRequired: "{field} megadása kötelező",
  errEmail: "Kérjük, adjon meg érvényes e-mail címet",
  errInvalid: "A megadott adatok érvénytelenek. Kérjük, ellenőrizze az űrlapot.",
  errServer: "Szerverhiba történt. Kérjük, próbálja újra.",
  errUnexpected: "Váratlan hiba történt. Kérjük, próbálja újra.",
  errNetwork: "Hálózati hiba történt. Kérjük, próbálja újra.",

  okTitle: "A foglalás beérkezett",
  okSub: "A visszaigazoló e-mailt elküldtük a megadott címre.",
  okCode: "Foglalási kód",
  okNote:
    "E-mailben értesítjük, amint a diszpécserünk jóváhagyja a foglalását.",
  okMyBookings: "Foglalásaim",
  okNew: "Új foglalás",

  // Server validation messages of the booking API (EN translation keys)
  srvFlightRequired: "A járatszám megadása kötelező",
  srvTravelerEmail: "Az utas e-mail címe kötelező",
  srvTravelerName: "Az utas neve kötelező",
  srvTravelerPhone: "Az utas telefonszáma kötelező",
  srvFromRequired: "A felvételi cím kötelező",
  srvToRequired: "A leadási cím kötelező",
  srvDateRequired: "A felvétel dátuma kötelező",
  srvTimeRequired: "A felvétel időpontja kötelező",
  srvMinPax: "Legalább 1 utas szükséges",
  srvLuggageNegative: "A csomagok száma nem lehet negatív",
  srvBadDateTime: "Érvénytelen felvételi időpont",
  srvMinAdvance: "A felvételnek legalább {n} órával a jövőben kell lennie",
  srvMaxAdvance: "A felvétel nem lehet több mint {n} nap a jövőben",
  srvCityHours: "Városi transzferek csak {a} és {b} között engedélyezettek",
  srvMaxPax: "{type} transzferen legfeljebb {n} utas utazhat",
  srvMaxLuggage:
    "{type} transzferen legfeljebb {n} csomag/utas engedélyezett (összesen {m})",

  // Login
  loginTitle: "Belépés az IBUSZ portálra",
  loginIntro:
    "Adja meg a céges e-mail címét és a fiókjához tartozó jelszót. Ha a fiókja kétfaktoros hitelesítést (2FA) használ, azt a következő lépésben kérjük.",
  loginSub: "Pannon Transfer · Dedikált partnerbelépés",
  goodToKnow: "Jó tudni",
  gtk1: "A Pannon Transfer által megadott céges címmel lépjen be.",
  gtk2: "2FA esetén a hitelesítő alkalmazás 6 számjegyű kódját vagy egy biztonsági kódot kell megadni.",
  gtk3: "Belépési nehézség esetén keresse ügyfélszolgálatunkat.",
  labelEmail: "E-mail cím",
  labelPassword: "Jelszó",
  remember: "Emlékezzen rám ezen az eszközön (7 nap)",
  signIn: "Belépés",
  verifying: "Ellenőrzés…",
  noAccess: "Még nincs hozzáférése, vagy elfelejtette a jelszavát?",
  contactSupport: "Segítség",
  step2Tag: "2. lépés · Kétfaktoros hitelesítés",
  confirmSignIn: "Erősítse meg a belépést",
  tfaIntroA: "A fiókjához",
  tfaIntroB: "2FA szükséges",
  tfaIntroC: ". Adja meg a hitelesítő alkalmazás által generált",
  tfaIntroD: "6 számjegyű kódot",
  tfaIntroE: ", vagy használjon biztonsági kódot.",
  signingInAs: "Belépés mint",
  authCode: "Hitelesítő kód (6 számjegy)",
  backupCode: "Biztonsági kód",
  useBackupLogin:
    "Biztonsági kódot használok (ha nem érem el a hitelesítő alkalmazást)",
  backupPh: "pl. A1B2-C3D4-E5",
  back: "Vissza",
  processing: "Feldolgozás…",
  verifyAndSignIn: "Ellenőrzés és belépés",
  authSuccess: "Sikeres azonosítás",
  secureConn: "Biztonságos kapcsolat létrehozása…",
  errEnterEmailPassword: "Kérjük, adja meg az e-mail címét és a jelszavát.",
  errSignInFailed: "A belépés sikertelen.",
  errUnexpectedSignIn: "Váratlan hiba történt a belépés során.",
  errEnterBackup: "Kérjük, adja meg a biztonsági kódot.",
  errEnterCode6:
    "Kérjük, adja meg a hitelesítő alkalmazás 6 számjegyű kódját.",
  errWrongCode: "Helytelen kód.",

  // Setup password
  secureActivation: "Biztonságos aktiválás",
  setupWelcome: "Üdvözöljük az IBUSZ dedikált foglalási portálján.",
  setupWelcomeSub:
    "Néhány gyors lépésben aktiválja személyes fiókját. Az aktiválás után áttekintheti az egyeztetett díjakat, transzfert foglalhat, és egy helyen követheti az összes foglalását.",
  tileAccess: "Hozzáférés",
  tileAccessV: "Személyes, meghíváshoz kötött aktiválás",
  tileSecurity: "Biztonság",
  tileSecurity2fa: "Kétfaktoros hitelesítés szükséges",
  tileSecurityPw: "Erős jelszavas védelem",
  tileSignIn: "Belépés",
  tileSignInV: "Az e-mailben kapott személyes linken",
  tilePortal: "Portál",
  tilePortalV: "IBUSZ díjak és foglalások",
  setupVerifying: "A meghívó ellenőrzése…",
  invalidTitle: "Érvénytelen vagy lejárt link",
  invalidBody:
    "Ez a hozzáférési link nem létezik, lejárt, vagy már felhasználták. Kérjen új meghívót.",
  contactLabel: "Kapcsolat",
  closeSafely: "Az oldalt nyugodtan bezárhatja.",
  step1of2: "1/2. lépés · Jelszó",
  step1: "1. lépés · Jelszó",
  setPasswordTitle: "Állítsa be a jelszavát",
  alreadyActiveText:
    "Ez a fiók már aktív. Új személyes belépési link kéréséhez kérjük, használja az alábbi elérhetőségeket.",
  chooseStrong: "Válasszon erős jelszót, amelyet csak Ön ismer.",
  chooseStrong2fa:
    "A következő lépésben a még erősebb védelem érdekében kétfaktoros hitelesítést is beállít.",
  chooseStrongDone: "Ezzel az IBUSZ portál aktiválása befejeződik.",
  invitedAccount: "Meghívott fiók",
  loading: "Betöltés…",
  twoFaRequiredBadge: "2FA szükséges",
  newPassword: "Új jelszó",
  newPasswordPh: "Hozzon létre erős jelszót",
  confirmPassword: "Jelszó megerősítése",
  confirmPasswordPh: "Írja be újra a jelszót",
  showPassword: "Jelszó megjelenítése",
  hidePassword: "Jelszó elrejtése",
  strength0: "Túl gyenge",
  strength1: "Gyenge",
  strength2: "Közepes",
  strength3: "Erős",
  strength4: "Nagyon erős",
  strength5: "Kiváló",
  rule8: "Legalább 8 karakter",
  ruleLower: "Egy kisbetű",
  ruleUpper: "Egy nagybetű",
  ruleDigit: "Egy számjegy",
  setPasswordBtn: "Jelszó beállítása",
  setPasswordTo2fa: "Jelszó beállítása és tovább a 2FA-hoz",
  acceptTerms: "A jelszó beállításával elfogadja a céges hozzáférési feltételeket.",
  requestNewLink: "Új link kérése",
  requestNewLinkBody: "Kérje új személyes belépési linkjét az alábbi címen:",
  errPwMin: "A jelszónak legalább 8 karakter hosszúnak kell lennie.",
  errPwMismatch: "A két jelszó nem egyezik.",
  errPwWeak:
    "A jelszó túl gyenge. Használjon kis- és nagybetűt, valamint számjegyet.",
  errPwGeneric: "Hiba történt a jelszó beállításakor.",
  errNetworkCheck: "Hálózati hiba. Kérjük, ellenőrizze az internetkapcsolatot, és próbálja újra.",
  errNetworkShort: "Hálózati hiba. Kérjük, próbálja újra.",
  errAlreadyActivated:
    "Ez a fiók már aktiválva van. A folytatáshoz használja a megkapott személyes belépési linket, vagy kérjen új meghívót a Pannon Transfertől.",
  errCode6Digits: "A hitelesítő kód 6 számjegyből áll.",
  errBackupFormat: "A biztonsági kód formátuma: A1B2-C3D4-E5",
  step2of2: "2/2. lépés · Kétfaktoros hitelesítés",
  tfaTitle: "Kétfaktoros hitelesítés beállítása",
  tfaSetupIntroA: "Ezt a fiókot",
  tfaSetupIntroB: "2FA",
  tfaSetupIntroC:
    " védi. Kövesse az alábbi lépéseket egy hitelesítő alkalmazás (pl. Google Authenticator, Microsoft Authenticator, 1Password vagy Authy) összekapcsolásához.",
  tfaStep1: "1 · Olvassa be a QR-kódot",
  tfaScanText:
    "Nyissa meg a hitelesítő alkalmazást, koppintson a „+” gombra, és olvassa be a QR-kódot, vagy írja be az alábbi kulcsot.",
  tfaManualKey: "Kézi kulcs (ha a QR-kód nem olvasható be)",
  copyKey: "Kulcs másolása",
  tfaStep2: "2 · Mentse el a biztonsági kódokat",
  downloadTxt: "Letöltés (.txt)",
  downloaded: "Letöltve",
  tfaBackupNote:
    "Fontos: tárolja ezeket a kódokat biztonságos helyen. Ha elveszíti a telefonját vagy a hitelesítő alkalmazást, ezekkel tud belépni. Minden kód csak egyszer használható.",
  tfaStep3: "3 · Adja meg az első kódot",
  tfaCodeLabel: "6 számjegyű hitelesítő kód",
  tfaBackupLabel: "Biztonsági kód (pl. A1B2-C3D4-E5)",
  tfaUseBackup:
    "Biztonsági kódot használok (jelenleg nem érem el a hitelesítő alkalmazást)",
  tfaActivate: "2FA aktiválása és befejezés",
  doneTitle: "Minden készen áll",
  doneBodyA: "Köszönjük — az IBUSZ portálfiókja elkészült.",
  doneBodyB: "Hamarosan e-mailt küldünk a(z) {email} címre a személyes belépési linkkel.",
  doneBodyFallback: "a megadott címére",
  checkInbox: "Nézze meg a postaládáját (és a spam mappát)",
  checkInboxBody:
    "Kizárólag az e-mailben kapott személyes linken lépjen be — nincs nyilvános belépési oldal.",
  checkInbox2fa: " Kérni fogjuk a hitelesítő alkalmazás 6 számjegyű kódját is.",
  closeNow: "Az oldalt most bezárhatja.",
  notArriving: "Nem érkezik meg az e-mail? Írjon nekünk:",
  backupFileTitle: "IBUSZ portál – Kétfaktoros hitelesítés – Biztonsági kódok",
  backupFileAccount: "Fiók",
  backupFileDate: "Dátum",
  backupFileIntro:
    "Egyszerre egy kódot használjon, ha nem éri el a hitelesítő alkalmazást.",
  backupFileOnce: "Minden kód csak egyszer használható.",
  backupFileKeep: "Kérjük, tárolja ezeket a kódokat biztonságos helyen.",
  backupFileFooter: "© Pannon Transfer – IBUSZ dedikált ügyfélportál",

  // Magic-link auth page
  authBackHome: "Vissza a kezdőlapra",
  authSub: "Pannon Transfer · Személyes belépés",
  authVerifyingLink: "A belépési link ellenőrzése…",
  authRedirecting: "Átirányítás…",
  authDeniedTitle: "Hozzáférés megtagadva",
  authDeniedBody:
    "Ez a személyes link nem létezik, lejárt, vagy már felhasználták. Kérjük, használja a legutóbbi e-mailben kapott linket, vagy kérjen új meghívót.",
  authRequestInvite: "Új meghívó kérése",
  authRequestLink: "Új belépési link kérése",
  authLinkInvalid: "Ez a link érvénytelen vagy lejárt.",
  tfaPageTitle: "Kétfaktoros hitelesítés",
  tfaPageBody: "A fiókjához 2FA szükséges. Adja meg a hitelesítő alkalmazás",
  tfaPageBody2: "6 számjegyű kódját",
  tfaPageBody3: ", vagy használjon biztonsági kódot.",
  authFooter: "IBUSZ dedikált ügyfélportál · Csak személyes linkkel érhető el",
  errShortBackup: "A biztonsági kód túl rövid.",
} as const;

export type IbuszKey = keyof typeof hu;

const en: Record<IbuszKey, string> = {
  navLabel: "IBUSZ Transfer Desk",
  navSubline: "Dedicated IBUSZ Portal",
  navBooking: "Booking",
  navMyBookings: "My bookings",
  signOut: "Sign out",
  language: "Language",
  portalName: "IBUSZ Portal",
  premiumTag: "Premium Corporate Transfer",
  rights: "All rights reserved.",
  needHelp: "Need help?",
  supportRole: "Developer",
  support: "Support",
  yourContact: "Your contact",

  checkingAccess: "Checking access and session…",
  checkingAccessSub: "Pannon Transfer · Verifying access",
  preparing: "Preparing your portal…",

  heroEyebrow: "Dedicated corporate portal",
  heroTitle: "Book your transfer",
  heroSubtitle:
    "Airport and city transfers for IBUSZ colleagues and guests, arranged by the Pannon Transfer dispatch team.",
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
  phFromOther: "e.g. 1052 Budapest, Váci utca 1.",
  phToAirport: "e.g. Budapest Airport (BUD)",
  phToOther: "e.g. 4025 Debrecen, Piac utca 1.",
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

  okTitle: "Booking received",
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

  loginTitle: "Sign in to the IBUSZ Portal",
  loginIntro:
    "Enter your company email address and the password linked to your account. If your account uses two-factor authentication (2FA), you will be asked for it in the next step.",
  loginSub: "Pannon Transfer · Dedicated partner sign-in",
  goodToKnow: "Good to know",
  gtk1: "Sign in with the company address assigned by Pannon Transfer.",
  gtk2: "If 2FA is required, enter the 6-digit authenticator code or a backup code.",
  gtk3: "If you have trouble signing in, please contact support.",
  labelEmail: "Email address",
  labelPassword: "Password",
  remember: "Remember me on this device (7 days)",
  signIn: "Sign in",
  verifying: "Verifying…",
  noAccess: "Don't have access yet, or forgot your password?",
  contactSupport: "Support",
  step2Tag: "Step 2 · Two-factor authentication",
  confirmSignIn: "Confirm your sign-in",
  tfaIntroA: "",
  tfaIntroB: "2FA is required",
  tfaIntroC: " for your account. Enter the",
  tfaIntroD: "6-digit code",
  tfaIntroE: " generated by your authenticator app, or use a backup code.",
  signingInAs: "Signing in as",
  authCode: "Authenticator code (6 digits)",
  backupCode: "Backup code",
  useBackupLogin:
    "Use a backup code (if you cannot access your authenticator app)",
  backupPh: "e.g. A1B2-C3D4-E5",
  back: "Back",
  processing: "Processing…",
  verifyAndSignIn: "Verify & sign in",
  authSuccess: "Authentication successful",
  secureConn: "Establishing a secure connection…",
  errEnterEmailPassword: "Please enter your email address and password.",
  errSignInFailed: "Sign-in failed.",
  errUnexpectedSignIn: "An unexpected error occurred while signing in.",
  errEnterBackup: "Please enter your backup code.",
  errEnterCode6:
    "Please enter the 6-digit code generated by your authenticator app.",
  errWrongCode: "Incorrect code.",

  secureActivation: "Secure activation",
  setupWelcome: "Welcome to your dedicated IBUSZ booking portal.",
  setupWelcomeSub:
    "Activate your personal account in a few quick steps. Once active, you can review your agreed rate structure, book transfers and follow every booking in one secure place.",
  tileAccess: "Access",
  tileAccessV: "Personal, invitation-only activation",
  tileSecurity: "Security",
  tileSecurity2fa: "Two-factor authentication required",
  tileSecurityPw: "Strong password protection",
  tileSignIn: "Sign-in",
  tileSignInV: "Via your personal link, sent by email",
  tilePortal: "Portal",
  tilePortalV: "IBUSZ rates and bookings",
  setupVerifying: "Verifying your invitation…",
  invalidTitle: "Invalid or expired link",
  invalidBody:
    "This access link does not exist, has expired, or has already been used. Please request a new invitation.",
  contactLabel: "Contact",
  closeSafely: "You can safely close this page.",
  step1of2: "Step 1 of 2 · Password",
  step1: "Step 1 · Password",
  setPasswordTitle: "Set your password",
  alreadyActiveText:
    "This account is already active. To request a new personal sign-in link, please contact us using the details below.",
  chooseStrong: "Choose a strong password that only you know.",
  chooseStrong2fa:
    "In the next step you will also set up two-factor authentication for extra protection.",
  chooseStrongDone: "This completes your IBUSZ portal activation.",
  invitedAccount: "Invited account",
  loading: "Loading…",
  twoFaRequiredBadge: "2FA required",
  newPassword: "New password",
  newPasswordPh: "Create a strong password",
  confirmPassword: "Confirm password",
  confirmPasswordPh: "Re-enter your password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  strength0: "Too weak",
  strength1: "Weak",
  strength2: "Fair",
  strength3: "Strong",
  strength4: "Very strong",
  strength5: "Excellent",
  rule8: "At least 8 characters",
  ruleLower: "A lowercase letter",
  ruleUpper: "An uppercase letter",
  ruleDigit: "A number",
  setPasswordBtn: "Set password",
  setPasswordTo2fa: "Set password & continue to 2FA",
  acceptTerms: "By setting a password you accept the company access terms.",
  requestNewLink: "Request a new link",
  requestNewLinkBody: "Contact us to have your personal sign-in link re-sent:",
  errPwMin: "Your password must be at least 8 characters long.",
  errPwMismatch: "The two passwords do not match.",
  errPwWeak:
    "This password is too weak. Please include lowercase and uppercase letters and a number.",
  errPwGeneric: "Something went wrong while setting your password.",
  errNetworkCheck:
    "Network error. Please check your internet connection and try again.",
  errNetworkShort: "Network error. Please try again.",
  errAlreadyActivated:
    "This account has already been activated. To continue, use the personal sign-in link sent to you, or contact Pannon Transfer to request a new invitation.",
  errCode6Digits: "The authenticator code consists of 6 digits.",
  errBackupFormat: "Backup code format: A1B2-C3D4-E5",
  step2of2: "Step 2 of 2 · Two-factor authentication",
  tfaTitle: "Set up two-factor authentication",
  tfaSetupIntroA: "This account is protected by",
  tfaSetupIntroB: "2FA",
  tfaSetupIntroC:
    ". Follow the steps below to link an authenticator app (e.g. Google Authenticator, Microsoft Authenticator, 1Password or Authy).",
  tfaStep1: "1 · Scan the QR code",
  tfaScanText:
    "Open your authenticator app, tap “+” and scan the QR code, or enter the manual key below.",
  tfaManualKey: "Manual key (if the QR code cannot be scanned)",
  copyKey: "Copy key",
  tfaStep2: "2 · Save your backup codes",
  downloadTxt: "Download (.txt)",
  downloaded: "Downloaded",
  tfaBackupNote:
    "Important: keep these codes somewhere safe. If you lose your phone or authenticator app, they let you sign in. Each code can be used only once.",
  tfaStep3: "3 · Enter your first code",
  tfaCodeLabel: "6-digit authenticator code",
  tfaBackupLabel: "Backup code (e.g. A1B2-C3D4-E5)",
  tfaUseBackup:
    "Use a backup code (I cannot access my authenticator app right now)",
  tfaActivate: "Activate 2FA & finish",
  doneTitle: "You’re all set",
  doneBodyA: "Thank you — your IBUSZ portal account is ready.",
  doneBodyB:
    "You will shortly receive an email at {email} containing your personal sign-in link.",
  doneBodyFallback: "your address",
  checkInbox: "Check your inbox (and spam folder)",
  checkInboxBody:
    "Sign in only through the personal link in that email — there is no public login form.",
  checkInbox2fa:
    " You will also be asked for the 6-digit code from your authenticator app.",
  closeNow: "You can now close this page.",
  notArriving: "Email not arriving? Contact us at",
  backupFileTitle: "IBUSZ Portal – Two-factor authentication – Backup codes",
  backupFileAccount: "Account",
  backupFileDate: "Date",
  backupFileIntro:
    "Use one code at a time if you cannot access your authenticator app.",
  backupFileOnce: "Each code can be used only once.",
  backupFileKeep: "Please store these codes in a safe place.",
  backupFileFooter: "© Pannon Transfer – IBUSZ Dedicated Client Portal",

  authBackHome: "Back to home",
  authSub: "Pannon Transfer · Personal sign-in",
  authVerifyingLink: "Verifying your sign-in link…",
  authRedirecting: "Redirecting…",
  authDeniedTitle: "Access denied",
  authDeniedBody:
    "This personal link does not exist, has expired, or has already been used. Please use the link from your most recent email, or request a new invitation.",
  authRequestInvite: "Request a new invitation",
  authRequestLink: "Request a new sign-in link",
  authLinkInvalid: "This link is invalid or has expired.",
  tfaPageTitle: "Two-factor authentication",
  tfaPageBody: "2FA is required for your account. Enter the",
  tfaPageBody2: "6-digit code",
  tfaPageBody3: " generated by your authenticator app, or use a backup code.",
  authFooter: "IBUSZ Dedicated Client Portal · Personal link access only",
  errShortBackup: "The backup code is too short.",
};

const DICTS: Record<IbuszLang, Dict> = { hu, en };

export function ibText(
  lang: IbuszLang,
  key: IbuszKey,
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

export function makeIb(lang: IbuszLang) {
  return (key: IbuszKey, params?: Record<string, string | number>) =>
    ibText(lang, key, params);
}

/** Server auth/API messages -> active portal language. */
export function authMessage(
  lang: IbuszLang,
  message: string | undefined | null,
  fallbackKey: IbuszKey,
): string {
  return translateIbuszMessage(lang, message, ibText(lang, fallbackKey));
}

/* ------------------------------------------------------------------ */
/* Booking-API validation messages (always Hungarian on the server)    */
/* ------------------------------------------------------------------ */

const EXACT_SERVER: Record<string, IbuszKey> = {
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

function transferTypeName(lang: IbuszLang, raw: string): string {
  return raw === "Standard"
    ? ibText(lang, "typeStandard")
    : ibText(lang, "typeExecutive");
}

/** Hungarian passes through unchanged; English gets a translated message. */
export function translateIbuszServerMessage(
  lang: IbuszLang,
  message: string,
): string {
  const trimmed = String(message || "").trim();
  if (!trimmed) return ibText(lang, "errInvalid");
  if (lang === "hu") return trimmed;

  const exactKey = EXACT_SERVER[trimmed];
  if (exactKey) return ibText(lang, exactKey);

  let m = trimmed.match(
    /^Az átvételnek legalább (\d+) órával a jövőben kell lennie$/,
  );
  if (m) return ibText(lang, "srvMinAdvance", { n: m[1] });

  m = trimmed.match(/^Az átvétel nem lehet több mint (\d+) nap a jövőben$/);
  if (m) return ibText(lang, "srvMaxAdvance", { n: m[1] });

  m = trimmed.match(
    /^Városi transzferek csak (\S+) és (\S+) között engedélyezettek$/,
  );
  if (m) return ibText(lang, "srvCityHours", { a: m[1], b: m[2] });

  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat$/,
  );
  if (m) {
    return ibText(lang, "srvMaxPax", {
      type: transferTypeName(lang, m[1]),
      n: m[2],
    });
  }

  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)$/,
  );
  if (m) {
    return ibText(lang, "srvMaxLuggage", {
      type: transferTypeName(lang, m[1]),
      n: m[2],
      m: m[3],
    });
  }

  if (/^[\x20-\x7E]+$/.test(trimmed)) return trimmed;
  return ibText(lang, "errInvalid");
}
