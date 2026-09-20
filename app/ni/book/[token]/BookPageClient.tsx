"use client";

import { useState, useEffect } from "react";
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

interface Props {
  token: string;
}

export default function BookPageClient({ token }: Props) {
  const [checking, setChecking] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [invalidLink, setInvalidLink] = useState(false);

  const [formLoading, setFormLoading] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastBookingCode, setLastBookingCode] = useState<string | null>(null);
  const [lastTrackToken, setLastTrackToken] = useState<string | null>(null);
  const [showValidationInline, setShowValidationInline] = useState(false);
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
  const [transferType, setTransferType] = useState<"standard" | "executive">("executive");

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

  const requiredFields: Record<string, { value: string; label: string }> = {
    travelerEmail: { value: travelerEmail, label: "Email" },
    travelerName: { value: travelerName, label: "Név" },
    travelerPhone: { value: travelerPhone, label: "Telefonszám" },
    fromAddress: { value: fromAddress, label: "Felvételi cím" },
    toAddress: { value: toAddress, label: "Érkezési cím" },
    ...(fromType === "airport" || toType === "airport"
      ? { flightNumber: { value: flightNumber, label: "Flight number / Járatszám" } }
      : {}),
    pickupDate: { value: pickupDate, label: "Dátum" },
    pickupTime: { value: pickupTime, label: "Időpont" },
  };

  const getFieldError = (fieldKey: string): string | null => {
    if (!submitErrors.length && !showValidationInline) return null;
    const field = requiredFields[fieldKey];
    if (!field) return null;
    if (showValidationInline || submitErrors.length > 0) {
      if (!field.value.trim()) {
        return `${field.label} megadása kötelező`;
      }
    }
    for (const err of submitErrors) {
      const lowerErr = err.toLowerCase();
      const lowerLabel = field.label.toLowerCase();
      if (
        lowerErr.includes(lowerLabel) ||
        (fieldKey === "travelerEmail" && (lowerErr.includes("email") || lowerErr.includes("e-mail"))) ||
        (fieldKey === "travelerPhone" && (lowerErr.includes("phone") || lowerErr.includes("telefonszám"))) ||
        (fieldKey === "fromAddress" && (lowerErr.includes("from") || lowerErr.includes("honnan") || lowerErr.includes("indulási"))) ||
        (fieldKey === "toAddress" && (lowerErr.includes("to") || lowerErr.includes("hova") || lowerErr.includes("érkezési"))) ||
        (fieldKey === "pickupDate" && (lowerErr.includes("date") || lowerErr.includes("dátum"))) ||
        (fieldKey === "pickupTime" && (lowerErr.includes("time") || lowerErr.includes("idő") || lowerErr.includes("időpont")))
      ) {
        return err;
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
    setTransferType("executive");
    setSubmitErrors([]);
    setSubmitSuccess(false);
    setLastBookingCode(null);
    setLastTrackToken(null);
    setShowValidationInline(false);
    setBlurredFields({});
  };

  const handleSubmit = async () => {
    setSubmitErrors([]);
    setShowValidationInline(true);
    Object.keys(requiredFields).forEach((key) => {
      setBlurredFields((prev) => ({ ...prev, [key]: true }));
    });
    const missing = Object.entries(requiredFields).filter(([, v]) => !v.value.trim());
    if (missing.length > 0) {
      const errs = missing.map(([, v]) => `${v.label} megadása kötelező`);
      setSubmitErrors(errs);
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
        const errs: string[] = data?.errors && Array.isArray(data.errors) ? data.errors : ["Érvénytelen adatok, kérjük ellenőrizze az űrlapot"];
        setSubmitErrors(errs);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 404) {
        setInvalidLink(true);
      } else {
        setSubmitErrors([data?.message || "Váratlan hiba történt, kérjük próbálja újra"]);
      }
    } catch {
      setSubmitErrors(["Hálózati hiba történt, kérjük próbálja újra"]);
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

  if (checking) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex items-center justify-center overflow-hidden">
        {bgShell}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#41B679]" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">Foglalási link ellenőrzése...</p>
        </div>
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex items-center justify-center overflow-hidden px-6">
        {bgShell}
        <div className="relative z-10 max-w-md w-full bg-[#040E1B] border border-slate-800/80 rounded-3xl p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Érvénytelen link</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ez a foglalási link érvénytelen, lejárt vagy inaktiválva lett. Kérjük, forduljon a céges kapcsolattartójához egy új link igényléséhez.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030816] text-white overflow-hidden">
      {bgShell}
      <div className="w-full border-b border-white/10 bg-[#030816]/72 backdrop-blur-xl relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-white leading-none">Pannon Transfer</span>
            <span className="text-[11px] text-slate-400 mt-0.5 tracking-wide">Céges foglalási link · {companyName}</span>
          </div>
          <ShieldCheck className="w-5 h-5 text-[#41B679]" />
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
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Foglalása sikeresen elküldve!</h2>
                <p className="text-slate-400 text-sm md:text-base mb-6">Visszaigazoló e-mail elküldve az Ön email címére</p>
                <div className="mb-8">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-2 block">Foglalási kód</span>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#003E7E]/20 to-[#002A54]/15 border border-[#003E7E]/30 shadow-[0_0_25px_rgba(0,62,126,0.2)]">
                    <span className="text-3xl md:text-4xl font-black text-white tracking-wider font-mono">#{lastBookingCode}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 max-w-md mb-10 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <ShieldCheck className="w-4 h-4 text-[#41B679] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-400 text-left leading-relaxed">
                    Amint a diszpécserünk jóváhagyja, email értesítést küldünk Önnek. Az egyedi linkjén bármikor nyomon követheti a foglalás állapotát.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                  {lastTrackToken && (
                    <a
                      href={`/track/${lastTrackToken}`}
                      className="py-4 px-5 rounded-xl bg-[#003E7E] hover:bg-[#002A54] text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,62,126,0.3)] hover:shadow-[0_0_30px_rgba(0,62,126,0.5)]"
                    >
                      Foglalás követése
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
                    Új foglalás
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
                  {/* SECTION 1 */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-[#41B679]/20 flex items-center justify-center text-[#10B981] font-bold text-sm border border-[#41B679]/30">1</div>
                      <h3 className="text-white font-semibold text-lg tracking-wide">Utas és Céges adatok</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          Email address of the Traveler <span className="text-[#10B981]">*</span>
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
                            placeholder="Email"
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
                          Name of the Traveler <span className="text-[#10B981]">*</span>
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
                            placeholder="Full Name"
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
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">Company Name</label>
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
                          Phone number (only digit / 0123456789) <span className="text-[#10B981]">*</span>
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
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">2nd Traveler&apos;s email (optional)</label>
                        <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <input
                            type="email"
                            value={secondTravelerEmail}
                            onChange={(e) => setSecondTravelerEmail(e.target.value)}
                            placeholder="Optional"
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">2nd Traveler&apos;s phone (optional)</label>
                        <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <input
                            type="tel"
                            value={secondTravelerPhone}
                            onChange={(e) => setSecondTravelerPhone(e.target.value)}
                            placeholder="Optional"
                            className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Payment + Type */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                      <div className="w-8 h-8 rounded-full bg-[#41B679]/20 flex items-center justify-center text-[#10B981] font-bold text-sm border border-[#41B679]/30">2</div>
                      <h3 className="text-white font-semibold text-lg tracking-wide">Fizetés és Típus</h3>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                        Payment Method <span className="text-[#41B679]">*</span>
                      </label>
                      <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                        <div className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 relative z-10 text-white">
                          <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          <CreditCard className="w-4 h-4 text-[#41B679]" />
                          <span className="text-sm font-bold">Credit Card</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                        Transfer Type <span className="text-[#41B679]">*</span>
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
                          <span className="text-[10px] opacity-70">Economy Class</span>
                        </button>
                        <button
                          onClick={() => setTransferType("executive")}
                          className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative z-10 ${transferType === "executive" ? "text-white" : "text-slate-400 hover:text-white"}`}
                        >
                          {transferType === "executive" && (
                            <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          )}
                          <span className={`text-sm font-bold ${transferType === "executive" ? "text-[#41B679]" : ""}`}>Executive</span>
                          <span className="text-[10px] opacity-70">Business Class</span>
                        </button>
                      </div>
                    </div>

                    {/* FROM */}
                    <div className="space-y-4 bg-[#0F172A]/50 p-6 rounded-3xl border border-white/5">
                      <div className="space-y-3">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">From (Honnan?)</label>
                        <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                          <button
                            onClick={() => setFromType("airport")}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${fromType === "airport" ? "text-white" : "text-slate-400 hover:text-white"}`}
                          >
                            {fromType === "airport" && <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />}
                            <Plane className="w-4 h-4" />
                            <span className="text-sm font-bold">Airport</span>
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
                            <span className="text-sm font-bold">Other</span>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          From Address <span className="text-[#10B981]">*</span>
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
                            placeholder={fromType === "airport" ? "e.g. Budapest Airport (BUD)" : "e.g. NI Debrecen Gyár..."}
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
                              Flight number / Járatszám <span className="text-[#10B981]">*</span>
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
                                placeholder="pl. LH1234"
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

                    {/* TO */}
                    <div className="space-y-4 bg-[#0F172A]/50 p-6 rounded-3xl border border-white/5">
                      <div className="space-y-3">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">To (Hova?)</label>
                        <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                          <button
                            onClick={() => setToType("airport")}
                            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${toType === "airport" ? "text-white" : "text-slate-400 hover:text-white"}`}
                          >
                            {toType === "airport" && <div className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />}
                            <Plane className="w-4 h-4" />
                            <span className="text-sm font-bold">Airport</span>
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
                            <span className="text-sm font-bold">Other</span>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          To Address <span className="text-[#10B981]">*</span>
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
                            placeholder={toType === "airport" ? "e.g. Budapest Airport (BUD)" : "e.g. NI Debrecen Gyár..."}
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
                              Flight number / Járatszám <span className="text-[#10B981]">*</span>
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
                                placeholder="pl. LH1234"
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

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          When (Date) <span className="text-[#10B981]">*</span>
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
                          Time <span className="text-[#10B981]">*</span>
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

                    {/* Counters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          Number of the Travelers <span className="text-[#10B981]">*</span>
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
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setTravelers(travelers + 1)}
                              type="button"
                              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#41B679]/20 hover:text-[#41B679] flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                          Number of the luggage <span className="text-[#10B981]">*</span>
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
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setLuggage(luggage + 1)}
                              type="button"
                              className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#41B679]/20 hover:text-[#41B679] flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">Comment</label>
                      <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                        <textarea
                          rows={3}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Any special requests or instructions..."
                          className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {submitErrors.length > 0 && (
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
                            <p className="text-[13px] font-bold text-red-300 tracking-wide">Kérjük javítsa a következő hibákat:</p>
                          </div>
                          <ul className="space-y-1.5 pl-11">
                            {submitErrors.map((err, idx) => (
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
                          : "bg-[#41B679] hover:bg-[#10B981] text-white shadow-[0_0_20px_rgba(65,182,121,0.3)] hover:shadow-[0_0_30px_rgba(65,182,121,0.5)]"
                      }`}
                    >
                      {formLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Foglalás küldése folyamatban...
                        </>
                      ) : (
                        <>
                          Foglalás
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
