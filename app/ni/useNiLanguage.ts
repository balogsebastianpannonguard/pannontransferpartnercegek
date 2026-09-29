"use client";

import { useCallback } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translateNiErrorList, translateNiServerMessage } from "@/lib/ni-messages";
import type { PortalLanguage } from "@/lib/portal-language";

// Az NI portál kétnyelvű (hu / en) segédje. Magyar nyelvnél minden szöveg pontosan
// a korábbi magyar szöveg marad, angolnál az "en" ág jelenik meg.
export function useNiLanguage() {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const english = language === "en";
  const portalLanguage: PortalLanguage = english ? "en" : "hu";
  const locale = english ? "en-GB" : "hu-HU";

  const tr = useCallback(<T,>(hu: T, en: T): T => (english ? en : hu), [english]);
  const msg = useCallback(
    (message: string | undefined | null) => translateNiServerMessage(message, english),
    [english]
  );
  const msgList = useCallback(
    (messages: string[] | undefined | null) => translateNiErrorList(messages, english),
    [english]
  );

  return { english, language, portalLanguage, locale, tr, msg, msgList, setLanguage, availableLanguages };
}
