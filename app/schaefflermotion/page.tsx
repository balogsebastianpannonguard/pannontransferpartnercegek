"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getTravelConditions } from "@/lib/travel-conditions";
import SchaefflerMotionPremiumLogin from "./components/SchaefflerMotionPremiumLogin";
import { MxBackdrop, MxFooter, MxHeader, PannonChip, SchaefflerChip } from "./components/mx-ui";
import { MX_LOCALE, useMxLang } from "./lang";
import { makeTx, translateServerMessage } from "./booking-i18n";

interface PortalUser {
  email: string;
  company?: string;
  role?: string;
}

type TransferType = "standard" | "executive";
type PlaceType = "airport" | "other";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONDITIONS = getTravelConditions("schaefflermotion");
const COMPANY = "Schaeffler Motion";

const inputShell = (invalid: boolean) =>
  `group w-full rounded-[6px] bg-[#0E1511] border px-4 py-3.5 flex items-center gap-3 transition-all duration-200 ${
    invalid
      ? "border-red-500/60 ring-4 ring-red-500/10"
      : "border-white/12 hover:border-white/25 focus-within:border-[#3DDC84]/70 focus-within:ring-4 focus-within:ring-[#00893D]/20"
  }`;
const inputBase =
  "bg-transparent border-none outline-none w-full text-[15px] font-medium text-white placeholder:text-slate-600";
const iconCls = (invalid: boolean) =>
  `w-4 h-4 shrink-0 transition-colors ${invalid ? "text-red-400" : "text-slate-500 group-focus-within:text-[#3DDC84]"}`;

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
      className="flex items-center gap-1.5 font-mono text-[10.5px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2"
    >
      <span>{children}</span>
      {required && <span className="text-[#3DDC84]">*</span>}
      {optionalText && <span className="normal-case tracking-normal font-sans font-medium text-slate-600">· {optionalText}</span>}
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

