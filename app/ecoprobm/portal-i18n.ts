import type { EcoproBmLang } from "./lang";

type Dict = Record<string, string>;

/** Belépés, 2FA, egyedi link és jelszóbeállító oldalak szövegei (magyar / angol / koreai). */
const hu: Dict = {
  language: "Nyelv",
  needHelp: "Segítségre van szüksége?",
  supportRole: "Fejlesztő",
  rights: "Minden jog fenntartva.",
  footerTag: "Ecopro BM dedikált ügyfélportál",
  support: "Támogatás",
  processing: "Feldolgozás…",
  back: "Vissza",
  backHome: "Vissza a főoldalra",
  contact: "Kapcsolat",

  // --- Belépés
  loginEyebrow: "Dedikált partneri belépés",
  loginBrandTitle: "Üdvözöljük az|Ecopro BM portálon",
  loginBrandBody:
    "Foglaljon repülőtéri és városi transzfert, kövesse a foglalásait, és kezelje az utazásokat egyetlen biztonságos felületen.",
  bulletAccessTitle: "Személyes hozzáférés",
  bulletAccessText: "A Pannon Transfer által kiadott céges címmel lépjen be.",
  bulletSecurityTitle: "Biztonságos belépés",
  bulletSecurityText: "Kétfaktoros hitelesítés (2FA) védi a fiókját.",
  bulletAllTitle: "Minden egy helyen",
  bulletAllText: "Foglalás, nyomon követés és módosítás egy felületen.",
  loginTitle: "Belépés a portálra",
  loginIntro:
    "Adja meg a céges e-mail címét és a fiókjához tartozó jelszót. Ha a fiókjához 2FA tartozik, a következő lépésben kérjük a kódot.",
  goodToKnow: "Jó tudni",
  tip1: "A Pannon Transfer által kiadott céges címmel lépjen be.",
  tip2: "2FA esetén a 6 számjegyű Authenticator kódot vagy egy mentett biztonsági kódot adja meg.",
  tip3: "Belépési gond esetén forduljon a támogatáshoz.",
  fEmailAddr: "E-mail cím",
  fEmailAddrPh: "nev@ceg.hu",
  fPassword: "Jelszó",
  showPassword: "Jelszó megjelenítése",
  hidePassword: "Jelszó elrejtése",
  remember: "Emlékezzen rám ezen az eszközön (7 nap)",
  signIn: "Belépés",
  verifying: "Ellenőrzés…",
  noAccess: "Még nincs hozzáférése, vagy elfelejtette a jelszavát?",
  errEnterBoth: "Kérjük, adja meg az e-mail címét és a jelszavát.",
  errLoginFailed: "A bejelentkezés sikertelen.",
  errLoginUnexpected: "Váratlan hiba történt a bejelentkezés során.",
  errNetwork: "Hálózati hiba. Kérjük, próbálja újra.",
  errGeneric: "Hiba történt. Kérjük, próbálja újra.",

  // --- 2FA belépéskor
  step2Badge: "2. lépés · Kétfaktoros hitelesítés",
  confirmTitle: "Erősítse meg a belépést",
  tfaIntro:
    "A fiókjához 2FA szükséges. Adja meg az Authenticator alkalmazás által generált 6 számjegyű kódot, vagy használjon mentett biztonsági kódot.",
  signingInAs: "Belépés mint",
  authCode: "Authenticator kód (6 számjegy)",
  backupCode: "Biztonsági kód",
  backupPh: "pl. A1B2-C3D4-E5",
  useBackup: "Biztonsági kód használata (ha nem fér hozzá az Authenticator alkalmazáshoz)",
  verifySignIn: "Ellenőrzés és belépés",
  errBackup: "Kérjük, adja meg a biztonsági kódot.",
  errCode6: "Kérjük, adja meg az Authenticator alkalmazás 6 számjegyű kódját.",
  errBackupShort: "A biztonsági kód túl rövid.",
  errWrongCode: "Hibás kód.",
  authSuccess: "Sikeres azonosítás",
  securing: "Biztonságos kapcsolat létrehozása…",
  portalNameShort: "Ecopro BM Portál",

  // --- Egyedi belépési link oldal
  authVerifying: "Belépési link ellenőrzése…",
  redirecting: "Átirányítás…",
  accessDenied: "Hozzáférés megtagadva",
  invalidLinkBody:
    "Ez a személyes link nem létezik, lejárt, vagy már felhasználták. Kérjük, használja a legutóbbi e-mailben kapott linket, vagy kérjen új meghívót.",
  requestNewInvite: "Új meghívó kérése",
  requestNewLink: "Új belépési link kérése",
  authBrandEyebrow: "Személyes belépés",
  authBrandTitle: "Biztonságos belépés|egyedi linkkel",
  authBrandBody:
    "A hozzáférése a Pannon Transfertől kapott személyes linkhez kötött. A link csak Önnek szól, kérjük, ne ossza meg senkivel.",
  twofactorTitle: "Kétfaktoros hitelesítés",
  twofactorBody:
    "A fiókjához 2FA szükséges. Adja meg az Authenticator alkalmazás 6 számjegyű kódját, vagy használjon biztonsági kódot.",
  authFooter: "Ecopro BM dedikált ügyfélportál · Kizárólag személyes linkkel érhető el",
  mailSubjectNewLink: "Ecopro BM portál – új belépési link",

  // --- Jelszóbeállítás
  setupEyebrow: "Biztonságos aktiválás",
  setupBrandTitle: "Aktiválja személyes|Ecopro BM fiókját",
  setupBrandBody:
    "Néhány lépésben aktiválja a fiókját. Utána megtekintheti a megállapodott díjszabást, foglalhat transzfert, és egy helyen követheti az összes foglalását.",
  tileAccess: "Hozzáférés",
  tileAccessV: "Személyes, meghíváshoz kötött aktiválás",
  tileSecurity: "Biztonság",
  tileSecurity2fa: "Kétfaktoros hitelesítés kötelező",
  tileSecurityPwd: "Erős jelszavas védelem",
  tileSignin: "Belépés",
  tileSigninV: "A személyes linken keresztül, e-mailben",
  tilePortal: "Portál",
  tilePortalV: "Ecopro BM díjak és foglalások",
  verifyingInvite: "A meghívó ellenőrzése…",
  invalidLinkTitle: "Érvénytelen vagy lejárt link",
  invalidLinkText:
    "Ez a hozzáférési link nem létezik, lejárt, vagy már felhasználták. Kérjük, kérjen új meghívót.",
  closeSafely: "Ezt az oldalt nyugodtan bezárhatja.",
  step1of2: "1/2. lépés · Jelszó",
  step1: "1. lépés · Jelszó",
  setPasswordTitle: "Állítsa be jelszavát",
  alreadyActiveText:
    "Ez a fiók már aktív. Új személyes belépési link kéréséhez kérjük, használja az alábbi elérhetőségeket.",
  setPasswordText: "Válasszon erős jelszót, amelyet csak Ön ismer.",
  setPasswordText2fa: "A következő lépésben a fiókját kétfaktoros hitelesítéssel is védjük.",
  setPasswordTextDone: "Ezzel befejezi az Ecopro BM portál aktiválását.",
  invitedAccount: "Meghívott fiók",
  loadingShort: "Betöltés…",
  twofaRequiredBadge: "2FA kötelező",
  newPassword: "Új jelszó",
  newPasswordPh: "Adjon meg egy erős jelszót",
  confirmPassword: "Jelszó megerősítése",
  confirmPasswordPh: "Írja be újra a jelszót",
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
  setPasswordContinue2fa: "Jelszó beállítása és tovább a 2FA-hoz",
  setPassword: "Jelszó beállítása",
  termsNote: "A jelszó beállításával elfogadja a céges hozzáférési feltételeket.",
  requestNewLinkTitle: "Új link kérése",
  requestNewLinkText: "Kérje a személyes belépési link újraküldését:",
  errPwdLen: "A jelszónak legalább 8 karakter hosszúnak kell lennie.",
  errPwdMatch: "A két jelszó nem egyezik.",
  errPwdWeak: "A jelszó túl gyenge. Használjon kis- és nagybetűt, valamint számjegyet.",
  errSetPwdFailed: "A jelszó beállítása során hiba történt.",
  alreadyActivatedMsg:
    "Ez a fiók már aktiválva van. A folytatáshoz használja a kapott személyes belépési linket, vagy kérjen új meghívót a Pannon Transfertől.",
  mailSubjectNewSignIn: "Ecopro BM portál – új személyes belépési link",
  mailBodyNewSignIn: "Kérem, küldjenek új személyes belépési linket az Ecopro BM portálhoz erre a címre:",

  step2of2: "2/2. lépés · Kétfaktoros hitelesítés",
  tfaSetupTitle: "Kétfaktoros hitelesítés beállítása",
  tfaSetupIntro:
    "A fiókját 2FA védi. Kövesse az alábbi lépéseket egy Authenticator alkalmazás (pl. Google Authenticator, Microsoft Authenticator, 1Password vagy Authy) összekapcsolásához.",
  tfaStep1: "1 · Olvassa be a QR-kódot",
  tfaStep1Text:
    "Nyissa meg az Authenticator alkalmazást, koppintson a „+” gombra, és olvassa be a QR-kódot, vagy írja be kézzel az alábbi kulcsot.",
  qrAlt: "2FA QR-kód",
  manualKey: "Kézi kulcs (ha a QR-kód nem olvasható be)",
  copyKey: "Kulcs másolása",
  tfaStep2: "2 · Mentse el a biztonsági kódokat",
  downloadTxt: "Letöltés (.txt)",
  downloaded: "Letöltve",
  backupImportant:
    "Fontos: tartsa biztonságos helyen ezeket a kódokat. Ha elveszíti a telefonját vagy az Authenticator alkalmazást, ezekkel tud belépni. Minden kód csak egyszer használható.",
  tfaStep3: "3 · Adja meg az első kódot",
  authCode6: "6 számjegyű Authenticator kód",
  backupCodeEg: "Biztonsági kód (pl. A1B2-C3D4-E5)",
  useBackupNow: "Biztonsági kódot használok (jelenleg nem érem el az Authenticator alkalmazást)",
  activate2fa: "2FA aktiválása és befejezés",
  errTfa6: "Az Authenticator kód 6 számjegyből áll.",
  errTfaBackupFmt: "A biztonsági kód formátuma: A1B2-C3D4-E5",
  allSetTitle: "Minden kész",
  allSetText: "Köszönjük – az Ecopro BM portál fiókja elkészült.",
  allSetEmail: "Hamarosan e-mailt küldünk a(z) {email} címre a személyes belépési linkkel.",
  allSetEmailFallback: "a megadott címre",
  checkInbox: "Nézze meg a postaládáját (és a spam mappát is)",
  checkInboxText:
    "Kizárólag az e-mailben kapott személyes linken keresztül lép be – nincs nyilvános belépési űrlap.",
  checkInbox2fa: "A belépéskor az Authenticator alkalmazás 6 számjegyű kódját is kérni fogjuk.",
  canClose: "Most már bezárhatja ezt az oldalt.",
  emailNotArriving: "Nem érkezik meg az e-mail? Írjon nekünk:",
  mailSubjectNoWelcome: "Ecopro BM portál – nem érkezett meg az üdvözlő e-mail",
  mailBodyNoWelcome: "Kérem, küldjenek új személyes belépési linket az Ecopro BM portálhoz erre a címre:",
  backupFileTitle: "Ecopro BM portál – Kétfaktoros hitelesítés – Biztonsági kódok",
  backupFileAccount: "Fiók",
  backupFileDate: "Dátum",
  backupFileUse:
    "Ha nem fér hozzá az Authenticator alkalmazáshoz, egyszerre egy kódot használjon.",
  backupFileOnce: "Minden kód csak egyszer használható.",
  backupFileKeep: "Kérjük, tartsa ezeket a kódokat biztonságos helyen.",
  backupFileFooter: "© Pannon Transfer – Ecopro BM dedikált ügyfélportál",
};

