"use client";

import React from "react";
import Link from "next/link";
import { ListOrdered, LogOut, Mail, Phone, PlusCircle } from "lucide-react";
import { TAMA_LANGS, type TamaLang } from "./lang";
import { tamaText } from "./booking-i18n";

/* ------------------------------------------------------------------ */
/*  TAMA arculat – meleg, természetes, világos                          */
/*  olajzöld #5F8016 · logózöld #7B9824 · krém #FAF8F1 · búza #C9A24D   */
/* ------------------------------------------------------------------ */

export const SUPPORT = {
  name: "Balog Sebastian Máté",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

export const serifFont = {
  fontFamily: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif',
} as const;

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

export function TamaLogo({ className = "h-9" }: { className?: string }) {
  return (
    <img
      src="/partners/tama/logo.png"
      alt="TAMA Hungary Kft."
      width={540}
      height={210}
      className={`${className} w-auto`}
    />
  );
}

/** Dekoratív búzaszár-ornamens (puha, halvány vonalak). */
export function WheatOrnament({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const stroke = tone === "light" ? "rgba(255,255,255,0.55)" : "rgba(95,128,22,0.35)";
  const fill = tone === "light" ? "rgba(255,255,255,0.22)" : "rgba(123,152,36,0.18)";
  const ear = (x: number, y: number, rot: number, s = 1) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <ellipse cx={-7} cy={-i * 15 - 6} rx={5} ry={9} transform={`rotate(-28 -7 ${-i * 15 - 6})`} fill={fill} stroke={stroke} strokeWidth={1.2} />
          <ellipse cx={7} cy={-i * 15 - 6} rx={5} ry={9} transform={`rotate(28 7 ${-i * 15 - 6})`} fill={fill} stroke={stroke} strokeWidth={1.2} />
        </g>
      ))}
      <ellipse cx={0} cy={-98} rx={4.5} ry={10} fill={fill} stroke={stroke} strokeWidth={1.2} />
    </g>
  );
  return (
    <svg viewBox="0 0 320 340" className={className} aria-hidden fill="none">
      <g stroke={stroke} strokeWidth={1.6} strokeLinecap="round">
        <path d="M120 340 C124 270 128 210 150 140" />
        <path d="M170 340 C168 280 176 210 206 120" />
        <path d="M222 340 C214 290 228 230 262 160" />
        <path d="M72 340 C84 290 96 250 108 214" />
      </g>
      {ear(150, 140, -6)}
      {ear(206, 120, 8, 1.05)}
      {ear(262, 160, 20, 0.85)}
      {ear(108, 214, -16, 0.7)}
    </svg>
  );
}

