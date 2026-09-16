"use client";

import React, { useEffect, useState } from "react";
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

function PasswordRule({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-[12px] font-medium transition-colors ${
        passed
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-white/60 bg-white/80 text-zinc-500"
      }`}
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full ${
          passed ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-500"
        }`}
      >
        <Check className="h-3.5 w-3.5" />
      </div>
      <span>{label}</span>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5D000]/15 text-[#9B7B00]">
        {icon}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">{label}</div>
      <div className="mt-1 text-[15px] font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

export default function NiSetupPasswordPage() {
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

  const [tfaQr, setTfaQr] = useState<string | null>(null);
  const [tfaSecret, setTfaSecret] = useState<string | null>(null);
  const [tfaBackupCodes, setTfaBackupCodes] = useState<string[] | null>(null);
  const [tfaCode, setTfaCode] = useState("");
  const [tfaUseBackup, setTfaUseBackup] = useState(false);
  const [tfaCopied, setTfaCopied] = useState<string | null>(null);
  const [tfaBackupDownloaded, setTfaBackupDownloaded] = useState(false);

  useEffect(() => {
    const t = extractTokenFromUrl();
    const frame = window.requestAnimationFrame(() => {
      setRawToken(t);
      if (!t) {
        setState("invalid");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!rawToken) return;
    let cancelled = false;
    (async () => {
      setState("loading");
      try {
        const res = await fetch("/api/ni-auth/validate-invite", {
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
              "Ez a fiók már aktiválva lett. Továbblépéshez használd a NI Portálra küldött egyedi bejelentkezési linket, vagy lépj kapcsolatba az ügyvezetővel új meghívóért."
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

  const submitForm = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (alreadyActivated) {
      window.location.href =
        "mailto:balog.sebastian@pannonguard.hu?subject=NI%20Port%C3%A1l%20-%20%C3%9Aj%20egyedi%20bel%C3%A9p%C3%A9si%20link%20k%C3%A9r%C3%A9se&body=K%C3%A9rek%20egy%20%C3%BAj%20egyedi%20bel%C3%A9p%C3%A9si%20linket%20a%20NI%20Port%C3%A1lhoz%20ezen%20c%C3%ADmen:%20" +
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
      const res = await fetch("/api/ni-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(json?.message || "Hiba történt a jelszó beállítása közben.");
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
      setError("Hálózati hiba történt. Kérjük, ellenőrizd az internetkapcsolatot.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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
      const res = await fetch("/api/ni-auth/verify-2fa-setup", {
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
      "NI Portál – Kétfaktoros hitelesítés – Biztonsági kódok\n\n" +
      `Fiók: ${email || "N/A"}\n` +
      `Dátum: ${new Date().toLocaleString("hu-HU")}\n\n` +
      "Használj egyet-egyet, ha az Authenticator alkalmazásodhoz nincs hozzáférés.\n" +
      "Minden kód csak egyszer használható.\n\n" +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      "Kérjük, tárold ezeket a kódokat biztonságos helyen.\n" +
      "© Pannon Transfer Kft. – NI Dedikált Ügyfélportál";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NI_Portal_Biztonsagi_Kodok_${email || "user"}.txt`;
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
    "from-red-500 to-red-400",
    "from-orange-500 to-orange-400",
    "from-amber-500 to-amber-400",
    "from-lime-500 to-lime-400",
    "from-emerald-500 to-emerald-400",
    "from-emerald-600 to-teal-500",
  ][strength] || "from-red-500 to-red-400";

  const passwordRules = [
    { label: "Minimum 8 karakter", passed: password.length >= 8 },
    { label: "Legalább 1 nagybetű", passed: /[A-Z]/.test(password) },
    { label: "Legalább 1 kisbetű", passed: /[a-z]/.test(password) },
    { label: "Legalább 1 szám", passed: /[0-9]/.test(password) },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fffef7_0%,#f7f7f5_35%,#f4f5f7_100%)] text-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-6%] h-[28rem] w-[28rem] rounded-full bg-[#F5D000]/18 blur-[130px]" />
        <div className="absolute right-[-8%] top-[14%] h-[26rem] w-[26rem] rounded-full bg-[#0B1F47]/10 blur-[140px]" />
        <div className="absolute bottom-[-16%] left-[24%] h-[24rem] w-[24rem] rounded-full bg-white/80 blur-[110px]" />
      </div>

      <div className="relative z-10 border-b border-white/60 bg-white/65 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#F5D000,#D9B800)] shadow-[0_18px_34px_rgba(245,208,0,0.28)]">
              <span className="text-sm font-black uppercase tracking-tight text-[#2B2410]">ni</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold leading-none text-zinc-950">NI Portál</span>
              <span className="mt-1 text-[11px] tracking-[0.14em] text-zinc-500 uppercase">
                Pannon Transfer · Hozzáférés aktiválása
              </span>
            </div>
          </div>
          <div className="hidden rounded-full border border-zinc-200/80 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:inline-flex">
            Dedikált partnerhozzáférés
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.1fr_560px]">
        <div className="hidden lg:block">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#F5D000]/30 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9B7B00] shadow-[0_16px_34px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4" />
                NI Partner Portál Hozzáférés
              </div>
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-zinc-950">
                Biztonságos beléptetés az NI dedikált partnerportáljára.
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-8 text-zinc-600">
                Kérjük, kövesse a képernyőn látható lépéseket fiókja aktiválásához. A rendszer a legmagasabb biztonsági szabványok szerint védi a vállalati foglalásokat és az egyedi árstruktúrákat.
              </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoTile
                icon={<Lock className="h-5 w-5" />}
                label="Hozzáférés"
                value="Egyedi, személyes aktiválási folyamat"
              />
              <InfoTile
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Biztonság"
                value={require2FA ? "2FA kötelező a következő lépésben" : "Erős jelszavas védelem"}
              />
              <InfoTile
                icon={<Clock3 className="h-5 w-5" />}
                label="Belépés"
                value="Emailben küldött egyedi linkkel"
              />
              <InfoTile
                icon={<Building2 className="h-5 w-5" />}
                label="Portal"
                value="NI dedikált árstruktúra és foglalások"
              />
            </div>

            <div className="mt-6 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F47] text-white shadow-[0_16px_30px_rgba(11,31,71,0.22)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      Aktiválási tudnivalók
                    </div>
                    <div className="mt-1 text-lg font-semibold text-zinc-950">
                      Zárt rendszerű hozzáférés.
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 text-[14px] leading-7 text-zinc-600">
                  <div className="rounded-2xl border border-zinc-200/70 bg-[#fffdf1] px-4 py-3">
                    Aktiválja fiókját egy erős jelszó megadásával az űrlapon.
                  </div>
                  <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-3">
                    A rendszer minden foglalást és árstruktúrát szigorúan elkülönítve, biztonságosan kezel.
                  </div>
                  <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-3">
                    A sikeres aktiválást követően a végleges belépési linket emailben küldjük el Önnek.
                  </div>
                </div>
              </div>
          </div>
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            {state === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-[34px] border border-white/70 bg-white/82 p-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl"
              >
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#F5D000]/14 text-[#9B7B00] shadow-[0_20px_40px_rgba(245,208,0,0.18)]">
                  <Loader2 className="h-9 w-9 animate-spin" />
                </div>
                <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-zinc-950">
                  Hozzáférés előkészítése
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-zinc-500">
                  Ellenőrizzük a meghívó érvényességét és betöltjük a személyes aktiválási adatokat.
                </p>
              </motion.div>
            )}

            {state === "invalid" && (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-[34px] border border-white/70 bg-white/84 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-8"
              >
                <div className="rounded-[28px] border border-red-100 bg-[linear-gradient(180deg,#fff9f8_0%,#ffffff_100%)] p-6 text-center">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] bg-red-50 text-red-500 shadow-[0_18px_40px_rgba(239,68,68,0.14)]">
                    <AlertTriangle className="h-10 w-10" />
                  </div>
                  <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-zinc-950">
                    Érvénytelen vagy lejárt link
                  </h1>
                  <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-zinc-500">
                    Ez a hozzáférési link nem létezik, lejárt, vagy már felhasználták. Kérj új meghívót, és a rendszer új, egyedi aktiválási linket küld.
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoTile
                    icon={<Mail className="h-5 w-5" />}
                    label="Kapcsolat"
                    value="balog.sebastian@pannonguard.hu"
                  />
                  <InfoTile
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label="Állapot"
                    value="Új meghívó szükséges"
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="mailto:balog.sebastian@pannonguard.hu?subject=NI%20Port%C3%A1l%20-%20%C3%9Aj%20egyedi%20bel%C3%A9p%C3%A9si%20link%20k%C3%A9r%C3%A9se"
                    className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0B1F47] px-5 text-[14px] font-semibold text-white shadow-[0_18px_40px_rgba(11,31,71,0.20)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <Mail className="h-4.5 w-4.5" />
                    Új link kérése emailben
                  </a>
                  <a
                    href="mailto:balog.sebastian@pannonguard.hu"
                    className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 text-[14px] font-semibold text-zinc-900 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    Ügyfélszolgálat elérése
                  </a>
                </div>
              </motion.div>
            )}

            {state === "form" && (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                onSubmit={submitForm}
                className="rounded-[34px] border border-white/70 bg-white/84 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-7"
              >
                <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(245,208,0,0.20),rgba(255,255,255,0.95))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9B7B00]">
                    <KeyRound className="h-4 w-4" />
                    1. lépés · Jelszó beállítása
                  </div>
                  <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-zinc-950">
                    Aktiváld a NI portálhozzáférést
                  </h1>
                  <p className="mt-3 max-w-lg text-[15px] leading-7 text-zinc-600">
                    {alreadyActivated
                      ? "Ez a fiók már aktív. Új egyedi belépési link kéréséhez vedd fel a kapcsolatot az ügyfélszolgálattal az alábbi elérhetőségen."
                      : "Állíts be egy erős, kizárólag általad ismert jelszót. A működés változatlan: sikeres aktiválás után a rendszer emailben küldi az egyedi belépési linket."}
                  </p>
                </div>

                <div className="mt-5 rounded-[28px] border border-zinc-200/70 bg-white/92 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5D000]/14 text-[#9B7B00]">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                        Meghívott fiók
                      </div>
                      <div className="mt-1 truncate text-[16px] font-semibold text-zinc-950">
                        {email || "Kérés feldolgozása..."}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold text-zinc-600">
                        <Clock3 className="h-3.5 w-3.5" />
                        Egyszeri aktiválás
                      </span>
                      {require2FA && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F5D000]/35 bg-[#F5D000]/10 px-3 py-1.5 text-[11px] font-semibold text-[#8A6B00]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          2FA kötelező
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!alreadyActivated && (
                  <>
                    <div className="mt-5 rounded-[28px] border border-zinc-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,250,251,0.96))] p-5">
                      <div className="mb-4">
                        <label className="mb-2 block pl-0.5 text-[13px] font-semibold text-zinc-800">
                          Új jelszó
                        </label>
                        <div className="relative">
                          <input
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 8 karakter · kisbetű · nagybetű · szám"
                            className="h-[58px] w-full rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all focus:border-[#F5D000]/50 focus:outline-none focus:ring-2 focus:ring-[#F5D000]/20"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((p) => !p)}
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                            tabIndex={-1}
                          >
                            {showPwd ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                          </button>
                        </div>
                      </div>

                      {password && (
                        <div className="mb-4 rounded-[24px] border border-zinc-200/70 bg-white p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                                Jelszó erőssége
                              </div>
                              <div className="mt-1 text-[14px] font-semibold text-zinc-900">
                                {strengthText}
                              </div>
                            </div>
                            <div className="text-right text-[12px] font-medium text-zinc-500">
                              Biztonságos, ha több feltétel teljesül
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-5 gap-2">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-2.5 rounded-full ${
                                  i < strength
                                    ? `bg-gradient-to-r ${strengthColor}`
                                    : "bg-zinc-100"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {passwordRules.map((rule) => (
                              <PasswordRule key={rule.label} label={rule.label} passed={rule.passed} />
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="mb-2 block pl-0.5 text-[13px] font-semibold text-zinc-800">
                          Jelszó megerősítése
                        </label>
                        <input
                          type={showPwd ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder="Írd be újra a fenti jelszót"
                          className="h-[58px] w-full rounded-2xl border border-zinc-200 bg-white px-4 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all focus:border-[#F5D000]/50 focus:outline-none focus:ring-2 focus:ring-[#F5D000]/20"
                          autoComplete="new-password"
                        />
                      </div>
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
                      className="overflow-hidden"
                    >
                      <div className="mt-5 rounded-[24px] border border-red-100 bg-red-50 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                          <p className="text-[13px] font-medium leading-6 text-red-700">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!alreadyActivated && (
                  <>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-5 inline-flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F5D000,#D8AE00)] px-5 text-[14px] font-semibold text-[#2B2410] shadow-[0_18px_40px_rgba(245,208,0,0.30)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          Feldolgozás...
                        </>
                      ) : require2FA ? (
                        <>
                          Jelszó beállítása és tovább a 2FA-hoz
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      ) : (
                        <>
                          Jelszó beállítása
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>

                    <p className="mt-5 text-center text-[12px] leading-6 text-zinc-500">
                      A jelszó beállításával megerősíted a céges hozzáférési feltételek elfogadását.{" "}
                      <a
                        href="mailto:balog.sebastian@pannonguard.hu"
                        className="font-semibold text-[#9B7B00] hover:underline"
                      >
                        Támogatás
                      </a>
                    </p>
                  </>
                )}

                {alreadyActivated && (
                  <div className="mt-5 rounded-[28px] border border-zinc-200/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5D000]/14 text-[#9B7B00]">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                          Új link igénylése
                        </div>
                        <p className="mt-2 text-[14px] leading-7 text-zinc-600">
                          Vedd fel a kapcsolatot az ügyfélszolgálattal az egyedi belépési link újraküldéséhez:
                        </p>
                        <a
                          href="mailto:balog.sebastian@pannonguard.hu?subject=NI%20Port%C3%A1l%20-%20%C3%9Aj%20egyedi%20bel%C3%A9p%C3%A9si%20link%20k%C3%A9r%C3%A9se"
                          className="mt-3 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-[13px] font-semibold text-[#9B7B00] transition-colors hover:bg-[#fff9d6]"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                onSubmit={submitTfaVerify}
                className="rounded-[34px] border border-white/70 bg-white/84 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-7"
              >
                <div className="rounded-[30px] border border-[#F5D000]/20 bg-[linear-gradient(135deg,rgba(245,208,0,0.18),rgba(255,255,255,0.95))] p-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9B7B00]">
                    <ShieldCheck className="h-4 w-4" />
                    2. lépés · Kétfaktoros hitelesítés
                  </div>
                  <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-zinc-950">
                    Biztonsági beállítás véglegesítése
                  </h1>
                  <p className="mt-3 text-[15px] leading-7 text-zinc-600">
                    Ez a fiók kizárólag 2FA-val érhető el. Olvasd be a QR-kódot az Authenticator alkalmazásba, mentsd el a tartalék kódokat, majd add meg az első ellenőrző kódot.
                  </p>
                </div>

                <div className="mt-5 space-y-5">
                  <div className="rounded-[28px] border border-zinc-200/70 bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      1. lépés · QR-kód beolvasása
                    </div>
                    <div className="flex flex-col gap-5 lg:flex-row">
                      <div className="mx-auto flex shrink-0 items-center justify-center rounded-[28px] border border-zinc-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                        {tfaQr ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tfaQr}
                            alt="2FA QR kód"
                            width={210}
                            height={210}
                            style={{ borderRadius: 18, display: "block" }}
                          />
                        ) : (
                          <div className="h-[210px] w-[210px] animate-pulse rounded-[24px] bg-zinc-100" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="rounded-[24px] border border-zinc-200/70 bg-[#fffdf2] p-4 text-[14px] leading-7 text-zinc-600">
                          Nyisd meg a telefonodon az Authenticator alkalmazást, válaszd a <strong className="text-zinc-900">&quot;+&quot;</strong> ikont, majd olvasd be a bal oldali QR-kódot.
                        </div>
                        <div className="mt-4 rounded-[24px] border border-zinc-200/70 bg-white p-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                            Manuális kulcs, ha a QR nem olvasható
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <code className="min-w-0 flex-1 break-all text-[13px] font-bold text-zinc-900">
                              {tfaSecret || "—"}
                            </code>
                            <button
                              type="button"
                              onClick={() => copy(tfaSecret || "", "secret")}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
                              title="Kulcs másolása"
                            >
                              {tfaCopied === "secret" ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-zinc-200/70 bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                          2. lépés · Biztonsági kódok mentése
                        </div>
                        <div className="mt-1 text-[15px] font-semibold text-zinc-950">
                          Ezeket csak akkor használd, ha nincs nálad az Authenticator.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={downloadBackupCodes}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-[13px] font-semibold transition-colors ${
                          tfaBackupDownloaded
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                        }`}
                      >
                        {tfaBackupDownloaded ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {tfaBackupDownloaded ? "Letöltve" : "Kódok letöltése"}
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {tfaBackupCodes?.map((c, i) => (
                        <div
                          key={c}
                          className="flex items-center justify-between rounded-2xl border border-zinc-200/70 bg-zinc-50 px-4 py-3"
                        >
                          <code className="text-[13px] font-bold tracking-wide text-zinc-900">{c}</code>
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                            #{String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-4 text-[12px] leading-6 text-zinc-500">
                      Tárold ezeket a kódokat biztonságos helyen. Minden kód csak egyszer használható, és kiválthatja az Authenticator alkalmazást vészhelyzetben.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-zinc-200/70 bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      3. lépés · Első ellenőrző kód
                    </div>
                    <div className="mt-1 text-[15px] font-semibold text-zinc-950">
                      Add meg az alkalmazás által generált 6 számjegyű kódot.
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block pl-0.5 text-[13px] font-semibold text-zinc-800">
                        {tfaUseBackup
                          ? "Biztonsági kód (pl. A1B2-C3D4-E5)"
                          : "Authenticator 6 számjegyű kód"}
                      </label>
                      <input
                        type="text"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        value={tfaCode}
                        onChange={(e) => {
                          let v = e.target.value;
                          if (!tfaUseBackup) v = v.replace(/\D/g, "").slice(0, 6);
                          else v = v.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 16);
                          setTfaCode(v);
                        }}
                        placeholder={tfaUseBackup ? "A1B2-C3D4-E5" : "000000"}
                        className="h-[62px] w-full rounded-2xl border border-zinc-200 bg-white px-4 text-center font-mono text-[20px] font-bold tracking-[0.45em] text-zinc-900 placeholder:text-zinc-400 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all focus:border-[#F5D000]/50 focus:outline-none focus:ring-2 focus:ring-[#F5D000]/20"
                      />
                    </div>

                    <label className="mt-4 inline-flex items-center gap-3 text-[13px] font-medium text-zinc-600">
                      <input
                        id="tfa-use-backup"
                        type="checkbox"
                        checked={tfaUseBackup}
                        onChange={(e) => {
                          setTfaUseBackup(e.target.checked);
                          setTfaCode("");
                        }}
                        className="h-4 w-4 rounded border-zinc-300 text-[#D8AE00] focus:ring-[#F5D000]/30"
                      />
                      Biztonsági kódot használok most az Authenticator helyett
                    </label>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 rounded-[24px] border border-red-100 bg-red-50 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                          <p className="text-[13px] font-medium leading-6 text-red-700">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-5 inline-flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F5D000,#D8AE00)] px-5 text-[14px] font-semibold text-[#2B2410] shadow-[0_18px_40px_rgba(245,208,0,0.30)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Feldolgozás...
                    </>
                  ) : (
                    <>
                      2FA aktiválása és befejezés
                      <ArrowRight className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {state === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="rounded-[34px] border border-white/70 bg-white/84 p-6 text-center shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl sm:p-8"
              >
                <div className="rounded-[30px] border border-emerald-100 bg-[linear-gradient(180deg,#f4fff8_0%,#ffffff_100%)] p-6">
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
                    className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[30px] bg-emerald-50 text-emerald-500 shadow-[0_20px_45px_rgba(16,185,129,0.18)]"
                  >
                    <CheckCircle2 className="h-12 w-12" />
                  </motion.div>
                  <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-zinc-950">
                    Hozzáférés sikeresen beállítva
                  </h1>
                  <p className="mx-auto mt-3 max-w-lg text-[15px] leading-7 text-zinc-600">
                    A NI Portál fiókod most már aktív. A következő lépés változatlan: a rendszer rövidesen emailben küldi az egyedi, személyre szabott belépési linket.
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoTile
                    icon={<Mail className="h-5 w-5" />}
                    label="Belépési email"
                    value={email || "Megadott email cím"}
                  />
                  <InfoTile
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label="Hozzáférés típusa"
                    value={require2FA ? "Egyedi link + 2FA" : "Egyedi linkes belépés"}
                  />
                </div>

                <div className="mt-5 rounded-[28px] border border-zinc-200/70 bg-white/92 p-5 text-left shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5D000]/14 text-[#9B7B00]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-zinc-950">
                        Ellenőrizd a postaládát és a spam mappát is
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-zinc-600">
                        A belépéshez kizárólag az emailben küldött egyedi linket használd. A publikus <strong>/ni</strong> oldalon nincs ilyen belépési űrlap.
                        {require2FA && (
                          <>
                            {" "}
                            A megnyitás után az Authenticator alkalmazásod 6 számjegyű kódját is kérni fogjuk.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-[13px] leading-7 text-zinc-500">
                  Ez az oldal most bezárható. Ha nem érkezik meg az email, kérj új linket itt:{" "}
                  <a
                    href={
                      "mailto:balog.sebastian@pannonguard.hu?subject=NI%20Port%C3%A1l%20-%20Welcome%20email%20nem%20%C3%A9rkezett%20meg&body=K%C3%A9rek%20egy%20%C3%BAj%20egyedi%20bel%C3%A9p%C3%A9si%20linket%20a%20NI%20Port%C3%A1lhoz%20ezen%20c%C3%ADmen:%20" +
                      encodeURIComponent(email)
                    }
                    className="font-semibold text-[#9B7B00] hover:underline"
                  >
                    balog.sebastian@pannonguard.hu
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/60 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4 text-[11px] font-medium text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} Pannon Transfer · Minden jog fenntartva.</span>
          <span className="tracking-[0.18em] uppercase">
            NI dedikált ügyfélportál · kizárólag linkalapú hozzáférés
          </span>
        </div>
      </div>
    </div>
  );
}