const ko: Dict = {
  language: "언어",
  needHelp: "도움이 필요하신가요?",
  supportRole: "개발자",
  rights: "모든 권리 보유.",
  footerTag: "Ecopro BM 전용 고객 포털",
  support: "고객 지원",
  processing: "처리 중…",
  back: "뒤로",
  backHome: "홈으로 돌아가기",
  contact: "문의",

  loginEyebrow: "전용 파트너 로그인",
  loginBrandTitle: "Ecopro BM|전용 포털에 오신 것을 환영합니다",
  loginBrandBody:
    "공항 및 시내 이동을 예약하고, 예약 현황을 확인하며, 모든 이동을 하나의 안전한 화면에서 관리하세요.",
  bulletAccessTitle: "개인 계정 접근",
  bulletAccessText: "Pannon Transfer에서 발급한 회사 이메일로 로그인하세요.",
  bulletSecurityTitle: "안전한 로그인",
  bulletSecurityText: "2단계 인증(2FA)으로 계정을 보호합니다.",
  bulletAllTitle: "모든 기능을 한곳에서",
  bulletAllText: "예약, 현황 확인, 변경을 하나의 화면에서 처리합니다.",
  loginTitle: "포털 로그인",
  loginIntro:
    "회사 이메일 주소와 계정 비밀번호를 입력해 주세요. 계정에 2단계 인증(2FA)이 설정되어 있으면 다음 단계에서 인증 코드를 요청합니다.",
  goodToKnow: "안내",
  tip1: "Pannon Transfer에서 발급한 회사 이메일로 로그인하세요.",
  tip2: "2FA 사용 시 인증 앱의 6자리 코드 또는 저장해 둔 백업 코드를 입력합니다.",
  tip3: "로그인에 문제가 있으면 고객 지원에 문의해 주세요.",
  fEmailAddr: "이메일 주소",
  fEmailAddrPh: "name@company.com",
  fPassword: "비밀번호",
  showPassword: "비밀번호 표시",
  hidePassword: "비밀번호 숨기기",
  remember: "이 기기에서 로그인 상태 유지 (7일)",
  signIn: "로그인",
  verifying: "확인 중…",
  noAccess: "아직 접근 권한이 없거나 비밀번호를 잊으셨나요?",
  errEnterBoth: "이메일 주소와 비밀번호를 입력해 주세요.",
  errLoginFailed: "로그인에 실패했습니다.",
  errLoginUnexpected: "로그인 중 예기치 않은 오류가 발생했습니다.",
  errNetwork: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
  errGeneric: "오류가 발생했습니다. 다시 시도해 주세요.",

  step2Badge: "2단계 · 2단계 인증",
  confirmTitle: "로그인을 확인해 주세요",
  tfaIntro:
    "이 계정에는 2단계 인증이 필요합니다. 인증 앱에서 생성된 6자리 코드를 입력하거나 백업 코드를 사용해 주세요.",
  signingInAs: "로그인 계정",
  authCode: "인증 앱 코드 (6자리)",
  backupCode: "백업 코드",
  backupPh: "예: A1B2-C3D4-E5",
  useBackup: "백업 코드 사용 (인증 앱을 사용할 수 없는 경우)",
  verifySignIn: "확인 후 로그인",
  errBackup: "백업 코드를 입력해 주세요.",
  errCode6: "인증 앱의 6자리 코드를 입력해 주세요.",
  errBackupShort: "백업 코드가 너무 짧습니다.",
  errWrongCode: "코드가 올바르지 않습니다.",
  authSuccess: "인증에 성공했습니다",
  securing: "보안 연결을 설정하는 중…",
  portalNameShort: "Ecopro BM 포털",

  authVerifying: "로그인 링크를 확인하는 중…",
  redirecting: "이동 중…",
  accessDenied: "접근이 거부되었습니다",
  invalidLinkBody:
    "이 개인 링크가 존재하지 않거나 만료되었거나 이미 사용되었습니다. 가장 최근에 받은 이메일의 링크를 사용하시거나 새 초대를 요청해 주세요.",
  requestNewInvite: "새 초대 요청",
  requestNewLink: "새 로그인 링크 요청",
  authBrandEyebrow: "개인 로그인",
  authBrandTitle: "개인 링크로|안전하게 로그인",
  authBrandBody:
    "접근 권한은 Pannon Transfer에서 받은 개인 링크에 연결되어 있습니다. 이 링크는 본인 전용이므로 다른 사람과 공유하지 마세요.",
  twofactorTitle: "2단계 인증",
  twofactorBody:
    "이 계정에는 2FA가 필요합니다. 인증 앱의 6자리 코드를 입력하거나 백업 코드를 사용해 주세요.",
  authFooter: "Ecopro BM 전용 고객 포털 · 개인 링크로만 접근 가능",
  mailSubjectNewLink: "Ecopro BM 포털 – 새 로그인 링크",

  setupEyebrow: "보안 활성화",
  setupBrandTitle: "Ecopro BM 개인 계정을|활성화하세요",
  setupBrandBody:
    "몇 단계만 거치면 계정이 활성화됩니다. 이후 합의된 요금 체계를 확인하고, 이동을 예약하고, 모든 예약을 한곳에서 확인할 수 있습니다.",
  tileAccess: "접근",
  tileAccessV: "초대를 통한 개인 계정 활성화",
  tileSecurity: "보안",
  tileSecurity2fa: "2단계 인증 필수",
  tileSecurityPwd: "강력한 비밀번호 보호",
  tileSignin: "로그인",
  tileSigninV: "이메일로 받은 개인 링크를 통해",
  tilePortal: "포털",
  tilePortalV: "Ecopro BM 요금 및 예약",
  verifyingInvite: "초대를 확인하는 중…",
  invalidLinkTitle: "유효하지 않거나 만료된 링크",
  invalidLinkText:
    "이 접근 링크가 존재하지 않거나 만료되었거나 이미 사용되었습니다. 새 초대를 요청해 주세요.",
  closeSafely: "이 페이지는 닫으셔도 됩니다.",
  step1of2: "1/2단계 · 비밀번호",
  step1: "1단계 · 비밀번호",
  setPasswordTitle: "비밀번호를 설정하세요",
  alreadyActiveText:
    "이 계정은 이미 활성화되어 있습니다. 새 개인 로그인 링크가 필요하시면 아래 연락처로 문의해 주세요.",
  setPasswordText: "본인만 아는 강력한 비밀번호를 선택해 주세요.",
  setPasswordText2fa: "다음 단계에서 계정을 2단계 인증으로 추가 보호합니다.",
  setPasswordTextDone: "이것으로 Ecopro BM 포털 활성화가 완료됩니다.",
  invitedAccount: "초대된 계정",
  loadingShort: "불러오는 중…",
  twofaRequiredBadge: "2FA 필수",
  newPassword: "새 비밀번호",
  newPasswordPh: "강력한 비밀번호를 입력하세요",
  confirmPassword: "비밀번호 확인",
  confirmPasswordPh: "비밀번호를 다시 입력하세요",
  strength0: "매우 약함",
  strength1: "약함",
  strength2: "보통",
  strength3: "강함",
  strength4: "매우 강함",
  strength5: "최상",
  rule8: "8자 이상",
  ruleLower: "소문자 1개",
  ruleUpper: "대문자 1개",
  ruleDigit: "숫자 1개",
  setPasswordContinue2fa: "비밀번호 설정 후 2FA 설정으로 이동",
  setPassword: "비밀번호 설정",
  termsNote: "비밀번호를 설정하면 회사 접근 약관에 동의하는 것으로 간주됩니다.",
  requestNewLinkTitle: "새 링크 요청",
  requestNewLinkText: "개인 로그인 링크 재발송을 요청해 주세요:",
  errPwdLen: "비밀번호는 8자 이상이어야 합니다.",
  errPwdMatch: "두 비밀번호가 일치하지 않습니다.",
  errPwdWeak: "비밀번호가 너무 약합니다. 대문자, 소문자, 숫자를 포함해 주세요.",
  errSetPwdFailed: "비밀번호를 설정하는 중 오류가 발생했습니다.",
  alreadyActivatedMsg:
    "이 계정은 이미 활성화되었습니다. 받으신 개인 로그인 링크를 사용하시거나 Pannon Transfer에 새 초대를 요청해 주세요.",
  mailSubjectNewSignIn: "Ecopro BM 포털 – 새 개인 로그인 링크",
  mailBodyNewSignIn: "아래 주소로 Ecopro BM 포털의 새 개인 로그인 링크를 보내 주세요:",

  step2of2: "2/2단계 · 2단계 인증",
  tfaSetupTitle: "2단계 인증 설정",
  tfaSetupIntro:
    "이 계정은 2FA로 보호됩니다. 아래 순서에 따라 인증 앱(Google Authenticator, Microsoft Authenticator, 1Password, Authy 등)을 연결해 주세요.",
  tfaStep1: "1 · QR 코드를 스캔하세요",
  tfaStep1Text:
    "인증 앱을 열고 ‘+’를 눌러 QR 코드를 스캔하거나 아래의 수동 키를 직접 입력해 주세요.",
  qrAlt: "2FA QR 코드",
  manualKey: "수동 키 (QR 코드를 스캔할 수 없는 경우)",
  copyKey: "키 복사",
  tfaStep2: "2 · 백업 코드를 저장하세요",
  downloadTxt: "다운로드 (.txt)",
  downloaded: "다운로드됨",
  backupImportant:
    "중요: 이 코드를 안전한 곳에 보관하세요. 휴대폰이나 인증 앱을 분실한 경우 이 코드로 로그인할 수 있습니다. 각 코드는 한 번만 사용할 수 있습니다.",
  tfaStep3: "3 · 첫 번째 코드를 입력하세요",
  authCode6: "인증 앱 6자리 코드",
  backupCodeEg: "백업 코드 (예: A1B2-C3D4-E5)",
  useBackupNow: "백업 코드를 사용합니다 (지금 인증 앱을 사용할 수 없음)",
  activate2fa: "2FA 활성화 및 완료",
  errTfa6: "인증 앱 코드는 6자리 숫자입니다.",
  errTfaBackupFmt: "백업 코드 형식: A1B2-C3D4-E5",
  allSetTitle: "모든 설정이 완료되었습니다",
  allSetText: "감사합니다. Ecopro BM 포털 계정이 준비되었습니다.",
  allSetEmail: "곧 {email} 주소로 개인 로그인 링크가 담긴 이메일을 보내 드립니다.",
  allSetEmailFallback: "입력하신 주소",
  checkInbox: "받은편지함(및 스팸함)을 확인해 주세요",
  checkInboxText:
    "이메일로 받은 개인 링크로만 로그인할 수 있습니다. 공개 로그인 양식은 없습니다.",
  checkInbox2fa: "로그인 시 인증 앱의 6자리 코드도 요청됩니다.",
  canClose: "이제 이 페이지를 닫으셔도 됩니다.",
  emailNotArriving: "이메일이 도착하지 않나요? 문의해 주세요:",
  mailSubjectNoWelcome: "Ecopro BM 포털 – 환영 이메일을 받지 못했습니다",
  mailBodyNoWelcome: "아래 주소로 Ecopro BM 포털의 새 개인 로그인 링크를 보내 주세요:",
  backupFileTitle: "Ecopro BM 포털 – 2단계 인증 – 백업 코드",
  backupFileAccount: "계정",
  backupFileDate: "날짜",
  backupFileUse: "인증 앱을 사용할 수 없을 때 코드를 한 번에 하나씩 사용하세요.",
  backupFileOnce: "각 코드는 한 번만 사용할 수 있습니다.",
  backupFileKeep: "이 코드를 안전한 곳에 보관해 주세요.",
  backupFileFooter: "© Pannon Transfer – Ecopro BM 전용 고객 포털",
};

