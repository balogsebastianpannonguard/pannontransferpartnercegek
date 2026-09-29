"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  CreditCard,
  Plane,
  Map,
  Plus,
  Minus,
  Luggage,
  Loader2,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import NiLanguageSwitcher from "../../components/NiLanguageSwitcher";
import { useNiLanguage } from "../../useNiLanguage";

interface Props {
  token: string;
}

export default function BookPageClient({ token }: Props) {
  const { tr, msg, msgList, portalLanguage } = useNiLanguage();
  const languageSwitcherRef = useRef<HTMLDivElement>(null);

  const [checking, setChecking] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [invalidLink, setInvalidLink] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastBookingCode, setLastBookingCode] = useState<string | null>(null);
  const [lastTrackToken, setLastTrackToken] = useState<string | null>(null);
  const [showValidationInline, setShowValidationInline] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [blurredFields, setBlurredFields] = useState<Record<string, boolean>>({});

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

  const [fromType, setFromType] = useState<"airport" | "other">("airport");
  const [toType, setToType] = useState<"airport" | "other">("other");
  const [travelers, setTravelers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [transferType, setTransferType] = useState<"standard" | "executive">("standard");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/book/${encodeURIComponent(token)}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!active) return;
        if (res.ok && json?.success) {
          setCompanyName(json.companyName || null);
        } else {
          setInvalidLink(true);
        }
      } catch {
        if (active) setInvalidLink(true);
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => {
    const buttons = languageSwitcherRef.current?.querySelectorAll("button");
    if (!buttons?.length) return;

    buttons.forEach((button) => {
      const label = button.textContent === "HU" ? tr("Magyar", "Hungarian") : "English";
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });
  }, [tr]);

  const requiredFields: Record<string, { value: string; requiredMessage: string; matchers: string[] }> = {
    travelerEmail: {
      value: travelerEmail,
      requiredMessage: tr("Email megadása kötelező", "Passenger email address is required"),
      matchers: ["email", "e-mail"],
    },
    travelerName: {
      value: travelerName,
      requiredMessage: tr("Név megadása kötelező", "Passenger name is required"),
      matchers: ["utas", "traveler", "traveller", "passenger", "név", "name"],
    },
    travelerPhone: {
      value: travelerPhone,
      requiredMessage: tr("Telefonszám megadása kötelező", "Passenger phone number is required"),
      matchers: ["telefonszám", "phone", "telephone"],
    },
    fromAddress: {
      value: fromAddress,
      requiredMessage: tr("Felvételi cím megadása kötelező", "Pick-up address is required"),
      matchers: ["from", "honnan", "kiindulási", "felvételi", "pick-up", "pickup"],
    },
    toAddress: {
      value: toAddress,
      requiredMessage: tr("Érkezési cím megadása kötelező", "Destination address is required"),
      matchers: ["to", "hova", "érkezési", "destination", "célállomás"],
    },
    ...(fromType === "airport" || toType === "airport"
      ? {
          flightNumber: {
            value: flightNumber,
            requiredMessage: tr("Járatszám megadása kötelező", "Flight number is required"),
            matchers: ["flight", "járatszám"],
          },
        }
      : {}),
    pickupDate: {
      value: pickupDate,
      requiredMessage: tr("Dátum megadása kötelező", "Pick-up date is required"),
      matchers: ["date", "dátum"],
    },
    pickupTime: {
      value: pickupTime,
      requiredMessage: tr("Időpont megadása kötelező", "Pick-up time is required"),
      matchers: ["time", "idő", "időpont"],
    },
  };

  const missingRequiredErrors = Object.entries(requiredFields)
    .filter(([, field]) => !field.value.trim())
    .map(([, field]) => field.requiredMessage);
  const visibleSubmitErrors = submitErrors.length > 0 ? msgList(submitErrors) : hasAttemptedSubmit ? missingRequiredErrors : [];

  const getFieldError = (fieldKey: string): string | null => {
    if (!submitErrors.length && !showValidationInline) return null;
    const field = requiredFields[fieldKey];
    if (!field) return null;

    if ((showValidationInline || submitErrors.length > 0) && !field.value.trim()) {
      return field.requiredMessage;
    }

    for (const err of submitErrors) {
      const lowerErr = err.toLowerCase();
      if (field.matchers.some((matcher) => lowerErr.includes(matcher))) {
        return msg(err) || err;
      }
    }

    return null;
  };

  const isFieldInvalid = (fieldKey: string): boolean => {
    const inlineCheck =
      showValidationInline && blurredFields[fieldKey] && requiredFields[fieldKey] && !requiredFields[fieldKey].value.trim();
    const submitCheck = submitErrors.length > 0 && getFieldError(fieldKey) !== null;
    return inlineCheck || submitCheck;
  };

  const handleBlur = (fieldKey: string) => {
    setBlurredFields((prev) => ({ ...prev, [fieldKey]: true }));
    setShowValidationInline(true);
  };

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
    setFromType("airport");
    setToType("other");
    setTravelers(1);
    setLuggage(1);
    setTransferType("standard");
    setSubmitErrors([]);
    setSubmitSuccess(false);
    setLastBookingCode(null);
    setLastTrackToken(null);
    setShowValidationInline(false);
    setHasAttemptedSubmit(false);
    setBlurredFields({});
  };

  const handleSubmit = async () => {
    setSubmitErrors([]);
    setShowValidationInline(true);
    setHasAttemptedSubmit(true);
    setBlurredFields((prev) => ({
      ...prev,
      ...Object.fromEntries(Object.keys(requiredFields).map((key) => [key, true])),
    }));

    if (missingRequiredErrors.length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        travelerEmail,
        travelerName,
        travelerPhone,
        secondTravelerEmail: secondTravelerEmail || undefined,
        secondTravelerPhone: secondTravelerPhone || undefined,
        transferType,
        fromType,
        fromAddress,
        toType,
        toAddress,
        flightNumber: fromType === "airport" || toType === "airport" ? flightNumber : undefined,
        pickupDate,
        pickupTime,
        travelers,
        luggage,
        comment: commentText || undefined,
        language: portalLanguage,
      };
      const res = await fetch(`/api/book/${encodeURIComponent(token)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data?.success && data?.booking) {
        setSubmitSuccess(true);
        setLastBookingCode(data.booking.bookingCode);
        setLastTrackToken(data.booking.bookingTrackToken || null);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 400) {
        if (data?.errors && Array.isArray(data.errors)) {
          setSubmitErrors(data.errors);
        } else {
          setSubmitErrors([data?.message || tr("Érvénytelen adatok, kérjük ellenőrizze az űrlapot", "Invalid data. Please review the form.")]);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 404) {
        setInvalidLink(true);
      } else {
        setSubmitErrors([data?.message || tr("Váratlan hiba történt, kérjük próbálja újra", "An unexpected error occurred. Please try again.")]);
      }
    } catch {
      setSubmitErrors([tr("Hálózati hiba történt, kérjük próbálja újra", "A network error occurred. Please try again.")]);
    } finally {
      setFormLoading(false);
    }
  };

  const bgShell = (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,92,203,0.34),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(65,182,121,0.2),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(4,38,86,0.72),transparent_50%),linear-gradient(135deg,#020613_0%,#051326_36%,#062043_68%,#071628_100%)]" />
      <div className="absolute left-[-10%] top-[-8%] h-[30rem] w-[30rem] rounded-full bg-[#41B679]/16 blur-[120px]" />
      <div className="absolute right-[-12%] top-[4%] h-[36rem] w-[36rem] rounded-full bg-[#0A5CCB]/22 blur-[140px]" />
    </div>
  );

  const languageSwitcher = (
    <div
      ref={languageSwitcherRef}
      className="rounded-xl border border-white/10 bg-[#040E1B]/70 px-2 py-1 backdrop-blur-xl"
    >
      <NiLanguageSwitcher />
    </div>
  );

  if (checking) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex items-center justify-center overflow-hidden">
        {bgShell}
        <div className="absolute right-6 top-6 z-20">{languageSwitcher}</div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#41B679]" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">{tr("Foglalási link ellenőrzése...", "Checking booking link...")}</p>
        </div>
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex items-center justify-center overflow-hidden px-6">
        {bgShell}
        <div className="absolute right-6 top-6 z-20">{languageSwitcher}</div>
        <div className="relative z-10 max-w-md w-full bg-[#040E1B] border border-slate-800/80 rounded-3xl p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{tr("Érvénytelen link", "Invalid link")}</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            {tr(
              "Ez a foglalási link érvénytelen, lejárt vagy inaktiválva lett. Kérjük, forduljon a céges kapcsolattartójához egy új link igényléséhez.",
              "This booking link is invalid, has expired, or has been deactivated. Please contact your company coordinator to request a new link."
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030816] text-white overflow-hidden">
      {bgShell}
      <div className="w-full border-b border-white/10 bg-[#030816]/72 backdrop-blur-xl relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-white leading-none">Pannon Transfer</span>
            <span className="text-[11px] text-slate-400 mt-0.5 tracking-wide">{tr("Céges foglalási link", "Company booking link")} · {companyName}</span>
          </div>
          <div className="flex items-center gap-3">
            {languageSwitcher}
            <ShieldCheck className="w-5 h-5 text-[#41B679] shrink-0" />
          </div>
        </div>
      </div>

      <section className="relative pt-14 pb-24 px-6 min-h-screen flex items-start justify-center z-10">
        <div className="max-w-[1320px] mx-auto w-full">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#040E1B] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800/80 overflow-hidden relative max-w-2xl mx-auto backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#41B679] to-transparent" />
              <div className="p-10 md:p-16 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#41B679]/20 to-[#10B981]/10 flex items-center justify-center border-2 border-[#41B679]/30 shadow-[0_0_40px_rgba(65,182,121,0.25)] mb-8">
                  <CheckCircle2 className="w-14 h-14 text-[#41B679]" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">{tr("Foglalása sikeresen elküldve!", "Your booking has been submitted successfully!")}</h2>
                <p className="text-slate-400 text-sm md:text-base mb-6">{tr("Visszaigazoló e-mail elküldve az Ön email címére", "A confirmation email has been sent to your email address")}</p>
                <div className="mb-8">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-2 block">{tr("Foglalási kód", "Booking code")}</span>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#003E7E]/20 to-[#002A54]/15 border border-[#003E7E]/30 shadow-[0_0_25px_rgba(0,62,126,0.2)]">
                    <span className="text-3xl md:text-4xl font-black text-white tracking-wider font-mono">#{lastBookingCode}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 max-w-md mb-10 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <ShieldCheck className="w-4 h-4 text-[#41B679] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-400 text-left leading-relaxed">
                    {tr(
                      "Amint a diszpécserünk jóváhagyja, email értesítést küldünk Önnek. Az egyedi linkjén bármikor nyomon követheti a foglalás állapotát.",
                      "Once our dispatcher approves it, we will send you an email notification. You can track the status of your booking at any time using your unique link."
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                  {lastTrackToken && (
                    <a
                      href={`/track/${lastTrackToken}`}
                      className="py-4 px-5 rounded-xl bg-[#003E7E] hover:bg-[#002A54] text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,62,126,0.3)] hover:shadow-[0_0_30px_rgba(0,62,126,0.5)]"
                    >
                      {tr("Foglalás követése", "Track booking")}
                    </a>
                  )}
                  <button
                    onClick={() => {
                      resetForm();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="py-4 px-5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    {tr("Új foglalás", "New booking")}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="relative max-w-5xl mx-auto">
              <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-[#41B679]/12 blur-[120px]" />
              <div className="pointer-events-none absolute -right-12 top-0 h-72 w-72 rounded-full bg-[#0A5CCB]/18 blur-[140px]" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-[linear-gradient(180deg,rgba(5,15,31,0.96),rgba(3,10,21,0.97))] rounded-[34px] shadow-[0_38px_120px_rgba(0,0,0,0.55)] border border-white/10 overflow-hidden relative backdrop-blur-3xl"
              >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#41B679] to-[#0A5CCB]" />
                <div className="relative p-8 md:p-12 space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-[#41B679]/20 flex items-center justify-center text-[#10B981] font-bold text-sm border border-[#41B679]/30">1</div>
                      <h3 className="text-white font-semibold text-lg tracking-wide">{tr("Utas és Céges adatok", "Passenger and company details")}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Az utas e-mail címe", "Passenger email address")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div
                          className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerEmail") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                        >
                          <Mail className={`w-4 h-4 ${isFieldInvalid("travelerEmail") ? "text-red-400" : "text-slate-500"}`} />
                          <input
                            type="email"
                            value={travelerEmail}
                            onChange={(e) => setTravelerEmail(e.target.value)}
                            onBlur={() => handleBlur("travelerEmail")}
                            placeholder={tr("E-mail cím", "Email address")}
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                        {getFieldError("travelerEmail") && (
                          <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {getFieldError("travelerEmail")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Az utas neve", "Passenger name")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div
                          className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerName") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                        >
                          <Users className={`w-4 h-4 ${isFieldInvalid("travelerName") ? "text-red-400" : "text-slate-500"}`} />
                          <input
                            type="text"
                            value={travelerName}
                            onChange={(e) => setTravelerName(e.target.value)}
                            onBlur={() => handleBlur("travelerName")}
                            placeholder={tr("Teljes név", "Full name")}
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                        {getFieldError("travelerName") && (
                          <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {getFieldError("travelerName")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">{tr("Cégnév", "Company name")}</label>
                        <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 flex items-center gap-3 text-slate-300">
                          <Briefcase className="w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            value={companyName || ""}
                            readOnly
                            className="bg-transparent border-none outline-none w-full text-sm font-bold text-white opacity-80 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Telefonszám (csak számjegyek / 0123456789)", "Phone number (digits only / 0123456789)")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div
                          className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerPhone") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                        >
                          <Phone className={`w-4 h-4 ${isFieldInvalid("travelerPhone") ? "text-red-400" : "text-slate-500"}`} />
                          <input
                            type="tel"
                            value={travelerPhone}
                            onChange={(e) => setTravelerPhone(e.target.value)}
                            onBlur={() => handleBlur("travelerPhone")}
                            placeholder="+36..."
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                        {getFieldError("travelerPhone") && (
                          <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {getFieldError("travelerPhone")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/50">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">{tr("2. utas e-mail címe (opcionális)", "Second passenger's email (optional)")}</label>
                        <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <input
                            type="email"
                            value={secondTravelerEmail}
                            onChange={(e) => setSecondTravelerEmail(e.target.value)}
                            placeholder={tr("Opcionális", "Optional")}
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">{tr("2. utas telefonszáma (opcionális)", "Second passenger's phone (optional)")}</label>
                        <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <input
                            type="tel"
                            value={secondTravelerPhone}
                            onChange={(e) => setSecondTravelerPhone(e.target.value)}
                            placeholder={tr("Opcionális", "Optional")}
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-[#41B679]/20 flex items-center justify-center text-[#10B981] font-bold text-sm border border-[#41B679]/30">2</div>
                      <h3 className="text-white font-semibold text-lg tracking-wide">{tr("Fizetés és Típus", "Payment and transfer type")}</h3>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                        {tr("Fizetési mód", "Payment method")} <span className="text-[#41B679]">*</span>
                      </label>
                      <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                        <div className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 relative z-10 text-white">
                          <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          <CreditCard className="w-4 h-4 text-[#41B679]" />
                          <span className="text-sm font-bold">{tr("Bankkártya", "Credit card")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                        {tr("Transzfer típusa", "Transfer type")} <span className="text-[#41B679]">*</span>
                      </label>
                      <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                        <button
                          onClick={() => setTransferType("standard")}
                          className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative z-10 ${transferType === "standard" ? "text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          {transferType === "standard" && (
                            <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          )}
                          <span className="text-sm font-bold">Standard</span>
                          <span className="text-[10px] opacity-70">{tr("Economy osztály", "Economy class")}</span>
                        </button>
                        <button
                          onClick={() => setTransferType("executive")}
                          className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative z-10 ${transferType === "executive" ? "text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          {transferType === "executive" && (
                            <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          )}
                          <span className={`text-sm font-bold ${transferType === "executive" ? "text-[#41B679]" : ""}`}>Executive</span>
                          <span className="text-[10px] opacity-70">{tr("Business osztály", "Business class")}</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 bg-[#0F172A]/50 p-6 rounded-3xl border border-white/5">
                      <div className="space-y-3">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">{tr("Felvétel helye", "From")}</label>
                        <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                          <button
                            onClick={() => setFromType("airport")}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${fromType === "airport" ? "text-white" : "text-slate-400 hover:text-white"}`}
                          >
                            {fromType === "airport" && <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />}
                            <Plane className="w-4 h-4" />
                            <span className="text-sm font-bold">{tr("Repülőtér", "Airport")}</span>
                          </button>
                          <button
                            onClick={() => {
                              setFromType("other");
                              if (toType !== "airport") setFlightNumber("");
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${fromType === "other" ? "text-white" : "text-slate-400 hover:text-white"}`}
                          >
                            {fromType === "other" && <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />}
                            <Map className="w-4 h-4" />
                            <span className="text-sm font-bold">{tr("Egyéb", "Other")}</span>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Felvételi cím", "Pick-up address")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div
                          className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("fromAddress") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                        >
                          <MapPin className={`w-4 h-4 ${isFieldInvalid("fromAddress") ? "text-red-400" : "text-slate-500"}`} />
                          <input
                            type="text"
                            value={fromAddress}
                            onChange={(e) => setFromAddress(e.target.value)}
                            onBlur={() => handleBlur("fromAddress")}
                            placeholder={
                              fromType === "airport"
                                ? tr("pl. Budapest Liszt Ferenc repülőtér (BUD)", "e.g. Budapest Airport (BUD)")
                                : tr("pl. NI Debrecen Gyár...", "e.g. NI Debrecen Plant...")
                            }
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                        {getFieldError("fromAddress") && (
                          <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {getFieldError("fromAddress")}
                          </p>
                        )}
                        {fromType === "airport" && (
                          <div className="space-y-2 pt-3">
                            <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                              {tr("Járatszám", "Flight number")} <span className="text-[#10B981]">*</span>
                            </label>
                            <div
                              className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("flightNumber") ? "border-red-500/70 ring-1 ring-red-500/20" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                            >
                              <Plane className="w-4 h-4 text-slate-500" />
                              <input
                                type="text"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                onBlur={() => handleBlur("flightNumber")}
                                placeholder={tr("pl. LH1234", "e.g. LH1234")}
                                className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                              />
                            </div>
                            {getFieldError("flightNumber") && (
                              <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                {getFieldError("flightNumber")}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 bg-[#0F172A]/50 p-6 rounded-3xl border border-white/5">
                      <div className="space-y-3">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">{tr("Úti cél", "To")}</label>
                        <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                          <button
                            onClick={() => setToType("airport")}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${toType === "airport" ? "text-white" : "text-slate-400 hover:text-white"}`}
                          >
                            {toType === "airport" && <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />}
                            <Plane className="w-4 h-4" />
                            <span className="text-sm font-bold">{tr("Repülőtér", "Airport")}</span>
                          </button>
                          <button
                            onClick={() => {
                              setToType("other");
                              if (fromType !== "airport") setFlightNumber("");
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${toType === "other" ? "text-white" : "text-slate-400 hover:text-white"}`}
                          >
                            {toType === "other" && <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />}
                            <Map className="w-4 h-4" />
                            <span className="text-sm font-bold">{tr("Egyéb", "Other")}</span>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Érkezési cím", "Destination address")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div
                          className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("toAddress") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                        >
                          <MapPin className={`w-4 h-4 ${isFieldInvalid("toAddress") ? "text-red-400" : "text-slate-500"}`} />
                          <input
                            type="text"
                            value={toAddress}
                            onChange={(e) => setToAddress(e.target.value)}
                            onBlur={() => handleBlur("toAddress")}
                            placeholder={
                              toType === "airport"
                                ? tr("pl. Budapest Liszt Ferenc repülőtér (BUD)", "e.g. Budapest Airport (BUD)")
                                : tr("pl. NI Debrecen Gyár...", "e.g. NI Debrecen Plant...")
                            }
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                        {getFieldError("toAddress") && (
                          <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {getFieldError("toAddress")}
                          </p>
                        )}
                        {toType === "airport" && (
                          <div className="space-y-2 pt-3">
                            <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                              {tr("Járatszám", "Flight number")} <span className="text-[#10B981]">*</span>
                            </label>
                            <div
                              className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("flightNumber") ? "border-red-500/70 ring-1 ring-red-500/20" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                            >
                              <Plane className="w-4 h-4 text-slate-500" />
                              <input
                                type="text"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                onBlur={() => handleBlur("flightNumber")}
                                placeholder={tr("pl. LH1234", "e.g. LH1234")}
                                className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                              />
                            </div>
                            {getFieldError("flightNumber") && (
                              <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                {getFieldError("flightNumber")}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Felvétel dátuma", "Pick-up date")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div
                          className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center justify-between text-slate-300 transition-all border ${isFieldInvalid("pickupDate") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                        >
                          <input
                            type="date"
                            value={pickupDate}
                            onChange={(e) => setPickupDate(e.target.value)}
                            onBlur={() => handleBlur("pickupDate")}
                            className="bg-transparent border-none outline-none w-full text-sm font-medium text-white [color-scheme:dark]"
                          />
                        </div>
                        {getFieldError("pickupDate") && (
                          <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {getFieldError("pickupDate")}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Felvétel ideje", "Pick-up time")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div
                          className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center justify-between text-slate-300 transition-all border ${isFieldInvalid("pickupTime") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                        >
                          <input
                            type="time"
                            value={pickupTime}
                            onChange={(e) => setPickupTime(e.target.value)}
                            onBlur={() => handleBlur("pickupTime")}
                            className="bg-transparent border-none outline-none w-full text-sm font-medium text-white [color-scheme:dark]"
                          />
                        </div>
                        {getFieldError("pickupTime") && (
                          <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {getFieldError("pickupTime")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Utasok száma", "Number of passengers")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-white">
                          <div className="flex items-center gap-3 px-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-bold">{travelers}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setTravelers(Math.max(1, travelers - 1))}
                              type="button"
                              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#41B679]/20 hover:text-[#41B679] flex items-center justify-center transition-colors"
                              aria-label={tr("Utasok számának csökkentése", "Decrease passenger count")}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setTravelers(travelers + 1)}
                              type="button"
                              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#41B679]/20 hover:text-[#41B679] flex items-center justify-center transition-colors"
                              aria-label={tr("Utasok számának növelése", "Increase passenger count")}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          {tr("Csomagok száma", "Number of luggage items")} <span className="text-[#10B981]">*</span>
                        </label>
                        <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-white">
                          <div className="flex items-center gap-3 px-2">
                            <Luggage className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-bold">{luggage}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setLuggage(Math.max(0, luggage - 1))}
                              type="button"
                              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#41B679]/20 hover:text-[#41B679] flex items-center justify-center transition-colors"
                              aria-label={tr("Csomagok számának csökkentése", "Decrease luggage count")}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setLuggage(luggage + 1)}
                              type="button"
                              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#41B679]/20 hover:text-[#41B679] flex items-center justify-center transition-colors"
                              aria-label={tr("Csomagok számának növelése", "Increase luggage count")}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">{tr("Megjegyzés", "Comment")}</label>
                      <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                        <textarea
                          rows={3}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={tr("Bármilyen különleges kérés vagy utasítás...", "Any special requests or instructions...")}
                          className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {visibleSubmitErrors.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl bg-red-500/[0.08] border border-red-500/20 p-5 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                              <XCircle className="w-4 h-4 text-red-400" />
                            </div>
                            <p className="text-[13px] font-bold text-red-300 tracking-wide">{tr("Kérjük javítsa a következő hibákat:", "Please correct the following errors:")}</p>
                          </div>
                          <ul className="space-y-1.5 pl-11">
                            {visibleSubmitErrors.map((err, idx) => (
                              <li key={idx} className="text-[12px] text-red-300/90 flex items-start gap-2 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-1.5 shrink-0" />
                                <span>{err}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-6 border-t border-slate-800">
                    <button
                      onClick={handleSubmit}
                      disabled={formLoading}
                      className={`w-full rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-3 py-4.5 ${
                        formLoading
                          ? "bg-[#41B679]/60 text-white/80 cursor-not-allowed shadow-[0_0_15px_rgba(65,182,121,0.15)]"
                          : "bg-[#41B679] hover:bg-[#10B981] text-white shadow-[0_0_20px_rgba(65,182,121,0.2)] hover:shadow-[0_0_30px_rgba(65,182,121,0.35)]"
                      }`}
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {tr("Foglalás küldése folyamatban...", "Submitting booking...")}
                        </>
                      ) : (
                        <>
                          {tr("Foglalás", "Submit booking")}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
