"use client";

import React from "react";
import Link from "next/link";
import { ListOrdered, LogOut, PlusCircle, UserCircle } from "lucide-react";
import { ECOPROBM_LANGS, type EcoproBmLang } from "../lang";
import { ecoproBmText } from "../booking-i18n";

interface Props {
  lang: EcoproBmLang;
  onLangChange: (lang: EcoproBmLang) => void;
  email: string;
  active: "booking" | "bookings";
  onLogout: () => void;
}

/** Lebegő, üvegszerű fejléc: logók, navigáció, nyelvváltó, felhasználó. */
export default function EcoproBmBookingHeader({
  lang,
  onLangChange,
  email,
  active,
  onLogout,
}: Props) {
  const tx = (key: string) => ecoproBmText(lang, key);

  const navItem = (isActive: boolean) =>
    `relative inline-flex flex-1 md:flex-none items-center justify-center gap-2 px-4 h-10 rounded-xl text-[13px] font-semibold tracking-wide transition-colors ${
      isActive
        ? "text-white bg-white/[0.08]"
        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
    }`;

  const underline = (
    <span
      aria-hidden
      className="absolute left-4 right-4 -bottom-[3px] h-[3px] rounded-full bg-gradient-to-r from-[#F28C28] to-[#FFB366]"
    />
  );

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6">
      <div className="mx-auto max-w-[1180px] rounded-2xl border border-white/10 bg-[#071428]/80 backdrop-blur-xl shadow-[0_14px_44px_rgba(2,8,20,0.6)] px-3 sm:px-4 py-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-x-3 gap-y-2.5">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="shrink-0 h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg bg-white flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/pannon-transfer-logo.png"
              alt="Pannon Transfer"
              width={387}
              height={79}
              className="h-4 sm:h-5 w-auto"
            />
          </div>
          <span className="w-px h-6 bg-white/15" aria-hidden />
          <div className="shrink-0 h-8 sm:h-9 px-2 sm:px-2.5 rounded-lg bg-white flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/partners/ecoprobm/logo.png"
              alt="Ecopro BM"
              width={366}
              height={81}
              className="h-[14px] sm:h-[18px] w-auto"
            />
          </div>
        </div>

        <nav
          className="order-last md:order-none w-full md:w-auto flex items-center gap-1 p-1 rounded-2xl bg-black/20 border border-white/[0.06]"
          aria-label="Primary"
        >
          <Link href="/ecoprobm" className={navItem(active === "booking")}>
            <PlusCircle className="w-4 h-4" />
            {tx("navBooking")}
            {active === "booking" && underline}
          </Link>
          <Link href="/ecoprobm/bookings" className={navItem(active === "bookings")}>
            <ListOrdered className="w-4 h-4" />
            {tx("navMyBookings")}
            {active === "bookings" && underline}
          </Link>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center p-0.5 rounded-xl bg-white/[0.05] border border-white/10"
            role="group"
            aria-label={tx("language")}
          >
            {ECOPROBM_LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onLangChange(l.id)}
                aria-pressed={lang === l.id}
                title={l.full}
                className={`h-8 min-w-8 sm:min-w-10 px-2 sm:px-2.5 rounded-[10px] text-[11px] font-bold tracking-wider transition-all ${
                  lang === l.id
                    ? "bg-gradient-to-b from-[#2B84D2] to-[#1E73BE] text-white shadow-[0_2px_10px_rgba(30,115,190,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2.5 pl-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3C7A] to-[#1E73BE] flex items-center justify-center ring-1 ring-white/10">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[12px] font-semibold text-slate-200 max-w-[170px] truncate">
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
    </header>
  );
}
