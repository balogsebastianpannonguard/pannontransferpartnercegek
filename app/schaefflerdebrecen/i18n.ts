"use client";

import { useCallback, useSyncExternalStore } from "react";

export type SdLang = "hu" | "en";

export const SD_LANG_STORAGE_KEY = "schaefflerdebrecen_lang";
const SD_LANG_EVENT = "schaefflerdebrecen-lang-change";

export const SD_LANGS: { id: SdLang; label: string; full: string }[] = [
  { id: "hu", label: "HU", full: "Magyar" },
  { id: "en", label: "EN", full: "English" },
];

const en = {
  // Brand / header
  navLabel: "Schaeffler Debrecen Transfer Desk",
  navSubline: "Dedicated partner portal",
  navBooking: "Booking",
  navMyBookings: "My bookings",
  signOut: "Sign out",
  language: "Language",
  portalName: "Schaeffler Debrecen",

  // Boot / access check
  checkingAccess: "Checking access and session…",
  checkingAccessSub: "Pannon Transfer · Verifying access",
  preparing: "Preparing your portal…",
  premiumTag: "Premium corporate transfer",

  // Booking page – hero
  heroEyebrow: "Dedicated corporate portal",
  heroTitle: "Book your transfer",
  heroSubtitle:
    "Airport and city transfers for Schaeffler Debrecen colleagues and guests, arranged by the Pannon Transfer dispatch team.",
  progress: "Required fields completed",

  // Sections
  secTraveler: "Passenger & company",
  secTravelerSub: "Who is travelling and how we can reach them",
  secService: "Service & payment",
  secServiceSub: "Choose the vehicle class and the payment method",
  secRoute: "Route & schedule",
  secRouteSub: "Pick-up, drop-off, flight and timing",

  // Fields
  fEmail: "Passenger's email address",
  fEmailPh: "name@schaeffler.com",
  fName: "Passenger's full name",
  fNamePh: "Full name",
  fCompany: "Company",
  fPhone: "Phone number",
  fPhonePh: "+36…",
  fPhoneHint: "Digits only, including the country code",
  secondTraveler: "Second passenger",
  optional: "optional",
  optionalPh: "Optional",
  fSecondEmail: "Second passenger's email",
  fSecondPhone: "Second passenger's phone",

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
  phFromOther: "e.g. Schaeffler Debrecen plant",
  phToAirport: "e.g. Budapest Airport (BUD)",
  phToOther: "e.g. 4031 Debrecen, …",
  fFlight: "Flight number",
  phFlight: "e.g. LH1234",
  flightHint: "Required for every booking so the driver can follow the arrival or departure.",
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

  // Server messages (booking API)
  srvFlightRequired: "The flight number is required",
  srvTravelerEmail: "The passenger's email address is required",
  srvTravelerName: "The passenger's name is required",
  srvTravelerPhone: "The passenger's phone number is required",
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

  // Login (step 1 / 2)
  loginBarTag: "Pannon Transfer · Dedicated partner sign-in",
  loginTitle: "Sign in to the Schaeffler Debrecen portal",
  loginIntro:
    "Enter your company email address and the password linked to your account. If your account uses two-factor authentication (2FA), you will be asked for it in the next step.",
  loginGoodToKnow: "Good to know",
  loginTip1: "Sign in with the company address assigned by Pannon Transfer.",
  loginTip2: "If 2FA is required, enter the 6-digit authenticator code or a backup code.",
  loginTip3: "If you have trouble signing in, please contact support.",
  loginEmail: "Email address",
  loginEmailPh: "name@schaeffler.com",
  loginPassword: "Password",
  loginRemember: "Remember me on this device (7 days)",
  loginVerifying: "Verifying…",
  loginSubmit: "Sign in",
  loginNoAccess: "Don't have access yet, or forgot your password?",
  loginSupport: "Support",
  loginEnterBoth: "Please enter your email address and password.",
  loginFailed: "Sign-in failed.",
  loginUnexpected: "An unexpected error occurred while signing in.",
  networkError: "Network error. Please try again.",
  tfaStep2: "Step 2 · Two-factor authentication",
  tfaConfirmTitle: "Confirm your sign-in",
  tfaRequiredLead: "2FA is required",
  tfaIntroA: "for your account. Enter the",
  tfaIntroB: "6-digit code",
  tfaIntroC: "generated by your authenticator app, or use a backup code.",
  signingInAs: "Signing in as",
  tfaCodeLabel: "Authenticator code (6 digits)",
  tfaBackupLabel: "Backup code",
  tfaBackupPh: "e.g. A1B2-C3D4-E5",
  tfaUseBackup: "Use a backup code (if you cannot access your authenticator app)",
  tfaEnterBackup: "Please enter your backup code.",
  tfaEnter6: "Please enter the 6-digit code generated by your authenticator app.",
  tfaIncorrect: "Incorrect 2FA code.",
  back: "Back",
  processing: "Processing…",
  verifySignIn: "Verify & sign in",
  authSuccess: "Authentication successful",
  authEstablishing: "Establishing a secure connection…",
  portalWord: "Portal",

  // Magic link page
  authBarTag: "Pannon Transfer · Personal sign-in",
  backToHome: "Back to home",
  verifyingLink: "Verifying your sign-in link…",
  redirecting: "Redirecting…",
  accessDenied: "Access denied",
  linkInvalidBody:
    "This personal link does not exist, has expired, or has already been used. Please use the link from your most recent email, or request a new invitation.",
  requestNewInvite: "Request a new invitation",
  requestNewLink: "Request a new sign-in link",
  linkInvalidShort: "This link is invalid or has expired.",
  tfaTitle: "Two-factor authentication",
  footerPersonalLink: "Schaeffler Debrecen dedicated client portal · Personal link access only",

  // Setup password page
  setupSecure: "Secure activation",
  setupBadge: "Schaeffler Debrecen dedicated portal",
  setupWelcome: "Welcome to your dedicated Schaeffler Debrecen booking portal.",
  setupWelcomeBody:
    "Activate your personal account in a few quick steps. Once active, you can review your agreed rate structure, book transfers and follow every booking in one secure place.",
  tileAccess: "Access",
  tileAccessVal: "Personal, invitation-only activation",
  tileSecurity: "Security",
  tileSecurity2fa: "Two-factor authentication required",
  tileSecurityPwd: "Strong password protection",
  tileSignin: "Sign-in",
  tileSigninVal: "Via your personal link, sent by email",
  tilePortal: "Portal",
  tilePortalVal: "Schaeffler Debrecen rates and bookings",
  verifyingInvite: "Verifying your invitation…",
  invalidLinkTitle: "Invalid or expired link",
  invalidLinkBody:
    "This access link does not exist, has expired, or has already been used. Please request a new invitation.",
  contact: "Contact",
  closePage: "You can safely close this page.",
  step1of2: "Step 1 of 2 · Password",
  step1: "Step 1 · Password",
  setPasswordTitle: "Set your password",
  setPasswordIntroActive:
    "This account is already active. To request a new personal sign-in link, please contact us using the details below.",
  setPasswordIntro: "Choose a strong password that only you know.",
  setPasswordIntro2fa: "In the next step you will also set up two-factor authentication for extra protection.",
  setPasswordIntroDone: "This completes your Schaeffler Debrecen portal activation.",
  invitedAccount: "Invited account",
  loading: "Loading…",
  tfaRequiredBadge: "2FA required",
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
  setPasswordCta: "Set password",
  setPasswordCta2fa: "Set password & continue to 2FA",
  acceptTerms: "By setting a password you accept the company access terms.",
  alreadyActivatedErr:
    "This account has already been activated. To continue, use the personal sign-in link sent to you, or contact Pannon Transfer to request a new invitation.",
  requestLink: "Request a new link",
  requestLinkBody: "Contact us to have your personal sign-in link re-sent:",
  errPwdShort: "Your password must be at least 8 characters long.",
  errPwdMismatch: "The two passwords do not match.",
  errPwdWeak: "This password is too weak. Please include lowercase and uppercase letters and a number.",
  errSetPassword: "Something went wrong while setting your password.",
  errNetworkLong: "Network error. Please check your internet connection and try again.",
  errIncorrectCode: "Incorrect code.",
  errBackupFormat: "Backup code format: A1B2-C3D4-E5",
  step2of2: "Step 2 of 2 · Two-factor authentication",
  tfaSetupTitle: "Set up two-factor authentication",
  tfaSetupIntroA: "This account is protected by",
  tfaSetupIntroB:
    ". Follow the steps below to link an authenticator app (e.g. Google Authenticator, Microsoft Authenticator, 1Password or Authy).",
  tfaStepScan: "1 · Scan the QR code",
  tfaScanBody: "Open your authenticator app, tap “+” and scan the QR code, or enter the manual key below.",
  tfaManualKey: "Manual key (if the QR code cannot be scanned)",
  copyKey: "Copy key",
  tfaStepBackup: "2 · Save your backup codes",
  download: "Download (.txt)",
  downloaded: "Downloaded",
  tfaBackupNote:
    "keep these codes somewhere safe. If you lose your phone or authenticator app, they let you sign in. Each code can be used only once.",
  important: "Important:",
  tfaStepCode: "3 · Enter your first code",
  tfaFirstCode: "6-digit authenticator code",
  tfaFirstBackup: "Backup code (e.g. A1B2-C3D4-E5)",
  tfaUseBackupSetup: "Use a backup code (I cannot access my authenticator app right now)",
  tfaFinish: "Activate 2FA & finish",
  allSet: "You’re all set",
  allSetBodyA: "Thank you — your Schaeffler Debrecen portal account is ready.",
  allSetBodyB: "You will shortly receive an email at {email} containing your personal sign-in link.",
  yourAddress: "your address",
  checkInbox: "Check your inbox (and spam folder)",
  checkInboxBody: "Sign in only through the personal link in that email — there is no public login form.",
  checkInboxBody2fa: " You will also be asked for the 6-digit code from your authenticator app.",
  closeNow: "You can now close this page.",
  emailNotArriving: "Email not arriving? Contact us at",
  needHelpCard: "Need help?",
  supportLine: "Support:",
  qrAlt: "2FA QR code",
  backupFileTitle: "Schaeffler Debrecen Portal – Two-factor authentication – Backup codes",
  backupFileAccount: "Account",
  backupFileDate: "Date",
  backupFileUse: "Use one code at a time if you cannot access your authenticator app.",
  backupFileOnce: "Each code can be used only once.",
  backupFileStore: "Please store these codes in a safe place.",
  copied: "Copied",
} as const;

