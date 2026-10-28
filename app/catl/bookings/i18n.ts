export type CatlLang = "en" | "zh";

const en = {
  navBooking: "Booking",
  navMyBookings: "My Bookings",
  portalLabel: "Dedicated CATL Portal",
  signOut: "Sign out",
  verifyingAccess: "Verifying your access and session…",
  preparingWorkspace: "Preparing your workspace…",
  premiumTagline: "Premium Corporate Transfer",
  footerPortal: "CATL Dedicated Client Portal",
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

export type CatlKey = keyof typeof en;

const zh: Record<CatlKey, string> = {
  navBooking: "预订",
  navMyBookings: "我的预订",
  portalLabel: "CATL 专属门户",
  signOut: "退出登录",
  verifyingAccess: "正在验证您的访问权限和会话…",
  preparingWorkspace: "正在准备您的工作区…",
  premiumTagline: "高端企业接送服务",
  footerPortal: "CATL 专属客户门户",
  footerSupport: "专属客户服务",
  rightsReserved: "保留所有权利。",
  timesNote: "所有时间均为布达佩斯时间（CET/CEST）。",

  eyebrow: "预订管理",
  pageTitle: "我的预订",
  pageSubtitle: "实时查看您账户下每一笔接送预订的状态和完整信息。",
  refresh: "刷新",
  newBooking: "新建预订",
  searchPlaceholder: "按编号、乘客、地址或航班搜索…",
  lastUpdated: "每 15 秒自动刷新",

  statTotal: "全部预订",
  statPending: "待确认",
  statConfirmed: "已确认",
  statClosed: "已完成 / 已取消",
  badgePending: "待处理",
  badgeActive: "进行中",
  badgeClosed: "已结束",

  filterAll: "全部",
  filterPending: "待处理",
  filterConfirmed: "已确认",
  filterClosed: "已结束",

  statusPending: "待处理",
  statusModified: "已修改",
  statusConfirmed: "已确认",
  statusInProgress: "进行中",
  statusCompleted: "已完成",
  statusCancelled: "已取消",

  loadingBookings: "正在加载您的预订…",
  emptyTitle: "未找到预订",
  emptyBody: "当前筛选条件下没有预订。请前往预订页面创建新的接送。",
  emptySearch: "没有符合搜索条件的预订。",
  goBook: "前往预订页面",
  clearSearch: "清除搜索",

  from: "出发地",
  to: "目的地",
  pickup: "接送时间",
  flight: "航班号",
  noFlight: "未提供",
  vehicleClass: "车型等级",
  passengers: "乘客",
  luggage: "行李",
  payment: "支付方式",
  driverVehicle: "司机与车辆",
  driverPending: "等待安排",
  driverNotified: "已通知司机",
  driverAcknowledged: "司机已确认",
  standard: "标准型",
  standardSub: "经济舱级别",
  executive: "商务型",
  executiveSub: "公务舱级别",
  payCard: "上车后向司机刷信用卡",
  payBank: "银行转账",
  payCash: "现金",
  paxUnit: "{n} 人",
  bagUnit: "{n} 件",

  details: "详情",
  hideDetails: "收起详情",
  modify: "修改",
  cancel: "取消预订",

  secTrip: "行程",
  secPassenger: "乘客",
  secSecond: "第二位乘客",
  secCompany: "公司与付款",
  secDriver: "司机与车辆",
  secComment: "备注",
  secTimeline: "预订记录",
  secTracking: "乘客追踪",
  name: "姓名",
  email: "电子邮箱",
  phone: "电话",
  company: "公司",
  price: "价格",
  priceNotSet: "待确认",
  portal: "门户",
  bookingCode: "预订编号",
  noComment: "无备注",
  createdAt: "创建时间",
  updatedAt: "最后更新",
  statusChangedAt: "状态最近变更",
  statusChange: "{from} → {to}",
  trackingHint: "将此链接发给您的乘客，即可跟踪行程。",
  openTracking: "打开追踪页面",
  copyTracking: "复制链接",
  copied: "链接已复制到剪贴板。",
  trackingInactive: "追踪链接已失效。",

  notifTitle: "状态更新",
  dismissAll: "全部忽略",
  view: "查看",
  dismiss: "忽略",
  notifConfirmed: "您的预订已确认。",
  notifModified: "调度员已修改您的预订。",
  notifCancelled: "您的预订已取消。",
  notifInProgress: "您的预订正在进行中。",
  notifCompleted: "您的预订已完成。",
  notifDefault: "您的预订状态已变更。",
  dispatcherModified: "调度员修改了预订。",

  editTitle: "修改预订",
  date: "日期",
  time: "时间",
  fromAddress: "上车地址",
  toAddress: "目的地地址",
  paxCount: "乘客人数",
  bagCount: "行李件数",
  commentLabel: "备注",
  commentPlaceholder: "特殊要求或说明…",
  phoneLabel: "乘客电话",
  flightLabel: "航班号",
  flightPlaceholder: "例如 LH1234",
  flightRequired: "机场接送必须填写航班号。",
  required: "此项为必填项。",
  fixErrors: "请更正以下问题。",
  noticeTitle: "温馨提示",
  noticeBody: "修改内容将按预订条件进行校验（最短提前时间、载客量和服务时段）。",
  back: "返回",
  saving: "保存中…",
  saveChanges: "保存修改",

  cancelTitle: "确定要取消此预订吗？",
  refundTitle: "退款",
  refundBody: "取消后不予退款。",
  driverTitle: "司机",
  driverBody: "已分配的司机将自动解除安排。",
  keepBooking: "保留预订",
  processing: "处理中…",
  confirmCancel: "取消预订",

  toastUpdated: "预订修改成功。",
  toastCancelled: "预订已成功取消。",
  toastNetwork: "发生网络错误，请重试。",
  toastUpdateFailed: "修改未能完成。",
  toastCancelFailed: "取消未能完成。",
  toastGeneric: "请求未能完成，请检查信息后重试。",

  srvSession: "您的会话已过期，请重新登录。",
  srvNotFound: "未找到该预订。",
  srvForbidden: "您无权修改此预订。",
  srvUpdateFailed: "预订未能更新。",
  srvMinAdvance: "接送时间必须至少提前 {n} 小时。",
  srvMaxAdvance: "接送时间不能晚于未来 {n} 天。",
  srvCityHours: "市内接送仅在 {a} 至 {b} 之间提供。",
  srvMaxPax: "{type}接送最多可乘坐 {n} 名乘客。",
  srvMaxBags: "{type}接送每位乘客最多 {n} 件行李（共计 {t} 件）。",
  srvFlight: "机场接送必须填写航班号。",
  srvInvalidTime: "接送时间无效。",
  srvFrom: "上车地址为必填项。",
  srvTo: "目的地地址为必填项。",
  srvDate: "接送日期为必填项。",
  srvTimeReq: "接送时间为必填项。",
  srvPax: "至少需要 1 名乘客。",
  srvBags: "行李件数不能为负数。",
  srvPhone: "乘客电话为必填项。",

  fieldPickupDate: "接送日期",
  fieldPickupTime: "接送时间",
  fieldFromAddress: "上车地址",
  fieldToAddress: "目的地地址",
  fieldFlight: "航班号",
  fieldPax: "乘客人数",
  fieldBags: "行李件数",
  fieldComment: "调度备注",
  fieldDriver: "司机",
  fieldVehicle: "车辆",
  fieldStatus: "预订状态",
  fieldPrice: "价格",
  fieldCompany: "公司名称",
  fieldPayment: "支付方式",
  fieldGeneric: "信息",
};

export const DICT: Record<CatlLang, Record<CatlKey, string>> = { en, zh };

export type Translator = (key: CatlKey, params?: Record<string, string | number>) => string;

export function makeT(lang: CatlLang): Translator {
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

const LOCALE: Record<CatlLang, string> = { en: "en-GB", zh: "zh-CN" };

export function formatPickupDate(dateStr: string, lang: CatlLang): string {
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

export function formatTimestamp(ts: number | undefined, lang: CatlLang): string {
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

export function formatPrice(price: number, lang: CatlLang): string {
  return `${price.toLocaleString(LOCALE[lang])} HUF`;
}

export const STATUS_KEY: Record<string, CatlKey> = {
  pending: "statusPending",
  modified: "statusModified",
  confirmed: "statusConfirmed",
  "in-progress": "statusInProgress",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

const HU_CHARS = /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/;

function transferTypeLabel(raw: string, lang: CatlLang): string {
  const isExec = /executive/i.test(raw);
  if (lang === "zh") return isExec ? "商务型" : "标准型";
  return isExec ? "Executive" : "Standard";
}

/** Translates the Hungarian validation / error messages returned by the shared API. */
export function translateServerMessage(raw: string | undefined | null, lang: CatlLang): string {
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

  if (HU_CHARS.test(msg) || /\b(foglal|utas|hiba|sikertelen|kötelező|diszpécser|sofőr)/i.test(msg)) {
    return t("toastGeneric");
  }
  return msg;
}

const FIELD_LABEL_KEY: Record<string, CatlKey> = {
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

function localizeChangeValue(value: string, lang: CatlLang): string {
  const t = makeT(lang);
  const statusKey = STATUS_KEY[value];
  if (statusKey) return t(statusKey);
  if (value === "card") return t("payCard");
  if (value === "bank") return t("payBank");
  if (value === "cash") return t("payCash");
  return value;
}

/** Translates the dispatcher modification text shown in the notification panel. */
export function localizeNotificationDetails(raw: string | undefined, lang: CatlLang): string | undefined {
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

  if (/diszpécser|foglalás|módosít|időpont|címe?\b|utas|csomag|megjegyzés/i.test(text)) {
    return t("dispatcherModified");
  }
  return text;
}
