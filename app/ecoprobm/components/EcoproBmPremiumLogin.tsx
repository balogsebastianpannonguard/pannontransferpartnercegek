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
  Layers,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useEcoproBmLang } from "../lang";
import { portalText, translateAuthServerMessage } from "../portal-i18n";
import EcoproBmAuthShell from "./EcoproBmAuthShell";

interface EcoproBmUser {
  email: string;
  company?: string;
  role?: string;
}

interface Props {
  _onSuccess: (user: EcoproBmUser) => void;
}

type State = "login" | "twofactor" | "done";

const fieldShell = (invalid: boolean) =>
  `relative flex items-center rounded-xl border bg-[#0B1D38] transition-all duration-200 ${
    invalid
      ? "border-red-400/60 ring-4 ring-red-500/10"
      : "border-white/10 hover:border-white/20 focus-within:border-[#3B93E0] focus-within:ring-4 focus-within:ring-[#1E73BE]/20"
  }`;

const primaryBtn =
  "w-full h-[54px] rounded-xl bg-gradient-to-r from-[#1E73BE] to-[#2B84D2] hover:from-[#2B84D2] hover:to-[#3B93E0] text-white text-[14px] font-semibold shadow-[0_12px_30px_rgba(30,115,190,0.4)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

export default function EcoproBmPremiumLogin({ _onSuccess }: Props) {
  const [lang, setLang] = useEcoproBmLang();
  const tx = (key: string, params?: Record<string, string | number>) => portalText(lang, key, params);

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
      setStep1Error(tx("errEnterBoth"));
      return;
    }
    setStep1Error(null);
    setStep1Loading(true);
    try {
      const res = await fetch("/api/ecoprobm-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep1Error(translateAuthServerMessage(lang, json?.message, "errLoginFailed"));
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
      setStep1Error(tx("errLoginUnexpected"));
    } catch {
      setStep1Error(tx("errNetwork"));
    } finally {
      setStep1Loading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = twoFaUseBackup ? twoFaCode.trim().toUpperCase() : twoFaCode.replace(/\s+/g, "");
    if (!clean || (twoFaUseBackup ? clean.length < 6 : clean.length !== 6)) {
      setStep2Error(tx(twoFaUseBackup ? "errBackup" : "errCode6"));
      return;
    }
    setStep2Error(null);
    setStep2Loading(true);
    try {
      const res = await fetch("/api/ecoprobm-auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code: clean, useBackup: twoFaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep2Error(translateAuthServerMessage(lang, json?.message, "errWrongCode"));
        return;
      }
      if (json?.user) {
        setState("done");
        setTimeout(() => _onSuccess(json.user), 2200);
        return;
      }
      setStep2Error(tx("errLoginUnexpected"));
    } catch {
      setStep2Error(tx("errNetwork"));
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
          role="alert"
        >
          <div className="flex items-start gap-3 px-4 py-3.5 bg-red-500/[0.08] border border-red-400/25 rounded-xl">
            <AlertTriangle className="w-[18px] h-[18px] text-red-400 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-200 font-medium leading-relaxed">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <EcoproBmAuthShell
      lang={lang}
      onLangChange={setLang}
      brand={{
        eyebrow: tx("loginEyebrow"),
        title: tx("loginBrandTitle"),
        body: tx("loginBrandBody"),
        bullets: [
          { icon: <UserCheck className="w-5 h-5" />, title: tx("bulletAccessTitle"), text: tx("bulletAccessText") },
          { icon: <ShieldCheck className="w-5 h-5" />, title: tx("bulletSecurityTitle"), text: tx("bulletSecurityText") },
          { icon: <Layers className="w-5 h-5" />, title: tx("bulletAllTitle"), text: tx("bulletAllText") },
        ],
      }}
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
            noValidate
          >
            <div className="mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E73BE]/30 to-[#0B3C7A]/30 border border-white/10 flex items-center justify-center mb-5">
                <Lock className="w-7 h-7 text-[#8CC4F5]" />
              </div>
              <h2 className="text-[28px] font-semibold text-white tracking-tight mb-2">{tx("loginTitle")}</h2>
              <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("loginIntro")}</p>
            </div>

            <div className="space-y-4 mb-5">
              <div className="space-y-2">
                <label htmlFor="bm-email" className="text-[12px] font-semibold text-slate-300 ml-1">
                  {tx("fEmailAddr")}
                </label>
                <div className={fieldShell(!!step1Error)}>
                  <Mail className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-400" : "text-slate-500"}`} />
                  <input
                    id="bm-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (step1Error) setStep1Error(null);
                    }}
                    placeholder={tx("fEmailAddrPh")}
                    className="w-full bg-transparent pl-12 pr-4 py-3.5 text-[15px] text-white placeholder:text-slate-500 font-medium outline-none"
                    autoComplete="email"
                    spellCheck={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="bm-password" className="text-[12px] font-semibold text-slate-300 ml-1">
                  {tx("fPassword")}
                </label>
                <div className={fieldShell(!!step1Error)}>
                  <Lock className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-red-400" : "text-slate-500"}`} />
                  <input
                    id="bm-password"
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
                    className="absolute right-2 w-9 h-9 flex items-center justify-center text-slate-500 hover:text-white transition-colors rounded-lg"
                    aria-label={tx(showPassword ? "hidePassword" : "showPassword")}
                    tabIndex={-1}
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
                  remember ? "bg-[#1E73BE] border-[#3B93E0]" : "bg-transparent border-white/25 group-hover:border-white/40"
                }`}
              >
                {remember && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <span className="text-[13px] text-slate-300 font-medium select-none">{tx("remember")}</span>
            </button>

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
                  <ArrowRight className="w-[18px] h-[18px]" />
                </>
              )}
            </button>

            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-[#F5A04A] mb-2">{tx("goodToKnow")}</div>
              <ul className="text-[12.5px] text-slate-400 leading-relaxed space-y-1.5">
                <li>• {tx("tip1")}</li>
                <li>• {tx("tip2")}</li>
                <li>• {tx("tip3")}</li>
              </ul>
            </div>

            <p className="mt-6 text-center text-[12px] text-slate-500 leading-relaxed">
              {tx("noAccess")}{" "}
              <a
                href="mailto:balogh.sebastian@pannonguard.hu?subject=Ecopro%20BM%20Portal%20-%20Access"
                className="text-[#8CC4F5] font-semibold hover:underline"
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
            noValidate
          >
            <div className="mb-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F28C28]/15 border border-[#F28C28]/35 text-[#FFB366] text-[11px] font-bold tracking-[0.14em] uppercase mb-4">
                <KeyRound className="w-3.5 h-3.5" />
                {tx("step2Badge")}
              </div>
              <h2 className="text-[27px] font-semibold text-white tracking-tight mb-2">{tx("confirmTitle")}</h2>
              <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("tfaIntro")}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 mb-6 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#1E73BE]/20 border border-[#3B93E0]/25 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#8CC4F5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-0.5">{tx("signingInAs")}</div>
                <div className="text-[15px] font-semibold text-white truncate">{twoFaEmail || email}</div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E73BE]/20 border border-[#3B93E0]/25 text-[#8CC4F5] text-[11px] font-bold tracking-wide">
                <KeyRound className="w-3.5 h-3.5" /> 2FA
              </span>
            </div>

            <div className="mb-4">
              <label htmlFor="bm-2fa" className="block text-[13px] font-semibold text-slate-300 mb-2 pl-0.5">
                {tx(twoFaUseBackup ? "backupCode" : "authCode")}
              </label>
              <input
                id="bm-2fa"
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
                className="w-full h-[56px] px-4 bg-[#0B1D38] border border-white/10 rounded-xl text-[20px] text-center tracking-[0.45em] text-white placeholder:text-slate-600 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#1E73BE]/20 focus:border-[#3B93E0] transition-all"
              />
            </div>

            <div className="mb-5 flex items-center gap-2.5 pl-0.5">
              <input
                id="bm-2fa-backup"
                type="checkbox"
                checked={twoFaUseBackup}
                onChange={(e) => {
                  setTwoFaUseBackup(e.target.checked);
                  setTwoFaCode("");
                  if (step2Error) setStep2Error(null);
                }}
                className="w-4 h-4 rounded border-white/30 bg-transparent accent-[#1E73BE]"
              />
              <label htmlFor="bm-2fa-backup" className="text-[13px] font-medium text-slate-400">
                {tx("useBackup")}
              </label>
            </div>

            {errorBox(step2Error)}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={goBackToLogin}
                disabled={step2Loading}
                className="sm:flex-1 h-[54px] rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-[14px] font-semibold border border-white/10 transition-all duration-200 disabled:opacity-60 inline-flex items-center justify-center"
              >
                ← {tx("back")}
              </button>
              <button type="submit" disabled={step2Loading} className={`${primaryBtn} sm:flex-[2]`}>
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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center py-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.25)]"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">{tx("authSuccess")}</h2>
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#F5A04A] mb-5">{tx("portalNameShort")}</p>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/[0.06] border border-white/10 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8CC4F5]" />
              <p className="text-[13px] text-slate-300 font-medium">{tx("securing")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </EcoproBmAuthShell>
  );
}
