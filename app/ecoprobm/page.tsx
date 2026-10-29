"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Briefcase,
  Building,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Info,
  ListOrdered,
  Loader2,
  Luggage,
  Mail,
  Map,
  MapPin,
  MessageSquare,
  Minus,
  Phone,
  Plane,
  Plus,
  Receipt,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getTravelConditions } from "@/lib/travel-conditions";
import EcoproBmPremiumLogin from "./components/EcoproBmPremiumLogin";
import EcoproBmBookingHeader from "./components/EcoproBmBookingHeader";
import { GradientTitle } from "./components/EcoproBmAuthShell";
import { useEcoproBmLang, type EcoproBmLang } from "./lang";
import { ecoproBmText, translateEcoproBmServerMessage } from "./booking-i18n";

interface EcoproBmPortalUser {
  email: string;
  company?: string;
  role?: string;
}

type TransferType = "standard" | "executive";
type PlaceType = "airport" | "other";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONDITIONS = getTravelConditions("ecoprobm");

const inputShell = (invalid: boolean) =>
  `group w-full rounded-xl bg-[#0B1D38] border px-4 py-3.5 flex items-center gap-3 transition-all duration-200 ${
    invalid
      ? "border-red-400/60 ring-4 ring-red-500/10"
      : "border-white/10 hover:border-white/20 focus-within:border-[#3B93E0] focus-within:ring-4 focus-within:ring-[#1E73BE]/20"
  }`;

const inputBase =
  "bg-transparent border-none outline-none w-full text-[15px] font-medium text-white placeholder:text-slate-500";

const iconCls = (invalid: boolean) =>
  `w-4 h-4 shrink-0 transition-colors ${invalid ? "text-red-400" : "text-slate-500 group-focus-within:text-[#8CC4F5]"}`;

