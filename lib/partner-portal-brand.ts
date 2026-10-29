import type { Language } from "@/lib/translations";

export type PartnerPortalKey =
  | "catl"
  | "ecoproinnovation"
  | "ecoprobm"
  | "schaefflermotion"
  | "schaefflerdebrecen"
  | "tama"
  | "ibusz"
  | "ni";

type PartnerPortalBrand = {
  key: PartnerPortalKey;
  allowedLanguages: Language[];
  navLabel: string;
  navSubline: string;
  deskLabel: string;
  heroTitle: string;
  heroDescription: string;
  heroHighlights: string[];
};

const DEFAULT_LANGUAGES: Language[] = ["hu", "en"];
const CN_LANGUAGES: Language[] = ["hu", "en", "zh"];
const CATL_LANGUAGES: Language[] = ["en", "zh"];
const ECOPRO_LANGUAGES: Language[] = ["hu", "en", "ko"];

export const PARTNER_PORTAL_BRANDS: Record<PartnerPortalKey, PartnerPortalBrand> = {
  catl: {
    key: "catl",
    allowedLanguages: CATL_LANGUAGES,
    navLabel: "CATL Mobility Desk",
    navSubline: "Dedicated CATL Portal",
    deskLabel: "CATL Booking Desk",
    heroTitle: "CATL vallalati mobilitasi kozpont",
    heroDescription:
      "Dedikalt vallalati foglalasi felulet a CATL delegacios, gyarlatogatasi es napi dolgozoi transzfereihez.",
    heroHighlights: ["Delegacios fokusz", "Kinai nyelvi tamogatas", "Prioritolt repteri utak"],
  },
  ecoproinnovation: {
    key: "ecoproinnovation",
    allowedLanguages: ECOPRO_LANGUAGES,
    navLabel: "Ecopro Innovation Transfer Desk",
    navSubline: "Dedicated Ecopro Innovation Portal",
    deskLabel: "Ecopro Innovation Booking Desk",
    heroTitle: "Ecopro Innovation repteri es vallalati transzfer desk",
    heroDescription:
      "Ecopro Innovation-specifikus foglalasi elmeny, kulon gyari es repteri utakra hangolt vallalati kornyezettel.",
    heroHighlights: ["Kinai nyelvi tamogatas", "Repteri workflow", "Ipari vallalati ritmus"],
  },
  ecoprobm: {
    key: "ecoprobm",
    allowedLanguages: ECOPRO_LANGUAGES,
    navLabel: "Ecopro BM Transfer Desk",
    navSubline: "Dedicated Ecopro BM Portal",
    deskLabel: "Ecopro BM Booking Desk",
    heroTitle: "Ecopro BM repteri es vallalati transzfer desk",
    heroDescription:
      "Ecopro BM-specifikus foglalasi elmeny, kulon gyari es repteri utakra hangolt vallalati kornyezettel.",
    heroHighlights: ["Kinai nyelvi tamogatas", "Repteri workflow", "Ipari vallalati ritmus"],
  },
  schaefflermotion: {
    key: "schaefflermotion",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "Schaeffler Motion Mobility Desk",
    navSubline: "Schaeffler Motion Corporate Portal",
    deskLabel: "Schaeffler Motion Booking Desk",
    heroTitle: "Schaeffler Motion gyari es delegacios fuvarok",
    heroDescription:
      "Sajatos Schaeffler Motion portal kulon partneridentitassal, gyari kiindulasi pontokra es vallalati utakra hangolva.",
    heroHighlights: ["Gyari pickup fokusz", "Ketnyelvu UI", "Partnerenkent kulon mentes"],
  },
  schaefflerdebrecen: {
    key: "schaefflerdebrecen",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "Schaeffler Debrecen Mobility Desk",
    navSubline: "Schaeffler Debrecen Corporate Portal",
    deskLabel: "Schaeffler Debrecen Booking Desk",
    heroTitle: "Schaeffler Debrecen gyari es delegacios fuvarok",
    heroDescription:
      "Sajatos Schaeffler Debrecen portal kulon partneridentitassal, gyari kiindulasi pontokra es vallalati utakra hangolva.",
    heroHighlights: ["Gyari pickup fokusz", "Ketnyelvu UI", "Partnerenkent kulon mentes"],
  },
  ibusz: {
    key: "ibusz",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "IBUSZ Mobility Desk",
    navSubline: "IBUSZ Hungary Corporate Portal",
    deskLabel: "IBUSZ Booking Desk",
    heroTitle: "IBUSZ Hungary Kft. vallalati transzfer desk",
    heroDescription:
      "Dedikalt IBUSZ Hungary Kft. foglalasi felulet kulon partneridentitassal es sajat booking kontextussal.",
    heroHighlights: ["Utazasszervezoi fokusz", "Ketnyelvu UI", "Partnerenkent kulon mentes"],
  },
  tama: {
    key: "tama",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "TAMA Route Desk",
    navSubline: "TAMA Hungary Kft. Logistics Portal",
    deskLabel: "TAMA Booking Desk",
    heroTitle: "TAMA Hungary Kft. logisztikai utvonal desk",
    heroDescription:
      "TAMA Hungary Kft.-specifikus partneroldal a Debrecen, Budapest es Bujfalu kozotti logisztikai vallalati utakhoz.",
    heroHighlights: ["Logisztikai utak", "Ketnyelvu UI", "Hazai utvonalakra szabva"],
  },
  ni: {
    key: "ni",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "NI Mobility Desk",
    navSubline: "NI Technology Portal",
    deskLabel: "NI Booking Desk",
    heroTitle: "NI technologiai mobilitasi desk",
    heroDescription:
      "Kulon NI portal a technologiai partnerutakhoz, sajat karakterrel, sajat booking kontextussal es tiszta ketnyelvu felulettel.",
    heroHighlights: ["Technologiai partner", "Ketnyelvu UI", "Kulon enterprise workflow"],
  },
};

export function getPartnerPortalBrand(partnerKey: PartnerPortalKey): PartnerPortalBrand {
  return PARTNER_PORTAL_BRANDS[partnerKey];
}

export function getPartnerKeyFromPath(pathname: string): PartnerPortalKey | null {
  const key = pathname.split("/").filter(Boolean)[0];
  if (!key) return null;
  return key in PARTNER_PORTAL_BRANDS ? (key as PartnerPortalKey) : null;
}

export function getAllowedLanguagesForPath(pathname: string): Language[] {
  const key = getPartnerKeyFromPath(pathname);
  return key ? PARTNER_PORTAL_BRANDS[key].allowedLanguages : DEFAULT_LANGUAGES;
}
