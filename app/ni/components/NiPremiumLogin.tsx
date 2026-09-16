"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  ArrowRight,
  Loader2,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

interface Props {
  _onSuccess: (user: { email: string; company?: string; role?: string }) => void;
}

type State = "login" | "twofactor" | "done";

export default function NiPremiumLogin({ _onSuccess }: Props) {
  // 1. lépés states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Állapot (1. lépés login form, 2. lépés 2FA)
  const [state, setState] = useState<State>("login");

  // 2. lépés 2FA states
  const [challengeToken, setChallengeToken] = useState("");
  const [twoFaEmail, setTwoFaEmail] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaUseBackup, setTwoFaUseBackup] = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStep1Error("Kérjük, adja meg az e-mail címet és a jelszót.");
      return;
    }
    setStep1Error(null);
    setStep1Loading(true);
    try {
      const res = await fetch("/api/ni-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep1Error(json?.message || "Sikertelen bejelentkezés.");
        return;
      }
      // Ha 2FA kell → 2. lépés
      if (json.needTwoFactor) {
        setChallengeToken(json.challengeToken || "");
        setTwoFaEmail(json.email || email);
        setTwoFaCode("");
        setTwoFaUseBackup(false);
        setStep2Error(null);
        setState("twofactor");
        return;
      }
      // Nincs 2FA → közvetlen belépés
      if (json?.user) {
        setState("done");
          setTimeout(() => _onSuccess(json.user), 2500);
        return;
      }
      setStep1Error("Váratlan hiba történt a bejelentkezés során.");
    } catch {
      setStep1Error("Hálózati hiba történt. Kérjük, próbálja újra.");
    } finally {
      setStep1Loading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = twoFaUseBackup
      ? twoFaCode.trim().toUpperCase()
      : twoFaCode.replace(/\s+/g, "");
    if (!clean || (twoFaUseBackup ? clean.length < 6 : clean.length !== 6)) {
      setStep2Error(
        twoFaUseBackup
          ? "Kérjük, adja meg a biztonsági mentett kódot."
          : "Kérjük, adja meg az Authenticator által generált 6 számjegyű kódot."
      );
      return;
    }
    setStep2Error(null);
    setStep2Loading(true);
    try {
      const res = await fetch("/api/ni-auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeToken,
          code: clean,
          useBackup: twoFaUseBackup,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep2Error(json?.message || "Hibás 2FA kód.");
        return;
      }
      if (json?.user) {
        setState("done");
          setTimeout(() => _onSuccess(json.user), 2500);
        return;
      }
      setStep2Error("Váratlan hiba történt.");
    } catch {
      setStep2Error("Hálózati hiba történt. Kérjük, próbálja újra.");
    } finally {
      setStep2Loading(false);
    }
  };

  const goBackToLogin = () => {
    setState("login");
    setChallengeToken("");
    setTwoFaEmail("");
    setTwoFaCode("");
    setStep2Error(null);
    setStep2Loading(false);
  };

  return (
    <div className="relative min-h-screen bg-[#030816] text-white flex flex-col overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(12,88,178,0.34),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(65,182,121,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(6,31,79,0.68),transparent_52%),linear-gradient(135deg,#020613_0%,#041229_40%,#041934_62%,#071628_100%)]" />
        <div className="absolute top-[-10%] right-[-5%] w-[42rem] h-[42rem] rounded-full bg-[#0A5CCB]/18 blur-[140px]" />
        <div className="absolute bottom-[-12%] left-[-8%] w-[34rem] h-[34rem] rounded-full bg-[#41B679]/14 blur-[130px]" />
        <div className="absolute left-[10%] top-[18%] h-px w-[28rem] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <div className="w-full border-b border-white/10 bg-[#030816]/70 backdrop-blur-xl relative z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003E7E] to-[#002A54] flex items-center justify-center shadow-[0_0_20px_rgba(0,62,126,0.25)]">
              <span className="text-white font-black text-sm tracking-tighter">ni</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white leading-none">NI Portál</span>
              <span className="text-[11px] text-slate-400 mt-0.5 tracking-wide">
                Pannon Transfer · Zárt Partnerbejelentkezés
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16 relative z-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_460px] gap-10 items-center">
          <div className="hidden lg:block text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 mb-6">
              <ShieldCheck className="w-3.5 h-3.5 text-[#41B679]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">Zárt rendszer</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight leading-[1.05] mb-5">
              Biztonságos hozzáférés az NI partnerportáljához.
            </h1>
            <p className="text-slate-300/80 text-lg leading-relaxed max-w-xl mb-8">
              Kérjük, adja meg hitelesítő adatait a belépéshez. A rendszer kétfaktoros védelemmel (2FA) biztosítja a vállalati adatok és foglalások védelmét.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Hozzáférés</div>
                <div className="text-xl font-semibold">Vállalati hozzáférés</div>
                <p className="text-sm text-slate-400 mt-2">Kizárólag meghívóval rendelkező, dedikált partnerek számára.</p>
              </div>
              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(65,182,121,0.12),rgba(255,255,255,0.05))] p-5 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.22)]">
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-2">Biztonság</div>
                <div className="text-xl font-semibold">2FA Hitelesítés</div>
                <p className="text-sm text-slate-400 mt-2">Authenticator és biztonsági kódos védelem.</p>
              </div>
            </div>
          </div>
          <div className="w-full max-w-[460px] justify-self-center">
          <AnimatePresence mode="wait">
            {state === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleStep1Submit}
                className="flex flex-col"
              >
                <div className="mb-7 text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-[#41B679]/[0.08] border border-[#41B679]/10 flex items-center justify-center mb-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <ShieldCheck className="w-8 h-8 text-[#41B679]" />
                  </div>
                  <h1 className="text-[28px] font-bold text-white tracking-tight mb-2">
                    Jelentkezz be a NI Portálba
                  </h1>
                  <p className="text-[15px] text-slate-400 leading-relaxed max-w-md mx-auto">
                    Kérjük, adja meg a céges email címét és a fiókhoz társított jelszót. 
                    Amennyiben fiókjához kétfaktoros hitelesítés (2FA) tartozik, a kód megadása a következő lépésben történik.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">
                    Tudnivalók
                  </div>
                  <ul className="text-[13px] text-slate-300 leading-relaxed space-y-1.5">
                    <li>• A bejelentkezéshez kérjük, használja a Pannon Transfer által regisztrált céges email címét.</li>
                    <li>• 2FA hitelesítés esetén készítse elő Authenticator alkalmazását vagy biztonsági kódját.</li>
                    <li>• Belépési probléma esetén kérjük, forduljon a dedikált ügyfélszolgálathoz.</li>
                  </ul>
                </div>

                <div className="space-y-4 mb-5">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-slate-300 ml-1">
                      E-mail cím
                    </label>
                    <div className={`relative flex items-center bg-white/5 border transition-all duration-200 rounded-xl overflow-hidden ${
                      step1Error ? "border-red-300 ring-1 ring-red-200" : "border-white/10 focus-within:border-[#41B679]/60 focus-within:ring-2 focus-within:ring-[#41B679]/15"
                    }`}>
                      <Mail className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-500" : "text-slate-400"}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (step1Error) setStep1Error(null);
                        }}
                        placeholder="neve@ni.hu"
                        className="w-full bg-transparent pl-12 pr-4 py-3.5 text-[15px] text-white placeholder:text-slate-500 font-medium outline-none"
                        autoComplete="email"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1 mr-1">
                      <label className="text-[12px] font-semibold text-slate-300">
                        Jelszó
                      </label>
                    </div>
                    <div className={`relative flex items-center bg-white/5 border transition-all duration-200 rounded-xl overflow-hidden ${
                      step1Error ? "border-red-300 ring-1 ring-red-200" : "border-white/10 focus-within:border-[#41B679]/60 focus-within:ring-2 focus-within:ring-[#41B679]/15"
                    }`}>
                      <Lock className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-500" : "text-slate-400"}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (step1Error) setStep1Error(null);
                        }}
                        placeholder="••••••••"
                        className="w-full bg-transparent pl-12 pr-12 py-3.5 text-[15px] text-white placeholder:text-slate-500 font-medium outline-none"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white transition-colors rounded-lg"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 cursor-pointer group w-fit ml-1 mb-5">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-200 ${
                      remember
                        ? "bg-[#41B679] border-[#41B679]"
                        : "bg-white/5 border-white/20 group-hover:border-zinc-400"
                    }`}
                    onClick={() => setRemember((v) => !v)}
                  >
                    {remember && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className="text-[13px] text-slate-300 font-medium select-none"
                    onClick={() => setRemember((v) => !v)}
                  >
                    Emlékezzen rám ezen az eszközön (7 nap)
                  </span>
                </div>

                <AnimatePresence>
                  {step1Error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mb-5"
                    >
                      <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-red-700 font-medium leading-relaxed">{step1Error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={step1Loading}
                  className="w-full h-[54px] rounded-xl bg-[#41B679] hover:bg-[#10B981] text-white text-[14px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(65,182,121,0.18)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(65,182,121,0.24)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {step1Loading ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      Ellenőrzés...
                    </>
                  ) : (
                    <>
                      Bejelentkezés
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </>
                  )}
                </button>

                <p className="mt-7 text-center text-[12px] text-slate-400 leading-relaxed">
                  Még nincs hozzáférésed, vagy elfelejtetted a jelszavad?{" "}
                  <a
                    href="mailto:balog.sebastian@pannonguard.hu?subject=NI%20Port%C3%A1l%20-%20Hozz%C3%A1f%C3%A9r%C3%A9s%20k%C3%A9r%C3%A9se"
                    className="text-[#41B679] font-semibold hover:underline"
                  >
                    Ügyfélszolgálat
                  </a>
                </p>
              </motion.form>
            )}

            {state === "twofactor" && (
              <motion.form
                key="2fa"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleStep2Submit}
                className="flex flex-col"
              >
                <div className="mb-7">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#41B679]/[0.07] border border-[#41B679]/10 text-[#41B679] text-[11px] font-bold tracking-widest uppercase mb-4">
                    <KeyRound className="w-3.5 h-3.5" />
                    2. lépés · Kétfaktoros hitelesítés
                  </div>
                  <h1 className="text-[26px] font-bold text-white tracking-tight mb-2">
                    Erősítsd meg a bejelentkezést
                  </h1>
                  <p className="text-[15px] text-slate-400 leading-relaxed">
                    A fiókodhoz <strong className="font-semibold text-white">2FA kötelező</strong>.
                    Írd be az Authenticator alkalmazásod által generált
                    <strong className="font-semibold text-white"> 6 számjegyű kódot</strong>,
                    vagy használd a biztonsági mentett kódot.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 mb-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#41B679]/[0.06] border border-[#41B679]/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#41B679]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-0.5">
                        Bejelentkező fiók
                      </div>
                      <div className="text-[15px] font-semibold text-white truncate">
                        {twoFaEmail || email}
                      </div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#41B679]/[0.07] border border-[#41B679]/10 text-[#41B679] text-[11px] font-bold tracking-wide">
                      <KeyRound className="w-3.5 h-3.5" /> 2FA
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-semibold text-white mb-2 pl-0.5">
                    {twoFaUseBackup ? "Biztonsági kód (Backup code)" : "Authenticator kód (6 szám)"}
                  </label>
                  <input
                    type="text"
                    autoComplete="one-time-code"
                    inputMode={twoFaUseBackup ? "text" : "numeric"}
                    value={twoFaCode}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (!twoFaUseBackup) v = v.replace(/\D/g, "").slice(0, 6);
                      else v = v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
                      setTwoFaCode(v);
                      if (step2Error) setStep2Error(null);
                    }}
                    placeholder={twoFaUseBackup ? "pl. A1B2-C3D4-E5" : "000000"}
                    className="w-full h-[54px] px-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl text-[18px] text-center tracking-[0.45em] text-white placeholder:text-slate-500 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#41B679]/20 focus:border-[#41B679]/50 transition-all"
                  />
                </div>

                <div className="mb-5 flex items-center gap-2.5 pl-0.5">
                  <input
                    id="2fa-backup-login"
                    type="checkbox"
                    checked={twoFaUseBackup}
                    onChange={(e) => {
                      setTwoFaUseBackup(e.target.checked);
                      setTwoFaCode("");
                      if (step2Error) setStep2Error(null);
                    }}
                    className="w-4 h-4 rounded border-white/20 text-[#41B679] focus:ring-[#41B679]/30"
                  />
                  <label htmlFor="2fa-backup-login" className="text-[13px] font-medium text-slate-300">
                    Biztonsági kód használata (ha nincs hozzáférés az Authenticator apphoz)
                  </label>
                </div>

                <AnimatePresence>
                  {step2Error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mb-5"
                    >
                      <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl">
                        <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-red-700 font-medium leading-relaxed">{step2Error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={goBackToLogin}
                    disabled={step2Loading}
                    className="sm:flex-1 h-[54px] rounded-xl bg-white/5 hover:bg-white/10 text-white text-[14px] font-semibold border border-white/10 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center"
                  >
                    ← Vissza
                  </button>
                  <button
                    type="submit"
                    disabled={step2Loading}
                    className="sm:flex-[2] h-[54px] rounded-xl bg-[#41B679] hover:bg-[#10B981] text-white text-[14px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(65,182,121,0.18)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(65,182,121,0.24)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {step2Loading ? (
                      <>
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        Feldolgozás...
                      </>
                    ) : (
                      <>
                        Ellenőrzés &amp; Belépés
                        <ArrowRight className="w-[18px] h-[18px]" />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}

            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-8 w-full"
              >
                <div className="relative flex items-center justify-center w-full max-w-sm mb-12 px-4">
                  {/* Pannon Transfer side */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg mb-4">
                      <span className="text-white font-black text-xl tracking-tighter">PT</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase text-center w-24">Pannon Transfer</span>
                  </motion.div>

                  {/* Arrow Transition */}
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ transformOrigin: "left center" }}
                    className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-zinc-200 via-[#41B679]/50 to-[#41B679] relative mt-[-24px]"
                  >
                    <motion.div 
                      initial={{ left: "0%", opacity: 0, scale: 0 }}
                      animate={{ left: "100%", opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#41B679] shadow-[0_0_12px_4px_rgba(65,182,121,0.4)]"
                    />
                  </motion.div>

                  {/* NI side */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#41B679] to-[#10B981] flex items-center justify-center shadow-xl shadow-[#41B679]/20 mb-4">
                      <span className="text-white font-black text-xl tracking-tighter">ni</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#41B679] uppercase text-center w-24">Emerson | ni Portál</span>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h1 className="text-[20px] font-bold text-white tracking-tight">
                      Sikeres hitelesítés
                    </h1>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-white/10 rounded-full">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#41B679]" />
                    <p className="text-[13px] text-slate-300 font-medium">
                      Biztonságos kapcsolat felépítése...
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>

      <div className="w-full border-t border-white/5 bg-[#020813] backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">
              © {new Date().getFullYear()} Pannon Transfer · Minden jog fenntartva.
            </span>
          </div>
          <a
            href="mailto:balog.sebastian@pannonguard.hu"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[12px] font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Ügyfélszolgálat
          </a>
        </div>
      </div>
    </div>
  );
}