function todayLocal(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function Label({
  htmlFor,
  children,
  required,
  optionalText,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  optionalText?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2">
      <span>{children}</span>
      {required && <span className="text-[#F28C28]">*</span>}
      {optionalText && <span className="normal-case tracking-normal font-medium text-slate-500">· {optionalText}</span>}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          transition={{ duration: 0.18 }}
          className="mt-2 text-[12px] text-red-400 font-medium flex items-center gap-1.5 overflow-hidden"
        >
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/** Függőleges lépcsősor-szakasz: számozott csomópont + összekötő vonal. */
function Step({
  index,
  title,
  subtitle,
  last,
  children,
}: {
  index: number;
  title: string;
  subtitle: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="relative pl-0 sm:pl-16">
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-10">
        <div className="relative z-10 w-10 h-10 rounded-full bg-[#0A1A33] border-2 border-[#F28C28]/70 text-[#FFB366] font-bold text-[15px] flex items-center justify-center shadow-[0_0_22px_rgba(242,140,40,0.25)]">
          {index}
        </div>
        {!last && <div className="absolute left-1/2 -translate-x-1/2 top-11 -bottom-12 w-px bg-gradient-to-b from-[#F28C28]/45 via-[#1E73BE]/30 to-transparent" />}
      </div>
      <div className="mb-6 flex items-center gap-3 sm:block">
        <div className="sm:hidden w-9 h-9 shrink-0 rounded-full border-2 border-[#F28C28]/70 text-[#FFB366] font-bold text-sm flex items-center justify-center">
          {index}
        </div>
        <div>
          <h2 className="text-white font-semibold text-[19px] tracking-tight leading-tight">{title}</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon: React.ReactNode }[];
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#071428] border border-white/[0.07]">
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.id)}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              selected
                ? "bg-gradient-to-b from-[#2B84D2] to-[#1E73BE] text-white shadow-[0_4px_16px_rgba(30,115,190,0.45)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Counter({
  id,
  icon,
  value,
  min,
  max,
  onChange,
  decreaseLabel,
  increaseLabel,
}: {
  id: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  decreaseLabel: string;
  increaseLabel: string;
}) {
  const btn =
    "w-10 h-10 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="w-full rounded-xl bg-[#0B1D38] border border-white/10 px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3 pl-1.5 text-slate-500">
        {icon}
        <output id={id} className="text-lg font-bold text-white tabular-nums min-w-6">
          {value}
        </output>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={decreaseLabel} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className={btn}>
          <Minus className="w-4 h-4" />
        </button>
        <button type="button" aria-label={increaseLabel} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className={btn}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-[#1E73BE]/15 border border-[#3B93E0]/20 flex items-center justify-center text-[#8CC4F5]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-500">{label}</p>
        <div className="text-[13.5px] font-semibold text-white break-words">{children}</div>
      </div>
    </div>
  );
}

export default function EcoproBmBookingPage() {
  const router = useRouter();
  const [lang, setLang] = useEcoproBmLang();
  const tx = (key: string, params?: Record<string, string | number>) => ecoproBmText(lang, key, params);

  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<EcoproBmPortalUser | null>(null);
  const [bootDone, setBootDone] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastBookingCode, setLastBookingCode] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [blurred, setBlurred] = useState<Record<string, boolean>>({});

  const [travelerEmail, setTravelerEmail] = useState("");
  const [travelerName, setTravelerName] = useState("");
  const [travelerPhone, setTravelerPhone] = useState("");
  const [secondTravelerEmail, setSecondTravelerEmail] = useState("");
  const [secondTravelerPhone, setSecondTravelerPhone] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [commentText, setCommentText] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [fromType, setFromType] = useState<PlaceType>("airport");
  const [toType, setToType] = useState<PlaceType>("other");
  const [travelers, setTravelers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [transferType, setTransferType] = useState<TransferType>("standard");

  useEffect(() => {
    if (!authedUser || bootDone) return;
    const timer = setTimeout(() => setBootDone(true), 1500);
    return () => clearTimeout(timer);
  }, [authedUser, bootDone]);

  const portalBooting = !!authedUser && !bootDone;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/ecoprobm-auth/session", { cache: "no-store" });
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.user) setAuthedUser(json.user);
        }
      } catch {}
      if (active) setAuthChecked(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/ecoprobm-auth/logout", { method: "POST" });
    } catch {}
    setAuthedUser(null);
    setBootDone(false);
  };

  const maxPax = CONDITIONS.maxPax[transferType];
  const maxLuggage = travelers * CONDITIONS.maxLuggagePerPax[transferType];

  const changeTransferType = (next: TransferType) => {
    setTransferType(next);
    const nextTravelers = Math.min(travelers, CONDITIONS.maxPax[next]);
    setTravelers(nextTravelers);
    setLuggage((l) => Math.min(l, nextTravelers * CONDITIONS.maxLuggagePerPax[next]));
  };

  const changeTravelers = (next: number) => {
    setTravelers(next);
    setLuggage((l) => Math.min(l, next * CONDITIONS.maxLuggagePerPax[transferType]));
  };

  const fieldLabels: Record<string, string> = {
    travelerEmail: tx("fEmail"),
    travelerName: tx("fName"),
    travelerPhone: tx("fPhone"),
    fromAddress: tx("fFromAddress"),
    toAddress: tx("fToAddress"),
    flightNumber: tx("fFlight"),
    pickupDate: tx("fDate"),
    pickupTime: tx("fTime"),
  };

  const fieldValues: Record<string, string> = {
    travelerEmail,
    travelerName,
    travelerPhone,
    fromAddress,
    toAddress,
    flightNumber,
    pickupDate,
    pickupTime,
  };

  const fieldError = (key: string, force = false): string | null => {
    if (!force && !attempted && !blurred[key]) return null;
    const value = (fieldValues[key] || "").trim();
    if (!value) return tx("errRequired", { field: fieldLabels[key] });
    if (key === "travelerEmail" && !EMAIL_REGEX.test(value)) return tx("errEmail");
    return null;
  };

  const validKeys = Object.keys(fieldValues).filter((key) => {
    const value = fieldValues[key].trim();
    if (!value) return false;
    if (key === "travelerEmail") return EMAIL_REGEX.test(value);
    return true;
  });
  const requiredTotal = Object.keys(fieldValues).length;
  const progressPct = Math.round((validKeys.length / requiredTotal) * 100);

  const markBlurred = (key: string) => setBlurred((prev) => ({ ...prev, [key]: true }));

  const resetForm = () => {
    setTravelerEmail("");
    setTravelerName("");
    setTravelerPhone("");
    setSecondTravelerEmail("");
    setSecondTravelerPhone("");
    setFromAddress("");
    setToAddress("");
    setFlightNumber("");
    setPickupDate("");
    setPickupTime("");
    setCommentText("");
    setPaymentMethod("card");
    setFromType("airport");
    setToType("other");
    setTravelers(1);
    setLuggage(1);
    setTransferType("standard");
    setSubmitErrors([]);
    setSubmitSuccess(false);
    setLastBookingCode(null);
    setAttempted(false);
    setBlurred({});
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (formLoading) return;
    setSubmitErrors([]);
    setAttempted(true);

    const problems = Object.keys(fieldValues)
      .filter((key) => fieldError(key, true) !== null)
      .map((key) => `field:${key}`);
    if (problems.length > 0) {
      setSubmitErrors(problems);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        travelerEmail: travelerEmail.trim(),
        travelerName: travelerName.trim(),
        travelerPhone: travelerPhone.trim(),
        secondTravelerEmail: secondTravelerEmail.trim() || undefined,
        secondTravelerPhone: secondTravelerPhone.trim() || undefined,
        companyName: "Ecopro BM",
        paymentMethod,
        transferType,
        fromType,
        fromAddress: fromAddress.trim(),
        toType,
        toAddress: toAddress.trim(),
        flightNumber: flightNumber.trim(),
        pickupDate,
        pickupTime,
        travelers,
        luggage,
        comment: commentText.trim() || undefined,
        language: lang,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-partner-portal": "ecoprobm" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data?.success && data?.booking) {
        setSubmitSuccess(true);
        setLastBookingCode(data.booking.bookingCode);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 400) {
        const errs: string[] =
          data?.errors && Array.isArray(data.errors) && data.errors.length
            ? data.errors.map((m: string) => `srv:${m}`)
            : ["i18n:errInvalid"];
        setSubmitErrors(errs);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 401) {
        setAuthedUser(null);
        setBootDone(false);
      } else if (res.status === 500) {
        setSubmitErrors(["i18n:errServer"]);
      } else {
        setSubmitErrors(["i18n:errUnexpected"]);
      }
    } catch {
      setSubmitErrors(["i18n:errNetwork"]);
    } finally {
      setFormLoading(false);
    }
  };

  const renderSubmitError = (token: string): string => {
    if (token.startsWith("field:")) return fieldError(token.slice(6), true) || "";
    if (token.startsWith("srv:")) return translateEcoproBmServerMessage(lang, token.slice(4));
    if (token.startsWith("i18n:")) return tx(token.slice(5));
    return token;
  };

  const minDate = useMemo(() => todayLocal(), []);
  const year = new Date().getFullYear();

  const formatSummaryDate = (d: string, time: string, l: EcoproBmLang) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
    if (!m) return null;
    const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
    const text = new Intl.DateTimeFormat(l === "ko" ? "ko-KR" : l === "en" ? "en-GB" : "hu-HU", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
    return time ? `${text} · ${time}` : text;
  };

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#050F20] text-slate-300 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="h-12 px-4 rounded-xl bg-white flex items-center shadow-[0_8px_30px_rgba(30,115,190,0.35)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/partners/ecoprobm/logo.png" alt="Ecopro BM" width={366} height={81} className="h-6 w-auto" />
          </div>
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
              className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#F28C28]"
            />
            <p className="text-[14px] text-slate-400 font-semibold tracking-wide">{tx("checkingAccess")}</p>
          </div>
          <p className="text-[11px] text-slate-600 tracking-wider uppercase">{tx("checkingAccessSub")}</p>
        </motion.div>
      </div>
    );
  }

  if (!authedUser) {
    return <EcoproBmPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#030A16] flex flex-col items-center justify-center overflow-hidden font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.55 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
          className="absolute w-[820px] h-[820px] rounded-full bg-[radial-gradient(circle_at_center,rgba(30,115,190,0.35),transparent_62%)] blur-[90px] pointer-events-none"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
          className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(242,140,40,0.28),transparent_65%)] blur-[100px] pointer-events-none"
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-40 h-40 flex items-center justify-center mb-9">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 9, ease: "linear", repeat: Infinity }}
              className="absolute inset-0 rounded-full border border-white/[0.05] border-t-[#3B93E0] border-r-[#1E73BE]/60"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 14, ease: "linear", repeat: Infinity }}
              className="absolute -inset-4 rounded-full border border-white/[0.04] border-b-[#F28C28]/80 border-l-[#F28C28]/25"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="h-14 px-5 rounded-2xl bg-white flex items-center shadow-[0_0_50px_rgba(59,147,224,0.4)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/partners/ecoprobm/logo.png" alt="Ecopro BM" width={366} height={81} className="h-7 w-auto" />
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="font-serif text-xl tracking-[0.3em] text-white/90">PANNON</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
              <span className="font-sans font-black text-xl tracking-[0.18em] text-[#8CC4F5]">BM</span>
            </div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 font-medium">{tx("premiumTag")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-12 w-64">
            <div className="h-[2px] w-full bg-white/5 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, ease: [0.7, 0, 0.3, 1], delay: 0.3 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-[#3B93E0] to-[#F28C28] shadow-[0_0_12px_rgba(242,140,40,0.7)]"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 text-center text-[10px] tracking-[0.25em] text-[#8CC4F5] uppercase font-bold"
            >
              {tx("preparing")}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const errorId = (key: string) => `err-${key}`;
  const describedBy = (key: string) => (fieldError(key) ? errorId(key) : undefined);

  const summaryWhen = formatSummaryDate(pickupDate, pickupTime, lang);
  const hasSummary = !!(fromAddress.trim() || toAddress.trim() || summaryWhen || flightNumber.trim());

  const summaryCard = (
    <div className="rounded-3xl bg-[#0A1A33]/85 backdrop-blur border border-white/10 shadow-[0_24px_70px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#1E73BE] via-[#3B93E0] to-[#F28C28]" />
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <span className="w-8 h-8 rounded-lg bg-[#F28C28]/15 border border-[#F28C28]/35 flex items-center justify-center text-[#FFB366]">
            <Receipt className="w-4 h-4" />
          </span>
          <h3 className="text-[15px] font-semibold text-white tracking-tight">{tx("sumTitle")}</h3>
        </div>

        {hasSummary ? (
          <div className="space-y-4">
            {(fromAddress.trim() || toAddress.trim()) && (
              <SummaryRow icon={<MapPin className="w-4 h-4" />} label={tx("sumRoute")}>
                <span className="block">{fromAddress.trim() || "—"}</span>
                <span className="flex items-center gap-1.5 text-[#F5A04A] my-0.5">
                  <ArrowDown className="w-3.5 h-3.5" />
                </span>
                <span className="block">{toAddress.trim() || "—"}</span>
              </SummaryRow>
            )}
            {summaryWhen && (
              <SummaryRow icon={<Calendar className="w-4 h-4" />} label={tx("sumWhen")}>
                {summaryWhen}
              </SummaryRow>
            )}
            <SummaryRow icon={<Users className="w-4 h-4" />} label={tx("sumPassengers")}>
              {tx("sumPassengerLine", { p: travelers, l: luggage })}
            </SummaryRow>
            {flightNumber.trim() && (
              <SummaryRow icon={<Plane className="w-4 h-4" />} label={tx("sumFlight")}>
                {flightNumber.trim()}
              </SummaryRow>
            )}
            <SummaryRow icon={<ShieldCheck className="w-4 h-4" />} label={tx("sumClass")}>
              {transferType === "executive" ? tx("typeExecutive") : tx("typeStandard")}
            </SummaryRow>
          </div>
        ) : (
          <p className="text-[13px] text-slate-400 leading-relaxed">{tx("sumEmpty")}</p>
        )}

        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#F5A04A] mb-3">
            <Info className="w-3.5 h-3.5" />
            {tx("sumNoteTitle")}
          </div>
          <ul className="space-y-2 text-[12.5px] text-slate-400 leading-relaxed">
            <li className="flex gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              {tx("sumNote1")}
            </li>
            <li className="flex gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              {tx("sumNote2")}
            </li>
            <li className="flex gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              {tx("sumNote3")}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050F20] text-slate-300 font-sans selection:bg-[#1E73BE]/40 relative overflow-x-clip">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-48 -left-40 w-[900px] h-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(30,115,190,0.32),transparent_65%)] blur-2xl" />
        <div className="absolute top-1/3 -right-52 w-[640px] h-[640px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(11,60,122,0.45),transparent_65%)] blur-3xl" />
        <div className="absolute -bottom-40 right-0 w-[520px] h-[420px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(242,140,40,0.13),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]" />
      </div>

      <EcoproBmBookingHeader lang={lang} onLangChange={setLang} email={authedUser.email} active="booking" onLogout={handleLogout} />

      <main className="relative z-10 pt-[150px] md:pt-[120px] pb-24 px-4 sm:px-6">
        <div className="max-w-[1180px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F28C28]/12 border border-[#F28C28]/35 text-[11px] font-bold tracking-[0.2em] uppercase text-[#FFB366] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] shadow-[0_0_10px_rgba(242,140,40,0.9)]" />
              {tx("heroEyebrow")}
            </div>
            <h1 className="text-[36px] sm:text-[52px] font-semibold tracking-tight text-white leading-[1.05] break-keep">
              <GradientTitle text={tx("heroTitle")} />
            </h1>
            <p className="mt-4 text-[15px] sm:text-[17px] text-slate-400 max-w-2xl leading-relaxed break-keep">{tx("heroSubtitle")}</p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-8">
            <div className="min-w-0">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative overflow-hidden rounded-3xl bg-[#0A1A33]/90 backdrop-blur border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-[#3B93E0] to-[#F28C28]" />
                  <div className="p-8 sm:p-14 flex flex-col items-center text-center">
                    <motion.div
                      initial={{ scale: 0, rotate: -120 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.25)] mb-8"
                    >
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={2.2} />
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">{tx("okTitle")}</h2>
                    <p className="text-slate-400 text-[15px] mb-8">{tx("okSub")}</p>

                    <div className="mb-8">
                      <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2 block">{tx("okCode")}</span>
                      <div className="inline-flex items-center px-7 py-3.5 rounded-2xl bg-[#F28C28]/10 border border-[#F28C28]/40 shadow-[0_0_30px_rgba(242,140,40,0.18)]">
                        <span className="text-3xl sm:text-4xl font-black text-white tracking-wider font-mono">#{lastBookingCode}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 max-w-md mb-10 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-left">
                      <ShieldCheck className="w-4 h-4 text-[#8CC4F5] shrink-0 mt-0.5" />
                      <p className="text-[13px] text-slate-400 leading-relaxed">{tx("okNote")}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                      <button
                        type="button"
                        onClick={() => router.push("/ecoprobm/bookings")}
                        className="py-3.5 px-5 rounded-xl bg-gradient-to-b from-[#2B84D2] to-[#1E73BE] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(30,115,190,0.4)] active:scale-[0.98]"
                      >
                        <ListOrdered className="w-4 h-4" />
                        {tx("okMyBookings")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          resetForm();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="py-3.5 px-5 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                      >
                        <Plus className="w-4 h-4" />
                        {tx("okNew")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  noValidate
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden rounded-3xl bg-[#0A1A33]/85 backdrop-blur border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1E73BE] via-[#3B93E0] to-[#F28C28]" />

                  <div className="px-6 sm:px-10 pt-7 pb-5 border-b border-white/[0.06] bg-white/[0.015]">
                    <div className="flex items-center justify-between text-[12px] font-medium mb-2.5">
                      <span className="text-slate-400">{tx("progress")}</span>
                      <span className="tabular-nums text-slate-200 font-semibold">
                        {validKeys.length}/{requiredTotal}
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progressPct}
                      aria-label={tx("progress")}
                    >
                      <motion.div
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[#1E73BE] via-[#3B93E0] to-[#F28C28] shadow-[0_0_14px_rgba(242,140,40,0.55)]"
                      />
                    </div>
                  </div>

                  <div className="px-6 sm:px-10 py-9 space-y-14">
                    <AnimatePresence initial={false}>
                      {submitErrors.length > 0 && (
                        <motion.div
                          key="errors"
                          role="alert"
                          initial={{ opacity: 0, y: -8, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -8, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-2xl bg-red-500/[0.07] border border-red-500/25 p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                                <XCircle className="w-4 h-4 text-red-400" />
                              </div>
                              <p className="text-[14px] font-semibold text-red-300">{tx("errFixTitle")}</p>
                            </div>
                            <ul className="space-y-1.5 pl-11">
                              {submitErrors.map((err, idx) => (
                                <li key={idx} className="text-[13px] text-red-300/90 flex items-start gap-2 leading-relaxed">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/70 mt-2 shrink-0" />
                                  <span>{renderSubmitError(err)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Step index={1} title={tx("secTraveler")} subtitle={tx("secTravelerSub")}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <Label htmlFor="bm-email" required>{tx("fEmail")}</Label>
                          <div className={inputShell(!!fieldError("travelerEmail"))}>
                            <Mail className={iconCls(!!fieldError("travelerEmail"))} />
                            <input
                              id="bm-email"
                              type="email"
                              autoComplete="email"
                              value={travelerEmail}
                              onChange={(e) => setTravelerEmail(e.target.value)}
                              onBlur={() => markBlurred("travelerEmail")}
                              placeholder={tx("fEmailPh")}
                              aria-invalid={!!fieldError("travelerEmail")}
                              aria-describedby={describedBy("travelerEmail")}
                              className={inputBase}
                            />
                          </div>
                          <FieldError id={errorId("travelerEmail")} message={fieldError("travelerEmail")} />
                        </div>

                        <div>
                          <Label htmlFor="bm-name" required>{tx("fName")}</Label>
                          <div className={inputShell(!!fieldError("travelerName"))}>
                            <Users className={iconCls(!!fieldError("travelerName"))} />
                            <input
                              id="bm-name"
                              type="text"
                              autoComplete="name"
                              value={travelerName}
                              onChange={(e) => setTravelerName(e.target.value)}
                              onBlur={() => markBlurred("travelerName")}
                              placeholder={tx("fNamePh")}
                              aria-invalid={!!fieldError("travelerName")}
                              aria-describedby={describedBy("travelerName")}
                              className={inputBase}
                            />
                          </div>
                          <FieldError id={errorId("travelerName")} message={fieldError("travelerName")} />
                        </div>

                        <div>
                          <Label htmlFor="bm-company">{tx("fCompany")}</Label>
                          <div className="w-full rounded-xl bg-[#071428] border border-white/[0.07] px-4 py-3.5 flex items-center gap-3">
                            <Briefcase className="w-4 h-4 text-slate-600 shrink-0" />
                            <input
                              id="bm-company"
                              type="text"
                              value="Ecopro BM"
                              readOnly
                              tabIndex={-1}
                              className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-white/80 cursor-not-allowed"
                            />
                            <Check className="w-4 h-4 text-emerald-400/80 shrink-0" />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="bm-phone" required>{tx("fPhone")}</Label>
                          <div className={inputShell(!!fieldError("travelerPhone"))}>
                            <Phone className={iconCls(!!fieldError("travelerPhone"))} />
                            <input
                              id="bm-phone"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              value={travelerPhone}
                              onChange={(e) => setTravelerPhone(e.target.value)}
                              onBlur={() => markBlurred("travelerPhone")}
                              placeholder={tx("fPhonePh")}
                              aria-invalid={!!fieldError("travelerPhone")}
                              aria-describedby={describedBy("travelerPhone")}
                              className={inputBase}
                            />
                          </div>
                          <p className="mt-2 text-[12px] text-slate-500">{tx("fPhoneHint")}</p>
                          <FieldError id={errorId("travelerPhone")} message={fieldError("travelerPhone")} />
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl bg-[#071428] border border-white/[0.07] p-5">
                        <div className="flex items-center gap-2.5 mb-4 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-400">
                          <UserPlus className="w-4 h-4 text-[#F5A04A]" />
                          {tx("secondTraveler")}
                          <span className="normal-case tracking-normal font-medium text-slate-500">· {tx("optional")}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bm-email2">{tx("fSecondEmail")}</Label>
                            <div className={inputShell(false)}>
                              <Mail className={iconCls(false)} />
                              <input
                                id="bm-email2"
                                type="email"
                                value={secondTravelerEmail}
                                onChange={(e) => setSecondTravelerEmail(e.target.value)}
                                placeholder={tx("optionalPh")}
                                className={inputBase}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="bm-phone2">{tx("fSecondPhone")}</Label>
                            <div className={inputShell(false)}>
                              <Phone className={iconCls(false)} />
                              <input
                                id="bm-phone2"
                                type="tel"
                                inputMode="tel"
                                value={secondTravelerPhone}
                                onChange={(e) => setSecondTravelerPhone(e.target.value)}
                                placeholder={tx("optionalPh")}
                                className={inputBase}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Step>

                    <Step index={2} title={tx("secService")} subtitle={tx("secServiceSub")}>
                      <div className="space-y-6">
                        <div>
                          <Label required>{tx("fTransferType")}</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label={tx("fTransferType")}>
                            {(
                              [
                                { id: "standard", title: tx("typeStandard"), sub: tx("typeStandardSub") },
                                { id: "executive", title: tx("typeExecutive"), sub: tx("typeExecutiveSub") },
                              ] as { id: TransferType; title: string; sub: string }[]
                            ).map((opt) => {
                              const selected = transferType === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  aria-pressed={selected}
                                  onClick={() => changeTransferType(opt.id)}
                                  className={`relative overflow-hidden text-left rounded-2xl border px-5 py-4 transition-all duration-200 active:scale-[0.99] ${
                                    selected
                                      ? "bg-gradient-to-br from-[#F28C28]/14 to-[#1E73BE]/12 border-[#F28C28]/70 shadow-[0_10px_30px_rgba(242,140,40,0.14)]"
                                      : "bg-[#0B1D38] border-white/10 hover:border-white/25"
                                  }`}
                                >
                                  <span
                                    className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                      selected ? "bg-[#F28C28] border-[#FFB366] text-[#06142B]" : "border-white/20 text-transparent"
                                    }`}
                                  >
                                    <Check className="w-3 h-3" strokeWidth={3} />
                                  </span>
                                  <span className="block text-[16px] font-bold text-white">{opt.title}</span>
                                  <span className="block text-[12px] text-slate-400 mt-0.5">{opt.sub}</span>
                                  <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                    <Users className="w-3.5 h-3.5 text-[#8CC4F5]" />
                                    {tx("upToPax", { n: CONDITIONS.maxPax[opt.id] })}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label required>{tx("fPayment")}</Label>
                          <Segmented<"card" | "bank">
                            label={tx("fPayment")}
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                            options={[
                              { id: "card", label: tx("payCard"), icon: <CreditCard className="w-4 h-4" /> },
                              { id: "bank", label: tx("payBank"), icon: <Building className="w-4 h-4" /> },
                            ]}
                          />
                        </div>
                      </div>
                    </Step>

                    <Step index={3} title={tx("secRoute")} subtitle={tx("secRouteSub")} last>
                      <div className="relative space-y-3">
                        <div className="rounded-2xl bg-[#071428] border border-white/[0.07] p-5 space-y-4">
                          <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#3B93E0] shadow-[0_0_10px_rgba(59,147,224,0.8)]" />
                            {tx("fFrom")}
                          </div>
                          <Segmented<PlaceType>
                            label={tx("fFrom")}
                            value={fromType}
                            onChange={setFromType}
                            options={[
                              { id: "airport", label: tx("typeAirport"), icon: <Plane className="w-4 h-4" /> },
                              { id: "other", label: tx("typeOther"), icon: <Map className="w-4 h-4" /> },
                            ]}
                          />
                          <div>
                            <Label htmlFor="bm-from" required>{tx("fFromAddress")}</Label>
                            <div className={inputShell(!!fieldError("fromAddress"))}>
                              <MapPin className={iconCls(!!fieldError("fromAddress"))} />
                              <input
                                id="bm-from"
                                type="text"
                                value={fromAddress}
                                onChange={(e) => setFromAddress(e.target.value)}
                                onBlur={() => markBlurred("fromAddress")}
                                placeholder={fromType === "airport" ? tx("phFromAirport") : tx("phFromOther")}
                                aria-invalid={!!fieldError("fromAddress")}
                                aria-describedby={describedBy("fromAddress")}
                                className={inputBase}
                              />
                            </div>
                            <FieldError id={errorId("fromAddress")} message={fieldError("fromAddress")} />
                          </div>
                        </div>

                        <div className="flex justify-center -my-1.5 relative z-10" aria-hidden>
                          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#F28C28] to-[#E07510] border-4 border-[#0A1A33] flex items-center justify-center shadow-[0_6px_18px_rgba(242,140,40,0.45)]">
                            <ArrowDown className="w-4 h-4 text-[#06142B]" />
                          </div>
                        </div>

                        <div className="rounded-2xl bg-[#071428] border border-white/[0.07] p-5 space-y-4">
                          <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F28C28] shadow-[0_0_10px_rgba(242,140,40,0.8)]" />
                            {tx("fTo")}
                          </div>
                          <Segmented<PlaceType>
                            label={tx("fTo")}
                            value={toType}
                            onChange={setToType}
                            options={[
                              { id: "airport", label: tx("typeAirport"), icon: <Plane className="w-4 h-4" /> },
                              { id: "other", label: tx("typeOther"), icon: <Map className="w-4 h-4" /> },
                            ]}
                          />
                          <div>
                            <Label htmlFor="bm-to" required>{tx("fToAddress")}</Label>
                            <div className={inputShell(!!fieldError("toAddress"))}>
                              <MapPin className={iconCls(!!fieldError("toAddress"))} />
                              <input
                                id="bm-to"
                                type="text"
                                value={toAddress}
                                onChange={(e) => setToAddress(e.target.value)}
                                onBlur={() => markBlurred("toAddress")}
                                placeholder={toType === "airport" ? tx("phToAirport") : tx("phToOther")}
                                aria-invalid={!!fieldError("toAddress")}
                                aria-describedby={describedBy("toAddress")}
                                className={inputBase}
                              />
                            </div>
                            <FieldError id={errorId("toAddress")} message={fieldError("toAddress")} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Label htmlFor="bm-flight" required>{tx("fFlight")}</Label>
                        <div className={inputShell(!!fieldError("flightNumber"))}>
                          <Plane className={iconCls(!!fieldError("flightNumber"))} />
                          <input
                            id="bm-flight"
                            type="text"
                            autoCapitalize="characters"
                            autoComplete="off"
                            value={flightNumber}
                            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                            onBlur={() => markBlurred("flightNumber")}
                            placeholder={tx("phFlight")}
                            aria-invalid={!!fieldError("flightNumber")}
                            aria-describedby={describedBy("flightNumber")}
                            className={`${inputBase} uppercase tracking-wide`}
                          />
                        </div>
                        <p className="mt-2 text-[12px] text-slate-500">{tx("flightHint")}</p>
                        <FieldError id={errorId("flightNumber")} message={fieldError("flightNumber")} />
                      </div>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <Label htmlFor="bm-date" required>{tx("fDate")}</Label>
                          <div className={inputShell(!!fieldError("pickupDate"))}>
                            <Calendar className={iconCls(!!fieldError("pickupDate"))} />
                            <input
                              id="bm-date"
                              type="date"
                              min={minDate}
                              value={pickupDate}
                              onChange={(e) => setPickupDate(e.target.value)}
                              onBlur={() => markBlurred("pickupDate")}
                              aria-invalid={!!fieldError("pickupDate")}
                              aria-describedby={describedBy("pickupDate")}
                              className={`${inputBase} [color-scheme:dark]`}
                            />
                          </div>
                          <FieldError id={errorId("pickupDate")} message={fieldError("pickupDate")} />
                        </div>
                        <div>
                          <Label htmlFor="bm-time" required>{tx("fTime")}</Label>
                          <div className={inputShell(!!fieldError("pickupTime"))}>
                            <Clock className={iconCls(!!fieldError("pickupTime"))} />
                            <input
                              id="bm-time"
                              type="time"
                              value={pickupTime}
                              onChange={(e) => setPickupTime(e.target.value)}
                              onBlur={() => markBlurred("pickupTime")}
                              aria-invalid={!!fieldError("pickupTime")}
                              aria-describedby={describedBy("pickupTime")}
                              className={`${inputBase} [color-scheme:dark]`}
                            />
                          </div>
                          <FieldError id={errorId("pickupTime")} message={fieldError("pickupTime")} />
                        </div>
                      </div>
                      <p className="mt-2.5 text-[12px] text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {tx("advanceHint", { h: CONDITIONS.minAdvanceHours })}
                      </p>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <Label htmlFor="bm-travelers" required>{tx("fTravelers")}</Label>
                          <Counter
                            id="bm-travelers"
                            icon={<Users className="w-4 h-4" />}
                            value={travelers}
                            min={1}
                            max={maxPax}
                            onChange={changeTravelers}
                            decreaseLabel={tx("decrease")}
                            increaseLabel={tx("increase")}
                          />
                          <p className="mt-2 text-[12px] text-slate-500">{tx("upToPax", { n: maxPax })}</p>
                        </div>
                        <div>
                          <Label htmlFor="bm-luggage" required>{tx("fLuggage")}</Label>
                          <Counter
                            id="bm-luggage"
                            icon={<Luggage className="w-4 h-4" />}
                            value={luggage}
                            min={0}
                            max={maxLuggage}
                            onChange={setLuggage}
                            decreaseLabel={tx("decrease")}
                            increaseLabel={tx("increase")}
                          />
                          <p className="mt-2 text-[12px] text-slate-500">{tx("luggageHint", { n: maxLuggage })}</p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Label htmlFor="bm-comment" optionalText={tx("optional")}>{tx("fComment")}</Label>
                        <div className={`${inputShell(false)} items-start`}>
                          <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-1 group-focus-within:text-[#8CC4F5]" />
                          <textarea
                            id="bm-comment"
                            rows={3}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={tx("phComment")}
                            className={`${inputBase} resize-none`}
                          />
                        </div>
                      </div>
                    </Step>

                    <div className="xl:hidden">{summaryCard}</div>

                    <div className="pt-8 border-t border-white/[0.07]">
                      <button
                        type="submit"
                        disabled={formLoading}
                        className={`w-full rounded-2xl font-bold text-[15px] tracking-wide transition-all duration-300 flex justify-center items-center gap-3 py-4 active:scale-[0.99] ${
                          formLoading
                            ? "bg-[#F28C28]/50 text-[#06142B]/70 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#F28C28] to-[#FFA64D] hover:from-[#FFA64D] hover:to-[#FFB366] text-[#06142B] shadow-[0_12px_32px_rgba(242,140,40,0.38)] hover:shadow-[0_16px_40px_rgba(242,140,40,0.5)]"
                        }`}
                      >
                        {formLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {tx("sending")}
                          </>
                        ) : (
                          <>
                            {tx("submit")}
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      <p className="mt-4 text-center text-[12px] text-slate-500">{tx("submitHint")}</p>
                    </div>
                  </div>
                </motion.form>
              )}
            </div>

            <aside className="hidden xl:block"><div className="sticky top-[112px]">{summaryCard}</div></aside>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#050F20]/80 backdrop-blur py-10 px-6">
        <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="h-9 px-2.5 rounded-lg bg-white flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/pannon-transfer-logo.png" alt="Pannon Transfer" width={387} height={79} className="h-5 w-auto" />
            </div>
            <div className="h-9 px-2.5 rounded-lg bg-white flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/partners/ecoprobm/logo.png" alt="Ecopro BM" width={366} height={81} className="h-4 w-auto" />
            </div>
          </div>
          <div className="text-[12px] text-slate-500 leading-relaxed">
            <div className="text-slate-300 font-medium">
              {tx("needHelp")} Balog Sebastian Máté · {tx("supportRole")}
            </div>
            <div>
              <a href="mailto:balogh.sebastian@pannonguard.hu" className="hover:text-white transition-colors">
                balogh.sebastian@pannonguard.hu
              </a>
              {" · "}
              <a href="tel:+36306654135" className="hover:text-white transition-colors">
                +36 30 665 4135
              </a>
            </div>
            <div className="mt-1 text-slate-600">
              © {year} Pannon Transfer. {tx("rights")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