export type SdKey = keyof typeof en;

const hu: Record<SdKey, string> = {
  navLabel: "Schaeffler Debrecen transzferpult",
  navSubline: "Dedikált partnerportál",
  navBooking: "Foglalás",
  navMyBookings: "Foglalásaim",
  signOut: "Kijelentkezés",
  language: "Nyelv",
  portalName: "Schaeffler Debrecen",

  checkingAccess: "Hozzáférés és munkamenet ellenőrzése…",
  checkingAccessSub: "Pannon Transfer · Hozzáférés ellenőrzése",
  preparing: "A portál előkészítése…",
  premiumTag: "Prémium céges transzfer",

  heroEyebrow: "Dedikált céges portál",
  heroTitle: "Foglalja le transzferét",
  heroSubtitle:
    "Repülőtéri és városi transzferek a Schaeffler Debrecen munkatársainak és vendégeinek, a Pannon Transfer diszpécserei szervezésében.",
  progress: "Kötelező mezők kitöltve",

  secTraveler: "Utas és cég",
  secTravelerSub: "Ki utazik, és hogyan érhetjük el",
  secService: "Szolgáltatás és fizetés",
  secServiceSub: "Válassza ki a járműkategóriát és a fizetési módot",
  secRoute: "Útvonal és időpont",
  secRouteSub: "Felvétel, leadás, járat és időzítés",

  fEmail: "Az utas e-mail-címe",
  fEmailPh: "nev@schaeffler.com",
  fName: "Az utas teljes neve",
  fNamePh: "Teljes név",
  fCompany: "Cég",
  fPhone: "Telefonszám",
  fPhonePh: "+36…",
  fPhoneHint: "Csak számjegyek, országhívóval együtt",
  secondTraveler: "Második utas",
  optional: "nem kötelező",
  optionalPh: "Nem kötelező",
  fSecondEmail: "A második utas e-mail-címe",
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
  phFromAirport: "pl. Budapest Liszt Ferenc Repülőtér (BUD)",
  phFromOther: "pl. Schaeffler Debrecen gyár",
  phToAirport: "pl. Budapest Liszt Ferenc Repülőtér (BUD)",
  phToOther: "pl. 4031 Debrecen, …",
  fFlight: "Járatszám",
  phFlight: "pl. LH1234",
  flightHint: "Minden foglalásnál kötelező, hogy a sofőr követhesse az érkezést vagy az indulást.",
  fDate: "Dátum",
  fTime: "Időpont",
  advanceHint: "Kérjük, legalább {h} órával előre foglaljon.",
  fTravelers: "Utasok száma",
  fLuggage: "Csomagok száma",
  luggageHint: "Összesen legfeljebb {n}",
  fComment: "Megjegyzés",
  phComment: "Különleges kérések vagy utasítások (nem kötelező)",
  decrease: "Csökkentés",
  increase: "Növelés",

  submit: "Foglalás elküldése",
  sending: "A foglalás küldése…",
  submitHint: "A beküldés után azonnal e-mailes visszaigazolást kap.",

  errFixTitle: "Kérjük, javítsa a következőket:",
  errRequired: "{field} megadása kötelező",
  errEmail: "Kérjük, adjon meg érvényes e-mail-címet",
  errInvalid: "A megadott adatok érvénytelenek. Kérjük, ellenőrizze az űrlapot.",
  errServer: "Szerverhiba történt. Kérjük, próbálja újra.",
  errUnexpected: "Váratlan hiba történt. Kérjük, próbálja újra.",
  errNetwork: "Hálózati hiba történt. Kérjük, próbálja újra.",

  okTitle: "A foglalás beérkezett",
  okSub: "A visszaigazoló e-mailt elküldtük a megadott címre.",
  okCode: "Foglalási kód",
  okNote: "E-mailben értesítjük, amint diszpécserünk visszaigazolja a foglalást.",
  okMyBookings: "Foglalásaim",
  okNew: "Új foglalás",

  needHelp: "Segítségre van szüksége?",
  supportRole: "Fejlesztő",
  rights: "Minden jog fenntartva.",

  srvFlightRequired: "A járatszám megadása kötelező",
  srvTravelerEmail: "Az utas e-mail-címe kötelező",
  srvTravelerName: "Az utas neve kötelező",
  srvTravelerPhone: "Az utas telefonszáma kötelező",
  srvFromRequired: "A felvételi cím kötelező",
  srvToRequired: "A leadási cím kötelező",
  srvDateRequired: "A felvétel dátuma kötelező",
  srvTimeRequired: "A felvétel időpontja kötelező",
  srvMinPax: "Legalább 1 utas szükséges",
  srvLuggageNegative: "A csomagok száma nem lehet negatív",
  srvBadDateTime: "Érvénytelen felvételi dátum vagy időpont",
  srvMinAdvance: "A felvételnek legalább {n} órával a jövőben kell lennie",
  srvMaxAdvance: "A felvétel legfeljebb {n} nappal lehet a jövőben",
  srvCityHours: "Városi transzfer csak {a} és {b} között foglalható",
  srvMaxPax: "{type} transzferen legfeljebb {n} utas utazhat",
  srvMaxLuggage: "{type} transzferen utasonként legfeljebb {n} csomag engedélyezett (összesen {m})",

  loginBarTag: "Pannon Transfer · Dedikált partnerbelépés",
  loginTitle: "Belépés a Schaeffler Debrecen portálra",
  loginIntro:
    "Adja meg céges e-mail-címét és a fiókjához tartozó jelszót. Ha fiókja kétfaktoros hitelesítést (2FA) használ, a következő lépésben kérjük a kódot.",
  loginGoodToKnow: "Jó tudni",
  loginTip1: "A Pannon Transfer által kiadott céges címmel lépjen be.",
  loginTip2: "Ha 2FA szükséges, adja meg a hitelesítő alkalmazás 6 számjegyű kódját vagy egy biztonsági kódot.",
  loginTip3: "Ha problémája van a belépéssel, kérjük, forduljon az ügyfélszolgálathoz.",
  loginEmail: "E-mail-cím",
  loginEmailPh: "nev@schaeffler.com",
  loginPassword: "Jelszó",
  loginRemember: "Maradjak bejelentkezve ezen az eszközön (7 nap)",
  loginVerifying: "Ellenőrzés…",
  loginSubmit: "Belépés",
  loginNoAccess: "Még nincs hozzáférése, vagy elfelejtette a jelszavát?",
  loginSupport: "Ügyfélszolgálat",
  loginEnterBoth: "Kérjük, adja meg az e-mail-címét és a jelszavát.",
  loginFailed: "A belépés sikertelen.",
  loginUnexpected: "Váratlan hiba történt a belépés közben.",
  networkError: "Hálózati hiba. Kérjük, próbálja újra.",
  tfaStep2: "2. lépés · Kétfaktoros hitelesítés",
  tfaConfirmTitle: "Erősítse meg a belépést",
  tfaRequiredLead: "A 2FA kötelező",
  tfaIntroA: "a fiókjához. Adja meg a hitelesítő alkalmazás által generált",
  tfaIntroB: "6 számjegyű kódot",
  tfaIntroC: "vagy használjon biztonsági kódot.",
  signingInAs: "Belépés mint",
  tfaCodeLabel: "Hitelesítő kód (6 számjegy)",
  tfaBackupLabel: "Biztonsági kód",
  tfaBackupPh: "pl. A1B2-C3D4-E5",
  tfaUseBackup: "Biztonsági kód használata (ha nem fér hozzá a hitelesítő alkalmazáshoz)",
  tfaEnterBackup: "Kérjük, adja meg a biztonsági kódot.",
  tfaEnter6: "Kérjük, adja meg a hitelesítő alkalmazás 6 számjegyű kódját.",
  tfaIncorrect: "Hibás 2FA-kód.",
  back: "Vissza",
  processing: "Feldolgozás…",
  verifySignIn: "Ellenőrzés és belépés",
  authSuccess: "Sikeres hitelesítés",
  authEstablishing: "Biztonságos kapcsolat létrehozása…",
  portalWord: "Portál",

  authBarTag: "Pannon Transfer · Személyes belépés",
  backToHome: "Vissza a főoldalra",
  verifyingLink: "A belépési link ellenőrzése…",
  redirecting: "Átirányítás…",
  accessDenied: "A hozzáférés megtagadva",
  linkInvalidBody:
    "Ez a személyes link nem létezik, lejárt, vagy már felhasználták. Kérjük, használja a legutóbbi e-mailben kapott linket, vagy kérjen új meghívót.",
  requestNewInvite: "Új meghívó kérése",
  requestNewLink: "Új belépési link kérése",
  linkInvalidShort: "A link érvénytelen vagy lejárt.",
  tfaTitle: "Kétfaktoros hitelesítés",
  footerPersonalLink: "Schaeffler Debrecen dedikált ügyfélportál · Kizárólag személyes linkkel érhető el",

  setupSecure: "Biztonságos aktiválás",
  setupBadge: "Schaeffler Debrecen dedikált portál",
  setupWelcome: "Üdvözöljük a dedikált Schaeffler Debrecen foglalási portálon.",
  setupWelcomeBody:
    "Aktiválja személyes fiókját néhány gyors lépésben. Az aktiválás után áttekintheti a megállapodott díjszabást, transzfereket foglalhat, és egy biztonságos helyen követheti az összes foglalását.",
  tileAccess: "Hozzáférés",
  tileAccessVal: "Személyes, meghívásos aktiválás",
  tileSecurity: "Biztonság",
  tileSecurity2fa: "Kétfaktoros hitelesítés kötelező",
  tileSecurityPwd: "Erős jelszóvédelem",
  tileSignin: "Belépés",
  tileSigninVal: "E-mailben kapott személyes linken keresztül",
  tilePortal: "Portál",
  tilePortalVal: "Schaeffler Debrecen díjszabás és foglalások",
  verifyingInvite: "A meghívó ellenőrzése…",
  invalidLinkTitle: "Érvénytelen vagy lejárt link",
  invalidLinkBody:
    "Ez a hozzáférési link nem létezik, lejárt, vagy már felhasználták. Kérjük, kérjen új meghívót.",
  contact: "Kapcsolat",
  closePage: "Az oldalt nyugodtan bezárhatja.",
  step1of2: "1/2. lépés · Jelszó",
  step1: "1. lépés · Jelszó",
  setPasswordTitle: "Állítsa be a jelszavát",
  setPasswordIntroActive:
    "Ez a fiók már aktív. Új személyes belépési link kéréséhez kérjük, használja az alábbi elérhetőségeket.",
  setPasswordIntro: "Válasszon erős jelszót, amelyet csak Ön ismer.",
  setPasswordIntro2fa: "A következő lépésben a fokozott védelem érdekében kétfaktoros hitelesítést is beállít.",
  setPasswordIntroDone: "Ezzel befejezi a Schaeffler Debrecen portál aktiválását.",
  invitedAccount: "Meghívott fiók",
  loading: "Betöltés…",
  tfaRequiredBadge: "2FA kötelező",
  newPassword: "Új jelszó",
  newPasswordPh: "Adjon meg egy erős jelszót",
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
  setPasswordCta: "Jelszó beállítása",
  setPasswordCta2fa: "Jelszó beállítása és tovább a 2FA-hoz",
  acceptTerms: "A jelszó beállításával elfogadja a céges hozzáférési feltételeket.",
  alreadyActivatedErr:
    "Ez a fiók már aktiválva van. A folytatáshoz használja a kapott személyes belépési linket, vagy kérjen új meghívót a Pannon Transfertől.",
  requestLink: "Új link kérése",
  requestLinkBody: "Vegye fel velünk a kapcsolatot, és újraküldjük a személyes belépési linket:",
  errPwdShort: "A jelszónak legalább 8 karakter hosszúnak kell lennie.",
  errPwdMismatch: "A két jelszó nem egyezik.",
  errPwdWeak: "A jelszó túl gyenge. Kérjük, használjon kis- és nagybetűt, valamint számjegyet.",
  errSetPassword: "Hiba történt a jelszó beállítása közben.",
  errNetworkLong: "Hálózati hiba. Kérjük, ellenőrizze az internetkapcsolatot, és próbálja újra.",
  errIncorrectCode: "Hibás kód.",
  errBackupFormat: "A biztonsági kód formátuma: A1B2-C3D4-E5",
  step2of2: "2/2. lépés · Kétfaktoros hitelesítés",
  tfaSetupTitle: "Kétfaktoros hitelesítés beállítása",
  tfaSetupIntroA: "Ezt a fiókot",
  tfaSetupIntroB:
    " védi. Kövesse az alábbi lépéseket egy hitelesítő alkalmazás (pl. Google Authenticator, Microsoft Authenticator, 1Password vagy Authy) összekapcsolásához.",
  tfaStepScan: "1 · Olvassa be a QR-kódot",
  tfaScanBody:
    "Nyissa meg a hitelesítő alkalmazást, koppintson a „+” gombra, és olvassa be a QR-kódot, vagy írja be az alábbi kulcsot.",
  tfaManualKey: "Kézi kulcs (ha a QR-kód nem olvasható be)",
  copyKey: "Kulcs másolása",
  tfaStepBackup: "2 · Mentse el a biztonsági kódokat",
  download: "Letöltés (.txt)",
  downloaded: "Letöltve",
  tfaBackupNote:
    "őrizze meg ezeket a kódokat biztonságos helyen. Ha elveszíti a telefonját vagy a hitelesítő alkalmazást, ezekkel tud belépni. Minden kód csak egyszer használható.",
  important: "Fontos:",
  tfaStepCode: "3 · Adja meg az első kódot",
  tfaFirstCode: "6 számjegyű hitelesítő kód",
  tfaFirstBackup: "Biztonsági kód (pl. A1B2-C3D4-E5)",
  tfaUseBackupSetup: "Biztonsági kód használata (most nem férek hozzá a hitelesítő alkalmazáshoz)",
  tfaFinish: "2FA aktiválása és befejezés",
  allSet: "Minden készen áll",
  allSetBodyA: "Köszönjük — a Schaeffler Debrecen portál fiókja elkészült.",
  allSetBodyB: "Hamarosan e-mailt kap a(z) {email} címre a személyes belépési linkkel.",
  yourAddress: "a megadott cím",
  checkInbox: "Nézze meg a postaládáját (és a spam mappát is)",
  checkInboxBody:
    "Kizárólag az e-mailben kapott személyes linken keresztül léphet be — nyilvános belépési űrlap nincs.",
  checkInboxBody2fa: " Belépéskor a hitelesítő alkalmazás 6 számjegyű kódját is kérni fogjuk.",
  closeNow: "Az oldalt most már bezárhatja.",
  emailNotArriving: "Nem érkezik meg az e-mail? Írjon nekünk:",
  needHelpCard: "Segítségre van szüksége?",
  supportLine: "Ügyfélszolgálat:",
  qrAlt: "2FA QR-kód",
  backupFileTitle: "Schaeffler Debrecen Portál – Kétfaktoros hitelesítés – Biztonsági kódok",
  backupFileAccount: "Fiók",
  backupFileDate: "Dátum",
  backupFileUse: "Egyszerre egy kódot használjon, ha nem fér hozzá a hitelesítő alkalmazáshoz.",
  backupFileOnce: "Minden kód csak egyszer használható.",
  backupFileStore: "Kérjük, őrizze meg ezeket a kódokat biztonságos helyen.",
  copied: "Másolva",
};

