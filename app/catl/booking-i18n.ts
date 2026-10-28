export type CatlLang = "en" | "zh";

export const CATL_LANG_STORAGE_KEY = "catl_lang";

export const CATL_LANGS: { id: CatlLang; label: string; full: string }[] = [
  { id: "en", label: "EN", full: "English" },
  { id: "zh", label: "中文", full: "简体中文" },
];

type Dict = Record<string, string>;

const en: Dict = {
  navLabel: "CATL Mobility Desk",
  navSubline: "Dedicated CATL Portal",
  navBooking: "Booking",
  navMyBookings: "My bookings",
  signOut: "Sign out",
  language: "Language",

  checkingAccess: "Checking access and session…",
  checkingAccessSub: "Pannon Transfer · Verifying access",
  portalName: "CATL Portal",
  preparing: "Preparing your portal…",
  premiumTag: "Premium Corporate Transfer",

  heroEyebrow: "Dedicated corporate portal",
  heroTitle: "Book your transfer",
  heroSubtitle:
    "Airport and city transfers for CATL colleagues and guests, arranged by the Pannon Transfer dispatch team.",
  heroChipConfirm: "Email confirmation",
  heroChipDesk: "Dedicated CATL desk",
  heroChipSupport: "Personal dispatcher follow-up",

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
  phFromOther: "e.g. CATL Debrecen plant",
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

  needHelp: "Need help?",
  supportRole: "Developer",
  rights: "All rights reserved.",
  footerTag: "Dedicated customer portal",

  // Messages returned by the booking API (Hungarian originals are translated below).
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
};

const zh: Dict = {
  navLabel: "CATL 出行服务台",
  navSubline: "CATL 专属门户",
  navBooking: "预订",
  navMyBookings: "我的预订",
  signOut: "退出登录",
  language: "语言",

  checkingAccess: "正在验证访问权限与会话…",
  checkingAccessSub: "Pannon Transfer · 正在验证访问权限",
  portalName: "CATL 门户",
  preparing: "正在准备您的门户…",
  premiumTag: "高端企业接送服务",

  heroEyebrow: "企业专属门户",
  heroTitle: "预订您的接送服务",
  heroSubtitle:
    "为 CATL 同事及来宾提供机场与市内接送，由 Pannon Transfer 调度团队统一安排。",
  heroChipConfirm: "电子邮件确认",
  heroChipDesk: "CATL 专属服务台",
  heroChipSupport: "调度员专人跟进",

  progress: "必填项已完成",

  secTraveler: "乘客与公司信息",
  secTravelerSub: "出行人员及联系方式",
  secService: "服务与支付",
  secServiceSub: "选择车型等级与支付方式",
  secRoute: "行程与时间",
  secRouteSub: "上车点、下车点、航班及时间",

  fEmail: "乘客电子邮箱",
  fEmailPh: "name@company.com",
  fName: "乘客姓名",
  fNamePh: "姓名全称",
  fCompany: "公司",
  fPhone: "联系电话",
  fPhonePh: "+36…",
  fPhoneHint: "仅填数字，需包含国家区号",
  secondTraveler: "第二位乘客",
  optional: "选填",
  optionalPh: "选填",
  fSecondEmail: "第二位乘客电子邮箱",
  fSecondPhone: "第二位乘客联系电话",

  fPayment: "支付方式",
  payCard: "向司机刷信用卡",
  payBank: "银行转账",
  fTransferType: "接送类型",
  typeStandard: "标准型",
  typeStandardSub: "经济舱标准",
  typeExecutive: "商务型",
  typeExecutiveSub: "商务舱标准",
  upToPax: "最多 {n} 位乘客",

  fFrom: "出发地",
  fTo: "目的地",
  typeAirport: "机场",
  typeOther: "其他地址",
  fFromAddress: "上车地址",
  fToAddress: "下车地址",
  phFromAirport: "例如：布达佩斯机场 (BUD)",
  phFromOther: "例如：CATL 德布勒森工厂",
  phToAirport: "例如：布达佩斯机场 (BUD)",
  phToOther: "例如：4031 德布勒森……",
  fFlight: "航班号",
  phFlight: "例如：LH1234",
  flightHint: "每笔预订均需填写，以便司机跟踪您的到达或出发航班。",
  fDate: "日期",
  fTime: "时间",
  advanceHint: "请至少提前 {h} 小时预订。",
  fTravelers: "乘客人数",
  fLuggage: "行李件数",
  luggageHint: "最多共 {n} 件",
  fComment: "备注",
  phComment: "特殊要求或说明（选填）",
  decrease: "减少",
  increase: "增加",

  submit: "提交预订",
  sending: "正在提交预订…",
  submitHint: "提交后您将立即收到电子邮件确认。",

  errFixTitle: "请更正以下问题：",
  errRequired: "请填写{field}",
  errEmail: "请输入有效的电子邮箱地址",
  errInvalid: "提交的数据无效，请检查表单。",
  errServer: "服务器出现错误，请重试。",
  errUnexpected: "发生意外错误，请重试。",
  errNetwork: "网络出现错误，请重试。",

  okTitle: "预订已提交",
  okSub: "确认邮件已发送至您的邮箱。",
  okCode: "预订编号",
  okNote: "调度员确认您的预订后，我们将立即通过电子邮件通知您。",
  okMyBookings: "我的预订",
  okNew: "新建预订",

  needHelp: "需要帮助？",
  supportRole: "开发人员",
  rights: "版权所有。",
  footerTag: "专属客户门户",

  srvFlightRequired: "请填写航班号",
  srvTravelerEmail: "请填写乘客电子邮箱",
  srvTravelerName: "请填写乘客姓名",
  srvTravelerPhone: "请填写乘客联系电话",
  srvFromRequired: "请填写上车地址",
  srvToRequired: "请填写下车地址",
  srvDateRequired: "请填写接送日期",
  srvTimeRequired: "请填写接送时间",
  srvMinPax: "至少需要 1 位乘客",
  srvLuggageNegative: "行李件数不能为负数",
  srvBadDateTime: "接送日期或时间无效",
  srvMinAdvance: "接送时间必须至少在 {n} 小时之后",
  srvMaxAdvance: "接送时间不能晚于 {n} 天之后",
  srvCityHours: "市内接送仅限 {a} 至 {b} 之间",
  srvMaxPax: "{type}接送最多可乘坐 {n} 位乘客",
  srvMaxLuggage: "{type}接送每位乘客最多 {n} 件行李（共 {m} 件）",
};

