"use client";

import { useNiLanguage } from "../useNiLanguage";

export default function NiLanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage, availableLanguages } = useNiLanguage();

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {availableLanguages.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          aria-label={lang === "hu" ? "Magyar" : "English"}
          aria-pressed={language === lang}
          className={`w-8 h-8 rounded flex items-center justify-center text-[11px] font-bold tracking-wider transition-all duration-200 ${
            language === lang
              ? "bg-[#41B679] text-white shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
