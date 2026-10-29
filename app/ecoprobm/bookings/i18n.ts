import type { EcoproBmLang } from "../lang";

const hu = {
  navBooking: "Foglalás",
  navMyBookings: "Foglalásaim",
  portalLabel: "Dedikált Ecopro BM portál",
  signOut: "Kijelentkezés",
  verifyingAccess: "Hozzáférés és munkamenet ellenőrzése…",
  preparingWorkspace: "A munkafelület előkészítése…",
  premiumTagline: "Prémium céges transzfer",
  footerPortal: "Ecopro BM dedikált ügyfélportál",
  footerSupport: "Dedikált ügyfélszolgálat",
  rightsReserved: "Minden jog fenntartva.",
  timesNote: "Minden időpont budapesti idő szerint értendő (CET/CEST).",

  eyebrow: "Foglaláskezelő",
  pageTitle: "Foglalásaim",
  pageSubtitle: "A fiókjával leadott minden transzfer élő állapota és teljes adatai egy helyen.",
  refresh: "Frissítés",
  newBooking: "Új foglalás",
  searchPlaceholder: "Keresés azonosító, utas, cím vagy járat alapján…",
  lastUpdated: "15 másodpercenként automatikusan frissül",

  statTotal: "Összes foglalás",
  statPending: "Visszaigazolásra vár",
  statConfirmed: "Visszaigazolva",
  statClosed: "Teljesítve / lemondva",
  badgePending: "Függőben",
  badgeActive: "Aktív",
  badgeClosed: "Lezárt",

  filterAll: "Összes",
  filterPending: "Függőben",
  filterConfirmed: "Visszaigazolt",
  filterClosed: "Lezárt",

  statusPending: "Beérkezett",
  statusModified: "Módosítva",
  statusConfirmed: "Visszaigazolva",
  statusInProgress: "Folyamatban",
  statusCompleted: "Teljesítve",
  statusCancelled: "Lemondva",

  loadingBookings: "Foglalások betöltése…",
  emptyTitle: "Nincs foglalás",
  emptyBody: "A jelenlegi szűrőnek nem felel meg foglalás. Adjon le új transzfert a foglalási oldalon.",
  emptySearch: "Nincs a keresésnek megfelelő foglalás.",
  goBook: "Ugrás a foglalási oldalra",
  clearSearch: "Keresés törlése",

  from: "Honnan",
  to: "Hova",
  pickup: "Felvétel",
  flight: "Járatszám",
  noFlight: "Nincs megadva",
  vehicleClass: "Szolgáltatási szint",
  passengers: "Utasok",
  luggage: "Csomag",
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

  secTrip: "Útvonal",
  secPassenger: "Utas",
  secSecond: "Második utas",
  secCompany: "Cég és fizetés",
  secDriver: "Sofőr és jármű",
  secComment: "Megjegyzés",
  secTimeline: "A foglalás története",
  secTracking: "Utaskövetés",
  name: "Név",
  email: "E-mail",
  phone: "Telefon",
  company: "Cég",
  price: "Ár",
  priceNotSet: "Egyeztetés alatt",
  portal: "Portál",
  bookingCode: "Foglalási azonosító",
  noComment: "Nincs megjegyzés",
  createdAt: "Létrehozva",
  updatedAt: "Utoljára frissítve",
  statusChangedAt: "Az állapot utolsó változása",
  statusChange: "{from} → {to}",
  trackingHint: "Ossza meg ezt a linket az utassal, hogy követhesse az utat.",
  openTracking: "Követő oldal megnyitása",
  copyTracking: "Link másolása",
  copied: "A link a vágólapra másolva.",
  trackingInactive: "A követő link már nem aktív.",

  notifTitle: "Állapotfrissítések",
  dismissAll: "Mind elrejtése",
  view: "Megtekintés",
  dismiss: "Elrejtés",
  notifConfirmed: "A foglalást visszaigazoltuk.",
  notifModified: "A diszpécser módosította a foglalást.",
  notifCancelled: "A foglalás lemondásra került.",
  notifInProgress: "A foglalás folyamatban van.",
  notifCompleted: "A foglalás teljesült.",
  notifDefault: "A foglalás állapota megváltozott.",
  dispatcherModified: "A diszpécser módosította a foglalást.",

  editTitle: "Foglalás módosítása",
  date: "Dátum",
  time: "Időpont",
  fromAddress: "Felvételi cím",
  toAddress: "Érkezési cím",
  paxCount: "Utasok száma",
  bagCount: "Csomagok száma",
  commentLabel: "Megjegyzés",
  commentPlaceholder: "Különleges kérés vagy útmutatás…",
  phoneLabel: "Az utas telefonszáma",
  flightLabel: "Járatszám",
  flightPlaceholder: "pl. LH1234",
  flightRequired: "Repülőtéri transzfernél a járatszám megadása kötelező.",
  required: "Ez a mező kötelező.",
  fixErrors: "Kérjük, javítsa az alábbi hibákat.",
  noticeTitle: "Kérjük, vegye figyelembe",
  noticeBody: "A módosításokat a foglalási feltételek (minimális időtartam, kapacitás és üzemidő) szerint ellenőrizzük.",
  back: "Vissza",
  saving: "Mentés…",
  saveChanges: "Módosítások mentése",

  cancelTitle: "Biztosan lemondja ezt a foglalást?",
  refundTitle: "Visszatérítés",
  refundBody: "A lemondás után visszatérítésre nincs lehetőség.",
  driverTitle: "Sofőr",
  driverBody: "A beosztott sofőr automatikusan felszabadul.",
  keepBooking: "Foglalás megtartása",
  processing: "Feldolgozás…",
  confirmCancel: "Foglalás lemondása",

  toastUpdated: "A foglalás sikeresen módosítva.",
  toastCancelled: "A foglalás sikeresen lemondva.",
  toastNetwork: "Hálózati hiba történt. Kérjük, próbálja újra.",
  toastUpdateFailed: "A módosítás nem sikerült.",
  toastCancelFailed: "A lemondás nem sikerült.",
  toastGeneric: "A kérést nem sikerült teljesíteni. Kérjük, ellenőrizze az adatokat, és próbálja újra.",

  srvSession: "A munkamenete lejárt. Kérjük, jelentkezzen be újra.",
  srvNotFound: "A foglalás nem található.",
  srvForbidden: "Nincs jogosultsága a foglalás módosítására.",
  srvUpdateFailed: "A foglalást nem sikerült módosítani.",
  srvMinAdvance: "A felvételnek legalább {n} órával a jövőben kell lennie.",
  srvMaxAdvance: "A felvétel legfeljebb {n} nappal lehet a jövőben.",
  srvCityHours: "Városi transzfer csak {a} és {b} között foglalható.",
  srvMaxPax: "{type} szinten legfeljebb {n} utas utazhat.",
  srvMaxBags: "{type} szinten utasonként legfeljebb {n} csomag engedélyezett (összesen {t}).",
  srvFlight: "Repülőtéri transzfernél a járatszám megadása kötelező.",
  srvInvalidTime: "A felvétel időpontja érvénytelen.",
  srvFrom: "A felvételi cím megadása kötelező.",
  srvTo: "Az érkezési cím megadása kötelező.",
  srvDate: "A felvétel dátumának megadása kötelező.",
  srvTimeReq: "A felvétel időpontjának megadása kötelező.",
  srvPax: "Legalább 1 utas szükséges.",
  srvBags: "A csomagok száma nem lehet negatív.",
  srvPhone: "Az utas telefonszámának megadása kötelező.",

  fieldPickupDate: "Felvétel dátuma",
  fieldPickupTime: "Felvételi időpont",
  fieldFromAddress: "Felvételi cím",
  fieldToAddress: "Érkezési cím",
  fieldFlight: "Járatszám",
  fieldPax: "Utasok száma",
  fieldBags: "Csomagok száma",
  fieldComment: "Diszpécseri megjegyzés",
  fieldDriver: "Sofőr",
  fieldVehicle: "Jármű",
  fieldStatus: "Foglalás állapota",
  fieldPrice: "Ár",
  fieldCompany: "Cégnév",
  fieldPayment: "Fizetési mód",
  fieldGeneric: "Adat",
} as const;

