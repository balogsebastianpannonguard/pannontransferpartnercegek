export const CATL_TRAVEL_CONDITIONS = {
  minAdvanceHours: 2,
  maxAdvanceDays: 180,
  operatingHoursAirport: null,
  operatingHoursCity: {
    start: '05:00',
    end: '23:00'
  },
  maxPax: {
    standard: 9,
    executive: 7
  },
  maxLuggagePerPax: {
    standard: 3,
    executive: 2
  }
};

export function getTravelConditions() {
  return CATL_TRAVEL_CONDITIONS;
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