const DICTS: Record<CatlLang, Dict> = { en, zh };

export function catlText(
  lang: CatlLang,
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

/**
 * Translates the Hungarian validation messages of the booking API into the
 * portal language. Unknown messages fall back to a generic localized error so
 * that no Hungarian text is ever shown on the CATL page.
 */
export function translateCatlServerMessage(
  lang: CatlLang,
  message: string,
): string {
  const trimmed = String(message || "").trim();
  if (!trimmed) return catlText(lang, "errInvalid");

  const exactKey = EXACT_SERVER[trimmed];
  if (exactKey) return catlText(lang, exactKey);

  let m = trimmed.match(
    /^Az átvételnek legalább (\d+) órával a jövőben kell lennie$/,
  );
  if (m) return catlText(lang, "srvMinAdvance", { n: m[1] });

  m = trimmed.match(/^Az átvétel nem lehet több mint (\d+) nap a jövőben$/);
  if (m) return catlText(lang, "srvMaxAdvance", { n: m[1] });

  m = trimmed.match(
    /^Városi transzferek csak (\S+) és (\S+) között engedélyezettek$/,
  );
  if (m) return catlText(lang, "srvCityHours", { a: m[1], b: m[2] });

  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) utas utazhat$/,
  );
  if (m) {
    return catlText(lang, "srvMaxPax", {
      type: transferTypeName(lang, m[1]),
      n: m[2],
    });
  }

  m = trimmed.match(
    /^(Standard|Executive) transzferen maximálisan (\d+) csomag\/utas engedélyezett \(összesen (\d+)\)$/,
  );
  if (m) {
    return catlText(lang, "srvMaxLuggage", {
      type: transferTypeName(lang, m[1]),
      n: m[2],
      m: m[3],
    });
  }

  // Already-English / Chinese text coming from the client is passed through.
  if (/^[\x20-\x7E]+$/.test(trimmed) || /[一-鿿]/.test(trimmed)) {
    return trimmed;
  }
  return catlText(lang, "errInvalid");
}

function transferTypeName(lang: CatlLang, raw: string): string {
  return raw === "Standard"
    ? catlText(lang, "typeStandard")
    : catlText(lang, "typeExecutive");
}