const en: Dict = {
  language: "Language",
  needHelp: "Need help?",
  supportRole: "Developer",
  rights: "All rights reserved.",
  footerTag: "Ecopro BM dedicated customer portal",
  support: "Support",
  processing: "Processing…",
  back: "Back",
  backHome: "Back to the home page",
  contact: "Contact",

  // --- Sign in
  loginEyebrow: "Dedicated partner sign-in",
  loginBrandTitle: "Welcome to the|Ecopro BM portal",
  loginBrandBody:
    "Book airport and city transfers, follow your bookings and manage your trips in a single secure workspace.",
  bulletAccessTitle: "Personal access",
  bulletAccessText: "Sign in with the company address registered by Pannon Transfer.",
  bulletSecurityTitle: "Secure sign-in",
  bulletSecurityText: "Two-factor authentication (2FA) protects your account.",
  bulletAllTitle: "Everything in one place",
  bulletAllText: "Booking, tracking and changes in a single interface.",
  loginTitle: "Sign in to the portal",
  loginIntro:
    "Enter your company email address and your account password. If your account uses 2FA, we will ask for the code in the next step.",
  goodToKnow: "Good to know",
  tip1: "Sign in with the company address registered by Pannon Transfer.",
  tip2: "With 2FA, enter the 6-digit Authenticator code or one of your saved backup codes.",
  tip3: "If you have trouble signing in, please contact support.",
  fEmailAddr: "Email address",
  fEmailAddrPh: "name@company.com",
  fPassword: "Password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  remember: "Remember me on this device (7 days)",
  signIn: "Sign in",
  verifying: "Verifying…",
  noAccess: "Don't have access yet, or forgot your password?",
  errEnterBoth: "Please enter your email address and password.",
  errLoginFailed: "Sign-in failed.",
  errLoginUnexpected: "An unexpected error occurred during sign-in.",
  errNetwork: "Network error. Please try again.",
  errGeneric: "An error occurred. Please try again.",

  // --- 2FA at sign-in
  step2Badge: "Step 2 · Two-factor authentication",
  confirmTitle: "Confirm your sign-in",
  tfaIntro:
    "Your account requires 2FA. Enter the 6-digit code generated by your Authenticator app, or use a saved backup code.",
  signingInAs: "Signing in as",
  authCode: "Authenticator code (6 digits)",
  backupCode: "Backup code",
  backupPh: "e.g. A1B2-C3D4-E5",
  useBackup: "Use a backup code (if you cannot access your Authenticator app)",
  verifySignIn: "Verify and sign in",
  errBackup: "Please enter your backup code.",
  errCode6: "Please enter the 6-digit code from your Authenticator app.",
  errBackupShort: "The backup code is too short.",
  errWrongCode: "Incorrect code.",
  authSuccess: "Authentication successful",
  securing: "Establishing a secure connection…",
  portalNameShort: "Ecopro BM Portal",

  // --- Personal sign-in link page
  authVerifying: "Verifying your sign-in link…",
  redirecting: "Redirecting…",
  accessDenied: "Access denied",
  invalidLinkBody:
    "This personal link does not exist, has expired or has already been used. Please use the link from your most recent email, or request a new invitation.",
  requestNewInvite: "Request a new invitation",
  requestNewLink: "Request a new sign-in link",
  authBrandEyebrow: "Personal sign-in",
  authBrandTitle: "Secure sign-in|with a personal link",
  authBrandBody:
    "Your access is tied to the personal link you received from Pannon Transfer. The link is meant only for you, so please do not share it with anyone.",
  twofactorTitle: "Two-factor authentication",
  twofactorBody:
    "Your account requires 2FA. Enter the 6-digit code from your Authenticator app, or use a backup code.",
  authFooter: "Ecopro BM dedicated customer portal · Accessible only with a personal link",
  mailSubjectNewLink: "Ecopro BM portal – new sign-in link",

  // --- Password setup
  setupEyebrow: "Secure activation",
  setupBrandTitle: "Activate your personal|Ecopro BM account",
  setupBrandBody:
    "Activate your account in a few steps. Afterwards you can view the agreed rates, book transfers and follow all your bookings in one place.",
  tileAccess: "Access",
  tileAccessV: "Personal, invitation-based activation",
  tileSecurity: "Security",
  tileSecurity2fa: "Two-factor authentication required",
  tileSecurityPwd: "Strong password protection",
  tileSignin: "Sign-in",
  tileSigninV: "Through your personal link, sent by email",
  tilePortal: "Portal",
  tilePortalV: "Ecopro BM rates and bookings",
  verifyingInvite: "Verifying your invitation…",
  invalidLinkTitle: "Invalid or expired link",
  invalidLinkText:
    "This access link does not exist, has expired or has already been used. Please request a new invitation.",
  closeSafely: "You can safely close this page.",
  step1of2: "Step 1 of 2 · Password",
  step1: "Step 1 · Password",
  setPasswordTitle: "Set your password",
  alreadyActiveText:
    "This account is already active. To request a new personal sign-in link, please use the contact details below.",
  setPasswordText: "Choose a strong password that only you know.",
  setPasswordText2fa: "In the next step we will also protect your account with two-factor authentication.",
  setPasswordTextDone: "This completes the activation of your Ecopro BM portal account.",
  invitedAccount: "Invited account",
  loadingShort: "Loading…",
  twofaRequiredBadge: "2FA required",
  newPassword: "New password",
  newPasswordPh: "Enter a strong password",
  confirmPassword: "Confirm password",
  confirmPasswordPh: "Re-enter the password",
  strength0: "Too weak",
  strength1: "Weak",
  strength2: "Fair",
  strength3: "Strong",
  strength4: "Very strong",
  strength5: "Excellent",
  rule8: "At least 8 characters",
  ruleLower: "One lowercase letter",
  ruleUpper: "One uppercase letter",
  ruleDigit: "One digit",
  setPasswordContinue2fa: "Set password and continue to 2FA",
  setPassword: "Set password",
  termsNote: "By setting your password you accept the corporate access terms.",
  requestNewLinkTitle: "Request a new link",
  requestNewLinkText: "Ask for your personal sign-in link to be sent again:",
  errPwdLen: "The password must be at least 8 characters long.",
  errPwdMatch: "The two passwords do not match.",
  errPwdWeak: "The password is too weak. Use lowercase and uppercase letters and a digit.",
  errSetPwdFailed: "An error occurred while setting the password.",
  alreadyActivatedMsg:
    "This account has already been activated. To continue, use the personal sign-in link you received, or request a new invitation from Pannon Transfer.",
  mailSubjectNewSignIn: "Ecopro BM portal – new personal sign-in link",
  mailBodyNewSignIn: "Please send a new personal sign-in link for the Ecopro BM portal to this address:",

  step2of2: "Step 2 of 2 · Two-factor authentication",
  tfaSetupTitle: "Set up two-factor authentication",
  tfaSetupIntro:
    "Your account is protected by 2FA. Follow the steps below to connect an Authenticator app (e.g. Google Authenticator, Microsoft Authenticator, 1Password or Authy).",
  tfaStep1: "1 · Scan the QR code",
  tfaStep1Text:
    "Open your Authenticator app, tap the “+” button and scan the QR code, or enter the key below manually.",
  qrAlt: "2FA QR code",
  manualKey: "Manual key (if the QR code cannot be scanned)",
  copyKey: "Copy key",
  tfaStep2: "2 · Save your backup codes",
  downloadTxt: "Download (.txt)",
  downloaded: "Downloaded",
  backupImportant:
    "Important: keep these codes in a safe place. If you lose your phone or the Authenticator app, they let you sign in. Each code can be used only once.",
  tfaStep3: "3 · Enter your first code",
  authCode6: "6-digit Authenticator code",
  backupCodeEg: "Backup code (e.g. A1B2-C3D4-E5)",
  useBackupNow: "I'm using a backup code (I cannot access the Authenticator app right now)",
  activate2fa: "Activate 2FA and finish",
  errTfa6: "The Authenticator code has 6 digits.",
  errTfaBackupFmt: "The backup code format is A1B2-C3D4-E5",
  allSetTitle: "All set",
  allSetText: "Thank you – your Ecopro BM portal account is ready.",
  allSetEmail: "We will shortly send an email with your personal sign-in link to {email}.",
  allSetEmailFallback: "the address provided",
  checkInbox: "Check your inbox (and your spam folder)",
  checkInboxText:
    "You sign in exclusively through the personal link in the email – there is no public sign-in form.",
  checkInbox2fa: "When you sign in, we will also ask for the 6-digit code from your Authenticator app.",
  canClose: "You can now close this page.",
  emailNotArriving: "Email not arriving? Write to us:",
  mailSubjectNoWelcome: "Ecopro BM portal – welcome email not received",
  mailBodyNoWelcome: "Please send a new personal sign-in link for the Ecopro BM portal to this address:",
  backupFileTitle: "Ecopro BM portal – Two-factor authentication – Backup codes",
  backupFileAccount: "Account",
  backupFileDate: "Date",
  backupFileUse:
    "If you cannot access your Authenticator app, use one code at a time.",
  backupFileOnce: "Each code can be used only once.",
  backupFileKeep: "Please keep these codes in a safe place.",
  backupFileFooter: "© Pannon Transfer – Ecopro BM dedicated customer portal",
};

