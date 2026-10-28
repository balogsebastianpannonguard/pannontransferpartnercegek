"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  Building2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useTamaLang } from "../lang";
import { authText, translateAuthMessage } from "../auth-i18n";
import { AuthFrame, SUPPORT, authCard, authInput, authPrimaryBtn, serifFont } from "../ui";

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

export default function TamaSetupPasswordPage() {
  const [lang, setLang] = useTamaLang();
  const tx = (key: string, params?: Record<string, string | number>) => authText(lang, key, params);

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<PageState>("loading");
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
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = extractTokenFromUrl();
      setRawToken(t);
      if (!t) {
        setState("invalid");
        return;
      }
      setState("loading");
      try {
        const res = await fetch("/api/tama-auth/validate-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
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
  }, []);

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
      window.location.href = `mailto:${SUPPORT.email}?subject=${encodeURIComponent(tx("alreadyMailSubject"))}&body=${encodeURIComponent(
        tx("alreadyMailBody") + (email || ""),
      )}`;
      return;
    }
    if (password.length < 8) {
      setError(tx("pwdShort"));
      return;
    }
    if (password !== confirm) {
      setError(tx("pwdMismatch"));
      return;
    }
    if (getStrength(password) < 3) {
      setError(tx("pwdWeak"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/tama-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password, language: lang }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(translateAuthMessage(lang, json?.message, "setPwdFailed"));
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
      setError(tx("networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && !/^\d{6}$/.test(clean)) {
      setError(tx("tfaCode6"));
      return;
    }
    if (tfaUseBackup && clean.length < 6) {
      setError(tx("tfaBackupFormat"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/tama-auth/verify-2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken: rawToken, code: tfaCode, useBackup: tfaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(translateAuthMessage(lang, json?.message, "tfaIncorrect"));
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
    const content =
      `${tx("tfaFileTitle")}\n\n` +
      `${tx("tfaFileAccount")}: ${email || "N/A"}\n` +
      `${tx("tfaFileDate")}: ${new Date().toLocaleString(lang === "hu" ? "hu-HU" : "en-GB")}\n\n` +
      `${tx("tfaFileUse")}\n${tx("tfaFileOnce")}\n\n` +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      `${tx("tfaFileSafe")}\n` +
      "© Pannon Transfer – TAMA";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TAMA_Portal_Backup_Codes_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText = tx(`str${Math.min(strength, 5)}`);
  const strengthColor =
    ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-[#7B9824]", "bg-[#5F8016]"][strength] || "bg-red-500";

  const rules = [
    { ok: password.length >= 8, label: tx("rule8") },
    { ok: /[a-z]/.test(password), label: tx("ruleLower") },
    { ok: /[A-Z]/.test(password), label: tx("ruleUpper") },
    { ok: /[0-9]/.test(password), label: tx("ruleDigit") },
  ];

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
          <div role="alert" className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-2xl">
            <AlertTriangle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-700 font-medium leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const stepPill = (icon: React.ReactNode, text: string) => (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF1D3] border border-[#CFDDA0] text-[#3E560C] text-[11px] font-bold tracking-[0.14em] uppercase mb-4">
      {icon}
      {text}
    </div>
  );

  const panelTiles = (
    <div className="grid grid-cols-2 gap-3">
      {[
        { icon: <Lock className="h-4 w-4" />, label: tx("tileAccess"), value: tx("tileAccessValue") },
        {
          icon: <ShieldCheck className="h-4 w-4" />,
          label: tx("tileSecurity"),
          value: require2FA ? tx("tileSecurity2fa") : tx("tileSecurityPwd"),
        },
        { icon: <Clock3 className="h-4 w-4" />, label: tx("tileSignin"), value: tx("tileSigninValue") },
        { icon: <Building2 className="h-4 w-4" />, label: tx("tilePortal"), value: tx("tilePortalValue") },
      ].map((t) => (
        <div key={t.label} className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/20">{t.icon}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{t.label}</div>
          <div className="mt-0.5 text-[13px] font-semibold leading-snug">{t.value}</div>
        </div>
      ))}
    </div>
  );

  return (
    <AuthFrame
      lang={lang}
      onLang={setLang}
      panelEyebrow={tx("setupEyebrow")}
      panelTitle={tx("setupHeroTitle")}
      panelText={tx("setupHeroText")}
      panelExtra={panelTiles}
      footerNote={tx("secureActivation")}
      wide={state === "tfa-setup"}
    >
      <div className={`${authCard} p-6 sm:p-9`}>
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
              <Loader2 className="w-8 h-8 text-[#5F8016] animate-spin" />
              <p className="text-sm text-[#5B6450] font-medium">{tx("verifyingInvite")}</p>
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
                <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
                <h2 className="text-[26px] text-[#26301B] mb-2" style={serifFont}>{tx("invalidTitle")}</h2>
                <p className="text-[15px] text-[#5B6450] leading-relaxed max-w-sm mx-auto">{tx("invalidText")}</p>
              </div>
              <div className="rounded-2xl border border-[#EEE5C6] bg-[#FBF8EC] p-5 mb-5">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B917D] mb-3">{tx("contact")}</div>
                <div className="text-[14px] font-semibold text-[#26301B] mb-2">
                  {SUPPORT.name} · {tx("supportRole")}
                </div>
                <a href={`mailto:${SUPPORT.email}`} className="flex items-center gap-2 text-[14px] font-semibold text-[#4B6A0E] hover:text-[#3E560C] transition-colors mb-1.5">
                  <Mail className="w-4 h-4" />
                  {SUPPORT.email}
                </a>
                <a href={`tel:${SUPPORT.phoneHref}`} className="flex items-center gap-2 text-[14px] font-semibold text-[#4B6A0E] hover:text-[#3E560C] transition-colors">
                  <Phone className="w-4 h-4" />
                  {SUPPORT.phone}
                </a>
              </div>
              <p className="text-center text-[13px] text-[#8B917D] font-medium">{tx("closeSafely")}</p>
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
                {stepPill(<KeyRound className="w-3.5 h-3.5" />, require2FA ? tx("step1of2Pill") : tx("step1Pill"))}
                <h2 className="text-[28px] leading-tight text-[#26301B] mb-2.5" style={serifFont}>{tx("setPwdTitle")}</h2>
                <p className="text-[15px] text-[#5B6450] leading-relaxed">
                  {alreadyActivated ? tx("setPwdActivated") : require2FA ? tx("setPwd2fa") : tx("setPwdPlain")}
                </p>
              </div>

              <div className="rounded-2xl border border-[#E4DDC7] bg-[#FBFAF4] p-4 mb-6 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-white border border-[#CFDDA0] flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-5 h-5 text-[#5F8016]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B917D] mb-0.5">{tx("invitedAccount")}</div>
                  <div className="text-[15px] font-semibold text-[#26301B] break-all leading-snug">{email || tx("loading")}</div>
                </div>
                {require2FA && (
                  <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#EAF1D3] border border-[#CFDDA0] text-[#3E560C] text-[11px] font-bold tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {tx("twoFaRequired")}
                  </span>
                )}
              </div>

              {alreadyActivated && (
                <div className="mb-5 flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <AlertTriangle className="w-[18px] h-[18px] text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[13px] text-amber-800 font-medium leading-relaxed">{tx("alreadyActivatedMsg")}</p>
                </div>
              )}

              {!alreadyActivated && (
                <>
                  <div className="mb-4">
                    <label htmlFor="tama-new-pwd" className="block text-[13px] font-bold text-[#4A5340] mb-2 pl-1">{tx("newPassword")}</label>
                    <div className="relative">
                      <input
                        id="tama-new-pwd"
                        type={showPwd ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={tx("newPasswordPh")}
                        className={`${authInput} pr-12`}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd((p) => !p)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full hover:bg-[#F1EDDD] flex items-center justify-center text-[#8B917D] hover:text-[#26301B] transition-colors"
                        tabIndex={-1}
                        aria-label={showPwd ? tx("hidePwd") : tx("showPwd")}
                      >
                        {showPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                      </button>
                    </div>

                    {password && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full grid grid-cols-5 gap-1 overflow-hidden">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`transition-all duration-300 rounded-full ${i < strength ? strengthColor : "bg-[#EFE9D7]"}`} />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B705C] w-24 text-right shrink-0">{strengthText}</span>
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                      {rules.map((r) => (
                        <div key={r.label} className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${r.ok ? "text-[#4B6A0E]" : "text-[#9CA08A]"}`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${r.ok ? "text-[#5F8016]" : "text-[#D8D1B8]"}`} />
                          {r.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="tama-confirm-pwd" className="block text-[13px] font-bold text-[#4A5340] mb-2 pl-1">{tx("confirmPassword")}</label>
                    <input
                      id="tama-confirm-pwd"
                      type={showPwd ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder={tx("confirmPasswordPh")}
                      className={authInput}
                      autoComplete="new-password"
                    />
                  </div>
                </>
              )}

              {errorBlock}

              {!alreadyActivated ? (
                <>
                  <button type="submit" disabled={submitting} className={authPrimaryBtn}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        {tx("processing")}
                      </>
                    ) : (
                      <>
                        {require2FA ? tx("setPwdBtn2fa") : tx("setPwdBtn")}
                        <ArrowRight className="w-[18px] h-[18px]" />
                      </>
                    )}
                  </button>
                  <p className="mt-6 text-center text-[12px] text-[#8B917D] leading-relaxed">
                    {tx("termsNote")}{" "}
                    <a href={`mailto:${SUPPORT.email}`} className="text-[#4B6A0E] font-semibold hover:underline">{tx("support")}</a>
                  </p>
                </>
              ) : (
                <div className="rounded-2xl border border-[#EEE5C6] bg-[#FBF8EC] p-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#CFDDA0] flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5 text-[#5F8016]" />
                    </div>
                    <div className="flex-1 min-w-0 text-[13px] text-[#4A5340] leading-relaxed">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B917D] mb-1">{tx("requestNewLinkTitle")}</div>
                      {tx("requestNewLinkText")}{" "}
                      <a
                        href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(tx("alreadyMailSubject"))}`}
                        className="font-semibold text-[#4B6A0E] hover:underline"
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
                {stepPill(<ShieldCheck className="w-3.5 h-3.5" />, tx("step2of2Pill"))}
                <h2 className="text-[28px] leading-tight text-[#26301B] mb-2.5" style={serifFont}>{tx("tfaTitle")}</h2>
                <p className="text-[15px] text-[#5B6450] leading-relaxed">{tx("tfaLead")}</p>
              </div>

              <div className="space-y-5 mb-6">
                <div className="rounded-2xl border border-[#E4DDC7] bg-[#FBFAF4] p-5">
                  <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#6B705C] mb-3">{tx("tfaStep1")}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="shrink-0 self-center p-3 bg-white border border-[#E4DDC7] rounded-2xl shadow-sm">
                      {tfaQr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={tfaQr} alt={tx("qrAlt")} width={176} height={176} style={{ borderRadius: 10, display: "block" }} />
                      ) : (
                        <div className="w-[176px] h-[176px] rounded-2xl bg-[#F1EDDD] animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <p className="text-[13px] leading-relaxed text-[#5B6450] font-medium">{tx("tfaStep1Text")}</p>
                      <div className="rounded-xl bg-white border border-[#E4DDC7] p-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8B917D] mb-1.5">{tx("tfaManual")}</div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-[13px] font-mono font-bold text-[#26301B] break-all">{tfaSecret || "—"}</code>
                          <button
                            type="button"
                            onClick={() => copy(tfaSecret || "", "secret")}
                            className="shrink-0 w-8 h-8 rounded-full hover:bg-[#F1EDDD] flex items-center justify-center text-[#6B705C] transition-colors"
                            title={tx("tfaCopyKey")}
                          >
                            {tfaCopied === "secret" ? <Check className="w-4 h-4 text-[#5F8016]" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E4DDC7] bg-[#FBFAF4] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#6B705C]">{tx("tfaStep2")}</div>
                    <button
                      type="button"
                      onClick={downloadBackupCodes}
                      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-semibold transition-colors ${
                        tfaBackupDownloaded
                          ? "bg-[#EAF1D3] text-[#3E560C] border border-[#CFDDA0]"
                          : "bg-white text-[#4A5340] hover:bg-[#F1EDDD] border border-[#E4DDC7]"
                      }`}
                    >
                      {tfaBackupDownloaded ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {tfaBackupDownloaded ? tx("tfaDownloaded") : tx("tfaDownload")}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tfaBackupCodes?.map((c, i) => (
                      <div key={c} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#E4DDC7]">
                        <code className="font-mono text-[12.5px] font-bold text-[#26301B] tracking-wide">{c}</code>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA08A]">#{String(i + 1).padStart(2, "0")}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-[12px] text-[#6B705C] leading-relaxed font-medium">{tx("tfaBackupNote")}</p>
                </div>

                <div className="rounded-2xl border border-[#E4DDC7] bg-[#FBFAF4] p-5">
                  <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#6B705C] mb-3">{tx("tfaStep3")}</div>
                  <label htmlFor="tama-tfa-code" className="block text-[13px] font-bold text-[#4A5340] mb-2 pl-1">
                    {tfaUseBackup ? tx("tfaBackupLabel") : tx("tfaCodeLabel")}
                  </label>
                  <input
                    id="tama-tfa-code"
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
                    className={`${authInput} text-center tracking-[0.45em] font-mono font-bold text-[18px]`}
                  />
                  <label className="flex items-center gap-2.5 pl-1 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tfaUseBackup}
                      onChange={(e) => {
                        setTfaUseBackup(e.target.checked);
                        setTfaCode("");
                      }}
                      className="w-4 h-4 rounded border-[#CFC7A8] accent-[#5F8016]"
                    />
                    <span className="text-[13px] font-medium text-[#5B6450]">{tx("tfaUseBackup")}</span>
                  </label>
                </div>
              </div>

              {errorBlock}

              <button type="submit" disabled={submitting} className={authPrimaryBtn}>
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
                className="w-20 h-20 rounded-full bg-[#EAF1D3] border-2 border-[#CFDDA0] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(95,128,22,0.18)]"
              >
                <CheckCircle2 className="w-12 h-12 text-[#5F8016]" />
              </motion.div>
              <h2 className="text-[28px] text-[#26301B] mb-2" style={serifFont}>{tx("doneTitle")}</h2>
              <p className="text-[15px] text-[#5B6450] leading-relaxed max-w-md mb-7">
                {tx("doneText")}{" "}
                <strong className="font-semibold text-[#26301B]">
                  {tx("doneMail", { email: email || tx("doneMailFallback") })}
                </strong>
              </p>

              <div className="w-full rounded-2xl border border-[#EEE5C6] bg-[#FBF8EC] p-5 mb-5">
                <div className="flex items-start gap-3.5 text-left">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-[#CFDDA0] flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5 text-[#5F8016]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-[#26301B] mb-1">{tx("checkInbox")}</div>
                    <p className="text-[13px] text-[#5B6450] leading-relaxed">
                      {tx("checkInboxText")}
                      {require2FA && <> {tx("checkInbox2fa")}</>}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-[13px] text-[#8B917D] font-medium leading-relaxed">
                {tx("closePage")}
                {email && (
                  <>
                    <br />
                    {tx("emailNotArriving")}{" "}
                    <a
                      href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(tx("welcomeMissingSubject"))}&body=${encodeURIComponent(
                        tx("alreadyMailBody") + email,
                      )}`}
                      className="font-semibold text-[#4B6A0E] hover:underline"
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
    </AuthFrame>
  );
}
