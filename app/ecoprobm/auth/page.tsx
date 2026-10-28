"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Link2,
  Fingerprint,
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

type PageState = "loading" | "invalid" | "twofactor" | "done";

export default function EcoproBmAuthPage() {
  const router = useRouter();
  const [lang, setLang] = useEcoproBmLang();
  const tx = (key: string, params?: Record<string, string | number>) => portalText(lang, key, params);

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<PageState>("loading");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [invalidServerMessage, setInvalidServerMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = extractTokenFromUrl();
    queueMicrotask(() => setRawToken(t));
    if (!t) {
      queueMicrotask(() => setState("invalid"));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ecoprobm-auth/magic-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        if (cancelled) return;
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setState("invalid");
          setInvalidServerMessage(json?.message || null);
        } else if (json.needTwoFactor) {
          setEmail(json.email || "");
          setState("twofactor");
        } else if (json.redirect) {
          setState("done");
          setTimeout(() => router.push("/ecoprobm"), 2200);
        }
      } catch {
        if (!cancelled) {
          setState("invalid");
          setInvalidServerMessage(null);
          setError("errNetwork");
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
      setError(useBackup ? tx("errBackupShort") : tx("errCode6"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ecoprobm-auth/magic-login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, code, useBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(translateAuthServerMessage(lang, json?.message, "errWrongCode"));
      } else {
        setState("done");
        setTimeout(() => router.push("/ecoprobm"), 2200);
      }
    } catch {
      setError(tx("errNetwork"));
    } finally {
      setSubmitting(false);
    }
  };

  const invalidBody =
    invalidServerMessage != null
      ? translateAuthServerMessage(lang, invalidServerMessage, "invalidLinkBody")
      : error === "errNetwork"
        ? tx("errNetwork")
        : tx("invalidLinkBody");

  return (
    <EcoproBmAuthShell
      lang={lang}
      onLangChange={setLang}
      brand={{
        eyebrow: tx("authBrandEyebrow"),
        title: tx("authBrandTitle"),
        body: tx("authBrandBody"),
        bullets: [
          { icon: <Link2 className="w-5 h-5" />, title: tx("bulletAccessTitle"), text: tx("bulletAccessText") },
          { icon: <Fingerprint className="w-5 h-5" />, title: tx("bulletSecurityTitle"), text: tx("bulletSecurityText") },
        ],
      }}
      formWidth={440}
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
            <Loader2 className="w-8 h-8 text-[#3B93E0] animate-spin" />
            <p className="text-sm text-slate-400 font-medium">{tx("authVerifying")}</p>
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
            <div className="text-center mb-8">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-400/25 flex items-center justify-center mb-5">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-[26px] font-semibold text-white tracking-tight mb-2">{tx("accessDenied")}</h2>
              <p className="text-[15px] text-slate-400 leading-relaxed max-w-sm mx-auto">{invalidBody}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#F5A04A] mb-2.5">{tx("requestNewInvite")}</div>
              <div className="text-[14px] font-semibold text-white mb-1">Balog Sebastian Máté · {tx("supportRole")}</div>
              <a
                href="mailto:balogh.sebastian@pannonguard.hu"
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#8CC4F5] hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                balogh.sebastian@pannonguard.hu
              </a>
            </div>

            <a
              href={`mailto:balogh.sebastian@pannonguard.hu?subject=${encodeURIComponent(tx("mailSubjectNewLink"))}`}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1E73BE] to-[#2B84D2] hover:from-[#2B84D2] hover:to-[#3B93E0] text-white text-[14px] font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-[0_10px_26px_rgba(30,115,190,0.35)]"
            >
              <Mail className="w-4 h-4" />
              {tx("requestNewLink")}
            </a>
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center py-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(16,185,129,0.25)]"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h2 className="text-[22px] font-semibold text-white tracking-tight mb-1">{tx("authSuccess")}</h2>
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[#F5A04A] mb-5">{tx("portalNameShort")}</p>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/[0.06] border border-white/10 rounded-full">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8CC4F5]" />
              <p className="text-[13px] text-slate-300 font-medium">{tx("securing")}</p>
            </div>
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
            noValidate
          >
            <div className="mb-7">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E73BE]/30 to-[#0B3C7A]/30 border border-white/10 flex items-center justify-center mb-5">
                <ShieldCheck className="w-7 h-7 text-[#8CC4F5]" />
              </div>
              <h2 className="text-[27px] font-semibold text-white tracking-tight mb-2">{tx("twofactorTitle")}</h2>
              <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("twofactorBody")}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 mb-6 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#1E73BE]/20 border border-[#3B93E0]/25 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[#8CC4F5]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-0.5">{tx("signingInAs")}</div>
                <div className="text-[15px] font-semibold text-white truncate">{email || tx("loadingShort")}</div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E73BE]/20 border border-[#3B93E0]/25 text-[#8CC4F5] text-[11px] font-bold tracking-wide">
                <KeyRound className="w-3.5 h-3.5" /> 2FA
              </span>
            </div>

            <div className="mb-4">
              <label htmlFor="bm-magic-code" className="block text-[13px] font-semibold text-slate-300 mb-2 pl-0.5">
                {tx(useBackup ? "backupCode" : "authCode")}
              </label>
              <input
                id="bm-magic-code"
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
                placeholder={useBackup ? tx("backupPh") : "000000"}
                className="w-full h-[56px] px-4 bg-[#0B1D38] border border-white/10 rounded-xl text-[20px] text-center tracking-[0.45em] text-white placeholder:text-slate-600 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#1E73BE]/20 focus:border-[#3B93E0] transition-all"
              />
            </div>

            <div className="mb-5 flex items-center gap-2.5 pl-0.5">
              <input
                id="bm-magic-backup"
                type="checkbox"
                checked={useBackup}
                onChange={(e) => {
                  setUseBackup(e.target.checked);
                  setCode("");
                  if (error) setError(null);
                }}
                className="w-4 h-4 rounded border-white/30 bg-transparent accent-[#1E73BE]"
              />
              <label htmlFor="bm-magic-backup" className="text-[13px] font-medium text-slate-400">
                {tx("useBackup")}
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
                  role="alert"
                >
                  <div className="flex items-start gap-3 px-4 py-3.5 bg-red-500/[0.08] border border-red-400/25 rounded-xl">
                    <AlertTriangle className="w-[18px] h-[18px] text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[13px] text-red-200 font-medium leading-relaxed">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[54px] rounded-xl bg-gradient-to-r from-[#1E73BE] to-[#2B84D2] hover:from-[#2B84D2] hover:to-[#3B93E0] text-white text-[14px] font-semibold shadow-[0_12px_30px_rgba(30,115,190,0.4)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-[18px] h-[18px] animate-spin" />
                  {tx("processing")}
                </>
              ) : (
                <>
                  {tx("verifySignIn")}
                  <ArrowRight className="w-[18px] h-[18px]" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </EcoproBmAuthShell>
  );
}
