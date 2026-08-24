"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  ArrowLeft,
  Copy,
  Check,
  KeyRound,
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
  const router = useRouter();

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
              "Ez a fiók már aktiválva lett. Továbblépéshez használd a CATL Portálra küldött egyedi bejelentkezési linket, vagy lépj kapcsolatba az ügyvezetővel új meghívóért."
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
        "mailto:balog.sebastian@pannonguard.hu?subject=CATL%20Port%C3%A1l%20-%20%C3%9Aj%20egyedi%20bel%C3%A9p%C3%A9si%20link%20k%C3%A9r%C3%A9se&body=K%C3%A9rek%20egy%20%C3%BAj%20egyedi%20bel%C3%A9p%C3%A9si%20linket%20a%20CATL%20Port%C3%A1lhoz%20ezen%20c%C3%ADmen:%20" +
        encodeURIComponent(email || "");
      return;
    }
    if (password.length < 8) {
      setError("A jelszónak minimum 8 karakter hosszúnak kell lennie.");
      return;
    }
    if (password !== confirm) {
      setError("A két jelszó nem egyezik meg.");
      return;
    }
    if (getStrength(password) < 3) {
      setError(
        "A jelszó túl gyenge. Használj kisbetűt, nagybetűt és számot a biztonságos hozzáféréshez."
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
        setError(json?.message || "Hiba történt a jelszó beállítása közben.");
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
      setError("Hálózati hiba történt. Kérjük, ellenőrizd az internetkapcsolatot.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && (clean.length !== 6 || !/^\d{6}$/.test(clean))) {
      setError("Az Authenticator kód 6 számjegyből áll.");
      return;
    }
    if (tfaUseBackup && clean.length < 6) {
      setError("A biztonsági kód formátuma: A1B2-C3D4-E5");
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
        setError(json?.message || "Helytelen kód.");
      } else {
        setState("done");
      }
    } catch {
      setError("Hálózati hiba történt.");
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
      "CATL Portál – Kétfaktoros hitelesítés – Biztonsági kódok\n\n" +
      `Fiók: ${email || "N/A"}\n` +
      `Dátum: ${new Date().toLocaleString("hu-HU")}\n\n` +
      "Használj egyet-egyet, ha az Authenticator alkalmazásodhoz nincs hozzáférés.\n" +
      "Minden kód csak egyszer használható.\n\n" +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      "Kérjük, tárold ezeket a kódokat biztonságos helyen.\n" +
      "© Pannon Transfer Kft. – CATL Dedikált Ügyfélportál";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CATL_Portal_Biztonsagi_Kodok_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText =
    ["Túl gyenge", "Gyenge", "Közepes", "Erős", "Nagyon erős", "Kiváló"][strength] ||
    "Túl gyenge";
  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-emerald-500",
    "bg-emerald-600",
  ][strength] || "bg-red-500";

  return (
    <div className="relative min-h-screen bg-[#FAFBFC] text-zinc-900 flex flex-col">
      <div className="w-full border-b border-zinc-200/70 bg-white/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0047BA] to-[#0066E0] flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm tracking-tighter">C</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-zinc-900 leading-none">
                CATL Portál
              </span>
              <span className="text-[11px] text-zinc-500 mt-0.5 tracking-wide">
                Pannon Transfer · Jelszó beállítása
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-[480px]">
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
                <Loader2 className="w-8 h-8 text-[#0047BA] animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">
                  Meghívó érvényességének ellenőrzése...
                </p>
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
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight mb-2">
                    Érvénytelen vagy lejárt link
                  </h1>
                  <p className="text-[15px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
                    Ez a hozzáférési link nem létezik, lejárt, vagy már felhasználták. Kérjük,
                    kérj új meghívót.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-5 mb-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-2.5">
                    Ügyvezető támogatás
                  </div>
                  <a
                    href="mailto:balog.sebastian@pannonguard.hu"
                    className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#0047BA] hover:text-[#003A99] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    balog.sebastian@pannonguard.hu
                  </a>
                </div>

                <p className="text-center text-[13px] text-zinc-500 font-medium leading-relaxed">
                  Ez az oldal most bezárható. Kérés esetén vedd fel a kapcsolatot az ügyfélszolgálattal.
                </p>
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0047BA]/[0.07] border border-[#0047BA]/10 text-[#0047BA] text-[11px] font-bold tracking-widest uppercase mb-4">
                    <KeyRound className="w-3.5 h-3.5" />
                    1. lépés · Jelszó
                  </div>
                  <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight mb-2">
                    Állítsd be a jelszavad
                  </h1>
                  <p className="text-[15px] text-zinc-500 leading-relaxed">
                    {alreadyActivated
                      ? "Ez a fiók már aktív. Új egyedi belépési link kéréséhez vedd fel a kapcsolatot az ügyfélszolgálattal az alább látható email címen."
                      : "Kérjük, állíts be egy erős jelszót, amelyet csak te ismeresz. " +
                        (require2FA
                          ? "A fiókodhoz további biztonsági lépésként KÉTFACTOROS hitelesítés is be lesz kapcsolva a következő lépésben."
                          : "Ezzel véglegesíted a CATL Portál hozzáférést.")}
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-6 flex items-center gap-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="w-11 h-11 rounded-xl bg-[#0047BA]/[0.08] border border-[#0047BA]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-[#0047BA]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-0.5">
                      Meghívott fiók
                    </div>
                    <div className="text-[15px] font-semibold text-zinc-900 truncate">
                      {email || "Kérés feldolgozása..."}
                    </div>
                  </div>
                  {require2FA && (
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0047BA]/[0.07] border border-[#0047BA]/10 text-[#0047BA] text-[11px] font-bold tracking-wide">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      2FA kötelező
                    </span>
                  )}
                </div>

                {!alreadyActivated && (
                  <>
                    <div className="mb-4">
                      <label className="block text-[13px] font-semibold text-zinc-800 mb-2 pl-0.5">
                        Új jelszó
                      </label>
                      <div className="relative">
                        <input
                          type={showPwd ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 8 karakter · kisbetű · nagybetű · szám"
                          className="w-full h-[52px] px-4 pr-12 bg-white border border-zinc-200 rounded-xl text-[15px] text-zinc-900 placeholder:text-zinc-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#0047BA]/20 focus:border-[#0047BA]/50 transition-all shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((p) => !p)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-700 transition-colors"
                          tabIndex={-1}
                        >
                          {showPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                      </div>

                      {password && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-zinc-100 grid grid-cols-5 gap-1 overflow-hidden">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`transition-all duration-300 rounded-full ${
                                  i < strength ? strengthColor : "bg-zinc-100"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 w-24 text-right shrink-0">
                            {strengthText}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-5">
                      <label className="block text-[13px] font-semibold text-zinc-800 mb-2 pl-0.5">
                        Jelszó megerősítése
                      </label>
                      <input
                        type={showPwd ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Írd be újra a fenti jelszót"
                        className="w-full h-[52px] px-4 bg-white border border-zinc-200 rounded-xl text-[15px] text-zinc-900 placeholder:text-zinc-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#0047BA]/20 focus:border-[#0047BA]/50 transition-all shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                        autoComplete="new-password"
                      />
                    </div>
                  </>
                )}

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

                {!alreadyActivated && (
                  <>
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
                      ) : require2FA ? (
                        <>
                          Jelszó beállítása &amp; Tovább a 2FA beállításhoz
                          <ArrowRight className="w-4.5 h-4.5" />
                        </>
                      ) : (
                        <>
                          Jelszó beállítása
                          <ArrowRight className="w-4.5 h-4.5" />
                        </>
                      )}
                    </button>

                    <p className="mt-7 text-center text-[12px] text-zinc-400 leading-relaxed">
                      A jelszó beállításával megerősíted a céges hozzáférési feltételek elfogadását.{" "}
                      <a
                        href="mailto:balog.sebastian@pannonguard.hu"
                        className="text-[#0047BA] font-semibold hover:underline"
                      >
                        Támogatás
                      </a>
                    </p>
                  </>
                )}

                {alreadyActivated && (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#0047BA]/[0.06] border border-[#0047BA]/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-[#0047BA]" />
                      </div>
                      <div className="flex-1 min-w-0 text-[13px] text-zinc-700 leading-relaxed">
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">
                          Új link igénylése
                        </div>
                        Vedd fel a kapcsolatot az ügyfélszolgálattal az egyedi belépési link
                        újraküldéséhez:{" "}
                        <a
                          href="mailto:balog.sebastian@pannonguard.hu?subject=CATL%20Port%C3%A1l%20-%20%C3%9Aj%20egyedi%20bel%C3%A9p%C3%A9si%20link%20k%C3%A9r%C3%A9se"
                          className="font-semibold text-[#0047BA] hover:underline"
                        >
                          balog.sebastian@pannonguard.hu
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
                <div className="mb-7">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0047BA]/[0.07] border border-[#0047BA]/10 text-[#0047BA] text-[11px] font-bold tracking-widest uppercase mb-4">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    2. lépés · Kétfaktoros hitelesítés
                  </div>
                  <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight mb-2">
                    Állítsd be a kétfaktoros hitelesítést
                  </h1>
                  <p className="text-[15px] text-zinc-500 leading-relaxed">
                    Ez a fiók <strong className="text-zinc-800 font-semibold">kizárólag 2FA-val</strong>{" "}
                    elérhető. Kövesd az alábbi lépéseket az Authenticator alkalmazás
                    (pl. Google Authenticator, 1Password, Authy) beállításához.
                  </p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-2xl p-5 mb-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] space-y-5">
                  <div>
                    <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-3">
                      1. lépés · Olvasd be a QR kódot
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="shrink-0 p-3 bg-white border border-zinc-200 rounded-2xl shadow-inner">
                        {tfaQr ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tfaQr}
                            alt="2FA QR kód"
                            width={196}
                            height={196}
                            style={{ borderRadius: 10, display: "block" }}
                          />
                        ) : (
                          <div className="w-[196px] h-[196px] rounded-2xl bg-zinc-100 animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <p className="text-[13px] leading-relaxed text-zinc-600 font-medium">
                          Nyisd meg a telefonodon az Authenticator alkalmazást és válaszd az{" "}
                          <strong className="text-zinc-900">„+”</strong>{" "}
                          ikont, majd olvasd be a bal oldali QR kódot, vagy másold be a manuális kulcsot.
                        </p>
                        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 mb-1.5">
                            Manuális kulcs (ha a QR nem olvasható)
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-[13px] font-mono font-bold text-zinc-900 break-all">
                              {tfaSecret || "—"}
                            </code>
                            <button
                              type="button"
                              onClick={() => copy(tfaSecret || "", "secret")}
                              className="shrink-0 w-8 h-8 rounded-lg hover:bg-zinc-200/70 flex items-center justify-center text-zinc-600 transition-colors"
                              title="Kulcs másolása"
                            >
                              {tfaCopied === "secret" ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-zinc-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                        2. lépés · Mentsd el a biztonsági kódokat
                      </div>
                      <button
                        type="button"
                        onClick={downloadBackupCodes}
                        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-colors ${
                          tfaBackupDownloaded
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70 border border-zinc-200"
                        }`}
                      >
                        {tfaBackupDownloaded ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {tfaBackupDownloaded ? "Letöltve" : "Letöltés (.txt)"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {tfaBackupCodes?.map((c, i) => (
                        <div
                          key={c}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200"
                        >
                          <code className="font-mono text-[12.5px] font-bold text-zinc-800 tracking-wide">
                            {c}
                          </code>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            #{String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[12px] text-zinc-500 leading-relaxed font-medium">
                      💡 <strong className="text-zinc-700">Fontos:</strong>{" "}
                      Tárold a fenti 8 kódot biztonságos helyen. Ha elveszted a telefonod, vagy az
                      Authenticator alkalmazást, ezekkel a kódokkal tudsz helyettesíteni a belépést.
                      Minden kód csak egyszer használható.
                    </p>
                  </div>

                  <div className="pt-5 border-t border-zinc-100">
                    <div className="text-[12px] font-bold uppercase tracking-[0.16em] text-zinc-500 mb-3">
                      3. lépés · Add meg az első 6 számjegyű kódot
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] font-semibold text-zinc-800 mb-2 pl-0.5">
                        {tfaUseBackup ? "Biztonsági kód (pl. A1B2-C3D4-E5)" : "Authenticator 6 számjegyes kód"}
                      </label>
                      <input
                        type="text"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        value={tfaCode}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!tfaUseBackup) v = v.replace(/\D/g, "").slice(0, 6);
                          else
                            v = v
                              .toUpperCase()
                              .replace(/[^A-Z0-9-]/g, "")
                              .slice(0, 16);
                          setTfaCode(v);
                        }}
                        placeholder={tfaUseBackup ? "A1B2-C3D4-E5" : "000000"}
                        className="w-full h-[52px] px-4 bg-white border border-zinc-200 rounded-xl text-center tracking-[0.45em] font-mono font-bold text-[18px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0047BA]/20 focus:border-[#0047BA]/50 transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2.5 pl-0.5">
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
                        Biztonsági kódot használok (nincs hozzáférés az Authenticator-hoz most)
                      </label>
                    </div>
                  </div>
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
                      2FA aktiválása &amp; Befejezés
                      <ArrowRight className="w-4.5 h-4.5" />
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
                  className="w-20 h-20 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(16,185,129,0.12)]"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </motion.div>
                <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight mb-2">
                  Hozzáférés beállítva ✔
                </h1>
                <p className="text-[15px] text-zinc-500 leading-relaxed max-w-md mb-8">
                  Köszönjük! A CATL Portál fiókod már be van állítva.{" "}
                  <strong className="font-semibold text-zinc-800">
                    Hamarosan kapsz egy emailt a(z) {email || "megadott"} címre, amely tartalmazza az egyedi,
                    személyre szabott belépési linket.
                  </strong>
                </p>

                <div className="w-full bg-white border border-zinc-200 rounded-2xl p-5 mb-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <div className="flex items-start gap-3.5 text-left">
                    <div className="shrink-0 w-11 h-11 rounded-xl bg-[#0047BA]/[0.08] border border-[#0047BA]/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#0047BA]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13px] font-bold text-zinc-900 mb-1">
                        Ellenőrizd postaládád (és a spam mappát is!)
                      </div>
                      <p className="text-[13px] text-zinc-600 leading-relaxed">
                        A belépéshez <strong>kizárólag az emailben küldött egyedi linket</strong>{" "}
                        használd — a publikus /catl oldalon nincs bejelentkező űrlap.
                        {require2FA && (
                          <>
                            {" "}
                            A linkre kattintva az emailben az Authenticator alkalmazás által generált 6
                            számjegyű kódot is meg kell adnod.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-2 text-center text-[13px] text-zinc-500 font-medium leading-relaxed">
                  Ez az oldal most bezárható. A belépéshez használd az emailben érkező egyedi személyes linket.
                  <br />
                  {email && (
                    <>
                      Kérés esetén vedd fel a kapcsolatot az ügyfélszolgálattal:{" "}
                      <a
                        href={
                          "mailto:balog.sebastian@pannonguard.hu?subject=CATL%20Port%C3%A1l%20-%20Welcome%20email%20nem%20%C3%A9rkezett%20meg&body=K%C3%A9rek%20egy%20%C3%BAj%20egyedi%20bel%C3%A9p%C3%A9si%20linket%20a%20CATL%20Port%C3%A1lhoz%20ezen%20c%C3%ADmen:%20" +
                          encodeURIComponent(email)
                        }
                        className="font-semibold text-[#0047BA] hover:underline"
                      >
                        balog.sebastian@pannonguard.hu
                      </a>
                    </>
                  )}
                </p>
              </motion.div>
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
