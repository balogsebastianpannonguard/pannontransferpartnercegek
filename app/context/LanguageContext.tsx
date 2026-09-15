"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { translations, Language } from "@/lib/translations";
import { getAllowedLanguagesForPath } from "@/lib/partner-portal-brand";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof typeof translations.hu, key: string, params?: Record<string, string>) => string;
  isTransitioning: boolean;
  transitioningTo: Language | null;
  availableLanguages: Language[];
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [preferredLanguage, setPreferredLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "hu";

    const allowedLanguages = getAllowedLanguagesForPath(window.location.pathname);
    const savedLang = localStorage.getItem("catl_lang") as Language;

    if (
      savedLang &&
      (savedLang === "hu" || savedLang === "en" || savedLang === "zh") &&
      allowedLanguages.includes(savedLang)
    ) {
      return savedLang;
    }

    return allowedLanguages[0] || "hu";
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitioningTo, setTransitioningTo] = useState<Language | null>(null);
  const availableLanguages = useMemo(() => getAllowedLanguagesForPath(pathname || "/"), [pathname]);
  const language = availableLanguages.includes(preferredLanguage)
    ? preferredLanguage
    : (availableLanguages[0] || "hu");

  const setLanguage = (lang: Language) => {
    if (!availableLanguages.includes(lang) || lang === language) return;
    
    // Trigger transition effect
    setIsTransitioning(true);
    setTransitioningTo(lang);
    
    setTimeout(() => {
      setPreferredLanguage(lang);
      localStorage.setItem("catl_lang", lang);
      
      // Remove transition effect after DOM updates
      setTimeout(() => {
        setIsTransitioning(false);
        // Keep the target language state briefly for exit animations
        setTimeout(() => setTransitioningTo(null), 1000);
      }, 50);
    }, 700); // 700ms extreme fade out duration
  };

  const t = (section: keyof typeof translations.hu, key: string, params?: Record<string, string>) => {
    const dict = translations[language][section] as Record<string, string>;
    if (!dict) return key;
    
    let text = dict[key] || key;
    
    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTransitioning, transitioningTo, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
