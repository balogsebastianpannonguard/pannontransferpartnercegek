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
import { useNiLanguage } from "../useNiLanguage";
import NiLanguageSwitcher from "../components/NiLanguageSwitcher";

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
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#22C55E]/15 text-[#15803D]">
        {icon}
      </div>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">{label}</div>
      <div className="mt-1 text-[15px] font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

const SUPPORT_EMAIL = "balog.sebastian@pannonguard.hu";

export default function NiSetupPasswordPage() {
  const { portalLanguage, locale, tr, msg } = useNiLanguage();
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
  const newUniqueLinkSubject = tr("NI Portál - Új egyedi belépési link kérése", "NI Portal - Request for a new unique login link");
  const newUniqueLinkBodyPrefix = tr(
    "Kérek egy új egyedi belépési linket a NI Portálhoz ezen címen: ",
    "Please send me a new unique login link for the NI Portal to this address: "
  );
  const newUniqueLinkHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(newUniqueLinkSubject)}&body=${encodeURIComponent(
    `${newUniqueLinkBodyPrefix}${email || ""}`
  )}`;
  const welcomeEmailSubject = tr("NI Portál - Welcome email nem érkezett meg", "NI Portal - Welcome email not received");
  const welcomeEmailBodyPrefix = tr(
    "Kérek egy új egyedi belépési linket a NI Portálhoz ezen címen: ",
    "Please send me a new unique login link for the NI Portal to this address: "
  );
  const welcomeEmailMissingHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(welcomeEmailSubject)}&body=${encodeURIComponent(
    `${welcomeEmailBodyPrefix}${email || ""}`
  )}`;

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
              tr(
                "Ez a fiók már aktiválva lett. Továbblépéshez használd a NI Portálra küldött egyedi bejelentkezési linket, vagy lépj kapcsolatba az ügyvezetővel új meghívóért.",
                "This account has already been activated. To continue, use the unique sign-in link sent to the NI Portal, or contact the managing director for a new invitation."
              )
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
  }, [rawToken, tr]);

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
      window.location.href = newUniqueLinkHref;
      return;
    }
    if (password.length < 8) {
      setError(tr("A jelszónak minimum 8 karakter hosszúnak kell lennie.", "The password must be at least 8 characters long."));
      return;
    }
    if (password !== confirm) {
      setError(tr("A két jelszó nem egyezik meg.", "The two passwords do not match."));
      return;
    }
    if (getStrength(password) < 3) {
      setError(
        tr(
          "A jelszó túl gyenge. Használj kisbetűt, nagybetűt és számot a biztonságos hozzáféréshez.",
          "The password is too weak. Use lowercase letters, uppercase letters, and numbers for secure access."
        )
      );
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/ni-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: rawToken, password, language: portalLanguage }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(msg(json?.message) || tr("Hiba történt a jelszó beállítása közben.", "An error occurred while setting the password."));
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
      setError(
        tr(
          "Hálózati hiba történt. Kérjük, ellenőrizd az internetkapcsolatot.",
          "A network error occurred. Please check your internet connection."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitTfaVerify = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const clean = tfaCode.replace(/\s+/g, "");
    if (!tfaUseBackup && (clean.length !== 6 || !/^\d{6}$/.test(clean))) {
      setError(tr("Az Authenticator kód 6 számjegyből áll.", "The Authenticator code consists of 6 digits."));
      return;
    }
    if (tfaUseBackup && clean.length < 6) {
      setError(tr("A biztonsági kód formátuma: A1B2-C3D4-E5", "Backup code format: A1B2-C3D4-E5"));
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
        setError(msg(json?.message) || tr("Helytelen kód.", "Incorrect code."));
      } else {
        setState("done");
      }
    } catch {
      setError(tr("Hálózati hiba történt.", "A network error occurred."));
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
      `${tr("NI Portál", "NI Portal")} – ${tr("Kétfaktoros hitelesítés", "Two-factor authentication")} – ${tr("Biztonsági kódok", "Backup codes")}\n\n` +
      `${tr("Fiók", "Account")}: ${email || "N/A"}\n` +
      `${tr("Dátum", "Date")}: ${new Date().toLocaleString(locale)}\n\n` +
      `${tr("Használj egyet-egyet, ha az Authenticator alkalmazásodhoz nincs hozzáférés.", "Use these one by one if you do not have access to your Authenticator app.")}\n` +
      `${tr("Minden kód csak egyszer használható.", "Each code can only be used once.")}\n\n` +
      "-------------------------\n" +
      tfaBackupCodes.map((c, i) => `${String(i + 1).padStart(2, "0")}.  ${c}`).join("\n") +
      "\n-------------------------\n\n" +
      `${tr("Kérjük, tárold ezeket a kódokat biztonságos helyen.", "Please store these codes in a safe place.")}\n` +
      `© Pannon Transfer Kft. – ${tr("NI Dedikált Ügyfélportál", "NI Dedicated Customer Portal")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tr("NI_Portal_Biztonsagi_Kodok", "NI_Portal_Backup_Codes")}_${email || "user"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setTfaBackupDownloaded(true);
  };

  const strength = getStrength(password);
  const strengthText =
    [tr("Túl gyenge", "Very weak"), tr("Gyenge", "Weak"), tr("Közepes", "Medium"), tr("Erős", "Strong"), tr("Nagyon erős", "Very strong"), tr("Kiváló", "Excellent")][strength] ||
    tr("Túl gyenge", "Very weak");
  const strengthColor = [
    "from-red-500 to-red-400",
    "from-orange-500 to-orange-400",
    "from-amber-500 to-amber-400",
    "from-lime-500 to-lime-400",
    "from-emerald-500 to-emerald-400",
    "from-emerald-600 to-teal-500",
  ][strength] || "from-red-500 to-red-400";

  const passwordRules = [
    { label: tr("Minimum 8 karakter", "Minimum 8 characters"), passed: password.length >= 8 },
    { label: tr("Legalább 1 nagybetű", "At least 1 uppercase letter"), passed: /[A-Z]/.test(password) },
    { label: tr("Legalább 1 kisbetű", "At least 1 lowercase letter"), passed: /[a-z]/.test(password) },
    { label: tr("Legalább 1 szám", "At least 1 number"), passed: /[0-9]/.test(password) },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6fdf9_0%,#f7f7f5_35%,#f4f5f7_100%)] text-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-6%] h-[28rem] w-[28rem] rounded-full bg-[#22C55E]/18 blur-[130px]" />
        <div className="absolute right-[-8%] top-[14%] h-[26rem] w-[26rem] rounded-full bg-[#0B1F47]/10 blur-[140px]" />
        <div className="absolute bottom-[-16%] left-[24%] h-[24rem] w-[24rem] rounded-full bg-white/80 blur-[110px]" />
      </div>

      <div className="relative z-10 border-b border-white/60 bg-white/65 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#22C55E,#16A34A)] shadow-[0_18px_34px_rgba(34,197,94,0.28)]">
              <span className="text-sm font-black uppercase tracking-tight text-[#0B2B1B]">ni</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold leading-none text-zinc-950">{tr("NI Portál", "NI Portal")}</span>
              <span className="mt-1 text-[11px] tracking-[0.14em] text-zinc-500 uppercase">
                {tr("Pannon Transfer · Hozzáférés aktiválása", "Pannon Transfer · Access activation")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NiLanguageSwitcher className="rounded-full border border-zinc-200 bg-zinc-900 px-1.5 py-1 shadow-sm" />
            <div className="hidden rounded-full border border-zinc-200/80 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 shadow-[0_12px_30px_rgba(15,23,42,0.06)] sm:inline-flex">
              {tr("Dedikált partnerhozzáférés", "Dedicated partner access")}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl items-center gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.1fr_560px]">
        <div className="hidden lg:block">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#22C55E]/30 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#15803D] shadow-[0_16px_34px_rgba(15,23,42,0.05)] backdrop-blur-xl">
                <ShieldCheck className="h-4 w-4" />
                {tr("NI Partner Portál Hozzáférés", "NI Partner Portal Access")}
              </div>
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-zinc-950">
                {tr("Biztonságos beléptetés az NI dedikált partnerportáljára.", "Secure onboarding to the NI dedicated partner portal.")}
              </h1>
              <p className="mt-6 max-w-xl text-[17px] leading-8 text-zinc-600">
                {tr(
                  "Kérjük, kövesse a képernyőn látható lépéseket fiókja aktiválásához. A rendszer a legmagasabb biztonsági szabványok szerint védi a vállalati foglalásokat és az egyedi árstruktúrákat.",
                  "Please follow the on-screen steps to activate your account. The system protects company bookings and bespoke pricing structures in line with the highest security standards."
                )}
              </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoTile
                icon={<Lock className="h-5 w-5" />}
                label={tr("Hozzáférés", "Access")}
                value={tr("Egyedi, személyes aktiválási folyamat", "Unique, personal activation process")}
              />
              <InfoTile
                icon={<ShieldCheck className="h-5 w-5" />}
                label={tr("Biztonság", "Security")}
                value={require2FA ? tr("2FA kötelező a következő lépésben", "2FA required in the next step") : tr("Erős jelszavas védelem", "Strong password protection")}
              />
              <InfoTile
                icon={<Clock3 className="h-5 w-5" />}
                label={tr("Belépés", "Sign-in")}
                value={tr("Emailben küldött egyedi linkkel", "With a unique link sent by email")}
              />
              <InfoTile
                icon={<Building2 className="h-5 w-5" />}
                label={tr("Portal", "Portal")}
                value={tr("NI dedikált árstruktúra és foglalások", "NI dedicated pricing structure and bookings")}
              />
            </div>

            <div className="mt-6 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_26px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B1F47] text-white shadow-[0_16px_30px_rgba(11,31,71,0.22)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      {tr("Aktiválási tudnivalók", "Activation notes")}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-zinc-950">
                      {tr("Zárt rendszerű hozzáférés.", "Closed-system access.")}
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 text-[14px] leading-7 text-zinc-600">
                  <div className="rounded-2xl border border-zinc-200/70 bg-[#f0fdf4] px-4 py-3">
                    {tr("Aktiválja fiókját egy erős jelszó megadásával az űrlapon.", "Activate your account by setting a strong password in the form.")}
                  </div>
                  <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-3">
                    {tr("A rendszer minden foglalást és árstruktúrát szigorúan elkülönítve, biztonságosan kezel.", "The system handles all bookings and pricing structures securely and in strict separation.")}
                  </div>
                  <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-3">
                    {tr("A sikeres aktiválást követően a végleges belépési linket emailben küldjük el Önnek.", "After successful activation, we will send your final login link by email.")}
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
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#22C55E]/14 text-[#15803D] shadow-[0_20px_40px_rgba(34,197,94,0.18)]">
                  <Loader2 className="h-9 w-9 animate-spin" />
                </div>
                <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-zinc-950">
                  {tr("Hozzáférés előkészítése", "Preparing access")}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-zinc-500">
                  {tr(
                    "Ellenőrizzük a meghívó érvényességét és betöltjük a személyes aktiválási adatokat.",
                    "We are checking the validity of your invitation and loading your personal activation details."
                  )}
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
                    {tr("Érvénytelen vagy lejárt link", "Invalid or expired link")}
                  </h1>
                  <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-zinc-500">
                    {tr(
                      "Ez a hozzáférési link nem létezik, lejárt, vagy már felhasználták. Kérj új meghívót, és a rendszer új, egyedi aktiválási linket küld.",
                      "This access link does not exist, has expired, or has already been used. Request a new invitation and the system will send a new, unique activation link."
                    )}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoTile
                    icon={<Mail className="h-5 w-5" />}
                    label={tr("Kapcsolat", "Contact")}
                    value={SUPPORT_EMAIL}
                  />
                  <InfoTile
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label={tr("Állapot", "Status")}
                    value={tr("Új meghívó szükséges", "A new invitation is required")}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={newUniqueLinkHref}
                    className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0B1F47] px-5 text-[14px] font-semibold text-white shadow-[0_18px_40px_rgba(11,31,71,0.20)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <Mail className="h-4.5 w-4.5" />
                    {tr("Új link kérése emailben", "Request a new link by email")}
                  </a>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 text-[14px] font-semibold text-zinc-900 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    {tr("Ügyfélszolgálat elérése", "Contact customer support")}
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
                <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(135deg,rgba(34,197,94,0.20),rgba(255,255,255,0.95))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#15803D]">
                    <KeyRound className="h-4 w-4" />
                    {tr("1. lépés · Jelszó beállítása", "Step 1 · Set your password")}
                  </div>
                  <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-zinc-950">
                    {tr("Aktiváld a NI portálhozzáférést", "Activate your NI portal access")}
                  </h1>
                  <p className="mt-3 max-w-lg text-[15px] leading-7 text-zinc-600">
                    {alreadyActivated
                      ? tr(
                          "Ez a fiók már aktív. Új egyedi belépési link kéréséhez vedd fel a kapcsolatot az ügyfélszolgálattal az alábbi elérhetőségen.",
                          "This account is already active. To request a new unique login link, contact customer support using the details below."
                        )
                      : tr(
                          "Állíts be egy erős, kizárólag általad ismert jelszót. A működés változatlan: sikeres aktiválás után a rendszer emailben küldi az egyedi belépési linket.",
                          "Set a strong password known only to you. The process remains unchanged: after successful activation, the system will email your unique login link."
                        )}
                  </p>
                </div>

                <div className="mt-5 rounded-[28px] border border-zinc-200/70 bg-white/92 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22C55E]/14 text-[#15803D]">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                        {tr("Meghívott fiók", "Invited account")}
                      </div>
                      <div className="mt-1 truncate text-[16px] font-semibold text-zinc-950">
                        {email || tr("Kérés feldolgozása...", "Processing request...")}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold text-zinc-600">
                        <Clock3 className="h-3.5 w-3.5" />
                        {tr("Egyszeri aktiválás", "One-time activation")}
                      </span>
                      {require2FA && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/35 bg-[#22C55E]/10 px-3 py-1.5 text-[11px] font-semibold text-[#166534]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {tr("2FA kötelező", "2FA required")}
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
                          {tr("Új jelszó", "New password")}
                        </label>
                        <div className="relative">
                          <input
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={tr("Minimum 8 karakter · kisbetű · nagybetű · szám", "Minimum 8 characters · lowercase · uppercase · number")}
                            className="h-[58px] w-full rounded-2xl border border-zinc-200 bg-white px-4 pr-12 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all focus:border-[#22C55E]/50 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((p) => !p)}
                            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                            tabIndex={-1}
                            aria-label={showPwd ? tr("Jelszó elrejtése", "Hide password") : tr("Jelszó megjelenítése", "Show password")}
                            title={showPwd ? tr("Jelszó elrejtése", "Hide password") : tr("Jelszó megjelenítése", "Show password")}
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
                                {tr("Jelszó erőssége", "Password strength")}
                              </div>
                              <div className="mt-1 text-[14px] font-semibold text-zinc-900">
                                {strengthText}
                              </div>
                            </div>
                            <div className="text-right text-[12px] font-medium text-zinc-500">
                              {tr("Biztonságos, ha több feltétel teljesül", "Most secure when several criteria are met")}
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
                          {tr("Jelszó megerősítése", "Confirm password")}
                        </label>
                        <input
                          type={showPwd ? "text" : "password"}
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          placeholder={tr("Írd be újra a fenti jelszót", "Enter the password above again")}
                          className="h-[58px] w-full rounded-2xl border border-zinc-200 bg-white px-4 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all focus:border-[#22C55E]/50 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
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
                      className="mt-5 inline-flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#22C55E,#16A34A)] px-5 text-[14px] font-semibold text-[#0B2B1B] shadow-[0_18px_40px_rgba(34,197,94,0.30)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          {tr("Feldolgozás...", "Processing...")}
                        </>
                      ) : require2FA ? (
                        <>
                          {tr("Jelszó beállítása és tovább a 2FA-hoz", "Set password and continue to 2FA")}
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      ) : (
                        <>
                          {tr("Jelszó beállítása", "Set password")}
                          <ArrowRight className="h-4.5 w-4.5" />
                        </>
                      )}
                    </button>

                    <p className="mt-5 text-center text-[12px] leading-6 text-zinc-500">
                      {tr(
                        "A jelszó beállításával megerősíted a céges hozzáférési feltételek elfogadását.",
                        "By setting your password, you confirm your acceptance of the corporate access terms."
                      )}{" "}
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="font-semibold text-[#15803D] hover:underline"
                      >
                        {tr("Támogatás", "Support")}
                      </a>
                    </p>
                  </>
                )}

                {alreadyActivated && (
                  <div className="mt-5 rounded-[28px] border border-zinc-200/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#22C55E]/14 text-[#15803D]">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                          {tr("Új link igénylése", "Request a new link")}
                        </div>
                        <p className="mt-2 text-[14px] leading-7 text-zinc-600">
                          {tr(
                            "Vedd fel a kapcsolatot az ügyfélszolgálattal az egyedi belépési link újraküldéséhez:",
                            "Contact customer support to have your unique login link sent again:"
                          )}
                        </p>
                        <a
                          href={newUniqueLinkHref}
                          className="mt-3 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-[13px] font-semibold text-[#15803D] transition-colors hover:bg-[#dcfce7]"
                        >
                          {SUPPORT_EMAIL}
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
                <div className="rounded-[30px] border border-[#22C55E]/20 bg-[linear-gradient(135deg,rgba(34,197,94,0.18),rgba(255,255,255,0.95))] p-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#15803D]">
                    <ShieldCheck className="h-4 w-4" />
                    {tr("2. lépés · Kétfaktoros hitelesítés", "Step 2 · Two-factor authentication")}
                  </div>
                  <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.03em] text-zinc-950">
                    {tr("Biztonsági beállítás véglegesítése", "Complete your security setup")}
                  </h1>
                  <p className="mt-3 text-[15px] leading-7 text-zinc-600">
                    {tr(
                      "Ez a fiók kizárólag 2FA-val érhető el. Olvasd be a QR-kódot az Authenticator alkalmazásba, mentsd el a tartalék kódokat, majd add meg az első ellenőrző kódot.",
                      "This account can only be accessed with 2FA. Scan the QR code into your Authenticator app, save the backup codes, then enter the first verification code."
                    )}
                  </p>
                </div>

                <div className="mt-5 space-y-5">
                  <div className="rounded-[28px] border border-zinc-200/70 bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      {tr("1. lépés · QR-kód beolvasása", "Step 1 · Scan the QR code")}
                    </div>
                    <div className="flex flex-col gap-5 lg:flex-row">
                      <div className="mx-auto flex shrink-0 items-center justify-center rounded-[28px] border border-zinc-200 bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                        {tfaQr ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tfaQr}
                            alt={tr("2FA QR kód", "2FA QR code")}
                            width={210}
                            height={210}
                            style={{ borderRadius: 18, display: "block" }}
                          />
                        ) : (
                          <div className="h-[210px] w-[210px] animate-pulse rounded-[24px] bg-zinc-100" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="rounded-[24px] border border-zinc-200/70 bg-[#f0fdf4] p-4 text-[14px] leading-7 text-zinc-600">
                          {tr("Nyisd meg a telefonodon az Authenticator alkalmazást, válaszd a ", "Open the Authenticator app on your phone, select the ")}
                          <strong className="text-zinc-900">&quot;+&quot;</strong>
                          {tr(" ikont, majd olvasd be a bal oldali QR-kódot.", " icon, then scan the QR code on the left.")}
                        </div>
                        <div className="mt-4 rounded-[24px] border border-zinc-200/70 bg-white p-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                            {tr("Manuális kulcs, ha a QR nem olvasható", "Manual key if the QR code cannot be read")}
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <code className="min-w-0 flex-1 break-all text-[13px] font-bold text-zinc-900">
                              {tfaSecret || "—"}
                            </code>
                            <button
                              type="button"
                              onClick={() => copy(tfaSecret || "", "secret")}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
                              title={
                                tfaCopied === "secret"
                                  ? tr("Kulcs kimásolva", "Key copied")
                                  : tr("Kulcs másolása", "Copy key")
                              }
                              aria-label={
                                tfaCopied === "secret"
                                  ? tr("Kulcs kimásolva", "Key copied")
                                  : tr("Kulcs másolása", "Copy key")
                              }
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
                          {tr("2. lépés · Biztonsági kódok mentése", "Step 2 · Save your backup codes")}
                        </div>
                        <div className="mt-1 text-[15px] font-semibold text-zinc-950">
                          {tr("Ezeket csak akkor használd, ha nincs nálad az Authenticator.", "Use these only if you do not have access to your Authenticator.")}
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
                        {tfaBackupDownloaded ? tr("Letöltve", "Downloaded") : tr("Kódok letöltése", "Download codes")}
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
                      {tr(
                        "Tárold ezeket a kódokat biztonságos helyen. Minden kód csak egyszer használható, és kiválthatja az Authenticator alkalmazást vészhelyzetben.",
                        "Store these codes in a safe place. Each code can only be used once and can replace the Authenticator app in an emergency."
                      )}
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-zinc-200/70 bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                      {tr("3. lépés · Első ellenőrző kód", "Step 3 · First verification code")}
                    </div>
                    <div className="mt-1 text-[15px] font-semibold text-zinc-950">
                      {tr("Add meg az alkalmazás által generált 6 számjegyű kódot.", "Enter the 6-digit code generated by the app.")}
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block pl-0.5 text-[13px] font-semibold text-zinc-800">
                        {tfaUseBackup
                          ? tr("Biztonsági kód (pl. A1B2-C3D4-E5)", "Backup code (e.g. A1B2-C3D4-E5)")
                          : tr("Authenticator 6 számjegyű kód", "Authenticator 6-digit code")}
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
                        placeholder={tfaUseBackup ? tr("A1B2-C3D4-E5", "A1B2-C3D4-E5") : "000000"}
                        className="h-[62px] w-full rounded-2xl border border-zinc-200 bg-white px-4 text-center font-mono text-[20px] font-bold tracking-[0.45em] text-zinc-900 placeholder:text-zinc-400 shadow-[0_10px_28px_rgba(15,23,42,0.04)] transition-all focus:border-[#22C55E]/50 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
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
                        className="h-4 w-4 rounded border-zinc-300 text-[#16A34A] focus:ring-[#22C55E]/30"
                      />
                      {tr("Biztonsági kódot használok most az Authenticator helyett", "I am using a backup code instead of the Authenticator")}
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
                  className="mt-5 inline-flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#22C55E,#16A34A)] px-5 text-[14px] font-semibold text-[#0B2B1B] shadow-[0_18px_40px_rgba(34,197,94,0.30)] transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      {tr("Feldolgozás...", "Processing...")}
                    </>
                  ) : (
                    <>
                      {tr("2FA aktiválása és befejezés", "Activate 2FA and finish")}
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
                    {tr("Hozzáférés sikeresen beállítva", "Access has been set up successfully")}
                  </h1>
                  <p className="mx-auto mt-3 max-w-lg text-[15px] leading-7 text-zinc-600">
                    {tr(
                      "A NI Portál fiókod most már aktív. A következő lépés változatlan: a rendszer rövidesen emailben küldi az egyedi, személyre szabott belépési linket.",
                      "Your NI Portal account is now active. The next step remains unchanged: the system will shortly email your unique, personalised login link."
                    )}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoTile
                    icon={<Mail className="h-5 w-5" />}
                    label={tr("Belépési email", "Login email")}
                    value={email || tr("Megadott email cím", "Provided email address")}
                  />
                  <InfoTile
                    icon={<ShieldCheck className="h-5 w-5" />}
                    label={tr("Hozzáférés típusa", "Access type")}
                    value={require2FA ? tr("Egyedi link + 2FA", "Unique link + 2FA") : tr("Egyedi linkes belépés", "Unique-link sign-in")}
                  />
                </div>

                <div className="mt-5 rounded-[28px] border border-zinc-200/70 bg-white/92 p-5 text-left shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/14 text-[#15803D]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold text-zinc-950">
                        {tr("Ellenőrizd a postaládát és a spam mappát is", "Check your inbox and spam folder as well")}
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-zinc-600">
                        {tr("A belépéshez kizárólag az emailben küldött egyedi linket használd. A publikus ", "Use only the unique link sent by email to sign in. There is no such sign-in form on the public ")}
                        <strong>/ni</strong>
                        {tr(" oldalon nincs ilyen belépési űrlap.", " page.")}
                        {require2FA && (
                          <>
                            {" "}
                            {tr("A megnyitás után az Authenticator alkalmazásod 6 számjegyű kódját is kérni fogjuk.", "After opening it, we will also ask for the 6-digit code from your Authenticator app.")}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-[13px] leading-7 text-zinc-500">
                  {tr("Ez az oldal most bezárható. Ha nem érkezik meg az email, kérj új linket itt:", "You may now close this page. If the email does not arrive, request a new link here:")}{" "}
                  <a
                    href={welcomeEmailMissingHref}
                    className="font-semibold text-[#15803D] hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/60 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-4 text-[11px] font-medium text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} Pannon Transfer · {tr("Minden jog fenntartva.", "All rights reserved.")}</span>
          <span className="tracking-[0.18em] uppercase">
            {tr("NI dedikált ügyfélportál · kizárólag linkalapú hozzáférés", "NI dedicated customer portal · link-based access only")}
          </span>
        </div>
      </div>
    </div>
  );
}
