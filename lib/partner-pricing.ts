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

export const FALLBACK_CATL_PRICING: Omit<PartnerPricing, "_id" | "createdAt" | "updatedAt"> = {
  partnerKey: "catl",
  partnerName: "CATL Hungary Kft.",
  isActive: true,
  vehicles: [
    {
      id: "skoda",
      name: "Skoda",
      capacity: "1-3 passenger",
      bpBudAirport: 60808,
      dbDbAirport: 18400,
      newPrice2026: 82550,
      modification12to24h: 102157,
      modification0to12h: 122589,
      cancellation12to24h: 34052,
      cancellation0to12h: 54484,
      extraWaitingPerHour: 7000,
      dailyRate: 65000,
    },
    {
      id: "opel_ford",
      name: "Opel/Ford",
      capacity: "3-8 passenger",
      bpBudAirport: 94107,
      dbDbAirport: 25300,
      newPrice2026: 95250,
      modification12to24h: 158100,
      modification0to12h: 189720,
      cancellation12to24h: 52700,
      cancellation0to12h: 84320,
      extraWaitingPerHour: 10000,
      dailyRate: 80000,
    },
    {
      id: "v_class",
      name: "V class",
      capacity: "3-7 passenger",
      bpBudAirport: 137541,
      dbDbAirport: null,
      newPrice2026: 154046,
      modification12to24h: 154046,
      modification0to12h: 277283,
      cancellation12to24h: 77023,
      cancellation0to12h: 123237,
      extraWaitingPerHour: 15000,
      dailyRate: 120000,
    },
    {
      id: "s_class",
      name: "S class",
      capacity: "1-3 passenger",
      bpBudAirport: 166497,
      dbDbAirport: null,
      newPrice2026: 186477,
      modification12to24h: 186477,
      modification0to12h: 335658,
      cancellation12to24h: 93238,
      cancellation0to12h: 149181,
      extraWaitingPerHour: 25000,
      dailyRate: 150000,
    },
    {
      id: "man_bus",
      name: "MAN busz",
      capacity: "Large group",
      bpBudAirport: 173736,
      dbDbAirport: 40250,
      newPrice2026: 194584,
      modification12to24h: 194584,
      modification0to12h: 350252,
      cancellation12to24h: 97292,
      cancellation0to12h: 155667,
      extraWaitingPerHour: 20000,
      dailyRate: 145000,
    },
  ],
  terms: {
    modification: {
      "12-24h": { percentage: 150, description: "150% felár" },
      "0-12h": { percentage: 180, description: "180% felár" },
    },
    cancellation: {
      "12-24h": { percentage: 50, description: "50% kötbér" },
      "0-12h": { percentage: 80, description: "80% kötbér" },
    },
  },
};

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
  return { ...FALLBACK_CATL_PRICING, createdAt: now, updatedAt: now };
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
      partnerName: data.partnerName || partnerKey.toUpperCase(),
      isActive: data.isActive ?? true,
      vehicles: data.vehicles || FALLBACK_CATL_PRICING.vehicles,
      terms: data.terms || FALLBACK_CATL_PRICING.terms,
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
