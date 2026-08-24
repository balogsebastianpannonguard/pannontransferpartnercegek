"use client";

import React, { useState, useEffect } from "react";
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

export default function CatlAuthPage() {
  const router = useRouter();
  const [rawToken, setRawToken] = useState("");
  const [state, setState] = useState<
    "loading" | "invalid" | "twofactor" | "done" | "redirecting"
  >("loading");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const res = await fetch("/api/catl-auth/magic-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: t }),
        });
        if (cancelled) return;
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          setState("invalid");
          setError(json?.message || "Érvénytelen vagy lejárt link.");
        } else if (json.needTwoFactor) {
          setEmail(json.email || "");
          setState("twofactor");
        } else if (json.redirect) {
          setState("done");
          setTimeout(() => router.push("/catl"), 2500);
        }
      } catch {
        if (!cancelled) {
          setState("invalid");
          setError("Hálózati hiba történt.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawToken, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.replace(/\s+/g, "").length < 4) {
      setError(useBackup ? "A biztonsági kód túl rövid." : "Az Authenticator kód 6 számjegyből áll.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/catl-auth/magic-login/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: rawToken,
          code,
          useBackup,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message || "Helytelen kód.");
      } else {
        setState("done");
        setTimeout(() => router.push("/catl"), 2500);
      }
    } catch {
      setError("Hálózati hiba történt.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAFBFC] text-zinc-900 flex flex-col">
      <div className="w-full border-b border-zinc-200/70 bg-white/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0047BA] to-[#0066E0] flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm tracking-tighter">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-zinc-900 leading-none">CATL Portál</span>
              <span className="text-[11px] text-zinc-500 mt-0.5 tracking-wide">Pannon Transfer · Egyedi bejelentkezés</span>
            </div>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-[13px] font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a főoldalra
          </a>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[440px]">
          <AnimatePresence mode="wait">
            {state === "loading" || state === "redirecting" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center py-20 gap-5"
              >
                <Loader2 className="w-8 h-8 text-[#0047BA] animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">
                  {state === "redirecting" ? "Átirányítás..." : "Belépési link ellenőrzése..."}
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
                  <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight mb-2">
                    Hozzáférés megtagadva
                  </h1>
                  <p className="text-[15px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
                    {error ||
                      "Ez az egyedi link nem létezik, lejárt, vagy már felhasználták. Kérjük, használd a legújabb emailben küldött linket, vagy kérj új meghívót."}
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-5 mb-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-2.5">
                    Új meghívó igénylése
                  </div>
                  <a
                    href="mailto:balog.sebastian@pannonguard.hu"
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#0047BA] hover:text-[#003A99] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    balog.sebastian@pannonguard.hu
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="mailto:balog.sebastian@pannonguard.hu?subject=CATL%20Port%C3%A1l%20-%20%C3%9Aj%20bel%C3%A9p%C3%A9si%20link%20k%C3%A9r%C3%A9se"
                    className="flex-1 h-12 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 text-[14px] font-semibold border border-zinc-200 transition-colors inline-flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  >
                    <Mail className="w-4 h-4" />
                    Új belépési link kérése
                  </a>
                  <a
                    href="/"
                    className="flex-1 h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[14px] font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Vissza a főoldalra
                  </a>
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
                  {/* Pannon Transfer side */}
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg mb-4">
                      <span className="text-white font-black text-xl tracking-tighter">PT</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase text-center w-24">Pannon Transfer</span>
                  </motion.div>

                  {/* Arrow Transition */}
                  <motion.div 
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    style={{ transformOrigin: "left center" }}
                    className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-zinc-200 via-[#0047BA]/50 to-[#0047BA] relative mt-[-24px]"
                  >
                    <motion.div 
                      initial={{ left: "0%", opacity: 0, scale: 0 }}
                      animate={{ left: "100%", opacity: 1, scale: 1 }}
                      transition={{ delay: 1.4, duration: 0.8, ease: "easeInOut" }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0047BA] shadow-[0_0_12px_4px_rgba(0,71,186,0.4)]"
                    />
                  </motion.div>

                  {/* CATL side */}
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0047BA] to-[#0066E0] flex items-center justify-center shadow-xl shadow-[#0047BA]/20 mb-4">
                      <span className="text-white font-black text-xl tracking-tighter">C</span>
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-[#0047BA] uppercase text-center w-24">CATL Portál</span>
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
                    <h1 className="text-[20px] font-bold text-zinc-900 tracking-tight">
                      Sikeres hitelesítés
                    </h1>
                  </div>
                  <div className="flex items-center gap-2.5 px-4 py-2 bg-zinc-100 rounded-full">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0047BA]" />
                    <p className="text-[13px] text-zinc-600 font-medium">
                      Biztonságos kapcsolat felépítése...
                    </p>
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
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0047BA]/[0.08] border border-[#0047BA]/10 flex items-center justify-center mb-5">
                    <ShieldCheck className="w-7 h-7 text-[#0047BA]" />
                  </div>
                  <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight mb-2">
                    Kétfaktoros hitelesítés
                  </h1>
                  <p className="text-[15px] text-zinc-500 leading-relaxed">
                    A fiókodhoz 2FA kötelező. Írd be az Authenticator alkalmazásod által generált
                    <strong className="font-semibold text-zinc-800"> 6 számjegyű kódot</strong>
                    , vagy használd a biztonsági mentett kódot.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-6 flex items-center gap-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="w-11 h-11 rounded-xl bg-[#0047BA]/[0.06] border border-[#0047BA]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#0047BA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                      Belépő fiók
                    </div>
                    <div className="text-[15px] font-semibold text-zinc-900 truncate">
                      {email || "Betöltés..."}
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0047BA]/[0.07] border border-[#0047BA]/10 text-[#0047BA] text-[11px] font-bold tracking-wide">
                    <KeyRound className="w-3.5 h-3.5" /> 2FA
                  </span>
                </div>

                <div className="mb-4">
                  <label className="block text-[13px] font-semibold text-zinc-800 mb-2 pl-0.5">
                    {useBackup ? "Biztonsági kód (Backup code)" : "Authenticator kód (6 szám)"}
                  </label>
                  <input
                    type="text"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => {
                      let v = e.target.value;
                      if (!useBackup) v = v.replace(/\D/g, "").slice(0, 6);
                      else v = v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
                      setCode(v);
                    }}
                    placeholder={useBackup ? "pl. A1B2-C3D4-E5" : "000000"}
                    className="w-full h-[52px] px-4 bg-white border border-zinc-200 rounded-xl text-[18px] text-center tracking-[0.45em] text-zinc-900 placeholder:text-zinc-400 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#0047BA]/20 focus:border-[#0047BA]/50 transition-all"
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
                    className="w-4 h-4 rounded border-zinc-300 text-[#0047BA] focus:ring-[#0047BA]/30"
                  />
                  <label htmlFor="2fa-backup" className="text-[13px] font-medium text-zinc-600">
                    Biztonsági kód használata (ha nincs hozzáférés az Authenticator apphoz)
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
                        <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-red-700 font-medium leading-relaxed">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-[54px] rounded-xl bg-[#0047BA] hover:bg-[#003F9F] text-white text-[14px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(0,71,186,0.18)] hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(0,71,186,0.24)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Feldolgozás...
                    </>
                  ) : (
                    <>
                      Ellenőrzés &amp; Belépés
                      <ArrowRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="w-full border-t border-zinc-200/70 bg-white/60 backdrop-blur-md mt-auto">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span>© {new Date().getFullYear()} Pannon Transfer · Minden jog fenntartva.</span>
          <span className="tracking-wider">CATL Dedikált Ügyfélportál · Kizárólagos linkalapú hozzáférés</span>
        </div>
      </div>
    </div>
  );
}
