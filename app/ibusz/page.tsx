"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Briefcase,
  Building,
  Building2,
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
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getTravelConditions } from "@/lib/travel-conditions";
import IbuszPremiumLogin from "./components/IbuszPremiumLogin";
import IbuszBookingHeader from "./components/IbuszBookingHeader";
import {
  HeroBackdrop,
  IbuszLogo,
  LogoPair,
  PannonChip,
  SupportCard,
} from "./components/IbuszBrand";
import { useIbuszLang } from "./lang";
import { ibText, translateIbuszServerMessage, type IbuszKey } from "./i18n";

interface IbuszPortalUser {
  email: string;
  company?: string;
  role?: string;
}

type TransferType = "standard" | "executive";
type PlaceType = "airport" | "other";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONDITIONS = getTravelConditions("ibusz");

const inputShell = (invalid: boolean) =>
  `group w-full rounded-2xl bg-white border px-4 py-3.5 flex items-center gap-3 transition-all duration-200 shadow-[0_1px_2px_rgba(15,34,56,0.03)] ${
    invalid
      ? "border-red-400 ring-4 ring-red-500/10"
      : "border-slate-200 hover:border-slate-300 focus-within:border-[#004A8D] focus-within:ring-4 focus-within:ring-[#004A8D]/10"
  }`;

const inputBase =
  "bg-transparent border-none outline-none w-full text-[15px] font-medium text-slate-900 placeholder:text-slate-400";

const iconCls = (invalid: boolean) =>
  `w-4 h-4 shrink-0 transition-colors ${
    invalid ? "text-red-500" : "text-slate-400 group-focus-within:text-[#004A8D]"
  }`;

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
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-slate-500 mb-2"
    >
      <span>{children}</span>
      {required && <span className="text-[#F39200]">*</span>}
      {optionalText && (
        <span className="normal-case tracking-normal font-medium text-slate-400">
          · {optionalText}
        </span>
      )}
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
          className="mt-2 text-[12px] text-red-600 font-medium flex items-center gap-1.5 overflow-hidden"
        >
          <XCircle className="w-3.5 h-3.5 shrink-0" />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function SectionHeader({
  index,
  icon,
  title,
  subtitle,
}: {
  index: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-7">
      <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#004A8D] to-[#0C6BB5] flex items-center justify-center text-white shadow-[0_10px_24px_rgba(0,74,141,0.28)]">
        {icon}
        <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F39200] border-2 border-white text-[11px] font-black flex items-center justify-center text-white shadow-sm">
          {index}
        </span>
      </div>
      <div className="min-w-0">
        <h2 className="text-slate-900 font-semibold text-lg tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
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
    <div
      role="group"
      aria-label={label}
      className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/70"
    >
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.id)}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              selected
                ? "bg-white text-[#004A8D] shadow-[0_2px_8px_rgba(15,34,56,0.12)] ring-1 ring-[#004A8D]/15"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className={selected ? "text-[#F39200]" : ""}>{o.icon}</span>
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
    "w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#004A8D] transition-all hover:bg-[#004A8D] hover:border-[#004A8D] hover:text-white active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-slate-50 disabled:hover:text-[#004A8D] disabled:hover:border-slate-200";
  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200 px-3 py-2.5 flex items-center justify-between shadow-[0_1px_2px_rgba(15,34,56,0.03)]">
      <div className="flex items-center gap-3 pl-1.5 text-slate-400">
        {icon}
        <output
          id={id}
          className="text-xl font-bold text-slate-900 tabular-nums min-w-6"
        >
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

