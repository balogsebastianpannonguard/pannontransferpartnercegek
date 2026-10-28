"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
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
} from "../components/EcoUi";
import { makeT, splitBold, translateServerMessage, useEcoLang } from "../i18n";

function extractTokenFromUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("token");
    if (q && q.trim()) return q.trim();
    const hash = url.hash.replace(/^#/, "");
    if (!hash) return "";
    if (hash.startsWith("token=")) return decodeURIComponent(hash.slice("token=".length)).trim();
    if (hash.startsWith("?token=")) return decodeURIComponent(hash.slice("?token=".length)).trim();
    return decodeURIComponent(hash).trim();
  } catch {
    return "";
  }
}

type PageState = "loading" | "invalid" | "form" | "tfa-setup" | "done";

function Rich({ text }: { text: string }) {
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

export default function EcoproInnovationSetupPasswordPage() {
  const [lang, setLang] = useEcoLang();
  const t = useMemo(() => makeT(lang), [lang]);

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<PageState>("loading");
  const [email, setEmail] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [alreadyActivated, setAlreadyActivated] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [errorRaw, setErrorRaw] = useState<string | null>(null);

  const [tfaQr, setTfaQr] = useState<string | null>(null);
  const [tfaSecret, setTfaSecret] = useState<string | null>(null);
  const [tfaBackupCodes, setTfaBackupCodes] = useState<string[] | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaUseBackup, setTfaUseBackup] = useState(false);
  const [tfaCopied, setTfaCopied] = useState<string | null>(null);
  const [tfaBackupDownloaded, setTfaBackupDownloaded] = useState(false);

  const setErr = (key: Parameters<typeof t>[0] | null) => {
    setErrorRaw(null);
    setErrorKey(key);
  };
  const setServerErr = (message: string | undefined | null, fallbackKey: Parameters<typeof t>[0]) => {
    if (message) {
      setErrorKey(null);
      setErrorRaw(message);
    } else {
      setErrorRaw(null);
      setErrorKey(fallbackKey);
    }
  };
  const error = errorKey ? t(errorKey as Parameters<typeof t>[0]) : errorRaw ? translateServerMessage(errorRaw, lang) : null;

  useEffect(() => {
    const tk = extractTokenFromUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the invite token only exists in the browser URL
    setRawToken(tk);
    if (!tk) setState("invalid");
  }, []);

  useEffect(() => {
    if (!rawToken) return;
    let cancelled = false;
    (async () => {
      setState("loading");
      try {
        const res = await fetch("/api/ecoproinnovation-auth/validate-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: rawToken }),
        });
        if (cancelled) return;
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setState("invalid");
        } else {
          setEmail(json.email || "");
          setRequire2FA(!!json.requireTwoFactor);
          setAlreadyActivated(!!json.alreadyActivated);
          if (json.alreadyActivated) setErr("errAlreadyActivated");
          setState("form");
        }
      } catch {
        if (!cancelled) setState("invalid");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawToken]);

  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const mailLink = (subjectKey: "mailSubjectNewLink" | "mailSubjectNoWelcome", bodyKey: "mailBodyNewLink" | "mailBodyNoWelcome") =>
    `mailto:${SUPPORT.email}?subject=${encodeURIComponent(t(subjectKey))}&body=${encodeURIComponent(t(bodyKey) + (email || ""))}`;

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (alreadyActivated) {
      window.location.href = mailLink("mailSubjectNewLink", "mailBodyNewLink");
      return;
    }
    if (password.length < 8) return setErr("errPwdShort");
    if (password !== confirm) return setErr("errPwdMismatch");
    if (getStrength(password) < 3) return setErr("errPwdWeak");
    setSubmitting(true);
    try {
      const res = await fetch("/api/ecoproinnovation-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setServerErr(json?.message, "errSetPwd");
      } else if (json.requireTwoFactorSetup && json.twoFactorSetup) {
        setTfaQr(json.twoFactorSetup.qrDataUrl || null);
        setTfaSecret(json.twoFactorSetup.secretBase32 || null);
        setTfaBackupCodes(json.twoFactorSetup.backupCodes || null);
        setTfaCode("");
        setTfaUseBackup(false);
        setState("tfa-setup");
      } else {
        setState("done");
      }
    } catch {
      setErr("errNetwork");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && (clean.length !== 6 || !/^\d{6}$/.test(clean))) return setErr("errCodeDigits");
    if (tfaUseBackup && clean.length < 6) return setErr("errBackupFormat");
    setSubmitting(true);
    try {
      const res = await fetch("/api/ecoproinnovation-auth/verify-2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken: rawToken, code: tfaCode, useBackup: tfaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setServerErr(json?.message, "errIncorrectCode");
      } else {
        setState("done");
      }
    } catch {
      setErr("errNetwork");
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setTfaCopied(label);
      setTimeout(() => setTfaCopied(null), 1600);
    } catch {}
  };

  const downloadBackupCodes = () => {
    if (!tfaBackupCodes) return;
    const content =
      `${t("backupFileTitle")}\n\n` +
      `${t("backupFileAccount")}: ${email || "N/A"}\n` +
      `${t("backupFileDate")}: ${new Date().toLocaleString(lang === "ko" ? "ko-KR" : "hu-HU")}\n\n` +
      `${t("backupFileUse")}\n` +
      `${t("backupFileOnce")}\n\n` +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      `${t("backupFileKeep")}\n` +
      `${t("backupFileFooter")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ecopro_Innovation_Backup_Codes_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText = t(`strength${Math.min(strength, 5)}` as Parameters<typeof t>[0]);
  const strengthColor =
    ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500", "bg-emerald-600"][strength] ||
    "bg-rose-500";

  const rules = [
    { ok: password.length >= 8, label: t("rule8") },
    { ok: /[a-z]/.test(password), label: t("ruleLower") },
    { ok: /[A-Z]/.test(password), label: t("ruleUpper") },
    { ok: /[0-9]/.test(password), label: t("ruleDigit") },
  ];

  const inputCls =
    "w-full h-[52px] px-4 bg-white border border-[#DCEBF7] rounded-2xl text-[15px] text-[#0B2540] placeholder:text-slate-400 font-medium focus:outline-none focus:ring-4 focus:ring-[#0E86D4]/12 focus:border-[#0E86D4] hover:border-[#0E86D4]/40 transition-all";
  const card =
    "rounded-3xl border border-white bg-white/85 backdrop-blur-xl shadow-[0_24px_60px_rgba(14,134,212,0.12),0_2px_6px_rgba(11,63,143,0.05)] ring-1 ring-[#DCEBF7]/70";
  const subCard = "rounded-2xl border border-[#DCEBF7] bg-[#F6FAFE]";
  const supportMail = `mailto:${SUPPORT.email}`;

  const errorBlock = (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-5"
        >
          <div role="alert" className="flex items-start gap-3 px-4 py-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
            <AlertTriangle className="w-[18px] h-[18px] text-rose-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-rose-700 font-medium leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const stepPill = (icon: React.ReactNode, text: string) => (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E86D4]/10 border border-[#0E86D4]/20 text-[#0B3F8F] text-[11px] font-bold tracking-[0.14em] uppercase mb-4">
      {icon}
      {text}
    </div>
  );

  const steps = require2FA
    ? [
        { id: "form", label: t("stepPassword") },
        { id: "tfa-setup", label: t("stepTfa") },
        { id: "done", label: t("stepDone") },
      ]
    : [
        { id: "form", label: t("stepPassword") },
        { id: "done", label: t("stepDone") },
      ];
  const stepIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === state),
  );

  const stepper = (state === "form" || state === "tfa-setup" || state === "done") && (
    <ol className="flex items-center mb-8" aria-label="progress">
      {steps.map((s, i) => {
        const done = i < stepIndex || state === "done";
        const current = i === stepIndex && state !== "done";
        return (
          <React.Fragment key={s.id}>
            <li className="flex items-center gap-2.5 shrink-0">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                  done
                    ? "bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] text-white shadow-[0_4px_12px_rgba(14,134,212,0.35)]"
                    : current
                      ? "bg-white text-[#0E86D4] ring-2 ring-[#0E86D4]"
                      : "bg-[#EAF4FB] text-slate-400"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-[12px] font-semibold ${done || current ? "text-[#0B3F8F]" : "text-slate-400"}`}>
                {s.label}
              </span>
            </li>
            {i < steps.length - 1 && (
              <span className={`flex-1 h-px mx-3 ${i < stepIndex ? "bg-[#0E86D4]/50" : "bg-[#DCEBF7]"}`} />
            )}
          </React.Fragment>
        );
      })}
    </ol>
  );

  return (
    <div className="relative min-h-screen text-[#0B2540] flex flex-col overflow-hidden" style={ecoFont(lang)}>
      <EcoBackdrop />

      <header className="relative z-10 w-full border-b border-[#DCEBF7] bg-white/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <PannonLogo className="h-6" />
            <span className="hidden sm:block h-6 w-px bg-[#DCEBF7]" />
            <EcoLogo className="hidden sm:block h-5" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-[#DCEBF7] bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#0E86D4]" />
              {t("securePill")}
            </div>
            <LangSwitch lang={lang} onChange={setLang} compact />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.05fr_520px]">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0E86D4]/20 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0B3F8F] shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#0E86D4]" />
            {t("setupHeroPill")}
          </div>
          <h1 className="max-w-xl text-[44px] font-bold leading-[1.06] tracking-[-0.03em] text-[#0B2540]">
            {t("setupHeroTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-8 text-slate-600">{t("setupHeroBody")}</p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 max-w-2xl">
            {[
              { icon: <Lock className="h-5 w-5" />, label: t("tileAccess"), value: t("tileAccessValue") },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                label: t("tileSecurity"),
                value: require2FA ? t("tileSecurity2fa") : t("tileSecurityPwd"),
              },
              { icon: <Clock3 className="h-5 w-5" />, label: t("tileSignIn"), value: t("tileSignInValue") },
              { icon: <Building2 className="h-5 w-5" />, label: t("tilePortal"), value: t("tilePortalValue") },
            ].map((tile) => (
              <div key={tile.label} className={`${card} p-5`}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] text-white shadow-[0_8px_18px_rgba(14,134,212,0.3)]">
                  {tile.icon}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{tile.label}</div>
                <div className="mt-1 text-[15px] font-semibold leading-snug text-[#0B2540]">{tile.value}</div>
              </div>
            ))}
          </div>

          <div className={`${card} mt-6 max-w-2xl p-5 flex items-center gap-4`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B3F8F] text-[13px] font-bold text-white">
              BS
            </div>
            <div className="min-w-0 text-[13px] leading-relaxed text-slate-600">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{t("needHelp")}</div>
              <div className="font-semibold text-[#0B2540]">{t("contactLine")}</div>
              <a href={supportMail} className="text-[#0E86D4] hover:underline">
                {SUPPORT.email}
              </a>
              {" · "}
              <a href={`tel:${SUPPORT.phoneHref}`} className="text-[#0E86D4] hover:underline">
                {SUPPORT.phone}
              </a>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className={`${card} p-6 sm:p-9`}>
            {stepper}
            <AnimatePresence mode="wait">
              {state === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center py-16 gap-5"
                >
                  <Loader2 className="w-8 h-8 text-[#0E86D4] animate-spin" />
                  <p className="text-sm text-slate-500 font-medium">{t("verifyingInvite")}</p>
                </motion.div>
              )}

              {state === "invalid" && (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col"
                >
                  <div className="text-center mb-7">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
                      <AlertTriangle className="w-7 h-7 text-rose-500" />
                    </div>
                    <h2 className="text-[24px] font-bold text-[#0B2540] tracking-tight mb-2">{t("invalidTitle")}</h2>
                    <p className="text-[15px] text-slate-500 leading-relaxed max-w-sm mx-auto">{t("invalidBody")}</p>
                  </div>
                  <div className={`${subCard} p-5 mb-5`}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-3">{t("contact")}</div>
                    <div className="text-[14px] font-semibold text-[#0B2540] mb-2">{t("contactLine")}</div>
                    <a href={supportMail} className="flex items-center gap-2 text-[14px] font-semibold text-[#0E86D4] hover:text-[#0A6BB0] transition-colors mb-1.5">
                      <Mail className="w-4 h-4" />
                      {SUPPORT.email}
                    </a>
                    <a href={`tel:${SUPPORT.phoneHref}`} className="flex items-center gap-2 text-[14px] font-semibold text-[#0E86D4] hover:text-[#0A6BB0] transition-colors">
                      <Phone className="w-4 h-4" />
                      {SUPPORT.phone}
                    </a>
                  </div>
                  <p className="text-center text-[13px] text-slate-500 font-medium">{t("canClose")}</p>
                </motion.div>
              )}

              {state === "form" && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={submitForm}
                  className="flex flex-col"
                >
                  <div className="mb-7">
                    {stepPill(<KeyRound className="w-3.5 h-3.5" />, require2FA ? t("step1of2") : t("step1"))}
                    <h2 className="text-[27px] font-bold text-[#0B2540] tracking-tight mb-2">{t("setPasswordTitle")}</h2>
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                      {alreadyActivated ? t("alreadyActiveLead") : require2FA ? t("setPasswordLead2fa") : t("setPasswordLead")}
                    </p>
                  </div>

                  <div className={`${subCard} p-4 mb-6 flex items-center gap-3.5`}>
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#0E86D4]/20 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5 text-[#0E86D4]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-0.5">{t("invitedAccount")}</div>
                      <div className="text-[15px] font-semibold text-[#0B2540] truncate">{email || t("loading")}</div>
                    </div>
                    {require2FA && (
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0E86D4]/10 border border-[#0E86D4]/20 text-[#0B3F8F] text-[11px] font-bold tracking-wide">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t("twofaRequired")}
                      </span>
                    )}
                  </div>

                  {!alreadyActivated && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="eco-pwd" className="block text-[13px] font-semibold text-[#0B3F8F] mb-2 pl-0.5">
                          {t("newPassword")}
                        </label>
                        <div className="relative">
                          <input
                            id="eco-pwd"
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("newPasswordPh")}
                            className={`${inputCls} pr-12`}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((p) => !p)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl hover:bg-[#0E86D4]/10 flex items-center justify-center text-slate-400 hover:text-[#0B3F8F] transition-colors"
                            tabIndex={-1}
                            aria-label={showPwd ? t("hidePassword") : t("showPassword")}
                          >
                            {showPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                          </button>
                        </div>

                        {password && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full grid grid-cols-5 gap-1 overflow-hidden">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className={`transition-all duration-300 rounded-full ${i < strength ? strengthColor : "bg-[#E3F1FB]"}`} />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 w-24 text-right shrink-0">
                              {strengthText}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {rules.map((r) => (
                            <div
                              key={r.label}
                              className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${r.ok ? "text-emerald-600" : "text-slate-400"}`}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 ${r.ok ? "text-emerald-500" : "text-slate-300"}`} />
                              {r.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-5">
                        <label htmlFor="eco-pwd2" className="block text-[13px] font-semibold text-[#0B3F8F] mb-2 pl-0.5">
                          {t("confirmPassword")}
                        </label>
                        <input
                          id="eco-pwd2"
                          type={showPwd ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder={t("confirmPasswordPh")}
                          className={inputCls}
                          autoComplete="new-password"
                        />
                      </div>
                    </>
                  )}

                  {errorBlock}

                  {!alreadyActivated && (
                    <>
                      <button type="submit" disabled={submitting} className={`${ecoPrimaryBtn} w-full h-[54px] text-[14px]`}>
                        {submitting ? (
                          <>
                            <Loader2 className="w-[18px] h-[18px] animate-spin" />
                            {t("processing")}
                          </>
                        ) : (
                          <>
                            {require2FA ? t("setPasswordBtn2fa") : t("setPasswordBtn")}
                            <ArrowRight className="w-[18px] h-[18px]" />
                          </>
                        )}
                      </button>
                      <p className="mt-6 text-center text-[12px] text-slate-400 leading-relaxed">
                        {t("setupTerms")}{" "}
                        <a href={supportMail} className="text-[#0E86D4] font-semibold hover:underline">
                          {t("support")}
                        </a>
                      </p>
                    </>
                  )}

                  {alreadyActivated && (
                    <div className={`${subCard} p-4`}>
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white border border-[#0E86D4]/20 flex items-center justify-center shrink-0 shadow-sm">
                          <Mail className="w-5 h-5 text-[#0E86D4]" />
                        </div>
                        <div className="flex-1 min-w-0 text-[13px] text-slate-600 leading-relaxed">
                          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-1">{t("requestNewLinkTitle")}</div>
                          {t("requestNewLinkBody")}{" "}
                          <a
                            href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(t("mailSubjectNewLink"))}`}
                            className="font-semibold text-[#0E86D4] hover:underline"
                          >
                            {SUPPORT.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.form>
              )}

              {state === "tfa-setup" && (
                <motion.form
                  key="tfa-setup"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={submitTfaVerify}
                  className="flex flex-col"
                >
                  <div className="mb-6">
                    {stepPill(<ShieldCheck className="w-3.5 h-3.5" />, t("tfaSetupStep"))}
                    <h2 className="text-[27px] font-bold text-[#0B2540] tracking-tight mb-2">{t("tfaSetupTitle")}</h2>
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                      <Rich text={t("tfaSetupLead")} />
                    </p>
                  </div>

                  <div className="space-y-5 mb-6">
                    <div className={`${subCard} p-5`}>
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0B3F8F] mb-3">{t("tfaStep1")}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="shrink-0 self-center p-3 bg-white border border-[#DCEBF7] rounded-2xl shadow-sm">
                          {tfaQr ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tfaQr} alt={t("qrAlt")} width={176} height={176} style={{ borderRadius: 10, display: "block" }} />
                          ) : (
                            <div className="w-[176px] h-[176px] rounded-2xl bg-[#E3F1FB] animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <p className="text-[13px] leading-relaxed text-slate-600 font-medium">
                            <Rich text={t("tfaStep1Body")} />
                          </p>
                          <div className="rounded-xl bg-white border border-[#DCEBF7] p-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">{t("tfaManualKey")}</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-[13px] font-mono font-bold text-[#0B2540] break-all">{tfaSecret || "—"}</code>
                              <button
                                type="button"
                                onClick={() => copy(tfaSecret || "", "secret")}
                                className="shrink-0 w-8 h-8 rounded-lg hover:bg-[#0E86D4]/10 flex items-center justify-center text-slate-500 transition-colors"
                                title={t("copyKey")}
                              >
                                {tfaCopied === "secret" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`${subCard} p-5`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0B3F8F]">{t("tfaStep2")}</div>
                        <button
                          type="button"
                          onClick={downloadBackupCodes}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
                            tfaBackupDownloaded
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-white text-[#0B3F8F] hover:bg-[#EEF7FD] border border-[#DCEBF7]"
                          }`}
                        >
                          {tfaBackupDownloaded ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {tfaBackupDownloaded ? t("downloaded") : t("downloadTxt")}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {tfaBackupCodes?.map((c, i) => (
                          <div key={c} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#DCEBF7]">
                            <code className="font-mono text-[12.5px] font-bold text-[#0B2540] tracking-wide">{c}</code>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">#{String(i + 1).padStart(2, "0")}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[12px] text-slate-500 leading-relaxed font-medium">
                        <Rich text={t("tfaBackupImportant")} />
                      </p>
                    </div>

                    <div className={`${subCard} p-5`}>
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#0B3F8F] mb-3">{t("tfaStep3")}</div>
                      <label htmlFor="eco-tfa" className="block text-[13px] font-semibold text-[#0B3F8F] mb-2 pl-0.5">
                        {tfaUseBackup ? t("tfaBackupInput") : t("tfaCode6")}
                      </label>
                      <input
                        id="eco-tfa"
                        type="text"
                        autoComplete="one-time-code"
                        inputMode={tfaUseBackup ? "text" : "numeric"}
                        value={tfaCode}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!tfaUseBackup) v = v.replace(/\D/g, "").slice(0, 6);
                          else v = v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
                          setTfaCode(v);
                        }}
                        placeholder={tfaUseBackup ? t("tfaBackupPh") : "000000"}
                        className={`${inputCls} text-center tracking-[0.45em] font-mono font-bold text-[18px]`}
                      />
                      <div className="flex items-center gap-2.5 pl-0.5 mt-3">
                        <input
                          id="eco-tfa-backup"
                          type="checkbox"
                          checked={tfaUseBackup}
                          onChange={(e) => {
                            setTfaUseBackup(e.target.checked);
                            setTfaCode("");
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-[#0E86D4] focus:ring-[#0E86D4]/30"
                        />
                        <label htmlFor="eco-tfa-backup" className="text-[13px] font-medium text-slate-600">
                          {t("tfaUseBackupLong")}
                        </label>
                      </div>
                    </div>
                  </div>

                  {errorBlock}

                  <button type="submit" disabled={submitting} className={`${ecoPrimaryBtn} w-full h-[54px] text-[14px]`}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        {t("processing")}
                      </>
                    ) : (
                      <>
                        {t("activate2fa")}
                        <ArrowRight className="w-[18px] h-[18px]" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {state === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                    className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(16,185,129,0.16)]"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-[27px] font-bold text-[#0B2540] tracking-tight mb-2">{t("doneTitle")}</h2>
                  <p className="text-[15px] text-slate-500 leading-relaxed max-w-md mb-7">
                    {t("doneBody")}{" "}
                    <strong className="font-semibold text-[#0B2540]">
                      {t("doneBodyStrong", { email: email || t("doneAddressFallback") })}
                    </strong>
                  </p>

                  <div className={`w-full ${subCard} p-5 mb-5`}>
                    <div className="flex items-start gap-3.5 text-left">
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-[#0E86D4]/20 flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-[#0E86D4]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-[#0B2540] mb-1">{t("checkInbox")}</div>
                        <p className="text-[13px] text-slate-600 leading-relaxed">
                          {t("checkInboxBody")}
                          {require2FA && <> {t("checkInbox2fa")}</>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[13px] text-slate-500 font-medium leading-relaxed">
                    {t("closePage")}
                    {email && (
                      <>
                        <br />
                        {t("emailNotArriving")}{" "}
                        <a
                          href={mailLink("mailSubjectNoWelcome", "mailBodyNoWelcome")}
                          className="font-semibold text-[#0E86D4] hover:underline"
                        >
                          {SUPPORT.email}
                        </a>
                      </>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <footer className="relative z-10 w-full border-t border-[#DCEBF7] bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px] text-slate-400 font-medium">
          <span>
            © {new Date().getFullYear()} Pannon Transfer. {t("rights")}
          </span>
          <span>
            {t("support")}: {t("contactLine")} ·{" "}
            <a href={supportMail} className="hover:text-[#0E86D4]">
              {SUPPORT.email}
            </a>{" "}
            ·{" "}
            <a href={`tel:${SUPPORT.phoneHref}`} className="hover:text-[#0E86D4]">
              {SUPPORT.phone}
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
