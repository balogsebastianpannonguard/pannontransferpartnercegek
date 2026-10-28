"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  EcoBackdrop,
  EcoLogo,
  LangSwitch,
  PannonLogo,
  SUPPORT,
  ecoFont,
  ecoPrimaryBtn,
} from "../components/EcoUi";
import { makeT, splitBold, translateServerMessage, useEcoLang } from "../i18n";

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

export default function EcoproInnovationAuthPage() {
  const router = useRouter();
  const [lang, setLang] = useEcoLang();
  const t = useMemo(() => makeT(lang), [lang]);

  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<PageState>("loading");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<Parameters<typeof t>[0] | null>(null);
  const [errorRaw, setErrorRaw] = useState<string | null>(null);

  const error = errorKey ? t(errorKey) : errorRaw ? translateServerMessage(errorRaw, lang) : null;

  useEffect(() => {
    const tk = extractTokenFromUrl();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the sign-in token only exists in the browser URL
    setRawToken(tk);
    if (!tk) {
      setState("invalid");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ecoproinnovation-auth/magic-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tk }),
        });
        if (cancelled) return;
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setState("invalid");
          if (json?.message) {
            setErrorRaw(json.message);
          } else {
            setErrorKey("errLinkInvalid");
          }
        } else if (json.needTwoFactor) {
          setEmail(json.email || "");
          setState("twofactor");
        } else if (json.redirect) {
          setState("done");
          setTimeout(() => router.push("/ecoproinnovation"), 2500);
        }
      } catch {
        if (!cancelled) {
          setState("invalid");
          setErrorKey("errNetworkShort");
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
      setErrorKey(useBackup ? "errCodeShortBackup" : "errCodeShort6");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ecoproinnovation-auth/magic-login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, code, useBackup }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (json?.message) setErrorRaw(json.message);
        else setErrorKey("errWrongCode");
      } else {
        setState("done");
        setTimeout(() => router.push("/ecoproinnovation"), 2500);
      }
    } catch {
      setErrorKey("errNetworkShort");
    } finally {
      setSubmitting(false);
    }
  };

  const invalidBody = errorRaw ? translateServerMessage(errorRaw, lang) : errorKey ? t(errorKey) : t("linkInvalidBody");

  return (
    <div className="relative min-h-screen text-[#0B2540] flex flex-col" style={ecoFont(lang)}>
      <EcoBackdrop />

      <div className="relative z-10 w-full border-b border-[#DCEBF7] bg-white/75 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <PannonLogo className="h-6" />
            <span className="hidden sm:block h-6 w-px bg-[#DCEBF7]" />
            <EcoLogo className="h-5" />
            <span className="hidden md:block text-[11px] text-slate-400 tracking-wide ml-1">{t("authHeaderSub")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-[#0B3F8F] hover:bg-[#0E86D4]/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backHome")}
            </Link>
            <LangSwitch lang={lang} onChange={setLang} compact />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[460px] rounded-3xl border border-white bg-white/85 backdrop-blur-xl shadow-[0_24px_60px_rgba(14,134,212,0.12)] ring-1 ring-[#DCEBF7]/70 p-7 sm:p-9">
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
                <Loader2 className="w-8 h-8 text-[#0E86D4] animate-spin" />
                <p className="text-sm text-slate-500 font-medium">{t("verifyingLink")}</p>
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
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-7 h-7 text-rose-500" />
                  </div>
                  <h1 className="text-[26px] font-bold text-[#0B2540] tracking-tight mb-2">{t("accessDenied")}</h1>
                  <p className="text-[15px] text-slate-500 leading-relaxed max-w-sm mx-auto">{invalidBody}</p>
                </div>

                <div className="rounded-2xl border border-[#DCEBF7] bg-[#F6FAFE] p-5 mb-6">
                  <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-slate-500 mb-2.5">{t("requestInvite")}</div>
                  <a
                    href={`mailto:${SUPPORT.email}`}
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#0E86D4] hover:text-[#0A6BB0] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {SUPPORT.email}
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent(t("mailSubjectNewLink"))}`}
                    className="flex-1 h-12 rounded-xl bg-white hover:bg-[#F7FBFE] text-[#0B2540] text-[14px] font-semibold border border-[#DCEBF7] transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {t("requestNewLink")}
                  </a>
                  <Link href="/" className={`${ecoPrimaryBtn} flex-1 h-12 text-[14px]`}>
                    {t("backHome")}
                  </Link>
                </div>
              </motion.div>
            )}

            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.45 }}
                className="flex flex-col items-center justify-center py-4 w-full"
              >
                <div className="relative flex items-center justify-center w-full mb-10">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-16 w-24 rounded-2xl bg-white border border-[#DCEBF7] shadow-lg flex items-center justify-center mb-3">
                      <PannonLogo className="h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Pannon Transfer</span>
                  </motion.div>
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ transformOrigin: "left center" }}
                    className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-[#DCEBF7] via-[#00B4D8]/60 to-[#0E86D4] relative mt-[-22px]"
                  >
                    <motion.div
                      initial={{ left: "0%", opacity: 0, scale: 0 }}
                      animate={{ left: "100%", opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0E86D4] shadow-[0_0_12px_4px_rgba(14,134,212,0.4)]"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-16 w-24 rounded-2xl bg-white border border-[#0E86D4]/25 shadow-[0_10px_30px_rgba(14,134,212,0.25)] flex items-center justify-center mb-3">
                      <EcoLogo className="h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#0E86D4] uppercase">Ecopro Innovation</span>
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
                    <h1 className="text-[20px] font-bold text-[#0B2540] tracking-tight">{t("authSuccess")}</h1>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-[#0E86D4]/10 rounded-full">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E86D4]" />
                    <p className="text-[13px] text-[#0B3F8F] font-medium">{t("secureConnection")}</p>
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
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] flex items-center justify-center mb-5 shadow-[0_12px_28px_rgba(14,134,212,0.35)]">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-[26px] font-bold text-[#0B2540] tracking-tight mb-2">{t("tfaPageTitle")}</h1>
                  <p className="text-[15px] text-slate-500 leading-relaxed">
                    {splitBold(t("tfaPageLead")).map((p, i) =>
                      p.bold ? (
                        <strong key={i} className="font-semibold text-[#0B2540]">
                          {p.text}
                        </strong>
                      ) : (
                        <React.Fragment key={i}>{p.text}</React.Fragment>
                      ),
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#DCEBF7] bg-[#F6FAFE] p-4 mb-6 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#0E86D4]/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Mail className="w-5 h-5 text-[#0E86D4]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-0.5">{t("signingInAs")}</div>
                    <div className="text-[15px] font-semibold text-[#0B2540] truncate">{email || t("loading")}</div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0E86D4]/10 text-[#0B3F8F] text-[11px] font-bold tracking-wide">
                    <KeyRound className="w-3.5 h-3.5" /> 2FA
                  </span>
                </div>

                <div className="mb-4">
                  <label htmlFor="eco-auth-code" className="block text-[13px] font-semibold text-[#0B3F8F] mb-2 pl-0.5">
                    {useBackup ? t("tfaBackupLabel") : t("tfaCodeLabel")}
                  </label>
                  <input
                    id="eco-auth-code"
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
                    placeholder={useBackup ? t("tfaBackupPh") : "000000"}
                    className="w-full h-[56px] px-4 bg-white border border-[#DCEBF7] rounded-2xl text-[20px] text-center tracking-[0.45em] text-[#0B2540] placeholder:text-slate-300 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-[#0E86D4]/12 focus:border-[#0E86D4] transition-all"
                  />
                </div>

                <div className="mb-5 flex items-center gap-2.5 pl-0.5">
                  <input
                    id="eco-auth-backup"
                    type="checkbox"
                    checked={useBackup}
                    onChange={(e) => {
                      setUseBackup(e.target.checked);
                      setCode("");
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-[#0E86D4] focus:ring-[#0E86D4]/30"
                  />
                  <label htmlFor="eco-auth-backup" className="text-[13px] font-medium text-slate-600">
                    {t("tfaUseBackup")}
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
                      <div role="alert" className="flex items-start gap-3 px-4 py-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
                        <AlertTriangle className="w-[18px] h-[18px] text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-rose-700 font-medium leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={submitting} className={`${ecoPrimaryBtn} w-full h-[54px] text-[14px]`}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-[18px] h-[18px] animate-spin" />
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      {t("verifyAndSignIn")}
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 w-full border-t border-[#DCEBF7] bg-white/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 min-h-14 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px] text-slate-400 font-medium">
          <span>
            © {new Date().getFullYear()} Pannon Transfer. {t("rights")}
          </span>
          <span className="tracking-wider">{t("authFooter")}</span>
        </div>
      </div>
    </div>
  );
}