export type EcoproBmKey = keyof typeof hu;

const ko: Record<EcoproBmKey, string> = {
  navBooking: "예약",
  navMyBookings: "내 예약",
  portalLabel: "Ecopro BM 전용 포털",
  signOut: "로그아웃",
  verifyingAccess: "접근 권한과 세션을 확인하는 중…",
  preparingWorkspace: "작업 공간을 준비하는 중…",
  premiumTagline: "프리미엄 기업 이동 서비스",
  footerPortal: "Ecopro BM 전용 고객 포털",
  footerSupport: "전용 고객 지원",
  rightsReserved: "모든 권리 보유.",
  timesNote: "모든 시간은 부다페스트 시간(CET/CEST) 기준입니다.",

  eyebrow: "예약 관리",
  pageTitle: "내 예약",
  pageSubtitle: "계정으로 예약한 모든 이동의 실시간 현황과 상세 정보를 한곳에서 확인하세요.",
  refresh: "새로고침",
  newBooking: "새 예약",
  searchPlaceholder: "예약 번호, 탑승자, 주소 또는 항공편으로 검색…",
  lastUpdated: "15초마다 자동 새로고침",

  statTotal: "전체 예약",
  statPending: "확정 대기",
  statConfirmed: "확정됨",
  statClosed: "완료 / 취소",
  badgePending: "대기",
  badgeActive: "진행",
  badgeClosed: "종료",

  filterAll: "전체",
  filterPending: "대기",
  filterConfirmed: "확정",
  filterClosed: "종료",

  statusPending: "접수됨",
  statusModified: "변경됨",
  statusConfirmed: "확정됨",
  statusInProgress: "진행 중",
  statusCompleted: "완료",
  statusCancelled: "취소됨",

  loadingBookings: "예약 정보를 불러오는 중…",
  emptyTitle: "예약이 없습니다",
  emptyBody: "현재 필터에 해당하는 예약이 없습니다. 예약 페이지에서 새 이동을 등록해 주세요.",
  emptySearch: "검색 조건과 일치하는 예약이 없습니다.",
  goBook: "예약 페이지로 이동",
  clearSearch: "검색 지우기",

  from: "출발",
  to: "도착",
  pickup: "탑승 일시",
  flight: "항공편명",
  noFlight: "미입력",
  vehicleClass: "서비스 등급",
  passengers: "탑승자",
  luggage: "수하물",
  payment: "결제",
  driverVehicle: "기사 및 차량",
  driverPending: "배정 대기",
  driverNotified: "기사에게 통보됨",
  driverAcknowledged: "기사 확인 완료",
  standard: "스탠더드",
  standardSub: "이코노미 등급",
  executive: "이그제큐티브",
  executiveSub: "비즈니스 등급",
  payCard: "기사에게 신용카드 결제",
  payBank: "계좌 이체",
  payCash: "현금",
  paxUnit: "{n}명",
  bagUnit: "{n}개",

  details: "상세 보기",
  hideDetails: "상세 접기",
  modify: "변경",
  cancel: "취소",

  secTrip: "경로",
  secPassenger: "탑승자",
  secSecond: "두 번째 탑승자",
  secCompany: "회사 및 결제",
  secDriver: "기사 및 차량",
  secComment: "요청 사항",
  secTimeline: "예약 이력",
  secTracking: "탑승자 추적",
  name: "성명",
  email: "이메일",
  phone: "전화번호",
  company: "회사",
  price: "요금",
  priceNotSet: "협의 중",
  portal: "포털",
  bookingCode: "예약 번호",
  noComment: "요청 사항 없음",
  createdAt: "생성일시",
  updatedAt: "최종 업데이트",
  statusChangedAt: "최근 상태 변경",
  statusChange: "{from} → {to}",
  trackingHint: "이 링크를 탑승자에게 공유하면 이동 상황을 확인할 수 있습니다.",
  openTracking: "추적 페이지 열기",
  copyTracking: "링크 복사",
  copied: "링크가 클립보드에 복사되었습니다.",
  trackingInactive: "추적 링크가 더 이상 유효하지 않습니다.",

  notifTitle: "상태 업데이트",
  dismissAll: "모두 닫기",
  view: "보기",
  dismiss: "닫기",
  notifConfirmed: "예약이 확정되었습니다.",
  notifModified: "배차 담당자가 예약을 변경했습니다.",
  notifCancelled: "예약이 취소되었습니다.",
  notifInProgress: "예약이 진행 중입니다.",
  notifCompleted: "예약이 완료되었습니다.",
  notifDefault: "예약 상태가 변경되었습니다.",
  dispatcherModified: "배차 담당자가 예약을 변경했습니다.",

  editTitle: "예약 변경",
  date: "날짜",
  time: "시간",
  fromAddress: "출발 주소",
  toAddress: "도착 주소",
  paxCount: "탑승 인원",
  bagCount: "수하물 개수",
  commentLabel: "요청 사항",
  commentPlaceholder: "특별 요청 또는 안내 사항…",
  phoneLabel: "탑승자 전화번호",
  flightLabel: "항공편명",
  flightPlaceholder: "예: LH1234",
  flightRequired: "공항 이동에는 항공편명이 필요합니다.",
  required: "필수 입력 항목입니다.",
  fixErrors: "아래 오류를 수정해 주세요.",
  noticeTitle: "안내",
  noticeBody: "변경 사항은 예약 조건(최소 사전 예약 시간, 탑승 정원, 운행 시간)에 따라 검토됩니다.",
  back: "뒤로",
  saving: "저장 중…",
  saveChanges: "변경 사항 저장",

  cancelTitle: "이 예약을 취소하시겠습니까?",
  refundTitle: "환불",
  refundBody: "취소 후에는 환불이 불가능합니다.",
  driverTitle: "기사",
  driverBody: "배정된 기사는 자동으로 배정 해제됩니다.",
  keepBooking: "예약 유지",
  processing: "처리 중…",
  confirmCancel: "예약 취소",

  toastUpdated: "예약이 변경되었습니다.",
  toastCancelled: "예약이 취소되었습니다.",
  toastNetwork: "네트워크 오류가 발생했습니다. 다시 시도해 주세요.",
  toastUpdateFailed: "변경을 완료하지 못했습니다.",
  toastCancelFailed: "취소를 완료하지 못했습니다.",
  toastGeneric: "요청을 처리하지 못했습니다. 입력한 정보를 확인한 후 다시 시도해 주세요.",

  srvSession: "세션이 만료되었습니다. 다시 로그인해 주세요.",
  srvNotFound: "예약을 찾을 수 없습니다.",
  srvForbidden: "이 예약을 변경할 권한이 없습니다.",
  srvUpdateFailed: "예약을 변경하지 못했습니다.",
  srvMinAdvance: "탑승 시각은 지금부터 최소 {n}시간 이후여야 합니다.",
  srvMaxAdvance: "탑승 시각은 지금부터 {n}일 이내여야 합니다.",
  srvCityHours: "시내 이동은 {a}부터 {b}까지만 예약할 수 있습니다.",
  srvMaxPax: "{type} 등급은 최대 {n}명까지 탑승할 수 있습니다.",
  srvMaxBags: "{type} 등급은 1인당 최대 {n}개의 수하물이 허용됩니다 (총 {t}개).",
  srvFlight: "공항 이동에는 항공편명이 필요합니다.",
  srvInvalidTime: "탑승 시간이 올바르지 않습니다.",
  srvFrom: "출발 주소를 입력해 주세요.",
  srvTo: "도착 주소를 입력해 주세요.",
  srvDate: "탑승 날짜를 입력해 주세요.",
  srvTimeReq: "탑승 시간을 입력해 주세요.",
  srvPax: "최소 1명의 탑승자가 필요합니다.",
  srvBags: "수하물 개수는 음수일 수 없습니다.",
  srvPhone: "탑승자 전화번호를 입력해 주세요.",

  fieldPickupDate: "탑승 날짜",
  fieldPickupTime: "탑승 시간",
  fieldFromAddress: "출발 주소",
  fieldToAddress: "도착 주소",
  fieldFlight: "항공편명",
  fieldPax: "탑승 인원",
  fieldBags: "수하물 개수",
  fieldComment: "배차 담당자 메모",
  fieldDriver: "기사",
  fieldVehicle: "차량",
  fieldStatus: "예약 상태",
  fieldPrice: "요금",
  fieldCompany: "회사명",
  fieldPayment: "결제 방법",
  fieldGeneric: "항목",
};

