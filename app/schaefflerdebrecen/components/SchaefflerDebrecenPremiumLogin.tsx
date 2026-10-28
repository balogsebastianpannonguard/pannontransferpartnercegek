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
import { translateSdAuthMessage, useSdLang } from "../i18n";
import { SD_PATTERN, SD_SUPPORT, SdLangSwitch, SdLogos, sdCard, sdPrimaryBtn, sdSecondaryBtn } from "../ui";

interface Props {
  _onSuccess: (user: { email: string; company?: string; role?: string }) => void;
}

type State = "login" | "twofactor" | "done";

export default function SchaefflerDebrecenPremiumLogin({ _onSuccess }: Props) {
  const { lang, setLang, tx } = useSdLang();

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
      setStep1Error(tx("loginEnterBoth"));
      return;
    }
    setStep1Error(null);
    setStep1Loading(true);
    try {
      const res = await fetch("/api/schaefflerdebrecen-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep1Error(translateSdAuthMessage(lang, json?.message, tx("loginFailed")));
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
      setStep1Error(tx("loginUnexpected"));
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
      setStep2Error(twoFaUseBackup ? tx("tfaEnterBackup") : tx("tfaEnter6"));
      return;
    }
    setStep2Error(null);
    setStep2Loading(true);
    try {
      const res = await fetch("/api/schaefflerdebrecen-auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code: clean, useBackup: twoFaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep2Error(translateSdAuthMessage(lang, json?.message, tx("tfaIncorrect")));
        return;
      }
      if (json?.user) {
        setState("done");
        setTimeout(() => _onSuccess(json.user), 2500);
        return;
      }
      setStep2Error(tx("loginUnexpected"));
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

  const fieldShell = (hasError: boolean) =>
    `relative flex items-center bg-white border transition-all duration-200 rounded-xl overflow-hidden ${
      hasError
        ? "border-red-300 ring-1 ring-red-200"
        : "border-[#DCE3DF] focus-within:border-[#00893D]/70 focus-within:ring-4 focus-within:ring-[#00893D]/10"
    }`;

  const errorBox = (msg: string) => (
    <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl">
      <AlertTriangle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
      <p className="text-[13px] text-red-700 font-medium leading-relaxed">{msg}</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#F3F6F4] text-[#0E1A14] flex flex-col">
      <div className="w-full bg-[#0B3D2A] relative">
        <div className={`absolute inset-0 ${SD_PATTERN}`} aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#00893D]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 h-[76px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <SdLogos onDark />
            <span className="hidden md:block text-[11px] text-white/70 tracking-wide ml-1 truncate">{tx("loginBarTag")}</span>
          </div>
          <SdLangSwitch lang={lang} onChange={setLang} label={tx("language")} onDark />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[480px]">
          <AnimatePresence mode="wait">
            {state === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleStep1Submit}
                className={`${sdCard} p-7 sm:p-9 flex flex-col`}
              >
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E7F4EC] border border-[#CBE6D6] flex items-center justify-center mb-5">
                    <ShieldCheck className="w-6 h-6 text-[#00893D]" />
                  </div>
                  <h1 className="text-[26px] font-bold text-[#0E1A14] tracking-tight mb-2">{tx("loginTitle")}</h1>
                  <p className="text-[14.5px] text-[#5C6B63] leading-relaxed">{tx("loginIntro")}</p>
                </div>

                <div className="bg-[#F6F9F7] border border-[#E1E7E3] rounded-xl p-4 mb-6">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7B8A82] mb-1.5">
                    {tx("loginGoodToKnow")}
                  </div>
                  <ul className="text-[13px] text-[#31413A] leading-relaxed space-y-1.5">
                    {(["loginTip1", "loginTip2", "loginTip3"] as const).map((k) => (
                      <li key={k} className="flex gap-2">
                        <Check className="w-3.5 h-3.5 text-[#00893D] mt-[3px] shrink-0" />
                        {tx(k)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4 mb-5">
                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[#31413A] ml-1">{tx("loginEmail")}</label>
                    <div className={fieldShell(!!step1Error)}>
                      <Mail className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-500" : "text-[#7B8A82]"}`} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (step1Error) setStep1Error(null);
                        }}
                        placeholder={tx("loginEmailPh")}
                        className="w-full bg-transparent pl-12 pr-4 py-3.5 text-[15px] text-[#0E1A14] placeholder:text-[#9AA7A0] font-medium outline-none"
                        autoComplete="email"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-semibold text-[#31413A] ml-1">{tx("loginPassword")}</label>
                    <div className={fieldShell(!!step1Error)}>
                      <Lock className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-500" : "text-[#7B8A82]"}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (step1Error) setStep1Error(null);
                        }}
                        placeholder="••••••••"
                        className="w-full bg-transparent pl-12 pr-12 py-3.5 text-[15px] text-[#0E1A14] placeholder:text-[#9AA7A0] font-medium outline-none"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2 w-9 h-9 flex items-center justify-center text-[#7B8A82] hover:text-[#0B3D2A] transition-colors rounded-lg"
                        tabIndex={-1}
                        aria-label={showPassword ? tx("hidePassword") : tx("showPassword")}
                      >
                        {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  role="checkbox"
                  aria-checked={remember}
                  onClick={() => setRemember((v) => !v)}
                  className="flex items-center gap-3 w-fit ml-1 mb-5 group"
                >
                  <span
                    className={`w-[18px] h-[18px] rounded flex items-center justify-center border transition-all duration-200 ${
                      remember ? "bg-[#00893D] border-[#00893D]" : "bg-white border-[#C5CFC9] group-hover:border-[#9AA7A0]"
                    }`}
                  >
                    {remember && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="text-[13px] text-[#31413A] font-medium select-none">{tx("loginRemember")}</span>
                </button>

                <AnimatePresence>
                  {step1Error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mb-5"
                    >
                      {errorBox(step1Error)}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={step1Loading} className={sdPrimaryBtn}>
                  {step1Loading ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      {tx("loginVerifying")}
                    </>
                  ) : (
                    <>
                      {tx("loginSubmit")}
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </>
                  )}
                </button>

                <p className="mt-6 text-center text-[12px] text-[#7B8A82] leading-relaxed">
                  {tx("loginNoAccess")}{" "}
                  <a
                    href={`mailto:${SD_SUPPORT.email}?subject=Schaeffler%20Debrecen%20Portal%20-%20Access%20request`}
                    className="text-[#00893D] font-semibold hover:underline"
                  >
                    {tx("loginSupport")}
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
                className={`${sdCard} p-7 sm:p-9 flex flex-col`}
              >
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E7F4EC] border border-[#CBE6D6] text-[#007335] text-[11px] font-bold tracking-widest uppercase mb-4">
                    <KeyRound className="w-3.5 h-3.5" />
                    {tx("tfaStep2")}
                  </div>
                  <h1 className="text-[25px] font-bold text-[#0E1A14] tracking-tight mb-2">{tx("tfaConfirmTitle")}</h1>
                  <p className="text-[14.5px] text-[#5C6B63] leading-relaxed">
                    <strong className="font-semibold text-[#0E1A14]">{tx("tfaRequiredLead")}</strong> {tx("tfaIntroA")}{" "}
                    <strong className="font-semibold text-[#0E1A14]">{tx("tfaIntroB")}</strong> {tx("tfaIntroC")}
                  </p>
                </div>

                <div className="bg-[#F6F9F7] border border-[#E1E7E3] rounded-xl p-4 mb-6 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#CBE6D6] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#00893D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7B8A82] mb-0.5">{tx("signingInAs")}</div>
                    <div className="text-[15px] font-semibold text-[#0E1A14] truncate">{twoFaEmail || email}</div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E7F4EC] border border-[#CBE6D6] text-[#007335] text-[11px] font-bold tracking-wide">
                    <KeyRound className="w-3.5 h-3.5" /> 2FA
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-semibold text-[#31413A] mb-2 pl-0.5">
                    {twoFaUseBackup ? tx("tfaBackupLabel") : tx("tfaCodeLabel")}
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
                    placeholder={twoFaUseBackup ? tx("tfaBackupPh") : "000000"}
                    className="w-full h-[54px] px-4 bg-white border border-[#DCE3DF] rounded-xl text-[18px] text-center tracking-[0.45em] text-[#0E1A14] placeholder:text-[#9AA7A0] font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#00893D]/10 focus:border-[#00893D]/70 transition-all"
                  />
                </div>

                <div className="mb-5 flex items-center gap-2.5 pl-0.5">
                  <input
                    id="sd-2fa-backup-login"
                    type="checkbox"
                    checked={twoFaUseBackup}
                    onChange={(e) => {
                      setTwoFaUseBackup(e.target.checked);
                      setTwoFaCode("");
                      if (step2Error) setStep2Error(null);
                    }}
                    className="w-4 h-4 rounded border-[#C5CFC9] text-[#00893D] focus:ring-[#00893D]/30"
                  />
                  <label htmlFor="sd-2fa-backup-login" className="text-[13px] font-medium text-[#5C6B63]">
                    {tx("tfaUseBackup")}
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
                      {errorBox(step2Error)}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={goBackToLogin} disabled={step2Loading} className={`${sdSecondaryBtn} sm:flex-1`}>
                    ← {tx("back")}
                  </button>
                  <button type="submit" disabled={step2Loading} className={`${sdPrimaryBtn} sm:flex-[2]`}>
                    {step2Loading ? (
                      <>
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        {tx("processing")}
                      </>
                    ) : (
                      <>
                        {tx("verifySignIn")}
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
                    <div className="w-16 h-16 rounded-2xl bg-[#0B3D2A] flex items-center justify-center shadow-lg mb-4">
                      <span className="text-white font-black text-xl tracking-tighter">PT</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#7B8A82] uppercase text-center w-24">Pannon Transfer</span>
                  </motion.div>

                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ transformOrigin: "left center" }}
                    className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-[#DCE3DF] via-[#00893D]/50 to-[#00893D] relative mt-[-24px]"
                  >
                    <motion.div
                      initial={{ left: "0%", opacity: 0, scale: 0 }}
                      animate={{ left: "100%", opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00893D] shadow-[0_0_12px_4px_rgba(0,137,61,0.35)]"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#00893D] flex items-center justify-center shadow-xl shadow-[#00893D]/20 mb-4">
                      <span className="text-white font-black text-xl tracking-tighter">S</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#00893D] uppercase text-center w-24">
                      Schaeffler {tx("portalWord")}
                    </span>
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
                    <h1 className="text-[20px] font-bold text-[#0E1A14] tracking-tight">{tx("authSuccess")}</h1>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-[#E1E7E3] rounded-full">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00893D]" />
                    <p className="text-[13px] text-[#5C6B63] font-medium">{tx("authEstablishing")}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full border-t border-[#E1E7E3] bg-white/70 backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-[11px] text-[#7B8A82] font-medium">
            © {new Date().getFullYear()} Pannon Transfer. {tx("rights")}
          </span>
          <a
            href={`mailto:${SD_SUPPORT.email}`}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[12px] font-semibold text-[#5C6B63] hover:text-[#0B3D2A] hover:bg-[#F1F5F2] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            {tx("loginSupport")}
          </a>
        </div>
      </div>
    </div>
  );
}