export default function IbuszLandingPage() {
  const router = useRouter();

  const [lang, setLang] = useIbuszLang();
  const tx = (key: IbuszKey, params?: Record<string, string | number>) =>
    ibText(lang, key, params);

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<IbuszPortalUser | null>(null);
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
    document.documentElement.lang = lang;
  }, [lang]);

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
        const res = await fetch("/api/ibusz-auth/session", { cache: "no-store" });
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.user) {
            setAuthedUser(json.user);
          }
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
      await fetch("/api/ibusz-auth/logout", { method: "POST" });
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
    setLuggage((l) =>
      Math.min(l, nextTravelers * CONDITIONS.maxLuggagePerPax[next]),
    );
  };

  const changeTravelers = (next: number) => {
    setTravelers(next);
    setLuggage((l) =>
      Math.min(l, next * CONDITIONS.maxLuggagePerPax[transferType]),
    );
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
    if (key === "travelerEmail" && !EMAIL_REGEX.test(value)) {
      return tx("errEmail");
    }
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

  const markBlurred = (key: string) =>
    setBlurred((prev) => ({ ...prev, [key]: true }));

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
        companyName: "IBUSZ Hungary Kft.",
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
          "x-partner-portal": "ibusz",
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
        router.push("/ibusz/auth");
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
    if (token.startsWith("field:")) {
      return fieldError(token.slice(6), true) || "";
    }
    if (token.startsWith("srv:")) {
      return translateIbuszServerMessage(lang, token.slice(4));
    }
    if (token.startsWith("i18n:")) return tx(token.slice(5) as IbuszKey);
    return token;
  };

  const minDate = useMemo(() => todayLocal(), []);
  const year = new Date().getFullYear();

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col">
        <div className="w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
            <PannonChip className="h-6" />
            <span className="w-px h-6 bg-slate-200" />
            <IbuszLogo className="h-7" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center py-20 gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#004A8D]/[0.08] border border-[#004A8D]/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#004A8D] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-[#F39200]"
              />
              <p className="text-[14px] text-slate-600 font-semibold tracking-wide">
                {tx("checkingAccess")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <IbuszPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#00386B] via-[#004A8D] to-[#0C6BB5] flex flex-col items-center justify-center overflow-hidden font-sans">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          className="absolute -right-24 -top-24 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,194,77,0.95),rgba(243,146,0,0.55)_45%,transparent_70%)]"
        />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <LogoPair size="lg" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-[11px] tracking-[0.4em] uppercase text-white/70 font-semibold"
          >
            {tx("premiumTag")}
          </motion.p>
          <div className="mt-12 w-64">
            <div className="h-[3px] w-full bg-white/15 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.3, ease: [0.7, 0, 0.3, 1], delay: 0.35 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#F39200] to-[#FFC24D]"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 text-center text-[10px] tracking-[0.25em] text-[#FFC24D] uppercase font-bold"
            >
              {tx("preparing")}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const errorId = (key: string) => `err-${key}`;
  const describedBy = (key: string) =>
    fieldError(key) ? errorId(key) : undefined;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-700 font-sans selection:bg-[#F39200]/25 relative overflow-x-hidden">
      <HeroBackdrop height={460} />

      <IbuszBookingHeader
        lang={lang}
        onLangChange={setLang}
        email={authedUser.email}
        scrolled={scrolled}
        active="booking"
        onLogout={handleLogout}
      />

      <main
        id="booking"
        className="relative z-10 pt-[120px] lg:pt-32 pb-24 px-4 sm:px-6"
      >
        <div className="max-w-[780px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-14 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/25 backdrop-blur text-[11px] font-bold tracking-[0.2em] uppercase text-white mb-5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC24D]" />
              {tx("heroEyebrow")}
            </div>
            <h1 className="text-[34px] sm:text-[46px] font-semibold tracking-tight text-white leading-[1.08]">
              {tx("heroTitle")}
            </h1>
            <p className="mt-4 text-[15px] sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
              {tx("heroSubtitle")}
            </p>
          </motion.div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[28px] bg-white border border-slate-200/80 shadow-[0_30px_80px_rgba(15,34,56,0.14)]"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#004A8D] via-[#0C6BB5] to-[#F39200]" />
              <div className="p-8 sm:p-14 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -120 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200 shadow-[0_10px_40px_rgba(16,185,129,0.2)] mb-8"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" strokeWidth={2.2} />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-3">
                  {tx("okTitle")}
                </h2>
                <p className="text-slate-500 text-[15px] mb-8">{tx("okSub")}</p>

                <div className="mb-8">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2 block">
                    {tx("okCode")}
                  </span>
                  <div className="inline-flex items-center px-7 py-3.5 rounded-2xl bg-[#E8F1FA] border border-[#004A8D]/15">
                    <span className="text-3xl sm:text-4xl font-black text-[#004A8D] tracking-wider font-mono">
                      #{lastBookingCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 max-w-md mb-10 p-4 rounded-2xl bg-[#FFF3DF] border border-[#F39200]/25 text-left">
                  <ShieldCheck className="w-4 h-4 text-[#C77700] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    {tx("okNote")}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => router.push("/ibusz/bookings")}
                    className="py-3.5 px-5 rounded-2xl bg-[#004A8D] hover:bg-[#00386B] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,74,141,0.3)] active:scale-[0.98]"
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
                    className="py-3.5 px-5 rounded-2xl bg-white border border-slate-200 hover:border-[#F39200] hover:text-[#C77700] text-slate-800 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
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
              className="relative overflow-hidden rounded-[28px] bg-white border border-slate-200/80 shadow-[0_30px_80px_rgba(15,34,56,0.14)]"
            >
              <div className="px-6 sm:px-10 pt-6 pb-5 border-b border-slate-100 bg-gradient-to-b from-[#F8FBFE] to-white">
                <div className="flex items-center justify-between text-[12px] font-medium mb-2.5">
                  <span className="text-slate-500">{tx("progress")}</span>
                  <span className="tabular-nums text-[#004A8D] font-bold">
                    {validKeys.length}/{requiredTotal}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full bg-slate-100 overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                  aria-label={tx("progress")}
                >
                  <motion.div
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#004A8D] via-[#0C6BB5] to-[#F39200]"
                  />
                </div>
              </div>

              <div className="px-6 sm:px-10 py-9 space-y-12">
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
                      <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <XCircle className="w-4 h-4 text-red-500" />
                          </div>
                          <p className="text-[14px] font-semibold text-red-700">
                            {tx("errFixTitle")}
                          </p>
                        </div>
                        <ul className="space-y-1.5 pl-11">
                          {submitErrors.map((err, idx) => (
                            <li
                              key={idx}
                              className="text-[13px] text-red-700/90 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                              <span>{renderSubmitError(err)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 1 — Traveler & company */}
                <section aria-labelledby="sec-traveler">
                  <div id="sec-traveler">
                    <SectionHeader
                      index={1}
                      icon={<Users className="w-5 h-5" />}
                      title={tx("secTraveler")}
                      subtitle={tx("secTravelerSub")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="ib-email" required>{tx("fEmail")}</Label>
                      <div className={inputShell(!!fieldError("travelerEmail"))}>
                        <Mail className={iconCls(!!fieldError("travelerEmail"))} />
                        <input
                          id="ib-email"
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
                      <Label htmlFor="ib-name" required>{tx("fName")}</Label>
                      <div className={inputShell(!!fieldError("travelerName"))}>
                        <Users className={iconCls(!!fieldError("travelerName"))} />
                        <input
                          id="ib-name"
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
                      <Label htmlFor="ib-company">{tx("fCompany")}</Label>
                      <div className="w-full rounded-2xl bg-[#E8F1FA]/60 border border-[#004A8D]/15 px-4 py-3.5 flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-[#004A8D]/70 shrink-0" />
                        <input
                          id="ib-company"
                          type="text"
                          value="IBUSZ Hungary Kft."
                          readOnly
                          tabIndex={-1}
                          className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-[#004A8D] cursor-not-allowed"
                        />
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="ib-phone" required>{tx("fPhone")}</Label>
                      <div className={inputShell(!!fieldError("travelerPhone"))}>
                        <Phone className={iconCls(!!fieldError("travelerPhone"))} />
                        <input
                          id="ib-phone"
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

                  <div className="mt-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 p-5">
                    <div className="flex items-center gap-2.5 mb-4 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-500">
                      <UserPlus className="w-4 h-4 text-[#F39200]" />
                      {tx("secondTraveler")}
                      <span className="normal-case tracking-normal font-medium text-slate-400">
                        · {tx("optional")}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ib-email2">{tx("fSecondEmail")}</Label>
                        <div className={inputShell(false)}>
                          <Mail className={iconCls(false)} />
                          <input
                            id="ib-email2"
                            type="email"
                            value={secondTravelerEmail}
                            onChange={(e) => setSecondTravelerEmail(e.target.value)}
                            placeholder={tx("optionalPh")}
                            className={inputBase}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="ib-phone2">{tx("fSecondPhone")}</Label>
                        <div className={inputShell(false)}>
                          <Phone className={iconCls(false)} />
                          <input
                            id="ib-phone2"
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
                </section>

                {/* 2 — Service & payment */}
                <section aria-labelledby="sec-service">
                  <div id="sec-service">
                    <SectionHeader
                      index={2}
                      icon={<CreditCard className="w-5 h-5" />}
                      title={tx("secService")}
                      subtitle={tx("secServiceSub")}
                    />
                  </div>

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
                              className={`relative text-left rounded-2xl border-2 px-5 py-4 transition-all duration-200 active:scale-[0.99] ${
                                selected
                                  ? "bg-[#E8F1FA] border-[#004A8D] shadow-[0_10px_26px_rgba(0,74,141,0.14)]"
                                  : "bg-white border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <span
                                className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  selected
                                    ? "bg-[#F39200] border-[#F39200] text-white"
                                    : "border-slate-300 text-transparent"
                                }`}
                              >
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </span>
                              <span className="block text-[16px] font-bold text-slate-900">{opt.title}</span>
                              <span className="block text-[12px] text-slate-500 mt-0.5">{opt.sub}</span>
                              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                <Users className="w-3.5 h-3.5 text-[#004A8D]" />
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
                </section>

                {/* 3 — Route & schedule */}
                <section aria-labelledby="sec-route">
                  <div id="sec-route">
                    <SectionHeader
                      index={3}
                      icon={<MapPin className="w-5 h-5" />}
                      title={tx("secRoute")}
                      subtitle={tx("secRouteSub")}
                    />
                  </div>

                  <div className="relative space-y-3">
                    <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-[#F39200] ring-4 ring-[#F39200]/20" />
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
                        <Label htmlFor="ib-from" required>{tx("fFromAddress")}</Label>
                        <div className={inputShell(!!fieldError("fromAddress"))}>
                          <MapPin className={iconCls(!!fieldError("fromAddress"))} />
                          <input
                            id="ib-from"
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
                      <div className="w-9 h-9 rounded-full bg-[#004A8D] border-4 border-white flex items-center justify-center shadow-[0_6px_18px_rgba(0,74,141,0.35)]">
                        <ArrowDown className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-[#004A8D] ring-4 ring-[#004A8D]/15" />
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
                        <Label htmlFor="ib-to" required>{tx("fToAddress")}</Label>
                        <div className={inputShell(!!fieldError("toAddress"))}>
                          <MapPin className={iconCls(!!fieldError("toAddress"))} />
                          <input
                            id="ib-to"
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
                    <Label htmlFor="ib-flight" required>{tx("fFlight")}</Label>
                    <div className={inputShell(!!fieldError("flightNumber"))}>
                      <Plane className={iconCls(!!fieldError("flightNumber"))} />
                      <input
                        id="ib-flight"
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
                      <Label htmlFor="ib-date" required>{tx("fDate")}</Label>
                      <div className={inputShell(!!fieldError("pickupDate"))}>
                        <Calendar className={iconCls(!!fieldError("pickupDate"))} />
                        <input
                          id="ib-date"
                          type="date"
                          min={minDate}
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          onBlur={() => markBlurred("pickupDate")}
                          aria-invalid={!!fieldError("pickupDate")}
                          aria-describedby={describedBy("pickupDate")}
                          className={`${inputBase} [color-scheme:light]`}
                        />
                      </div>
                      <FieldError id={errorId("pickupDate")} message={fieldError("pickupDate")} />
                    </div>
                    <div>
                      <Label htmlFor="ib-time" required>{tx("fTime")}</Label>
                      <div className={inputShell(!!fieldError("pickupTime"))}>
                        <Clock className={iconCls(!!fieldError("pickupTime"))} />
                        <input
                          id="ib-time"
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          onBlur={() => markBlurred("pickupTime")}
                          aria-invalid={!!fieldError("pickupTime")}
                          aria-describedby={describedBy("pickupTime")}
                          className={`${inputBase} [color-scheme:light]`}
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
                      <Label htmlFor="ib-travelers" required>{tx("fTravelers")}</Label>
                      <Counter
                        id="ib-travelers"
                        icon={<Users className="w-4 h-4" />}
                        value={travelers}
                        min={1}
                        max={maxPax}
                        onChange={changeTravelers}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 text-[12px] text-slate-400">
                        {tx("upToPax", { n: maxPax })}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="ib-luggage" required>{tx("fLuggage")}</Label>
                      <Counter
                        id="ib-luggage"
                        icon={<Luggage className="w-4 h-4" />}
                        value={luggage}
                        min={0}
                        max={maxLuggage}
                        onChange={setLuggage}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 text-[12px] text-slate-400">
                        {tx("luggageHint", { n: maxLuggage })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="ib-comment" optionalText={tx("optional")}>
                      {tx("fComment")}
                    </Label>
                    <div className={`${inputShell(false)} items-start`}>
                      <MessageSquare className={`${iconCls(false)} mt-1`} />
                      <textarea
                        id="ib-comment"
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={tx("phComment")}
                        className={`${inputBase} resize-none`}
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-8 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`group w-full rounded-2xl font-semibold text-[15px] tracking-wide transition-all duration-300 flex justify-center items-center gap-3 py-4 active:scale-[0.99] ${
                      formLoading
                        ? "bg-[#004A8D]/70 text-white/80 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#004A8D] to-[#0C6BB5] hover:from-[#00386B] hover:to-[#004A8D] text-white shadow-[0_14px_32px_rgba(0,74,141,0.35)] hover:shadow-[0_18px_40px_rgba(0,74,141,0.45)]"
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
                        <span className="w-7 h-7 rounded-full bg-[#F39200] flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </span>
                      </>
                    )}
                  </button>
                  <p className="mt-4 text-center text-[12px] text-slate-400">
                    {tx("submitHint")}
                  </p>
                </div>
              </div>
            </motion.form>
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white py-10 px-6">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <PannonChip className="h-6" />
            <span className="w-px h-7 bg-slate-200" />
            <IbuszLogo className="h-8" />
          </div>
          <div className="w-full md:w-auto md:max-w-md">
            <SupportCard title={tx("needHelp")} role={tx("supportRole")} />
            <div className="mt-3 text-[11px] text-slate-400">
              © {year} Pannon Transfer. {tx("rights")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