const en: Record<EcoproBmKey, string> = {
  navBooking: "Booking",
  navMyBookings: "My bookings",
  portalLabel: "Dedicated Ecopro BM portal",
  signOut: "Sign out",
  verifyingAccess: "Verifying access and session…",
  preparingWorkspace: "Preparing your workspace…",
  premiumTagline: "Premium corporate transfers",
  footerPortal: "Ecopro BM dedicated customer portal",
  footerSupport: "Dedicated customer support",
  rightsReserved: "All rights reserved.",
  timesNote: "All times are Budapest time (CET/CEST).",

  eyebrow: "Booking management",
  pageTitle: "My bookings",
  pageSubtitle: "The live status and full details of every transfer booked with your account, in one place.",
  refresh: "Refresh",
  newBooking: "New booking",
  searchPlaceholder: "Search by reference, passenger, address or flight…",
  lastUpdated: "Refreshes automatically every 15 seconds",

  statTotal: "Total bookings",
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

  statusPending: "Received",
  statusModified: "Modified",
  statusConfirmed: "Confirmed",
  statusInProgress: "In progress",
  statusCompleted: "Completed",
  statusCancelled: "Cancelled",

  loadingBookings: "Loading bookings…",
  emptyTitle: "No bookings",
  emptyBody: "No bookings match the current filter. Book a new transfer on the booking page.",
  emptySearch: "No bookings match your search.",
  goBook: "Go to the booking page",
  clearSearch: "Clear search",

  from: "From",
  to: "To",
  pickup: "Pick-up",
  flight: "Flight number",
  noFlight: "Not provided",
  vehicleClass: "Service class",
  passengers: "Passengers",
  luggage: "Luggage",
  payment: "Payment",
  driverVehicle: "Driver & vehicle",
  driverPending: "Assignment in progress",
  driverNotified: "Driver notified",
  driverAcknowledged: "Driver confirmed",
  standard: "Standard",
  standardSub: "Economy class",
  executive: "Executive",
  executiveSub: "Business class",
  payCard: "Credit card to the driver",
  payBank: "Bank transfer",
  payCash: "Cash",
  paxUnit: "{n} pax",
  bagUnit: "{n} pcs",

  details: "Details",
  hideDetails: "Hide details",
  modify: "Modify",
  cancel: "Cancel",

  secTrip: "Route",
  secPassenger: "Passenger",
  secSecond: "Second passenger",
  secCompany: "Company & payment",
  secDriver: "Driver & vehicle",
  secComment: "Notes",
  secTimeline: "Booking history",
  secTracking: "Passenger tracking",
  name: "Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  price: "Price",
  priceNotSet: "To be agreed",
  portal: "Portal",
  bookingCode: "Booking reference",
  noComment: "No notes",
  createdAt: "Created",
  updatedAt: "Last updated",
  statusChangedAt: "Last status change",
  statusChange: "{from} → {to}",
  trackingHint: "Share this link with the passenger so they can follow the trip.",
  openTracking: "Open tracking page",
  copyTracking: "Copy link",
  copied: "Link copied to the clipboard.",
  trackingInactive: "The tracking link is no longer active.",

  notifTitle: "Status updates",
  dismissAll: "Dismiss all",
  view: "View",
  dismiss: "Dismiss",
  notifConfirmed: "The booking has been confirmed.",
  notifModified: "The dispatcher modified the booking.",
  notifCancelled: "The booking has been cancelled.",
  notifInProgress: "The booking is in progress.",
  notifCompleted: "The booking has been completed.",
  notifDefault: "The booking status has changed.",
  dispatcherModified: "The dispatcher modified the booking.",

  editTitle: "Modify booking",
  date: "Date",
  time: "Time",
  fromAddress: "Pick-up address",
  toAddress: "Drop-off address",
  paxCount: "Number of passengers",
  bagCount: "Number of luggage items",
  commentLabel: "Notes",
  commentPlaceholder: "Special request or instructions…",
  phoneLabel: "Passenger phone number",
  flightLabel: "Flight number",
  flightPlaceholder: "e.g. LH1234",
  flightRequired: "A flight number is required for airport transfers.",
  required: "This field is required.",
  fixErrors: "Please correct the errors below.",
  noticeTitle: "Please note",
  noticeBody: "Changes are checked against the booking conditions (minimum lead time, capacity and operating hours).",
  back: "Back",
  saving: "Saving…",
  saveChanges: "Save changes",

  cancelTitle: "Are you sure you want to cancel this booking?",
  refundTitle: "Refund",
  refundBody: "No refund is available after cancellation.",
  driverTitle: "Driver",
  driverBody: "The assigned driver will be released automatically.",
  keepBooking: "Keep booking",
  processing: "Processing…",
  confirmCancel: "Cancel booking",

  toastUpdated: "The booking has been modified successfully.",
  toastCancelled: "The booking has been cancelled successfully.",
  toastNetwork: "A network error occurred. Please try again.",
  toastUpdateFailed: "The modification could not be completed.",
  toastCancelFailed: "The cancellation could not be completed.",
  toastGeneric: "The request could not be completed. Please check your details and try again.",

  srvSession: "Your session has expired. Please sign in again.",
  srvNotFound: "The booking could not be found.",
  srvForbidden: "You do not have permission to modify this booking.",
  srvUpdateFailed: "The booking could not be modified.",
  srvMinAdvance: "The pick-up must be at least {n} hours in the future.",
  srvMaxAdvance: "The pick-up can be at most {n} days in the future.",
  srvCityHours: "City transfers can only be booked between {a} and {b}.",
  srvMaxPax: "A maximum of {n} passengers can travel in the {type} class.",
  srvMaxBags: "The {type} class allows up to {n} luggage items per passenger ({t} in total).",
  srvFlight: "A flight number is required for airport transfers.",
  srvInvalidTime: "The pick-up time is invalid.",
  srvFrom: "The pick-up address is required.",
  srvTo: "The drop-off address is required.",
  srvDate: "The pick-up date is required.",
  srvTimeReq: "The pick-up time is required.",
  srvPax: "At least 1 passenger is required.",
  srvBags: "The number of luggage items cannot be negative.",
  srvPhone: "The passenger's phone number is required.",

  fieldPickupDate: "Pick-up date",
  fieldPickupTime: "Pick-up time",
  fieldFromAddress: "Pick-up address",
  fieldToAddress: "Drop-off address",
  fieldFlight: "Flight number",
  fieldPax: "Number of passengers",
  fieldBags: "Number of luggage items",
  fieldComment: "Dispatcher note",
  fieldDriver: "Driver",
  fieldVehicle: "Vehicle",
  fieldStatus: "Booking status",
  fieldPrice: "Price",
  fieldCompany: "Company name",
  fieldPayment: "Payment method",
  fieldGeneric: "Detail",
};

