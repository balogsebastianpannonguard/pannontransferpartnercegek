"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Plane,
  ShieldCheck,
} from "lucide-react";
import {
  EcoBackdrop,
  EcoLogo,
  LangSwitch,
  PannonLogo,
  SUPPORT,
  ecoFont,
  ecoPrimaryBtn,
} from "./EcoUi";
import { makeT, splitBold, translateServerMessage, useEcoLang } from "../i18n";

interface Props {
  _onSuccess: (user: { email: string; company?: string; role?: string }) => void;
}

type State = "login" | "twofactor" | "done";

const fieldShell = (hasError: boolean) =>
  `relative flex items-center bg-white border transition-all duration-200 rounded-2xl overflow-hidden ${
    hasError
      ? "border-rose-300 ring-4 ring-rose-100"
      : "border-[#DCEBF7] hover:border-[#0E86D4]/40 focus-within:border-[#0E86D4] focus-within:ring-4 focus-within:ring-[#0E86D4]/12"
  }`;

function Bold({ text }: { text: string }) {
  return (
    <>
      {splitBold(text).map((p, i) =>
        p.bold ? (
          <strong key={i} className="font-semibold text-[#0B2540]">
            {p.text}
          </strong>
        ) : (
          <React.Fragment key={i}>{p.text}</React.Fragment>
        ),
      )}
    </>
  );
}

