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
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { useMxLang } from "../lang";
import { makeTx, translateAuthMessage } from "../booking-i18n";
import { MxBackdrop, MxLangSwitch, PannonChip, SchaefflerChip, SUPPORT } from "./mx-ui";

export interface MxPortalUser {
  email: string;
  company?: string;
  role?: string;
}

interface Props {
  _onSuccess: (user: MxPortalUser) => void;
}

type State = "login" | "twofactor" | "done";

const inputWrap = (invalid: boolean) =>
  `relative flex items-center bg-[#0E1511] border rounded-[6px] transition-all duration-200 ${
    invalid
      ? "border-red-500/60 ring-4 ring-red-500/10"
      : "border-white/12 hover:border-white/25 focus-within:border-[#3DDC84]/70 focus-within:ring-4 focus-within:ring-[#00893D]/20"
  }`;

export default function SchaefflerMotionPremiumLogin({ _onSuccess }: Props) {
  const [lang, setLang] = useMxLang();
  const tx = makeTx(lang);

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
      setStep1Error(tx("loginPleaseFill"));
      return;
    }
    setStep1Error(null);
    setStep1Loading(true);
    try {
      const res = await fetch("/api/schaefflermotion-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep1Error(translateAuthMessage(lang, json?.message, "loginFailed"));
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
      setStep2Error(twoFaUseBackup ? tx("enterBackup") : tx("enterCode6"));
      return;
    }
    setStep2Error(null);
    setStep2Loading(true);
    try {
      const res = await fetch("/api/schaefflermotion-auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code: clean, useBackup: twoFaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep2Error(translateAuthMessage(lang, json?.message, "wrong2fa"));
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

  const errBox = (msg: string | null) => (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-5"
          role="alert"
        >
          <div className="flex items-start gap-3 px-4 py-3.5 bg-red-500/[0.08] border border-red-500/30 rounded-[6px]">
            <AlertTriangle className="w-[18px] h-[18px] text-red-400 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-300 font-medium leading-relaxed">{msg}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const primaryBtn =
    "w-full h-[52px] rounded-[6px] bg-[#00893D] hover:bg-[#00A04A] text-white text-[13px] font-bold tracking-[0.14em] uppercase shadow-[0_10px_30px_rgba(0,137,61,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 active:scale-[0.99]";
  const label = "block font-mono text-[10.5px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2";

  return (
    <div className="relative min-h-screen text-slate-300 flex flex-col bg-[#0B100E] overflow-x-hidden">
      <MxBackdrop />

      <div className="relative z-10 h-[3px] w-full bg-[linear-gradient(90deg,#00893D,#3DDC84_55%,transparent)]" />
      <header className="relative z-10 max-w-[1240px] w-full mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PannonChip className="h-9" />
          <span className="w-px h-6 bg-white/15" aria-hidden />
          <SchaefflerChip className="h-9" />
        </div>
        <MxLangSwitch lang={lang} onChange={setLang} />
      </header>

      <main className="relative z-10 flex-1 max-w-[1240px] w-full mx-auto px-5 sm:px-8 py-8 sm:py-14 grid lg:grid-cols-[1.1fr_480px] gap-10 xl:gap-20 items-center">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.24em] uppercase text-[#3DDC84] mb-6">
            <span className="w-2 h-2 bg-[#3DDC84] rounded-[1px] shadow-[0_0_10px_rgba(61,220,132,0.9)]" />
            {tx("loginTag")}
          </div>
          <h1 className="text-[56px] leading-[1.02] font-semibold tracking-[-0.035em] text-white whitespace-pre-line">
            {tx("loginBrandTitle")}
          </h1>
          <p className="mt-6 max-w-lg text-[16px] leading-8 text-slate-400">{tx("loginBrandText")}</p>
          <ul className="mt-10 space-y-3.5">
            {[
              { icon: <Lock className="w-4 h-4" />, text: tx("loginFeat1") },
              { icon: <ShieldCheck className="w-4 h-4" />, text: tx("loginFeat2") },
              { icon: <Activity className="w-4 h-4" />, text: tx("loginFeat3") },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3.5 text-[14px] font-medium text-slate-200">
                <span className="w-9 h-9 rounded-[5px] bg-[#00893D]/12 border border-[#00893D]/40 text-[#3DDC84] flex items-center justify-center">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full">
          <div className="relative rounded-[10px] border border-white/10 bg-[#111815]/90 backdrop-blur p-6 sm:p-9 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <span className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#3DDC84] to-transparent" />
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
                    <div className="w-12 h-12 rounded-[6px] bg-[#00893D]/15 border border-[#00893D]/40 flex items-center justify-center mb-5">
                      <ShieldCheck className="w-6 h-6 text-[#3DDC84]" />
                    </div>
                    <h2 className="text-[27px] font-semibold text-white tracking-tight mb-2">{tx("loginTitle")}</h2>
                    <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("loginText")}</p>
                  </div>

                  <div className="rounded-[6px] border border-white/10 bg-white/[0.02] p-4 mb-6">
                    <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#3DDC84] mb-2">
                      {tx("loginGoodToKnow")}
                    </div>
                    <ul className="text-[12.5px] text-slate-400 leading-relaxed space-y-1.5">
                      <li>— {tx("loginTip1")}</li>
                      <li>— {tx("loginTip2")}</li>
                      <li>— {tx("loginTip3")}</li>
                    </ul>
                  </div>

                  <div className="space-y-4 mb-5">
                    <div>
                      <label htmlFor="mx-login-email" className={label}>{tx("email")}</label>
                      <div className={inputWrap(!!step1Error)}>
                        <Mail className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-400" : "text-slate-500"}`} />
                        <input
                          id="mx-login-email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (step1Error) setStep1Error(null);
                          }}
                          placeholder={tx("emailPh")}
                          className="w-full bg-transparent pl-12 pr-4 py-3.5 text-[15px] text-white placeholder:text-slate-600 font-medium outline-none"
                          autoComplete="email"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="mx-login-pwd" className={label}>{tx("password")}</label>
                      <div className={inputWrap(!!step1Error)}>
                        <Lock className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-400" : "text-slate-500"}`} />
                        <input
                          id="mx-login-pwd"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (step1Error) setStep1Error(null);
                          }}
                          placeholder="••••••••"
                          className="w-full bg-transparent pl-12 pr-12 py-3.5 text-[15px] text-white placeholder:text-slate-600 font-medium outline-none"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-white transition-colors rounded-md"
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
                    className="flex items-center gap-3 w-fit mb-5 group"
                    aria-pressed={remember}
                  >
                    <span
                      className={`w-4 h-4 rounded-[3px] flex items-center justify-center border transition-all ${
                        remember ? "bg-[#00893D] border-[#3DDC84]" : "bg-transparent border-white/25 group-hover:border-white/50"
                      }`}
                    >
                      {remember && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className="text-[13px] text-slate-300 font-medium select-none">{tx("remember")}</span>
                  </button>

                  {errBox(step1Error)}

                  <button type="submit" disabled={step1Loading} className={primaryBtn}>
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

                  <p className="mt-7 text-center text-[12.5px] text-slate-500 leading-relaxed">
                    {tx("loginNoAccess")}{" "}
                    <a
                      href={`mailto:${SUPPORT.email}?subject=Schaeffler%20Motion%20Portal%20-%20Access`}
                      className="text-[#3DDC84] font-semibold hover:underline"
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
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#00893D]/15 border border-[#00893D]/40 text-[#3DDC84] font-mono text-[10.5px] font-bold tracking-[0.18em] uppercase mb-4">
                      <KeyRound className="w-3.5 h-3.5" />
                      {tx("step2Tag")}
                    </div>
                    <h2 className="text-[26px] font-semibold text-white tracking-tight mb-2">{tx("step2Title")}</h2>
                    <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("step2Text")}</p>
                  </div>

                  <div className="rounded-[6px] border border-white/10 bg-white/[0.02] p-4 mb-6 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-[5px] bg-[#00893D]/15 border border-[#00893D]/40 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#3DDC84]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">{tx("signingInAs")}</div>
                      <div className="text-[14.5px] font-semibold text-white truncate">{twoFaEmail || email}</div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#00893D]/15 border border-[#00893D]/40 text-[#3DDC84] font-mono text-[11px] font-bold tracking-wide">
                      <KeyRound className="w-3.5 h-3.5" /> 2FA
                    </span>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="mx-2fa" className={label}>{twoFaUseBackup ? tx("backupCode") : tx("authCode")}</label>
                    <input
                      id="mx-2fa"
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
                      className="w-full h-[54px] px-4 bg-[#0E1511] border border-white/12 rounded-[6px] text-[20px] text-center tracking-[0.45em] text-white placeholder:text-slate-700 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#00893D]/20 focus:border-[#3DDC84]/70 transition-all"
                    />
                  </div>

                  <label htmlFor="mx-2fa-backup" className="mb-5 flex items-center gap-2.5 cursor-pointer">
                    <input
                      id="mx-2fa-backup"
                      type="checkbox"
                      checked={twoFaUseBackup}
                      onChange={(e) => {
                        setTwoFaUseBackup(e.target.checked);
                        setTwoFaCode("");
                        if (step2Error) setStep2Error(null);
                      }}
                      className="w-4 h-4 rounded-[3px] accent-[#00893D]"
                    />
                    <span className="text-[13px] font-medium text-slate-400">{tx("useBackup")}</span>
                  </label>

                  {errBox(step2Error)}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={goBackToLogin}
                      disabled={step2Loading}
                      className="sm:flex-1 h-[52px] rounded-[6px] border border-white/15 text-slate-200 hover:bg-white/[0.06] text-[13px] font-bold tracking-[0.12em] uppercase transition-all disabled:opacity-60 inline-flex items-center justify-center"
                    >
                      ← {tx("back")}
                    </button>
                    <button type="submit" disabled={step2Loading} className={`sm:flex-[2] ${primaryBtn}`}>
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
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="relative flex items-center justify-center w-full max-w-xs mb-10">
                    <div className="flex flex-col items-center">
                      <PannonChip className="h-12 px-3" imgClass="h-[20px] w-auto" />
                    </div>
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      style={{ transformOrigin: "left center" }}
                      className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-white/15 via-[#00893D] to-[#3DDC84] relative"
                    >
                      <motion.span
                        initial={{ left: "0%", opacity: 0 }}
                        animate={{ left: "100%", opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.8, ease: "easeInOut" }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#3DDC84] shadow-[0_0_14px_4px_rgba(61,220,132,0.45)]"
                      />
                    </motion.div>
                    <div className="flex flex-col items-center">
                      <SchaefflerChip className="h-12 px-3" imgClass="h-[16px] w-auto" />
                    </div>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.4 }}
                    className="flex flex-col items-center"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-[#3DDC84]" />
                      <h2 className="text-[19px] font-semibold text-white tracking-tight">{tx("authSuccess")}</h2>
                    </div>
                    <div className="flex items-center gap-2.5 px-4 py-2 border border-white/10 rounded-[5px] bg-white/[0.03]">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3DDC84]" />
                      <p className="font-mono text-[12px] text-slate-400">{tx("secureConn")}</p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="relative z-10 max-w-[1240px] w-full mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/[0.06] text-[11.5px] text-slate-500">
        <span>© {new Date().getFullYear()} Pannon Transfer. {tx("rights")}</span>
        <span className="font-mono tracking-wide">{tx("loginSecureFooter")}</span>
      </footer>
    </div>
  );
}
