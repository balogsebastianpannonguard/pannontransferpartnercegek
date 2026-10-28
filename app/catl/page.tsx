"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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
import CatlPremiumLogin from "./components/CatlPremiumLogin";
import CatlBookingHeader from "./components/CatlBookingHeader";
import {
  CATL_LANG_STORAGE_KEY,
  catlText,
  translateCatlServerMessage,
  type CatlLang,
} from "./booking-i18n";

interface CatlPortalUser {
  email: string;
  company?: string;
  role?: string;
}

type TransferType = "standard" | "executive";
type PlaceType = "airport" | "other";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONDITIONS = getTravelConditions("catl");

const inputShell = (invalid: boolean) =>
  `group w-full rounded-xl bg-[#0F1829] border px-4 py-3.5 flex items-center gap-3 transition-all duration-200 ${
    invalid
      ? "border-red-500/60 ring-4 ring-red-500/10"
      : "border-white/10 hover:border-white/20 focus-within:border-[#2F7BE0] focus-within:ring-4 focus-within:ring-[#0047BA]/20"
  }`;

const inputBase =
  "bg-transparent border-none outline-none w-full text-[15px] font-medium text-white placeholder:text-slate-500";

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
      className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-slate-400 mb-2"
    >
      <span>{children}</span>
      {required && <span className="text-[#5AA0FF]">*</span>}
      {optionalText && (
        <span className="normal-case tracking-normal font-medium text-slate-500">
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
          className="mt-2 text-[12px] text-red-400 font-medium flex items-center gap-1.5 overflow-hidden"
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
      <div className="relative shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#0047BA] to-[#2F7BE0] flex items-center justify-center text-white shadow-[0_8px_24px_rgba(0,71,186,0.35)]">
        {icon}
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#050B18] border border-white/15 text-[10px] font-black flex items-center justify-center text-[#8DBBFF]">
          {index}
        </span>
      </div>
      <div className="min-w-0">
        <h2 className="text-white font-semibold text-lg tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-[13px] text-slate-400 mt-0.5">{subtitle}</p>
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
      className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0A1120] border border-white/[0.07]"
    >
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
                ? "bg-[#0047BA] text-white shadow-[0_4px_14px_rgba(0,71,186,0.45)]"
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
    "w-10 h-10 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-200 transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/[0.05] disabled:hover:border-white/10";
  return (
    <div className="w-full rounded-xl bg-[#0F1829] border border-white/10 px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3 pl-1.5 text-slate-500">
        {icon}
        <output
          id={id}
          className="text-lg font-bold text-white tabular-nums min-w-6"
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

const LANG_EVENT = "catl-lang-change";

function subscribeLang(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANG_EVENT, onChange);
  };
}

