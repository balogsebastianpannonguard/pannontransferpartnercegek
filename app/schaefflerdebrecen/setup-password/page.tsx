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
import { translateSdAuthMessage, useSdLang, type SdKey } from "../i18n";
import { SD_PATTERN, SD_SUPPORT, SdLangSwitch, SdLogos, sdInput, sdPrimaryBtn } from "../ui";

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

const STRENGTH_KEYS: SdKey[] = ["strength0", "strength1", "strength2", "strength3", "strength4", "strength5"];

export default function SchaefflerDebrecenSetupPasswordPage() {
  const { lang, setLang, tx } = useSdLang();

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<"loading" | "invalid" | "form" | "tfa-setup" | "done">("loading");
  const [email, setEmail] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [alreadyActivated, setAlreadyActivated] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tfaQr, setTfaQr] = useState<string | null>(null);
  const [tfaSecret, setTfaSecret] = useState<string | null>(null);
  const [tfaBackupCodes, setTfaBackupCodes] = useState<string[] | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaUseBackup, setTfaUseBackup] = useState(false);
  const [tfaCopied, setTfaCopied] = useState<string | null>(null);
  const [tfaBackupDownloaded, setTfaBackupDownloaded] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => {
      const t = extractTokenFromUrl();
      setRawToken(t);
      if (!t) setState("invalid");
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!rawToken) return;
    let cancelled = false;
    (async () => {
      setState("loading");
      try {
        const res = await fetch("/api/schaefflerdebrecen-auth/validate-invite", {
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

  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const requestLinkMail = () =>
    `mailto:${SD_SUPPORT.email}?subject=Schaeffler%20Debrecen%20Portal%20-%20New%20personal%20sign-in%20link&body=` +
    encodeURIComponent(`Please send me a new personal sign-in link for the Schaeffler Debrecen Portal to this address: ${email || ""}`);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (alreadyActivated) {
      window.location.href = requestLinkMail();
      return;
    }
    if (password.length < 8) {
      setError(tx("errPwdShort"));
      return;
    }
    if (password !== confirm) {
      setError(tx("errPwdMismatch"));
      return;
    }
    if (getStrength(password) < 3) {
      setError(tx("errPwdWeak"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/schaefflerdebrecen-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password, language: lang }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(translateSdAuthMessage(lang, json?.message, tx("errSetPassword")));
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
      setError(tx("errNetworkLong"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && !/^\d{6}$/.test(clean)) {
      setError(tx("tfaEnter6"));
      return;
    }
    if (tfaUseBackup && clean.length < 6) {
      setError(tx("errBackupFormat"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/schaefflerdebrecen-auth/verify-2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken: rawToken, code: tfaCode, useBackup: tfaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(translateSdAuthMessage(lang, json?.message, tx("errIncorrectCode")));
      } else {
        setState("done");
      }
    } catch {
      setError(tx("networkError"));
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
    const locale = lang === "hu" ? "hu-HU" : "en-GB";
    const content =
      `${tx("backupFileTitle")}\n\n` +
      `${tx("backupFileAccount")}: ${email || "N/A"}\n` +
      `${tx("backupFileDate")}: ${new Date().toLocaleString(locale)}\n\n` +
      `${tx("backupFileUse")}\n${tx("backupFileOnce")}\n\n` +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      `${tx("backupFileStore")}\n` +
      "© Pannon Transfer – Schaeffler Debrecen";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Schaeffler_Debrecen_Backup_Codes_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText = tx(STRENGTH_KEYS[strength] || "strength0");
  const strengthColor =
    ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-[#00893D]", "bg-[#007335]"][strength] || "bg-red-500";

  const rules: { ok: boolean; label: string }[] = [
    { ok: password.length >= 8, label: tx("rule8") },
    { ok: /[a-z]/.test(password), label: tx("ruleLower") },
    { ok: /[A-Z]/.test(password), label: tx("ruleUpper") },
    { ok: /[0-9]/.test(password), label: tx("ruleDigit") },
  ];

  const supportMail = `mailto:${SD_SUPPORT.email}`;
  const panel = "rounded-2xl border border-[#E1E7E3] bg-[#F6F9F7]";

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
          <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl">
            <AlertTriangle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-700 font-medium leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const stepPill = (icon: React.ReactNode, text: string) => (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E7F4EC] border border-[#CBE6D6] text-[#007335] text-[11px] font-bold tracking-[0.14em] uppercase mb-4">
      {icon}
      {text}
    </div>
  );

  const tiles = [
    { icon: <Lock className="h-5 w-5" />, label: tx("tileAccess"), value: tx("tileAccessVal") },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      label: tx("tileSecurity"),
      value: require2FA ? tx("tileSecurity2fa") : tx("tileSecurityPwd"),
    },
    { icon: <Clock3 className="h-5 w-5" />, label: tx("tileSignin"), value: tx("tileSigninVal") },
    { icon: <Building2 className="h-5 w-5" />, label: tx("tilePortal"), value: tx("tilePortalVal") },
  ];

  const contactCard = (
    <div className="flex items-center gap-4 rounded-2xl bg-white/[0.07] border border-white/15 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#0B3D2A]">BS</div>
      <div className="min-w-0 text-[13px] leading-relaxed text-white/75">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">{tx("needHelpCard")}</div>
        <div className="font-semibold text-white">
          {SD_SUPPORT.name} · {tx("supportRole")}
        </div>
        <a href={supportMail} className="text-[#7BE0A6] hover:underline">
          {SD_SUPPORT.email}
        </a>
        {" · "}
        <a href={`tel:${SD_SUPPORT.phoneHref}`} className="text-[#7BE0A6] hover:underline">
          {SD_SUPPORT.phone}
        </a>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-white text-[#0E1A14] flex flex-col lg:flex-row">
      {/* Left – brand panel */}
      <aside className="relative lg:w-[44%] lg:min-h-screen bg-[#0B3D2A] text-white overflow-hidden">
        <div className={`absolute inset-0 ${SD_PATTERN}`} aria-hidden />
        <div className="absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full bg-[#00893D]/25 blur-3xl" aria-hidden />
        <div className="absolute inset-y-0 right-0 hidden lg:block w-[3px] bg-[#00893D]" aria-hidden />
        <div className="relative z-10 flex h-full flex-col px-6 py-6 sm:px-10 lg:px-14 lg:py-12">
          <div className="flex items-center justify-between gap-4">
            <SdLogos onDark />
            <SdLangSwitch lang={lang} onChange={setLang} label={tx("language")} onDark />
          </div>

          <div className="hidden lg:flex flex-1 flex-col justify-center py-14">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9CEBBE]">
              <ShieldCheck className="h-4 w-4" />
              {tx("setupBadge")}
            </div>
            <h1 className="max-w-lg text-[40px] font-semibold leading-[1.08] tracking-[-0.03em]">{tx("setupWelcome")}</h1>
            <p className="mt-6 max-w-lg text-[16px] leading-8 text-white/70">{tx("setupWelcomeBody")}</p>

            <div className="mt-9 grid gap-3 sm:grid-cols-2 max-w-xl">
              {tiles.map((t) => (
                <div key={t.label} className="rounded-2xl border border-white/12 bg-white/[0.06] p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#00893D] text-white">{t.icon}</div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">{t.label}</div>
                  <div className="mt-1 text-[14.5px] font-semibold leading-snug text-white">{t.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 max-w-xl">{contactCard}</div>
          </div>

          <div className="lg:hidden mt-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9CEBBE]">
            <Lock className="w-3.5 h-3.5" />
            {tx("setupSecure")}
          </div>
        </div>
      </aside>

      {/* Right – form */}
      <main className="relative flex-1 flex flex-col bg-[#F3F6F4]">
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 sm:py-14">
          <div className="w-full max-w-[540px] rounded-2xl border border-[#E1E7E3] bg-white p-6 sm:p-9 shadow-[0_1px_2px_rgba(11,61,42,0.04),0_16px_40px_rgba(11,61,42,0.06)]">
            <AnimatePresence mode="wait">
              {state === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col items-center py-16 gap-5">
                  <Loader2 className="w-8 h-8 text-[#00893D] animate-spin" />
                  <p className="text-sm text-[#5C6B63] font-medium">{tx("verifyingInvite")}</p>
                </motion.div>
              )}

              {state === "invalid" && (
                <motion.div key="invalid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col">
                  <div className="text-center mb-7">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                      <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h2 className="text-[24px] font-bold text-[#0E1A14] tracking-tight mb-2">{tx("invalidLinkTitle")}</h2>
                    <p className="text-[15px] text-[#5C6B63] leading-relaxed max-w-sm mx-auto">{tx("invalidLinkBody")}</p>
                  </div>
                  <div className={`${panel} p-5 mb-5`}>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7B8A82] mb-3">{tx("contact")}</div>
                    <div className="text-[14px] font-semibold text-[#0E1A14] mb-2">
                      {SD_SUPPORT.name} · {tx("supportRole")}
                    </div>
                    <a href={supportMail} className="flex items-center gap-2 text-[14px] font-semibold text-[#00893D] hover:text-[#007335] transition-colors mb-1.5">
                      <Mail className="w-4 h-4" />
                      {SD_SUPPORT.email}
                    </a>
                    <a href={`tel:${SD_SUPPORT.phoneHref}`} className="flex items-center gap-2 text-[14px] font-semibold text-[#00893D] hover:text-[#007335] transition-colors">
                      <Phone className="w-4 h-4" />
                      {SD_SUPPORT.phone}
                    </a>
                  </div>
                  <p className="text-center text-[13px] text-[#7B8A82] font-medium">{tx("closePage")}</p>
                </motion.div>
              )}

              {state === "form" && (
                <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} onSubmit={submitForm} className="flex flex-col">
                  <div className="mb-7">
                    {stepPill(<KeyRound className="w-3.5 h-3.5" />, require2FA ? tx("step1of2") : tx("step1"))}
                    <h2 className="text-[27px] font-bold text-[#0E1A14] tracking-tight mb-2">{tx("setPasswordTitle")}</h2>
                    <p className="text-[15px] text-[#5C6B63] leading-relaxed">
                      {alreadyActivated
                        ? tx("setPasswordIntroActive")
                        : `${tx("setPasswordIntro")} ${require2FA ? tx("setPasswordIntro2fa") : tx("setPasswordIntroDone")}`}
                    </p>
                  </div>

                  <div className={`${panel} p-4 mb-6 flex items-center gap-3.5`}>
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#CBE6D6] flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5 text-[#00893D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7B8A82] mb-0.5">{tx("invitedAccount")}</div>
                      <div className="text-[15px] font-semibold text-[#0E1A14] truncate">{email || tx("loading")}</div>
                    </div>
                    {require2FA && (
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E7F4EC] border border-[#CBE6D6] text-[#007335] text-[11px] font-bold tracking-wide">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {tx("tfaRequiredBadge")}
                      </span>
                    )}
                  </div>

                  {alreadyActivated && (
                    <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                      <AlertTriangle className="w-[18px] h-[18px] text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[13px] text-amber-800 font-medium leading-relaxed">{tx("alreadyActivatedErr")}</p>
                    </div>
                  )}

                  {!alreadyActivated && (
                    <>
                      <div className="mb-4">
                        <label className="block text-[13px] font-semibold text-[#31413A] mb-2 pl-0.5">{tx("newPassword")}</label>
                        <div className="relative">
                          <input
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={tx("newPasswordPh")}
                            className={`${sdInput} pr-12`}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((p) => !p)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-[#F1F5F2] flex items-center justify-center text-[#7B8A82] hover:text-[#0B3D2A] transition-colors"
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
                                <div key={i} className={`transition-all duration-300 rounded-full ${i < strength ? strengthColor : "bg-[#E8EDEA]"}`} />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6B63] w-24 text-right shrink-0">{strengthText}</span>
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {rules.map((r) => (
                            <div key={r.label} className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${r.ok ? "text-[#007335]" : "text-[#9AA7A0]"}`}>
                              <CheckCircle2 className={`w-3.5 h-3.5 ${r.ok ? "text-[#00893D]" : "text-[#CBD5CF]"}`} />
                              {r.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-5">
                        <label className="block text-[13px] font-semibold text-[#31413A] mb-2 pl-0.5">{tx("confirmPassword")}</label>
                        <input
                          type={showPwd ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder={tx("confirmPasswordPh")}
                          className={sdInput}
                          autoComplete="new-password"
                        />
                      </div>
                    </>
                  )}

                  {errorBlock}

                  {!alreadyActivated && (
                    <>
                      <button type="submit" disabled={submitting} className={sdPrimaryBtn}>
                        {submitting ? (
                          <>
                            <Loader2 className="w-[18px] h-[18px] animate-spin" />
                            {tx("processing")}
                          </>
                        ) : (
                          <>
                            {require2FA ? tx("setPasswordCta2fa") : tx("setPasswordCta")}
                            <ArrowRight className="w-[18px] h-[18px]" />
                          </>
                        )}
                      </button>
                      <p className="mt-6 text-center text-[12px] text-[#9AA7A0] leading-relaxed">
                        {tx("acceptTerms")}{" "}
                        <a href={supportMail} className="text-[#00893D] font-semibold hover:underline">
                          {tx("loginSupport")}
                        </a>
                      </p>
                    </>
                  )}

                  {alreadyActivated && (
                    <div className={`${panel} p-4`}>
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white border border-[#CBE6D6] flex items-center justify-center shrink-0 shadow-sm">
                          <Mail className="w-5 h-5 text-[#00893D]" />
                        </div>
                        <div className="flex-1 min-w-0 text-[13px] text-[#31413A] leading-relaxed">
                          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7B8A82] mb-1">{tx("requestLink")}</div>
                          {tx("requestLinkBody")}{" "}
                          <a href={requestLinkMail()} className="font-semibold text-[#00893D] hover:underline">
                            {SD_SUPPORT.email}
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
                    <h2 className="text-[27px] font-bold text-[#0E1A14] tracking-tight mb-2">{tx("tfaSetupTitle")}</h2>
                    <p className="text-[15px] text-[#5C6B63] leading-relaxed">
                      {tx("tfaSetupIntroA")} <strong className="text-[#0E1A14] font-semibold">2FA</strong>
                      {tx("tfaSetupIntroB")}
                    </p>
                  </div>

                  <div className="space-y-5 mb-6">
                    <div className={`${panel} p-5`}>
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#5C6B63] mb-3">{tx("tfaStepScan")}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="shrink-0 self-center p-3 bg-white border border-[#E1E7E3] rounded-2xl shadow-sm">
                          {tfaQr ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tfaQr} alt={tx("qrAlt")} width={176} height={176} style={{ borderRadius: 10, display: "block" }} />
                          ) : (
                            <div className="w-[176px] h-[176px] rounded-2xl bg-[#EEF2EF] animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <p className="text-[13px] leading-relaxed text-[#5C6B63] font-medium">{tx("tfaScanBody")}</p>
                          <div className="rounded-xl bg-white border border-[#E1E7E3] p-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7B8A82] mb-1.5">{tx("tfaManualKey")}</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-[13px] font-mono font-bold text-[#0E1A14] break-all">{tfaSecret || "—"}</code>
                              <button type="button" onClick={() => copy(tfaSecret || "", "secret")} className="shrink-0 w-8 h-8 rounded-lg hover:bg-[#F1F5F2] flex items-center justify-center text-[#5C6B63] transition-colors" title={tx("copyKey")}>
                                {tfaCopied === "secret" ? <Check className="w-4 h-4 text-[#00893D]" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`${panel} p-5`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#5C6B63]">{tx("tfaStepBackup")}</div>
                        <button
                          type="button"
                          onClick={downloadBackupCodes}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
                            tfaBackupDownloaded ? "bg-[#E7F4EC] text-[#007335] border border-[#CBE6D6]" : "bg-white text-[#31413A] hover:bg-[#F1F5F2] border border-[#DCE3DF]"
                          }`}
                        >
                          {tfaBackupDownloaded ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {tfaBackupDownloaded ? tx("downloaded") : tx("download")}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {tfaBackupCodes?.map((c, i) => (
                          <div key={c} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#E1E7E3]">
                            <code className="font-mono text-[12.5px] font-bold text-[#0E1A14] tracking-wide">{c}</code>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA7A0]">#{String(i + 1).padStart(2, "0")}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[12px] text-[#5C6B63] leading-relaxed font-medium">
                        <strong className="text-[#0E1A14]">{tx("important")}</strong> {tx("tfaBackupNote")}
                      </p>
                    </div>

                    <div className={`${panel} p-5`}>
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#5C6B63] mb-3">{tx("tfaStepCode")}</div>
                      <label className="block text-[13px] font-semibold text-[#31413A] mb-2 pl-0.5">
                        {tfaUseBackup ? tx("tfaFirstBackup") : tx("tfaFirstCode")}
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
                        className={`${sdInput} text-center tracking-[0.45em] font-mono font-bold text-[18px]`}
                      />
                      <div className="flex items-center gap-2.5 pl-0.5 mt-3">
                        <input
                          id="sd-tfa-use-backup"
                          type="checkbox"
                          checked={tfaUseBackup}
                          onChange={(e) => {
                            setTfaUseBackup(e.target.checked);
                            setTfaCode("");
                          }}
                          className="w-4 h-4 rounded border-[#C5CFC9] text-[#00893D] focus:ring-[#00893D]/30"
                        />
                        <label htmlFor="sd-tfa-use-backup" className="text-[13px] font-medium text-[#5C6B63]">
                          {tx("tfaUseBackupSetup")}
                        </label>
                      </div>
                    </div>
                  </div>

                  {errorBlock}

                  <button type="submit" disabled={submitting} className={sdPrimaryBtn}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        {tx("processing")}
                      </>
                    ) : (
                      <>
                        {tx("tfaFinish")}
                        <ArrowRight className="w-[18px] h-[18px]" />
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
                    className="w-20 h-20 rounded-2xl bg-[#E7F4EC] border-2 border-[#BFE3CC] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,137,61,0.14)]"
                  >
                    <CheckCircle2 className="w-12 h-12 text-[#00893D]" />
                  </motion.div>
                  <h2 className="text-[27px] font-bold text-[#0E1A14] tracking-tight mb-2">{tx("allSet")}</h2>
                  <p className="text-[15px] text-[#5C6B63] leading-relaxed max-w-md mb-7">
                    {tx("allSetBodyA")}{" "}
                    <strong className="font-semibold text-[#0E1A14]">{tx("allSetBodyB", { email: email || tx("yourAddress") })}</strong>
                  </p>

                  <div className={`w-full ${panel} p-5 mb-5`}>
                    <div className="flex items-start gap-3.5 text-left">
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-[#CBE6D6] flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-[#00893D]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-[#0E1A14] mb-1">{tx("checkInbox")}</div>
                        <p className="text-[13px] text-[#5C6B63] leading-relaxed">
                          {tx("checkInboxBody")}
                          {require2FA && tx("checkInboxBody2fa")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[13px] text-[#7B8A82] font-medium leading-relaxed">
                    {tx("closeNow")}
                    {email && (
                      <>
                        <br />
                        {tx("emailNotArriving")}{" "}
                        <a href={requestLinkMail()} className="font-semibold text-[#00893D] hover:underline">
                          {SD_SUPPORT.email}
                        </a>
                      </>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="w-full border-t border-[#E1E7E3] bg-white/70">
          <div className="px-5 sm:px-10 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px] text-[#9AA7A0] font-medium">
            <span>
              © {new Date().getFullYear()} Pannon Transfer. {tx("rights")}
            </span>
            <span>
              {tx("supportLine")} {SD_SUPPORT.name}, {tx("supportRole")} ·{" "}
              <a href={supportMail} className="hover:text-[#00893D]">{SD_SUPPORT.email}</a> ·{" "}
              <a href={`tel:${SD_SUPPORT.phoneHref}`} className="hover:text-[#00893D]">{SD_SUPPORT.phone}</a>
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
