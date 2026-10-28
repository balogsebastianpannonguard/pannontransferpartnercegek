"use client";

import React from "react";
import Link from "next/link";
import { ListOrdered, LogOut, PlusCircle, UserCircle } from "lucide-react";
import {
  CATL_LANGS,
  catlText,
  type CatlLang,
} from "../booking-i18n";

interface Props {
  lang: CatlLang;
  onLangChange: (lang: CatlLang) => void;
  email: string;
  scrolled: boolean;
  active: "booking" | "bookings";
  onLogout: () => void;
}

export default function CatlBookingHeader({
  lang,
  onLangChange,
  email,
  scrolled,
  active,
  onLogout,
}: Props) {
  const tx = (key: string) => catlText(lang, key);

  const navLink = (isActive: boolean) =>
    `relative inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-semibold tracking-wide transition-colors ${
      isActive
        ? "text-white bg-white/[0.07]"
        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
    }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#050B18]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          : "bg-[#050B18]/40 backdrop-blur-md border-b border-white/[0.06]"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="shrink-0 h-9 sm:h-10 px-2.5 rounded-lg bg-white flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/pannon-transfer-logo.png"
              alt="Pannon Transfer"
              width={387}
              height={79}
              className="h-5 sm:h-6 w-auto"
            />
          </div>
          <span className="hidden sm:block w-px h-7 bg-white/15" aria-hidden />
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 h-9 sm:h-10 px-2.5 rounded-lg bg-white flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/partners/catl/logo.png"
                alt="CATL"
                width={139}
                height={45}
                className="h-4 sm:h-[18px] w-auto"
              />
            </div>
            <div className="hidden md:flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-white leading-none truncate">
                {tx("navLabel")}
              </span>
              <span className="text-[10px] font-medium tracking-[0.18em] text-slate-400 uppercase mt-1 truncate">
                {tx("navSubline")}
              </span>
            </div>
          </div>
        </div>

        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Primary"
        >
          <Link href="/catl" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
          </Link>
          <Link href="/catl/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="flex items-center p-0.5 rounded-lg bg-white/[0.05] border border-white/10"
            role="group"
            aria-label={tx("language")}
          >
            {CATL_LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onLangChange(l.id)}
                aria-pressed={lang === l.id}
                title={l.full}
                className={`h-7 min-w-9 px-2.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${
                  lang === l.id
                    ? "bg-[#0047BA] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0047BA] to-[#2F7BE0] flex items-center justify-center ring-1 ring-white/10">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[12px] font-semibold text-slate-200 max-w-[190px] truncate">
              {email}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title={tx("signOut")}
            aria-label={tx("signOut")}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="lg:hidden border-t border-white/[0.06] px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto flex items-center gap-1 h-11">
          <Link href="/catl" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
          </Link>
          <Link href="/catl/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
          </Link>
        </div>
      </div>
    </header>
  );
}