export function LangSwitch({
  lang,
  onChange,
  label,
}: {
  lang: TamaLang;
  onChange: (l: TamaLang) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center p-0.5 rounded-full bg-[#F1EDDD] border border-[#E4DDC7]"
    >
      {TAMA_LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => onChange(l.id)}
          aria-pressed={lang === l.id}
          title={l.full}
          className={`h-7 min-w-9 px-3 rounded-full text-[11px] font-bold tracking-wider transition-all ${
            lang === l.id
              ? "bg-[#5F8016] text-white shadow-[0_2px_8px_rgba(95,128,22,0.35)]"
              : "text-[#6B705C] hover:text-[#26301B]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function TamaHeader({
  lang,
  onLang,
  email,
  scrolled,
  active,
  onLogout,
}: {
  lang: TamaLang;
  onLang: (l: TamaLang) => void;
  email: string;
  scrolled: boolean;
  active: "booking" | "bookings";
  onLogout: () => void;
}) {
  const tx = (k: string) => tamaText(lang, k);
  const navLink = (isActive: boolean) =>
    `inline-flex items-center gap-2 px-4 h-9 rounded-full text-[13px] font-semibold transition-all ${
      isActive
        ? "bg-[#EAF1D3] text-[#3E560C] shadow-[inset_0_0_0_1px_rgba(95,128,22,0.18)]"
        : "text-[#5B6450] hover:bg-[#F1EDDD] hover:text-[#26301B]"
    }`;
  const initial = (email || "?").trim().charAt(0).toUpperCase();

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBF9F3]/90 backdrop-blur-xl border-b border-[#E4DDC7] shadow-[0_6px_24px_rgba(70,80,30,0.08)]"
          : "bg-[#FBF9F3]/70 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="shrink-0 h-9 px-3 rounded-full bg-white border border-[#E4DDC7] flex items-center shadow-[0_1px_3px_rgba(70,80,30,0.08)]">
            <PannonLogo className="h-[18px] sm:h-5" />
          </div>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-[#C9A24D]" aria-hidden />
          <TamaLogo className="h-8 sm:h-9" />
        </div>

        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Primary">
          <Link href="/tama" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
          </Link>
          <Link href="/tama/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <LangSwitch lang={lang} onChange={onLang} label={tx("language")} />
          <div className="hidden xl:flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7B9824] to-[#4B6A0E] text-white text-[13px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
              {initial}
            </div>
            <span className="text-[12px] font-semibold text-[#3B4530] max-w-[180px] truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={tx("signOut")}
            aria-label={tx("signOut")}
            className="w-9 h-9 rounded-full bg-white border border-[#E4DDC7] flex items-center justify-center text-[#6B705C] hover:text-[#26301B] hover:border-[#C9C2A7] hover:shadow-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="lg:hidden border-t border-[#EEE8D6] px-4 sm:px-6">
        <div className="max-w-[1180px] mx-auto flex items-center gap-1.5 h-12">
          <Link href="/tama" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
          </Link>
          <Link href="/tama/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function TamaFooter({ lang }: { lang: TamaLang }) {
  const tx = (k: string) => tamaText(lang, k);
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-[#E4DDC7] bg-[#F6F2E4]/80 backdrop-blur py-10 px-6">
      <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="flex items-center gap-4">
          <div className="h-9 px-3 rounded-full bg-white border border-[#E4DDC7] flex items-center">
            <PannonLogo className="h-[18px]" />
          </div>
          <TamaLogo className="h-8" />
        </div>
        <div className="text-[12px] text-[#6B705C] leading-relaxed">
          <div className="text-[#3B4530] font-semibold">
            {tx("needHelp")} {SUPPORT.name} · {tx("supportRole")}
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3 gap-y-1 mt-0.5">
            <a href={`mailto:${SUPPORT.email}`} className="inline-flex items-center gap-1.5 hover:text-[#4B6A0E] transition-colors">
              <Mail className="w-3.5 h-3.5" />
              {SUPPORT.email}
            </a>
            <a href={`tel:${SUPPORT.phoneHref}`} className="inline-flex items-center gap-1.5 hover:text-[#4B6A0E] transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {SUPPORT.phone}
            </a>
          </div>
          <div className="mt-1.5 text-[#8B917D]">
            © {year} Pannon Transfer. {tx("rights")}
          </div>
        </div>
      </div>
    </footer>
  );
}

/** Lágy, természetes háttér (krém + halvány zöld foltok). */
export function MeadowBackdrop() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#FAF8F1]" />
      <div className="absolute -top-40 -left-32 w-[640px] h-[640px] rounded-full bg-[#DDE8B8]/45 blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full bg-[#F0E4BC]/50 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-[520px] h-[360px] rounded-full bg-[#E6EED0]/50 blur-3xl" />
      <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(#D8D2BC_1px,transparent_1px)] bg-[size:26px_26px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Belépő / aktiváló oldalak közös kerete (zöld panel + krém oldal)    */
/* ------------------------------------------------------------------ */

export function AuthFrame({
  lang,
  onLang,
  panelEyebrow,
  panelTitle,
  panelText,
  panelExtra,
  children,
  footerNote,
  wide = false,
}: {
  lang: TamaLang;
  onLang: (l: TamaLang) => void;
  panelEyebrow: string;
  panelTitle: string;
  panelText: string;
  panelExtra?: React.ReactNode;
  children: React.ReactNode;
  footerNote?: string;
  wide?: boolean;
}) {
  const tx = (k: string) => tamaText(lang, k);
  const year = new Date().getFullYear();
  return (
    <div className="relative min-h-screen bg-[#FAF8F1] text-[#26301B] [color-scheme:light] lg:grid lg:grid-cols-[minmax(400px,0.82fr)_1.18fr]">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#2B3D0A_0%,#4B6A0E_48%,#7B9824_100%)] text-white p-12 xl:p-14">
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <WheatOrnament className="absolute -bottom-10 -right-10 w-[360px] opacity-55 pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="h-10 px-3.5 rounded-full bg-white flex items-center shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
            <PannonLogo className="h-5" />
          </div>
          <div className="h-10 px-3.5 rounded-full bg-white flex items-center shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
            <TamaLogo className="h-7" />
          </div>
        </div>

        <div className="relative max-w-[460px]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold tracking-[0.2em] uppercase mb-6">
            {panelEyebrow}
          </div>
          <h1 className="text-[40px] leading-[1.08]" style={serifFont}>
            {panelTitle}
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-white/80">{panelText}</p>
          {panelExtra && <div className="mt-8">{panelExtra}</div>}
        </div>

        <div className="relative flex items-center gap-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm p-4 max-w-[460px]">
          <div className="h-11 w-11 shrink-0 rounded-full bg-white text-[#3E560C] text-[13px] font-bold flex items-center justify-center">BS</div>
          <div className="min-w-0 text-[13px] leading-relaxed">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{tx("needHelp")}</div>
            <div className="font-semibold">
              {SUPPORT.name} · {tx("supportRole")}
            </div>
            <a href={`mailto:${SUPPORT.email}`} className="text-white/85 hover:text-white">{SUPPORT.email}</a>
            <span className="text-white/50"> · </span>
            <a href={`tel:${SUPPORT.phoneHref}`} className="text-white/85 hover:text-white">{SUPPORT.phone}</a>
          </div>
        </div>
      </aside>

      <div className="relative flex flex-col min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -top-32 right-0 w-[460px] h-[460px] rounded-full bg-[#DDE8B8]/50 blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-[420px] h-[360px] rounded-full bg-[#F0E4BC]/50 blur-3xl" />
        </div>
        <header className="relative z-10 flex items-center justify-between gap-3 px-5 sm:px-8 h-[68px]">
          <div className="flex items-center gap-3 lg:invisible">
            <div className="h-9 px-3 rounded-full bg-white border border-[#E4DDC7] flex items-center">
              <PannonLogo className="h-[18px]" />
            </div>
            <TamaLogo className="h-8" />
          </div>
          <LangSwitch lang={lang} onChange={onLang} label={tx("language")} />
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center px-5 sm:px-8 py-8">
          <div className={`w-full ${wide ? "max-w-[620px]" : "max-w-[460px]"}`}>{children}</div>
        </main>

        <footer className="relative z-10 px-5 sm:px-8 py-5 text-[11px] text-[#8B917D] font-medium flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <span>
            © {year} Pannon Transfer. {tx("rights")}
          </span>
          {footerNote && <span className="tracking-wide">{footerNote}</span>}
        </footer>
      </div>
    </div>
  );
}

/** Egységes gomb- és beviteli osztályok az auth oldalakhoz. */
export const authInput =
  "w-full h-[54px] px-4 bg-[#FBFAF4] border border-[#E4DDC7] rounded-2xl text-[15px] text-[#26301B] placeholder:text-[#A7AB98] font-medium outline-none transition-all hover:border-[#CFC7A8] focus:bg-white focus:border-[#7B9824] focus:ring-4 focus:ring-[#7B9824]/15";

export const authPrimaryBtn =
  "w-full h-[56px] rounded-full bg-gradient-to-r from-[#4B6A0E] via-[#5F8016] to-[#7B9824] hover:from-[#3E560C] hover:via-[#4B6A0E] hover:to-[#5F8016] text-white text-[14px] font-semibold tracking-wide shadow-[0_12px_30px_rgba(75,106,14,0.34)] hover:shadow-[0_16px_38px_rgba(75,106,14,0.44)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

export const authSecondaryBtn =
  "h-[56px] px-6 rounded-full bg-white hover:bg-[#F4F0E1] text-[#3B4530] text-[14px] font-semibold border border-[#E4DDC7] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

export const authCard =
  "rounded-[28px] border border-[#E4DDC7] bg-white shadow-[0_24px_60px_rgba(70,80,30,0.10)]";