function ErrorBox({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-5"
        >
          <div role="alert" className="flex items-start gap-3 px-4 py-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
            <AlertTriangle className="w-[18px] h-[18px] text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-rose-700 font-medium leading-relaxed">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function EcoproInnovationPremiumLogin({ _onSuccess }: Props) {
  const [lang, setLang] = useEcoLang();
  const t = useMemo(() => makeT(lang), [lang]);

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
      setStep1Error(t("errNeedCreds"));
      return;
    }
    setStep1Error(null);
    setStep1Loading(true);
    try {
      const res = await fetch("/api/ecoproinnovation-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
        cache: "no-store",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep1Error(json?.message ? translateServerMessage(json.message, lang) : t("errLoginFailed"));
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
      setStep1Error(t("errLoginUnexpected"));
    } catch {
      setStep1Error(t("errNetwork"));
    } finally {
      setStep1Loading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = twoFaUseBackup ? twoFaCode.trim().toUpperCase() : twoFaCode.replace(/\s+/g, "");
    if (!clean || (twoFaUseBackup ? clean.length < 6 : clean.length !== 6)) {
      setStep2Error(twoFaUseBackup ? t("errNeedBackup") : t("errNeedCode6"));
      return;
    }
    setStep2Error(null);
    setStep2Loading(true);
    try {
      const res = await fetch("/api/ecoproinnovation-auth/login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code: clean, useBackup: twoFaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setStep2Error(json?.message ? translateServerMessage(json.message, lang) : t("errBadCode"));
        return;
      }
      if (json?.user) {
        setState("done");
        setTimeout(() => _onSuccess(json.user), 2500);
        return;
      }
      setStep2Error(t("errUnexpectedShort"));
    } catch {
      setStep2Error(t("errNetwork"));
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

  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen text-[#0B2540] flex flex-col" style={ecoFont(lang)}>
      <EcoBackdrop variant="soft" />

      <div className="relative z-10 flex-1 grid lg:grid-cols-[1.02fr_1fr]">
        {/* Brand panel */}
        <aside className="hidden lg:flex relative overflow-hidden flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-[#0B3F8F] via-[#0E86D4] to-[#00B4D8] text-white">
          <div className="absolute -top-28 -right-24 w-[420px] h-[420px] rounded-full bg-white/10" />
          <div className="absolute bottom-[-140px] left-[-80px] w-[460px] h-[460px] rounded-full bg-[#00E0F5]/20 blur-2xl" />
          <svg className="absolute right-0 bottom-10 w-[70%] opacity-60" viewBox="0 0 520 220" fill="none" aria-hidden>
            <motion.path
              d="M10 190 C 140 20, 340 10, 500 70"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
              strokeDasharray="4 8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.4, ease: "easeInOut", delay: 0.2 }}
            />
            <circle cx="10" cy="190" r="6" fill="white" />
            <circle cx="500" cy="70" r="6" fill="white" />
          </svg>

          <div className="relative flex items-center gap-3">
            <span className="inline-flex items-center rounded-xl bg-white px-3.5 py-2 shadow-lg">
              <PannonLogo className="h-6" />
            </span>
            <span className="inline-flex items-center rounded-xl bg-white px-3.5 py-2.5 shadow-lg">
              <EcoLogo className="h-5" />
            </span>
          </div>

          <div className="relative max-w-md">
            <h2 className="text-[38px] xl:text-[44px] font-bold leading-[1.1] tracking-tight">{t("loginPanelTitle")}</h2>
            <p className="mt-5 text-[16px] text-white/85 leading-relaxed">{t("loginPanelBody")}</p>
            <ul className="mt-9 space-y-3.5">
              {[
                { icon: <Plane className="w-4 h-4" />, text: t("loginFeat1") },
                { icon: <Bell className="w-4 h-4" />, text: t("loginFeat2") },
                { icon: <ShieldCheck className="w-4 h-4" />, text: t("loginFeat3") },
              ].map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-[14.5px] font-medium">
                  <span className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center">
                    {f.icon}
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-[12px] text-white/70">
            © {year} Pannon Transfer. {t("rights")}
          </p>
        </aside>

        {/* Form side */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 sm:px-8 h-16">
            <div className="flex items-center gap-3 lg:invisible">
              <PannonLogo className="h-5" />
              <span className="w-px h-5 bg-[#DCEBF7]" />
              <EcoLogo className="h-4" />
            </div>
            <LangSwitch lang={lang} onChange={setLang} compact />
          </div>

          <div className="flex-1 flex items-center justify-center px-5 pb-10">
            <div className="w-full max-w-[440px]">
              <AnimatePresence mode="wait">
                {state === "login" && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleStep1Submit}
                    className="flex flex-col"
                  >
                    <div className="mb-7">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] flex items-center justify-center mb-5 shadow-[0_12px_28px_rgba(14,134,212,0.35)]">
                        <Lock className="w-7 h-7 text-white" />
                      </div>
                      <h1 className="text-[28px] font-bold text-[#0B2540] tracking-tight mb-2">{t("loginTitle")}</h1>
                      <p className="text-[15px] text-slate-500 leading-relaxed">{t("loginLead")}</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur border border-[#DCEBF7] rounded-2xl p-4 mb-6">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E86D4] mb-1.5">{t("loginKnow")}</div>
                      <ul className="text-[13px] text-slate-600 leading-relaxed space-y-1.5">
                        <li>• {t("loginKnow1")}</li>
                        <li>• {t("loginKnow2")}</li>
                        <li>• {t("loginKnow3")}</li>
                      </ul>
                    </div>

                    <div className="space-y-4 mb-5">
                      <div className="space-y-2">
                        <label htmlFor="eco-login-email" className="text-[12px] font-semibold text-[#0B3F8F] ml-1">
                          {t("emailAddress")}
                        </label>
                        <div className={fieldShell(!!step1Error)}>
                          <Mail className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-rose-500" : "text-slate-400"}`} />
                          <input
                            id="eco-login-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (step1Error) setStep1Error(null);
                            }}
                            placeholder={t("emailPh")}
                            className="w-full bg-transparent pl-12 pr-4 py-3.5 text-[15px] text-[#0B2540] placeholder:text-slate-400 font-medium outline-none"
                            autoComplete="email"
                            spellCheck={false}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="eco-login-pass" className="text-[12px] font-semibold text-[#0B3F8F] ml-1">
                          {t("password")}
                        </label>
                        <div className={fieldShell(!!step1Error)}>
                          <Lock className={`absolute left-4 w-[18px] h-[18px] ${step1Error ? "text-rose-500" : "text-slate-400"}`} />
                          <input
                            id="eco-login-pass"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (step1Error) setStep1Error(null);
                            }}
                            placeholder="••••••••"
                            className="w-full bg-transparent pl-12 pr-12 py-3.5 text-[15px] text-[#0B2540] placeholder:text-slate-400 font-medium outline-none"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#0B3F8F] transition-colors rounded-xl"
                            tabIndex={-1}
                            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
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
                        className={`w-[18px] h-[18px] rounded-md flex items-center justify-center border transition-all ${
                          remember
                            ? "bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] border-transparent"
                            : "bg-white border-slate-300 group-hover:border-slate-400"
                        }`}
                      >
                        {remember && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span className="text-[13px] text-slate-600 font-medium select-none">{t("remember")}</span>
                    </button>

                    <ErrorBox message={step1Error} />

                    <button type="submit" disabled={step1Loading} className={`${ecoPrimaryBtn} w-full h-[54px] text-[14px]`}>
                      {step1Loading ? (
                        <>
                          <Loader2 className="w-[18px] h-[18px] animate-spin" />
                          {t("verifying")}
                        </>
                      ) : (
                        <>
                          {t("loginBtn")}
                          <ArrowRight className="w-[18px] h-[18px]" />
                        </>
                      )}
                    </button>

                    <p className="mt-7 text-center text-[12px] text-slate-500 leading-relaxed">
                      {t("noAccess")}{" "}
                      <a
                        href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(t("mailSubjectAccess"))}`}
                        className="text-[#0E86D4] font-semibold hover:underline"
                      >
                        {t("support")}
                      </a>
                    </p>
                  </motion.form>
                )}

                {state === "twofactor" && (
                  <motion.form
                    key="2fa"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleStep2Submit}
                    className="flex flex-col"
                  >
                    <div className="mb-7">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E86D4]/10 border border-[#0E86D4]/20 text-[#0B3F8F] text-[11px] font-bold tracking-widest uppercase mb-4">
                        <KeyRound className="w-3.5 h-3.5" />
                        {t("tfaStep")}
                      </div>
                      <h1 className="text-[26px] font-bold text-[#0B2540] tracking-tight mb-2">{t("tfaTitle")}</h1>
                      <p className="text-[15px] text-slate-500 leading-relaxed">
                        <Bold text={t("tfaLead")} />
                      </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur border border-[#DCEBF7] rounded-2xl p-4 mb-6">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#0E86D4]/10 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-[#0E86D4]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-0.5">{t("signingInAs")}</div>
                          <div className="text-[15px] font-semibold text-[#0B2540] truncate">{twoFaEmail || email}</div>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0E86D4]/10 text-[#0B3F8F] text-[11px] font-bold tracking-wide">
                          <KeyRound className="w-3.5 h-3.5" /> 2FA
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="eco-2fa" className="block text-[13px] font-semibold text-[#0B3F8F] mb-2 pl-0.5">
                        {twoFaUseBackup ? t("tfaBackupLabel") : t("tfaCodeLabel")}
                      </label>
                      <input
                        id="eco-2fa"
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
                        placeholder={twoFaUseBackup ? t("tfaBackupPh") : "000000"}
                        className="w-full h-[56px] px-4 bg-white border border-[#DCEBF7] rounded-2xl text-[20px] text-center tracking-[0.45em] text-[#0B2540] placeholder:text-slate-300 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#0E86D4]/12 focus:border-[#0E86D4] transition-all"
                      />
                    </div>

                    <div className="mb-5 flex items-center gap-2.5 pl-0.5">
                      <input
                        id="eco-2fa-backup"
                        type="checkbox"
                        checked={twoFaUseBackup}
                        onChange={(e) => {
                          setTwoFaUseBackup(e.target.checked);
                          setTwoFaCode("");
                          if (step2Error) setStep2Error(null);
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-[#0E86D4] focus:ring-[#0E86D4]/30"
                      />
                      <label htmlFor="eco-2fa-backup" className="text-[13px] font-medium text-slate-600">
                        {t("tfaUseBackup")}
                      </label>
                    </div>

                    <ErrorBox message={step2Error} />

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={goBackToLogin}
                        disabled={step2Loading}
                        className="sm:flex-1 h-[54px] rounded-xl bg-white hover:bg-[#F7FBFE] text-[#0B2540] text-[14px] font-semibold border border-[#DCEBF7] transition-all disabled:opacity-60 inline-flex items-center justify-center"
                      >
                        ← {t("back")}
                      </button>
                      <button type="submit" disabled={step2Loading} className={`${ecoPrimaryBtn} sm:flex-[2] h-[54px] text-[14px]`}>
                        {step2Loading ? (
                          <>
                            <Loader2 className="w-[18px] h-[18px] animate-spin" />
                            {t("processing")}
                          </>
                        ) : (
                          <>
                            {t("verifyAndSignIn")}
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
                    transition={{ duration: 0.45 }}
                    className="flex flex-col items-center justify-center py-8 w-full"
                  >
                    <div className="relative flex items-center justify-center w-full max-w-sm mb-12 px-4">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="flex flex-col items-center"
                      >
                        <div className="h-16 w-24 rounded-2xl bg-white border border-[#DCEBF7] shadow-lg flex items-center justify-center mb-3">
                          <PannonLogo className="h-5" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Pannon Transfer</span>
                      </motion.div>

                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        style={{ transformOrigin: "left center" }}
                        className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-[#DCEBF7] via-[#00B4D8]/60 to-[#0E86D4] relative mt-[-22px]"
                      >
                        <motion.div
                          initial={{ left: "0%", opacity: 0, scale: 0 }}
                          animate={{ left: "100%", opacity: 1, scale: 1 }}
                          transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0E86D4] shadow-[0_0_12px_4px_rgba(14,134,212,0.4)]"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex flex-col items-center"
                      >
                        <div className="h-16 w-24 rounded-2xl bg-white border border-[#0E86D4]/25 shadow-[0_10px_30px_rgba(14,134,212,0.25)] flex items-center justify-center mb-3">
                          <EcoLogo className="h-5" />
                        </div>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[#0E86D4] uppercase">Ecopro Innovation</span>
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
                        <h1 className="text-[20px] font-bold text-[#0B2540] tracking-tight">{t("authSuccess")}</h1>
                      </div>
                      <div className="flex items-center gap-2.5 px-4 py-2 bg-[#0E86D4]/10 rounded-full">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E86D4]" />
                        <p className="text-[13px] text-[#0B3F8F] font-medium">{t("secureConnection")}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="px-5 sm:px-8 h-14 flex items-center justify-between text-[11px] text-slate-400 font-medium border-t border-[#DCEBF7]/70 lg:border-0">
            <span className="lg:invisible">
              © {year} Pannon Transfer. {t("rights")}
            </span>
            <a
              href={`mailto:${SUPPORT.email}`}
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#0E86D4] transition-colors font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              {t("support")}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
