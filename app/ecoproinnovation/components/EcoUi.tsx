"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ListOrdered, LogOut, PlusCircle, UserCircle } from "lucide-react";
import { ECO_LANGS, makeT, type EcoLang } from "../i18n";

/* Ecopro Innovation visual identity: bright, airy, glassy – EcoPro blue → cyan. */

export const ECO = {
  blue: "#0E86D4",
  blueDark: "#0A6BB0",
  deep: "#0B3F8F",
  cyan: "#00B4D8",
  ink: "#0B2540",
  page: "#F2F8FD",
  line: "#DCEBF7",
} as const;

export const SUPPORT = {
  name: "Balog Sebastian Máté",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

export const ecoFont = (lang: EcoLang): React.CSSProperties =>
  lang === "ko"
    ? {
        fontFamily:
          "'Pretendard', 'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, -apple-system, 'Segoe UI', sans-serif",
        wordBreak: "keep-all",
      }
    : {};

/* eslint-disable @next/next/no-img-element */

export function PannonLogo({ className = "h-6" }: { className?: string }) {
  return (
    <img
      src="/brand/pannon-transfer-logo.png"
      alt="Pannon Transfer"
      width={387}
      height={79}
      className={`${className} w-auto`}
    />
  );
}

export function EcoLogo({ className = "h-6" }: { className?: string }) {
  return (
    <img
      src="/partners/ecoproinnovation/logo.png"
      alt="Ecopro Innovation"
      width={660}
      height={156}
      className={`${className} w-auto`}
    />
  );
}

export function EcoBackdrop({ variant = "page" }: { variant?: "page" | "soft" }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#F7FBFE_0%,#EEF7FD_55%,#F4FAFE_100%)]" />
      <div className="absolute -top-48 -left-40 w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,rgba(14,134,212,0.20),transparent_68%)] blur-2xl" />
      <div className="absolute -top-24 right-[-8%] w-[560px] h-[560px] rounded-full bg-[radial-gradient(circle,rgba(0,180,216,0.20),transparent_68%)] blur-2xl" />
      {variant === "page" && (
        <div className="absolute bottom-[-20%] left-[30%] w-[720px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(14,134,212,0.10),transparent_70%)] blur-3xl" />
      )}
      <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(#BCD9EE_1px,transparent_1px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_70%)]" />
    </div>
  );
}

export function LangSwitch({
  lang,
  onChange,
  compact = false,
}: {
  lang: EcoLang;
  onChange: (l: EcoLang) => void;
  compact?: boolean;
}) {
  const t = makeT(lang);
  return (
    <div
      role="group"
      aria-label={t("language")}
      className="relative flex items-center p-0.5 rounded-full bg-white/80 border border-[#DCEBF7] shadow-[0_1px_2px_rgba(14,134,212,0.08)]"
    >
      {ECO_LANGS.map((l) => {
        const active = lang === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            aria-pressed={active}
            title={l.full}
            className={`relative z-10 ${compact ? "h-7 min-w-9 px-2.5" : "h-8 min-w-11 px-3"} rounded-full text-[11px] font-bold tracking-wider transition-colors ${
              active ? "text-white" : "text-slate-500 hover:text-[#0B3F8F]"
            }`}
          >
            {active && (
              <motion.span
                layoutId="eco-lang-pill"
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-[#0E86D4] to-[#00B4D8] shadow-[0_4px_12px_rgba(14,134,212,0.35)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

export function EcoHeader({
  lang,
  onLangChange,
  email,
  active,
  onLogout,
  scrolled,
}: {
  lang: EcoLang;
  onLangChange: (l: EcoLang) => void;
  email: string;
  active: "booking" | "bookings";
  onLogout: () => void;
  scrolled: boolean;
}) {
  const t = makeT(lang);
  const navLink = (isActive: boolean) =>
    `relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all ${
      isActive
        ? "text-[#0B3F8F] bg-[#0E86D4]/10 ring-1 ring-[#0E86D4]/20"
        : "text-slate-500 hover:text-[#0B3F8F] hover:bg-[#0E86D4]/[0.06]"
    }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-[#DCEBF7] shadow-[0_8px_30px_rgba(14,134,212,0.10)]"
          : "bg-white/60 backdrop-blur-md border-b border-white/60"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <PannonLogo className="h-5 sm:h-6" />
          <span className="hidden sm:block w-px h-6 bg-[#DCEBF7]" aria-hidden />
          <EcoLogo className="h-4 sm:h-5" />
          <div className="hidden xl:flex flex-col min-w-0 pl-1">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 truncate">
              {t("navSubline")}
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          <Link href="/ecoproinnovation" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {t("navBooking")}
          </Link>
          <Link href="/ecoproinnovation/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {t("navMyBookings")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LangSwitch lang={lang} onChange={onLangChange} compact />
          <div className="hidden xl:flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0E86D4] to-[#00B4D8] flex items-center justify-center shadow-[0_4px_12px_rgba(14,134,212,0.3)]">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[12px] font-semibold text-[#0B2540] max-w-[190px] truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={t("signOut")}
            aria-label={t("signOut")}
            className="w-9 h-9 rounded-full bg-white border border-[#DCEBF7] flex items-center justify-center text-slate-500 hover:text-[#0B3F8F] hover:border-[#0E86D4]/40 hover:shadow-md transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="lg:hidden border-t border-[#DCEBF7]/70 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto flex items-center gap-1 h-12">
          <Link href="/ecoproinnovation" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {t("navBooking")}
          </Link>
          <Link href="/ecoproinnovation/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {t("navMyBookings")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function EcoFooter({ lang }: { lang: EcoLang }) {
  const t = makeT(lang);
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-[#DCEBF7] bg-white/70 backdrop-blur py-9 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="flex items-center gap-4">
          <PannonLogo className="h-5" />
          <span className="w-px h-6 bg-[#DCEBF7]" />
          <EcoLogo className="h-4" />
        </div>
        <div className="text-[12px] text-slate-500 leading-relaxed">
          <div className="text-[#0B2540] font-semibold">
            {t("needHelp")} {SUPPORT.name} · {t("supportRole")}
          </div>
          <div>
            <a href={`mailto:${SUPPORT.email}`} className="hover:text-[#0E86D4] transition-colors">
              {SUPPORT.email}
            </a>
            {" · "}
            <a href={`tel:${SUPPORT.phoneHref}`} className="hover:text-[#0E86D4] transition-colors">
              {SUPPORT.phone}
            </a>
          </div>
          <div className="mt-1 text-slate-400">
            © {year} Pannon Transfer. {t("rights")}
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Full-page "checking access" splash (before the session is known). */
export function EcoCheckingScreen({ lang }: { lang: EcoLang }) {
  const t = makeT(lang);
  return (
    <div className="relative min-h-screen text-[#0B2540] flex flex-col" style={ecoFont(lang)}>
      <EcoBackdrop variant="soft" />
      <div className="relative z-10 w-full border-b border-[#DCEBF7] bg-white/70 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
          <PannonLogo className="h-6" />
          <span className="w-px h-6 bg-[#DCEBF7]" />
          <EcoLogo className="h-5" />
        </div>
      </div>
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative w-16 h-16 rounded-2xl bg-white border border-[#DCEBF7] shadow-[0_12px_32px_rgba(14,134,212,0.15)] flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
              className="w-7 h-7 rounded-full border-[3px] border-[#DCEBF7] border-t-[#0E86D4]"
            />
          </div>
          <p className="text-[14px] text-slate-500 font-semibold tracking-wide">{t("checkingAccess")}</p>
        </motion.div>
      </div>
    </div>
  );
}

/** Branded "preparing your portal" splash shown briefly after sign-in. */
export function EcoBootScreen({ lang, label }: { lang: EcoLang; label: string }) {
  const t = makeT(lang);
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#F4FAFE] flex flex-col items-center justify-center overflow-hidden"
      style={ecoFont(lang)}
    >
      <EcoBackdrop variant="soft" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-44 h-44 flex items-center justify-center mb-9">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#0E86D4]/70 border-r-[#00B4D8]/40"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 14, ease: "linear", repeat: Infinity }}
            className="absolute -inset-4 rounded-full border border-transparent border-b-[#0E86D4]/30 border-l-[#00B4D8]/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="h-20 px-6 rounded-3xl bg-white flex items-center shadow-[0_20px_60px_rgba(14,134,212,0.28)] border border-[#DCEBF7]"
          >
            <EcoLogo className="h-9" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <div className="inline-flex items-center rounded-xl bg-white px-4 py-2 border border-[#DCEBF7] shadow-sm mb-4">
            <PannonLogo className="h-6" />
          </div>
          <p className="text-[10px] tracking-[0.38em] uppercase text-slate-400 font-semibold">{t("premiumTag")}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-12 w-64">
          <div className="h-[3px] w-full bg-[#DCEBF7] relative overflow-hidden rounded-full">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.4 }}
              className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#0E86D4] to-[#00B4D8]"
            />
          </div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-5 text-center text-[10px] tracking-[0.25em] text-[#0E86D4] uppercase font-bold"
          >
            {label}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export const ecoPrimaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0E86D4] to-[#00A3D9] hover:from-[#0A74BA] hover:to-[#0E86D4] text-white font-semibold shadow-[0_10px_28px_rgba(14,134,212,0.35)] hover:shadow-[0_14px_36px_rgba(14,134,212,0.45)] transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

export const ecoGhostBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-[#DCEBF7] text-[#0B2540] font-semibold hover:border-[#0E86D4]/40 hover:bg-[#F7FBFE] hover:shadow-md transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";

export const ecoCard =
  "rounded-3xl bg-white/80 backdrop-blur-xl border border-white shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_20px_50px_rgba(14,134,212,0.10),0_2px_6px_rgba(11,63,143,0.05)] ring-1 ring-[#DCEBF7]/70";
