export const DEFAULT_TRAVEL_CONDITIONS = {
  minAdvanceHours: 2,
  maxAdvanceDays: 180,
  operatingHoursAirport: null,
  operatingHoursCity: {
    start: "05:00",
    end: "23:00",
  },
  maxPax: {
    standard: 9,
    executive: 7,
  },
  maxLuggagePerPax: {
    standard: 3,
    executive: 2,
  },
};

const PARTNER_TRAVEL_CONDITIONS = {
  catl: DEFAULT_TRAVEL_CONDITIONS,
  ecopro: {
    ...DEFAULT_TRAVEL_CONDITIONS,
    minAdvanceHours: 3,
  },
  eccoino: {
    ...DEFAULT_TRAVEL_CONDITIONS,
    minAdvanceHours: 6,
    maxAdvanceDays: 240,
  },
  vitesco: {
    ...DEFAULT_TRAVEL_CONDITIONS,
    minAdvanceHours: 4,
  },
  schaeffler: {
    ...DEFAULT_TRAVEL_CONDITIONS,
    minAdvanceHours: 4,
  },
  krones: {
    ...DEFAULT_TRAVEL_CONDITIONS,
    minAdvanceHours: 5,
    operatingHoursCity: {
      start: "04:30",
      end: "22:30",
    },
  },
  enterair: {
    ...DEFAULT_TRAVEL_CONDITIONS,
    minAdvanceHours: 6,
    maxAdvanceDays: 240,
  },
  tama: {
    ...DEFAULT_TRAVEL_CONDITIONS,
    minAdvanceHours: 3,
    operatingHoursCity: {
      start: "05:30",
      end: "22:00",
    },
  },
  ni: {
    ...DEFAULT_TRAVEL_CONDITIONS,
    minAdvanceHours: 4,
    maxAdvanceDays: 210,
  },
} as const;

export function getTravelConditions(partnerKey?: string) {
  if (!partnerKey) {
    return DEFAULT_TRAVEL_CONDITIONS;
  }
  return PARTNER_TRAVEL_CONDITIONS[partnerKey as keyof typeof PARTNER_TRAVEL_CONDITIONS] || DEFAULT_TRAVEL_CONDITIONS;
}

export function isTimeInOperatingHours(
  time: string,
  operatingHours: { start: string; end: string } | null
): boolean {
  if (!operatingHours) {
    return true;
  }

  const [timeH, timeM] = time.split(':').map(Number);
  const [startH, startM] = operatingHours.start.split(':').map(Number);
  const [endH, endM] = operatingHours.end.split(':').map(Number);

  const timeMinutes = timeH * 60 + timeM;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}
