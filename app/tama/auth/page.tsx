"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle2, KeyRound, Leaf, Loader2, Mail, ShieldCheck } from "lucide-react";
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

export default function TamaAuthPage() {
  const router = useRouter();
  const [lang, setLang] = useTamaLang();
  const tx = (key: string, params?: Record<string, string | number>) => authText(lang, key, params);

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<"loading" | "invalid" | "twofactor" | "done">("loading");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverInvalid, setServerInvalid] = useState<string | null>(null);
  const [netError, setNetError] = useState(false);

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
      try {
        const res = await fetch("/api/tama-auth/magic-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        if (cancelled) return;
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setState("invalid");
          setServerInvalid(typeof json?.message === "string" ? json.message : null);
        } else if (json.needTwoFactor) {
          setEmail(json.email || "");
          setState("twofactor");
        } else if (json.redirect) {
          setState("done");
          setTimeout(() => router.push("/tama"), 2200);
        }
      } catch {
        if (!cancelled) {
          setState("invalid");
          setServerInvalid(null);
          setNetError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.replace(/\s+/g, "").length < 4) {
      setError(useBackup ? tx("codeTooShort") : tx("tfaCode6"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/tama-auth/magic-login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, code, useBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(translateAuthMessage(lang, json?.message, "tfaIncorrect"));
      } else {
        setState("done");
        setTimeout(() => router.push("/tama"), 2200);
      }
    } catch {
      setError(tx("networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  const invalidMessage = serverInvalid ? translateAuthMessage(lang, serverInvalid, "accessDeniedText") : tx("accessDeniedText");

  return (
    <AuthFrame
      lang={lang}
      onLang={setLang}
      panelEyebrow={tx("loginEyebrow")}
      panelTitle={tx("loginSideTitle")}
      panelText={tx("loginSideText")}
      footerNote={tx("magicFooter")}
    >
      <AnimatePresence mode="wait">
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center py-20 gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#EAF1D3] border border-[#CFDDA0] flex items-center justify-center">
              <Leaf className="w-7 h-7 text-[#5F8016] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-5 h-5 text-[#5F8016] animate-spin" />
              <p className="text-sm text-[#5B6450] font-medium">{tx("magicVerifying")}</p>
            </div>
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
            <div className="mb-8">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-[28px] leading-tight text-[#26301B] mb-2.5" style={serifFont}>
                {tx("accessDenied")}
              </h1>
              <p className="text-[15px] text-[#5B6450] leading-relaxed">{invalidMessage}</p>
              {netError && <p className="mt-3 text-[13px] text-red-600 font-medium">{tx("networkError")}</p>}
            </div>

            <div className={`${authCard} !rounded-2xl !shadow-none p-5 mb-6`}>
              <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#8B917D] mb-2.5">{tx("requestInvite")}</div>
              <a
                href={`mailto:${SUPPORT.email}`}
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#4B6A0E] hover:text-[#3E560C] transition-colors"
              >
                <Mail className="w-4 h-4" />
                {SUPPORT.email}
              </a>
            </div>

            <a
              href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(tx("newLinkSubject"))}`}
              className={authPrimaryBtn}
            >
              <Mail className="w-4 h-4" />
              {tx("requestNewLink")}
            </a>
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-8 w-full"
          >
            <div className="relative flex items-center justify-center w-full max-w-sm mb-12 px-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#26301B] flex items-center justify-center shadow-lg mb-4">
                  <span className="text-white font-black text-xl tracking-tighter">PT</span>
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#8B917D] uppercase text-center w-24">Pannon Transfer</span>
              </motion.div>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                style={{ transformOrigin: "left center" }}
                className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-[#E4DDC7] via-[#7B9824]/60 to-[#5F8016] relative mt-[-24px]"
              >
                <motion.div
                  initial={{ left: "0%", opacity: 0, scale: 0 }}
                  animate={{ left: "100%", opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.7, ease: "easeInOut" }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#5F8016] shadow-[0_0_12px_4px_rgba(95,128,22,0.4)]"
                />
              </motion.div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B9824] to-[#4B6A0E] flex items-center justify-center shadow-xl shadow-[#5F8016]/25 mb-4">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#5F8016] uppercase text-center w-24">TAMA</span>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-[#5F8016]" />
                <h1 className="text-[20px] text-[#26301B]" style={serifFont}>{tx("authSuccess")}</h1>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-[#F1EDDD] rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5F8016]" />
                <p className="text-[13px] text-[#5B6450] font-medium">{tx("secureConnection")}</p>
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
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B9824] to-[#4B6A0E] flex items-center justify-center mb-5 shadow-[0_12px_28px_rgba(75,106,14,0.3)]">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-[28px] leading-tight text-[#26301B] mb-2.5" style={serifFont}>
                {tx("twoFaTitle")}
              </h1>
              <p className="text-[15px] text-[#5B6450] leading-relaxed">{tx("twoFaLead")}</p>
            </div>

            <div className={`${authCard} !rounded-2xl !shadow-none p-4 mb-6 flex items-center gap-3.5`}>
              <div className="w-11 h-11 rounded-xl bg-[#EAF1D3] border border-[#CFDDA0] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#5F8016]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B917D] mb-0.5">{tx("signingInAs")}</div>
                <div className="text-[15px] font-semibold text-[#26301B] truncate">{email || tx("loading")}</div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#EAF1D3] border border-[#CFDDA0] text-[#3E560C] text-[11px] font-bold tracking-wide">
                <KeyRound className="w-3.5 h-3.5" /> 2FA
              </span>
            </div>

            <div className="mb-4">
              <label htmlFor="tama-magic-code" className="block text-[13px] font-bold text-[#4A5340] mb-2 pl-1">
                {useBackup ? tx("backupLabel") : tx("codeLabel")}
              </label>
              <input
                id="tama-magic-code"
                type="text"
                autoComplete="one-time-code"
                inputMode={useBackup ? "text" : "numeric"}
                value={code}
                onChange={(e) => {
                  let v = e.target.value;
                  if (!useBackup) v = v.replace(/\D/g, "").slice(0, 6);
                  else v = v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
                  setCode(v);
                  if (error) setError(null);
                }}
                placeholder={useBackup ? tx("backupPh") : tx("codePh")}
                className={`${authInput} text-center text-[18px] tracking-[0.45em] font-mono font-bold`}
              />
            </div>

            <label className="mb-5 flex items-center gap-2.5 pl-1 cursor-pointer">
              <input
                type="checkbox"
                checked={useBackup}
                onChange={(e) => {
                  setUseBackup(e.target.checked);
                  setCode("");
                }}
                className="w-4 h-4 rounded border-[#CFC7A8] accent-[#5F8016]"
              />
              <span className="text-[13px] font-medium text-[#5B6450]">{tx("useBackup")}</span>
            </label>

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

            <button type="submit" disabled={submitting} className={authPrimaryBtn}>
              {submitting ? (
                <>
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  {tx("processing")}
                </>
              ) : (
                <>
                  {tx("verifyAndSignIn")}
                  <ArrowRight className="w-[18px] h-[18px]" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthFrame>
  );
}
