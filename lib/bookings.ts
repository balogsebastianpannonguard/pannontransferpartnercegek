import { getDb } from './mongodb';
import { ObjectId, Collection, type Filter } from 'mongodb';
import { getTravelConditions, isTimeInOperatingHours } from './travel-conditions';
import { getPartnerPricing, type PartnerPricing, type PricingVehicle } from './partner-pricing';

export type PartnerPortal =
  | 'catl'
  | 'ecopro'
  | 'eccoino'
  | 'vitesco'
  | 'schaeffler'
  | 'krones'
  | 'enterair'
  | 'tama'
  | 'ni';

export type BookingStatus =
  | 'pending'
  | 'modified'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled';

export type BookingCategory =
  | 'airport'
  | 'city'
  | 'long-distance'
  | 'vip'
  | 'partner';

export type PaymentMethod = 'card' | 'bank';

export type TransferType = 'standard' | 'executive';

export interface AuditTrailEntry {
  timestamp: number;
  action: string;
  actor: string;
  details?: string;
}

export interface Booking {
  _id?: string;
  portal?: PartnerPortal;
  bookingCode: string;
  userEmail: string;
  travelerEmail: string;
  travelerName: string;
  travelerPhone: string;
  secondTravelerEmail?: string;
  secondTravelerPhone?: string;
  companyName: string;
  paymentMethod: PaymentMethod;
  transferType: TransferType;
  fromType: 'airport' | 'other';
  fromAddress: string;
  toType: 'airport' | 'other';
  toAddress: string;
  flightNumber?: string;
  pickupDate: string;
  pickupTime: string;
  travelers: number;
  luggage: number;
  comment?: string;
  category: BookingCategory;
  status: BookingStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedVehicleId?: string;
  assignedVehicleName?: string;
  driverNotified?: boolean;
  driverAcknowledged?: boolean;
  price?: number;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
  auditTrail?: AuditTrailEntry[];
  lastStatusChange?: {
    oldStatus: string;
    newStatus: string;
    changedAt: number;
    changedBy: string;
    details?: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CreateBookingData
  extends Omit<
    Booking,
    | '_id'
    | 'bookingCode'
    | 'category'
    | 'status'
    | 'createdAt'
    | 'updatedAt'
    | 'auditTrail'
  > {}

export function deriveCategory(
  fromType: 'airport' | 'other',
  toType: 'airport' | 'other',
  transferType: TransferType,
  companyName?: string
): BookingCategory {
  if (transferType === 'executive') {
    return 'vip';
  }
  if (companyName && companyName !== 'CATL Hungary Kft.') {
    return 'partner';
  }
  if (fromType === 'airport' || toType === 'airport') {
    return 'airport';
  }
  return 'city';
}

const PARTNER_COMPANY_MATCHERS: Array<{ key: string; patterns: string[] }> = [
  { key: 'ecopro', patterns: ['ecopro'] },
  { key: 'eccoino', patterns: ['eccoino'] },
  { key: 'vitesco', patterns: ['vitesco'] },
  { key: 'schaeffler', patterns: ['schaeffler'] },
  { key: 'krones', patterns: ['krones'] },
  { key: 'enterair', patterns: ['enter air', 'enterair'] },
  { key: 'tama', patterns: ['tama'] },
  { key: 'ni', patterns: [' ni ', 'national instruments', 'ni '] },
];

function normalizeText(value?: string): string {
  return ` ${(value || '').trim().toLowerCase()} `;
}

export function resolvePartnerKey(companyName?: string): string {
  const normalized = normalizeText(companyName);

  for (const matcher of PARTNER_COMPANY_MATCHERS) {
    if (matcher.patterns.some((pattern) => normalized.includes(pattern))) {
      return matcher.key;
    }
  }

  return 'catl';
}

function getPreferredVehicleOrder(transferType: TransferType): string[] {
  return transferType === 'executive'
    ? ['s_class', 'v_class']
    : ['skoda', 'opel_ford', 'man_bus'];
}

function getVehicleMaxPassengers(vehicle: PricingVehicle): number | null {
  const match = vehicle.capacity.match(/(\d+)\s*-\s*(\d+)/);
  if (match) {
    return Number(match[2]);
  }

  if (/large group|nagy csoport/i.test(vehicle.capacity)) {
    return null;
  }

  const singleNumber = vehicle.capacity.match(/(\d+)/);
  return singleNumber ? Number(singleNumber[1]) : null;
}

function selectPricingVehicle(
  pricing: PartnerPricing,
  data: {
    transferType: TransferType;
    travelers: number;
  }
): PricingVehicle | null {
  const preferredOrder = getPreferredVehicleOrder(data.transferType);
  const candidates = preferredOrder
    .map((vehicleId) => pricing.vehicles.find((vehicle) => vehicle.id === vehicleId))
    .filter((vehicle): vehicle is PricingVehicle => Boolean(vehicle));

  for (const vehicle of candidates) {
    const maxPassengers = getVehicleMaxPassengers(vehicle);
    if (maxPassengers === null || data.travelers <= maxPassengers) {
      return vehicle;
    }
  }

  return null;
}

function getVehicleBasePrice(
  vehicle: PricingVehicle,
  data: {
    fromType: 'airport' | 'other';
    toType: 'airport' | 'other';
  }
): number {
  const involvesAirport = data.fromType === 'airport' || data.toType === 'airport';

  if (involvesAirport && typeof vehicle.bpBudAirport === 'number' && vehicle.bpBudAirport > 0) {
    return vehicle.bpBudAirport;
  }

  return vehicle.newPrice2026;
}

export async function calculateBookingPrice(data: {
  category?: BookingCategory;
  transferType: TransferType;
  travelers: number;
  luggage: number;
  fromType: 'airport' | 'other';
  toType: 'airport' | 'other';
  fromAddress?: string;
  toAddress?: string;
  companyName?: string;
}): Promise<number> {
  const category =
    data.category ||
    deriveCategory(data.fromType, data.toType, data.transferType, data.companyName);

  const partnerKey = resolvePartnerKey(data.companyName);
  const pricing = await getPartnerPricing(partnerKey);
  const selectedVehicle = selectPricingVehicle(pricing, data);

  let base =
    selectedVehicle !== null
      ? getVehicleBasePrice(selectedVehicle, data)
      : category === 'vip'
        ? data.fromType === 'airport' || data.toType === 'airport'
          ? 85000
          : 55000
        : 42000;

  if (data.travelers >= 5) base = Math.round(base * 1.12);
  if (data.travelers >= 8) base = Math.round(base * 1.08);

  const extraLuggage = Math.max(
    0,
    data.luggage - Math.min(data.travelers * 3, 15)
  );
  base += extraLuggage * 3500;

  const rounded = Math.round(base / 1000) * 1000;
  return rounded;
}

export async function validateTravelConditions(
  bookingData: Partial<CreateBookingData> & {
    travelerEmail?: string;
    travelerName?: string;
    travelerPhone?: string;
    fromAddress?: string;
    toAddress?: string;
    pickupDate?: string;
    pickupTime?: string;
    travelers?: number;
    luggage?: number;
    fromType?: 'airport' | 'other';
    toType?: 'airport' | 'other';
    transferType?: TransferType;
    companyName?: string;
    flightNumber?: string;
  }
): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const partnerKey = resolvePartnerKey(bookingData.companyName);
  const conditions = getTravelConditions(partnerKey);

  const {
    travelerEmail,
    travelerName,
    travelerPhone,
    fromAddress,
    toAddress,
    pickupDate,
    pickupTime,
    travelers,
    luggage,
    fromType,
    toType,
    transferType,
    flightNumber,
  } = bookingData;

  const pricing = await getPartnerPricing(partnerKey);

  if (!travelerEmail || travelerEmail.trim() === '') {
    errors.push('Az utas e-mail címe kötelező');
  }
  if (!travelerName || travelerName.trim() === '') {
    errors.push('Az utas neve kötelező');
  }
  if (!travelerPhone || travelerPhone.trim() === '') {
    errors.push('Az utas telefonszáma kötelező');
  }
  if (!fromAddress || fromAddress.trim() === '') {
    errors.push('A kiindulási cím kötelező');
  }
  if (!toAddress || toAddress.trim() === '') {
    errors.push('A célállomás címe kötelező');
  }
  if (toType === 'airport' && (!flightNumber || flightNumber.trim() === '')) {
    errors.push('Reptéri érkezésnél a járatszám megadása kötelező');
  }
  if (!pickupDate || pickupDate.trim() === '') {
    errors.push('Az átvétel dátuma kötelező');
  }
  if (!pickupTime || pickupTime.trim() === '') {
    errors.push('Az átvétel időpontja kötelező');
  }
  if (travelers === undefined || travelers === null || travelers < 1) {
    errors.push('Legalább 1 utas szükséges');
  }
  if (luggage === undefined || luggage === null || luggage < 0) {
    errors.push('A csomagok száma nem lehet negatív');
  }

  if (pickupDate && pickupTime) {
    const pickupDateTime = new Date(`${pickupDate}T${pickupTime}:00`);
    const now = new Date();

    if (isNaN(pickupDateTime.getTime())) {
      errors.push('Érvénytelen átvétel időpont');
    } else {
      const diffMs = pickupDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < conditions.minAdvanceHours) {
        errors.push(
          `Az átvételnek legalább ${conditions.minAdvanceHours} órával a jövőben kell lennie`
        );
      }

      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays > conditions.maxAdvanceDays) {
        errors.push(
          `Az átvétel nem lehet több mint ${conditions.maxAdvanceDays} nap a jövőben`
        );
      }

      const isAirportTransfer =
        fromType === 'airport' || toType === 'airport';

      if (isAirportTransfer) {
        if (conditions.operatingHoursAirport === null) {
        }
      } else {
        if (
          conditions.operatingHoursCity &&
          !isTimeInOperatingHours(pickupTime, conditions.operatingHoursCity)
        ) {
          errors.push(
            `Városi transzferek csak ${conditions.operatingHoursCity.start} és ${conditions.operatingHoursCity.end} között engedélyezettek`
          );
        }
      }
    }
  }

  if (travelers !== undefined && travelers !== null && travelers >= 1) {
    const tt = transferType || 'standard';
    const maxPax = conditions.maxPax[tt];

    if (travelers > maxPax) {
      errors.push(
        `${tt === 'standard' ? 'Standard' : 'Executive'} transzferen maximálisan ${maxPax} utas utazhat`
      );
    }

    if (luggage !== undefined && luggage !== null) {
      const maxLuggage = conditions.maxLuggagePerPax[tt] * travelers;

      if (luggage > maxLuggage) {
        errors.push(
          `${tt === 'standard' ? 'Standard' : 'Executive'} transzferen maximálisan ${conditions.maxLuggagePerPax[tt]} csomag/utas engedélyezett (összesen ${maxLuggage})`
        );
      }
    }

  }

  if (transferType === 'executive') {
    const selectedVehicle = travelers
      ? selectPricingVehicle(pricing, {
          transferType,
          travelers,
        })
      : null;
    warnings.push(
      `Executive transzfer: ${
        selectedVehicle ? `${selectedVehicle.name} kategória` : 'VIP kategória'
      } lesz használva`
    );
  }

  warnings.push(
    `${pricing.partnerName} módosítási feltételek: 12-24h ${pricing.terms.modification['12-24h'].description}, 0-12h ${pricing.terms.modification['0-12h'].description}.`
  );

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export async function getBookingsCollection(): Promise<Collection<Booking>> {
  const db = await getDb();
  return db.collection<Booking>('bookings');
}

