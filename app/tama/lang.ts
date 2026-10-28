"use client";

import { useSyncExternalStore } from "react";

export type TamaLang = "hu" | "en";

export const TAMA_LANG_STORAGE_KEY = "tama_lang";
const LANG_EVENT = "tama-lang-change";

export const TAMA_LANGS: { id: TamaLang; label: string; full: string }[] = [
  { id: "hu", label: "HU", full: "Magyar" },
  { id: "en", label: "EN", full: "English" },
];

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANG_EVENT, onChange);
  };
}

function getSnapshot(): TamaLang {
  try {
    return localStorage.getItem(TAMA_LANG_STORAGE_KEY) === "en" ? "en" : "hu";
  } catch {
    return "hu";
  }
}

function getServerSnapshot(): TamaLang {
  return "hu";
}

export function setTamaLang(next: TamaLang) {
  try {
    localStorage.setItem(TAMA_LANG_STORAGE_KEY, next);
  } catch {}
  window.dispatchEvent(new Event(LANG_EVENT));
}

/** Aktív felületi nyelv (magyar / angol), a TAMA portál minden oldalán közös. */
export function useTamaLang(): [TamaLang, (next: TamaLang) => void] {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [lang, setTamaLang];
}
