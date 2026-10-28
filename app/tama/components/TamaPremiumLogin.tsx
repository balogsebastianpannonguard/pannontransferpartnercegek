"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Leaf,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useTamaLang } from "../lang";
import { authText, translateAuthMessage } from "../auth-i18n";
import {
  AuthFrame,
  SUPPORT,
  authCard,
  authInput,
  authPrimaryBtn,
  authSecondaryBtn,
  serifFont,
} from "../ui";

interface Props {
  _onSuccess: (user: { email: string; company?: string; role?: string }) => void;
}

type State = "login" | "twofactor" | "done";

export default function TamaPremiumLogin({ _onSuccess }: Props) {
  const [lang, setLang] = useTamaLang();
  const tx = (key: string, params?: Record<string, string | number>) => authText(lang, key, params);

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
      setStep1Error(tx("enterCreds"));
      return;
    }
    setStep1Error(null);
    setStep1Loading(true);
    try {
      const res = await fetch("/api/tama-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep1Error(translateAuthMessage(lang, json?.message, "signInFailed"));
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
        setTimeout(() => _onSuccess(json.user), 2200);
        return;
      }
      setStep1Error(tx("signInUnexpected"));
    } catch {
      setStep1Error(tx("networkError"));
    } finally {
      setStep1Loading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = twoFaUseBackup ? twoFaCode.trim().toUpperCase() : twoFaCode.replace(/\s+/g, "");
    if (!clean || (twoFaUseBackup ? clean.length < 6 : clean.length !== 6)) {
      setStep2Error(twoFaUseBackup ? tx("enterBackup") : tx("enter6"));
      return;
    }
    setStep2Error(null);
    setStep2Loading(true);
    try {
      const res = await fetch("/api/tama-auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code: clean, useBackup: twoFaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep2Error(translateAuthMessage(lang, json?.message, "incorrect2fa"));
        return;
      }
      if (json?.user) {
        setState("done");
        setTimeout(() => _onSuccess(json.user), 2200);
        return;
      }
      setStep2Error(tx("unexpectedError"));
    } catch {
      setStep2Error(tx("networkError"));
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
          <div role="alert" className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-2xl">
            <AlertTriangle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-700 font-medium leading-relaxed">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <AuthFrame
      lang={lang}
      onLang={setLang}
      panelEyebrow={tx("loginEyebrow")}
      panelTitle={tx("loginSideTitle")}
      panelText={tx("loginSideText")}
      footerNote={tx("brandSub")}
    >
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B9824] to-[#4B6A0E] flex items-center justify-center mb-5 shadow-[0_12px_28px_rgba(75,106,14,0.3)]">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-[30px] leading-tight text-[#26301B] mb-2.5" style={serifFont}>
                {tx("loginTitle")}
              </h1>
              <p className="text-[15px] text-[#5B6450] leading-relaxed">{tx("loginLead")}</p>
            </div>

            <div className="rounded-2xl bg-[#FBF8EC] border border-[#EEE5C6] p-4 mb-6">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B917D] mb-2">
                <Leaf className="w-3.5 h-3.5 text-[#7B9824]" />
                {tx("goodToKnow")}
              </div>
              <ul className="text-[13px] text-[#4A5340] leading-relaxed space-y-1.5">
                <li className="flex gap-2"><span className="text-[#C9A24D]">•</span>{tx("tip1")}</li>
                <li className="flex gap-2"><span className="text-[#C9A24D]">•</span>{tx("tip2")}</li>
                <li className="flex gap-2"><span className="text-[#C9A24D]">•</span>{tx("tip3")}</li>
              </ul>
            </div>

            <div className="space-y-4 mb-5">
              <div className="space-y-2">
                <label htmlFor="tama-login-email" className="text-[12px] font-bold text-[#4A5340] ml-1">
                  {tx("emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA08A]" />
                  <input
                    id="tama-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (step1Error) setStep1Error(null);
                    }}
                    placeholder={tx("emailPh")}
                    className={`${authInput} pl-12 ${step1Error ? "!border-red-400 !ring-4 !ring-red-500/10" : ""}`}
                    autoComplete="email"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="tama-login-password" className="text-[12px] font-bold text-[#4A5340] ml-1">
                  {tx("passwordLabel")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA08A]" />
                  <input
                    id="tama-login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (step1Error) setStep1Error(null);
                    }}
                    placeholder="••••••••"
                    className={`${authInput} pl-12 pr-12 ${step1Error ? "!border-red-400 !ring-4 !ring-red-500/10" : ""}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-[#8B917D] hover:text-[#26301B] transition-colors rounded-full hover:bg-[#F1EDDD]"
                    tabIndex={-1}
                    aria-label={showPassword ? tx("hidePwd") : tx("showPwd")}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRemember((v) => !v)}
              className="flex items-center gap-3 w-fit ml-1 mb-5 group"
              aria-pressed={remember}
            >
              <span
                className={`w-[18px] h-[18px] rounded-md flex items-center justify-center border transition-all duration-200 ${
                  remember ? "bg-[#5F8016] border-[#5F8016]" : "bg-white border-[#CFC7A8] group-hover:border-[#9CA08A]"
                }`}
              >
                {remember && <Check className="w-3 h-3 text-white" />}
              </span>
              <span className="text-[13px] text-[#4A5340] font-medium select-none">{tx("remember")}</span>
            </button>

            {errorBox(step1Error)}

            <button type="submit" disabled={step1Loading} className={authPrimaryBtn}>
              {step1Loading ? (
                <>
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  {tx("verifying")}
                </>
              ) : (
                <>
                  {tx("signIn")}
                  <ArrowRight className="w-[18px] h-[18px]" />
                </>
              )}
            </button>

            <p className="mt-7 text-center text-[12px] text-[#8B917D] leading-relaxed">
              {tx("noAccess")}{" "}
              <a
                href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(tx("accessRequestSubject"))}`}
                className="text-[#4B6A0E] font-semibold hover:underline"
              >
                {tx("support")}
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF1D3] border border-[#CFDDA0] text-[#3E560C] text-[11px] font-bold tracking-widest uppercase mb-4">
                <KeyRound className="w-3.5 h-3.5" />
                {tx("step2Pill")}
              </div>
              <h1 className="text-[28px] leading-tight text-[#26301B] mb-2.5" style={serifFont}>
                {tx("confirmTitle")}
              </h1>
              <p className="text-[15px] text-[#5B6450] leading-relaxed">{tx("confirmLead")}</p>
            </div>

            <div className={`${authCard} p-4 mb-6 !rounded-2xl !shadow-none`}>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#EAF1D3] border border-[#CFDDA0] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#5F8016]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B917D] mb-0.5">{tx("signingInAs")}</div>
                  <div className="text-[15px] font-semibold text-[#26301B] truncate">{twoFaEmail || email}</div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#EAF1D3] border border-[#CFDDA0] text-[#3E560C] text-[11px] font-bold tracking-wide">
                  <KeyRound className="w-3.5 h-3.5" /> 2FA
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="tama-2fa-code" className="block text-[13px] font-bold text-[#4A5340] mb-2 pl-1">
                {twoFaUseBackup ? tx("backupLabel") : tx("codeLabel")}
              </label>
              <input
                id="tama-2fa-code"
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
                placeholder={twoFaUseBackup ? tx("backupPh") : tx("codePh")}
                className={`${authInput} text-center text-[18px] tracking-[0.45em] font-mono font-bold`}
              />
            </div>

            <label className="mb-5 flex items-center gap-2.5 pl-1 cursor-pointer">
              <input
                type="checkbox"
                checked={twoFaUseBackup}
                onChange={(e) => {
                  setTwoFaUseBackup(e.target.checked);
                  setTwoFaCode("");
                  if (step2Error) setStep2Error(null);
                }}
                className="w-4 h-4 rounded border-[#CFC7A8] accent-[#5F8016]"
              />
              <span className="text-[13px] font-medium text-[#5B6450]">{tx("useBackup")}</span>
            </label>

            {errorBox(step2Error)}

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={goBackToLogin} disabled={step2Loading} className={`${authSecondaryBtn} sm:flex-1`}>
                ← {tx("back")}
              </button>
              <button type="submit" disabled={step2Loading} className={`${authPrimaryBtn} sm:flex-[2]`}>
                {step2Loading ? (
                  <>
                    <Loader2 className="w-[18px] h-[18px] animate-spin" />
                    {tx("processing")}
                  </>
                ) : (
                  <>
                    {tx("verifyAndSignIn")}
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
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#26301B] flex items-center justify-center shadow-lg mb-4">
                  <span className="text-white font-black text-xl tracking-tighter">PT</span>
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#8B917D] uppercase text-center w-24">Pannon Transfer</span>
              </motion.div>

              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                style={{ transformOrigin: "left center" }}
                className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-[#E4DDC7] via-[#7B9824]/60 to-[#5F8016] relative mt-[-24px]"
              >
                <motion.div
                  initial={{ left: "0%", opacity: 0, scale: 0 }}
                  animate={{ left: "100%", opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.7, ease: "easeInOut" }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#5F8016] shadow-[0_0_12px_4px_rgba(95,128,22,0.4)]"
                />
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B9824] to-[#4B6A0E] flex items-center justify-center shadow-xl shadow-[#5F8016]/25 mb-4">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#5F8016] uppercase text-center w-24">TAMA</span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-[#5F8016]" />
                <h1 className="text-[20px] text-[#26301B]" style={serifFont}>{tx("authSuccess")}</h1>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F1EDDD] rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5F8016]" />
                <p className="text-[13px] text-[#5B6450] font-medium">{tx("secureConnection")}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthFrame>
  );
}
