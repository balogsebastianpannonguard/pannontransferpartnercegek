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
  Route,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getTravelConditions } from "@/lib/travel-conditions";
import EcoproInnovationPremiumLogin from "./components/EcoproInnovationPremiumLogin";
import {
  EcoBackdrop,
  EcoBootScreen,
  EcoCheckingScreen,
  EcoFooter,
  EcoHeader,
  ecoCard,
  ecoFont,
  ecoGhostBtn,
  ecoPrimaryBtn,
} from "./components/EcoUi";
import {
  formatPickupDate,
  makeT,
  translateServerMessage,
  useEcoLang,
  type EcoKey,
} from "./i18n";

interface EcoPortalUser {
  email: string;
  company?: string;
  role?: string;
}

type TransferType = "standard" | "executive";
type PlaceType = "airport" | "other";

const COMPANY_NAME = "Ecopro Innovation";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONDITIONS = getTravelConditions("ecoproinnovation");

const inputShell = (invalid: boolean) =>
  `group w-full rounded-2xl bg-white border px-4 py-3.5 flex items-center gap-3 transition-all duration-200 ${
    invalid
      ? "border-rose-400 ring-4 ring-rose-100"
      : "border-[#DCEBF7] hover:border-[#0E86D4]/40 focus-within:border-[#0E86D4] focus-within:ring-4 focus-within:ring-[#0E86D4]/12"
  }`;

const inputBase =
  "bg-transparent border-none outline-none w-full text-[15px] font-medium text-[#0B2540] placeholder:text-slate-400";

