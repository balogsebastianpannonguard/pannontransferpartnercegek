"use client";

import React from "react";
import Link from "next/link";
import { ListOrdered, LogOut, PlusCircle, UserCircle } from "lucide-react";
import { MX_LANGS, type MxLang } from "../lang";
import { mxText } from "../booking-i18n";

/* Design tokens — Schaeffler Motion: precision engineering, graphite + Schaeffler green */
export const MX = {
  bg: "#0B100E",
  panel: "#111815",
  panel2: "#16201B",
  green: "#00893D",
  greenHi: "#1FB35A",
  neon: "#3DDC84",
} as const;

export const SUPPORT = {
  name: "Balog Sebastian Máté",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

/** Technical grid + faint green glow behind dark pages. */
export function MxBackdrop() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#0B100E]" />
      <div className="absolute -top-48 -left-40 w-[760px] h-[760px] rounded-full bg-[radial-gradient(circle,rgba(0,137,61,0.20),transparent_62%)]" />
      <div className="absolute bottom-[-220px] right-[-160px] w-[720px] h-[720px] rounded-full bg-[radial-gradient(circle,rgba(61,220,132,0.08),transparent_65%)]" />
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#7DF0AE_1px,transparent_1px),linear-gradient(to_bottom,#7DF0AE_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_72%)]" />
    </div>
  );
}

/** White chip that carries a (white-background) logo image on dark surfaces. */
export function LogoChip({
  src,
  alt,
  w,
  h,
  imgClass,
  className = "",
}: {
  src: string;
  alt: string;
  w: number;
  h: number;
  imgClass: string;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-[5px] flex items-center justify-center px-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={w} height={h} className={imgClass} />
    </div>
  );
}

export function PannonChip({ className = "h-9", imgClass = "h-[18px] w-auto" }: { className?: string; imgClass?: string }) {
  return <LogoChip src="/brand/pannon-transfer-logo.png" alt="Pannon Transfer" w={387} h={79} imgClass={imgClass} className={className} />;
}

export function SchaefflerChip({ className = "h-9", imgClass = "h-[15px] w-auto" }: { className?: string; imgClass?: string }) {
  return <LogoChip src="/partners/schaefflermotion/logo.png" alt="Schaeffler" w={226} h={56} imgClass={imgClass} className={className} />;
}

export function MxLangSwitch({
  lang,
  onChange,
  className = "",
}: {
  lang: MxLang;
  onChange: (l: MxLang) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={mxText(lang, "language")}
      className={`inline-flex items-stretch border border-white/15 rounded-[5px] overflow-hidden font-mono ${className}`}
    >
      {MX_LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => onChange(l.id)}
          aria-pressed={lang === l.id}
          title={l.full}
          className={`h-8 min-w-10 px-2.5 text-[11px] font-bold tracking-[0.14em] transition-colors ${
            lang === l.id ? "bg-[#00893D] text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export function MxHeader({
  lang,
  onLangChange,
  email,
  scrolled,
  active,
  onLogout,
}: {
  lang: MxLang;
  onLangChange: (l: MxLang) => void;
  email: string;
  scrolled: boolean;
  active: "booking" | "bookings";
  onLogout: () => void;
}) {
  const tx = (k: string) => mxText(lang, k);
  const navLink = (isActive: boolean) =>
    `relative inline-flex items-center gap-2 h-full px-4 text-[12px] font-bold tracking-[0.16em] uppercase transition-colors ${
      isActive ? "text-white" : "text-slate-500 hover:text-slate-200"
    }`;
  const indicator = (isActive: boolean) =>
    isActive ? <span className="absolute left-3 right-3 bottom-0 h-[2px] bg-[#3DDC84] shadow-[0_0_10px_rgba(61,220,132,0.8)]" /> : null;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        scrolled ? "bg-[#0B100E]/92 backdrop-blur-xl border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]" : "bg-[#0B100E]/60 backdrop-blur-md border-white/[0.06]"
      }`}
    >
      <div className="h-[3px] w-full bg-[linear-gradient(90deg,#00893D,#3DDC84_55%,transparent)]" />
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <PannonChip className="h-8 sm:h-9 shrink-0" imgClass="h-[16px] sm:h-[18px] w-auto" />
          <span className="hidden sm:block w-px h-6 bg-white/15" aria-hidden />
          <SchaefflerChip className="h-8 sm:h-9 shrink-0" imgClass="h-[13px] sm:h-[15px] w-auto" />
          <div className="hidden md:flex flex-col min-w-0 pl-1">
            <span className="text-[13px] font-bold text-white leading-none truncate tracking-wide">{tx("navLabel")}</span>
            <span className="font-mono text-[10px] text-[#3DDC84] tracking-[0.22em] uppercase mt-1 truncate">{tx("navSubline")}</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-stretch h-full" aria-label="Primary">
          <Link href="/schaefflermotion" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
            {indicator(active === "booking")}
          </Link>
          <Link href="/schaefflermotion/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
            {indicator(active === "bookings")}
          </Link>
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <MxLangSwitch lang={lang} onChange={onLangChange} />
          <div className="hidden xl:flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-[5px] bg-[#00893D]/15 border border-[#00893D]/40 flex items-center justify-center">
              <UserCircle className="w-4.5 h-4.5 text-[#3DDC84]" />
            </div>
            <span className="font-mono text-[11.5px] text-slate-300 max-w-[200px] truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={tx("signOut")}
            aria-label={tx("signOut")}
            className="w-8 h-8 rounded-[5px] border border-white/15 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.07] hover:border-white/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="lg:hidden border-t border-white/[0.06] px-2">
        <div className="max-w-[1240px] mx-auto flex items-stretch h-10">
          <Link href="/schaefflermotion" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
            {indicator(active === "booking")}
          </Link>
          <Link href="/schaefflermotion/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
            {indicator(active === "bookings")}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MxFooter({ lang }: { lang: MxLang }) {
  const tx = (k: string) => mxText(lang, k);
  const year = new Date().getFullYear();
  return (
    <footer className="relative z-10 border-t border-white/[0.07] bg-[#0B100E]/90 backdrop-blur py-9 px-5 sm:px-6">
      <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="flex items-center gap-3">
          <PannonChip className="h-8" imgClass="h-[15px] w-auto" />
          <SchaefflerChip className="h-8" imgClass="h-[12px] w-auto" />
        </div>
        <div className="text-[12px] text-slate-500 leading-relaxed">
          <div className="text-slate-300 font-medium">
            {tx("needHelp")} {SUPPORT.name} · {tx("supportRole")}
          </div>
          <div className="font-mono text-[11.5px]">
            <a href={`mailto:${SUPPORT.email}`} className="hover:text-[#3DDC84] transition-colors">
              {SUPPORT.email}
            </a>
            {" · "}
            <a href={`tel:${SUPPORT.phoneHref}`} className="hover:text-[#3DDC84] transition-colors">
              {SUPPORT.phone}
            </a>
          </div>
          <div className="mt-1 text-slate-600">
            © {year} Pannon Transfer. {tx("rights")}
          </div>
        </div>
      </div>
    </footer>
  );
}
