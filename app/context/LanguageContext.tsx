"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Language } from "@/lib/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof typeof translations.hu, key: string, params?: Record<string, string>) => any;
  isTransitioning: boolean;
  transitioningTo: Language | null;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("zh");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitioningTo, setTransitioningTo] = useState<Language | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    const savedLang = localStorage.getItem("catl_lang") as Language;
    if (savedLang && (savedLang === "hu" || savedLang === "en" || savedLang === "zh")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    
    // Trigger transition effect
    setIsTransitioning(true);
    setTransitioningTo(lang);
    
    setTimeout(() => {
      setLanguageState(lang);
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
    const dict = translations[language][section] as any;
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
    <LanguageContext.Provider value={{ language, setLanguage, t, isTransitioning, transitioningTo }}>
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