export const DICT: Record<EcoproBmLang, Record<EcoproBmKey, string>> = { hu, en, ko };

export type Translator = (key: EcoproBmKey, params?: Record<string, string | number>) => string;

export function makeT(lang: EcoproBmLang): Translator {
  return (key, params) => {
    let text: string = DICT[lang][key] ?? DICT.hu[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.split(`{${k}}`).join(String(v));
      }
    }
    return text;
  };
}

const LOCALE: Record<EcoproBmLang, string> = { hu: "hu-HU", en: "en-GB", ko: "ko-KR" };

export function formatPickupDate(dateStr: string, lang: EcoproBmLang): string {
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

export function formatTimestamp(ts: number | undefined, lang: EcoproBmLang): string {
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

export function formatPrice(price: number, lang: EcoproBmLang): string {
  return `${price.toLocaleString(LOCALE[lang])} HUF`;
}

export const STATUS_KEY: Record<string, EcoproBmKey> = {
  pending: "statusPending",
  modified: "statusModified",
  confirmed: "statusConfirmed",
  "in-progress": "statusInProgress",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

function transferTypeLabel(raw: string, lang: EcoproBmLang): string {
  const isExec = /executive/i.test(raw);
  const t = makeT(lang);
  return isExec ? t("executive") : t("standard");
}

/** A közös API magyar hibaüzeneteit a portál nyelvére fordítja. */
export function translateServerMessage(raw: string | undefined | null, lang: EcoproBmLang): string {
  const t = makeT(lang);
  const msg = String(raw || "").trim();
  if (!msg) return t("toastGeneric");

  let m: RegExpExecArray | null;
  if (/Nincs aktív munkamenet/i.test(msg)) return t("srvSession");
  if (/A foglalás nem található/i.test(msg)) return t("srvNotFound");
  if (/Nincs jogosultság/i.test(msg)) return t("srvForbidden");
  if (/A foglalás módosítása sikertelen|Módosítás sikertelen/i.test(msg)) return t("srvUpdateFailed");
  if ((m = /legalább (\d+) órával a jövőben/i.exec(msg))) return t("srvMinAdvance", { n: m[1] });
  if ((m = /nem lehet több mint (\d+) nap a jövőben/i.exec(msg))) return t("srvMaxAdvance", { n: m[1] });
  if ((m = /csak (\S+) és (\S+) között engedélyezettek/i.exec(msg))) return t("srvCityHours", { a: m[1], b: m[2] });
  if ((m = /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)/i.exec(msg))) {
    return t("srvMaxBags", { type: transferTypeLabel(m[1], lang), n: m[2], t: m[3] });
  }
  if ((m = /^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat/i.exec(msg))) {
    return t("srvMaxPax", { type: transferTypeLabel(m[1], lang), n: m[2] });
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

  return t("toastGeneric");
}

const FIELD_LABEL_KEY: Record<string, EcoproBmKey> = {
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

function localizeChangeValue(value: string, lang: EcoproBmLang): string {
  const t = makeT(lang);
  const statusKey = STATUS_KEY[value];
  if (statusKey) return t(statusKey);
  if (value === "card") return t("payCard");
  if (value === "bank") return t("payBank");
  if (value === "cash") return t("payCash");
  return value;
}

/** A diszpécseri módosítás szövegét a portál nyelvére alakítja az értesítési panelhez. */
export function localizeNotificationDetails(raw: string | undefined, lang: EcoproBmLang): string | undefined {
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

  if (lang !== "hu" && /diszpécser|foglalás|módosít|időpont|címe?\b|utas|csomag|megjegyzés/i.test(text)) {
    return t("dispatcherModified");
  }
  return text;
}