function getLangSnapshot(): CatlLang {
  try {
    return localStorage.getItem(CATL_LANG_STORAGE_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

function getServerLang(): CatlLang {
  return "en";
}

export default function CatlLandingPage() {
  const router = useRouter();

  const lang = useSyncExternalStore(subscribeLang, getLangSnapshot, getServerLang);
  const tx = (key: string, params?: Record<string, string | number>) =>
    catlText(lang, key, params);

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<CatlPortalUser | null>(null);
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
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const setLang = (next: CatlLang) => {
    try {
      localStorage.setItem(CATL_LANG_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(LANG_EVENT));
  };

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
        const res = await fetch("/api/catl-auth/session", { cache: "no-store" });
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
      await fetch("/api/catl-auth/logout", { method: "POST" });
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
        companyName: "CATL",
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
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-partner-portal": "catl",
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
        router.push("/catl/auth");
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
      return translateCatlServerMessage(lang, token.slice(4));
    }
    if (token.startsWith("i18n:")) return tx(token.slice(5));
    return token;
  };

  const minDate = useMemo(() => todayLocal(), []);
  const year = new Date().getFullYear();

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#FAFBFC] text-zinc-900 flex flex-col">
        <div className="w-full border-b border-zinc-200/70 bg-white/60 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0047BA] to-[#2F7BE0] flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm tracking-tighter">
                  C
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-zinc-900 leading-none">
                  {tx("portalName")}
                </span>
                <span className="text-[11px] text-zinc-500 mt-0.5 tracking-wide">
                  {tx("checkingAccessSub")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center py-20 gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#0047BA]/[0.08] border border-[#0047BA]/10 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#0047BA] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-[#0047BA]"
              />
              <p className="text-[14px] text-zinc-600 font-semibold tracking-wide">
                {tx("checkingAccess")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <CatlPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0047BA]/25 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none"
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-36 h-36 flex items-center justify-center mb-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, ease: "linear", repeat: Infinity }}
              className="absolute inset-0 rounded-full border border-white/[0.04] border-t-[#2F7BE0]/70 border-r-[#0047BA]/50"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 16, ease: "linear", repeat: Infinity }}
              className="absolute -inset-4 rounded-full border border-white/[0.03] border-b-[#2F7BE0]/30 border-l-[#0047BA]/50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="h-14 px-4 rounded-2xl bg-white flex items-center shadow-[0_0_40px_rgba(47,123,224,0.35)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/partners/catl/logo.png"
                alt="CATL"
                width={139}
                height={45}
                className="h-6 w-auto"
              />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-5 mb-4">
              <span className="font-serif text-2xl tracking-[0.25em] text-white/90">
                PANNON
              </span>
              <span className="w-px h-6 bg-white/20" />
              <span className="font-sans font-black text-2xl tracking-[0.2em] text-[#5AA0FF]">
                CATL
              </span>
            </div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 font-medium">
              {tx("premiumTag")}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-14 w-64"
          >
            <div className="h-[2px] w-full bg-white/5 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.4 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-[#2F7BE0] to-[#5AA0FF] shadow-[0_0_12px_rgba(90,160,255,0.9)]"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 text-center text-[10px] tracking-[0.25em] text-[#5AA0FF] uppercase font-bold"
            >
              {tx("preparing")}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const errorId = (key: string) => `err-${key}`;
  const describedBy = (key: string) =>
    fieldError(key) ? errorId(key) : undefined;

  return (
    <div className="min-h-screen bg-[#050B18] text-slate-300 font-sans selection:bg-[#0047BA]/40 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[620px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,71,186,0.28),transparent_65%)] blur-2xl" />
        <div className="absolute bottom-0 right-0 w-[60vw] h-[50vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(47,123,224,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
      </div>

      <CatlBookingHeader
        lang={lang}
        onLangChange={setLang}
        email={authedUser.email}
        scrolled={scrolled}
        active="booking"
        onLogout={handleLogout}
      />

      <main
        id="booking"
        className="relative z-10 pt-[136px] lg:pt-28 pb-24 px-4 sm:px-6"
      >
        <div className="max-w-[760px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0047BA]/15 border border-[#2F7BE0]/30 text-[11px] font-bold tracking-[0.2em] uppercase text-[#8DBBFF] mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              {tx("heroEyebrow")}
            </div>
            <h1 className="text-[34px] sm:text-[44px] font-semibold tracking-tight text-white leading-[1.1]">
              {tx("heroTitle")}
            </h1>
            <p className="mt-4 text-[15px] sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              {tx("heroSubtitle")}
            </p>
          </motion.div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-[#0A1222]/90 backdrop-blur border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
              <div className="p-8 sm:p-14 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -120 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-400/30 shadow-[0_0_50px_rgba(16,185,129,0.25)] mb-8"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" strokeWidth={2.2} />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
                  {tx("okTitle")}
                </h2>
                <p className="text-slate-400 text-[15px] mb-8">{tx("okSub")}</p>

                <div className="mb-8">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-2 block">
                    {tx("okCode")}
                  </span>
                  <div className="inline-flex items-center px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#0047BA]/25 to-[#2F7BE0]/15 border border-[#2F7BE0]/35 shadow-[0_0_30px_rgba(0,71,186,0.25)]">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-wider font-mono">
                      #{lastBookingCode}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 max-w-md mb-10 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] text-left">
                  <ShieldCheck className="w-4 h-4 text-[#5AA0FF] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    {tx("okNote")}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => router.push("/catl/bookings")}
                    className="py-3.5 px-5 rounded-xl bg-[#0047BA] hover:bg-[#0A55D0] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,71,186,0.4)] active:scale-[0.98]"
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
              className="relative overflow-hidden rounded-3xl bg-[#0A1222]/90 backdrop-blur border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2F7BE0] to-transparent" />

              <div className="px-6 sm:px-10 pt-6 pb-5 border-b border-white/[0.06] bg-white/[0.015]">
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
                    className="h-full rounded-full bg-gradient-to-r from-[#0047BA] to-[#5AA0FF] shadow-[0_0_12px_rgba(90,160,255,0.6)]"
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
                      <div className="rounded-2xl bg-red-500/[0.07] border border-red-500/25 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                            <XCircle className="w-4 h-4 text-red-400" />
                          </div>
                          <p className="text-[14px] font-semibold text-red-300">
                            {tx("errFixTitle")}
                          </p>
                        </div>
                        <ul className="space-y-1.5 pl-11">
                          {submitErrors.map((err, idx) => (
                            <li
                              key={idx}
                              className="text-[13px] text-red-300/90 flex items-start gap-2 leading-relaxed"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400/70 mt-2 shrink-0" />
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
                      <Label htmlFor="catl-email" required>{tx("fEmail")}</Label>
                      <div className={inputShell(!!fieldError("travelerEmail"))}>
                        <Mail className={`w-4 h-4 shrink-0 ${fieldError("travelerEmail") ? "text-red-400" : "text-slate-500 group-focus-within:text-[#5AA0FF]"}`} />
                        <input
                          id="catl-email"
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
                      <Label htmlFor="catl-name" required>{tx("fName")}</Label>
                      <div className={inputShell(!!fieldError("travelerName"))}>
                        <Users className={`w-4 h-4 shrink-0 ${fieldError("travelerName") ? "text-red-400" : "text-slate-500 group-focus-within:text-[#5AA0FF]"}`} />
                        <input
                          id="catl-name"
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
                      <Label htmlFor="catl-company">{tx("fCompany")}</Label>
                      <div className="w-full rounded-xl bg-[#0B1322] border border-white/[0.07] px-4 py-3.5 flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-slate-600 shrink-0" />
                        <input
                          id="catl-company"
                          type="text"
                          value="CATL"
                          readOnly
                          tabIndex={-1}
                          className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-white/80 cursor-not-allowed"
                        />
                        <Check className="w-4 h-4 text-emerald-400/80 shrink-0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="catl-phone" required>{tx("fPhone")}</Label>
                      <div className={inputShell(!!fieldError("travelerPhone"))}>
                        <Phone className={`w-4 h-4 shrink-0 ${fieldError("travelerPhone") ? "text-red-400" : "text-slate-500 group-focus-within:text-[#5AA0FF]"}`} />
                        <input
                          id="catl-phone"
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

                  <div className="mt-6 rounded-2xl bg-[#0B1322] border border-white/[0.07] p-5">
                    <div className="flex items-center gap-2.5 mb-4 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-400">
                      <UserPlus className="w-4 h-4 text-[#5AA0FF]" />
                      {tx("secondTraveler")}
                      <span className="normal-case tracking-normal font-medium text-slate-500">
                        · {tx("optional")}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="catl-email2">{tx("fSecondEmail")}</Label>
                        <div className={inputShell(false)}>
                          <Mail className="w-4 h-4 text-slate-500 shrink-0 group-focus-within:text-[#5AA0FF]" />
                          <input
                            id="catl-email2"
                            type="email"
                            value={secondTravelerEmail}
                            onChange={(e) => setSecondTravelerEmail(e.target.value)}
                            placeholder={tx("optionalPh")}
                            className={inputBase}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="catl-phone2">{tx("fSecondPhone")}</Label>
                        <div className={inputShell(false)}>
                          <Phone className="w-4 h-4 text-slate-500 shrink-0 group-focus-within:text-[#5AA0FF]" />
                          <input
                            id="catl-phone2"
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
                              className={`relative text-left rounded-2xl border px-5 py-4 transition-all duration-200 active:scale-[0.99] ${
                                selected
                                  ? "bg-gradient-to-br from-[#0047BA]/30 to-[#2F7BE0]/10 border-[#2F7BE0]/70 shadow-[0_10px_30px_rgba(0,71,186,0.25)]"
                                  : "bg-[#0F1829] border-white/10 hover:border-white/25"
                              }`}
                            >
                              <span
                                className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  selected
                                    ? "bg-[#0047BA] border-[#5AA0FF] text-white"
                                    : "border-white/20 text-transparent"
                                }`}
                              >
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </span>
                              <span className="block text-[16px] font-bold text-white">{opt.title}</span>
                              <span className="block text-[12px] text-slate-400 mt-0.5">{opt.sub}</span>
                              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                                <Users className="w-3.5 h-3.5 text-[#5AA0FF]" />
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
                    <div className="rounded-2xl bg-[#0B1322] border border-white/[0.07] p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#5AA0FF] shadow-[0_0_10px_rgba(90,160,255,0.8)]" />
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
                        <Label htmlFor="catl-from" required>{tx("fFromAddress")}</Label>
                        <div className={inputShell(!!fieldError("fromAddress"))}>
                          <MapPin className={`w-4 h-4 shrink-0 ${fieldError("fromAddress") ? "text-red-400" : "text-slate-500 group-focus-within:text-[#5AA0FF]"}`} />
                          <input
                            id="catl-from"
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
                      <div className="w-9 h-9 rounded-full bg-[#0047BA] border-4 border-[#0A1222] flex items-center justify-center shadow-[0_6px_18px_rgba(0,71,186,0.5)]">
                        <ArrowDown className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#0B1322] border border-white/[0.07] p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
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
                        <Label htmlFor="catl-to" required>{tx("fToAddress")}</Label>
                        <div className={inputShell(!!fieldError("toAddress"))}>
                          <MapPin className={`w-4 h-4 shrink-0 ${fieldError("toAddress") ? "text-red-400" : "text-slate-500 group-focus-within:text-[#5AA0FF]"}`} />
                          <input
                            id="catl-to"
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
                    <Label htmlFor="catl-flight" required>{tx("fFlight")}</Label>
                    <div className={inputShell(!!fieldError("flightNumber"))}>
                      <Plane className={`w-4 h-4 shrink-0 ${fieldError("flightNumber") ? "text-red-400" : "text-slate-500 group-focus-within:text-[#5AA0FF]"}`} />
                      <input
                        id="catl-flight"
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
                      <Label htmlFor="catl-date" required>{tx("fDate")}</Label>
                      <div className={inputShell(!!fieldError("pickupDate"))}>
                        <Calendar className={`w-4 h-4 shrink-0 ${fieldError("pickupDate") ? "text-red-400" : "text-slate-500 group-focus-within:text-[#5AA0FF]"}`} />
                        <input
                          id="catl-date"
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
                      <Label htmlFor="catl-time" required>{tx("fTime")}</Label>
                      <div className={inputShell(!!fieldError("pickupTime"))}>
                        <Clock className={`w-4 h-4 shrink-0 ${fieldError("pickupTime") ? "text-red-400" : "text-slate-500 group-focus-within:text-[#5AA0FF]"}`} />
                        <input
                          id="catl-time"
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
                      <Label htmlFor="catl-travelers" required>{tx("fTravelers")}</Label>
                      <Counter
                        id="catl-travelers"
                        icon={<Users className="w-4 h-4" />}
                        value={travelers}
                        min={1}
                        max={maxPax}
                        onChange={changeTravelers}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 text-[12px] text-slate-500">
                        {tx("upToPax", { n: maxPax })}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="catl-luggage" required>{tx("fLuggage")}</Label>
                      <Counter
                        id="catl-luggage"
                        icon={<Luggage className="w-4 h-4" />}
                        value={luggage}
                        min={0}
                        max={maxLuggage}
                        onChange={setLuggage}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 text-[12px] text-slate-500">
                        {tx("luggageHint", { n: maxLuggage })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="catl-comment" optionalText={tx("optional")}>
                      {tx("fComment")}
                    </Label>
                    <div className={`${inputShell(false)} items-start`}>
                      <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-1 group-focus-within:text-[#5AA0FF]" />
                      <textarea
                        id="catl-comment"
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={tx("phComment")}
                        className={`${inputBase} resize-none`}
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-8 border-t border-white/[0.07]">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`w-full rounded-2xl font-semibold text-[15px] tracking-wide transition-all duration-300 flex justify-center items-center gap-3 py-4 active:scale-[0.99] ${
                      formLoading
                        ? "bg-[#0047BA]/60 text-white/80 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#0047BA] to-[#1668E3] hover:from-[#0A55D0] hover:to-[#2F7BE0] text-white shadow-[0_12px_32px_rgba(0,71,186,0.45)] hover:shadow-[0_16px_40px_rgba(0,71,186,0.6)]"
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
                  <p className="mt-4 text-center text-[12px] text-slate-500">
                    {tx("submitHint")}
                  </p>
                </div>
              </div>
            </motion.form>
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-[#050B18]/80 backdrop-blur py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="h-9 px-2.5 rounded-lg bg-white flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/pannon-transfer-logo.png" alt="Pannon Transfer" width={387} height={79} className="h-5 w-auto" />
            </div>
            <div className="h-9 px-2.5 rounded-lg bg-white flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/partners/catl/logo.png" alt="CATL" width={139} height={45} className="h-4 w-auto" />
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
