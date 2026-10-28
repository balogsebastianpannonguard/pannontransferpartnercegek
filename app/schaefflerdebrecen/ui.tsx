"use client";

import React from "react";
import { SD_LANGS, type SdLang } from "./i18n";

/*
 * Schaeffler Debrecen – saját arculat: világos, letisztult céges felület,
 * Schaeffler-zöld (#00893D) kiemelésekkel és mély erdőzöld (#0B3D2A) sávval.
 */

export const SD_PATTERN =
  "bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_14px)]";

export function SdLogos({ size = "md", onDark = false }: { size?: "sm" | "md"; onDark?: boolean }) {
  const h = size === "sm" ? "h-4" : "h-3.5 sm:h-5";
  const hs = size === "sm" ? "h-[15px]" : "h-[13px] sm:h-[18px]";
  const chip = `shrink-0 rounded-lg bg-white flex items-center ${
    size === "sm" ? "h-8 px-2.5" : "h-8 px-2 sm:h-10 sm:px-3"
  } ${onDark ? "shadow-[0_2px_10px_rgba(0,0,0,0.25)]" : "ring-1 ring-[#E1E7E3] shadow-[0_1px_2px_rgba(11,61,42,0.06)]"}`;
  /* eslint-disable @next/next/no-img-element */
  return (
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
      <div className={chip}>
        <img src="/brand/pannon-transfer-logo.png" alt="Pannon Transfer" width={387} height={79} className={`${h} w-auto`} />
      </div>
      <span className={`h-6 w-px ${onDark ? "bg-white/25" : "bg-[#D5DDD8]"}`} aria-hidden />
      <div className={chip}>
        <img src="/partners/schaefflerdebrecen/logo.png" alt="Schaeffler" width={226} height={56} className={`${hs} w-auto`} />
      </div>
    </div>
  );
  /* eslint-enable @next/next/no-img-element */
}

export function SdLangSwitch({
  lang,
  onChange,
  label,
  onDark = false,
}: {
  lang: SdLang;
  onChange: (l: SdLang) => void;
  label: string;
  onDark?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex items-center p-0.5 rounded-lg border ${
        onDark ? "bg-white/10 border-white/20" : "bg-white border-[#DCE3DF]"
      }`}
    >
      {SD_LANGS.map((l) => {
        const active = lang === l.id;
        return (
          <button
            key={l.id}
            type="button"
            title={l.full}
            aria-pressed={active}
            onClick={() => onChange(l.id)}
            className={`h-7 min-w-9 px-2.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${
              active
                ? "bg-[#00893D] text-white shadow-sm"
                : onDark
                  ? "text-white/70 hover:text-white"
                  : "text-[#5C6B63] hover:text-[#0B3D2A]"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

export const SD_SUPPORT = {
  name: "Balog Sebastian Máté",
  email: "balogh.sebastian@pannonguard.hu",
  phone: "+36 30 665 4135",
  phoneHref: "+36306654135",
};

export const sdPrimaryBtn =
  "w-full h-[54px] rounded-xl bg-[#00893D] hover:bg-[#007335] text-white text-[14px] font-semibold shadow-[0_1px_2px_rgba(11,61,42,0.12),0_10px_26px_rgba(0,137,61,0.25)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

export const sdSecondaryBtn =
  "h-[54px] rounded-xl bg-white hover:bg-[#F3F6F4] text-[#0E1A14] text-[14px] font-semibold border border-[#DCE3DF] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

export const sdInput =
  "w-full h-[52px] px-4 bg-white border border-[#DCE3DF] rounded-xl text-[15px] text-[#0E1A14] placeholder:text-[#9AA7A0] font-medium focus:outline-none focus:ring-4 focus:ring-[#00893D]/10 focus:border-[#00893D]/70 transition-all";

export const sdCard =
  "rounded-2xl border border-[#E1E7E3] bg-white shadow-[0_1px_2px_rgba(11,61,42,0.04),0_14px_34px_rgba(11,61,42,0.05)]";
