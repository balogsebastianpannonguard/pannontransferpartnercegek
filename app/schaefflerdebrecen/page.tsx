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
import SchaefflerDebrecenPremiumLogin from "./components/SchaefflerDebrecenPremiumLogin";
import SchaefflerDebrecenHeader from "./components/SchaefflerDebrecenHeader";
import { translateSdBookingMessage, useSdLang, type SdKey } from "./i18n";
import { SD_PATTERN, SD_SUPPORT, SdLogos } from "./ui";

interface SdPortalUser {
  email: string;
  company?: string;
  role?: string;
}

type TransferType = "standard" | "executive";
type PlaceType = "airport" | "other";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONDITIONS = getTravelConditions("schaefflerdebrecen");
const COMPANY = "Schaeffler Debrecen";

const inputShell = (invalid: boolean) =>
  `group w-full rounded-xl bg-white border px-4 py-3.5 flex items-center gap-3 transition-all duration-200 ${
    invalid
      ? "border-red-300 ring-4 ring-red-500/10"
      : "border-[#DCE3DF] hover:border-[#B9C6BF] focus-within:border-[#00893D] focus-within:ring-4 focus-within:ring-[#00893D]/12"
  }`;

const inputBase =
  "bg-transparent border-none outline-none w-full text-[15px] font-medium text-[#0E1A14] placeholder:text-[#9AA7A0]";

