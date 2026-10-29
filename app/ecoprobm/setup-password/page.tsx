"use client";

import React, { useState, useEffect } from "react";
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
import { useEcoproBmLang } from "../lang";
import { portalText, translateAuthServerMessage } from "../portal-i18n";
import EcoproBmAuthShell from "../components/EcoproBmAuthShell";

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

const SUPPORT_MAIL = "balogh.sebastian@pannonguard.hu";

export default function EcoproBmSetupPasswordPage() {
  const [lang, setLang] = useEcoproBmLang();
  const tx = (key: string, params?: Record<string, string | number>) => portalText(lang, key, params);

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<"loading" | "invalid" | "form" | "tfa-setup" | "done">("loading");
  const [email, setEmail] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [alreadyActivated, setAlreadyActivated] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // A hibát kulccsal / nyers szöveggel tároljuk, hogy a nyelvváltás utána is helyes maradjon.
  const [error, setError] = useState<{ key?: string; raw?: string } | null>(null);

  const [tfaQr, setTfaQr] = useState<string | null>(null);
  const [tfaSecret, setTfaSecret] = useState<string | null>(null);
  const [tfaBackupCodes, setTfaBackupCodes] = useState<string[] | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaUseBackup, setTfaUseBackup] = useState(false);
  const [tfaCopied, setTfaCopied] = useState<string | null>(null);
  const [tfaBackupDownloaded, setTfaBackupDownloaded] = useState(false);

  useEffect(() => {
    const t = extractTokenFromUrl();
    queueMicrotask(() => {
      setRawToken(t);
      if (!t) setState("invalid");
    });
  }, []);

  useEffect(() => {
    if (!rawToken) return;
    let cancelled = false;
    (async () => {
      setState("loading");
      try {
        const res = await fetch("/api/ecoprobm-auth/validate-invite", {
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
          if (json.alreadyActivated) setError({ key: "alreadyActivatedMsg" });
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

  const errorText = error ? (error.key ? tx(error.key) : translateAuthServerMessage(lang, error.raw, "errGeneric")) : null;

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
      window.location.href = `mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(tx("mailSubjectNewSignIn"))}&body=${encodeURIComponent(
        `${tx("mailBodyNewSignIn")} ${email || ""}`,
      )}`;
      return;
    }
    if (password.length < 8) return setError({ key: "errPwdLen" });
    if (password !== confirm) return setError({ key: "errPwdMatch" });
    if (getStrength(password) < 3) return setError({ key: "errPwdWeak" });
    setSubmitting(true);
    try {
      const res = await fetch("/api/ecoprobm-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message ? { raw: json.message } : { key: "errSetPwdFailed" });
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
      setError({ key: "errNetwork" });
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && !/^\d{6}$/.test(clean)) return setError({ key: "errTfa6" });
    if (tfaUseBackup && clean.length < 6) return setError({ key: "errTfaBackupFmt" });
    setSubmitting(true);
    try {
      const res = await fetch("/api/ecoprobm-auth/verify-2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken: rawToken, code: tfaCode, useBackup: tfaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message ? { raw: json.message } : { key: "errWrongCode" });
      } else {
        setState("done");
      }
    } catch {
      setError({ key: "errNetwork" });
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
      `${tx("backupFileDate")}: ${new Date().toLocaleString(lang === "ko" ? "ko-KR" : lang === "en" ? "en-GB" : "hu-HU")}\n\n` +
      `${tx("backupFileUse")}\n` +
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
    a.download = `EcoproBM_Backup_Codes_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText = tx(`strength${Math.min(strength, 5)}`);
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-amber-400", "bg-lime-400", "bg-emerald-400", "bg-emerald-500"][strength] || "bg-red-500";

  const rules = [
    { ok: password.length >= 8, label: tx("rule8") },
    { ok: /[a-z]/.test(password), label: tx("ruleLower") },
    { ok: /[A-Z]/.test(password), label: tx("ruleUpper") },
    { ok: /[0-9]/.test(password), label: tx("ruleDigit") },
  ];

  const primaryBtn =
    "w-full h-[54px] rounded-xl bg-gradient-to-r from-[#1E73BE] to-[#2B84D2] hover:from-[#2B84D2] hover:to-[#3B93E0] text-white text-[14px] font-semibold shadow-[0_12px_30px_rgba(30,115,190,0.4)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  const inputCls =
    "w-full h-[52px] px-4 bg-[#0B1D38] border border-white/10 rounded-xl text-[15px] text-white placeholder:text-slate-500 font-medium focus:outline-none focus:ring-4 focus:ring-[#1E73BE]/20 focus:border-[#3B93E0] transition-all";
  const panel = "rounded-2xl border border-white/10 bg-white/[0.04]";

  const errorBlock = (
    <AnimatePresence>
      {errorText && (
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
            <p className="text-[13px] text-red-200 font-medium leading-relaxed">{errorText}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const stepPill = (icon: React.ReactNode, text: string) => (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F28C28]/15 border border-[#F28C28]/35 text-[#FFB366] text-[11px] font-bold tracking-[0.14em] uppercase mb-4">
      {icon}
      {text}
    </div>
  );

  const supportCard = (
    <div className={`${panel} p-5`}>
      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5A04A] mb-3">{tx("contact")}</div>
      <div className="text-[14px] font-semibold text-white mb-2">Balog Sebastian Máté · {tx("supportRole")}</div>
      <a href={`mailto:${SUPPORT_MAIL}`} className="flex items-center gap-2 text-[14px] font-semibold text-[#8CC4F5] hover:text-white transition-colors mb-1.5">
        <Mail className="w-4 h-4" />
        {SUPPORT_MAIL}
      </a>
      <a href="tel:+36306654135" className="flex items-center gap-2 text-[14px] font-semibold text-[#8CC4F5] hover:text-white transition-colors">
        <Phone className="w-4 h-4" />
        +36 30 665 4135
      </a>
    </div>
  );

  return (
    <EcoproBmAuthShell
      lang={lang}
      onLangChange={setLang}
      formWidth={560}
      brand={{
        eyebrow: tx("setupEyebrow"),
        title: tx("setupBrandTitle"),
        body: tx("setupBrandBody"),
        bullets: [
          { icon: <Lock className="w-5 h-5" />, title: tx("tileAccess"), text: tx("tileAccessV") },
          { icon: <ShieldCheck className="w-5 h-5" />, title: tx("tileSecurity"), text: tx(require2FA ? "tileSecurity2fa" : "tileSecurityPwd") },
          { icon: <Clock3 className="w-5 h-5" />, title: tx("tileSignin"), text: tx("tileSigninV") },
          { icon: <Building2 className="w-5 h-5" />, title: tx("tilePortal"), text: tx("tilePortalV") },
        ],
      }}
    >
      <AnimatePresence mode="wait">
        {state === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col items-center py-20 gap-5">
            <Loader2 className="w-8 h-8 text-[#3B93E0] animate-spin" />
            <p className="text-sm text-slate-400 font-medium">{tx("verifyingInvite")}</p>
          </motion.div>
        )}

        {state === "invalid" && (
          <motion.div key="invalid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col">
            <div className="text-center mb-7">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-400/25 flex items-center justify-center mb-5">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-[26px] font-semibold text-white tracking-tight mb-2">{tx("invalidLinkTitle")}</h2>
              <p className="text-[15px] text-slate-400 leading-relaxed max-w-sm mx-auto">{tx("invalidLinkText")}</p>
            </div>
            <div className="mb-5">{supportCard}</div>
            <p className="text-center text-[13px] text-slate-500 font-medium">{tx("closeSafely")}</p>
          </motion.div>
        )}

        {state === "form" && (
          <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} onSubmit={submitForm} className="flex flex-col" noValidate>
            <div className="mb-7">
              {stepPill(<KeyRound className="w-3.5 h-3.5" />, tx(require2FA ? "step1of2" : "step1"))}
              <h2 className="text-[28px] font-semibold text-white tracking-tight mb-2">{tx("setPasswordTitle")}</h2>
              <p className="text-[14.5px] text-slate-400 leading-relaxed">
                {alreadyActivated
                  ? tx("alreadyActiveText")
                  : `${tx("setPasswordText")} ${tx(require2FA ? "setPasswordText2fa" : "setPasswordTextDone")}`}
              </p>
            </div>

            <div className={`${panel} p-4 mb-6 flex items-center gap-3.5`}>
              <div className="w-11 h-11 rounded-xl bg-[#1E73BE]/20 border border-[#3B93E0]/25 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#8CC4F5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-0.5">{tx("invitedAccount")}</div>
                <div className="text-[15px] font-semibold text-white truncate">{email || tx("loadingShort")}</div>
              </div>
              {require2FA && (
                <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E73BE]/20 border border-[#3B93E0]/25 text-[#8CC4F5] text-[11px] font-bold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {tx("twofaRequiredBadge")}
                </span>
              )}
            </div>

            {!alreadyActivated && (
              <>
                <div className="mb-4">
                  <label htmlFor="bm-new-pwd" className="block text-[13px] font-semibold text-slate-300 mb-2 pl-0.5">{tx("newPassword")}</label>
                  <div className="relative">
                    <input
                      id="bm-new-pwd"
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
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                      tabIndex={-1}
                      aria-label={tx(showPwd ? "hidePassword" : "showPassword")}
                    >
                      {showPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full grid grid-cols-5 gap-1 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`transition-all duration-300 rounded-full ${i < strength ? strengthColor : "bg-white/10"}`} />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 w-24 text-right shrink-0">{strengthText}</span>
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {rules.map((r) => (
                      <div key={r.label} className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${r.ok ? "text-emerald-400" : "text-slate-500"}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${r.ok ? "text-emerald-400" : "text-slate-600"}`} />
                        {r.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label htmlFor="bm-confirm-pwd" className="block text-[13px] font-semibold text-slate-300 mb-2 pl-0.5">{tx("confirmPassword")}</label>
                  <input
                    id="bm-confirm-pwd"
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

            {errorBlock}

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
                      {tx(require2FA ? "setPasswordContinue2fa" : "setPassword")}
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </>
                  )}
                </button>
                <p className="mt-6 text-center text-[12px] text-slate-500 leading-relaxed">
                  {tx("termsNote")}{" "}
                  <a href={`mailto:${SUPPORT_MAIL}`} className="text-[#8CC4F5] font-semibold hover:underline">{tx("support")}</a>
                </p>
              </>
            )}

            {alreadyActivated && (
              <div className={`${panel} p-4`}>
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#1E73BE]/20 border border-[#3B93E0]/25 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#8CC4F5]" />
                  </div>
                  <div className="flex-1 min-w-0 text-[13px] text-slate-300 leading-relaxed">
                    <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1">{tx("requestNewLinkTitle")}</div>
                    {tx("requestNewLinkText")}{" "}
                    <a href={`mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(tx("mailSubjectNewSignIn"))}`} className="font-semibold text-[#8CC4F5] hover:underline">
                      {SUPPORT_MAIL}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </motion.form>
        )}

        {state === "tfa-setup" && (
          <motion.form key="tfa-setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} onSubmit={submitTfaVerify} className="flex flex-col" noValidate>
            <div className="mb-6">
              {stepPill(<ShieldCheck className="w-3.5 h-3.5" />, tx("step2of2"))}
              <h2 className="text-[28px] font-semibold text-white tracking-tight mb-2">{tx("tfaSetupTitle")}</h2>
              <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("tfaSetupIntro")}</p>
            </div>

            <div className="space-y-5 mb-6">
              <div className={`${panel} p-5`}>
                <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#F5A04A] mb-3">{tx("tfaStep1")}</div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="shrink-0 self-center p-3 bg-white rounded-2xl shadow-lg">
                    {tfaQr ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={tfaQr} alt={tx("qrAlt")} width={176} height={176} style={{ borderRadius: 10, display: "block" }} />
                    ) : (
                      <div className="w-[176px] h-[176px] rounded-2xl bg-slate-200 animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <p className="text-[13px] leading-relaxed text-slate-300 font-medium">{tx("tfaStep1Text")}</p>
                    <div className="rounded-xl bg-[#0B1D38] border border-white/10 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">{tx("manualKey")}</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-[13px] font-mono font-bold text-white break-all">{tfaSecret || "—"}</code>
                        <button type="button" onClick={() => copy(tfaSecret || "", "secret")} className="shrink-0 w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors" title={tx("copyKey")}>
                          {tfaCopied === "secret" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${panel} p-5`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#F5A04A]">{tx("tfaStep2")}</div>
                  <button
                    type="button"
                    onClick={downloadBackupCodes}
                    className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
                      tfaBackupDownloaded ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30" : "bg-white/[0.06] text-slate-200 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {tfaBackupDownloaded ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {tx(tfaBackupDownloaded ? "downloaded" : "downloadTxt")}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tfaBackupCodes?.map((c, i) => (
                    <div key={c} className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0B1D38] border border-white/10">
                      <code className="font-mono text-[12.5px] font-bold text-white tracking-wide">{c}</code>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">#{String(i + 1).padStart(2, "0")}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[12px] text-slate-400 leading-relaxed font-medium">{tx("backupImportant")}</p>
              </div>

              <div className={`${panel} p-5`}>
                <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#F5A04A] mb-3">{tx("tfaStep3")}</div>
                <label htmlFor="bm-tfa-code" className="block text-[13px] font-semibold text-slate-300 mb-2 pl-0.5">
                  {tx(tfaUseBackup ? "backupCodeEg" : "authCode6")}
                </label>
                <input
                  id="bm-tfa-code"
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
                    id="bm-tfa-use-backup"
                    type="checkbox"
                    checked={tfaUseBackup}
                    onChange={(e) => {
                      setTfaUseBackup(e.target.checked);
                      setTfaCode("");
                    }}
                    className="w-4 h-4 rounded border-white/30 bg-transparent accent-[#1E73BE]"
                  />
                  <label htmlFor="bm-tfa-use-backup" className="text-[13px] font-medium text-slate-400">{tx("useBackupNow")}</label>
                </div>
              </div>
            </div>

            {errorBlock}

            <button type="submit" disabled={submitting} className={primaryBtn}>
              {submitting ? (
                <>
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  {tx("processing")}
                </>
              ) : (
                <>
                  {tx("activate2fa")}
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
              className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mb-6 shadow-[0_8px_40px_rgba(16,185,129,0.2)]"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </motion.div>
            <h2 className="text-[27px] font-semibold text-white tracking-tight mb-2">{tx("allSetTitle")}</h2>
            <p className="text-[15px] text-slate-400 leading-relaxed max-w-md mb-7">
              {tx("allSetText")}{" "}
              <strong className="font-semibold text-slate-100">
                {tx("allSetEmail", { email: email || tx("allSetEmailFallback") })}
              </strong>
            </p>

            <div className={`${panel} w-full p-5 mb-5 text-left`}>
              <div className="flex items-start gap-3.5">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-[#1E73BE]/20 border border-[#3B93E0]/25 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#8CC4F5]" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-white mb-1">{tx("checkInbox")}</div>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    {tx("checkInboxText")}
                    {require2FA && <> {tx("checkInbox2fa")}</>}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-[13px] text-slate-500 font-medium leading-relaxed">
              {tx("canClose")}
              {email && (
                <>
                  <br />
                  {tx("emailNotArriving")}{" "}
                  <a
                    href={`mailto:${SUPPORT_MAIL}?subject=${encodeURIComponent(tx("mailSubjectNoWelcome"))}&body=${encodeURIComponent(
                      `${tx("mailBodyNoWelcome")} ${email}`,
                    )}`}
                    className="font-semibold text-[#8CC4F5] hover:underline"
                  >
                    {SUPPORT_MAIL}
                  </a>
                </>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </EcoproBmAuthShell>
  );
}
