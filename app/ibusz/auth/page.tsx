"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { useIbuszLang } from "../lang";
import { authMessage, ibText, type IbuszKey } from "../i18n";
import { HeroBackdrop, IbuszLogo, LangSwitch, PannonChip } from "../components/IbuszBrand";

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

export default function IbuszAuthPage() {
  const router = useRouter();
  const [lang, setLang] = useIbuszLang();
  const tx = (key: IbuszKey, params?: Record<string, string | number>) =>
    ibText(lang, key, params);

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<
    "loading" | "invalid" | "twofactor" | "done" | "redirecting"
  >("loading");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // raw server message ("srv:...") or translation key ("i18n:...")
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const t = extractTokenFromUrl();
    setRawToken(t);
    if (!t) {
      setState("invalid");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ibusz-auth/magic-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        if (cancelled) return;
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setState("invalid");
          setError(json?.message ? `srv:${json.message}` : "i18n:authLinkInvalid");
        } else if (json.needTwoFactor) {
          setEmail(json.email || "");
          setState("twofactor");
        } else if (json.redirect) {
          setState("done");
          setTimeout(() => router.push("/ibusz"), 2500);
        }
      } catch {
        if (!cancelled) {
          setState("invalid");
          setError("i18n:errNetworkShort");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawToken, router]);

  const errorText = (e: string | null, fallback: IbuszKey): string | null => {
    if (!e) return null;
    if (e.startsWith("i18n:")) return tx(e.slice(5) as IbuszKey);
    if (e.startsWith("srv:")) return authMessage(lang, e.slice(4), fallback);
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.replace(/\s+/g, "").length < 4) {
      setError(useBackup ? "i18n:errShortBackup" : "i18n:errCode6Digits");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ibusz-auth/magic-login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, code, useBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message ? `srv:${json.message}` : "i18n:errWrongCode");
      } else {
        setState("done");
        setTimeout(() => router.push("/ibusz"), 2500);
      }
    } catch {
      setError("i18n:errNetworkShort");
    } finally {
      setSubmitting(false);
    }
  };

  const mailNew =
    "mailto:balogh.sebastian@pannonguard.hu?subject=" +
    encodeURIComponent(
      lang === "hu"
        ? "IBUSZ portál - új belépési link"
        : "IBUSZ Portal - new sign-in link",
    );

  return (
    <div className="relative min-h-screen bg-[#F4F7FB] text-slate-900 flex flex-col">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-[210px] overflow-hidden">
          <HeroBackdrop height={210} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 px-3 rounded-xl bg-white flex items-center shadow-[0_2px_10px_rgba(0,30,70,0.25)]">
              <PannonChip className="h-5" />
            </div>
            <div className="h-10 px-3 rounded-xl bg-white flex items-center shadow-[0_2px_10px_rgba(0,30,70,0.25)]">
              <IbuszLogo className="h-7" />
            </div>
            <span className="hidden md:block text-[11px] text-white/80 tracking-wide ml-1">{tx("authSub")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitch lang={lang} onChange={setLang} tone="dark" label={tx("language")} />
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[13px] font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {tx("authBackHome")}
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-start justify-center px-4 pb-12 -mt-16 pt-20">
        <div className="w-full max-w-[460px] rounded-[28px] bg-white border border-slate-200/80 shadow-[0_30px_80px_rgba(15,34,56,0.14)] p-7 sm:p-9">
          <AnimatePresence mode="wait">
            {state === "loading" || state === "redirecting" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center py-16 gap-5"
              >
                <Loader2 className="w-8 h-8 text-[#004A8D] animate-spin" />
                <p className="text-sm text-slate-500 font-medium">
                  {state === "redirecting" ? tx("authRedirecting") : tx("authVerifyingLink")}
                </p>
              </motion.div>
            ) : null}

            {state === "invalid" && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col"
              >
                <div className="text-center mb-8">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <h1 className="text-[26px] font-bold text-slate-900 tracking-tight mb-2">
                    {tx("authDeniedTitle")}
                  </h1>
                  <p className="text-[15px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                    {errorText(error, "authLinkInvalid") || tx("authDeniedBody")}
                  </p>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 mb-6">
                  <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-2.5">
                    {tx("authRequestInvite")}
                  </div>
                  <a
                    href="mailto:balogh.sebastian@pannonguard.hu"
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#004A8D] hover:text-[#00386B] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    balogh.sebastian@pannonguard.hu
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={mailNew}
                    className="flex-1 h-12 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 text-[14px] font-semibold border border-slate-200 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {tx("authRequestLink")}
                  </a>
                  <Link
                    href="/"
                    className="flex-1 h-12 rounded-2xl bg-[#004A8D] hover:bg-[#00386B] text-white text-[14px] font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {tx("authBackHome")}
                  </Link>
                </div>
              </motion.div>
            )}

            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center py-6 w-full"
              >
                <div className="relative flex items-center justify-center w-full max-w-sm mb-10 px-2">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="h-14 px-3.5 rounded-2xl bg-white border border-slate-200 flex items-center shadow-lg"
                  >
                    <PannonChip className="h-5" />
                  </motion.div>
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ transformOrigin: "left center" }}
                    className="flex-1 mx-3 h-[2px] bg-gradient-to-r from-slate-200 via-[#F39200]/60 to-[#F39200] relative"
                  >
                    <motion.div
                      initial={{ left: "0%", opacity: 0, scale: 0 }}
                      animate={{ left: "100%", opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#F39200] shadow-[0_0_12px_4px_rgba(243,146,0,0.4)]"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="h-14 px-3.5 rounded-2xl bg-white border border-[#004A8D]/15 flex items-center shadow-xl shadow-[#004A8D]/15"
                  >
                    <IbuszLogo className="h-8" />
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
                    <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
                      {tx("authSuccess")}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-100 rounded-full">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#004A8D]" />
                    <p className="text-[13px] text-slate-600 font-medium">{tx("secureConn")}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {state === "twofactor" && (
              <motion.form
                key="2fa"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                onSubmit={submit}
                className="flex flex-col"
              >
                <div className="mb-7">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#004A8D] to-[#0C6BB5] flex items-center justify-center mb-5 ring-4 ring-[#F39200]/25 shadow-[0_12px_26px_rgba(0,74,141,0.25)]">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-[26px] font-bold text-slate-900 tracking-tight mb-2">
                    {tx("tfaPageTitle")}
                  </h1>
                  <p className="text-[15px] text-slate-500 leading-relaxed">
                    {tx("tfaPageBody")}{" "}
                    <strong className="font-semibold text-slate-800">{tx("tfaPageBody2")}</strong>
                    {tx("tfaPageBody3")}
                  </p>
                </div>

                <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#004A8D]/15 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5 text-[#004A8D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-0.5">
                      {tx("signingInAs")}
                    </div>
                    <div className="text-[15px] font-semibold text-slate-900 truncate">
                      {email || tx("loading")}
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F39200]/10 border border-[#F39200]/25 text-[#C77700] text-[11px] font-bold tracking-wide">
                    <KeyRound className="w-3.5 h-3.5" /> 2FA
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2 pl-0.5">
                    {useBackup ? tx("backupCode") : tx("authCode")}
                  </label>
                  <input
                    type="text"
                    autoComplete="one-time-code"
                    inputMode={useBackup ? "text" : "numeric"}
                    value={code}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (!useBackup) v = v.replace(/\D/g, "").slice(0, 6);
                      else v = v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
                      setCode(v);
                    }}
                    placeholder={useBackup ? tx("backupPh") : "000000"}
                    className="w-full h-[54px] px-4 bg-white border border-slate-200 rounded-2xl text-[18px] text-center tracking-[0.45em] text-slate-900 placeholder:text-slate-300 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#004A8D]/10 focus:border-[#004A8D] transition-all"
                  />
                </div>

                <div className="mb-5 flex items-center gap-2.5 pl-0.5">
                  <input
                    id="2fa-backup"
                    type="checkbox"
                    checked={useBackup}
                    onChange={(e) => {
                      setUseBackup(e.target.checked);
                      setCode("");
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-[#004A8D] focus:ring-[#004A8D]/30"
                  />
                  <label htmlFor="2fa-backup" className="text-[13px] font-medium text-slate-600">
                    {tx("useBackupLogin")}
                  </label>
                </div>

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
                          {errorText(error, "errWrongCode")}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-[54px] rounded-2xl bg-gradient-to-r from-[#004A8D] to-[#0C6BB5] hover:from-[#00386B] hover:to-[#004A8D] text-white text-[14px] font-semibold shadow-[0_12px_28px_rgba(0,74,141,0.3)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      {tx("processing")}
                    </>
                  ) : (
                    <>
                      {tx("verifyAndSignIn")}
                      <span className="w-6 h-6 rounded-full bg-[#F39200] flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </span>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full border-t border-slate-200/70 bg-white/70 backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>© {new Date().getFullYear()} Pannon Transfer. {tx("rights")}</span>
          <span className="tracking-wider hidden sm:inline">{tx("authFooter")}</span>
        </div>
      </div>
    </div>
  );
}