export async function initBookingIndexes(): Promise<void> {
  const col = await getBookingsCollection();
  await col.createIndex({ bookingCode: 1 }, { unique: true });
  await col.createIndex({ userEmail: 1, portal: 1 });
  await col.createIndex({ status: 1 });
  await col.createIndex({ pickupDate: 1 });
  await col.createIndex({ createdAt: -1 });
}

export function generateBookingCode(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${yy}${mm}${dd}-${suffix}`;
}

function convertDocId(doc: any): Booking {
  if (!doc) return doc;
  return {
    ...doc,
    _id: doc._id ? doc._id.toString() : undefined,
  } as Booking;
}

function resolveBookingPortal(companyName?: string): PartnerPortal {
  const partnerKey = resolvePartnerKey(companyName);
  return partnerKey as PartnerPortal;
}

export function buildPortalScopeFilter(portal: PartnerPortal): Filter<Booking> {
  if (portal !== 'catl') {
    return { portal };
  }

  return {
    $or: [
      { portal: 'catl' },
      { portal: { $exists: false } },
      { portal: null },
    ],
  } as Filter<Booking>;
}

export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const validation = await validateTravelConditions(data);
  if (!validation.valid) {
    throw new Error(
      `A foglalás érvénytelen: ${validation.errors.join(', ')}`
    );
  }

  const col = await getBookingsCollection();
  const now = Date.now();

  let bookingCode = generateBookingCode();
  let existing = await col.findOne({ bookingCode });
  while (existing) {
    bookingCode = generateBookingCode();
    existing = await col.findOne({ bookingCode });
  }

  const category = deriveCategory(
    data.fromType,
    data.toType,
    data.transferType,
    data.companyName
  );

  const computedPrice = await calculateBookingPrice({
    category,
    transferType: data.transferType,
    travelers: data.travelers,
    luggage: data.luggage,
    fromType: data.fromType,
    toType: data.toType,
    fromAddress: data.fromAddress,
    toAddress: data.toAddress,
    companyName: data.companyName,
  });

  const companyName = data.companyName || 'CATL Hungary Kft.';
  const portal = data.portal || resolveBookingPortal(companyName);

  const auditEntry: AuditTrailEntry = {
    timestamp: now,
    action: 'created',
    actor: data.userEmail,
    details: `Foglalás létrehozva. Becsült ár: ${computedPrice.toLocaleString('hu-HU')} Ft`,
  };

  const booking: Booking = {
    ...data,
    portal,
    companyName,
    bookingCode,
    category,
    status: 'pending',
    price: computedPrice,
    createdAt: now,
    updatedAt: now,
    auditTrail: [auditEntry],
  };

  const res = await col.insertOne(booking as any);
  const created = await col.findOne({ _id: res.insertedId });
  if (!created) {
    throw new Error('A foglalás létrehozása sikertelen');
  }

  return convertDocId(created);
}

export async function listUserBookings(
  userEmail: string,
  portal: PartnerPortal
): Promise<Booking[]> {
  const col = await getBookingsCollection();
  const docs = await col
    .find({ userEmail, ...buildPortalScopeFilter(portal) })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(convertDocId);
}

export async function getBookingByCode(
  code: string,
  portal: PartnerPortal
): Promise<Booking | null> {
  const col = await getBookingsCollection();
  const doc = await col.findOne({ bookingCode: code, ...buildPortalScopeFilter(portal) });
  if (!doc) return null;
  return convertDocId(doc);
}

export async function getBookingById(
  id: string,
  portal: PartnerPortal
): Promise<Booking | null> {
  const col = await getBookingsCollection();
  const oid = new ObjectId(id);
  const doc = await col.findOne({ _id: oid as any, ...buildPortalScopeFilter(portal) });
  if (!doc) return null;
  return convertDocId(doc);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  actor: string,
  details?: string
): Promise<Booking | null> {
  const col = await getBookingsCollection();
  const oid = new ObjectId(id);

  const existing = await col.findOne({ _id: oid as any });
  if (!existing) return null;
  const oldStatus = existing.status;

  const now = Date.now();

  const auditEntry: AuditTrailEntry = {
    timestamp: now,
    action: 'status-change',
    actor,
    details: details || `Státusz módosítva: ${status}`,
  };

  const res = await col.findOneAndUpdate(
    { _id: oid as any },
    {
      $set: {
        status,
        updatedAt: now,
        lastStatusChange: {
          oldStatus,
          newStatus: status,
          changedAt: now,
          changedBy: actor,
          details: details || '',
        },
      },
      $push: {
        auditTrail: auditEntry,
      },
    },
    { returnDocument: 'after' }
  );

  if (!res) return null;
  return convertDocId(res);
}

export async function updateBooking(
  id: string,
  patch: Partial<Booking>,
  actor: string,
  details?: string,
  auditAction: string = 'modified'
): Promise<Booking | null> {
  const col = await getBookingsCollection();
  const oid = new ObjectId(id);
  const now = Date.now();

  const existing = await col.findOne({ _id: oid as any });
  if (!existing) return null;

  const { _id, bookingCode, createdAt, auditTrail, ...rest } = patch;
  const changes = Object.entries(rest)
    .filter(([field]) => field !== 'updatedAt')
    .map(([field, value]) => ({
      field,
      oldValue: (existing as any)[field] ?? null,
      newValue: value,
    }));

  const auditEntry: AuditTrailEntry = {
    timestamp: now,
    action: auditAction,
    actor,
    details: JSON.stringify({
      message: details || 'Foglalás adatai módosítva',
      changes,
    }),
  };

  const res = await col.findOneAndUpdate(
    { _id: oid as any },
    {
      $set: {
        ...rest,
        updatedAt: now,
      },
      $push: {
        auditTrail: auditEntry,
      },
    },
    { returnDocument: 'after' }
  );

  if (!res) return null;

  if (auditAction === 'partner_modified') {
    const db = await getDb();
    await db.collection("audit_logs").insertOne({
      timestamp: now,
      action: "booking.partner_modified",
      actor,
      targetType: "booking",
      targetId: id,
      details: {
        message: details || "Foglalás adatai módosítva a partner által",
        bookingCode: existing.bookingCode,
        changes,
      },
    } as any);
  }

  return convertDocId(res);
}
