"use client";

import { useCallback, useSyncExternalStore } from "react";

export type IbuszLang = "hu" | "en";

export const IBUSZ_LANG_STORAGE_KEY = "ibusz_lang";

export const IBUSZ_LANGS: { id: IbuszLang; label: string; full: string }[] = [
  { id: "hu", label: "HU", full: "Magyar" },
  { id: "en", label: "EN", full: "English" },
];

const LANG_EVENT = "ibusz-lang-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LANG_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LANG_EVENT, onChange);
  };
}

function getSnapshot(): IbuszLang {
  try {
    return localStorage.getItem(IBUSZ_LANG_STORAGE_KEY) === "en" ? "en" : "hu";
  } catch {
    return "hu";
  }
}

function getServerSnapshot(): IbuszLang {
  return "hu";
}

export function useIbuszLang(): [IbuszLang, (next: IbuszLang) => void] {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLang = useCallback((next: IbuszLang) => {
    try {
      localStorage.setItem(IBUSZ_LANG_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);
  return [lang, setLang];
}
