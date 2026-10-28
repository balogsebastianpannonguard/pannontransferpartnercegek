"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";
import { useMxLang } from "../lang";
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

export default function SchaefflerMotionAuthPage() {
  const router = useRouter();
  const [lang, setLang] = useMxLang();
  const tx = makeTx(lang);

  const tokenRef = useRef("");
  const [state, setState] = useState<"loading" | "invalid" | "twofactor" | "done">("loading");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorRaw, setErrorRaw] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const error = errorKey ? tx(errorKey) : errorRaw ? translateAuthMessage(lang, errorRaw, "authLinkInvalid") : null;

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
        const res = await fetch("/api/schaefflermotion-auth/magic-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        if (cancelled) return;
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setState("invalid");
          if (json?.message) setErrorRaw(json.message);
          else setErrorKey("authLinkInvalid");
        } else if (json.needTwoFactor) {
          setEmail(json.email || "");
          setState("twofactor");
        } else if (json.redirect) {
          setState("done");
          setTimeout(() => router.push("/schaefflermotion"), 2500);
        }
      } catch {
        if (!cancelled) {
          setState("invalid");
          setErrorKey("networkError");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRaw(null);
    setErrorKey(null);
    if (code.replace(/\s+/g, "").length < 4) {
      setErrorKey(useBackup ? "authBackupShort" : "authCodeSixDigits");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/schaefflermotion-auth/magic-login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenRef.current, code, useBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (json?.message) setErrorRaw(json.message);
        else setErrorKey("authIncorrect");
      } else {
        setState("done");
        setTimeout(() => router.push("/schaefflermotion"), 2500);
      }
    } catch {
      setErrorKey("networkError");
    } finally {
      setSubmitting(false);
    }
  };

  const label = "block font-mono text-[10.5px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-2";

  return (
    <div className="relative min-h-screen text-slate-300 flex flex-col bg-[#0B100E] overflow-x-hidden">
      <MxBackdrop />
      <div className="relative z-10 h-[3px] w-full bg-[linear-gradient(90deg,#00893D,#3DDC84_55%,transparent)]" />
      <header className="relative z-10 max-w-[1240px] w-full mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PannonChip className="h-9" />
          <span className="w-px h-6 bg-white/15" aria-hidden />
          <SchaefflerChip className="h-9" />
          <span className="hidden md:block font-mono text-[11px] tracking-[0.2em] uppercase text-[#3DDC84] ml-2">
            {tx("authPersonalTag")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-[5px] text-[12px] font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {tx("backHome")}
          </Link>
          <MxLangSwitch lang={lang} onChange={setLang} />
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="relative w-full max-w-[460px] rounded-[10px] border border-white/10 bg-[#111815]/90 backdrop-blur p-7 sm:p-9 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          <span className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#3DDC84] to-transparent" />
          <AnimatePresence mode="wait">
            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex flex-col items-center py-14 gap-5"
              >
                <Loader2 className="w-8 h-8 text-[#3DDC84] animate-spin" />
                <p className="font-mono text-[12px] tracking-wide text-slate-400">{tx("authVerifyingLink")}</p>
              </motion.div>
            )}

            {state === "invalid" && (
              <motion.div key="invalid" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="flex flex-col">
                <div className="mb-7">
                  <div className="w-12 h-12 rounded-[6px] bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                  <h1 className="text-[26px] font-semibold text-white tracking-tight mb-2">{tx("authDeniedTitle")}</h1>
                  <p className="text-[14.5px] text-slate-400 leading-relaxed">{error || tx("authDeniedText")}</p>
                </div>

                <div className="rounded-[6px] border border-white/10 bg-white/[0.02] p-5 mb-5">
                  <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#3DDC84] mb-3">{tx("authRequestNew")}</div>
                  <div className="text-[14px] font-semibold text-white mb-2">{SUPPORT.name} · {tx("supportRole")}</div>
                  <a href={`mailto:${SUPPORT.email}`} className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#3DDC84] hover:underline">
                    <Mail className="w-4 h-4" />
                    {SUPPORT.email}
                  </a>
                </div>

                <a
                  href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(tx("authSubjectNew"))}`}
                  className="h-12 rounded-[6px] bg-[#00893D] hover:bg-[#00A04A] text-white text-[12.5px] font-bold tracking-[0.14em] uppercase transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {tx("authRequestLink")}
                </a>
              </motion.div>
            )}

            {state === "twofactor" && (
              <motion.form key="2fa" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} onSubmit={submit} className="flex flex-col">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#00893D]/15 border border-[#00893D]/40 text-[#3DDC84] font-mono text-[10.5px] font-bold tracking-[0.18em] uppercase mb-4">
                    <KeyRound className="w-3.5 h-3.5" />
                    2FA
                  </div>
                  <h1 className="text-[26px] font-semibold text-white tracking-tight mb-2">{tx("authTwoFactorTitle")}</h1>
                  <p className="text-[14.5px] text-slate-400 leading-relaxed">{tx("authTwoFactorText")}</p>
                </div>

                {email && (
                  <div className="rounded-[6px] border border-white/10 bg-white/[0.02] p-4 mb-5 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-[5px] bg-[#00893D]/15 border border-[#00893D]/40 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[#3DDC84]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-0.5">{tx("signingInAs")}</div>
                      <div className="text-[14.5px] font-semibold text-white truncate">{email}</div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="mx-auth-code" className={label}>{useBackup ? tx("backupCode") : tx("authCode")}</label>
                  <input
                    id="mx-auth-code"
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
                    className="w-full h-[54px] px-4 bg-[#0E1511] border border-white/12 rounded-[6px] text-[20px] text-center tracking-[0.45em] text-white placeholder:text-slate-700 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#00893D]/20 focus:border-[#3DDC84]/70 transition-all"
                  />
                </div>

                <label htmlFor="mx-auth-backup" className="mb-5 flex items-center gap-2.5 cursor-pointer">
                  <input
                    id="mx-auth-backup"
                    type="checkbox"
                    checked={useBackup}
                    onChange={(e) => {
                      setUseBackup(e.target.checked);
                      setCode("");
                      setErrorKey(null);
                      setErrorRaw(null);
                    }}
                    className="w-4 h-4 rounded-[3px] accent-[#00893D]"
                  />
                  <span className="text-[13px] font-medium text-slate-400">{tx("useBackup")}</span>
                </label>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-5" role="alert">
                      <div className="flex items-start gap-3 px-4 py-3.5 bg-red-500/[0.08] border border-red-500/30 rounded-[6px]">
                        <AlertTriangle className="w-[18px] h-[18px] text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-red-300 font-medium leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-[52px] rounded-[6px] bg-[#00893D] hover:bg-[#00A04A] text-white text-[13px] font-bold tracking-[0.14em] uppercase shadow-[0_10px_30px_rgba(0,137,61,0.35)] transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
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

            {state === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-[8px] bg-[#00893D]/15 border border-[#00893D]/40 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-9 h-9 text-[#3DDC84]" />
                </div>
                <h1 className="text-[24px] font-semibold text-white tracking-tight mb-2">{tx("authDoneTitle")}</h1>
                <div className="flex items-center gap-2.5 px-4 py-2 border border-white/10 rounded-[5px] bg-white/[0.03] mt-3">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3DDC84]" />
                  <p className="font-mono text-[12px] text-slate-400">{tx("authDoneText")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative z-10 max-w-[1240px] w-full mx-auto px-5 sm:px-8 py-5 border-t border-white/[0.06] text-[11.5px] text-slate-500 text-center sm:text-left">
        © {new Date().getFullYear()} Pannon Transfer. {tx("rights")}
      </footer>
    </div>
  );
}