const DICTS: Record<EcoproBmLang, Dict> = { hu, en, ko };

export function portalText(
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

/** A kiszolgáló magyar hibaüzenetei -> koreai megfelelő. */
const SERVER_KO: Record<string, string> = {
  "Hiányzó meghívó token.": "초대 토큰이 없습니다.",
  "Érvénytelen vagy lejárt meghívó link.": "초대 링크가 유효하지 않거나 만료되었습니다.",
  "Hiányzó hitelesítő adatok.": "로그인 정보가 누락되었습니다.",
  "Hibás e-mail cím vagy jelszó.": "이메일 주소 또는 비밀번호가 올바르지 않습니다.",
  "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül.":
    "이 계정은 먼저 초대 링크를 통해 비밀번호를 설정해야 합니다.",
  "A jelszó már be van állítva ehhez a fiókhoz.": "이 계정의 비밀번호는 이미 설정되어 있습니다.",
  "A jelszónak minimum 8 karakter hosszúnak kell lennie.": "비밀번호는 8자 이상이어야 합니다.",
  "Jelszó módosítás sikertelen.": "비밀번호를 변경하지 못했습니다.",
  "Hibás hitelesítő adatok.": "로그인 정보가 올바르지 않습니다.",
  "Ehhez a fiókhoz kétfaktoros hitelesítés (2FA) szükséges, de az még nincs aktiválva. Kérjük, először állítsa be a 2FA-t a meghívó e-mailben kapott linken.":
    "이 계정에는 2단계 인증(2FA)이 필요하지만 아직 활성화되지 않았습니다. 초대 이메일의 링크에서 먼저 2FA를 설정해 주세요.",
  "Hiányzó hitelesítési kihívás token.": "인증 요청 토큰이 없습니다.",
  "Érvénytelen vagy lejárt kihívás. Kérjük, kezdje újra a bejelentkezést.":
    "인증 요청이 유효하지 않거나 만료되었습니다. 로그인을 처음부터 다시 진행해 주세요.",
  "Kérjük, adjon meg egy érvényes mentett biztonsági kódot.": "유효한 백업 코드를 입력해 주세요.",
  "Kérjük, adja meg az Authenticator alkalmazás által generált 6 számjegyű kódot.":
    "인증 앱에서 생성된 6자리 코드를 입력해 주세요.",
  "A felhasználó nem található.": "사용자를 찾을 수 없습니다.",
  "Ehhez a fiókhoz nincs kétfaktoros hitelesítés bekapcsolva.": "이 계정에는 2단계 인증이 켜져 있지 않습니다.",
  "Hibás vagy már felhasznált biztonsági kód.": "백업 코드가 올바르지 않거나 이미 사용되었습니다.",
  "Helytelen vagy lejárt 6 számjegyű kód.": "6자리 코드가 올바르지 않거나 만료되었습니다.",
  "Hiányzó token.": "토큰이 없습니다.",
  "Ez az egyedi belépési link lejárt. Kérjen új meghívót a Pannon Transfertől.":
    "이 개인 로그인 링크는 만료되었습니다. Pannon Transfer에 새 초대를 요청해 주세요.",
  "Érvénytelen vagy nem létező belépési link.": "로그인 링크가 유효하지 않거나 존재하지 않습니다.",
  "Ez a fiók még nincs aktiválva – kérjük, használja a jelszóbeállító linket.":
    "이 계정은 아직 활성화되지 않았습니다. 비밀번호 설정 링크를 사용해 주세요.",
  "A fiókhoz kétfaktoros hitelesítés szükséges, de még nincs aktiválva. Kérjen új meghívót, és állítsa be újra a 2FA-t.":
    "이 계정에는 2단계 인증이 필요하지만 아직 활성화되지 않았습니다. 새 초대를 요청하여 2FA를 다시 설정해 주세요.",
  "Hiányzó token vagy kód.": "토큰 또는 코드가 없습니다.",
  "A belépési link érvénytelen vagy lejárt.": "로그인 링크가 유효하지 않거나 만료되었습니다.",
  "A fiók még nincs aktiválva.": "계정이 아직 활성화되지 않았습니다.",
  "Az Authenticator kód 6 számjegyből áll.": "인증 앱 코드는 6자리 숫자입니다.",
  "A kétfaktoros kód helytelen. Próbálja újra 30 másodperc múlva, vagy használja az egyik mentett biztonsági kódot.":
    "2단계 인증 코드가 올바르지 않습니다. 30초 후 다시 시도하거나 저장해 둔 백업 코드를 사용해 주세요.",
  "Nincs aktív munkamenet.": "활성 세션이 없습니다.",
  "Hiba a munkamenet ellenőrzésekor.": "세션을 확인하는 중 오류가 발생했습니다.",
  "Hiányzó token vagy jelszó.": "토큰 또는 비밀번호가 없습니다.",
  "Jelszó beállítás sikertelen.": "비밀번호 설정에 실패했습니다.",
  "Érvénytelen vagy lejárt link.": "링크가 유효하지 않거나 만료되었습니다.",
  "Nincs ilyen aktivált felhasználó a megadott linkhez.": "해당 링크에 연결된 활성화된 사용자가 없습니다.",
  "A kétfaktoros hitelesítés még nem lett inicializálva ehhez a fiókhoz.":
    "이 계정의 2단계 인증이 아직 초기화되지 않았습니다.",
  "A kód helytelen. Próbálja újra 30 másodperc múlva, vagy használja az egyik mentett biztonsági kódot.":
    "코드가 올바르지 않습니다. 30초 후 다시 시도하거나 저장해 둔 백업 코드를 사용해 주세요.",
};

/** A kiszolgáló magyar hibaüzenetei -> angol megfelelő. */
const SERVER_EN: Record<string, string> = {
  "Hiányzó meghívó token.": "The invitation token is missing.",
  "Érvénytelen vagy lejárt meghívó link.": "The invitation link is invalid or has expired.",
  "Hiányzó hitelesítő adatok.": "Sign-in details are missing.",
  "Hibás e-mail cím vagy jelszó.": "Incorrect email address or password.",
  "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül.":
    "You must first set the password for this account through the invitation link.",
  "A jelszó már be van állítva ehhez a fiókhoz.": "The password has already been set for this account.",
  "A jelszónak minimum 8 karakter hosszúnak kell lennie.": "The password must be at least 8 characters long.",
  "Jelszó módosítás sikertelen.": "The password could not be changed.",
  "Hibás hitelesítő adatok.": "Incorrect sign-in details.",
  "Ehhez a fiókhoz kétfaktoros hitelesítés (2FA) szükséges, de az még nincs aktiválva. Kérjük, először állítsa be a 2FA-t a meghívó e-mailben kapott linken.":
    "This account requires two-factor authentication (2FA), but it has not been activated yet. Please set up 2FA first using the link in your invitation email.",
  "Hiányzó hitelesítési kihívás token.": "The authentication challenge token is missing.",
  "Érvénytelen vagy lejárt kihívás. Kérjük, kezdje újra a bejelentkezést.":
    "The challenge is invalid or has expired. Please start the sign-in again.",
  "Kérjük, adjon meg egy érvényes mentett biztonsági kódot.": "Please enter a valid saved backup code.",
  "Kérjük, adja meg az Authenticator alkalmazás által generált 6 számjegyű kódot.":
    "Please enter the 6-digit code generated by your Authenticator app.",
  "A felhasználó nem található.": "The user could not be found.",
  "Ehhez a fiókhoz nincs kétfaktoros hitelesítés bekapcsolva.": "Two-factor authentication is not enabled for this account.",
  "Hibás vagy már felhasznált biztonsági kód.": "The backup code is incorrect or has already been used.",
  "Helytelen vagy lejárt 6 számjegyű kód.": "The 6-digit code is incorrect or has expired.",
  "Hiányzó token.": "The token is missing.",
  "Ez az egyedi belépési link lejárt. Kérjen új meghívót a Pannon Transfertől.":
    "This personal sign-in link has expired. Please request a new invitation from Pannon Transfer.",
  "Érvénytelen vagy nem létező belépési link.": "The sign-in link is invalid or does not exist.",
  "Ez a fiók még nincs aktiválva – kérjük, használja a jelszóbeállító linket.":
    "This account has not been activated yet – please use the password setup link.",
  "A fiókhoz kétfaktoros hitelesítés szükséges, de még nincs aktiválva. Kérjen új meghívót, és állítsa be újra a 2FA-t.":
    "This account requires two-factor authentication, but it has not been activated yet. Please request a new invitation and set up 2FA again.",
  "Hiányzó token vagy kód.": "The token or code is missing.",
  "A belépési link érvénytelen vagy lejárt.": "The sign-in link is invalid or has expired.",
  "A fiók még nincs aktiválva.": "The account has not been activated yet.",
  "Az Authenticator kód 6 számjegyből áll.": "The Authenticator code has 6 digits.",
  "A kétfaktoros kód helytelen. Próbálja újra 30 másodperc múlva, vagy használja az egyik mentett biztonsági kódot.":
    "The two-factor code is incorrect. Try again in 30 seconds, or use one of your saved backup codes.",
  "Nincs aktív munkamenet.": "There is no active session.",
  "Hiba a munkamenet ellenőrzésekor.": "An error occurred while checking the session.",
  "Hiányzó token vagy jelszó.": "The token or password is missing.",
  "Jelszó beállítás sikertelen.": "Setting the password failed.",
  "Érvénytelen vagy lejárt link.": "The link is invalid or has expired.",
  "Nincs ilyen aktivált felhasználó a megadott linkhez.": "There is no activated user for this link.",
  "A kétfaktoros hitelesítés még nem lett inicializálva ehhez a fiókhoz.":
    "Two-factor authentication has not been initialised for this account yet.",
  "A kód helytelen. Próbálja újra 30 másodperc múlva, vagy használja az egyik mentett biztonsági kódot.":
    "The code is incorrect. Try again in 30 seconds, or use one of your saved backup codes.",
};

const HU_CHARS = /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/;

/** A kiszolgáló üzenetét a portál nyelvén adja vissza (ismeretlen üzenet esetén általános hibaüzenet). */
export function translateAuthServerMessage(
  lang: EcoproBmLang,
  message: string | undefined | null,
  fallbackKey = "errGeneric",
): string {
  const msg = String(message || "").trim();
  if (!msg) return portalText(lang, fallbackKey);
  if (lang === "ko") {
    return SERVER_KO[msg] ?? portalText(lang, fallbackKey);
  }
  if (lang === "en") {
    return SERVER_EN[msg] ?? portalText(lang, fallbackKey);
  }
  if (HU_CHARS.test(msg) || SERVER_KO[msg]) return msg;
  return portalText(lang, fallbackKey);
}
