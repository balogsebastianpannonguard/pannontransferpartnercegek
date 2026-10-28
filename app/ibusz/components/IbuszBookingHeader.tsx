"use client";

import React from "react";
import Link from "next/link";
import { ListOrdered, LogOut, PlusCircle, UserCircle } from "lucide-react";
import type { IbuszLang } from "../lang";
import { ibText } from "../i18n";
import { IbuszLogo, LangSwitch, PannonChip } from "./IbuszBrand";

interface Props {
  lang: IbuszLang;
  onLangChange: (lang: IbuszLang) => void;
  email: string;
  scrolled: boolean;
  active: "booking" | "bookings";
  onLogout: () => void;
}

export default function IbuszBookingHeader({
  lang,
  onLangChange,
  email,
  scrolled,
  active,
  onLogout,
}: Props) {
  const tx = (key: Parameters<typeof ibText>[1]) => ibText(lang, key);
  const solid = scrolled;

  const navLink = (isActive: boolean) =>
    `relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide transition-all ${
      solid
        ? isActive
          ? "bg-[#004A8D] text-white shadow-[0_4px_14px_rgba(0,74,141,0.28)]"
          : "text-slate-600 hover:text-[#004A8D] hover:bg-[#004A8D]/[0.06]"
        : isActive
          ? "bg-white text-[#004A8D] shadow-[0_4px_14px_rgba(0,30,70,0.25)]"
          : "text-white/85 hover:text-white hover:bg-white/10"
    }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_8px_30px_rgba(15,34,56,0.08)]"
          : "bg-transparent border-b border-white/10"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className={`shrink-0 h-9 sm:h-10 px-3 rounded-xl flex items-center transition-all ${
              solid
                ? "bg-white ring-1 ring-slate-200"
                : "bg-white shadow-[0_2px_10px_rgba(0,30,70,0.25)]"
            }`}
          >
            <PannonChip className="h-4 sm:h-5" />
          </div>
          <span
            className={`hidden sm:block w-px h-7 ${solid ? "bg-slate-200" : "bg-white/25"}`}
            aria-hidden
          />
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`shrink-0 h-9 sm:h-10 px-3 rounded-xl flex items-center transition-all ${
                solid
                  ? "bg-white ring-1 ring-slate-200"
                  : "bg-white shadow-[0_2px_10px_rgba(0,30,70,0.25)]"
              }`}
            >
              <IbuszLogo className="h-6 sm:h-7" />
            </div>
            <div className="hidden xl:flex flex-col min-w-0">
              <span
                className={`text-[14px] font-bold leading-none truncate ${
                  solid ? "text-slate-900" : "text-white"
                }`}
              >
                {tx("navLabel")}
              </span>
              <span
                className={`text-[10px] font-semibold tracking-[0.18em] uppercase mt-1 truncate ${
                  solid ? "text-[#F39200]" : "text-[#FFC24D]"
                }`}
              >
                {tx("navSubline")}
              </span>
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          <Link href="/ibusz" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
          </Link>
          <Link href="/ibusz/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LangSwitch
            lang={lang}
            onChange={onLangChange}
            tone={solid ? "light" : "dark"}
            label={tx("language")}
          />

          <div className="hidden xl:flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#004A8D] to-[#0C6BB5] flex items-center justify-center ring-2 ring-[#F39200]/70">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-[12px] font-semibold max-w-[190px] truncate ${
                solid ? "text-slate-700" : "text-white"
              }`}
            >
              {email}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title={tx("signOut")}
            aria-label={tx("signOut")}
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
              solid
                ? "bg-white border-slate-200 text-slate-500 hover:text-[#004A8D] hover:border-[#004A8D]/40"
                : "bg-white/10 border-white/20 text-white/85 hover:bg-white/20 hover:text-white"
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden border-t px-4 sm:px-6 ${
          solid ? "border-slate-200/80" : "border-white/10"
        }`}
      >
        <div className="max-w-[1200px] mx-auto flex items-center gap-1 h-12">
          <Link href="/ibusz" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
          </Link>
          <Link href="/ibusz/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
          </Link>
        </div>
      </div>
    </header>
  );
}
