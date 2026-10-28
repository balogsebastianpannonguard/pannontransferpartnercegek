"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, KeyRound, Mail, ArrowLeft } from "lucide-react";
import { translateSdAuthMessage, useSdLang } from "../i18n";
import { SD_PATTERN, SD_SUPPORT, SdLangSwitch, SdLogos, sdCard, sdPrimaryBtn } from "../ui";

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

export default function SchaefflerDebrecenAuthPage() {
  const router = useRouter();
  const { lang, setLang, tx } = useSdLang();
  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<"loading" | "invalid" | "twofactor" | "done">("loading");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const t = extractTokenFromUrl();
    if (!t) {
      const id = window.setTimeout(() => setState("invalid"), 0);
      return () => window.clearTimeout(id);
    }
    const idToken = window.setTimeout(() => setRawToken(t), 0);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/schaefflerdebrecen-auth/magic-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        if (cancelled) return;
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setState("invalid");
          setServerError(json?.message || "");
        } else if (json.needTwoFactor) {
          setEmail(json.email || "");
          setState("twofactor");
        } else if (json.redirect) {
          setState("done");
          setTimeout(() => router.push("/schaefflerdebrecen"), 2500);
        }
      } catch {
        if (!cancelled) {
          setState("invalid");
          setServerError("__network__");
        }
      }
    })();
    return () => {
      cancelled = true;
      window.clearTimeout(idToken);
    };
  }, [router]);

  const invalidMessage = () => {
    if (serverError === "__network__") return tx("networkError");
    if (!serverError) return tx("linkInvalidBody");
    return translateSdAuthMessage(lang, serverError, tx("linkInvalidShort"));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.replace(/\s+/g, "").length < 4) {
      setError(useBackup ? tx("tfaEnterBackup") : tx("tfaEnter6"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/schaefflerdebrecen-auth/magic-login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, code, useBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(translateSdAuthMessage(lang, json?.message, tx("errIncorrectCode")));
      } else {
        setState("done");
        setTimeout(() => router.push("/schaefflerdebrecen"), 2500);
      }
    } catch {
      setError(tx("networkError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F3F6F4] text-[#0E1A14] flex flex-col">
      <div className="w-full bg-[#0B3D2A] relative">
        <div className={`absolute inset-0 ${SD_PATTERN}`} aria-hidden />
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-[#00893D]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-6 h-[76px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <SdLogos onDark />
            <span className="hidden md:block text-[11px] text-white/70 tracking-wide ml-1 truncate">{tx("authBarTag")}</span>
          </div>
          <div className="flex items-center gap-3">
            <SdLangSwitch lang={lang} onChange={setLang} label={tx("language")} onDark />
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {tx("backToHome")}
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[460px]">
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
                <Loader2 className="w-8 h-8 text-[#00893D] animate-spin" />
                <p className="text-sm text-[#5C6B63] font-medium">{tx("verifyingLink")}</p>
              </motion.div>
            )}

            {state === "invalid" && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className={`${sdCard} p-7 sm:p-9 flex flex-col`}
              >
                <div className="text-center mb-7">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <h1 className="text-[25px] font-bold text-[#0E1A14] tracking-tight mb-2">{tx("accessDenied")}</h1>
                  <p className="text-[14.5px] text-[#5C6B63] leading-relaxed max-w-sm mx-auto">{invalidMessage()}</p>
                </div>

                <div className="bg-[#F6F9F7] border border-[#E1E7E3] rounded-xl p-5 mb-5">
                  <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#7B8A82] mb-2.5">{tx("requestNewInvite")}</div>
                  <a
                    href={`mailto:${SD_SUPPORT.email}`}
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#00893D] hover:text-[#007335] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {SD_SUPPORT.email}
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`mailto:${SD_SUPPORT.email}?subject=Schaeffler%20Debrecen%20Portal%20-%20New%20sign-in%20link`}
                    className="flex-1 h-12 rounded-xl bg-white hover:bg-[#F3F6F4] text-[#0E1A14] text-[14px] font-semibold border border-[#DCE3DF] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {tx("requestNewLink")}
                  </a>
                  <Link
                    href="/"
                    className="flex-1 h-12 rounded-xl bg-[#0B3D2A] hover:bg-[#082C1F] text-white text-[14px] font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {tx("backToHome")}
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
                className="flex flex-col items-center justify-center py-8 w-full"
              >
                <div className="relative flex items-center justify-center w-full max-w-sm mb-12 px-4">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#0B3D2A] flex items-center justify-center shadow-lg mb-4">
                      <span className="text-white font-black text-xl tracking-tighter">PT</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#7B8A82] uppercase text-center w-24">Pannon Transfer</span>
                  </motion.div>
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ transformOrigin: "left center" }}
                    className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-[#DCE3DF] via-[#00893D]/50 to-[#00893D] relative mt-[-24px]"
                  >
                    <motion.div
                      initial={{ left: "0%", opacity: 0, scale: 0 }}
                      animate={{ left: "100%", opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#00893D] shadow-[0_0_12px_4px_rgba(0,137,61,0.35)]"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#00893D] flex items-center justify-center shadow-xl shadow-[#00893D]/20 mb-4">
                      <span className="text-white font-black text-xl tracking-tighter">S</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#00893D] uppercase text-center w-24">
                      Schaeffler {tx("portalWord")}
                    </span>
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
                    <h1 className="text-[20px] font-bold text-[#0E1A14] tracking-tight">{tx("authSuccess")}</h1>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-[#E1E7E3] rounded-full">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#00893D]" />
                    <p className="text-[13px] text-[#5C6B63] font-medium">{tx("authEstablishing")}</p>
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
                className={`${sdCard} p-7 sm:p-9 flex flex-col`}
              >
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E7F4EC] border border-[#CBE6D6] flex items-center justify-center mb-5">
                    <ShieldCheck className="w-6 h-6 text-[#00893D]" />
                  </div>
                  <h1 className="text-[25px] font-bold text-[#0E1A14] tracking-tight mb-2">{tx("tfaTitle")}</h1>
                  <p className="text-[14.5px] text-[#5C6B63] leading-relaxed">
                    <strong className="font-semibold text-[#0E1A14]">{tx("tfaRequiredLead")}</strong> {tx("tfaIntroA")}{" "}
                    <strong className="font-semibold text-[#0E1A14]">{tx("tfaIntroB")}</strong> {tx("tfaIntroC")}
                  </p>
                </div>

                <div className="bg-[#F6F9F7] border border-[#E1E7E3] rounded-xl p-4 mb-6 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#CBE6D6] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#00893D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7B8A82] mb-0.5">{tx("signingInAs")}</div>
                    <div className="text-[15px] font-semibold text-[#0E1A14] truncate">{email || tx("loading")}</div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E7F4EC] border border-[#CBE6D6] text-[#007335] text-[11px] font-bold tracking-wide">
                    <KeyRound className="w-3.5 h-3.5" /> 2FA
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-semibold text-[#31413A] mb-2 pl-0.5">
                    {useBackup ? tx("tfaBackupLabel") : tx("tfaCodeLabel")}
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
                    placeholder={useBackup ? tx("tfaBackupPh") : "000000"}
                    className="w-full h-[54px] px-4 bg-white border border-[#DCE3DF] rounded-xl text-[18px] text-center tracking-[0.45em] text-[#0E1A14] placeholder:text-[#9AA7A0] font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#00893D]/10 focus:border-[#00893D]/70 transition-all"
                  />
                </div>

                <div className="mb-5 flex items-center gap-2.5 pl-0.5">
                  <input
                    id="sd-2fa-backup"
                    type="checkbox"
                    checked={useBackup}
                    onChange={(e) => {
                      setUseBackup(e.target.checked);
                      setCode("");
                    }}
                    className="w-4 h-4 rounded border-[#C5CFC9] text-[#00893D] focus:ring-[#00893D]/30"
                  />
                  <label htmlFor="sd-2fa-backup" className="text-[13px] font-medium text-[#5C6B63]">
                    {tx("tfaUseBackup")}
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
                      <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl">
                        <AlertTriangle className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-red-700 font-medium leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={submitting} className={sdPrimaryBtn}>
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
        </div>
      </div>

      <div className="w-full border-t border-[#E1E7E3] bg-white/70 backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-[11px] text-[#7B8A82] font-medium">
          <span>
            © {new Date().getFullYear()} Pannon Transfer. {tx("rights")}
          </span>
          <span className="tracking-wider hidden sm:inline">{tx("footerPersonalLink")}</span>
        </div>
      </div>
    </div>
  );
}
