"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

export type EcoproBmLang = "hu" | "ko";

export const ECOPROBM_LANG_STORAGE_KEY = "ecoprobm_lang";
const LANG_EVENT = "ecoprobm-lang-change";

export const ECOPROBM_LANGS: { id: EcoproBmLang; label: string; full: string }[] = [
  { id: "hu", label: "HU", full: "Magyar" },
  { id: "ko", label: "한국어", full: "한국어" },
];

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANG_EVENT, onChange);
  };
}

function getSnapshot(): EcoproBmLang {
  try {
    return localStorage.getItem(ECOPROBM_LANG_STORAGE_KEY) === "ko" ? "ko" : "hu";
  } catch {
    return "hu";
  }
}

function getServerSnapshot(): EcoproBmLang {
  return "hu";
}

/** Az Ecopro BM portál felületi nyelve (magyar / koreai), a böngészőben megjegyezve. */
export function useEcoproBmLang(): [EcoproBmLang, (next: EcoproBmLang) => void] {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang === "ko" ? "ko" : "hu";
  }, [lang]);

  const setLang = useCallback((next: EcoproBmLang) => {
    try {
      localStorage.setItem(ECOPROBM_LANG_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  return [lang, setLang];
}
