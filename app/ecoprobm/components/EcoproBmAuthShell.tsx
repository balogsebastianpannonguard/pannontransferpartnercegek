"use client";

import React from "react";
import { Mail, Phone } from "lucide-react";
import { ECOPROBM_LANGS, type EcoproBmLang } from "../lang";
import { portalText } from "../portal-i18n";

export interface AuthBrand {
  eyebrow: string;
  title: string; // "első rész|kiemelt rész"
  body: string;
  bullets: { icon: React.ReactNode; title: string; text: string }[];
}

interface Props {
  lang: EcoproBmLang;
  onLangChange: (lang: EcoproBmLang) => void;
  brand: AuthBrand;
  children: React.ReactNode;
  /** A jobb oldali rész maximális szélessége (px). */
  formWidth?: number;
}

export function GradientTitle({ text, className = "" }: { text: string; className?: string }) {
  const [a, b] = text.split("|");
  return (
    <span className={className}>
      {a}
      {b !== undefined && (
        <>
          {" "}
          <span className="bg-gradient-to-r from-[#FFB366] via-[#F28C28] to-[#FF9E4A] bg-clip-text text-transparent">
            {b}
          </span>
        </>
      )}
    </span>
  );
}

/** Osztott képernyős kerek az Ecopro BM belépő / aktiváló oldalaihoz: bal oldalt márka-panel, jobb oldalt az űrlap. */
export default function EcoproBmAuthShell({ lang, onLangChange, brand, children, formWidth = 460 }: Props) {
  const tx = (key: string) => portalText(lang, key);
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#050F20] text-slate-300 flex flex-col lg:flex-row">
      <aside className="relative overflow-hidden lg:w-[46%] xl:w-[44%] bg-[linear-gradient(155deg,#0E4B93_0%,#0A2C5C_52%,#061428_100%)] px-6 sm:px-10 py-8 lg:p-14 flex flex-col lg:min-h-screen">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-[#1E73BE]/35 blur-[110px]" />
          <div className="absolute -bottom-40 -left-24 w-[460px] h-[460px] rounded-full bg-[#F28C28]/18 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_75%)]" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="h-10 px-3 rounded-xl bg-white flex items-center shadow-[0_6px_24px_rgba(0,0,0,0.3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/pannon-transfer-logo.png" alt="Pannon Transfer" width={387} height={79} className="h-5 w-auto" />
          </div>
          <span className="w-px h-6 bg-white/25" aria-hidden />
          <div className="h-10 px-3 rounded-xl bg-white flex items-center shadow-[0_6px_24px_rgba(0,0,0,0.3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/partners/ecoprobm/logo.png" alt="Ecopro BM" width={366} height={81} className="h-5 w-auto" />
          </div>
        </div>

        <div className="relative mt-8 lg:mt-auto lg:mb-auto lg:py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F28C28]/15 border border-[#F28C28]/35 text-[11px] font-bold tracking-[0.2em] uppercase text-[#FFB366] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28]" />
            {brand.eyebrow}
          </div>
          <h1 className="text-[30px] sm:text-[38px] lg:text-[44px] font-semibold tracking-tight leading-[1.08] text-white max-w-xl break-keep">
            <GradientTitle text={brand.title} />
          </h1>
          <p className="mt-4 text-[15px] lg:text-[16px] leading-relaxed text-blue-100/75 max-w-lg break-keep">{brand.body}</p>

          <ul className="hidden lg:block mt-9 space-y-3.5 max-w-lg">
            {brand.bullets.map((b) => (
              <li key={b.title} className="flex items-start gap-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm p-4">
                <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B84D2]/40 to-[#1E73BE]/20 border border-white/15 flex items-center justify-center text-[#9CD0FA]">
                  {b.icon}
                </span>
                <div>
                  <div className="text-[14px] font-semibold text-white">{b.title}</div>
                  <div className="text-[13px] text-blue-100/65 leading-relaxed">{b.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:block text-[12px] text-blue-100/60 leading-relaxed">
          <div className="text-blue-100/85 font-medium">
            {tx("needHelp")} Balog Sebastian Máté · {tx("supportRole")}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <a href="mailto:balogh.sebastian@pannonguard.hu" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5" />
              balogh.sebastian@pannonguard.hu
            </a>
            <a href="tel:+36306654135" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5" />
              +36 30 665 4135
            </a>
          </div>
        </div>
      </aside>

      <main className="relative flex-1 flex flex-col bg-[#071428]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full bg-[#1E73BE]/10 blur-[110px]" />
        </div>

        <div className="relative flex justify-end px-5 sm:px-8 pt-5">
          <div className="flex items-center p-0.5 rounded-xl bg-white/[0.05] border border-white/10" role="group" aria-label={tx("language")}>
            {ECOPROBM_LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onLangChange(l.id)}
                aria-pressed={lang === l.id}
                title={l.full}
                className={`h-8 min-w-10 px-2.5 rounded-[10px] text-[11px] font-bold tracking-wider transition-all ${
                  lang === l.id
                    ? "bg-gradient-to-b from-[#2B84D2] to-[#1E73BE] text-white shadow-[0_2px_10px_rgba(30,115,190,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1 flex items-center justify-center px-5 sm:px-8 py-10">
          <div className="w-full" style={{ maxWidth: formWidth }}>
            {children}
          </div>
        </div>

        <footer className="relative px-5 sm:px-8 py-5 border-t border-white/[0.06] text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <span>
            © {year} Pannon Transfer. {tx("rights")}
          </span>
          <span className="lg:hidden">
            {tx("supportRole")}: Balog Sebastian Máté ·{" "}
            <a href="mailto:balogh.sebastian@pannonguard.hu" className="hover:text-white">balogh.sebastian@pannonguard.hu</a>
          </span>
          <span className="hidden lg:inline tracking-wider">{tx("footerTag")}</span>
        </footer>
      </main>
    </div>
  );
}
