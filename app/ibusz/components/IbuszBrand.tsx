"use client";

import React from "react";
import { IBUSZ_LOGO, PANNON_LOGO } from "../brand";
import { IBUSZ_LANGS, type IbuszLang } from "../lang";

/* eslint-disable @next/next/no-img-element */

export function PannonChip({ className = "h-5" }: { className?: string }) {
  return (
    <img
      src={PANNON_LOGO}
      alt="Pannon Transfer"
      width={387}
      height={79}
      className={`${className} w-auto`}
    />
  );
}

export function IbuszLogo({ className = "h-8" }: { className?: string }) {
  return (
    <img
      src={IBUSZ_LOGO}
      alt="IBUSZ"
      width={211}
      height={75}
      className={`${className} w-auto`}
    />
  );
}

/** Both logos side by side, each on a white chip (works on blue as well as white). */
export function LogoPair({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const chip =
    size === "lg"
      ? "h-12 px-3.5"
      : size === "md"
        ? "h-10 px-3"
        : "h-9 px-2.5";
  const pannon = size === "lg" ? "h-6" : size === "md" ? "h-5" : "h-4";
  const ibusz = size === "lg" ? "h-9" : size === "md" ? "h-7" : "h-6";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${chip} rounded-xl bg-white flex items-center shadow-[0_2px_10px_rgba(0,40,90,0.18)] ring-1 ring-black/[0.04]`}
      >
        <PannonChip className={pannon} />
      </div>
      <span className="text-white/40 text-lg font-light select-none" aria-hidden>
        ×
      </span>
      <div
        className={`${chip} rounded-xl bg-white flex items-center shadow-[0_2px_10px_rgba(0,40,90,0.18)] ring-1 ring-black/[0.04]`}
      >
        <IbuszLogo className={ibusz} />
      </div>
    </div>
  );
}

export function LangSwitch({
  lang,
  onChange,
  tone = "dark",
  label,
}: {
  lang: IbuszLang;
  onChange: (l: IbuszLang) => void;
  tone?: "dark" | "light";
  label: string;
}) {
  const wrap =
    tone === "dark"
      ? "bg-white/10 border-white/20"
      : "bg-slate-100 border-slate-200";
  return (
    <div
      className={`flex items-center p-0.5 rounded-full border ${wrap}`}
      role="group"
      aria-label={label}
    >
      {IBUSZ_LANGS.map((l) => {
        const active = lang === l.id;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onChange(l.id)}
            aria-pressed={active}
            title={l.full}
            className={`h-7 min-w-10 px-3 rounded-full text-[11px] font-bold tracking-wider transition-all ${
              active
                ? "bg-[#F39200] text-white shadow-sm"
                : tone === "dark"
                  ? "text-white/75 hover:text-white"
                  : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Sky-blue hero backdrop with a setting sun, soft rays and a wavy horizon that
 * melts into the page background (`fill`).
 */
export function HeroBackdrop({
  height = 420,
  fill = "#F4F7FB",
  waves = true,
}: {
  height?: number | string;
  fill?: string;
  waves?: boolean;
}) {
  return (
    <div
      className="absolute inset-x-0 top-0 overflow-hidden pointer-events-none"
      style={{ height }}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#00386B_0%,#004A8D_45%,#0C6BB5_100%)]" />
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_20%,#fff_0,transparent_40%)]" />
      <svg
        className={
          waves
            ? "absolute -right-36 -top-8 w-[340px] h-[340px] md:-right-24 md:top-6 md:w-[560px] md:h-[560px] opacity-90"
            : "absolute -right-40 -top-32 w-[460px] h-[460px] opacity-90"
        }
        viewBox="0 0 560 560"
        fill="none"
      >
        <defs>
          <radialGradient id="ib-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFC24D" stopOpacity="1" />
            <stop offset="55%" stopColor="#F39200" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F39200" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ib-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFB84D" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFB84D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="280" cy="280" r="280" fill="url(#ib-glow)" />
        <circle cx="280" cy="280" r="150" fill="url(#ib-sun)" />
        <circle cx="280" cy="280" r="104" fill="#F39200" fillOpacity="0.92" />
        <circle cx="280" cy="280" r="104" fill="url(#ib-sun)" />
        <g className="hidden md:block">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
          <line
            key={a}
            x1="280"
            y1="96"
            x2="280"
            y2="60"
            stroke="#FFC24D"
            strokeOpacity="0.32"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${a} 280 280)`}
          />
        ))}
        </g>
      </svg>
      {waves && (
      <svg
        className="absolute bottom-0 inset-x-0 w-full h-[110px]"
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 70 C 180 20, 360 20, 540 62 C 720 104, 900 104, 1080 60 C 1230 24, 1340 30, 1440 58 L1440 110 L0 110 Z"
          fill="#ffffff"
          fillOpacity="0.14"
        />
        <path
          d="M0 86 C 200 46, 380 52, 560 84 C 740 116, 920 108, 1100 80 C 1240 58, 1350 62, 1440 82 L1440 110 L0 110 Z"
          fill="#ffffff"
          fillOpacity="0.22"
        />
        <path
          d="M0 100 C 220 72, 420 76, 620 98 C 820 120, 1020 110, 1200 92 C 1310 82, 1390 86, 1440 96 L1440 110 L0 110 Z"
          fill={fill}
        />
      </svg>
      )}
    </div>
  );
}

export function SupportCard({
  title,
  role,
  tone = "light",
}: {
  title: string;
  role: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-2xl p-4 ${
        tone === "light"
          ? "bg-white border border-slate-200/80 shadow-[0_1px_2px_rgba(15,34,56,0.04),0_10px_30px_rgba(15,34,56,0.05)]"
          : "bg-white/10 border border-white/15"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#004A8D] text-[13px] font-bold text-white ring-4 ring-[#F39200]/25">
        BS
      </div>
      <div
        className={`min-w-0 text-[13px] leading-relaxed ${
          tone === "light" ? "text-slate-600" : "text-white/80"
        }`}
      >
        <div
          className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
            tone === "light" ? "text-slate-400" : "text-white/55"
          }`}
        >
          {title}
        </div>
        <div className={`font-semibold ${tone === "light" ? "text-slate-900" : "text-white"}`}>
          Balog Sebastian Máté · {role}
        </div>
        <a
          href="mailto:balogh.sebastian@pannonguard.hu"
          className={tone === "light" ? "text-[#004A8D] hover:underline" : "text-[#FFC24D] hover:underline"}
        >
          balogh.sebastian@pannonguard.hu
        </a>
        {" · "}
        <a
          href="tel:+36306654135"
          className={tone === "light" ? "text-[#004A8D] hover:underline" : "text-[#FFC24D] hover:underline"}
        >
          +36 30 665 4135
        </a>
      </div>
    </div>
  );
}
