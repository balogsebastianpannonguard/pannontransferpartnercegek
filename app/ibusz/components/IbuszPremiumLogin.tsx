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
  Plane,
  Headphones,
  Clock3,
} from "lucide-react";
import { useIbuszLang } from "../lang";
import { authMessage, ibText, type IbuszKey } from "../i18n";
import { HeroBackdrop, IbuszLogo, LangSwitch, LogoPair, PannonChip } from "./IbuszBrand";

export interface IbuszLoginUser {
  email: string;
  company?: string;
  role?: string;
}

interface Props {
  _onSuccess: (user: IbuszLoginUser) => void;
}

type State = "login" | "twofactor" | "done";

const fieldShell = (invalid: boolean) =>
  `relative flex items-center bg-white border transition-all duration-200 rounded-2xl overflow-hidden ${
    invalid
      ? "border-red-300 ring-2 ring-red-100"
      : "border-slate-200 hover:border-slate-300 focus-within:border-[#004A8D] focus-within:ring-4 focus-within:ring-[#004A8D]/10"
  }`;

export default function IbuszPremiumLogin({ _onSuccess }: Props) {
  const [lang, setLang] = useIbuszLang();
  const tx = (key: IbuszKey, params?: Record<string, string | number>) =>
    ibText(lang, key, params);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [step1Loading, setStep1Loading] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const [state, setState] = useState<State>("login");

  const [challengeToken, setChallengeToken] = useState("");
  const [twoFaEmail, setTwoFaEmail] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaUseBackup, setTwoFaUseBackup] = useState(false);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step2Error, setStep2Error] = useState<string | null>(null);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStep1Error(tx("errEnterEmailPassword"));
      return;
    }
    setStep1Error(null);
    setStep1Loading(true);
    try {
      const res = await fetch("/api/ibusz-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep1Error(authMessage(lang, json?.message, "errSignInFailed"));
        return;
      }
      if (json.needTwoFactor) {
        setChallengeToken(json.challengeToken || "");
        setTwoFaEmail(json.email || email);
        setTwoFaCode("");
        setTwoFaUseBackup(false);
        setStep2Error(null);
        setState("twofactor");
        return;
      }
      if (json?.user) {
        setState("done");
        setTimeout(() => _onSuccess(json.user), 2500);
        return;
      }
      setStep1Error(tx("errUnexpectedSignIn"));
    } catch {
      setStep1Error(tx("errNetworkShort"));
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
      setStep2Error(twoFaUseBackup ? tx("errEnterBackup") : tx("errEnterCode6"));
      return;
    }
    setStep2Error(null);
    setStep2Loading(true);
    try {
      const res = await fetch("/api/ibusz-auth/login/verify-2fa", {
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
        setStep2Error(authMessage(lang, json?.message, "errWrongCode"));
        return;
      }
      if (json?.user) {
        setState("done");
        setTimeout(() => _onSuccess(json.user), 2500);
        return;
      }
      setStep2Error(tx("errUnexpectedSignIn"));
    } catch {
      setStep2Error(tx("errNetworkShort"));
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

  const primaryBtn =
    "w-full h-[54px] rounded-2xl bg-gradient-to-r from-[#004A8D] to-[#0C6BB5] hover:from-[#00386B] hover:to-[#004A8D] text-white text-[14px] font-semibold shadow-[0_12px_28px_rgba(0,74,141,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

  const errorBox = (message: string | null) => (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-5"
        >
          <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl">
            <AlertTriangle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-700 font-medium leading-relaxed">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col lg:flex-row">
      {/* Brand panel */}
      <aside className="relative lg:w-[46%] lg:min-h-screen overflow-hidden bg-[#004A8D] text-white">
        <HeroBackdrop height="100%" waves={false} />
        <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:px-10 lg:px-14 lg:py-12 min-h-[240px] lg:min-h-screen">
          <div className="flex items-center justify-between gap-4">
            <LogoPair size="md" />
            <div className="lg:hidden">
              <LangSwitch lang={lang} onChange={setLang} tone="dark" label={tx("language")} />
            </div>
          </div>

          <div className="hidden lg:block max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 text-[#FFC24D]" />
              {tx("heroEyebrow")}
            </div>
            <h2 className="mt-6 text-[40px] font-semibold leading-[1.08] tracking-tight">
              {tx("setupWelcome")}
            </h2>
            <p className="mt-5 text-[16px] leading-7 text-white/80">
              {tx("heroSubtitle")}
            </p>
            <ul className="mt-9 space-y-4">
              {[
                { icon: <Plane className="h-4 w-4" />, text: tx("typeAirport") + " · " + tx("secRoute") },
                { icon: <Clock3 className="h-4 w-4" />, text: tx("fTime") + " · " + tx("fDate") },
                { icon: <Headphones className="h-4 w-4" />, text: tx("support") },
              ].map((i) => (
                <li key={i.text} className="flex items-center gap-3 text-[14px] font-medium text-white/90">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/12 ring-1 ring-white/20 text-[#FFC24D]">
                    {i.icon}
                  </span>
                  {i.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block text-[12px] text-white/60">
            © {new Date().getFullYear()} Pannon Transfer. {tx("rights")}
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <section className="relative flex-1 flex flex-col">
        <div className="hidden lg:flex items-center justify-between px-10 h-[72px]">
          <IbuszLogo className="h-8" />
          <LangSwitch lang={lang} onChange={setLang} tone="light" label={tx("language")} />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
          <div className="w-full max-w-[460px]">
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
                  <div className="mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#004A8D] to-[#0C6BB5] flex items-center justify-center mb-5 shadow-[0_12px_26px_rgba(0,74,141,0.28)] ring-4 ring-[#F39200]/25">
                      <ShieldCheck className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-[28px] font-bold text-slate-900 tracking-tight mb-2">
                      {tx("loginTitle")}
                    </h1>
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                      {tx("loginIntro")}
                    </p>
                  </div>

                  <div className="bg-[#FFF8EC] border border-[#F39200]/25 rounded-2xl p-4 mb-6">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C77700] mb-1.5">
                      {tx("goodToKnow")}
                    </div>
                    <ul className="text-[13px] text-slate-700 leading-relaxed space-y-1.5">
                      <li>• {tx("gtk1")}</li>
                      <li>• {tx("gtk2")}</li>
                      <li>• {tx("gtk3")}</li>
                    </ul>
                  </div>

                  <div className="space-y-4 mb-5">
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold text-slate-700 ml-1">
                        {tx("labelEmail")}
                      </label>
                      <div className={fieldShell(!!step1Error)}>
                        <Mail className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-500" : "text-slate-400"}`} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (step1Error) setStep1Error(null);
                          }}
                          placeholder="nev@ibusz.hu"
                          className="w-full bg-transparent pl-12 pr-4 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 font-medium outline-none"
                          autoComplete="email"
                          spellCheck={false}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold text-slate-700 ml-1">
                        {tx("labelPassword")}
                      </label>
                      <div className={fieldShell(!!step1Error)}>
                        <Lock className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-500" : "text-slate-400"}`} />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (step1Error) setStep1Error(null);
                          }}
                          placeholder="••••••••"
                          className="w-full bg-transparent pl-12 pr-12 py-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 font-medium outline-none"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
                          tabIndex={-1}
                          aria-label={showPassword ? tx("hidePassword") : tx("showPassword")}
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
                          ? "bg-[#004A8D] border-[#004A8D]"
                          : "bg-white border-slate-300 group-hover:border-slate-400"
                      }`}
                      onClick={() => setRemember((v) => !v)}
                    >
                      {remember && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className="text-[13px] text-slate-700 font-medium select-none"
                      onClick={() => setRemember((v) => !v)}
                    >
                      {tx("remember")}
                    </span>
                  </div>

                  {errorBox(step1Error)}

                  <button type="submit" disabled={step1Loading} className={primaryBtn}>
                    {step1Loading ? (
                      <>
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        {tx("verifying")}
                      </>
                    ) : (
                      <>
                        {tx("signIn")}
                        <span className="w-6 h-6 rounded-full bg-[#F39200] flex items-center justify-center">
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </span>
                      </>
                    )}
                  </button>

                  <p className="mt-7 text-center text-[12px] text-slate-500 leading-relaxed">
                    {tx("noAccess")}{" "}
                    <a
                      href="mailto:balogh.sebastian@pannonguard.hu?subject=IBUSZ%20port%C3%A1l%20-%20Hozz%C3%A1f%C3%A9r%C3%A9s"
                      className="text-[#004A8D] font-semibold hover:underline"
                    >
                      {tx("contactSupport")}
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
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#004A8D]/[0.07] border border-[#004A8D]/10 text-[#004A8D] text-[11px] font-bold tracking-widest uppercase mb-4">
                      <KeyRound className="w-3.5 h-3.5" />
                      {tx("step2Tag")}
                    </div>
                    <h1 className="text-[26px] font-bold text-slate-900 tracking-tight mb-2">
                      {tx("confirmSignIn")}
                    </h1>
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                      {tx("tfaIntroA")}{" "}
                      <strong className="font-semibold text-slate-800">{tx("tfaIntroB")}</strong>
                      {tx("tfaIntroC")}{" "}
                      <strong className="font-semibold text-slate-800">{tx("tfaIntroD")}</strong>
                      {tx("tfaIntroE")}
                    </p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-[0_1px_2px_rgba(15,34,56,0.04)]">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#004A8D]/[0.07] flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-[#004A8D]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-0.5">
                          {tx("signingInAs")}
                        </div>
                        <div className="text-[15px] font-semibold text-slate-900 truncate">
                          {twoFaEmail || email}
                        </div>
                      </div>
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F39200]/10 border border-[#F39200]/25 text-[#C77700] text-[11px] font-bold tracking-wide">
                        <KeyRound className="w-3.5 h-3.5" /> 2FA
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[13px] font-semibold text-slate-800 mb-2 pl-0.5">
                      {twoFaUseBackup ? tx("backupCode") : tx("authCode")}
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
                      placeholder={twoFaUseBackup ? tx("backupPh") : "000000"}
                      className="w-full h-[54px] px-4 bg-white border border-slate-200 rounded-2xl text-[18px] text-center tracking-[0.45em] text-slate-900 placeholder:text-slate-300 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#004A8D]/10 focus:border-[#004A8D] transition-all"
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
                      className="w-4 h-4 rounded border-slate-300 text-[#004A8D] focus:ring-[#004A8D]/30"
                    />
                    <label htmlFor="2fa-backup-login" className="text-[13px] font-medium text-slate-600">
                      {tx("useBackupLogin")}
                    </label>
                  </div>

                  {errorBox(step2Error)}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={goBackToLogin}
                      disabled={step2Loading}
                      className="sm:flex-1 h-[54px] rounded-2xl bg-white hover:bg-slate-50 text-slate-900 text-[14px] font-semibold border border-slate-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center"
                    >
                      ← {tx("back")}
                    </button>
                    <button
                      type="submit"
                      disabled={step2Loading}
                      className={`sm:flex-[2] ${primaryBtn}`}
                    >
                      {step2Loading ? (
                        <>
                          <Loader2 className="w-[18px] h-[18px] animate-spin" />
                          {tx("processing")}
                        </>
                      ) : (
                        <>
                          {tx("verifyAndSignIn")}
                          <span className="w-6 h-6 rounded-full bg-[#F39200] flex items-center justify-center">
                            <ArrowRight className="w-3.5 h-3.5 text-white" />
                          </span>
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
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="flex flex-col items-center"
                    >
                      <div className="h-16 px-4 rounded-2xl bg-white border border-slate-200 flex items-center shadow-lg mb-4">
                        <PannonChip className="h-6" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      style={{ transformOrigin: "left center" }}
                      className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-slate-200 via-[#F39200]/60 to-[#F39200] relative mt-[-16px]"
                    >
                      <motion.div
                        initial={{ left: "0%", opacity: 0, scale: 0 }}
                        animate={{ left: "100%", opacity: 1, scale: 1 }}
                        transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F39200] shadow-[0_0_12px_4px_rgba(243,146,0,0.4)]"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="flex flex-col items-center"
                    >
                      <div className="h-16 px-4 rounded-2xl bg-white border border-[#004A8D]/15 flex items-center shadow-xl shadow-[#004A8D]/15 mb-4">
                        <IbuszLogo className="h-9" />
                      </div>
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
                      <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
                        {tx("authSuccess")}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-100 rounded-full">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#004A8D]" />
                      <p className="text-[13px] text-slate-600 font-medium">
                        {tx("secureConn")}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
          <div className="max-w-[900px] mx-auto px-6 h-14 flex items-center justify-between text-[11px] text-slate-400 font-medium lg:justify-end">
            <span className="lg:hidden">© {new Date().getFullYear()} Pannon Transfer. {tx("rights")}</span>
            <a
              href="mailto:balogh.sebastian@pannonguard.hu"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#004A8D] font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              {tx("support")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
