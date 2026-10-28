"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type MxLang = "hu" | "en";

export const MX_LANG_STORAGE_KEY = "schaefflermotion_lang";
const MX_LANG_EVENT = "schaefflermotion-lang-change";

export const MX_LANGS: { id: MxLang; label: string; full: string }[] = [
  { id: "hu", label: "HU", full: "Magyar" },
  { id: "en", label: "EN", full: "English" },
];

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(MX_LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(MX_LANG_EVENT, onChange);
  };
}

function getSnapshot(): MxLang {
  try {
    return localStorage.getItem(MX_LANG_STORAGE_KEY) === "en" ? "en" : "hu";
  } catch {
    return "hu";
  }
}

function getServerSnapshot(): MxLang {
  return "hu";
}

/** Portal language (Hungarian default, English optional), persisted in localStorage and shared across all Schaeffler Motion pages. */
export function useMxLang(): [MxLang, (next: MxLang) => void] {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: MxLang) => {
    try {
      localStorage.setItem(MX_LANG_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(MX_LANG_EVENT));
  }, []);

  return [lang, setLang];
}

export const MX_LOCALE: Record<MxLang, string> = { hu: "hu-HU", en: "en-GB" };
