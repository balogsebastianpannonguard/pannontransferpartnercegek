"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Car, 
  Users, 
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Building,
  Plane,
  Map,
  Plus,
  Minus,
  Luggage,
  Clock,
  LogOut,
  UserCircle,
  Loader2,
  XCircle,
  CheckCircle2,
  ListOrdered
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { CATL_PRICING, formatHuf } from "./catl-pricing";
import CatlPremiumLogin from "./components/CatlPremiumLogin";

interface CatlPortalUser {
  email: string;
  company?: string;
  role?: string;
}

export default function CatlLandingPage() {
  const { t, language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<CatlPortalUser | null>(null);
  const [portalBooting, setPortalBooting] = useState(true);

  const [formLoading, setFormLoading] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastBookingCode, setLastBookingCode] = useState<string | null>(null);
  const [showValidationInline, setShowValidationInline] = useState(false);
  const [blurredFields, setBlurredFields] = useState<Record<string, boolean>>({});

  const [travelerEmail, setTravelerEmail] = useState("");
  const [travelerName, setTravelerName] = useState("");
  const [travelerPhone, setTravelerPhone] = useState("");
  const [secondTravelerEmail, setSecondTravelerEmail] = useState("");
  const [secondTravelerPhone, setSecondTravelerPhone] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [commentText, setCommentText] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [fromType, setFromType] = useState<"airport" | "other">("airport");
  const [toType, setToType] = useState<"airport" | "other">("other");
  const [travelers, setTravelers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [transferType, setTransferType] = useState<"standard" | "executive">("executive");

  useEffect(() => {
    if (authedUser) {
      setPortalBooting(true);
      const t = setTimeout(() => {
        setPortalBooting(false);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [authedUser]);

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
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/catl-auth/logout", { method: "POST" });
    } catch {}
    setAuthedUser(null);
  };

  const requiredFields: Record<string, { value: string; label: string }> = {
    travelerEmail: { value: travelerEmail, label: "Email" },
    travelerName: { value: travelerName, label: "Név" },
    travelerPhone: { value: travelerPhone, label: "Telefonszám" },
    fromAddress: { value: fromAddress, label: "Felvételi cím" },
    toAddress: { value: toAddress, label: "Érkezési cím" },
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
    const inlineCheck = showValidationInline && blurredFields[fieldKey] && requiredFields[fieldKey] && !requiredFields[fieldKey].value.trim();
    const submitCheck = submitErrors.length > 0 && getFieldError(fieldKey) !== null;
    return inlineCheck || submitCheck;
  };

  const handleBlur = (fieldKey: string) => {
    setBlurredFields(prev => ({ ...prev, [fieldKey]: true }));
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
    setPickupDate("");
    setPickupTime("");
    setCommentText("");
    setPaymentMethod("card");
    setFromType("airport");
    setToType("other");
    setTravelers(1);
    setLuggage(1);
    setTransferType("executive");
    setSubmitErrors([]);
    setSubmitSuccess(false);
    setLastBookingCode(null);
    setShowValidationInline(false);
    setBlurredFields({});
  };

  const handleSubmit = async () => {
    setSubmitErrors([]);
    setShowValidationInline(true);
    Object.keys(requiredFields).forEach(key => {
      setBlurredFields(prev => ({ ...prev, [key]: true }));
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
        companyName: "CATL Hungary Kft.",
        paymentMethod,
        transferType,
        fromType,
        fromAddress,
        toType,
        toAddress,
        pickupDate,
        pickupTime,
        travelers,
        luggage,
        comment: commentText || undefined,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 201 && data?.success && data?.booking) {
        setSubmitSuccess(true);
        setLastBookingCode(data.booking.bookingCode);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 400) {
        const errs: string[] = data?.errors && Array.isArray(data.errors) ? data.errors : ["Érvénytelen adatok, kérjük ellenőrizze az űrlapot"];
        setSubmitErrors(errs);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 401) {
        router.push("/catl/auth");
      } else if (res.status === 500) {
        setSubmitErrors(["Szerver hiba történt, kérjük próbálja újra"]);
      } else {
        setSubmitErrors([data?.message || "Váratlan hiba történt, kérjük próbálja újra"]);
      }
    } catch {
      setSubmitErrors(["Hálózati hiba történt, kérjük próbálja újra"]);
    } finally {
      setFormLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#FAFBFC] text-zinc-900 flex flex-col">
        <div className="w-full border-b border-zinc-200/70 bg-white/60 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0047BA] to-[#0066E0] flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm tracking-tighter">C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-zinc-900 leading-none">CATL Portál</span>
                <span className="text-[11px] text-zinc-500 mt-0.5 tracking-wide">
                  Pannon Transfer · Hozzáférés ellenőrzése
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
          <div className="w-full max-w-[440px]">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center py-20 gap-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0047BA]/[0.08] border border-[#0047BA]/10 flex items-center justify-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <Building2 className="w-7 h-7 text-[#0047BA] animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2 border-zinc-200 border-t-[#0047BA]"
                />
                <p className="text-[14px] text-zinc-600 font-semibold tracking-wide">
                  Hozzáférés és munkamenet ellenőrzése...
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="w-full border-t border-zinc-200/70 bg-white/60 backdrop-blur-md mt-auto">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span>© {new Date().getFullYear()} Pannon Transfer · Minden jog fenntartva.</span>
            <span className="tracking-wider">CATL Dedikált Ügyfélportál · Kizárólagos linkalapú hozzáférés</span>
          </div>
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
        {/* Deep cinematic background glow */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0047BA]/20 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none"
        />

        {/* Ambient floating particles */}
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#00B4D8] rounded-full blur-[1px]"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-[#0047BA] rounded-full blur-[2px]"
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Elegant Spinning Rings */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, ease: "linear", repeat: Infinity }}
              className="absolute inset-0 rounded-full border-[1px] border-white/[0.03] border-t-[#00B4D8]/60 border-r-[#0047BA]/40"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 16, ease: "linear", repeat: Infinity }}
              className="absolute inset-[-16px] rounded-full border-[1px] border-white/[0.02] border-b-[#00B4D8]/30 border-l-[#0047BA]/50"
            />
            
            {/* Inner Core */}
            <div className="absolute inset-2 bg-[#020617] rounded-full shadow-[inset_0_0_20px_rgba(0,71,186,0.1)] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="w-14 h-14 bg-gradient-to-br from-[#0047BA] to-[#00B4D8] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(0,180,216,0.4)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                <span className="text-white font-black text-2xl tracking-tighter relative z-10">C</span>
              </motion.div>
            </div>
          </div>

          {/* Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-5 mb-4">
              <span className="font-serif text-2xl tracking-[0.25em] text-white/90">PANNON</span>
              <span className="w-[1px] h-6 bg-white/20" />
              <span className="font-sans font-black text-2xl tracking-[0.2em] text-[#00B4D8]">CATL</span>
            </div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 font-medium">
              Premium Corporate Transfer
            </p>
          </motion.div>

          {/* Premium Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 w-64"
          >
            <div className="h-[2px] w-full bg-white/5 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.4 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-[#00B4D8] to-[#00B4D8] shadow-[0_0_12px_rgba(0,180,216,1)]"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 text-center text-[9px] tracking-[0.3em] text-[#00B4D8] uppercase font-bold"
            >
              Rendszer előkészítése...
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-[#040914] text-slate-300 font-sans selection:bg-[#0047BA]/30 relative overflow-hidden">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[70vw] h-[70vh] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#0047BA]/15 via-[#0047BA]/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vh] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#00B4D8]/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-[#040914]/85 backdrop-blur-xl border-b border-white/10 shadow-sm" 
            : "bg-transparent border-b border-white/5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex justify-between items-center">
          <div className="flex items-center gap-5 md:gap-8 h-full">
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-lg md:text-xl tracking-widest text-white leading-none">
                PANNON
              </span>
              <span className="font-serif font-bold text-[10px] md:text-xs tracking-[0.25em] text-[#D4AF37] leading-tight mt-1">
                TRANSFER
              </span>
            </div>
            
            <div className="w-px h-8 bg-white/20 transform rotate-12"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-[#0047BA] to-[#00B4D8] flex items-center justify-center shadow-sm">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-lg md:text-xl tracking-tight text-white leading-none flex items-center gap-2">
                  CATL <span className="text-[#00B4D8] text-sm hidden sm:inline">宁德时代</span>
                </span>
                <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase mt-1">
                  Corporate Portal
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8 h-full">
            <div className="flex items-center gap-8 h-full">
              <Link href="#booking" className={`text-sm font-medium tracking-wide hover:text-white transition-colors h-full flex items-center border-b-2 ${pathname === "/catl/bookings" ? "text-slate-400 border-transparent" : "text-slate-300 border-[#0047BA]"}`}>
                {t('nav', 'booking')}
              </Link>
              <Link href="/catl/bookings" className={`text-sm font-medium tracking-wide hover:text-white transition-colors h-full flex items-center border-b-2 ${pathname === "/catl/bookings" ? "text-white border-[#0047BA]" : "text-slate-300 border-transparent hover:border-white/20"}`}>
                Foglalásaim
              </Link>
            </div>
            
            <div className="w-px h-5 bg-white/10 mx-2"></div>
            
            <div className="flex items-center gap-1">
              {['hu', 'en', 'zh'].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => setLanguage(lang as 'hu' | 'en' | 'zh')}
                  className={`w-8 h-8 rounded flex items-center justify-center text-[11px] font-bold tracking-wider transition-all duration-200 ${
                    language === lang 
                      ? 'bg-[#0047BA] text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-white/10 mx-2"></div>

            <div className="flex items-center gap-3 pl-2">
                <div className="hidden xl:flex flex-col items-end">
                  <span className="text-[12px] font-semibold text-white leading-none truncate max-w-[180px]">
                    {authedUser.email}
                  </span>
                  <Link href="/catl/bookings" className="text-[10px] font-medium text-[#00B4D8] hover:text-[#0047BA] transition-colors mt-1 flex items-center gap-1">
                    <ListOrdered className="w-3 h-3" />
                    Foglalásaim
                  </Link>
                </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0047BA] to-[#00B4D8] flex items-center justify-center shadow-[0_0_20px_rgba(0,71,186,0.4)] shrink-0 ring-1 ring-white/10">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={handleLogout}
                title="Kijelentkezés"
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section id="booking" className="relative pt-32 pb-24 px-6 min-h-screen flex items-start justify-center z-10">
        <div className="max-w-[1200px] mx-auto w-full">
          
          {/* Header Title for the Form */}
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#0047BA]/10 border border-[#0047BA]/20 mb-6">
              <Briefcase className="w-3.5 h-3.5 text-[#00B4D8]" />
              <span className="text-[10px] font-bold text-[#00B4D8] tracking-widest uppercase">
                Official Booking Portal
              </span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Üdvözöljük a CATL Dedikált Portálon
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-400 text-sm md:text-base">
              Hivatalos transzferfoglalási felület
            </motion.p>
          </div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-[#0B1221] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden relative max-w-2xl mx-auto"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              <div className="p-10 md:p-16 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-400/10 flex items-center justify-center border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.25)] mb-8"
                >
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  >
                    <CheckCircle2 className="w-14 h-14 text-emerald-400" strokeWidth={2.5} />
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight"
                >
                  Foglalása sikeresen elküldve!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400 text-sm md:text-base mb-6"
                >
                  Visszaigazoló e-mail elküldve az Ön email címére
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 }}
                  className="mb-8"
                >
                  <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-2 block">
                    Foglalási kód
                  </span>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0047BA]/20 to-[#00B4D8]/15 border border-[#0047BA]/30 shadow-[0_0_25px_rgba(0,71,186,0.2)]">
                    <span className="text-3xl md:text-4xl font-black text-white tracking-wider font-mono">
                      #{lastBookingCode}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-start gap-2 max-w-md mb-10 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00B4D8] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-400 text-left leading-relaxed">
                    Amint a diszpécserünk jóváhagyja, email értesítést küldünk Önnek
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md"
                >
                  <button
                    onClick={() => router.push("/catl/bookings")}
                    className="py-4 px-5 rounded-lg bg-[#0047BA] hover:bg-[#00368C] text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,71,186,0.3)] hover:shadow-[0_0_30px_rgba(0,71,186,0.5)]"
                  >
                    <ListOrdered className="w-4 h-4" />
                    Foglalásaim
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="py-4 px-5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Új foglalás
                  </button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#0B1221] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden relative max-w-4xl mx-auto"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0047BA] to-transparent" />

              <div className="p-8 md:p-12 space-y-10">
              
              {/* SECTION 1: Personal & Company Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-[#0047BA]/20 flex items-center justify-center text-[#00B4D8] font-bold text-sm border border-[#0047BA]/30">1</div>
                  <h3 className="text-white font-semibold text-lg tracking-wide">Utas és Céges adatok</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Email address of the Traveler <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className={`w-full bg-[#151E32] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerEmail") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-slate-700/50 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30"}`}>
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

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Name of the Traveler <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className={`w-full bg-[#151E32] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerName") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-slate-700/50 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30"}`}>
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
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                      Company Name
                    </label>
                    <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30 transition-all">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <input type="text" defaultValue="CATL Hungary Kft." readOnly className="bg-transparent border-none outline-none w-full text-sm font-bold text-white opacity-80 cursor-not-allowed" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Phone number (only digit / 0123456789) <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className={`w-full bg-[#151E32] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerPhone") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-slate-700/50 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30"}`}>
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

                {/* Optional 2nd Traveler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800/50">
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                      2nd Traveler's email (optional)
                    </label>
                    <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30 transition-all">
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
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                      2nd Traveler's phone (optional)
                    </label>
                    <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30 transition-all">
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

              {/* SECTION 2: Payment */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-[#0047BA]/20 flex items-center justify-center text-[#00B4D8] font-bold text-sm border border-[#0047BA]/30">2</div>
                  <h3 className="text-white font-semibold text-lg tracking-wide">Fizetés és Típus</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                    Payment Method <span className="text-[#00B4D8]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setPaymentMethod("card")}
                      className={`py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                        paymentMethod === "card" 
                          ? "bg-[#0047BA]/20 border-[#0047BA] text-white" 
                          : "bg-[#151E32] border-slate-700/50 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <CreditCard className={`w-4 h-4 ${paymentMethod === "card" ? "text-[#00B4D8]" : ""}`} />
                      <span className="text-sm font-bold">With credit card at the driver</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod("bank")}
                      className={`py-3.5 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                        paymentMethod === "bank" 
                          ? "bg-[#0047BA]/20 border-[#0047BA] text-white" 
                          : "bg-[#151E32] border-slate-700/50 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <Building className={`w-4 h-4 ${paymentMethod === "bank" ? "text-[#00B4D8]" : ""}`} />
                      <span className="text-sm font-bold">Bank Transaction</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                    Transfer Type <span className="text-[#00B4D8]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setTransferType("standard")}
                      className={`py-3.5 px-4 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                        transferType === "standard" 
                          ? "bg-[#0047BA]/20 border-[#0047BA] text-white" 
                          : "bg-[#151E32] border-slate-700/50 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <span className="text-sm font-bold">Standard</span>
                      <span className="text-[10px] opacity-70">Economy Class</span>
                    </button>
                    <button 
                      onClick={() => setTransferType("executive")}
                      className={`py-3.5 px-4 rounded-lg flex flex-col items-center justify-center gap-1 border transition-all ${
                        transferType === "executive" 
                          ? "bg-gradient-to-br from-[#0047BA]/30 to-[#00B4D8]/20 border-[#0047BA] text-white shadow-[0_0_15px_rgba(0,71,186,0.2)]" 
                          : "bg-[#151E32] border-slate-700/50 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <span className="text-sm font-bold text-[#00B4D8]">Executive</span>
                      <span className="text-[10px] opacity-70">Business Class</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Route Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-[#0047BA]/20 flex items-center justify-center text-[#00B4D8] font-bold text-sm border border-[#0047BA]/30">3</div>
                  <h3 className="text-white font-semibold text-lg tracking-wide">Útvonal részletek</h3>
                </div>

                {/* FROM */}
                <div className="space-y-4 bg-[#0F172A]/50 p-6 rounded-xl border border-slate-800/50">
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                      From (Honnan?)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setFromType("airport")}
                        className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                          fromType === "airport" 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-[#151E32] border-slate-700/50 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <Plane className="w-4 h-4" />
                        <span className="text-sm font-bold">Airport</span>
                      </button>
                      <button 
                        onClick={() => setFromType("other")}
                        className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                          fromType === "other" 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-[#151E32] border-slate-700/50 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <Map className="w-4 h-4" />
                        <span className="text-sm font-bold">Other</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      From Address <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className={`w-full bg-[#151E32] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("fromAddress") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-slate-700/50 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30"}`}>
                      <MapPin className={`w-4 h-4 ${isFieldInvalid("fromAddress") ? "text-red-400" : "text-slate-500"}`} />
                      <input
                        type="text"
                        value={fromAddress}
                        onChange={(e) => setFromAddress(e.target.value)}
                        onBlur={() => handleBlur("fromAddress")}
                        placeholder={fromType === "airport" ? "e.g. Budapest Airport (BUD)" : "e.g. CATL Debrecen Gyár..."}
                        className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                      />
                    </div>
                    {getFieldError("fromAddress") && (
                      <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {getFieldError("fromAddress")}
                      </p>
                    )}
                  </div>
                </div>

                {/* TO */}
                <div className="space-y-4 bg-[#0F172A]/50 p-6 rounded-xl border border-slate-800/50">
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                      To (Hova?)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setToType("airport")}
                        className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                          toType === "airport" 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-[#151E32] border-slate-700/50 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <Plane className="w-4 h-4" />
                        <span className="text-sm font-bold">Airport</span>
                      </button>
                      <button 
                        onClick={() => setToType("other")}
                        className={`py-3 px-4 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                          toType === "other" 
                            ? "bg-white/10 border-white/20 text-white" 
                            : "bg-[#151E32] border-slate-700/50 text-slate-400 hover:border-slate-500"
                        }`}
                      >
                        <Map className="w-4 h-4" />
                        <span className="text-sm font-bold">Other</span>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      To Address <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className={`w-full bg-[#151E32] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("toAddress") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-slate-700/50 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30"}`}>
                      <MapPin className={`w-4 h-4 ${isFieldInvalid("toAddress") ? "text-red-400" : "text-slate-500"}`} />
                      <input
                        type="text"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        onBlur={() => handleBlur("toAddress")}
                        placeholder={toType === "airport" ? "e.g. Budapest Airport (BUD)" : "e.g. 4031 Debrecen, ..."}
                        className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                      />
                    </div>
                    {getFieldError("toAddress") && (
                      <p className="text-[11px] text-red-400 ml-1 font-medium flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        {getFieldError("toAddress")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      When (Date) <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className={`w-full bg-[#151E32] rounded-lg p-3.5 flex items-center justify-between text-slate-300 transition-all border ${isFieldInvalid("pickupDate") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-slate-700/50 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30"}`}>
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
                      Time <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className={`w-full bg-[#151E32] rounded-lg p-3.5 flex items-center justify-between text-slate-300 transition-all border ${isFieldInvalid("pickupTime") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-slate-700/50 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30"}`}>
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
                  {/* Travelers Counter */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Number of the Travelers <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-2.5 flex justify-between items-center text-white">
                      <div className="flex items-center gap-3 px-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold">{travelers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setTravelers(Math.max(1, travelers - 1))} type="button" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <button onClick={() => setTravelers(travelers + 1)} type="button" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Luggage Counter */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Number of the luggage <span className="text-[#00B4D8]">*</span>
                    </label>
                    <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-2.5 flex justify-between items-center text-white">
                      <div className="flex items-center gap-3 px-2">
                        <Luggage className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold">{luggage}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setLuggage(Math.max(0, luggage - 1))} type="button" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <Minus className="w-4 h-4" />
                        </button>
                        <button onClick={() => setLuggage(luggage + 1)} type="button" className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                    Comment
                  </label>
                  <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-3.5 focus-within:border-[#0047BA] focus-within:ring-1 focus-within:ring-[#0047BA]/30 transition-all">
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

              {/* Submit Errors Alert */}
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
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-red-300 tracking-wide">
                            Kérjük javítsa a következő hibákat:
                          </p>
                        </div>
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

              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={handleSubmit}
                  disabled={formLoading}
                  className={`w-full rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-3 py-4.5 ${
                    formLoading
                      ? "bg-[#0047BA]/60 text-white/80 cursor-not-allowed shadow-[0_0_15px_rgba(0,71,186,0.15)]"
                      : "bg-[#0047BA] hover:bg-[#00368C] text-white shadow-[0_0_20px_rgba(0,71,186,0.3)] hover:shadow-[0_0_30px_rgba(0,71,186,0.5)]"
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
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#040914] py-10 px-6 z-10 relative">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col text-center md:text-left">
              <span className="font-serif font-bold tracking-widest text-slate-400 text-sm leading-none">
                PANNON <span className="text-[#D4AF37]/80">TRANSFER</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium tracking-[0.2em] mt-1">EXECUTIVE TRAVEL</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/10"></div>
            <div className="flex flex-col text-center md:text-left">
              <span className="font-bold text-white tracking-wide text-sm leading-none flex items-center gap-2">
                CATL <span className="text-xs font-normal text-slate-400">{t('footer', 'portal')}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-slate-500">Dedikált ügyfélszolgálat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