const iconCls = (invalid: boolean) =>
  `w-4 h-4 shrink-0 ${invalid ? "text-red-500" : "text-[#8A9890] group-focus-within:text-[#00893D]"}`;

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
    <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase text-[#5C6B63] mb-2">
      <span>{children}</span>
      {required && <span className="text-[#00893D]">*</span>}
      {optionalText && <span className="normal-case tracking-normal font-medium text-[#9AA7A0]">· {optionalText}</span>}
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
    <div className="flex items-start gap-4">
      <div className="relative shrink-0 w-11 h-11 rounded-full bg-[#0B3D2A] flex items-center justify-center text-white ring-4 ring-[#E7F4EC]">
        {icon}
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#00893D] border-2 border-white text-[10px] font-black flex items-center justify-center text-white">
          {index}
        </span>
      </div>
      <div className="min-w-0 pt-0.5 mb-6">
        <h2 className="text-[#0E1A14] font-bold text-[19px] tracking-tight leading-tight">{title}</h2>
        <p className="text-[13px] text-[#6B7A72] mt-0.5">{subtitle}</p>
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
    <div role="group" aria-label={label} className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#EEF2EF] border border-[#E1E7E3]">
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
                ? "bg-white text-[#0B3D2A] shadow-[0_1px_3px_rgba(11,61,42,0.15)] ring-1 ring-[#00893D]/30"
                : "text-[#6B7A72] hover:text-[#0B3D2A]"
            }`}
          >
            <span className={selected ? "text-[#00893D]" : ""}>{o.icon}</span>
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
    "w-10 h-10 rounded-lg bg-[#F1F5F2] border border-[#E1E7E3] flex items-center justify-center text-[#31413A] transition-all hover:bg-[#E7F4EC] hover:border-[#BFE3CC] active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-[#F1F5F2] disabled:hover:border-[#E1E7E3]";
  return (
    <div className="w-full rounded-xl bg-white border border-[#DCE3DF] px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3 pl-1.5 text-[#8A9890]">
        {icon}
        <output id={id} className="text-lg font-bold text-[#0E1A14] tabular-nums min-w-6">
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

export default function SchaefflerDebrecenLandingPage() {
  const router = useRouter();
  const { lang, setLang, tx } = useSdLang();

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<SdPortalUser | null>(null);
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
    const timer = setTimeout(() => setBootDone(true), 1600);
    return () => clearTimeout(timer);
  }, [authedUser, bootDone]);

  const portalBooting = !!authedUser && !bootDone;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/schaefflerdebrecen-auth/session", { cache: "no-store" });
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
      await fetch("/api/schaefflerdebrecen-auth/logout", { method: "POST" });
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

  const fieldLabelKeys: Record<string, SdKey> = {
    travelerEmail: "fEmail",
    travelerName: "fName",
    travelerPhone: "fPhone",
    fromAddress: "fFromAddress",
    toAddress: "fToAddress",
    flightNumber: "fFlight",
    pickupDate: "fDate",
    pickupTime: "fTime",
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
    if (!value) return tx("errRequired", { field: tx(fieldLabelKeys[key]) });
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
        headers: { "Content-Type": "application/json", "x-partner-portal": "schaefflerdebrecen" },
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
        router.push("/schaefflerdebrecen/auth");
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
    if (token.startsWith("srv:")) return translateSdBookingMessage(lang, token.slice(4));
    if (token.startsWith("i18n:")) return tx(token.slice(5) as SdKey);
    return token;
  };

  const minDate = useMemo(() => todayLocal(), []);

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#F3F6F4] text-[#0E1A14] flex flex-col">
        <div className="w-full bg-white border-b border-[#E1E7E3]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <SdLogos />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center py-20 gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#E7F4EC] border border-[#CBE6D6] flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#00893D] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-[#DCE3DF] border-t-[#00893D]"
              />
              <p className="text-[14px] text-[#5C6B63] font-semibold tracking-wide">{tx("checkingAccess")}</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <SchaefflerDebrecenPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0B3D2A] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className={`absolute inset-0 ${SD_PATTERN}`} aria-hidden />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00893D]/35 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none"
        />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mb-10">
            <SdLogos onDark />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} className="text-center">
            <div className="flex items-center justify-center gap-5 mb-4">
              <span className="font-serif text-2xl tracking-[0.25em] text-white/90">PANNON</span>
              <span className="w-px h-6 bg-white/25" />
              <span className="font-sans font-black text-2xl tracking-[0.18em] text-[#7BE0A6]">SCHAEFFLER</span>
            </div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-white/50 font-medium">{tx("premiumTag")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-14 w-64">
            <div className="h-[2px] w-full bg-white/10 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, ease: [0.7, 0, 0.3, 1], delay: 0.4 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-[#00893D] to-[#7BE0A6]"
              />
            </div>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="mt-5 text-center text-[10px] tracking-[0.25em] text-[#7BE0A6] uppercase font-bold">
              {tx("preparing")}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const errorId = (key: string) => `err-${key}`;
  const describedBy = (key: string) => (fieldError(key) ? errorId(key) : undefined);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#F3F6F4] text-[#31413A] font-sans selection:bg-[#00893D]/25 relative overflow-x-hidden">
      <SchaefflerDebrecenHeader
        lang={lang}
        tx={tx}
        onLangChange={setLang}
        email={authedUser.email}
        scrolled={scrolled}
        active="booking"
        onLogout={handleLogout}
      />

      {/* Hero band */}
      <section className="relative bg-[#0B3D2A] pt-[108px] lg:pt-[88px] pb-32 sm:pb-36 overflow-hidden">
        <div className={`absolute inset-0 ${SD_PATTERN}`} aria-hidden />
        <div className="absolute -top-24 right-[-8%] w-[520px] h-[520px] rounded-full bg-[#00893D]/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-[#00893D]" aria-hidden />
        <div className="relative max-w-[1000px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold tracking-[0.2em] uppercase text-[#9CEBBE] mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              {tx("heroEyebrow")}
            </div>
            <h1 className="text-[34px] sm:text-[48px] font-semibold tracking-[-0.02em] text-white leading-[1.08] max-w-2xl">{tx("heroTitle")}</h1>
            <p className="mt-4 text-[15px] sm:text-[17px] text-white/70 max-w-xl leading-relaxed">{tx("heroSubtitle")}</p>
          </motion.div>
        </div>
      </section>

      <main id="booking" className="relative z-10 -mt-24 sm:-mt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-[820px] mx-auto w-full">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl bg-white border border-[#E1E7E3] shadow-[0_30px_80px_rgba(11,61,42,0.18)]"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00893D] via-[#7BE0A6] to-[#00893D]" />
              <div className="p-8 sm:p-14 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -120 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-[#E7F4EC] flex items-center justify-center border border-[#BFE3CC] shadow-[0_0_50px_rgba(0,137,61,0.2)] mb-8"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#00893D]" strokeWidth={2.2} />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#0E1A14] tracking-tight mb-3">{tx("okTitle")}</h2>
                <p className="text-[#5C6B63] text-[15px] mb-8">{tx("okSub")}</p>

                <div className="mb-8">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#7B8A82] mb-2 block">{tx("okCode")}</span>
                  <div className="inline-flex items-center px-7 py-3.5 rounded-2xl bg-[#0B3D2A] shadow-[0_12px_30px_rgba(11,61,42,0.3)]">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-wider font-mono">#{lastBookingCode}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 max-w-md mb-10 p-4 rounded-xl bg-[#F6F9F7] border border-[#E1E7E3] text-left">
                  <ShieldCheck className="w-4 h-4 text-[#00893D] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#5C6B63] leading-relaxed">{tx("okNote")}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => router.push("/schaefflerdebrecen/bookings")}
                    className="py-3.5 px-5 rounded-xl bg-[#00893D] hover:bg-[#007335] text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,137,61,0.3)] active:scale-[0.98]"
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
                    className="py-3.5 px-5 rounded-xl bg-white border border-[#DCE3DF] hover:bg-[#F3F6F4] text-[#0E1A14] font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
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
              className="relative overflow-hidden rounded-3xl bg-white border border-[#E1E7E3] shadow-[0_30px_80px_rgba(11,61,42,0.18)]"
            >
              <div className="px-6 sm:px-10 pt-6 pb-5 border-b border-[#EEF2EF] bg-[#FAFCFB]">
                <div className="flex items-center justify-between text-[12px] font-medium mb-2.5">
                  <span className="text-[#6B7A72]">{tx("progress")}</span>
                  <span className="tabular-nums text-[#0B3D2A] font-bold">
                    {validKeys.length}/{requiredTotal}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full bg-[#E8EDEA] overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                  aria-label={tx("progress")}
                >
                  <motion.div
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-[#00893D] to-[#3FC17A]"
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
                      <div className="rounded-2xl bg-red-50 border border-red-100 p-5">
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

                {/* 1 — Passenger & company */}
                <section aria-labelledby="sec-traveler">
                  <div id="sec-traveler">
                    <SectionHeader index={1} icon={<Users className="w-5 h-5" />} title={tx("secTraveler")} subtitle={tx("secTravelerSub")} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="sd-email" required>{tx("fEmail")}</Label>
                      <div className={inputShell(!!fieldError("travelerEmail"))}>
                        <Mail className={iconCls(!!fieldError("travelerEmail"))} />
                        <input
                          id="sd-email"
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
                      <Label htmlFor="sd-name" required>{tx("fName")}</Label>
                      <div className={inputShell(!!fieldError("travelerName"))}>
                        <Users className={iconCls(!!fieldError("travelerName"))} />
                        <input
                          id="sd-name"
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
                      <Label htmlFor="sd-company">{tx("fCompany")}</Label>
                      <div className="w-full rounded-xl bg-[#F6F9F7] border border-[#E1E7E3] px-4 py-3.5 flex items-center gap-3">
                        <Briefcase className="w-4 h-4 text-[#9AA7A0] shrink-0" />
                        <input
                          id="sd-company"
                          type="text"
                          value={COMPANY}
                          readOnly
                          tabIndex={-1}
                          className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-[#31413A] cursor-not-allowed"
                        />
                        <Check className="w-4 h-4 text-[#00893D] shrink-0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="sd-phone" required>{tx("fPhone")}</Label>
                      <div className={inputShell(!!fieldError("travelerPhone"))}>
                        <Phone className={iconCls(!!fieldError("travelerPhone"))} />
                        <input
                          id="sd-phone"
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
                      <p className="mt-2 text-[12px] text-[#7B8A82]">{tx("fPhoneHint")}</p>
                      <FieldError id={errorId("travelerPhone")} message={fieldError("travelerPhone")} />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-[#F6F9F7] border border-[#E1E7E3] p-5">
                    <div className="flex items-center gap-2.5 mb-4 text-[12px] font-bold tracking-[0.14em] uppercase text-[#5C6B63]">
                      <UserPlus className="w-4 h-4 text-[#00893D]" />
                      {tx("secondTraveler")}
                      <span className="normal-case tracking-normal font-medium text-[#9AA7A0]">· {tx("optional")}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sd-email2">{tx("fSecondEmail")}</Label>
                        <div className={inputShell(false)}>
                          <Mail className={iconCls(false)} />
                          <input id="sd-email2" type="email" value={secondTravelerEmail} onChange={(e) => setSecondTravelerEmail(e.target.value)} placeholder={tx("optionalPh")} className={inputBase} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="sd-phone2">{tx("fSecondPhone")}</Label>
                        <div className={inputShell(false)}>
                          <Phone className={iconCls(false)} />
                          <input id="sd-phone2" type="tel" inputMode="tel" value={secondTravelerPhone} onChange={(e) => setSecondTravelerPhone(e.target.value)} placeholder={tx("optionalPh")} className={inputBase} />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2 — Service & payment */}
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
                              className={`relative text-left rounded-2xl border px-5 py-4 transition-all duration-200 active:scale-[0.99] ${
                                selected
                                  ? "bg-[#E7F4EC] border-[#00893D] shadow-[0_10px_28px_rgba(0,137,61,0.14)]"
                                  : "bg-white border-[#DCE3DF] hover:border-[#B9C6BF]"
                              }`}
                            >
                              <span
                                className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  selected ? "bg-[#00893D] border-[#00893D] text-white" : "border-[#C5CFC9] text-transparent"
                                }`}
                              >
                                <Check className="w-3 h-3" strokeWidth={3} />
                              </span>
                              <span className="block text-[16px] font-bold text-[#0E1A14]">{opt.title}</span>
                              <span className="block text-[12px] text-[#6B7A72] mt-0.5">{opt.sub}</span>
                              <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B7A72]">
                                <Users className="w-3.5 h-3.5 text-[#00893D]" />
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
                    <SectionHeader index={3} icon={<MapPin className="w-5 h-5" />} title={tx("secRoute")} subtitle={tx("secRouteSub")} />
                  </div>

                  <div className="relative space-y-3">
                    <div className="rounded-2xl bg-[#F6F9F7] border border-[#E1E7E3] p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-[#5C6B63]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00893D] ring-4 ring-[#00893D]/15" />
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
                        <Label htmlFor="sd-from" required>{tx("fFromAddress")}</Label>
                        <div className={inputShell(!!fieldError("fromAddress"))}>
                          <MapPin className={iconCls(!!fieldError("fromAddress"))} />
                          <input
                            id="sd-from"
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
                      <div className="w-9 h-9 rounded-full bg-[#0B3D2A] border-4 border-white flex items-center justify-center shadow-[0_6px_18px_rgba(11,61,42,0.35)]">
                        <ArrowDown className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#F6F9F7] border border-[#E1E7E3] p-5 space-y-4">
                      <div className="flex items-center gap-2.5 text-[12px] font-bold tracking-[0.14em] uppercase text-[#5C6B63]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0B3D2A] ring-4 ring-[#0B3D2A]/12" />
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
                        <Label htmlFor="sd-to" required>{tx("fToAddress")}</Label>
                        <div className={inputShell(!!fieldError("toAddress"))}>
                          <MapPin className={iconCls(!!fieldError("toAddress"))} />
                          <input
                            id="sd-to"
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
                    <Label htmlFor="sd-flight" required>{tx("fFlight")}</Label>
                    <div className={inputShell(!!fieldError("flightNumber"))}>
                      <Plane className={iconCls(!!fieldError("flightNumber"))} />
                      <input
                        id="sd-flight"
                        type="text"
                        autoCapitalize="characters"
                        autoComplete="off"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        onBlur={() => markBlurred("flightNumber")}
                        placeholder={tx("phFlight")}
                        aria-invalid={!!fieldError("flightNumber")}
                        aria-describedby={describedBy("flightNumber")}
                        className={`${inputBase} uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal`}
                      />
                    </div>
                    <p className="mt-2 text-[12px] text-[#7B8A82]">{tx("flightHint")}</p>
                    <FieldError id={errorId("flightNumber")} message={fieldError("flightNumber")} />
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="sd-date" required>{tx("fDate")}</Label>
                      <div className={inputShell(!!fieldError("pickupDate"))}>
                        <Calendar className={iconCls(!!fieldError("pickupDate"))} />
                        <input
                          id="sd-date"
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
                      <Label htmlFor="sd-time" required>{tx("fTime")}</Label>
                      <div className={inputShell(!!fieldError("pickupTime"))}>
                        <Clock className={iconCls(!!fieldError("pickupTime"))} />
                        <input
                          id="sd-time"
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
                  <p className="mt-2.5 text-[12px] text-[#7B8A82] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {tx("advanceHint", { h: CONDITIONS.minAdvanceHours })}
                  </p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="sd-travelers" required>{tx("fTravelers")}</Label>
                      <Counter
                        id="sd-travelers"
                        icon={<Users className="w-4 h-4" />}
                        value={travelers}
                        min={1}
                        max={maxPax}
                        onChange={changeTravelers}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 text-[12px] text-[#7B8A82]">{tx("upToPax", { n: maxPax })}</p>
                    </div>
                    <div>
                      <Label htmlFor="sd-luggage" required>{tx("fLuggage")}</Label>
                      <Counter
                        id="sd-luggage"
                        icon={<Luggage className="w-4 h-4" />}
                        value={luggage}
                        min={0}
                        max={maxLuggage}
                        onChange={setLuggage}
                        decreaseLabel={tx("decrease")}
                        increaseLabel={tx("increase")}
                      />
                      <p className="mt-2 text-[12px] text-[#7B8A82]">{tx("luggageHint", { n: maxLuggage })}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="sd-comment" optionalText={tx("optional")}>{tx("fComment")}</Label>
                    <div className={`${inputShell(false)} items-start`}>
                      <MessageSquare className="w-4 h-4 text-[#8A9890] shrink-0 mt-1 group-focus-within:text-[#00893D]" />
                      <textarea
                        id="sd-comment"
                        rows={3}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={tx("phComment")}
                        className={`${inputBase} resize-none`}
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-8 border-t border-[#EEF2EF]">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className={`w-full rounded-2xl font-semibold text-[15px] tracking-wide transition-all duration-300 flex justify-center items-center gap-3 py-4 active:scale-[0.99] ${
                      formLoading
                        ? "bg-[#00893D]/60 text-white/90 cursor-not-allowed"
                        : "bg-[#00893D] hover:bg-[#007335] text-white shadow-[0_12px_32px_rgba(0,137,61,0.32)] hover:shadow-[0_16px_40px_rgba(0,137,61,0.42)]"
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
                  <p className="mt-4 text-center text-[12px] text-[#7B8A82]">{tx("submitHint")}</p>
                </div>
              </div>
            </motion.form>
          )}
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#E1E7E3] bg-white py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <SdLogos size="sm" />
          <div className="text-[12px] text-[#7B8A82] leading-relaxed">
            <div className="text-[#31413A] font-semibold">
              {tx("needHelp")} {SD_SUPPORT.name} · {tx("supportRole")}
            </div>
            <div>
              <a href={`mailto:${SD_SUPPORT.email}`} className="hover:text-[#00893D] transition-colors">
                {SD_SUPPORT.email}
              </a>
              {" · "}
              <a href={`tel:${SD_SUPPORT.phoneHref}`} className="hover:text-[#00893D] transition-colors">
                {SD_SUPPORT.phone}
              </a>
            </div>
            <div className="mt-1 text-[#9AA7A0]">
              © {year} Pannon Transfer. {tx("rights")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
