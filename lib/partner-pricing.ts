import { getDb } from "./mongodb";

export interface PricingVehicle {
  id: string;
  name: string;
  capacity: string;
  bpBudAirport: number;
  dbDbAirport: number | null;
  newPrice2026: number;
  modification12to24h: number;
  modification0to12h: number;
  cancellation12to24h: number;
  cancellation0to12h: number;
  extraWaitingPerHour: number;
  dailyRate: number;
}

export interface PricingTerms {
  modification: {
    "12-24h": { percentage: number; description: string };
    "0-12h": { percentage: number; description: string };
  };
  cancellation: {
    "12-24h": { percentage: number; description: string };
    "0-12h": { percentage: number; description: string };
  };
}

export interface PartnerPricing {
  _id?: unknown;
  partnerKey: string;
  partnerName: string;
  isActive: boolean;
  vehicles: PricingVehicle[];
  terms: PricingTerms;
  meta?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

const COLLECTION_NAME = "partner_pricing";

function createVehicles(input: {
  skoda: [number, number];
  opel_ford: [number, number];
  v_class: [number, number];
  s_class: [number, number];
  man_bus: [number, number];
  dbDbAirport?: Partial<Record<"skoda" | "opel_ford" | "v_class" | "s_class" | "man_bus", number | null>>;
  dailyRate?: Partial<Record<"skoda" | "opel_ford" | "v_class" | "s_class" | "man_bus", number>>;
  waiting?: Partial<Record<"skoda" | "opel_ford" | "v_class" | "s_class" | "man_bus", number>>;
}): PricingVehicle[] {
  const names = {
    skoda: { name: "Skoda", capacity: "1-3 passenger" },
    opel_ford: { name: "Opel/Ford", capacity: "3-8 passenger" },
    v_class: { name: "V class", capacity: "3-7 passenger" },
    s_class: { name: "S class", capacity: "1-3 passenger" },
    man_bus: { name: "MAN busz", capacity: "Large group" },
  } as const;

  return (Object.keys(names) as Array<keyof typeof names>).map((id) => {
    const [bpBudAirport, newPrice2026] = input[id];
    return {
      id,
      name: names[id].name,
      capacity: names[id].capacity,
      bpBudAirport,
      dbDbAirport: input.dbDbAirport?.[id] ?? null,
      newPrice2026,
      modification12to24h: Math.round(newPrice2026 * 1.4),
      modification0to12h: Math.round(newPrice2026 * 1.6),
      cancellation12to24h: Math.round(newPrice2026 * 0.5),
      cancellation0to12h: Math.round(newPrice2026 * 0.8),
      extraWaitingPerHour: input.waiting?.[id] ?? (id === "skoda" ? 7000 : id === "opel_ford" ? 10000 : id === "v_class" ? 15000 : id === "s_class" ? 25000 : 20000),
      dailyRate: input.dailyRate?.[id] ?? (id === "skoda" ? 65000 : id === "opel_ford" ? 80000 : id === "v_class" ? 120000 : id === "s_class" ? 150000 : 145000),
    };
  });
}

function createTerms(
  modification12to24h: number,
  modification0to12h: number,
  cancellation12to24h: number,
  cancellation0to12h: number
): PricingTerms {
  return {
    modification: {
      "12-24h": { percentage: modification12to24h, description: `${modification12to24h}% felár` },
      "0-12h": { percentage: modification0to12h, description: `${modification0to12h}% felár` },
    },
    cancellation: {
      "12-24h": { percentage: cancellation12to24h, description: `${cancellation12to24h}% kötbér` },
      "0-12h": { percentage: cancellation0to12h, description: `${cancellation0to12h}% kötbér` },
    },
  };
}

export const PARTNER_FALLBACK_PRICING: Record<string, Omit<PartnerPricing, "_id" | "createdAt" | "updatedAt">> = {
  catl: {
    partnerKey: "catl",
    partnerName: "CATL Hungary Kft.",
    isActive: true,
    vehicles: createVehicles({
      skoda: [60808, 82550],
      opel_ford: [94107, 95250],
      v_class: [137541, 154046],
      s_class: [166497, 186477],
      man_bus: [173736, 194584],
      dbDbAirport: { skoda: 18400, opel_ford: 25300, man_bus: 40250 },
    }),
    terms: createTerms(150, 180, 50, 80),
  },
  ecopro: {
    partnerKey: "ecopro",
    partnerName: "EcoPro BM Hungary",
    isActive: true,
    vehicles: createVehicles({
      skoda: [60808, 82550],
      opel_ford: [94107, 95250],
      v_class: [137541, 154046],
      s_class: [166497, 186477],
      man_bus: [173736, 194584],
      dbDbAirport: { skoda: 18400, opel_ford: 25300, man_bus: 40250 },
    }),
    terms: createTerms(150, 180, 50, 80),
  },
  eccoino: {
    partnerKey: "eccoino",
    partnerName: "Eccoino",
    isActive: true,
    vehicles: createVehicles({
      skoda: [55000, 62000],
      opel_ford: [80000, 90000],
      v_class: [110000, 125000],
      s_class: [140000, 160000],
      man_bus: [160000, 180000],
    }),
    terms: createTerms(140, 160, 55, 85),
  },
  vitesco: {
    partnerKey: "vitesco",
    partnerName: "Vitesco Technologies",
    isActive: true,
    vehicles: createVehicles({
      skoda: [58000, 65000],
      opel_ford: [85000, 96000],
      v_class: [115000, 130000],
      s_class: [145000, 165000],
      man_bus: [165000, 185000],
    }),
    terms: createTerms(135, 165, 50, 75),
  },
  schaeffler: {
    partnerKey: "schaeffler",
    partnerName: "Schaeffler",
    isActive: true,
    vehicles: createVehicles({
      skoda: [54000, 60000],
      opel_ford: [82000, 92000],
      v_class: [112000, 127000],
      s_class: [142000, 162000],
      man_bus: [162000, 182000],
    }),
    terms: createTerms(140, 160, 50, 80),
  },
  krones: {
    partnerKey: "krones",
    partnerName: "Krones AG",
    isActive: true,
    vehicles: createVehicles({
      skoda: [56000, 63000],
      opel_ford: [86000, 97000],
      v_class: [116000, 131000],
      s_class: [146000, 166000],
      man_bus: [166000, 187000],
    }),
    terms: createTerms(130, 150, 55, 85),
  },
  enterair: {
    partnerKey: "enterair",
    partnerName: "Enter Air",
    isActive: true,
    vehicles: createVehicles({
      skoda: [57000, 64000],
      opel_ford: [84000, 95000],
      v_class: [114000, 129000],
      s_class: [144000, 164000],
      man_bus: [164000, 184000],
    }),
    terms: createTerms(135, 155, 50, 75),
  },
  tama: {
    partnerKey: "tama",
    partnerName: "Tama",
    isActive: true,
    vehicles: createVehicles({
      skoda: [53000, 59000],
      opel_ford: [81000, 91000],
      v_class: [111000, 126000],
      s_class: [141000, 161000],
      man_bus: [161000, 181000],
    }),
    terms: createTerms(140, 160, 50, 80),
  },
  ni: {
    partnerKey: "ni",
    partnerName: "National Instruments",
    isActive: true,
    vehicles: createVehicles({
      skoda: [55000, 62000],
      opel_ford: [83000, 93000],
      v_class: [113000, 128000],
      s_class: [143000, 163000],
      man_bus: [163000, 183000],
    }),
    terms: createTerms(135, 160, 55, 80),
  },
};

export const FALLBACK_CATL_PRICING = PARTNER_FALLBACK_PRICING.catl;

export const CATL_PRICING: Record<string, PricingVehicle> = {};
for (const v of FALLBACK_CATL_PRICING.vehicles) {
  CATL_PRICING[v.id] = v;
}
export const CATL_TERMS = FALLBACK_CATL_PRICING.terms;
export const CATL_VEHICLE_COUNT = FALLBACK_CATL_PRICING.vehicles.length;
export const CATL_MIN_PRICE = Math.min(...FALLBACK_CATL_PRICING.vehicles.map((v) => v.newPrice2026));
export const CATL_MAX_PRICE = Math.max(...FALLBACK_CATL_PRICING.vehicles.map((v) => v.newPrice2026));

export function formatHuf(amount: number): string {
  return new Intl.NumberFormat("hu-HU", {
    style: "currency",
    currency: "HUF",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function getPartnerPricing(
  partnerKey: string
): Promise<PartnerPricing> {
  try {
    const db = await getDb();
    const collection = db.collection<PartnerPricing>(COLLECTION_NAME);
    const doc = await collection.findOne({ partnerKey });
    if (doc) return doc;
  } catch {
    // silently fall back to static data
  }
  const now = Date.now();
  const fallback = PARTNER_FALLBACK_PRICING[partnerKey] || FALLBACK_CATL_PRICING;
  return { ...fallback, createdAt: now, updatedAt: now };
}

export async function getPartnerPricingLegacy(partnerKey: string) {
  const pricing = await getPartnerPricing(partnerKey);
  const map: Record<string, PricingVehicle> = {};
  for (const v of pricing.vehicles) map[v.id] = v;
  const prices = pricing.vehicles.map((v) => v.newPrice2026);
  return {
    pricing: map,
    terms: pricing.terms,
    count: pricing.vehicles.length,
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
    full: pricing,
  };
}

export async function upsertPartnerPricing(
  partnerKey: string,
  data: Partial<Omit<PartnerPricing, "_id" | "partnerKey" | "createdAt" | "updatedAt">>
): Promise<PartnerPricing | null> {
  try {
    const db = await getDb();
    const collection = db.collection<PartnerPricing>(COLLECTION_NAME);
    const existing = await collection.findOne({ partnerKey });
    const now = Date.now();
    if (existing) {
      await collection.updateOne(
        { partnerKey },
        { $set: { ...data, updatedAt: now } }
      );
      return (await collection.findOne({ partnerKey })) as PartnerPricing | null;
    }
    const seedDoc: PartnerPricing = {
      partnerKey,
      partnerName: data.partnerName || (PARTNER_FALLBACK_PRICING[partnerKey]?.partnerName ?? partnerKey.toUpperCase()),
      isActive: data.isActive ?? true,
      vehicles: data.vehicles || (PARTNER_FALLBACK_PRICING[partnerKey]?.vehicles ?? FALLBACK_CATL_PRICING.vehicles),
      terms: data.terms || (PARTNER_FALLBACK_PRICING[partnerKey]?.terms ?? FALLBACK_CATL_PRICING.terms),
      meta: data.meta || {},
      createdAt: now,
      updatedAt: now,
    };
    await collection.insertOne(seedDoc as any);
    return seedDoc;
  } catch {
    return null;
  }
}