function SectionHeader({ index, icon, title, subtitle }: { index: number; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4 mb-7 pb-5 border-b border-white/[0.07]">
      <div className="shrink-0 font-mono text-[34px] leading-none font-bold text-[#00893D]/70 tabular-nums select-none">
        {String(index).padStart(2, "0")}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-white font-semibold text-[18px] tracking-tight leading-tight flex items-center gap-2.5">
          <span className="text-[#3DDC84]">{icon}</span>
          {title}
        </h2>
        <p className="text-[13px] text-slate-500 mt-1">{subtitle}</p>
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
    <div role="group" aria-label={label} className="grid grid-cols-2 border border-white/12 rounded-[6px] overflow-hidden bg-[#0A0F0D]">
      {options.map((o) => {
        const selected = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.id)}
            className={`flex items-center justify-center gap-2 py-2.5 text-[12.5px] font-bold tracking-wide transition-all duration-200 ${
              selected ? "bg-[#00893D] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
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
    "w-10 h-10 rounded-[5px] bg-white/[0.04] border border-white/12 flex items-center justify-center text-slate-200 transition-all hover:bg-[#00893D]/25 hover:border-[#3DDC84]/50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/[0.04] disabled:hover:border-white/12";
  return (
    <div className="w-full rounded-[6px] bg-[#0E1511] border border-white/12 px-3 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3 pl-1.5 text-slate-500">
        {icon}
        <output id={id} className="text-xl font-bold text-white tabular-nums min-w-6 font-mono">
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

function SummaryRow({ label, children, done }: { label: string; children: React.ReactNode; done: boolean }) {
  return (
    <div className="flex gap-3 py-3.5 border-b border-white/[0.06] last:border-b-0">
      <span
        className={`mt-0.5 w-4 h-4 shrink-0 rounded-[3px] border flex items-center justify-center transition-colors ${
          done ? "bg-[#00893D] border-[#3DDC84]" : "border-white/20"
        }`}
        aria-hidden
      >
        {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">{label}</div>
        <div className="text-[13.5px] font-semibold text-slate-100 mt-0.5 break-words">{children}</div>
      </div>
    </div>
  );
}

export default function SchaefflerMotionLandingPage() {
  const router = useRouter();
  const [lang, setLang] = useMxLang();
  const tx = makeTx(lang);

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<PortalUser | null>(null);
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
        const res = await fetch("/api/schaefflermotion-auth/session", { cache: "no-store" });
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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/schaefflermotion-auth/logout", { method: "POST" });
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
    if (!value) {
      const label = fieldLabels[key];
      return tx("errRequired", { field: label });
    }
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
        headers: { "Content-Type": "application/json", "x-partner-portal": "schaefflermotion" },
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
        router.push("/schaefflermotion/auth");
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
    if (token.startsWith("srv:")) return translateServerMessage(lang, token.slice(4));
    if (token.startsWith("i18n:")) return tx(token.slice(5));
    return token;
  };

  const visibleSubmitErrors = submitErrors.filter((e) => !e.startsWith("field:") || !!fieldError(e.slice(6), true));

  const minDate = useMemo(() => todayLocal(), []);
  const errorId = (key: string) => `err-${key}`;
  const describedBy = (key: string) => (fieldError(key) ? errorId(key) : undefined);

  const prettyDate = (d: string) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    if (!m) return d;
    return new Intl.DateTimeFormat(MX_LOCALE[lang], { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))),
    );
  };

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#0B100E] text-slate-300 flex flex-col">
        <MxBackdrop />
        <div className="relative z-10 h-[3px] w-full bg-[linear-gradient(90deg,#00893D,#3DDC84_55%,transparent)]" />
        <div className="relative z-10 flex-1 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <PannonChip className="h-10" />
              <span className="w-px h-6 bg-white/15" />
              <SchaefflerChip className="h-10" />
            </div>
            <div className="flex items-center gap-3 font-mono text-[12px] tracking-[0.12em] text-slate-400">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }} className="w-4 h-4 rounded-full border-2 border-white/10 border-t-[#3DDC84]" />
              {tx("checkingAccess")}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <SchaefflerMotionPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0B100E] flex flex-col items-center justify-center overflow-hidden font-sans">
        <MxBackdrop />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-4 mb-12"
          >
            <PannonChip className="h-12 px-3" imgClass="h-[20px] w-auto" />
            <span className="w-px h-7 bg-white/20" />
            <SchaefflerChip className="h-12 px-3" imgClass="h-[17px] w-auto" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center">
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#3DDC84] font-bold mb-2">{COMPANY}</p>
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 font-medium">{tx("premiumTag")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-12 w-72">
            <div className="h-[3px] w-full bg-white/[0.07] relative overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.4 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#00893D] to-[#3DDC84] shadow-[0_0_14px_rgba(61,220,132,0.9)]"
              />
            </div>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="mt-4 text-center font-mono text-[10px] tracking-[0.28em] text-[#3DDC84] uppercase font-bold">
              {tx("preparing")}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const typeLabel = transferType === "standard" ? tx("typeStandard") : tx("typeExecutive");
  const hasRoute = fromAddress.trim() && toAddress.trim();

  return (
    <div className="min-h-screen bg-[#0B100E] text-slate-300 font-sans selection:bg-[#00893D]/40 relative overflow-x-clip">
      <MxBackdrop />

      <MxHeader lang={lang} onLangChange={setLang} email={authedUser.email} scrolled={scrolled} active="booking" onLogout={handleLogout} />

      <main id="booking" className="relative z-10 pt-[112px] lg:pt-[92px] pb-24 px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mb-9 pt-6">
            <div className="inline-flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] uppercase text-[#3DDC84] mb-4">
              <span className="w-2 h-2 bg-[#3DDC84] rounded-[1px] shadow-[0_0_10px_rgba(61,220,132,0.9)]" />
              {tx("heroEyebrow")}
            </div>
            <h1 className="text-[36px] sm:text-[52px] font-semibold tracking-[-0.03em] text-white leading-[1.04]">{tx("heroTitle")}</h1>
            <p className="mt-4 text-[15px] sm:text-[16px] text-slate-400 max-w-2xl leading-relaxed">{tx("heroSubtitle")}</p>
          </motion.div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[10px] bg-[#111815]/95 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.55)] max-w-[760px] mx-auto"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#00893D] via-[#3DDC84] to-transparent" />
              <div className="p-8 sm:p-14 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 rounded-[14px] bg-[#00893D]/15 flex items-center justify-center border border-[#3DDC84]/40 shadow-[0_0_50px_rgba(0,137,61,0.35)] mb-8"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#3DDC84]" strokeWidth={2.2} />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">{tx("okTitle")}</h2>
                <p className="text-slate-400 text-[15px] mb-8">{tx("okSub")}</p>

                <div className="mb-8">
                  <span className="font-mono text-[10.5px] font-bold tracking-[0.24em] uppercase text-slate-500 mb-2 block">{tx("okCode")}</span>
                  <div className="inline-flex items-center px-7 py-3.5 rounded-[8px] bg-[#00893D]/15 border border-[#3DDC84]/40">
                    <span className="text-3xl sm:text-4xl font-bold text-white tracking-wider font-mono">#{lastBookingCode}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 max-w-md mb-10 p-4 rounded-[8px] bg-white/[0.03] border border-white/[0.08] text-left">
                  <ShieldCheck className="w-4 h-4 text-[#3DDC84] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-400 leading-relaxed">{tx("okNote")}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => router.push("/schaefflermotion/bookings")}
                    className="py-3.5 px-5 rounded-[6px] bg-[#00893D] hover:bg-[#00A04A] text-white font-bold text-[12.5px] tracking-[0.12em] uppercase transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,137,61,0.4)] active:scale-[0.98]"
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
                    className="py-3.5 px-5 rounded-[6px] border border-white/15 hover:bg-white/[0.06] text-white font-bold text-[12.5px] tracking-[0.12em] uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    {tx("okNew")}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-7 items-start">
              <motion.form
                onSubmit={handleSubmit}
                noValidate
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden rounded-[10px] bg-[#111815]/92 backdrop-blur border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#00893D] via-[#3DDC84] to-transparent" />

                <div className="px-6 sm:px-10 pt-7 pb-5 border-b border-white/[0.06] lg:hidden">
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold tracking-[0.16em] uppercase mb-2.5">
                    <span className="text-slate-500">{tx("progress")}</span>
                    <span className="tabular-nums text-[#3DDC84]">
                      {validKeys.length}/{requiredTotal}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.07] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct} aria-label={tx("progress")}>
                    <motion.div initial={false} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#00893D] to-[#3DDC84]" />
                  </div>
                </div>

                <div className="px-6 sm:px-10 py-9 space-y-14">
                  <AnimatePresence initial={false}>
                    {visibleSubmitErrors.length > 0 && (
                      <motion.div key="errors" role="alert" initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <div className="rounded-[8px] bg-red-500/[0.07] border border-red-500/25 p-5">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-[5px] bg-red-500/15 flex items-center justify-center shrink-0">
                              <XCircle className="w-4 h-4 text-red-400" />
                            </div>
                            <p className="text-[14px] font-semibold text-red-300">{tx("errFixTitle")}</p>
                          </div>
                          <ul className="space-y-1.5 pl-11">
                            {visibleSubmitErrors.map((err, idx) => (
                              <li key={idx} className="text-[13px] text-red-300/90 flex items-start gap-2 leading-relaxed">
                                <span className="w-1.5 h-1.5 bg-red-400/70 mt-2 shrink-0" />
                                <span>{renderSubmitError(err)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 01 — Traveler & company */}
                  <section aria-labelledby="sec-traveler">
                    <div id="sec-traveler">
                      <SectionHeader index={1} icon={<Users className="w-[18px] h-[18px]" />} title={tx("secTraveler")} subtitle={tx("secTravelerSub")} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="mx-email" required>{tx("fEmail")}</Label>
                        <div className={inputShell(!!fieldError("travelerEmail"))}>
                          <Mail className={iconCls(!!fieldError("travelerEmail"))} />
                          <input id="mx-email" type="email" autoComplete="email" value={travelerEmail} onChange={(e) => setTravelerEmail(e.target.value)} onBlur={() => markBlurred("travelerEmail")} placeholder={tx("fEmailPh")} aria-invalid={!!fieldError("travelerEmail")} aria-describedby={describedBy("travelerEmail")} className={inputBase} />
                        </div>
                        <FieldError id={errorId("travelerEmail")} message={fieldError("travelerEmail")} />
                      </div>

                      <div>
                        <Label htmlFor="mx-name" required>{tx("fName")}</Label>
                        <div className={inputShell(!!fieldError("travelerName"))}>
                          <Users className={iconCls(!!fieldError("travelerName"))} />
                          <input id="mx-name" type="text" autoComplete="name" value={travelerName} onChange={(e) => setTravelerName(e.target.value)} onBlur={() => markBlurred("travelerName")} placeholder={tx("fNamePh")} aria-invalid={!!fieldError("travelerName")} aria-describedby={describedBy("travelerName")} className={inputBase} />
                        </div>
                        <FieldError id={errorId("travelerName")} message={fieldError("travelerName")} />
                      </div>

                      <div>
                        <Label htmlFor="mx-company">{tx("fCompany")}</Label>
                        <div className="w-full rounded-[6px] bg-[#0A0F0D] border border-white/[0.07] px-4 py-3.5 flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-slate-600 shrink-0" />
                          <input id="mx-company" type="text" value={COMPANY} readOnly tabIndex={-1} className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-white/80 cursor-not-allowed" />
                          <Check className="w-4 h-4 text-[#3DDC84]/80 shrink-0" />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="mx-phone" required>{tx("fPhone")}</Label>
                        <div className={inputShell(!!fieldError("travelerPhone"))}>
                          <Phone className={iconCls(!!fieldError("travelerPhone"))} />
                          <input id="mx-phone" type="tel" inputMode="tel" autoComplete="tel" value={travelerPhone} onChange={(e) => setTravelerPhone(e.target.value)} onBlur={() => markBlurred("travelerPhone")} placeholder={tx("fPhonePh")} aria-invalid={!!fieldError("travelerPhone")} aria-describedby={describedBy("travelerPhone")} className={inputBase} />
                        </div>
                        <p className="mt-2 text-[12px] text-slate-500">{tx("fPhoneHint")}</p>
                        <FieldError id={errorId("travelerPhone")} message={fieldError("travelerPhone")} />
                      </div>
                    </div>

                    <div className="mt-6 rounded-[8px] bg-[#0A0F0D] border border-white/[0.07] p-5">
                      <div className="flex items-center gap-2.5 mb-4 font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400">
                        <UserPlus className="w-4 h-4 text-[#3DDC84]" />
                        {tx("secondTraveler")}
                        <span className="normal-case tracking-normal font-sans font-medium text-slate-600">· {tx("optional")}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="mx-email2">{tx("fSecondEmail")}</Label>
                          <div className={inputShell(false)}>
                            <Mail className={iconCls(false)} />
                            <input id="mx-email2" type="email" value={secondTravelerEmail} onChange={(e) => setSecondTravelerEmail(e.target.value)} placeholder={tx("optionalPh")} className={inputBase} />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="mx-phone2">{tx("fSecondPhone")}</Label>
                          <div className={inputShell(false)}>
                            <Phone className={iconCls(false)} />
                            <input id="mx-phone2" type="tel" inputMode="tel" value={secondTravelerPhone} onChange={(e) => setSecondTravelerPhone(e.target.value)} placeholder={tx("optionalPh")} className={inputBase} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 02 — Service & payment */}
                  <section aria-labelledby="sec-service">
                    <div id="sec-service">
                      <SectionHeader index={2} icon={<CreditCard className="w-[18px] h-[18px]" />} title={tx("secService")} subtitle={tx("secServiceSub")} />
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
                                className={`relative text-left rounded-[8px] border px-5 py-4 transition-all duration-200 active:scale-[0.99] ${
                                  selected
                                    ? "bg-[#00893D]/15 border-[#3DDC84]/60 shadow-[0_10px_30px_rgba(0,137,61,0.22)]"
                                    : "bg-[#0E1511] border-white/12 hover:border-white/30"
                                }`}
                              >
                                <span
                                  className={`absolute top-4 right-4 w-5 h-5 rounded-[4px] border flex items-center justify-center transition-all ${
                                    selected ? "bg-[#00893D] border-[#3DDC84] text-white" : "border-white/20 text-transparent"
                                  }`}
                                >
                                  <Check className="w-3 h-3" strokeWidth={3} />
                                </span>
                                <span className="block text-[16px] font-bold text-white">{opt.title}</span>
                                <span className="block text-[12px] text-slate-400 mt-0.5">{opt.sub}</span>
                                <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-slate-400">
                                  <Users className="w-3.5 h-3.5 text-[#3DDC84]" />
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

                  {/* 03 — Route & schedule */}
                  <section aria-labelledby="sec-route">
                    <div id="sec-route">
                      <SectionHeader index={3} icon={<MapPin className="w-[18px] h-[18px]" />} title={tx("secRoute")} subtitle={tx("secRouteSub")} />
                    </div>

                    <div className="relative space-y-3">
                      <div className="rounded-[8px] bg-[#0A0F0D] border border-white/[0.07] p-5 space-y-4">
                        <div className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-[2px] bg-[#3DDC84] shadow-[0_0_10px_rgba(61,220,132,0.8)]" />
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
                          <Label htmlFor="mx-from" required>{tx("fFromAddress")}</Label>
                          <div className={inputShell(!!fieldError("fromAddress"))}>
                            <MapPin className={iconCls(!!fieldError("fromAddress"))} />
                            <input id="mx-from" type="text" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} onBlur={() => markBlurred("fromAddress")} placeholder={fromType === "airport" ? tx("phFromAirport") : tx("phFromOther")} aria-invalid={!!fieldError("fromAddress")} aria-describedby={describedBy("fromAddress")} className={inputBase} />
                          </div>
                          <FieldError id={errorId("fromAddress")} message={fieldError("fromAddress")} />
                        </div>
                      </div>

                      <div className="flex justify-center -my-1.5 relative z-10" aria-hidden>
                        <div className="w-9 h-9 rounded-[6px] bg-[#00893D] border-4 border-[#111815] flex items-center justify-center shadow-[0_6px_18px_rgba(0,137,61,0.5)]">
                          <ArrowDown className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="rounded-[8px] bg-[#0A0F0D] border border-white/[0.07] p-5 space-y-4">
                        <div className="flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-slate-400">
                          <span className="w-2.5 h-2.5 rounded-[2px] border-2 border-[#3DDC84]" />
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
                          <Label htmlFor="mx-to" required>{tx("fToAddress")}</Label>
                          <div className={inputShell(!!fieldError("toAddress"))}>
                            <MapPin className={iconCls(!!fieldError("toAddress"))} />
                            <input id="mx-to" type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} onBlur={() => markBlurred("toAddress")} placeholder={toType === "airport" ? tx("phToAirport") : tx("phToOther")} aria-invalid={!!fieldError("toAddress")} aria-describedby={describedBy("toAddress")} className={inputBase} />
                          </div>
                          <FieldError id={errorId("toAddress")} message={fieldError("toAddress")} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Label htmlFor="mx-flight" required>{tx("fFlight")}</Label>
                      <div className={inputShell(!!fieldError("flightNumber"))}>
                        <Plane className={iconCls(!!fieldError("flightNumber"))} />
                        <input id="mx-flight" type="text" autoCapitalize="characters" autoComplete="off" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value.toUpperCase())} onBlur={() => markBlurred("flightNumber")} placeholder={tx("phFlight")} aria-invalid={!!fieldError("flightNumber")} aria-describedby={describedBy("flightNumber")} className={`${inputBase} uppercase tracking-wide font-mono`} />
                      </div>
                      <p className="mt-2 text-[12px] text-slate-500">{tx("flightHint")}</p>
                      <FieldError id={errorId("flightNumber")} message={fieldError("flightNumber")} />
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label htmlFor="mx-date" required>{tx("fDate")}</Label>
                        <div className={inputShell(!!fieldError("pickupDate"))}>
                          <Calendar className={iconCls(!!fieldError("pickupDate"))} />
                          <input id="mx-date" type="date" min={minDate} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} onBlur={() => markBlurred("pickupDate")} aria-invalid={!!fieldError("pickupDate")} aria-describedby={describedBy("pickupDate")} className={`${inputBase} [color-scheme:dark]`} />
                        </div>
                        <FieldError id={errorId("pickupDate")} message={fieldError("pickupDate")} />
                      </div>
                      <div>
                        <Label htmlFor="mx-time" required>{tx("fTime")}</Label>
                        <div className={inputShell(!!fieldError("pickupTime"))}>
                          <Clock className={iconCls(!!fieldError("pickupTime"))} />
                          <input id="mx-time" type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} onBlur={() => markBlurred("pickupTime")} aria-invalid={!!fieldError("pickupTime")} aria-describedby={describedBy("pickupTime")} className={`${inputBase} [color-scheme:dark]`} />
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
                        <Label htmlFor="mx-travelers" required>{tx("fTravelers")}</Label>
                        <Counter id="mx-travelers" icon={<Users className="w-4 h-4" />} value={travelers} min={1} max={maxPax} onChange={changeTravelers} decreaseLabel={tx("decrease")} increaseLabel={tx("increase")} />
                        <p className="mt-2 text-[12px] text-slate-500">{tx("upToPax", { n: maxPax })}</p>
                      </div>
                      <div>
                        <Label htmlFor="mx-luggage" required>{tx("fLuggage")}</Label>
                        <Counter id="mx-luggage" icon={<Luggage className="w-4 h-4" />} value={luggage} min={0} max={maxLuggage} onChange={setLuggage} decreaseLabel={tx("decrease")} increaseLabel={tx("increase")} />
                        <p className="mt-2 text-[12px] text-slate-500">{tx("luggageHint", { n: maxLuggage })}</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Label htmlFor="mx-comment" optionalText={tx("optional")}>{tx("fComment")}</Label>
                      <div className={`${inputShell(false)} items-start`}>
                        <MessageSquare className="w-4 h-4 text-slate-500 shrink-0 mt-1 group-focus-within:text-[#3DDC84]" />
                        <textarea id="mx-comment" rows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder={tx("phComment")} className={`${inputBase} resize-none`} />
                      </div>
                    </div>
                  </section>

                  <div className="pt-8 border-t border-white/[0.07]">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className={`w-full rounded-[6px] font-bold text-[13px] tracking-[0.16em] uppercase transition-all duration-300 flex justify-center items-center gap-3 py-4 active:scale-[0.99] ${
                        formLoading
                          ? "bg-[#00893D]/60 text-white/80 cursor-not-allowed"
                          : "bg-[#00893D] hover:bg-[#00A04A] text-white shadow-[0_12px_32px_rgba(0,137,61,0.4)] hover:shadow-[0_16px_40px_rgba(0,137,61,0.55)]"
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

              <aside className="hidden lg:block sticky top-[100px]">
                <div className="relative overflow-hidden rounded-[10px] bg-[#111815]/92 backdrop-blur border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                  <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#00893D] via-[#3DDC84] to-transparent" />
                  <div className="px-6 pt-7 pb-5 border-b border-white/[0.06]">
                    <div className="font-mono text-[10.5px] font-bold tracking-[0.24em] uppercase text-[#3DDC84] mb-3">{tx("summaryTitle")}</div>
                    <div className="flex items-end justify-between mb-2.5">
                      <span className="text-[12px] text-slate-500">{tx("progress")}</span>
                      <span className="font-mono text-[22px] font-bold text-white tabular-nums leading-none">
                        {validKeys.length}
                        <span className="text-slate-600 text-[15px]">/{requiredTotal}</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.07] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct} aria-label={tx("progress")}>
                      <motion.div initial={false} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[#00893D] to-[#3DDC84] shadow-[0_0_12px_rgba(61,220,132,0.6)]" />
                    </div>
                  </div>
                  <div className="px-6 py-2">
                    <SummaryRow label={tx("summaryRoute")} done={!!hasRoute}>
                      {hasRoute ? (
                        <>
                          <span className="block truncate">{fromAddress.trim()}</span>
                          <span className="block text-[#3DDC84] text-[11px] leading-5">↓</span>
                          <span className="block truncate">{toAddress.trim()}</span>
                        </>
                      ) : (
                        <span className="text-slate-600 font-medium">{tx("summaryEmpty")}</span>
                      )}
                    </SummaryRow>
                    <SummaryRow label={tx("summaryWhen")} done={!!(pickupDate && pickupTime)}>
                      {pickupDate && pickupTime ? (
                        <span className="font-mono">
                          {prettyDate(pickupDate)} · {pickupTime}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-medium">{tx("summaryEmpty")}</span>
                      )}
                    </SummaryRow>
                    <SummaryRow label={tx("fFlight")} done={!!flightNumber.trim()}>
                      {flightNumber.trim() ? <span className="font-mono tracking-wide">{flightNumber.trim()}</span> : <span className="text-slate-600 font-medium">{tx("summaryEmpty")}</span>}
                    </SummaryRow>
                    <SummaryRow label={tx("summaryParty")} done>
                      <span className="font-mono">
                        {tx("summaryPax", { n: travelers })} · {tx("summaryBags", { n: luggage })}
                      </span>
                    </SummaryRow>
                    <SummaryRow label={tx("summaryClass")} done>
                      {typeLabel}
                    </SummaryRow>
                  </div>
                  <div className="px-6 py-5 border-t border-white/[0.06] bg-white/[0.015] flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#3DDC84] shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate-500 leading-relaxed">{tx("summaryNote")}</p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <MxFooter lang={lang} />
    </div>
  );
}
