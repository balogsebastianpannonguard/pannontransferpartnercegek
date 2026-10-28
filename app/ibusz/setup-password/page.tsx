"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Mail,
  ShieldCheck,
  Copy,
  Check,
  KeyRound,
  Lock,
  Clock3,
  Building2,
  Phone,
} from "lucide-react";
import { useIbuszLang } from "../lang";
import { authMessage, ibText, type IbuszKey } from "../i18n";
import {
  HeroBackdrop,
  IbuszLogo,
  LangSwitch,
  PannonChip,
  SupportCard,
} from "../components/IbuszBrand";

function extractTokenFromUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("token");
    if (q && q.trim()) return q.trim();
    const hash = url.hash.replace(/^#/, "");
    if (!hash) return "";
    if (hash.startsWith("token=")) {
      return decodeURIComponent(hash.slice("token=".length)).trim();
    }
    if (hash.startsWith("?token=")) {
      return decodeURIComponent(hash.slice("?token=".length)).trim();
    }
    return decodeURIComponent(hash).trim();
  } catch {
    return "";
  }
}

const SUPPORT_MAIL = "mailto:balogh.sebastian@pannonguard.hu";

export default function IbuszSetupPasswordPage() {
  const [lang, setLang] = useIbuszLang();
  const tx = (key: IbuszKey, params?: Record<string, string | number>) =>
    ibText(lang, key, params);

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<
    "loading" | "invalid" | "form" | "tfa-setup" | "done"
  >("loading");
  const [email, setEmail] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [alreadyActivated, setAlreadyActivated] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // `error` is either a translation key ("i18n:xxx") or a raw server message.
  const [error, setError] = useState<string | null>(null);

  const [tfaQr, setTfaQr] = useState<string | null>(null);
  const [tfaSecret, setTfaSecret] = useState<string | null>(null);
  const [tfaBackupCodes, setTfaBackupCodes] = useState<string[] | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaUseBackup, setTfaUseBackup] = useState(false);
  const [tfaCopied, setTfaCopied] = useState<string | null>(null);
  const [tfaBackupDownloaded, setTfaBackupDownloaded] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const t = extractTokenFromUrl();
    setRawToken(t);
    if (!t) {
      setState("invalid");
    }
  }, []);

  useEffect(() => {
    if (!rawToken) return;
    let cancelled = false;
    (async () => {
      setState("loading");
      try {
        const res = await fetch("/api/ibusz-auth/validate-invite", {
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
          if (json.alreadyActivated) {
            setError("i18n:errAlreadyActivated");
          }
          setState("form");
        }
      } catch {
        if (!cancelled) setState("invalid");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawToken]);

  const errorText = (e: string | null, fallback: IbuszKey): string | null => {
    if (!e) return null;
    if (e.startsWith("i18n:")) return tx(e.slice(5) as IbuszKey);
    if (e.startsWith("srv:")) return authMessage(lang, e.slice(4), fallback);
    return e;
  };

  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (alreadyActivated) {
      window.location.href =
        "mailto:balogh.sebastian@pannonguard.hu?subject=" +
        encodeURIComponent("IBUSZ portál - új személyes belépési link") +
        "&body=" +
        encodeURIComponent(
          "Kérem, küldjenek új személyes belépési linket erre a címre: " + (email || ""),
        );
      return;
    }
    if (password.length < 8) {
      setError("i18n:errPwMin");
      return;
    }
    if (password !== confirm) {
      setError("i18n:errPwMismatch");
      return;
    }
    if (getStrength(password) < 3) {
      setError("i18n:errPwWeak");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ibusz-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password, language: lang }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message ? `srv:${json.message}` : "i18n:errPwGeneric");
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
      setError("i18n:errNetworkCheck");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && (clean.length !== 6 || !/^\d{6}$/.test(clean))) {
      setError("i18n:errCode6Digits");
      return;
    }
    if (tfaUseBackup && clean.length < 6) {
      setError("i18n:errBackupFormat");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ibusz-auth/verify-2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteToken: rawToken,
          code: tfaCode,
          useBackup: tfaUseBackup,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message ? `srv:${json.message}` : "i18n:errWrongCode");
      } else {
        setState("done");
      }
    } catch {
      setError("i18n:errNetworkShort");
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
      `${tx("backupFileTitle")}\n\n` +
      `${tx("backupFileAccount")}: ${email || "N/A"}\n` +
      `${tx("backupFileDate")}: ${new Date().toLocaleString(lang === "hu" ? "hu-HU" : "en-GB")}\n\n` +
      `${tx("backupFileIntro")}\n` +
      `${tx("backupFileOnce")}\n\n` +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      `${tx("backupFileKeep")}\n` +
      `${tx("backupFileFooter")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IBUSZ_Portal_Backup_Codes_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText = tx(`strength${Math.min(strength, 5)}` as IbuszKey);
  const strengthColor =
    ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500", "bg-emerald-600"][strength] ||
    "bg-red-500";

  const rules = [
    { ok: password.length >= 8, label: tx("rule8") },
    { ok: /[a-z]/.test(password), label: tx("ruleLower") },
    { ok: /[A-Z]/.test(password), label: tx("ruleUpper") },
    { ok: /[0-9]/.test(password), label: tx("ruleDigit") },
  ];

  const primaryBtn =
    "w-full h-[54px] rounded-2xl bg-gradient-to-r from-[#004A8D] to-[#0C6BB5] hover:from-[#00386B] hover:to-[#004A8D] text-white text-[14px] font-semibold shadow-[0_12px_28px_rgba(0,74,141,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  const inputCls =
    "w-full h-[52px] px-4 bg-white border border-slate-200 rounded-2xl text-[15px] text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-4 focus:ring-[#004A8D]/10 focus:border-[#004A8D] transition-all";
  const card =
    "rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,34,56,0.04),0_18px_44px_rgba(15,34,56,0.07)]";
  const subCard = "rounded-2xl border border-slate-200 bg-slate-50/70";

  const errorBlock = (fallback: IbuszKey) => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -6, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-5"
        >
          <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-2xl">
            <AlertTriangle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-700 font-medium leading-relaxed">
              {errorText(error, fallback)}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const stepPill = (icon: React.ReactNode, text: string) => (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#004A8D]/[0.07] border border-[#004A8D]/10 text-[#004A8D] text-[11px] font-bold tracking-[0.14em] uppercase mb-4">
      {icon}
      {text}
    </div>
  );

  const tiles = [
    { icon: <Lock className="h-5 w-5" />, label: tx("tileAccess"), value: tx("tileAccessV") },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      label: tx("tileSecurity"),
      value: require2FA ? tx("tileSecurity2fa") : tx("tileSecurityPw"),
    },
    { icon: <Clock3 className="h-5 w-5" />, label: tx("tileSignIn"), value: tx("tileSignInV") },
    { icon: <Building2 className="h-5 w-5" />, label: tx("tilePortal"), value: tx("tilePortalV") },
  ];

  const activatedMail =
    "mailto:balogh.sebastian@pannonguard.hu?subject=" +
    encodeURIComponent("IBUSZ portál - új személyes belépési link");

  return (
    <div className="relative min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col overflow-hidden">
      <header className="relative z-20 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <PannonChip className="h-6" />
            <span className="hidden sm:block h-7 w-px bg-slate-200" />
            <IbuszLogo className="hidden sm:block h-8" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#F39200]" />
              {tx("secureActivation")}
            </div>
            <LangSwitch lang={lang} onChange={setLang} tone="light" label={tx("language")} />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto grid w-full max-w-7xl items-stretch gap-8 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.05fr_520px]">
        <section className="hidden lg:flex relative overflow-hidden rounded-[32px] bg-[#004A8D] text-white shadow-[0_30px_80px_rgba(0,74,141,0.28)]">
          <HeroBackdrop height="100%" waves={false} />
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-[#FFC24D]" />
                {tx("navSubline")}
              </div>
              <h1 className="max-w-lg text-[42px] font-semibold leading-[1.06] tracking-[-0.03em]">
                {tx("setupWelcome")}
              </h1>
              <p className="mt-6 max-w-lg text-[16px] leading-8 text-white/80">
                {tx("setupWelcomeSub")}
              </p>
            </div>

            <div>
              <div className="mt-10 grid gap-3 sm:grid-cols-2 max-w-2xl">
                {tiles.map((t) => (
                  <div
                    key={t.label}
                    className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-[#FFC24D]">
                      {t.icon}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                      {t.label}
                    </div>
                    <div className="mt-1 text-[14px] font-semibold leading-snug text-white">
                      {t.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 max-w-2xl">
                <SupportCard title={tx("needHelp")} role={tx("supportRole")} tone="dark" />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className={`${card} p-6 sm:p-9`}>
            <AnimatePresence mode="wait">
              {state === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col items-center py-16 gap-5">
                  <Loader2 className="w-8 h-8 text-[#004A8D] animate-spin" />
                  <p className="text-sm text-slate-500 font-medium">{tx("setupVerifying")}</p>
                </motion.div>
              )}

              {state === "invalid" && (
                <motion.div key="invalid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col">
                  <div className="text-center mb-7">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                      <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight mb-2">{tx("invalidTitle")}</h2>
                    <p className="text-[15px] text-slate-500 leading-relaxed max-w-sm mx-auto">{tx("invalidBody")}</p>
                  </div>
                  <div className={`${subCard} p-5 mb-5`}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-3">{tx("contactLabel")}</div>
                    <div className="text-[14px] font-semibold text-slate-900 mb-2">Balog Sebastian Máté · {tx("supportRole")}</div>
                    <a href={SUPPORT_MAIL} className="flex items-center gap-2 text-[14px] font-semibold text-[#004A8D] hover:text-[#00386B] transition-colors mb-1.5">
                      <Mail className="w-4 h-4" />
                      balogh.sebastian@pannonguard.hu
                    </a>
                    <a href="tel:+36306654135" className="flex items-center gap-2 text-[14px] font-semibold text-[#004A8D] hover:text-[#00386B] transition-colors">
                      <Phone className="w-4 h-4" />
                      +36 30 665 4135
                    </a>
                  </div>
                  <p className="text-center text-[13px] text-slate-500 font-medium">{tx("closeSafely")}</p>
                </motion.div>
              )}

              {state === "form" && (
                <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} onSubmit={submitForm} className="flex flex-col">
                  <div className="mb-7">
                    {stepPill(<KeyRound className="w-3.5 h-3.5" />, require2FA ? tx("step1of2") : tx("step1"))}
                    <h2 className="text-[27px] font-bold text-slate-900 tracking-tight mb-2">{tx("setPasswordTitle")}</h2>
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                      {alreadyActivated
                        ? tx("alreadyActiveText")
                        : tx("chooseStrong") + " " + (require2FA ? tx("chooseStrong2fa") : tx("chooseStrongDone"))}
                    </p>
                  </div>

                  <div className={`${subCard} p-4 mb-6 flex items-center gap-3.5`}>
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#004A8D]/15 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5 text-[#004A8D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-0.5">{tx("invitedAccount")}</div>
                      <div className="text-[15px] font-semibold text-slate-900 truncate">{email || tx("loading")}</div>
                    </div>
                    {require2FA && (
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F39200]/10 border border-[#F39200]/25 text-[#C77700] text-[11px] font-bold tracking-wide">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {tx("twoFaRequiredBadge")}
                      </span>
                    )}
                  </div>

                  {!alreadyActivated && (
                    <>
                      <div className="mb-4">
                        <label className="block text-[13px] font-semibold text-slate-800 mb-2 pl-0.5">{tx("newPassword")}</label>
                        <div className="relative">
                          <input
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={tx("newPasswordPh")}
                            className={`${inputCls} pr-12`}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((p) => !p)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                            tabIndex={-1}
                            aria-label={showPwd ? tx("hidePassword") : tx("showPassword")}
                          >
                            {showPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                          </button>
                        </div>

                        {password && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full grid grid-cols-5 gap-1 overflow-hidden">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className={`transition-all duration-300 rounded-full ${i < strength ? strengthColor : "bg-slate-100"}`} />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 w-24 text-right shrink-0">{strengthText}</span>
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {rules.map((r) => (
                            <div key={r.label} className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${r.ok ? "text-emerald-600" : "text-slate-400"}`}>
                              <CheckCircle2 className={`w-3.5 h-3.5 ${r.ok ? "text-emerald-500" : "text-slate-300"}`} />
                              {r.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-5">
                        <label className="block text-[13px] font-semibold text-slate-800 mb-2 pl-0.5">{tx("confirmPassword")}</label>
                        <input
                          type={showPwd ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder={tx("confirmPasswordPh")}
                          className={inputCls}
                          autoComplete="new-password"
                        />
                      </div>
                    </>
                  )}

                  {errorBlock("errPwGeneric")}

                  {!alreadyActivated && (
                    <>
                      <button type="submit" disabled={submitting} className={primaryBtn}>
                        {submitting ? (
                          <>
                            <Loader2 className="w-[18px] h-[18px] animate-spin" />
                            {tx("processing")}
                          </>
                        ) : (
                          <>
                            {require2FA ? tx("setPasswordTo2fa") : tx("setPasswordBtn")}
                            <span className="w-6 h-6 rounded-full bg-[#F39200] flex items-center justify-center">
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </span>
                          </>
                        )}
                      </button>
                      <p className="mt-6 text-center text-[12px] text-slate-400 leading-relaxed">
                        {tx("acceptTerms")}{" "}
                        <a href={SUPPORT_MAIL} className="text-[#004A8D] font-semibold hover:underline">{tx("support")}</a>
                      </p>
                    </>
                  )}

                  {alreadyActivated && (
                    <div className={`${subCard} p-4`}>
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white border border-[#004A8D]/15 flex items-center justify-center shrink-0 shadow-sm">
                          <Mail className="w-5 h-5 text-[#004A8D]" />
                        </div>
                        <div className="flex-1 min-w-0 text-[13px] text-slate-700 leading-relaxed">
                          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-1">{tx("requestNewLink")}</div>
                          {tx("requestNewLinkBody")}{" "}
                          <a href={activatedMail} className="font-semibold text-[#004A8D] hover:underline">
                            balogh.sebastian@pannonguard.hu
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.form>
              )}

              {state === "tfa-setup" && (
                <motion.form key="tfa-setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} onSubmit={submitTfaVerify} className="flex flex-col">
                  <div className="mb-6">
                    {stepPill(<ShieldCheck className="w-3.5 h-3.5" />, tx("step2of2"))}
                    <h2 className="text-[27px] font-bold text-slate-900 tracking-tight mb-2">{tx("tfaTitle")}</h2>
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                      {tx("tfaSetupIntroA")} <strong className="text-slate-800 font-semibold">{tx("tfaSetupIntroB")}</strong>
                      {tx("tfaSetupIntroC")}
                    </p>
                  </div>

                  <div className="space-y-5 mb-6">
                    <div className={`${subCard} p-5`}>
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-3">{tx("tfaStep1")}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="shrink-0 self-center p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                          {tfaQr ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tfaQr} alt="2FA QR" width={176} height={176} style={{ borderRadius: 10, display: "block" }} />
                          ) : (
                            <div className="w-[176px] h-[176px] rounded-2xl bg-slate-100 animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <p className="text-[13px] leading-relaxed text-slate-600 font-medium">{tx("tfaScanText")}</p>
                          <div className="rounded-xl bg-white border border-slate-200 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">{tx("tfaManualKey")}</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-[13px] font-mono font-bold text-slate-900 break-all">{tfaSecret || "—"}</code>
                              <button type="button" onClick={() => copy(tfaSecret || "", "secret")} className="shrink-0 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors" title={tx("copyKey")}>
                                {tfaCopied === "secret" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`${subCard} p-5`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500">{tx("tfaStep2")}</div>
                        <button
                          type="button"
                          onClick={downloadBackupCodes}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
                            tfaBackupDownloaded ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                          }`}
                        >
                          {tfaBackupDownloaded ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {tfaBackupDownloaded ? tx("downloaded") : tx("downloadTxt")}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {tfaBackupCodes?.map((c, i) => (
                          <div key={c} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-slate-200">
                            <code className="font-mono text-[12.5px] font-bold text-slate-800 tracking-wide">{c}</code>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">#{String(i + 1).padStart(2, "0")}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[12px] text-slate-500 leading-relaxed font-medium">{tx("tfaBackupNote")}</p>
                    </div>

                    <div className={`${subCard} p-5`}>
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-3">{tx("tfaStep3")}</div>
                      <label className="block text-[13px] font-semibold text-slate-800 mb-2 pl-0.5">
                        {tfaUseBackup ? tx("tfaBackupLabel") : tx("tfaCodeLabel")}
                      </label>
                      <input
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
                        placeholder={tfaUseBackup ? "A1B2-C3D4-E5" : "000000"}
                        className={`${inputCls} text-center tracking-[0.45em] font-mono font-bold text-[18px]`}
                      />
                      <div className="flex items-center gap-2.5 pl-0.5 mt-3">
                        <input
                          id="tfa-use-backup"
                          type="checkbox"
                          checked={tfaUseBackup}
                          onChange={(e) => {
                            setTfaUseBackup(e.target.checked);
                            setTfaCode("");
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-[#004A8D] focus:ring-[#004A8D]/30"
                        />
                        <label htmlFor="tfa-use-backup" className="text-[13px] font-medium text-slate-600">
                          {tx("tfaUseBackup")}
                        </label>
                      </div>
                    </div>
                  </div>

                  {errorBlock("errWrongCode")}

                  <button type="submit" disabled={submitting} className={primaryBtn}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        {tx("processing")}
                      </>
                    ) : (
                      <>
                        {tx("tfaActivate")}
                        <span className="w-6 h-6 rounded-full bg-[#F39200] flex items-center justify-center">
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {state === "done" && (
                <motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                    className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(16,185,129,0.12)]"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-[27px] font-bold text-slate-900 tracking-tight mb-2">{tx("doneTitle")}</h2>
                  <p className="text-[15px] text-slate-500 leading-relaxed max-w-md mb-7">
                    {tx("doneBodyA")}{" "}
                    <strong className="font-semibold text-slate-800">
                      {tx("doneBodyB", { email: email || tx("doneBodyFallback") })}
                    </strong>
                  </p>

                  <div className={`w-full ${subCard} p-5 mb-5`}>
                    <div className="flex items-start gap-3.5 text-left">
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-[#004A8D]/15 flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-[#004A8D]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-slate-900 mb-1">{tx("checkInbox")}</div>
                        <p className="text-[13px] text-slate-600 leading-relaxed">
                          {tx("checkInboxBody")}
                          {require2FA && tx("checkInbox2fa")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[13px] text-slate-500 font-medium leading-relaxed">
                    {tx("closeNow")}
                    {email && (
                      <>
                        <br />
                        {tx("notArriving")}{" "}
                        <a
                          href={
                            "mailto:balogh.sebastian@pannonguard.hu?subject=" +
                            encodeURIComponent("IBUSZ portál - nem érkezett meg az üdvözlő e-mail") +
                            "&body=" +
                            encodeURIComponent("Kérem, küldjenek új személyes belépési linket erre a címre: " + email)
                          }
                          className="font-semibold text-[#004A8D] hover:underline"
                        >
                          balogh.sebastian@pannonguard.hu
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

      <footer className="relative z-10 w-full border-t border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px] text-slate-400 font-medium">
          <span>© {new Date().getFullYear()} Pannon Transfer. {tx("rights")}</span>
          <span>
            {tx("support")}: Balog Sebastian Máté, {tx("supportRole")} ·{" "}
            <a href={SUPPORT_MAIL} className="hover:text-[#004A8D]">balogh.sebastian@pannonguard.hu</a> ·{" "}
            <a href="tel:+36306654135" className="hover:text-[#004A8D]">+36 30 665 4135</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
