"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import { MX_LOCALE, useMxLang } from "../lang";
import { makeTx, translateAuthMessage } from "../booking-i18n";
import { MxBackdrop, MxLangSwitch, PannonChip, SchaefflerChip, SUPPORT } from "../components/mx-ui";

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

const input =
  "w-full h-[52px] px-4 bg-[#0E1511] border border-white/12 rounded-[6px] text-[15px] text-white placeholder:text-slate-600 font-medium focus:outline-none focus:ring-4 focus:ring-[#00893D]/20 focus:border-[#3DDC84]/70 transition-all";
const label = "block font-mono text-[10.5px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2";
const panel = "rounded-[8px] border border-white/10 bg-white/[0.025]";
const primaryBtn =
  "w-full h-[52px] rounded-[6px] bg-[#00893D] hover:bg-[#00A04A] text-white text-[13px] font-bold tracking-[0.14em] uppercase shadow-[0_10px_30px_rgba(0,137,61,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 active:scale-[0.99]";

export default function SchaefflerMotionSetupPasswordPage() {
  const [lang, setLang] = useMxLang();
  const tx = makeTx(lang);

  const tokenRef = useRef("");
  const [state, setState] = useState<"loading" | "invalid" | "form" | "tfa-setup" | "done">("loading");
  const [email, setEmail] = useState("");
  const [require2FA, setRequire2FA] = useState(false);
  const [alreadyActivated, setAlreadyActivated] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // error is stored as a key (client message) or a raw server message
  const [errKey, setErrKey] = useState<string | null>(null);
  const [errRaw, setErrRaw] = useState<{ msg: string; fallback: string } | null>(null);

  const [tfaQr, setTfaQr] = useState<string | null>(null);
  const [tfaSecret, setTfaSecret] = useState<string | null>(null);
  const [tfaBackupCodes, setTfaBackupCodes] = useState<string[] | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaUseBackup, setTfaUseBackup] = useState(false);
  const [tfaCopied, setTfaCopied] = useState<string | null>(null);
  const [tfaBackupDownloaded, setTfaBackupDownloaded] = useState(false);

  const error = errKey ? tx(errKey) : errRaw ? translateAuthMessage(lang, errRaw.msg, errRaw.fallback) : null;
  const clearError = () => {
    setErrKey(null);
    setErrRaw(null);
  };

  useEffect(() => {
    const t = extractTokenFromUrl();
    tokenRef.current = t;
    let cancelled = false;
    if (!t) {
      Promise.resolve().then(() => {
        if (!cancelled) setState("invalid");
      });
      return () => {
        cancelled = true;
      };
    }
    (async () => {
      try {
        const res = await fetch("/api/schaefflermotion-auth/validate-invite", {
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
          if (json.alreadyActivated) setErrKey("alreadyActivatedMsg");
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

  const requestLinkMail = () =>
    `mailto:${SUPPORT.email}?subject=${encodeURIComponent(tx("authSubjectNew"))}&body=${encodeURIComponent(email || "")}`;

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (alreadyActivated) {
      window.location.assign(requestLinkMail());
      return;
    }
    if (password.length < 8) return setErrKey("errPwdShort");
    if (password !== confirm) return setErrKey("errPwdMismatch");
    if (getStrength(password) < 3) return setErrKey("errPwdWeak");
    setSubmitting(true);
    try {
      const res = await fetch("/api/schaefflermotion-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenRef.current, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (json?.message) setErrRaw({ msg: json.message, fallback: "errPwdGeneric" });
        else setErrKey("errPwdGeneric");
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
      setErrKey("errNetworkLong");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && !/^\d{6}$/.test(clean)) return setErrKey("errTfa6");
    if (tfaUseBackup && clean.length < 6) return setErrKey("errTfaBackup");
    setSubmitting(true);
    try {
      const res = await fetch("/api/schaefflermotion-auth/verify-2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken: tokenRef.current, code: tfaCode, useBackup: tfaUseBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (json?.message) setErrRaw({ msg: json.message, fallback: "errCodeWrong" });
        else setErrKey("errCodeWrong");
      } else {
        setState("done");
      }
    } catch {
      setErrKey("networkError");
    } finally {
      setSubmitting(false);
    }
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setTfaCopied(key);
      setTimeout(() => setTfaCopied(null), 1600);
    } catch {}
  };

  const downloadBackupCodes = () => {
    if (!tfaBackupCodes) return;
    const content =
      `${tx("backupFileTitle")}\n\n` +
      `${tx("backupFileAccount")}: ${email || "N/A"}\n` +
      `${tx("backupFileDate")}: ${new Date().toLocaleString(MX_LOCALE[lang])}\n\n` +
      `${tx("backupFileBody1")}\n${tx("backupFileBody2")}\n\n` +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      `${tx("backupFileSafe")}\n${tx("backupFileFooter")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Schaeffler_Motion_Backup_Codes_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText = tx(`strength${Math.min(strength, 5)}`);
  const strengthColor =
    ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500", "bg-[#3DDC84]"][strength] || "bg-red-500";

  const rules = [
    { ok: password.length >= 8, label: tx("ruleLen") },
    { ok: /[a-z]/.test(password), label: tx("ruleLower") },
    { ok: /[A-Z]/.test(password), label: tx("ruleUpper") },
    { ok: /[0-9]/.test(password), label: tx("ruleDigit") },
  ];

  const errorBlock = (
    <AnimatePresence>
      {error && !(alreadyActivated && state === "form") && (
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
            <p className="text-[13px] text-red-300 font-medium leading-relaxed">{error}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const stepPill = (icon: React.ReactNode, text: string) => (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#00893D]/15 border border-[#00893D]/40 text-[#3DDC84] font-mono text-[10.5px] font-bold tracking-[0.18em] uppercase mb-4">
      {icon}
      {text}
    </div>
  );

  return (
    <div className="relative min-h-screen text-slate-300 flex flex-col bg-[#0B100E] overflow-x-hidden">
      <MxBackdrop />
      <div className="relative z-10 h-[3px] w-full bg-[linear-gradient(90deg,#00893D,#3DDC84_55%,transparent)]" />

      <header className="relative z-10 w-full">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PannonChip className="h-9" />
            <span className="w-px h-6 bg-white/15" aria-hidden />
            <SchaefflerChip className="h-9" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:inline-flex items-center gap-2 border border-white/12 rounded-[5px] px-3 h-8 font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-[#3DDC84]" />
              {tx("setupSecure")}
            </div>
            <MxLangSwitch lang={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto grid w-full max-w-[1240px] items-center gap-10 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.05fr_520px]">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#3DDC84]">
            <span className="w-2 h-2 bg-[#3DDC84] rounded-[1px] shadow-[0_0_10px_rgba(61,220,132,0.9)]" />
            {tx("setupHeroTag")}
          </div>
          <h1 className="max-w-xl text-[44px] font-semibold leading-[1.06] tracking-[-0.03em] text-white">{tx("setupHeroTitle")}</h1>
          <p className="mt-6 max-w-xl text-[16.5px] leading-8 text-slate-400">{tx("setupHeroText")}</p>

          <div className="mt-9 grid gap-3.5 sm:grid-cols-2 max-w-2xl">
            {[
              { icon: <Lock className="h-5 w-5" />, label: tx("tileAccess"), value: tx("tileAccessV") },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                label: tx("tileSecurity"),
                value: require2FA ? tx("tileSecurity2fa") : tx("tileSecurityPwd"),
              },
              { icon: <Clock3 className="h-5 w-5" />, label: tx("tileSignIn"), value: tx("tileSignInV") },
              { icon: <Building2 className="h-5 w-5" />, label: tx("tilePortal"), value: tx("tilePortalV") },
            ].map((t) => (
              <div key={t.label} className={`${panel} p-5`}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#00893D]/12 border border-[#00893D]/40 text-[#3DDC84]">
                  {t.icon}
                </div>
                <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-slate-500">{t.label}</div>
                <div className="mt-1 text-[14.5px] font-semibold leading-snug text-slate-100">{t.value}</div>
              </div>
            ))}
          </div>

          <div className={`${panel} mt-5 max-w-2xl p-5 flex items-center gap-4`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] bg-[#00893D] text-[13px] font-bold text-white">BS</div>
            <div className="min-w-0 text-[13px] leading-relaxed text-slate-400">
              <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-slate-500">{tx("helpTitle")}</div>
              <div className="font-semibold text-slate-100">{SUPPORT.name} · {tx("supportRole")}</div>
              <a href={`mailto:${SUPPORT.email}`} className="text-[#3DDC84] hover:underline">{SUPPORT.email}</a>
              {" · "}
              <a href={`tel:${SUPPORT.phoneHref}`} className="text-[#3DDC84] hover:underline">{SUPPORT.phone}</a>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className="relative rounded-[10px] border border-white/10 bg-[#111815]/90 backdrop-blur p-6 sm:p-9 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
            <span className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#3DDC84] to-transparent" />
            <AnimatePresence mode="wait">
              {state === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex flex-col items-center py-16 gap-5">
                  <Loader2 className="w-8 h-8 text-[#3DDC84] animate-spin" />
                  <p className="font-mono text-[12px] tracking-wide text-slate-400">{tx("verifyingInvite")}</p>
                </motion.div>
              )}

              {state === "invalid" && (
                <motion.div key="invalid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex flex-col">
                  <div className="mb-7">
                    <div className="w-12 h-12 rounded-[6px] bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <h2 className="text-[25px] font-semibold text-white tracking-tight mb-2">{tx("invalidTitle")}</h2>
                    <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("invalidText")}</p>
                  </div>
                  <div className={`${panel} p-5 mb-5`}>
                    <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#3DDC84] mb-3">{tx("contact")}</div>
                    <div className="text-[14px] font-semibold text-white mb-2">{SUPPORT.name} · {tx("supportRole")}</div>
                    <a href={`mailto:${SUPPORT.email}`} className="flex items-center gap-2 text-[14px] font-semibold text-[#3DDC84] hover:underline mb-1.5">
                      <Mail className="w-4 h-4" />
                      {SUPPORT.email}
                    </a>
                    <a href={`tel:${SUPPORT.phoneHref}`} className="flex items-center gap-2 text-[14px] font-semibold text-[#3DDC84] hover:underline">
                      <Phone className="w-4 h-4" />
                      {SUPPORT.phone}
                    </a>
                  </div>
                  <p className="text-center text-[13px] text-slate-500 font-medium">{tx("closePage")}</p>
                </motion.div>
              )}

              {state === "form" && (
                <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} onSubmit={submitForm} className="flex flex-col">
                  <div className="mb-7">
                    {stepPill(<KeyRound className="w-3.5 h-3.5" />, require2FA ? tx("step1of2") : tx("step1"))}
                    <h2 className="text-[26px] font-semibold text-white tracking-tight mb-2">{tx("setPassword")}</h2>
                    <p className="text-[14.5px] text-slate-400 leading-relaxed">
                      {alreadyActivated
                        ? tx("setPasswordTextActive")
                        : tx("setPasswordText") + (require2FA ? tx("setPasswordText2fa") : tx("setPasswordTextNo2fa"))}
                    </p>
                  </div>

                  <div className={`${panel} p-4 mb-6 flex items-center gap-3.5`}>
                    <div className="w-10 h-10 rounded-[5px] bg-[#00893D]/15 border border-[#00893D]/40 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#3DDC84]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">{tx("invitedAccount")}</div>
                      <div className="text-[14.5px] font-semibold text-white truncate">{email || tx("loadingEllipsis")}</div>
                    </div>
                    {require2FA && (
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#00893D]/15 border border-[#00893D]/40 text-[#3DDC84] font-mono text-[10.5px] font-bold tracking-wide">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {tx("twoFaRequired")}
                      </span>
                    )}
                  </div>

                  {!alreadyActivated && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="mx-new-pwd" className={label}>{tx("newPassword")}</label>
                        <div className="relative">
                          <input
                            id="mx-new-pwd"
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={tx("newPasswordPh")}
                            className={`${input} pr-12`}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((p) => !p)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md hover:bg-white/[0.07] flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                            tabIndex={-1}
                            aria-label={showPwd ? tx("hidePwd") : tx("showPwd")}
                          >
                            {showPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                          </button>
                        </div>

                        {password && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 grid grid-cols-5 gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className={`transition-all duration-300 rounded-[1px] ${i < strength ? strengthColor : "bg-white/10"}`} />
                              ))}
                            </div>
                            <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-slate-400 w-24 text-right shrink-0">{strengthText}</span>
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {rules.map((r) => (
                            <div key={r.label} className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${r.ok ? "text-[#3DDC84]" : "text-slate-500"}`}>
                              <CheckCircle2 className={`w-3.5 h-3.5 ${r.ok ? "text-[#3DDC84]" : "text-slate-600"}`} />
                              {r.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-5">
                        <label htmlFor="mx-confirm-pwd" className={label}>{tx("confirmPassword")}</label>
                        <input
                          id="mx-confirm-pwd"
                          type={showPwd ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder={tx("confirmPasswordPh")}
                          className={input}
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
                            {require2FA ? tx("setPwdContinue2fa") : tx("setPwdBtn")}
                            <ArrowRight className="w-[18px] h-[18px]" />
                          </>
                        )}
                      </button>
                      <p className="mt-6 text-center text-[12px] text-slate-500 leading-relaxed">
                        {tx("termsNote")}{" "}
                        <a href={`mailto:${SUPPORT.email}`} className="text-[#3DDC84] font-semibold hover:underline">{tx("support")}</a>
                      </p>
                    </>
                  )}

                  {alreadyActivated && (
                    <div className={`${panel} p-4`}>
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-[5px] bg-[#00893D]/15 border border-[#00893D]/40 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-[#3DDC84]" />
                        </div>
                        <div className="flex-1 min-w-0 text-[13px] text-slate-300 leading-relaxed">
                          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">{tx("requestNewLink")}</div>
                          {tx("alreadyActivatedMsg")}
                          <div className="mt-2">
                            {tx("requestNewLinkText")}{" "}
                            <a href={requestLinkMail()} className="font-semibold text-[#3DDC84] hover:underline">{SUPPORT.email}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.form>
              )}

              {state === "tfa-setup" && (
                <motion.form key="tfa-setup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} onSubmit={submitTfaVerify} className="flex flex-col">
                  <div className="mb-6">
                    {stepPill(<ShieldCheck className="w-3.5 h-3.5" />, tx("tfaStepTag"))}
                    <h2 className="text-[26px] font-semibold text-white tracking-tight mb-2">{tx("tfaTitle")}</h2>
                    <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("tfaText")}</p>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className={`${panel} p-5`}>
                      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300 mb-3">{tx("tfa1")}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="shrink-0 self-center p-3 bg-white rounded-[8px]">
                          {tfaQr ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tfaQr} alt="2FA QR" width={168} height={168} style={{ display: "block" }} />
                          ) : (
                            <div className="w-[168px] h-[168px] bg-zinc-100 animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <p className="text-[13px] leading-relaxed text-slate-400">{tx("tfa1Text")}</p>
                          <div className="rounded-[6px] bg-[#0E1511] border border-white/10 p-3">
                            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-1.5">{tx("tfaManualKey")}</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-[12.5px] font-mono font-bold text-[#3DDC84] break-all">{tfaSecret || "—"}</code>
                              <button type="button" onClick={() => copy(tfaSecret || "", "secret")} className="shrink-0 w-8 h-8 rounded-md hover:bg-white/[0.07] flex items-center justify-center text-slate-400 transition-colors" title={tx("copyKey")}>
                                {tfaCopied === "secret" ? <Check className="w-4 h-4 text-[#3DDC84]" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`${panel} p-5`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">{tx("tfa2")}</div>
                        <button
                          type="button"
                          onClick={downloadBackupCodes}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[5px] text-[12px] font-semibold transition-colors ${
                            tfaBackupDownloaded
                              ? "bg-[#00893D]/15 text-[#3DDC84] border border-[#00893D]/40"
                              : "text-slate-300 hover:bg-white/[0.07] border border-white/15"
                          }`}
                        >
                          {tfaBackupDownloaded ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {tfaBackupDownloaded ? tx("tfaDownloaded") : tx("tfaDownload")}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {tfaBackupCodes?.map((c, i) => (
                          <div key={c} className="flex items-center justify-between px-3 py-2 rounded-[5px] bg-[#0E1511] border border-white/10">
                            <code className="font-mono text-[12.5px] font-bold text-slate-200 tracking-wide">{c}</code>
                            <span className="font-mono text-[10px] font-bold tracking-wider text-slate-600">#{String(i + 1).padStart(2, "0")}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[12px] text-slate-500 leading-relaxed">{tx("tfaImportant")}</p>
                    </div>

                    <div className={`${panel} p-5`}>
                      <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300 mb-3">{tx("tfa3")}</div>
                      <label htmlFor="mx-tfa-code" className={label}>{tfaUseBackup ? tx("tfaBackupLabel") : tx("tfaCodeLabel")}</label>
                      <input
                        id="mx-tfa-code"
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
                        className={`${input} text-center tracking-[0.45em] font-mono font-bold text-[18px]`}
                      />
                      <label htmlFor="mx-tfa-backup" className="flex items-center gap-2.5 mt-3 cursor-pointer">
                        <input
                          id="mx-tfa-backup"
                          type="checkbox"
                          checked={tfaUseBackup}
                          onChange={(e) => {
                            setTfaUseBackup(e.target.checked);
                            setTfaCode("");
                          }}
                          className="w-4 h-4 rounded-[3px] accent-[#00893D]"
                        />
                        <span className="text-[13px] font-medium text-slate-400">{tx("tfaUseBackup")}</span>
                      </label>
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
                        {tx("tfaActivate")}
                        <ArrowRight className="w-[18px] h-[18px]" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {state === "done" && (
                <motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex flex-col items-center text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -15 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                    className="w-20 h-20 rounded-[10px] bg-[#00893D]/15 border border-[#00893D]/50 flex items-center justify-center mb-6 shadow-[0_8px_40px_rgba(0,137,61,0.3)]"
                  >
                    <CheckCircle2 className="w-11 h-11 text-[#3DDC84]" />
                  </motion.div>
                  <h2 className="text-[27px] font-semibold text-white tracking-tight mb-2">{tx("doneTitle")}</h2>
                  <p className="text-[14.5px] text-slate-400 leading-relaxed max-w-md mb-7">
                    {tx("doneText")}{" "}
                    <strong className="font-semibold text-slate-100">
                      {tx("doneEmail", { email: email || tx("doneEmailFallback") })}
                    </strong>
                  </p>

                  <div className={`${panel} w-full p-5 mb-5`}>
                    <div className="flex items-start gap-3.5 text-left">
                      <div className="shrink-0 w-10 h-10 rounded-[5px] bg-[#00893D]/15 border border-[#00893D]/40 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-[#3DDC84]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13.5px] font-bold text-white mb-1">{tx("doneCheckInbox")}</div>
                        <p className="text-[13px] text-slate-400 leading-relaxed">
                          {tx("doneSignInOnly")}
                          {require2FA && <> {tx("doneTwoFa")}</>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[13px] text-slate-500 font-medium leading-relaxed">
                    {tx("closePage")}
                    {email && (
                      <>
                        <br />
                        {tx("doneNotArriving")}{" "}
                        <a href={requestLinkMail()} className="font-semibold text-[#3DDC84] hover:underline">
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

      <footer className="relative z-10 w-full border-t border-white/[0.06]">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11.5px] text-slate-500">
          <span>© {new Date().getFullYear()} Pannon Transfer. {tx("rights")}</span>
          <span className="font-mono">
            {SUPPORT.name} · {tx("supportRole")} ·{" "}
            <a href={`mailto:${SUPPORT.email}`} className="hover:text-[#3DDC84]">{SUPPORT.email}</a> ·{" "}
            <a href={`tel:${SUPPORT.phoneHref}`} className="hover:text-[#3DDC84]">{SUPPORT.phone}</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