const iconCls = (invalid: boolean) =>
  `w-4 h-4 shrink-0 transition-colors ${invalid ? "text-rose-500" : "text-slate-400 group-focus-within:text-[#0E86D4]"}`;

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
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0B3F8F] mb-2 pl-0.5">
      <span>{children}</span>
      {required && <span className="text-[#0E86D4]">*</span>}
      {optionalText && <span className="font-medium text-slate-400">· {optionalText}</span>}
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
          className="mt-2 text-[12px] text-rose-600 font-medium flex items-center gap-1.5 overflow-hidden"
        >
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function SectionCard({
  index,
  icon,
  title,
  subtitle,
  children,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${ecoCard} relative overflow-hidden p-6 sm:p-9`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0E86D4] via-[#00B4D8] to-[#7DD3F0]" />
      <div className="flex items-center gap-4 mb-7">
        <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] flex items-center justify-center text-white shadow-[0_10px_24px_rgba(14,134,212,0.35)]">
          {icon}
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-[#DCEBF7] text-[10px] font-black flex items-center justify-center text-[#0B3F8F] shadow-sm">
            {index}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-[#0B2540] font-bold text-[19px] tracking-tight leading-tight">{title}</h2>
          <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>
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
  group,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; icon: React.ReactNode }[];
  label: string;
  group: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#EAF4FB] border border-[#DCEBF7]"
    >
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.id)}
            className={`relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-colors duration-200 ${
              selected ? "text-[#0B3F8F]" : "text-slate-500 hover:text-[#0B3F8F]"
            }`}
          >
            {selected && (
              <motion.span
                layoutId={`seg-${group}`}
                className="absolute inset-0 rounded-xl bg-white shadow-[0_4px_14px_rgba(14,134,212,0.18)] ring-1 ring-[#0E86D4]/20"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {o.icon}
              {o.label}
            </span>
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
    "w-10 h-10 rounded-xl bg-[#F2F8FD] border border-[#DCEBF7] flex items-center justify-center text-[#0B3F8F] transition-all hover:bg-[#E3F1FB] hover:border-[#0E86D4]/40 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-[#F2F8FD]";
  return (
    <div className="w-full rounded-2xl bg-white border border-[#DCEBF7] px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3 pl-1.5 text-slate-400">
        {icon}
        <output id={id} className="text-lg font-bold text-[#0B2540] tabular-nums min-w-6">
          {value}
        </output>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={decreaseLabel}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className={btn}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label={increaseLabel}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className={btn}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 w-8 h-8 shrink-0 rounded-xl bg-[#0E86D4]/10 text-[#0E86D4] flex items-center justify-center">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">{label}</p>
        <div className="text-[13.5px] font-semibold text-[#0B2540] break-words">{children}</div>
      </div>
    </div>
  );
}

export default function EcoproInnovationLandingPage() {
  const router = useRouter();
  const [lang, setLang] = useEcoLang();
  const t = useMemo(() => makeT(lang), [lang]);
  const tx = (key: EcoKey, params?: Record<string, string | number>) => t(key, params);

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<EcoPortalUser | null>(null);
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
    const timer = setTimeout(() => setBootDone(true), 1800);
    return () => clearTimeout(timer);
  }, [authedUser, bootDone]);

  const portalBooting = !!authedUser && !bootDone;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/ecoproinnovation-auth/session", { cache: "no-store" });
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/ecoproinnovation-auth/logout", { method: "POST" });
    } catch {}
    setAuthedUser(null);
    setBootDone(false);
  };

  const maxPax = CONDITIONS.maxPax[transferType];
  const maxLuggage = travelers * CONDITIONS.maxLuggagePerPax[transferType];

  const changeTransferType = (next: TransferType) => {
    setTransferType(next);
    const nextMaxPax = CONDITIONS.maxPax[next];
    const nextTravelers = Math.min(travelers, nextMaxPax);
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
        companyName: COMPANY_NAME,
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
        headers: {
          "Content-Type": "application/json",
          "x-partner-portal": "ecoproinnovation",
        },
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
        router.push("/ecoproinnovation/auth");
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
    if (token.startsWith("srv:")) return translateServerMessage(token.slice(4), lang);
    if (token.startsWith("i18n:")) return tx(token.slice(5) as EcoKey);
    return token;
  };

  const minDate = useMemo(() => todayLocal(), []);

  if (!authChecked) return <EcoCheckingScreen lang={lang} />;

  if (!authedUser) return <EcoproInnovationPremiumLogin _onSuccess={setAuthedUser} />;

  if (portalBooting) return <EcoBootScreen lang={lang} label={tx("preparing")} />;

  const errorId = (key: string) => `err-${key}`;
  const describedBy = (key: string) => (fieldError(key) ? errorId(key) : undefined);

  const dash = <span className="text-slate-400 font-medium">{tx("sumEmpty")}</span>;
  const whenText =
    pickupDate || pickupTime
      ? `${pickupDate ? formatPickupDate(pickupDate, lang) : "—"}${pickupTime ? ` · ${pickupTime}` : ""}`
      : null;

  return (
    <div
      className="min-h-screen text-[#0B2540] font-sans selection:bg-[#0E86D4]/20 relative overflow-x-hidden"
      style={ecoFont(lang)}
    >
      <EcoBackdrop />

      <EcoHeader
        lang={lang}
        onLangChange={setLang}
        email={authedUser.email}
        active="booking"
        onLogout={handleLogout}
        scrolled={scrolled}
      />

      <main id="booking" className="relative z-10 pt-[120px] lg:pt-[96px] pb-24 px-4 sm:px-6">
        <div className="max-w-[1120px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0B3F8F] via-[#0E86D4] to-[#00B4D8] px-6 sm:px-12 py-10 sm:py-14 text-white shadow-[0_30px_80px_rgba(14,134,212,0.35)] mb-8"
          >
            <div className="absolute -top-24 -right-16 w-[380px] h-[380px] rounded-full bg-white/10 blur-sm" />
            <div className="absolute -bottom-32 left-[18%] w-[320px] h-[320px] rounded-full bg-[#00E0F5]/20 blur-2xl" />
            <svg
              className="absolute right-0 top-0 h-full w-[56%] max-w-[560px] opacity-70 hidden sm:block"
              viewBox="0 0 560 280"
              fill="none"
              aria-hidden
            >
              <motion.path
                d="M20 240 C 160 40, 360 20, 520 90"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2"
                strokeDasharray="4 8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, ease: "easeInOut", delay: 0.3 }}
              />
              <circle cx="20" cy="240" r="7" fill="white" />
              <circle cx="520" cy="90" r="7" fill="white" fillOpacity="0.9" />
              <circle cx="520" cy="90" r="16" stroke="white" strokeOpacity="0.4" />
            </svg>
            <div className="relative max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur text-[11px] font-bold tracking-[0.2em] uppercase mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                {tx("heroEyebrow")}
              </div>
              <h1 className="text-[32px] sm:text-[46px] font-bold tracking-tight leading-[1.08]">{tx("heroTitle")}</h1>
              <p className="mt-4 text-[15px] sm:text-[16px] text-white/85 leading-relaxed">{tx("heroSubtitle")}</p>
            </div>
          </motion.div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`${ecoCard} relative overflow-hidden max-w-[760px] mx-auto`}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-[#00B4D8] to-[#0E86D4]" />
              <div className="p-8 sm:p-14 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -120 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200 shadow-[0_12px_40px_rgba(16,185,129,0.25)] mb-8"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={2.2} />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2540] tracking-tight mb-3">{tx("okTitle")}</h2>
                <p className="text-slate-500 text-[15px] mb-8">{tx("okSub")}</p>

                <div className="mb-8">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2 block">
                    {tx("okCode")}
                  </span>
                  <div className="inline-flex items-center px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#0E86D4]/10 to-[#00B4D8]/10 border border-[#0E86D4]/25">
                    <span className="text-3xl sm:text-4xl font-black text-[#0B3F8F] tracking-wider font-mono">
                      #{lastBookingCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 max-w-md mb-10 p-4 rounded-2xl bg-[#F2F8FD] border border-[#DCEBF7] text-left">
                  <ShieldCheck className="w-4 h-4 text-[#0E86D4] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-600 leading-relaxed">{tx("okNote")}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => router.push("/ecoproinnovation/bookings")}
                    className={`${ecoPrimaryBtn} py-3.5 px-5 text-sm`}
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
                    className={`${ecoGhostBtn} py-3.5 px-5 text-sm`}
                  >
                    <Plus className="w-4 h-4" />
                    {tx("okNew")}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
              <motion.form
                onSubmit={handleSubmit}
                noValidate
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 min-w-0"
              >
                <div className="rounded-2xl bg-white/80 backdrop-blur border border-[#DCEBF7] px-5 py-4">
                  <div className="flex items-center justify-between text-[12px] font-semibold mb-2.5">
                    <span className="text-slate-500">{tx("progress")}</span>
                    <span className="tabular-nums text-[#0B3F8F]">
                      {validKeys.length}/{requiredTotal}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full bg-[#E3F1FB] overflow-hidden"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progressPct}
                    aria-label={tx("progress")}
                  >
                    <motion.div
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-[#0E86D4] to-[#00B4D8]"
                    />
                  </div>
                </div>

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
                      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                            <XCircle className="w-4 h-4 text-rose-600" />
                          </div>
                          <p className="text-[14px] font-bold text-rose-700">{tx("errFixTitle")}</p>
                        </div>
                        <ul className="space-y-1.5 pl-11">
                          {submitErrors.map((err, idx) => (
                            <li key={idx} className="text-[13px] text-rose-700/90 flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                              <span>{renderSubmitError(err)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 1 — Traveler & company */}
                <SectionCard
                  index={1}
                  icon={<Users className="w-5 h-5" />}
                  title={tx("secTraveler")}
                  subtitle={tx("secTravelerSub")}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="eco-email" required>{tx("fEmail")}</Label>
                      <div className={inputShell(!!fieldError("travelerEmail"))}>
                        <Mail className={iconCls(!!fieldError("travelerEmail"))} />
                        <input
                          id="eco-email"
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
                      <Label htmlFor="eco-name" required>{tx("fName")}</Label>
                      <div className={inputShell(!!fieldError("travelerName"))}>
                        <Users className={iconCls(!!fieldError("travelerName"))} />
                        <input
                          id="eco-name"
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
                      <Label htmlFor="eco-company">{tx("fCompany")}</Label>
                      <div className="w-full rounded-2xl bg-[#F2F8FD] border border-[#DCEBF7] px-4 py-3.5 flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                          id="eco-company"
                          type="text"
                          value={COMPANY_NAME}
                          readOnly
                          tabIndex={-1}
                          className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-[#0B3F8F] cursor-not-allowed"
                        />
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="eco-phone" required>{tx("fPhone")}</Label>
                      <div className={inputShell(!!fieldError("travelerPhone"))}>
                        <Phone className={iconCls(!!fieldError("travelerPhone"))} />
                        <input
                          id="eco-phone"
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
                      <p className="mt-2 text-[12px] text-slate-400">{tx("fPhoneHint")}</p>
                      <FieldError id={errorId("travelerPhone")} message={fieldError("travelerPhone")} />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#F2F8FD] border border-[#DCEBF7] p-5">
                    <div className="flex items-center gap-2.5 mb-4 text-[12px] font-bold tracking-[0.12em] uppercase text-[#0B3F8F]">
                      <UserPlus className="w-4 h-4 text-[#0E86D4]" />
                      {tx("secondTraveler")}
                      <span className="normal-case tracking-normal font-medium text-slate-400">· {tx("optional")}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="eco-email2">{tx("fSecondEmail")}</Label>
                        <div className={inputShell(false)}>
                          <Mail className={iconCls(false)} />
                          <input
                            id="eco-email2"
                            type="email"
                            value={secondTravelerEmail}
                            onChange={(e) => setSecondTravelerEmail(e.target.value)}
                            placeholder={tx("optionalPh")}
                            className={inputBase}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="eco-phone2">{tx("fSecondPhone")}</Label>
                        <div className={inputShell(false)}>
                          <Phone className={iconCls(false)} />
                          <input
                            id="eco-phone2"
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
                </SectionCard>

                {/* 2 — Service & payment */}
                <SectionCard
                  index={2}
                  icon={<CreditCard className="w-5 h-5" />}
                  title={tx("secService")}
                  subtitle={tx("secServiceSub")}
                >
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
                              className={`relative text-left rounded-2xl border px-5 py-4 transition-all duration-200 active:scale-[0.99] ${
                                selected
                                  ? "bg-gradient-to-br from-[#0E86D4]/10 to-[#00B4D8]/10 border-[#0E86D4] shadow-[0_10px_28px_rgba(14,134,212,0.18)] ring-4 ring-[#0E86D4]/10"
                                  : "bg-white border-[#DCEBF7] hover:border-[#0E86D4]/40 hover:shadow-md"
                              }`}
                            >
                              <span
                                className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  selected
                                    ? "bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] border-transparent text-white"
                                    : "border-slate-300 text-transparent"
                                }`}
                              >
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </span>
                              <span className="block text-[16px] font-bold text-[#0B2540]">{opt.title}</span>
                              <span className="block text-[12px] text-slate-500 mt-0.5">{opt.sub}</span>
                              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0B3F8F]">
                                <Users className="w-3.5 h-3.5 text-[#0E86D4]" />
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
                        group="payment"
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
                </SectionCard>

                {/* 3 — Route & schedule */}
                <SectionCard
                  index={3}
                  icon={<MapPin className="w-5 h-5" />}
                  title={tx("secRoute")}
                  subtitle={tx("secRouteSub")}
                >
                  <div className="relative space-y-3">
                    <div className="rounded-2xl bg-[#F2F8FD] border border-[#DCEBF7] p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.12em] uppercase text-[#0B3F8F]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0E86D4] ring-4 ring-[#0E86D4]/20" />
                        {tx("fFrom")}
                      </div>
                      <Segmented<PlaceType>
                        group="from"
                        label={tx("fFrom")}
                        value={fromType}
                        onChange={setFromType}
                        options={[
                          { id: "airport", label: tx("typeAirport"), icon: <Plane className="w-4 h-4" /> },
                          { id: "other", label: tx("typeOther"), icon: <Map className="w-4 h-4" /> },
                        ]}
                      />
                      <div>
                        <Label htmlFor="eco-from" required>{tx("fFromAddress")}</Label>
                        <div className={inputShell(!!fieldError("fromAddress"))}>
                          <MapPin className={iconCls(!!fieldError("fromAddress"))} />
                          <input
                            id="eco-from"
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
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] border-4 border-white flex items-center justify-center shadow-[0_6px_18px_rgba(14,134,212,0.4)]">
                        <ArrowDown className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#F2F8FD] border border-[#DCEBF7] p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.12em] uppercase text-[#0B3F8F]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00B4D8] ring-4 ring-[#00B4D8]/20" />
                        {tx("fTo")}
                      </div>
                      <Segmented<PlaceType>
                        group="to"
                        label={tx("fTo")}
                        value={toType}
                        onChange={setToType}
                        options={[
                          { id: "airport", label: tx("typeAirport"), icon: <Plane className="w-4 h-4" /> },
                          { id: "other", label: tx("typeOther"), icon: <Map className="w-4 h-4" /> },
                        ]}
                      />
                      <div>
                        <Label htmlFor="eco-to" required>{tx("fToAddress")}</Label>
                        <div className={inputShell(!!fieldError("toAddress"))}>
                          <MapPin className={iconCls(!!fieldError("toAddress"))} />
                          <input
                            id="eco-to"
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
                    <Label htmlFor="eco-flight" required>{tx("fFlight")}</Label>
                    <div className={inputShell(!!fieldError("flightNumber"))}>
                      <Plane className={iconCls(!!fieldError("flightNumber"))} />
                      <input
                        id="eco-flight"
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
                    <p className="mt-2 text-[12px] text-slate-400">{tx("flightHint")}</p>
                    <FieldError id={errorId("flightNumber")} message={fieldError("flightNumber")} />
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="eco-date" required>{tx("fDate")}</Label>
                      <div className={inputShell(!!fieldError("pickupDate"))}>
                        <Calendar className={iconCls(!!fieldError("pickupDate"))} />
                        <input
                          id="eco-date"
                          type="date"
                          min={minDate}
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          onBlur={() => markBlurred("pickupDate")}
                          aria-invalid={!!fieldError("pickupDate")}
                          aria-describedby={describedBy("pickupDate")}
                          className={inputBase}
                        />
                      </div>
                      <FieldError id={errorId("pickupDate")} message={fieldError("pickupDate")} />
                    </div>
                    <div>
                      <Label htmlFor="eco-time" required>{tx("fTime")}</Label>
                      <div className={inputShell(!!fieldError("pickupTime"))}>
                        <Clock className={iconCls(!!fieldError("pickupTime"))} />
                        <input
                          id="eco-time"
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          onBlur={() => markBlurred("pickupTime")}
                          aria-invalid={!!fieldError("pickupTime")}
                          aria-describedby={describedBy("pickupTime")}
                          className={inputBase}
                        />
                      </div>
                      <FieldError id={errorId("pickupTime")} message={fieldError("pickupTime")} />
                    </div>
                  </div>
                  <p className="mt-2.5 text-[12px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {tx("advanceHint", { h: CONDITIONS.minAdvanceHours })}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="eco-travelers" required>{tx("fTravelers")}</Label>
                      <Counter
                        id="eco-travelers"
                        icon={<Users className="w-4 h-4" />}
                        value={travelers}
                        min={1}
                        max={maxPax}
                        onChange={changeTravelers}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 text-[12px] text-slate-400">{tx("upToPax", { n: maxPax })}</p>
                    </div>
                    <div>
                      <Label htmlFor="eco-luggage" required>{tx("fLuggage")}</Label>
                      <Counter
                        id="eco-luggage"
                        icon={<Luggage className="w-4 h-4" />}
                        value={luggage}
                        min={0}
                        max={maxLuggage}
                        onChange={setLuggage}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 text-[12px] text-slate-400">{tx("luggageHint", { n: maxLuggage })}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="eco-comment" optionalText={tx("optional")}>{tx("fComment")}</Label>
                    <div className={`${inputShell(false)} items-start`}>
                      <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-1 group-focus-within:text-[#0E86D4]" />
                      <textarea
                        id="eco-comment"
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={tx("phComment")}
                        className={`${inputBase} resize-none`}
                      />
                    </div>
                  </div>
                </SectionCard>

                <div className={`${ecoCard} p-6 sm:p-8`}>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`${ecoPrimaryBtn} w-full py-4 text-[15px] tracking-wide gap-3`}
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
                  <p className="mt-4 text-center text-[12px] text-slate-400">{tx("submitHint")}</p>
                </div>
              </motion.form>

              <aside className="hidden xl:block sticky top-[96px]">
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className={`${ecoCard} p-6 space-y-5`}
                >
                  <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.16em] uppercase text-[#0B3F8F]">
                    <Route className="w-4 h-4 text-[#0E86D4]" />
                    {tx("sumTitle")}
                  </div>
                  <SummaryRow icon={<MapPin className="w-4 h-4" />} label={tx("sumFrom")}>
                    {fromAddress.trim() || dash}
                  </SummaryRow>
                  <SummaryRow icon={<MapPin className="w-4 h-4" />} label={tx("sumTo")}>
                    {toAddress.trim() || dash}
                  </SummaryRow>
                  <SummaryRow icon={<Calendar className="w-4 h-4" />} label={tx("sumWhen")}>
                    {whenText || dash}
                  </SummaryRow>
                  <SummaryRow icon={<Plane className="w-4 h-4" />} label={tx("fFlight")}>
                    {flightNumber.trim() || dash}
                  </SummaryRow>
                  <div className="grid grid-cols-2 gap-4">
                    <SummaryRow icon={<Users className="w-4 h-4" />} label={tx("sumPax")}>
                      {travelers}
                    </SummaryRow>
                    <SummaryRow icon={<Luggage className="w-4 h-4" />} label={tx("sumBags")}>
                      {luggage}
                    </SummaryRow>
                  </div>
                  <SummaryRow icon={<Sparkles className="w-4 h-4" />} label={tx("sumClass")}>
                    {transferType === "executive" ? tx("typeExecutive") : tx("typeStandard")}
                  </SummaryRow>
                </motion.div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <EcoFooter lang={lang} />
    </div>
  );
}
