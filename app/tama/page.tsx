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
  Leaf,
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
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getTravelConditions } from "@/lib/travel-conditions";
import TamaPremiumLogin from "./components/TamaPremiumLogin";
import { useTamaLang, type TamaLang } from "./lang";
import { tamaText, translateTamaServerMessage } from "./booking-i18n";
import {
  MeadowBackdrop,
  PannonLogo,
  TamaFooter,
  TamaHeader,
  TamaLogo,
  WheatOrnament,
  serifFont,
} from "./ui";

interface TamaPortalUser {
  email: string;
  company?: string;
  role?: string;
}

type TransferType = "standard" | "executive";
type PlaceType = "airport" | "other";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONDITIONS = getTravelConditions("tama");
const COMPANY = "TAMA Hungary Kft.";

const inputShell = (invalid: boolean) =>
  `group w-full rounded-2xl bg-[#FBFAF4] border px-4 py-3.5 flex items-center gap-3 transition-all duration-200 ${
    invalid
      ? "border-red-400 bg-red-50/40 ring-4 ring-red-500/10"
      : "border-[#E4DDC7] hover:border-[#CFC7A8] focus-within:bg-white focus-within:border-[#7B9824] focus-within:ring-4 focus-within:ring-[#7B9824]/15"
  }`;

const inputBase =
  "bg-transparent border-none outline-none w-full text-[15px] font-medium text-[#26301B] placeholder:text-[#A7AB98]";

