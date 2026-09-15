import type { Language } from "@/lib/translations";

export type PartnerPortalKey =
  | "catl"
  | "ecopro"
  | "eccoino"
  | "vitesco"
  | "schaeffler"
  | "krones"
  | "enterair"
  | "tama"
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

export const PARTNER_PORTAL_BRANDS: Record<PartnerPortalKey, PartnerPortalBrand> = {
  catl: {
    key: "catl",
    allowedLanguages: CN_LANGUAGES,
    navLabel: "CATL Mobility Desk",
    navSubline: "Dedicated CATL Portal",
    deskLabel: "CATL Booking Desk",
    heroTitle: "CATL vallalati mobilitasi kozpont",
    heroDescription:
      "Dedikalt vallalati foglalasi felulet a CATL delegacios, gyarlatogatasi es napi dolgozoi transzfereihez.",
    heroHighlights: ["Delegacios fokusz", "Kinai nyelvi tamogatas", "Prioritolt repteri utak"],
  },
  ecopro: {
    key: "ecopro",
    allowedLanguages: CN_LANGUAGES,
    navLabel: "EcoPro Transfer Desk",
    navSubline: "Dedicated EcoPro Portal",
    deskLabel: "EcoPro Booking Desk",
    heroTitle: "EcoPro repteri es vallalati transzfer desk",
    heroDescription:
      "EcoPro-specifikus foglalasi elmeny, kulon gyari es repteri utakra hangolt vallalati kornyezettel.",
    heroHighlights: ["Kinai nyelvi tamogatas", "Repteri workflow", "Ipari vallalati ritmus"],
  },
  eccoino: {
    key: "eccoino",
    allowedLanguages: CN_LANGUAGES,
    navLabel: "Eccoino Mobility Desk",
    navSubline: "Dedicated Eccoino Portal",
    deskLabel: "Eccoino Booking Desk",
    heroTitle: "Eccoino nemzetkozi mobilitasi portal",
    heroDescription:
      "Az Eccoino felulete a nemzetkozi uzleti utakhoz, bovitett partner ritmussal es kulon kezelt foglalasi folyamattal.",
    heroHighlights: ["Kinai nyelvi tamogatas", "Nemzetkozi utak", "Kulon partner workflow"],
  },
  vitesco: {
    key: "vitesco",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "Vitesco Executive Desk",
    navSubline: "Vitesco Corporate Portal",
    deskLabel: "Vitesco Booking Desk",
    heroTitle: "Vitesco executive es gyarlatogatasi transzferek",
    heroDescription:
      "Kulon Vitesco arculatra hangolt foglalasi oldal vezetoi, partneri es gyarlatogatasi utak szervezesehez.",
    heroHighlights: ["Executive hangsuly", "Magyar es angol UI", "Autoipari partner ritmus"],
  },
  schaeffler: {
    key: "schaeffler",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "Schaeffler Mobility Desk",
    navSubline: "Schaeffler Corporate Portal",
    deskLabel: "Schaeffler Booking Desk",
    heroTitle: "Schaeffler gyari es delegacios fuvarok",
    heroDescription:
      "Sajatos Schaeffler portal kulon partneridentitassal, gyari kiindulasi pontokra es vallalati utakra hangolva.",
    heroHighlights: ["Gyari pickup fokusz", "Ketnyelvu UI", "Partnerenkent kulon mentes"],
  },
  krones: {
    key: "krones",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "Krones Transit Desk",
    navSubline: "Krones Operations Portal",
    deskLabel: "Krones Booking Desk",
    heroTitle: "Krones uzemi es varosi shuttle koordinacio",
    heroDescription:
      "A Krones portal uzemi es varosi mozgast tamogat, sajat hangulattal es egyedi vallalati mobilitasi kontextussal.",
    heroHighlights: ["Uzemi transzferek", "Ketnyelvu UI", "Gyartasi ritmusra hangolva"],
  },
  enterair: {
    key: "enterair",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "Enter Air Crew Desk",
    navSubline: "Enter Air Crew Portal",
    deskLabel: "Enter Air Booking Desk",
    heroTitle: "Enter Air crew es legi transzfer portal",
    heroDescription:
      "Sajat Enter Air felulet csoportos, crew es repuloteri transzferekhez, kulon stilussal es sajat partnerkarakterrel.",
    heroHighlights: ["Crew fokusz", "Ketnyelvu UI", "Euro alapu partner logika"],
  },
  tama: {
    key: "tama",
    allowedLanguages: DEFAULT_LANGUAGES,
    navLabel: "Tama Route Desk",
    navSubline: "Tama Logistics Portal",
    deskLabel: "Tama Booking Desk",
    heroTitle: "Tama logisztikai utvonal desk",
    heroDescription:
      "Tama-specifikus partneroldal a Debrecen, Budapest es Bujfalu kozotti logisztikai vallalati utakhoz.",
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
