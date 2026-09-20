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
  LogOut,
  Loader2,
  XCircle,
  CheckCircle2,
  ListOrdered,
  Bug,
  X,
  Send,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import NiPremiumLogin from "./components/NiPremiumLogin";

interface NiPortalUser {
  email: string;
  company?: string;
  role?: string;
}

export default function NiLandingPage() {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<NiPortalUser | null>(null);
  const [portalBooting, setPortalBooting] = useState(true);

  const [formLoading, setFormLoading] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastBookingCode, setLastBookingCode] = useState<string | null>(null);
  const [showValidationInline, setShowValidationInline] = useState(false);
  const [blurredFields, setBlurredFields] = useState<Record<string, boolean>>(
    {},
  );

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

  const [paymentMethod] = useState<"card" | "bank">("card");
  const [fromType, setFromType] = useState<"airport" | "other">("airport");
  const [toType, setToType] = useState<"airport" | "other">("other");
  const [travelers, setTravelers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [transferType, setTransferType] = useState<"standard" | "executive">(
    "executive",
  );

  const [bugModalOpen, setBugModalOpen] = useState(false);
  const [bugSubject, setBugSubject] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [bugSubmitting, setBugSubmitting] = useState(false);
  const [bugStatus, setBugStatus] = useState<string | null>(null);

  useEffect(() => {
    if (authedUser) {
      const t = setTimeout(() => {
        setPortalBooting(false);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [authedUser]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/ni-auth/session", { cache: "no-store" });
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/ni-auth/logout", { method: "POST" });
    } catch {}
    setAuthedUser(null);
  };

  const handleLoginSuccess = (user: NiPortalUser) => {
    setAuthedUser(user);
    setPortalBooting(true);
    window.setTimeout(() => {
      setPortalBooting(false);
    }, 1500);
  };

  const handleBugSubmit = async () => {
    if (!bugSubject.trim() || !bugDescription.trim()) {
      setBugStatus("A tárgy és a leírás megadása kötelező.");
      return;
    }
    setBugSubmitting(true);
    setBugStatus(null);
    try {
      const res = await fetch("/api/ni/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: bugSubject.trim(), description: bugDescription.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Nem sikerült elküldeni a hibabejelentést.");
      }
      setBugSubject("");
      setBugDescription("");
      setBugStatus("success");
      window.setTimeout(() => {
        setBugModalOpen(false);
        setBugStatus(null);
      }, 1500);
    } catch (e) {
      setBugStatus(e instanceof Error ? e.message : "Hiba történt a küldés során.");
    } finally {
      setBugSubmitting(false);
    }
  };

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
        (fieldKey === "travelerEmail" &&
          (lowerErr.includes("email") || lowerErr.includes("e-mail"))) ||
        (fieldKey === "travelerPhone" &&
          (lowerErr.includes("phone") || lowerErr.includes("telefonszám"))) ||
        (fieldKey === "fromAddress" &&
          (lowerErr.includes("from") ||
            lowerErr.includes("honnan") ||
            lowerErr.includes("indulási"))) ||
        (fieldKey === "toAddress" &&
          (lowerErr.includes("to") ||
            lowerErr.includes("hova") ||
            lowerErr.includes("érkezési"))) ||
        (fieldKey === "pickupDate" &&
          (lowerErr.includes("date") || lowerErr.includes("dátum"))) ||
        (fieldKey === "pickupTime" &&
          (lowerErr.includes("time") ||
            lowerErr.includes("idő") ||
            lowerErr.includes("időpont")))
      ) {
        return err;
      }
    }
    return null;
  };

  const isFieldInvalid = (fieldKey: string): boolean => {
    const inlineCheck =
      showValidationInline &&
      blurredFields[fieldKey] &&
      requiredFields[fieldKey] &&
      !requiredFields[fieldKey].value.trim();
    const submitCheck =
      submitErrors.length > 0 && getFieldError(fieldKey) !== null;
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
    setShowValidationInline(false);
    setBlurredFields({});
  };

  const handleSubmit = async () => {
    setSubmitErrors([]);
    setShowValidationInline(true);
    Object.keys(requiredFields).forEach((key) => {
      setBlurredFields((prev) => ({ ...prev, [key]: true }));
    });
    const missing = Object.entries(requiredFields).filter(
      ([, v]) => !v.value.trim(),
    );
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
        companyName: "National Instruments",
        paymentMethod,
        transferType,
        fromType,
        fromAddress,
        toType,
        toAddress,
        flightNumber: (fromType === "airport" || toType === "airport") ? flightNumber : undefined,
        pickupDate,
        pickupTime,
        travelers,
        luggage,
        comment: commentText || undefined,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-partner-portal": "ni",
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
          data?.errors && Array.isArray(data.errors)
            ? data.errors
            : ["Érvénytelen adatok, kérjük ellenőrizze az űrlapot"];
        setSubmitErrors(errs);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 401) {
        router.push("/ni/auth");
      } else if (res.status === 500) {
        setSubmitErrors(["Szerver hiba történt, kérjük próbálja újra"]);
      } else {
        setSubmitErrors([
          data?.message || "Váratlan hiba történt, kérjük próbálja újra",
        ]);
      }
    } catch {
      setSubmitErrors(["Hálózati hiba történt, kérjük próbálja újra"]);
    } finally {
      setFormLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,92,203,0.34),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(65,182,121,0.2),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(4,38,86,0.72),transparent_50%),linear-gradient(135deg,#020613_0%,#051326_36%,#062043_68%,#071628_100%)]" />
          <div className="absolute left-[-10%] top-[-8%] h-[30rem] w-[30rem] rounded-full bg-[#41B679]/16 blur-[120px]" />
          <div className="absolute right-[-12%] top-[4%] h-[36rem] w-[36rem] rounded-full bg-[#0A5CCB]/22 blur-[140px]" />
          <div className="absolute inset-x-[12%] top-[16%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>
        <div className="w-full border-b border-white/10 bg-[#030816]/72 backdrop-blur-xl relative z-10">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                <Image
                  src="/partners/ni/hero.png"
                  alt="NI"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-white leading-none">
                  Pannon Transfer NI | Emerson
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 tracking-wide">
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
              className="flex flex-col items-center py-20 gap-6"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(65,182,121,0.18),transparent_50%)]" />
                <Image
                  src="/partners/ni/hero.png"
                  alt="NI"
                  width={40}
                  height={40}
                  className="relative z-10 h-10 w-10 object-contain"
                />
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <span className="font-serif text-xl tracking-[0.24em] text-white/90">
                    EMERSON
                  </span>
                  <span className="h-5 w-px bg-white/20" />
                  <span className="font-sans text-xl font-black tracking-[0.22em] text-[#41B679]">
                    NI
                  </span>
                </div>
                <p className="text-[10px] tracking-[0.42em] uppercase text-slate-500 font-medium">
                  Corporate Mobility Access
                </p>
              </div>
              <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "linear",
                  }}
                  className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#41B679]"
                />
                <p className="text-[14px] text-slate-300 font-semibold tracking-wide">
                  Hozzáférés és munkamenet ellenőrzése...
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="w-full border-t border-white/10 bg-[#030816]/72 backdrop-blur-xl mt-auto relative z-10">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>
              © {new Date().getFullYear()} Pannon Transfer · Minden jog
              fenntartva.
            </span>
            <span className="tracking-wider">
              NI Dedikált Ügyfélportál · Kizárólagos linkalapú hozzáférés
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <NiPremiumLogin _onSuccess={handleLoginSuccess} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,92,203,0.36),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(65,182,121,0.24),transparent_22%),radial-gradient(circle_at_50%_60%,rgba(4,38,86,0.78),transparent_48%),linear-gradient(135deg,#01040D_0%,#041229_40%,#062043_68%,#071628_100%)]" />
        <div className="absolute left-[-8%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-[#41B679]/16 blur-[140px]" />
        <div className="absolute right-[-14%] top-[2%] h-[42rem] w-[42rem] rounded-full bg-[#0A5CCB]/22 blur-[160px]" />
        <div className="absolute bottom-[-24%] left-[20%] h-[28rem] w-[40rem] rounded-full bg-[#003E7E]/28 blur-[160px]" />
        <div className="absolute inset-x-[14%] top-[18%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        
        {/* Fast Shockwaves */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.2, 1.8] }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute h-[24rem] w-[24rem] rounded-full border-2 border-[#41B679]/40 shadow-[0_0_80px_rgba(65,182,121,0.5)]"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 1, 0], scale: [0.9, 1.5, 2] }}
          transition={{ duration: 1.0, delay: 0.2, ease: "easeOut" }}
          className="absolute h-[32rem] w-[32rem] rounded-full border border-[#0A5CCB]/30 shadow-[0_0_100px_rgba(10,92,203,0.4)]"
        />

        {/* Fast scanline */}
        <motion.div
          initial={{ y: "-100vh", opacity: 0 }}
          animate={{ y: "100vh", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, ease: "linear" }}
          className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#41B679] to-transparent shadow-[0_0_30px_rgba(65,182,121,1)] z-50 pointer-events-none"
        />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.65 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute w-[860px] h-[860px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#41B679]/14 via-[#0A5CCB]/10 to-transparent rounded-full blur-[110px] pointer-events-none"
        />

        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#10B981] rounded-full blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-[#41B679] rounded-full blur-[2px]"
        />
        <motion.div
          animate={{ x: [-12, 12, -12], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute top-[22%] right-[22%] h-24 w-24 rounded-full border border-white/6"
        />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-10 flex h-48 w-48 items-center justify-center">
            {/* Ultra-fast outer rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              className="absolute inset-[-8px] rounded-full border-[2px] border-white/[0.05] border-t-[#41B679] border-r-[#0A5CCB] shadow-[0_0_40px_rgba(65,182,121,0.3)]"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              className="absolute inset-[-24px] rounded-full border-[2px] border-white/[0.05] border-b-[#0A5CCB] border-l-[#41B679] shadow-[0_0_40px_rgba(10,92,203,0.3)]"
            />
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.05, 1] }}
              transition={{ rotate: { duration: 5, ease: "linear", repeat: Infinity }, scale: { duration: 1, repeat: Infinity } }}
              className="absolute inset-[-42px] rounded-full border border-[#41B679]/20 border-dashed"
            />

            <div className="absolute inset-2 bg-[#020617] rounded-full shadow-[inset_0_0_30px_rgba(10,92,203,0.3)] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [1.2, 0.9, 1] }}
                transition={{ duration: 0.6, ease: "circOut", delay: 0.1 }}
                className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white shadow-[0_0_80px_rgba(65,182,121,0.5)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent)] mix-blend-overlay" />
                <Image
                  src="/partners/ni/hero.png"
                  alt="NI"
                  width={56}
                  height={56}
                  className="relative z-10 h-14 w-14 object-contain"
                />
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-center"
          >
            <div className="mb-5 inline-flex items-center gap-5 rounded-full border border-[#41B679]/30 bg-[#41B679]/10 px-6 py-2.5 backdrop-blur-md shadow-[0_0_30px_rgba(65,182,121,0.15)]">
              <span className="font-serif text-3xl tracking-[0.25em] text-white">
                EMERSON
              </span>
              <span className="w-[1px] h-7 bg-white/30" />
              <span className="font-sans font-black text-3xl tracking-[0.2em] text-[#41B679]">
                NI
              </span>
            </div>
            <h2 className="text-[32px] font-bold tracking-tight text-white/90">
              Corporate Portal
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-14 w-[360px]"
          >
            <div className="h-[3px] w-full bg-white/10 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 0.8,
                  ease: "circOut",
                  delay: 0.3,
                }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-[#41B679] to-[#0A5CCB] shadow-[0_0_20px_rgba(65,182,121,1)]"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 text-center text-[11px] tracking-[0.4em] text-[#41B679] uppercase font-black"
            >
              System Initializing
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030816] text-slate-300 font-sans selection:bg-[#41B679]/30 relative overflow-hidden">
      {/* Background - presentation-focused Emerson/NI gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,92,203,0.42),transparent_30%),radial-gradient(circle_at_80%_12%,rgba(65,182,121,0.24),transparent_20%),radial-gradient(circle_at_55%_62%,rgba(6,31,79,0.82),transparent_46%),linear-gradient(135deg,#01050E_0%,#041229_34%,#072447_66%,#071A2F_100%)]" />
        <div className="absolute top-[-10%] left-[-14%] h-[36rem] w-[36rem] rounded-full bg-[#41B679]/20 blur-[130px]" />
        <div className="absolute right-[-12%] top-[2%] h-[40rem] w-[40rem] rounded-full bg-[#0A5CCB]/26 blur-[160px]" />
        <div className="absolute bottom-[-24%] left-[16%] h-[34rem] w-[44rem] rounded-full bg-[#003E7E]/34 blur-[170px]" />
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
        <div className="absolute inset-x-[10%] top-[14%] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
        <div className="absolute inset-y-0 right-[12%] w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-y-0 left-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#41B679]/8 to-transparent" />
      </div>

      {/* Navbar - Minimalist Apple/Vercel style */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#020813]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-transparent border-b border-white/5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex justify-between items-center">
          <div className="flex items-center gap-5 md:gap-8 h-full">
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-lg md:text-xl tracking-widest text-white leading-none">
                PANNON
              </span>
              <span className="font-serif font-bold text-[10px] md:text-xs tracking-[0.25em] text-[#41B679] leading-tight mt-1">
                TRANSFER
              </span>
            </div>

            <div className="w-px h-8 bg-white/20 transform rotate-12"></div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                <Image
                  src="/partners/ni/hero.png"
                  alt="NI"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-lg md:text-xl tracking-tight text-white leading-none flex items-center gap-2">
                  <span className="text-[#41B679]">NI</span>
                  <span className="text-white/50">|</span>
                  Emerson Portal
                </span>
                <span className="text-[10px] font-medium tracking-[0.24em] text-slate-400 uppercase mt-1">
                  NI Corporate Access
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 h-full">
            <div className="flex items-center h-full">
              <div className="flex items-center p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                <Link
                  href="#booking"
                  className={`px-6 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ${
                    pathname === "/ni" || pathname === "/ni/"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {t("nav", "booking")}
                </Link>
                <Link
                  href="/ni/bookings"
                  className={`px-6 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ${
                    pathname === "/ni/bookings"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Foglalásaim
                </Link>
                {authedUser.role === "admin-ni" && (
                  <Link
                    href="/ni/company"
                    className={`px-6 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all duration-300 ${
                      pathname === "/ni/company"
                        ? "bg-white/10 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Céges foglalások
                  </Link>
                )}
              </div>
            </div>

            <div className="w-px h-5 bg-white/10 mx-2"></div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold tracking-wider transition-all duration-300 ${
                    language === lang
                      ? "bg-[#41B679] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-white/10 mx-2"></div>

            <div className="flex items-center gap-4 pl-2">
              <div className="hidden xl:flex flex-col items-end">
                <span className="text-[13px] font-semibold text-white leading-none truncate max-w-[180px]">
                  {authedUser.email}
                </span>
                <span className="text-[10px] font-medium text-[#41B679] mt-1">
                  NI / Emerson Access
                </span>
              </div>
              {authedUser.role === "admin-ni" && (
                <button
                  onClick={() => setBugModalOpen(true)}
                  title="Hibabejelentés"
                  className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all shrink-0"
                >
                  <Bug className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleLogout}
                title="Kijelentkezés"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section
        id="booking"
        className="relative pt-32 pb-24 px-6 min-h-screen flex items-start justify-center z-10"
      >
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
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-[#41B679]/20 to-[#10B981]/10 flex items-center justify-center border-2 border-[#41B679]/30 shadow-[0_0_40px_rgba(65,182,121,0.25)] mb-8"
                >
                  <motion.div
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  >
                    <CheckCircle2
                      className="w-14 h-14 text-[#41B679]"
                      strokeWidth={2.5}
                    />
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
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#003E7E]/20 to-[#002A54]/15 border border-[#003E7E]/30 shadow-[0_0_25px_rgba(0,62,126,0.2)]">
                    <span className="text-3xl md:text-4xl font-black text-white tracking-wider font-mono">
                      #{lastBookingCode}
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-start gap-2 max-w-md mb-10 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#41B679] shrink-0 mt-0.5" />
                  <p className="text-[13px] text-slate-400 text-left leading-relaxed">
                    Amint a diszpécserünk jóváhagyja, email értesítést küldünk
                    Önnek
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md"
                >
                  <button
                    onClick={() => router.push("/ni/bookings")}
                    className="py-4 px-5 rounded-xl bg-[#003E7E] hover:bg-[#002A54] text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,62,126,0.3)] hover:shadow-[0_0_30px_rgba(0,62,126,0.5)]"
                  >
                    <ListOrdered className="w-4 h-4" />
                    Foglalásaim
                  </button>
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
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="relative max-w-5xl mx-auto">
              <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-[#41B679]/12 blur-[120px]" />
              <div className="pointer-events-none absolute -right-12 top-0 h-72 w-72 rounded-full bg-[#0A5CCB]/18 blur-[140px]" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-[linear-gradient(180deg,rgba(5,15,31,0.96),rgba(3,10,21,0.97))] rounded-[34px] shadow-[0_38px_120px_rgba(0,0,0,0.55)] border border-white/10 overflow-hidden relative backdrop-blur-3xl"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#41B679] to-[#0A5CCB]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(65,182,121,0.08),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(10,92,203,0.12),transparent_30%)]" />

                <div className="relative p-8 md:p-12 space-y-10">
                {/* SECTION 1: Personal & Company Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-[#41B679]/20 flex items-center justify-center text-[#10B981] font-bold text-sm border border-[#41B679]/30">
                      1
                    </div>
                    <h3 className="text-white font-semibold text-lg tracking-wide">
                      Utas és Céges adatok
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                        Email address of the Traveler{" "}
                        <span className="text-[#10B981]">*</span>
                      </label>
                      <div
                        className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerEmail") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                      >
                        <Mail
                          className={`w-4 h-4 ${isFieldInvalid("travelerEmail") ? "text-red-400" : "text-slate-500"}`}
                        />
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
                        Name of the Traveler{" "}
                        <span className="text-[#10B981]">*</span>
                      </label>
                      <div
                        className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerName") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                      >
                        <Users
                          className={`w-4 h-4 ${isFieldInvalid("travelerName") ? "text-red-400" : "text-slate-500"}`}
                        />
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
                      <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                        <Briefcase className="w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          defaultValue="National Instruments"
                          readOnly
                          className="bg-transparent border-none outline-none w-full text-sm font-bold text-white opacity-80 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                        Phone number (only digit / 0123456789){" "}
                        <span className="text-[#10B981]">*</span>
                      </label>
                      <div
                        className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${isFieldInvalid("travelerPhone") ? "border-red-500/70 ring-1 ring-red-500/20 focus-within:border-red-500 focus-within:ring-red-500/30" : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"}`}
                      >
                        <Phone
                          className={`w-4 h-4 ${isFieldInvalid("travelerPhone") ? "text-red-400" : "text-slate-500"}`}
                        />
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
                        2nd Traveler&apos;s email (optional)
                      </label>
                      <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={secondTravelerEmail}
                          onChange={(e) =>
                            setSecondTravelerEmail(e.target.value)
                          }
                          placeholder="Optional"
                          className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                        2nd Traveler&apos;s phone (optional)
                      </label>
                      <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-3.5 flex items-center gap-3 text-slate-300 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          value={secondTravelerPhone}
                          onChange={(e) =>
                            setSecondTravelerPhone(e.target.value)
                          }
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
                    <div className="w-8 h-8 rounded-full bg-[#41B679]/20 flex items-center justify-center text-[#10B981] font-bold text-sm border border-[#41B679]/30">
                      2
                    </div>
                    <h3 className="text-white font-semibold text-lg tracking-wide">
                      Fizetés és Típus
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Payment Method <span className="text-[#41B679]">*</span>
                    </label>
                    <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                      <div
                        className="flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 relative z-10 text-white"
                      >
                        <motion.div layoutId="paymentMethod" className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                        <CreditCard className="w-4 h-4 text-[#41B679]" />
                        <span className="text-sm font-bold">
                          Credit Card
                        </span>
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
                        className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative z-10 ${
                          transferType === "standard"
                            ? "text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {transferType === "standard" && (
                          <motion.div layoutId="transferType" className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                        )}
                        <span className="text-sm font-bold">Standard</span>
                        <span className="text-[10px] opacity-70">
                          Economy Class
                        </span>
                      </button>
                      <button
                        onClick={() => setTransferType("executive")}
                        className={`flex-1 py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative z-10 ${
                          transferType === "executive"
                            ? "text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {transferType === "executive" && (
                          <motion.div layoutId="transferType" className="absolute inset-0 bg-[#41B679]/20 border border-[#41B679]/40 rounded-xl -z-10 shadow-[0_2px_15px_rgba(65,182,121,0.2)]" />
                        )}
                        <span className={`text-sm font-bold ${transferType === "executive" ? "text-[#41B679]" : ""}`}>
                          Executive
                        </span>
                        <span className="text-[10px] opacity-70">
                          Business Class
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Route Details */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-[#41B679]/20 flex items-center justify-center text-[#10B981] font-bold text-sm border border-[#41B679]/30">
                      3
                    </div>
                    <h3 className="text-white font-semibold text-lg tracking-wide">
                      Útvonal részletek
                    </h3>
                  </div>

                  {/* FROM */}
                  <div className="space-y-4 bg-[#0F172A]/50 p-6 rounded-3xl border border-white/5">
                    <div className="space-y-3">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                        From (Honnan?)
                      </label>
                      <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                        <button
                          onClick={() => setFromType("airport")}
                          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${
                            fromType === "airport"
                              ? "text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {fromType === "airport" && (
                            <motion.div layoutId="fromType" className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          )}
                          <Plane className="w-4 h-4" />
                          <span className="text-sm font-bold">Airport</span>
                        </button>
                        <button
                          onClick={() => {
                            setFromType("other");
                            if (toType !== "airport") setFlightNumber("");
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${
                            fromType === "other"
                              ? "text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {fromType === "other" && (
                            <motion.div layoutId="fromType" className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          )}
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
                        <MapPin
                          className={`w-4 h-4 ${isFieldInvalid("fromAddress") ? "text-red-400" : "text-slate-500"}`}
                        />
                        <input
                          type="text"
                          value={fromAddress}
                          onChange={(e) => setFromAddress(e.target.value)}
                          onBlur={() => handleBlur("fromAddress")}
                          placeholder={
                            fromType === "airport"
                              ? "e.g. Budapest Airport (BUD)"
                              : "e.g. NI Debrecen Gyár..."
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
                            Flight number / Járatszám <span className="text-[#10B981]">*</span>
                          </label>
                          <div
                            className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${
                              isFieldInvalid("flightNumber")
                                ? "border-red-500/70 ring-1 ring-red-500/20"
                                : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"
                            }`}
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
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                        To (Hova?)
                      </label>
                      <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 relative">
                        <button
                          onClick={() => setToType("airport")}
                          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${
                            toType === "airport"
                              ? "text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {toType === "airport" && (
                            <motion.div layoutId="toType" className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          )}
                          <Plane className="w-4 h-4" />
                          <span className="text-sm font-bold">Airport</span>
                        </button>
                        <button
                          onClick={() => {
                            setToType("other");
                            if (fromType !== "airport") setFlightNumber("");
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all relative z-10 ${
                            toType === "other"
                              ? "text-white"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {toType === "other" && (
                            <motion.div layoutId="toType" className="absolute inset-0 bg-[#003E7E]/40 border border-[#003E7E]/50 rounded-xl -z-10 shadow-[0_2px_10px_rgba(0,62,126,0.2)]" />
                          )}
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
                        <MapPin
                          className={`w-4 h-4 ${isFieldInvalid("toAddress") ? "text-red-400" : "text-slate-500"}`}
                        />
                        <input
                          type="text"
                          value={toAddress}
                          onChange={(e) => setToAddress(e.target.value)}
                          onBlur={() => handleBlur("toAddress")}
                          placeholder={
                            toType === "airport"
                              ? "e.g. Budapest Airport (BUD)"
                              : "e.g. 4031 Debrecen, ..."
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
                            Flight number / Járatszám <span className="text-[#10B981]">*</span>
                          </label>
                          <div
                            className={`w-full bg-white/[0.03] rounded-lg p-3.5 flex items-center gap-3 text-slate-300 transition-all border ${
                              isFieldInvalid("flightNumber")
                                ? "border-red-500/70 ring-1 ring-red-500/20"
                                : "border-white/5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30"
                            }`}
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
                    {/* Travelers Counter */}
                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                        Number of the Travelers{" "}
                        <span className="text-[#10B981]">*</span>
                      </label>
                      <div className="w-full bg-white/[0.03] border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3 px-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-bold">{travelers}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setTravelers(Math.max(1, travelers - 1))
                            }
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

                    {/* Luggage Counter */}
                    <div className="space-y-2">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                        Number of the luggage{" "}
                        <span className="text-[#10B981]">*</span>
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

                  {/* Comment */}
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                      Comment
                    </label>
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
                            <li
                              key={idx}
                              className="text-[12px] text-red-300/90 flex items-start gap-2 leading-relaxed"
                            >
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

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#020813] py-10 px-6 z-10 relative">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col text-center md:text-left">
              <span className="font-serif font-bold tracking-widest text-slate-400 text-sm leading-none">
                PANNON <span className="text-[#41B679]/80">TRANSFER</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium tracking-[0.2em] mt-1">
                EXECUTIVE TRAVEL
              </span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/10"></div>
            <div className="flex flex-col text-center md:text-left">
              <span className="font-bold text-white tracking-wide text-sm leading-none flex items-center gap-2">
                Emerson | ni{" "}
                <span className="text-xs font-normal text-slate-400">
                  {t("footer", "portal")}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-slate-500">
              Dedikált ügyfélszolgálat
            </span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {bugModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => !bugSubmitting && setBugModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              className="w-full max-w-lg bg-[#040E1B] border border-slate-800/80 rounded-3xl p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/30">
                    <Bug className="w-4 h-4 text-amber-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-wide">Hibabejelentés</h2>
                </div>
                <button
                  onClick={() => setBugModalOpen(false)}
                  disabled={bugSubmitting}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[13px] text-slate-400 mb-5 leading-relaxed">
                Írja le a hibát vagy problémát, amit a portálon tapasztalt. A bejelentés azonnal
                továbbításra kerül a fejlesztőnek.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Tárgy
                  </label>
                  <input
                    type="text"
                    value={bugSubject}
                    onChange={(e) => setBugSubject(e.target.value)}
                    placeholder="Pl. Nem menti el a foglalás módosítását"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-500/60"
                    disabled={bugSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Leírás
                  </label>
                  <textarea
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder="Mit csinált, mit várt volna, mi történt helyette..."
                    rows={5}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-500/60 resize-none"
                    disabled={bugSubmitting}
                  />
                </div>

                {bugStatus && bugStatus !== "success" && (
                  <p className="text-[12px] text-red-400">{bugStatus}</p>
                )}
                {bugStatus === "success" && (
                  <p className="text-[12px] text-[#41B679]">Hibabejelentés elküldve, köszönjük!</p>
                )}

                <button
                  onClick={handleBugSubmit}
                  disabled={bugSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-[#0a1628] font-bold text-sm tracking-wide transition-all"
                >
                  {bugSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Küldés
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