const iconCls = (invalid: boolean) =>
  `w-4 h-4 shrink-0 transition-colors ${invalid ? "text-red-500" : "text-[#9CA08A] group-focus-within:text-[#5F8016]"}`;

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
      className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-[#6B705C] mb-2 ml-1"
    >
      <span>{children}</span>
      {required && <span className="text-[#C9A24D]">*</span>}
      {optionalText && (
        <span className="normal-case tracking-normal font-medium text-[#9CA08A]">· {optionalText}</span>
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
          className="mt-2 ml-1 text-[12px] text-red-600 font-medium flex items-center gap-1.5 overflow-hidden"
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
    <div className="flex items-start gap-4 mb-7">
      <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B9824] to-[#4B6A0E] flex items-center justify-center text-white shadow-[0_10px_24px_rgba(75,106,14,0.28)]">
        {icon}
        <span className="absolute -top-2 -right-2 w-[22px] h-[22px] rounded-full bg-[#C9A24D] border-2 border-white text-[10px] font-black flex items-center justify-center text-white">
          {index}
        </span>
      </div>
      <div className="min-w-0 pt-0.5">
        <h2 className="text-[22px] leading-tight text-[#26301B]" style={serifFont}>
          {title}
        </h2>
        <p className="text-[13px] text-[#6B705C] mt-1">{subtitle}</p>
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
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[#F1EDDD] border border-[#E4DDC7]">
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.id)}
            className={`flex items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold transition-all duration-200 ${
              selected
                ? "bg-[#5F8016] text-white shadow-[0_4px_14px_rgba(95,128,22,0.35)]"
                : "text-[#6B705C] hover:text-[#26301B] hover:bg-white/70"
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
    "w-10 h-10 rounded-full bg-white border border-[#E4DDC7] flex items-center justify-center text-[#4B6A0E] transition-all hover:bg-[#EAF1D3] hover:border-[#B9CC83] active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-[#E4DDC7]";
  return (
    <div className="w-full rounded-2xl bg-[#FBFAF4] border border-[#E4DDC7] px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3 pl-1.5 text-[#9CA08A]">
        {icon}
        <output id={id} className="text-xl font-bold text-[#26301B] tabular-nums min-w-6">
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

export default function TamaLandingPage() {
  const router = useRouter();
  const [lang, setLang] = useTamaLang();
  const tx = (key: string, params?: Record<string, string | number>) => tamaText(lang, key, params);

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<TamaPortalUser | null>(null);
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
    const timer = setTimeout(() => setBootDone(true), 1500);
    return () => clearTimeout(timer);
  }, [authedUser, bootDone]);

  const portalBooting = !!authedUser && !bootDone;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/tama-auth/session", { cache: "no-store" });
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
      await fetch("/api/tama-auth/logout", { method: "POST" });
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
        companyName: COMPANY,
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
        headers: { "Content-Type": "application/json", "x-partner-portal": "tama" },
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
    if (token.startsWith("srv:")) return translateTamaServerMessage(lang, token.slice(4));
    if (token.startsWith("i18n:")) return tx(token.slice(5));
    return token;
  };

  const minDate = useMemo(() => todayLocal(), []);

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#FAF8F1] text-[#26301B] flex flex-col [color-scheme:light]">
        <MeadowBackdrop />
        <div className="relative z-10 w-full border-b border-[#E4DDC7] bg-[#FBF9F3]/80 backdrop-blur-md">
          <div className="max-w-[1180px] mx-auto px-6 h-[68px] flex items-center gap-4">
            <div className="h-9 px-3 rounded-full bg-white border border-[#E4DDC7] flex items-center">
              <PannonLogo className="h-5" />
            </div>
            <span className="w-1 h-1 rounded-full bg-[#C9A24D]" />
            <TamaLogo className="h-8" />
          </div>
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EAF1D3] border border-[#CFDDA0] flex items-center justify-center">
              <Leaf className="w-7 h-7 text-[#5F8016] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-[#E4DDC7] border-t-[#5F8016]"
              />
              <p className="text-[14px] text-[#5B6450] font-semibold tracking-wide">{tx("checkingAccess")}</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <TamaPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF8F1] flex flex-col items-center justify-center overflow-hidden [color-scheme:light]">
        <MeadowBackdrop />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="relative mb-9">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, ease: "linear", repeat: Infinity }}
              className="absolute -inset-6 rounded-full border border-dashed border-[#B9CC83]"
            />
            <div className="relative h-24 w-24 rounded-full bg-white border border-[#E4DDC7] shadow-[0_18px_50px_rgba(95,128,22,0.18)] flex items-center justify-center">
              <TamaLogo className="h-9" />
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-2xl tracking-[0.25em] text-[#3B4530]" style={serifFont}>
              PANNON
            </span>
            <span className="w-px h-6 bg-[#D8D1B8]" />
            <span className="text-2xl font-black tracking-[0.18em] text-[#5F8016]">TAMA</span>
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#8B917D] font-medium">{tx("premiumTag")}</p>
          <div className="mt-10 w-60">
            <div className="h-[3px] w-full bg-[#E9E3CF] relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, ease: [0.7, 0, 0.3, 1], delay: 0.2 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#B9CC83] to-[#5F8016]"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="mt-4 text-center text-[10px] tracking-[0.25em] text-[#5F8016] uppercase font-bold"
            >
              {tx("preparing")}
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  const errorId = (key: string) => `err-${key}`;
  const describedBy = (key: string) => (fieldError(key) ? errorId(key) : undefined);

  return (
    <div className="relative min-h-screen text-[#3B4530] font-sans selection:bg-[#7B9824]/30 overflow-x-hidden [color-scheme:light]">
      <MeadowBackdrop />

      <TamaHeader
        lang={lang}
        onLang={(l: TamaLang) => setLang(l)}
        email={authedUser.email}
        scrolled={scrolled}
        active="booking"
        onLogout={handleLogout}
      />

      <main id="booking" className="relative z-10 pt-[124px] lg:pt-[92px] pb-24 px-4 sm:px-6">
        <div className="max-w-[1000px] mx-auto w-full">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#34490D_0%,#5F8016_52%,#8DAA33_100%)] px-7 sm:px-12 pt-10 pb-24 shadow-[0_30px_70px_rgba(75,106,14,0.28)]"
          >
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <WheatOrnament className="absolute -bottom-6 right-2 sm:right-10 w-52 sm:w-72 opacity-90 pointer-events-none" />
            <div className="relative max-w-[560px]">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold tracking-[0.2em] uppercase text-white/95 mb-5">
                <Leaf className="w-3.5 h-3.5" />
                {tx("heroEyebrow")}
              </div>
              <h1 className="text-[36px] sm:text-[48px] leading-[1.05] text-white" style={serifFont}>
                {tx("heroTitle")}
              </h1>
              <p className="mt-4 text-[15px] sm:text-base text-white/85 leading-relaxed">{tx("heroSubtitle")}</p>
            </div>
          </motion.section>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative -mt-14 mx-auto max-w-[820px] overflow-hidden rounded-[28px] bg-white border border-[#E4DDC7] shadow-[0_30px_80px_rgba(70,80,30,0.14)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#B9CC83] via-[#5F8016] to-[#C9A24D]" />
              <div className="p-8 sm:p-14 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -120 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-[#EAF1D3] flex items-center justify-center border border-[#CFDDA0] shadow-[0_0_50px_rgba(123,152,36,0.25)] mb-8"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#5F8016]" strokeWidth={2.2} />
                </motion.div>
                <h2 className="text-[30px] text-[#26301B] mb-3" style={serifFont}>
                  {tx("okTitle")}
                </h2>
                <p className="text-[#6B705C] text-[15px] mb-8">{tx("okSub")}</p>

                <div className="mb-8">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8B917D] mb-2 block">{tx("okCode")}</span>
                  <div className="inline-flex items-center px-7 py-3.5 rounded-full bg-[#F4F8E6] border border-[#CFDDA0]">
                    <span className="text-3xl sm:text-4xl font-black text-[#3E560C] tracking-wider font-mono">#{lastBookingCode}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 max-w-md mb-10 p-4 rounded-2xl bg-[#FBF8EC] border border-[#EEE5C6] text-left">
                  <ShieldCheck className="w-4 h-4 text-[#C9A24D] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#5B6450] leading-relaxed">{tx("okNote")}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => router.push("/tama/bookings")}
                    className="py-3.5 px-5 rounded-full bg-gradient-to-r from-[#5F8016] to-[#7B9824] hover:from-[#4B6A0E] hover:to-[#5F8016] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_10px_26px_rgba(95,128,22,0.35)] active:scale-[0.98]"
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
                    className="py-3.5 px-5 rounded-full bg-white border border-[#E4DDC7] hover:bg-[#F4F0E1] text-[#3B4530] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
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
              className="relative -mt-14 mx-auto max-w-[820px] overflow-hidden rounded-[28px] bg-white border border-[#E4DDC7] shadow-[0_30px_80px_rgba(70,80,30,0.14)]"
            >
              <div className="px-6 sm:px-10 pt-6 pb-5 border-b border-[#EFE9D7] bg-[#FDFCF8]">
                <div className="flex items-center justify-between text-[12px] font-medium mb-2.5">
                  <span className="text-[#6B705C]">{tx("progress")}</span>
                  <span className="tabular-nums text-[#3E560C] font-bold">
                    {validKeys.length}/{requiredTotal}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full bg-[#EFE9D7] overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                  aria-label={tx("progress")}
                >
                  <motion.div
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#B9CC83] via-[#7B9824] to-[#5F8016]"
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
                          <p className="text-[14px] font-semibold text-red-700">{tx("errFixTitle")}</p>
                        </div>
                        <ul className="space-y-1.5 pl-11">
                          {submitErrors.map((err, idx) => (
                            <li key={idx} className="text-[13px] text-red-700/90 flex items-start gap-2 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                              <span>{renderSubmitError(err)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 1 — Utas és cég */}
                <section aria-labelledby="sec-traveler">
                  <div id="sec-traveler">
                    <SectionHeader index={1} icon={<Users className="w-5 h-5" />} title={tx("secTraveler")} subtitle={tx("secTravelerSub")} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="tama-email" required>{tx("fEmail")}</Label>
                      <div className={inputShell(!!fieldError("travelerEmail"))}>
                        <Mail className={iconCls(!!fieldError("travelerEmail"))} />
                        <input
                          id="tama-email"
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
                      <Label htmlFor="tama-name" required>{tx("fName")}</Label>
                      <div className={inputShell(!!fieldError("travelerName"))}>
                        <Users className={iconCls(!!fieldError("travelerName"))} />
                        <input
                          id="tama-name"
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
                      <Label htmlFor="tama-company">{tx("fCompany")}</Label>
                      <div className="w-full rounded-2xl bg-[#F4F8E6] border border-[#DCE7B5] px-4 py-3.5 flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-[#7B9824] shrink-0" />
                        <input
                          id="tama-company"
                          type="text"
                          value={COMPANY}
                          readOnly
                          tabIndex={-1}
                          className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-[#3E560C] cursor-not-allowed"
                        />
                        <Check className="w-4 h-4 text-[#5F8016] shrink-0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tama-phone" required>{tx("fPhone")}</Label>
                      <div className={inputShell(!!fieldError("travelerPhone"))}>
                        <Phone className={iconCls(!!fieldError("travelerPhone"))} />
                        <input
                          id="tama-phone"
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
                      <p className="mt-2 ml-1 text-[12px] text-[#8B917D]">{tx("fPhoneHint")}</p>
                      <FieldError id={errorId("travelerPhone")} message={fieldError("travelerPhone")} />
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl bg-[#FBF8EC] border border-[#EEE5C6] p-5">
                    <div className="flex items-center gap-2.5 mb-4 text-[12px] font-bold tracking-[0.14em] uppercase text-[#6B705C]">
                      <UserPlus className="w-4 h-4 text-[#C9A24D]" />
                      {tx("secondTraveler")}
                      <span className="normal-case tracking-normal font-medium text-[#9CA08A]">· {tx("optional")}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tama-email2">{tx("fSecondEmail")}</Label>
                        <div className={inputShell(false)}>
                          <Mail className={iconCls(false)} />
                          <input
                            id="tama-email2"
                            type="email"
                            value={secondTravelerEmail}
                            onChange={(e) => setSecondTravelerEmail(e.target.value)}
                            placeholder={tx("optionalPh")}
                            className={inputBase}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="tama-phone2">{tx("fSecondPhone")}</Label>
                        <div className={inputShell(false)}>
                          <Phone className={iconCls(false)} />
                          <input
                            id="tama-phone2"
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

                {/* 2 — Szolgáltatás és fizetés */}
                <section aria-labelledby="sec-service">
                  <div id="sec-service">
                    <SectionHeader index={2} icon={<CreditCard className="w-5 h-5" />} title={tx("secService")} subtitle={tx("secServiceSub")} />
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
                              className={`relative text-left rounded-3xl border-2 px-5 py-4 transition-all duration-200 active:scale-[0.99] ${
                                selected
                                  ? "bg-[#F4F8E6] border-[#7B9824] shadow-[0_12px_30px_rgba(95,128,22,0.16)]"
                                  : "bg-white border-[#E4DDC7] hover:border-[#C7D79A]"
                              }`}
                            >
                              <span
                                className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  selected ? "bg-[#5F8016] border-[#5F8016] text-white" : "border-[#D8D1B8] text-transparent"
                                }`}
                              >
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </span>
                              <span className="block text-[17px] text-[#26301B]" style={serifFont}>{opt.title}</span>
                              <span className="block text-[12px] text-[#6B705C] mt-0.5">{opt.sub}</span>
                              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#5F8016]">
                                <Users className="w-3.5 h-3.5" />
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

                {/* 3 — Útvonal és időpont */}
                <section aria-labelledby="sec-route">
                  <div id="sec-route">
                    <SectionHeader index={3} icon={<MapPin className="w-5 h-5" />} title={tx("secRoute")} subtitle={tx("secRouteSub")} />
                  </div>

                  <div className="relative space-y-3">
                    <div className="rounded-3xl bg-[#FBF8EC] border border-[#EEE5C6] p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-[#6B705C]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7B9824] ring-4 ring-[#7B9824]/20" />
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
                        <Label htmlFor="tama-from" required>{tx("fFromAddress")}</Label>
                        <div className={inputShell(!!fieldError("fromAddress"))}>
                          <MapPin className={iconCls(!!fieldError("fromAddress"))} />
                          <input
                            id="tama-from"
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
                      <div className="w-9 h-9 rounded-full bg-[#5F8016] border-4 border-white flex items-center justify-center shadow-[0_6px_18px_rgba(95,128,22,0.4)]">
                        <ArrowDown className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="rounded-3xl bg-[#FBF8EC] border border-[#EEE5C6] p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-[#6B705C]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C9A24D] ring-4 ring-[#C9A24D]/20" />
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
                        <Label htmlFor="tama-to" required>{tx("fToAddress")}</Label>
                        <div className={inputShell(!!fieldError("toAddress"))}>
                          <MapPin className={iconCls(!!fieldError("toAddress"))} />
                          <input
                            id="tama-to"
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
                    <Label htmlFor="tama-flight" required>{tx("fFlight")}</Label>
                    <div className={inputShell(!!fieldError("flightNumber"))}>
                      <Plane className={iconCls(!!fieldError("flightNumber"))} />
                      <input
                        id="tama-flight"
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
                    <p className="mt-2 ml-1 text-[12px] text-[#8B917D]">{tx("flightHint")}</p>
                    <FieldError id={errorId("flightNumber")} message={fieldError("flightNumber")} />
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="tama-date" required>{tx("fDate")}</Label>
                      <div className={inputShell(!!fieldError("pickupDate"))}>
                        <Calendar className={iconCls(!!fieldError("pickupDate"))} />
                        <input
                          id="tama-date"
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
                      <Label htmlFor="tama-time" required>{tx("fTime")}</Label>
                      <div className={inputShell(!!fieldError("pickupTime"))}>
                        <Clock className={iconCls(!!fieldError("pickupTime"))} />
                        <input
                          id="tama-time"
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
                  <p className="mt-2.5 ml-1 text-[12px] text-[#8B917D] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {tx("advanceHint", { h: CONDITIONS.minAdvanceHours })}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="tama-travelers" required>{tx("fTravelers")}</Label>
                      <Counter
                        id="tama-travelers"
                        icon={<Users className="w-4 h-4" />}
                        value={travelers}
                        min={1}
                        max={maxPax}
                        onChange={changeTravelers}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 ml-1 text-[12px] text-[#8B917D]">{tx("upToPax", { n: maxPax })}</p>
                    </div>
                    <div>
                      <Label htmlFor="tama-luggage" required>{tx("fLuggage")}</Label>
                      <Counter
                        id="tama-luggage"
                        icon={<Luggage className="w-4 h-4" />}
                        value={luggage}
                        min={0}
                        max={maxLuggage}
                        onChange={setLuggage}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 ml-1 text-[12px] text-[#8B917D]">{tx("luggageHint", { n: maxLuggage })}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="tama-comment" optionalText={tx("optional")}>{tx("fComment")}</Label>
                    <div className={`${inputShell(false)} items-start`}>
                      <MessageSquare className="w-4 h-4 text-[#9CA08A] shrink-0 mt-1 group-focus-within:text-[#5F8016]" />
                      <textarea
                        id="tama-comment"
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={tx("phComment")}
                        className={`${inputBase} resize-none`}
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-8 border-t border-dashed border-[#DDD6BD]">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`w-full rounded-full font-semibold text-[15px] tracking-wide transition-all duration-300 flex justify-center items-center gap-3 py-4 active:scale-[0.99] ${
                      formLoading
                        ? "bg-[#7B9824]/60 text-white/90 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#4B6A0E] via-[#5F8016] to-[#7B9824] hover:from-[#3E560C] hover:via-[#4B6A0E] hover:to-[#5F8016] text-white shadow-[0_14px_34px_rgba(75,106,14,0.38)] hover:shadow-[0_18px_42px_rgba(75,106,14,0.48)]"
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
                  <p className="mt-4 text-center text-[12px] text-[#8B917D]">{tx("submitHint")}</p>
                </div>
              </div>
            </motion.form>
          )}
        </div>
      </main>

      <TamaFooter lang={lang} />
    </div>
  );
}