const DICTS: Record<SdLang, Record<SdKey, string>> = { hu, en };

export function sdText(lang: SdLang, key: SdKey, params?: Record<string, string | number>): string {
  let text: string = DICTS[lang][key] ?? DICTS.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}

function subscribeLang(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SD_LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SD_LANG_EVENT, onChange);
  };
}

function getSnapshot(): SdLang {
  try {
    return localStorage.getItem(SD_LANG_STORAGE_KEY) === "en" ? "en" : "hu";
  } catch {
    return "hu";
  }
}

function getServerSnapshot(): SdLang {
  return "hu";
}

/** Aktív nyelv (hu alapértelmezett) + váltó + fordító. A választás localStorage-ban él, az oldalak között megmarad. */
export function useSdLang() {
  const lang = useSyncExternalStore(subscribeLang, getSnapshot, getServerSnapshot);
  const setLang = useCallback((next: SdLang) => {
    try {
      localStorage.setItem(SD_LANG_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(SD_LANG_EVENT));
  }, []);
  const tx = useCallback(
    (key: SdKey, params?: Record<string, string | number>) => sdText(lang, key, params),
    [lang]
  );
  return { lang, setLang, tx };
}

const EXACT_BOOKING_SERVER: Record<string, SdKey> = {
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

function typeName(lang: SdLang, raw: string): string {
  return raw === "Standard" ? sdText(lang, "typeStandard") : sdText(lang, "typeExecutive");
}

/** A foglalási API magyar hibaüzeneteit az aktív nyelvre fordítja (magyarul változatlanul átengedi). */
export function translateSdBookingMessage(lang: SdLang, message: string): string {
  const trimmed = String(message || "").trim();
  if (!trimmed) return sdText(lang, "errInvalid");
  if (lang === "hu") return trimmed;

  const exact = EXACT_BOOKING_SERVER[trimmed];
  if (exact) return sdText(lang, exact);

  let m = trimmed.match(/^Az átvételnek legalább (\d+) órával a jövőben kell lennie$/);
  if (m) return sdText(lang, "srvMinAdvance", { n: m[1] });
  m = trimmed.match(/^Az átvétel nem lehet több mint (\d+) nap a jövőben$/);
  if (m) return sdText(lang, "srvMaxAdvance", { n: m[1] });
  m = trimmed.match(/^Városi transzferek csak (\S+) és (\S+) között engedélyezettek$/);
  if (m) return sdText(lang, "srvCityHours", { a: m[1], b: m[2] });
  m = trimmed.match(/^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat$/);
  if (m) return sdText(lang, "srvMaxPax", { type: typeName(lang, m[1]), n: m[2] });
  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)$/
  );
  if (m) return sdText(lang, "srvMaxLuggage", { type: typeName(lang, m[1]), n: m[2], m: m[3] });

  if (/^[\x20-\x7E]+$/.test(trimmed)) return trimmed;
  return sdText(lang, "errInvalid");
}

