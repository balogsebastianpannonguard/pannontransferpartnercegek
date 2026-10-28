"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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

export default function CatlSetupPasswordPage() {
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
  const [error, setError] = useState<string | null>(null);

  // 2FA setup state
  const [tfaQr, setTfaQr] = useState<string | null>(null);
  const [tfaSecret, setTfaSecret] = useState<string | null>(null);
  const [tfaBackupCodes, setTfaBackupCodes] = useState<string[] | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaUseBackup, setTfaUseBackup] = useState(false);
  const [tfaCopied, setTfaCopied] = useState<string | null>(null);
  const [tfaBackupDownloaded, setTfaBackupDownloaded] = useState(false);

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
        const res = await fetch("/api/catl-auth/validate-invite", {
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
            setError(
              "This account has already been activated. To continue, use the personal sign-in link sent to you, or contact Pannon Transfer to request a new invitation."
            );
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
        "mailto:balogh.sebastian@pannonguard.hu?subject=CATL%20Portal%20-%20New%20personal%20sign-in%20link&body=Please%20send%20me%20a%20new%20personal%20sign-in%20link%20for%20the%20CATL%20Portal%20to%20this%20address:%20" +
        encodeURIComponent(email || "");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    if (getStrength(password) < 3) {
      setError(
        "This password is too weak. Please include lowercase and uppercase letters and a number."
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/catl-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message || "Something went wrong while setting your password.");
      } else if (json.requireTwoFactorSetup && json.twoFactorSetup) {
        // Átváltunk 2FA setup állapotra (felhasználónak QR-t kell beolvasni és 6 számot ellenőrizni)
        setTfaQr(json.twoFactorSetup.qrDataUrl || null);
        setTfaSecret(json.twoFactorSetup.secretBase32 || null);
        setTfaBackupCodes(json.twoFactorSetup.backupCodes || null);
        setTfaCode("");
        setTfaUseBackup(false);
        setState("tfa-setup");
      } else {
        // Nincs 2FA kötelező → done screen (NEM redirect!)
        setState("done");
      }
    } catch {
      setError("Network error. Please check your internet connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && (clean.length !== 6 || !/^\d{6}$/.test(clean))) {
      setError("The authenticator code consists of 6 digits.");
      return;
    }
    if (tfaUseBackup && clean.length < 6) {
      setError("Backup code format: A1B2-C3D4-E5");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/catl-auth/verify-2fa-setup", {
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
        setError(json?.message || "Incorrect code.");
      } else {
        setState("done");
      }
    } catch {
      setError("Network error. Please try again.");
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
      "CATL Portal – Two-factor authentication – Backup codes\n\n" +
      `Account: ${email || "N/A"}\n` +
      `Date: ${new Date().toLocaleString("en-GB")}\n\n` +
      "Use one code at a time if you cannot access your authenticator app.\n" +
      "Each code can be used only once.\n\n" +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      "Please store these codes in a safe place.\n" +
      "© Pannon Transfer – CATL Dedicated Client Portal";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CATL_Portal_Backup_Codes_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText =
    ["Too weak", "Weak", "Fair", "Strong", "Very strong", "Excellent"][strength] || "Too weak";
  const strengthColor =
    ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500", "bg-emerald-600"][strength] ||
    "bg-red-500";

  const rules = [
    { ok: password.length >= 8, label: "At least 8 characters" },
    { ok: /[a-z]/.test(password), label: "A lowercase letter" },
    { ok: /[A-Z]/.test(password), label: "An uppercase letter" },
    { ok: /[0-9]/.test(password), label: "A number" },
  ];

  const primaryBtn =
    "w-full h-[54px] rounded-xl bg-gradient-to-b from-[#0A56D6] to-[#0047BA] hover:from-[#0950C4] hover:to-[#003F9F] text-white text-[14px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06),0_10px_26px_rgba(0,71,186,0.28)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";
  const inputCls =
    "w-full h-[52px] px-4 bg-white border border-zinc-200 rounded-xl text-[15px] text-zinc-900 placeholder:text-zinc-400 font-medium focus:outline-none focus:ring-4 focus:ring-[#0047BA]/10 focus:border-[#0047BA]/60 transition-all";
  const card =
    "rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_rgba(15,23,42,0.04)]";
  const supportMail = "mailto:balogh.sebastian@pannonguard.hu";

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
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0047BA]/[0.07] border border-[#0047BA]/10 text-[#0047BA] text-[11px] font-bold tracking-[0.14em] uppercase mb-4">
      {icon}
      {text}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#F5F7FB] text-zinc-900 flex flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[#0047BA]/[0.07] blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-[#00B4D8]/[0.07] blur-3xl" />
      </div>

      <header className="relative z-10 w-full border-b border-zinc-200/70 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/brand/pannon-transfer-logo.png" alt="Pannon Transfer" width={387} height={79} priority className="h-7 w-auto" />
            <span className="hidden sm:block h-7 w-px bg-zinc-200" />
            <Image src="/partners/catl/logo.png" alt="CATL" width={139} height={45} priority className="hidden sm:block h-[26px] w-auto" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[#0047BA]" />
            Secure activation
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.05fr_520px]">
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0047BA]/15 bg-white/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0047BA] shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            CATL dedicated portal
          </div>
          <h1 className="max-w-xl text-[46px] font-semibold leading-[1.05] tracking-[-0.035em] text-zinc-950">
            Welcome to your dedicated CATL booking portal.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-8 text-zinc-600">
            Activate your personal account in a few quick steps. Once active, you can review your agreed rate structure, book
            transfers and follow every booking in one secure place.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 max-w-2xl">
            {[
              { icon: <Lock className="h-5 w-5" />, label: "Access", value: "Personal, invitation-only activation" },
              {
                icon: <ShieldCheck className="h-5 w-5" />,
                label: "Security",
                value: require2FA ? "Two-factor authentication required" : "Strong password protection",
              },
              { icon: <Clock3 className="h-5 w-5" />, label: "Sign-in", value: "Via your personal link, sent by email" },
              { icon: <Building2 className="h-5 w-5" />, label: "Portal", value: "CATL rates and bookings" },
            ].map((t) => (
              <div key={t.label} className={`${card} p-5`}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0047BA]/[0.08] text-[#0047BA]">
                  {t.icon}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">{t.label}</div>
                <div className="mt-1 text-[15px] font-semibold leading-snug text-zinc-900">{t.value}</div>
              </div>
            ))}
          </div>

          <div className={`${card} mt-6 max-w-2xl p-5 flex items-center gap-4`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0B1220] text-[13px] font-bold text-white">BS</div>
            <div className="min-w-0 text-[13px] leading-relaxed text-zinc-600">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">Need help?</div>
              <div className="font-semibold text-zinc-900">Balog Sebastian Máté · Developer</div>
              <a href={supportMail} className="text-[#0047BA] hover:underline">balogh.sebastian@pannonguard.hu</a>
              {" · "}
              <a href="tel:+36306654135" className="text-[#0047BA] hover:underline">+36 30 665 4135</a>
            </div>
          </div>
        </section>

        <section className="w-full">
          <div className={`${card} p-6 sm:p-9`}>
            <AnimatePresence mode="wait">
              {state === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col items-center py-16 gap-5">
                  <Loader2 className="w-8 h-8 text-[#0047BA] animate-spin" />
                  <p className="text-sm text-zinc-500 font-medium">Verifying your invitation…</p>
                </motion.div>
              )}

              {state === "invalid" && (
                <motion.div key="invalid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col">
                  <div className="text-center mb-7">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                      <AlertTriangle className="w-7 h-7 text-red-500" />
                    </div>
                    <h2 className="text-[24px] font-bold text-zinc-900 tracking-tight mb-2">Invalid or expired link</h2>
                    <p className="text-[15px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
                      This access link does not exist, has expired, or has already been used. Please request a new invitation.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 mb-5">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-3">Contact</div>
                    <div className="text-[14px] font-semibold text-zinc-900 mb-2">Balog Sebastian Máté · Developer</div>
                    <a href={supportMail} className="flex items-center gap-2 text-[14px] font-semibold text-[#0047BA] hover:text-[#003A99] transition-colors mb-1.5">
                      <Mail className="w-4 h-4" />
                      balogh.sebastian@pannonguard.hu
                    </a>
                    <a href="tel:+36306654135" className="flex items-center gap-2 text-[14px] font-semibold text-[#0047BA] hover:text-[#003A99] transition-colors">
                      <Phone className="w-4 h-4" />
                      +36 30 665 4135
                    </a>
                  </div>
                  <p className="text-center text-[13px] text-zinc-500 font-medium">You can safely close this page.</p>
                </motion.div>
              )}

              {state === "form" && (
                <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} onSubmit={submitForm} className="flex flex-col">
                  <div className="mb-7">
                    {stepPill(<KeyRound className="w-3.5 h-3.5" />, require2FA ? "Step 1 of 2 · Password" : "Step 1 · Password")}
                    <h2 className="text-[27px] font-bold text-zinc-900 tracking-tight mb-2">Set your password</h2>
                    <p className="text-[15px] text-zinc-500 leading-relaxed">
                      {alreadyActivated
                        ? "This account is already active. To request a new personal sign-in link, please contact us using the details below."
                        : "Choose a strong password that only you know. " +
                          (require2FA
                            ? "In the next step you will also set up two-factor authentication for extra protection."
                            : "This completes your CATL portal activation.")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 mb-6 flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-white border border-[#0047BA]/15 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5 text-[#0047BA]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-0.5">Invited account</div>
                      <div className="text-[15px] font-semibold text-zinc-900 truncate">{email || "Loading…"}</div>
                    </div>
                    {require2FA && (
                      <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0047BA]/[0.07] border border-[#0047BA]/10 text-[#0047BA] text-[11px] font-bold tracking-wide">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        2FA required
                      </span>
                    )}
                  </div>

                  {!alreadyActivated && (
                    <>
                      <div className="mb-4">
                        <label className="block text-[13px] font-semibold text-zinc-800 mb-2 pl-0.5">New password</label>
                        <div className="relative">
                          <input
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a strong password"
                            className={`${inputCls} pr-12`}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((p) => !p)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-700 transition-colors"
                            tabIndex={-1}
                            aria-label={showPwd ? "Hide password" : "Show password"}
                          >
                            {showPwd ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                          </button>
                        </div>

                        {password && (
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full grid grid-cols-5 gap-1 overflow-hidden">
                              {[...Array(5)].map((_, i) => (
                                <div key={i} className={`transition-all duration-300 rounded-full ${i < strength ? strengthColor : "bg-zinc-100"}`} />
                              ))}
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 w-24 text-right shrink-0">{strengthText}</span>
                          </div>
                        )}

                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {rules.map((r) => (
                            <div key={r.label} className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${r.ok ? "text-emerald-600" : "text-zinc-400"}`}>
                              <CheckCircle2 className={`w-3.5 h-3.5 ${r.ok ? "text-emerald-500" : "text-zinc-300"}`} />
                              {r.label}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-5">
                        <label className="block text-[13px] font-semibold text-zinc-800 mb-2 pl-0.5">Confirm password</label>
                        <input
                          type={showPwd ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Re-enter your password"
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
                            Processing…
                          </>
                        ) : (
                          <>
                            {require2FA ? "Set password & continue to 2FA" : "Set password"}
                            <ArrowRight className="w-[18px] h-[18px]" />
                          </>
                        )}
                      </button>
                      <p className="mt-6 text-center text-[12px] text-zinc-400 leading-relaxed">
                        By setting a password you accept the company access terms.{" "}
                        <a href={supportMail} className="text-[#0047BA] font-semibold hover:underline">Support</a>
                      </p>
                    </>
                  )}

                  {alreadyActivated && (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-white border border-[#0047BA]/15 flex items-center justify-center shrink-0 shadow-sm">
                          <Mail className="w-5 h-5 text-[#0047BA]" />
                        </div>
                        <div className="flex-1 min-w-0 text-[13px] text-zinc-700 leading-relaxed">
                          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Request a new link</div>
                          Contact us to have your personal sign-in link re-sent:{" "}
                          <a
                            href="mailto:balogh.sebastian@pannonguard.hu?subject=CATL%20Portal%20-%20New%20personal%20sign-in%20link"
                            className="font-semibold text-[#0047BA] hover:underline"
                          >
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
                    {stepPill(<ShieldCheck className="w-3.5 h-3.5" />, "Step 2 of 2 · Two-factor authentication")}
                    <h2 className="text-[27px] font-bold text-zinc-900 tracking-tight mb-2">Set up two-factor authentication</h2>
                    <p className="text-[15px] text-zinc-500 leading-relaxed">
                      This account is protected by <strong className="text-zinc-800 font-semibold">2FA</strong>. Follow the steps below to link an
                      authenticator app (e.g. Google Authenticator, Microsoft Authenticator, 1Password or Authy).
                    </p>
                  </div>

                  <div className="space-y-5 mb-6">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-3">1 · Scan the QR code</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="shrink-0 self-center p-3 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                          {tfaQr ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tfaQr} alt="2FA QR code" width={176} height={176} style={{ borderRadius: 10, display: "block" }} />
                          ) : (
                            <div className="w-[176px] h-[176px] rounded-2xl bg-zinc-100 animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <p className="text-[13px] leading-relaxed text-zinc-600 font-medium">
                            Open your authenticator app, tap <strong className="text-zinc-900">&ldquo;+&rdquo;</strong> and scan the QR code, or enter
                            the manual key below.
                          </p>
                          <div className="rounded-xl bg-white border border-zinc-200 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">Manual key (if the QR code cannot be scanned)</div>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-[13px] font-mono font-bold text-zinc-900 break-all">{tfaSecret || "—"}</code>
                              <button type="button" onClick={() => copy(tfaSecret || "", "secret")} className="shrink-0 w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors" title="Copy key">
                                {tfaCopied === "secret" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500">2 · Save your backup codes</div>
                        <button
                          type="button"
                          onClick={downloadBackupCodes}
                          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
                            tfaBackupDownloaded ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200"
                          }`}
                        >
                          {tfaBackupDownloaded ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {tfaBackupDownloaded ? "Downloaded" : "Download (.txt)"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {tfaBackupCodes?.map((c, i) => (
                          <div key={c} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-zinc-200">
                            <code className="font-mono text-[12.5px] font-bold text-zinc-800 tracking-wide">{c}</code>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">#{String(i + 1).padStart(2, "0")}</span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-[12px] text-zinc-500 leading-relaxed font-medium">
                        <strong className="text-zinc-700">Important:</strong> keep these codes somewhere safe. If you lose your phone or authenticator
                        app, they let you sign in. Each code can be used only once.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-3">3 · Enter your first code</div>
                      <label className="block text-[13px] font-semibold text-zinc-800 mb-2 pl-0.5">
                        {tfaUseBackup ? "Backup code (e.g. A1B2-C3D4-E5)" : "6-digit authenticator code"}
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
                          className="w-4 h-4 rounded border-zinc-300 text-[#0047BA] focus:ring-[#0047BA]/30"
                        />
                        <label htmlFor="tfa-use-backup" className="text-[13px] font-medium text-zinc-600">
                          Use a backup code (I cannot access my authenticator app right now)
                        </label>
                      </div>
                    </div>
                  </div>

                  {errorBlock}

                  <button type="submit" disabled={submitting} className={primaryBtn}>
                    {submitting ? (
                      <>
                        <Loader2 className="w-[18px] h-[18px] animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        Activate 2FA & finish
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
                    className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(16,185,129,0.12)]"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </motion.div>
                  <h2 className="text-[27px] font-bold text-zinc-900 tracking-tight mb-2">You&rsquo;re all set</h2>
                  <p className="text-[15px] text-zinc-500 leading-relaxed max-w-md mb-7">
                    Thank you &mdash; your CATL portal account is ready.{" "}
                    <strong className="font-semibold text-zinc-800">
                      You will shortly receive an email at {email || "your address"} containing your personal sign-in link.
                    </strong>
                  </p>

                  <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 mb-5">
                    <div className="flex items-start gap-3.5 text-left">
                      <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-[#0047BA]/15 flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-[#0047BA]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-zinc-900 mb-1">Check your inbox (and spam folder)</div>
                        <p className="text-[13px] text-zinc-600 leading-relaxed">
                          Sign in <strong>only through the personal link in that email</strong> &mdash; there is no public login form.
                          {require2FA && <> You will also be asked for the 6-digit code from your authenticator app.</>}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[13px] text-zinc-500 font-medium leading-relaxed">
                    You can now close this page.
                    {email && (
                      <>
                        <br />
                        Email not arriving? Contact us at{" "}
                        <a
                          href={
                            "mailto:balogh.sebastian@pannonguard.hu?subject=CATL%20Portal%20-%20Welcome%20email%20not%20received&body=Please%20send%20me%20a%20new%20personal%20sign-in%20link%20for%20the%20CATL%20Portal%20to%20this%20address:%20" +
                            encodeURIComponent(email)
                          }
                          className="font-semibold text-[#0047BA] hover:underline"
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

      <footer className="relative z-10 w-full border-t border-zinc-200/70 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px] text-zinc-400 font-medium">
          <span>© {new Date().getFullYear()} Pannon Transfer. All rights reserved.</span>
          <span>
            Support: Balog Sebastian Máté, Developer ·{" "}
            <a href={supportMail} className="hover:text-[#0047BA]">balogh.sebastian@pannonguard.hu</a> ·{" "}
            <a href="tel:+36306654135" className="hover:text-[#0047BA]">+36 30 665 4135</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
