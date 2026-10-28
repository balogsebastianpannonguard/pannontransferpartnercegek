"use client";

import React from "react";
import Link from "next/link";
import { ListOrdered, LogOut, PlusCircle, UserCircle } from "lucide-react";
import { type SdKey, type SdLang } from "../i18n";
import { SdLangSwitch, SdLogos } from "../ui";

interface Props {
  lang: SdLang;
  tx: (key: SdKey, params?: Record<string, string | number>) => string;
  onLangChange: (lang: SdLang) => void;
  email: string;
  scrolled: boolean;
  active: "booking" | "bookings";
  onLogout: () => void;
}

export default function SchaefflerDebrecenHeader({ lang, tx, onLangChange, email, scrolled, active, onLogout }: Props) {
  const navLink = (isActive: boolean) =>
    `relative inline-flex items-center gap-2 px-3.5 h-10 rounded-lg text-[13px] font-semibold tracking-wide transition-colors ${
      isActive ? "text-[#0B3D2A] bg-[#E7F4EC]" : "text-[#5C6B63] hover:text-[#0B3D2A] hover:bg-[#F1F5F2]"
    }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-xl border-b transition-shadow duration-300 ${
        scrolled ? "border-[#DCE3DF] shadow-[0_8px_30px_rgba(11,61,42,0.08)]" : "border-[#E8EDEA]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[#00893D]" aria-hidden />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 sm:h-[72px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <SdLogos />
          <div className="hidden xl:flex flex-col min-w-0 border-l border-[#E1E7E3] pl-4">
            <span className="text-[13px] font-bold text-[#0E1A14] leading-none truncate">{tx("navLabel")}</span>
            <span className="text-[10px] font-semibold tracking-[0.16em] text-[#7B8A82] uppercase mt-1 truncate">
              {tx("navSubline")}
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          <Link href="/schaefflerdebrecen" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
          </Link>
          <Link href="/schaefflerdebrecen/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <SdLangSwitch lang={lang} onChange={onLangChange} label={tx("language")} />
          <div className="hidden xl:flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-full bg-[#0B3D2A] flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[12px] font-semibold text-[#31413A] max-w-[190px] truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={tx("signOut")}
            aria-label={tx("signOut")}
            className="w-9 h-9 rounded-xl bg-white border border-[#DCE3DF] flex items-center justify-center text-[#5C6B63] hover:text-[#0B3D2A] hover:bg-[#F1F5F2] transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="lg:hidden border-t border-[#E8EDEA] px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto flex items-center gap-1 h-11">
          <Link href="/schaefflerdebrecen" className={navLink(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
          </Link>
          <Link href="/schaefflerdebrecen/bookings" className={navLink(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
          </Link>
        </div>
      </div>
    </header>
  );
}