const AUTH_MESSAGES_EN: Record<string, string> = {
  "Hiányzó token.": "Missing token.",
  "Hiányzó token vagy kód.": "Missing token or code.",
  "Az Authenticator kód 6 számjegyből áll.": "The authenticator code consists of 6 digits.",
  "Hiba a munkamenet ellenőrzésekor.": "Error while checking the session.",
  "Nincs aktív munkamenet.": "No active session.",
  "Hibás vagy már felhasznált biztonsági kód.": "Incorrect or already used backup code.",
  "Helytelen vagy lejárt 6 számjegyű kód.": "Incorrect or expired 6-digit code.",
  "Hibás hitelesítő adatok.": "Incorrect credentials.",
  "Hibás email vagy jelszó.": "Incorrect email or password.",
  "Jelszó beállítás sikertelen.": "Setting the password failed.",
  "Érvénytelen vagy nem létező belépési link.": "This sign-in link is invalid or does not exist.",
  "Érvénytelen vagy lejárt kihívás. Kezd újra a bejelentkezést.":
    "The sign-in challenge is invalid or has expired. Please start signing in again.",
  "Nincs ilyen aktivált felhasználó a megadott linkhez.": "There is no activated user for this link.",
  "Hiányzó token vagy jelszó.": "Missing token or password.",
  "Hiányzó hitelesítési kihívás token.": "Missing authentication challenge token.",
  "Ez a fiók még nincs aktiválva — használd a jelszóbeállítási linket.":
    "This account has not been activated yet — please use the password setup link.",
  "Ez a fiók igényel kétfaktoros hitelesítést, amely még nincs aktiválva. Kérjük először állítsd be a 2FA-t a meghívó e-mailben kapott linken.":
    "This account requires two-factor authentication, which is not set up yet. Please set up 2FA first using the link from your invitation email.",
  "Ehhez a fiókhoz nincs kétfaktoros hitelesítés bekapcsolva.":
    "Two-factor authentication is not enabled for this account.",
  "A kód helytelen. Próbáld újra 30 mp múlva, vagy használd az egyik mentett backup kódot.":
    "The code is incorrect. Try again in 30 seconds, or use one of your saved backup codes.",
  "A kétfaktoros hitelesítés még nem lett inicializálva a fiókodhoz.":
    "Two-factor authentication has not been initialised for your account yet.",
  "A fiók még nincs aktiválva.": "The account has not been activated yet.",
  "A felhasználó nem található.": "User not found.",
  "A belépési link érvénytelen vagy lejárt.": "The sign-in link is invalid or has expired.",
  "Érvénytelen vagy lejárt link.": "Invalid or expired link.",
  "Ez az egyedi belépési link lejárt. Kérj új meghívót a Pannon Transfer Ügyvezetőtől.":
    "This personal sign-in link has expired. Please request a new invitation from Pannon Transfer.",
  "Hiányzó meghívó token.": "Missing invitation token.",
  "Érvénytelen vagy lejárt meghívó link.": "The invitation link is invalid or has expired.",
  "Hiányzó hitelesítő adatok.": "Missing credentials.",
  "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül.":
    "The password must first be set for this account via the invitation link.",
  "A jelszó már be van állítva ehhez a fiókhoz.": "A password has already been set for this account.",
  "A jelszónak minimum 8 karakter hosszúnak kell lennie.": "The password must be at least 8 characters long.",
};

/** A hitelesítési API-k magyar üzeneteit fordítja az aktív nyelvre (magyarul változatlan). */
export function translateSdAuthMessage(lang: SdLang, message: string | undefined | null, fallback: string): string {
  const msg = String(message || "").trim();
  if (!msg) return fallback;
  if (lang === "hu") return msg;
  const hit = AUTH_MESSAGES_EN[msg];
  if (hit) return hit;
  if (/^[\x20-\x7E]+$/.test(msg)) return msg;
  return fallback;
}
