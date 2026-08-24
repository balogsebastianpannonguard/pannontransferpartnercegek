import { getDb } from './mongodb';
import { ObjectId, Collection } from 'mongodb';
import { getTravelConditions, isTimeInOperatingHours } from './travel-conditions';

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
  price?: number;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
  auditTrail?: AuditTrailEntry[];
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

export function calculateBookingPrice(data: {
  category?: BookingCategory;
  transferType: TransferType;
  travelers: number;
  luggage: number;
  fromType: 'airport' | 'other';
  toType: 'airport' | 'other';
  fromAddress?: string;
  toAddress?: string;
}): number {
  const category =
    data.category ||
    deriveCategory(data.fromType, data.toType, data.transferType);

  const basePrices: Record<string, Record<TransferType, number>> = {
    airport: { standard: 38000, executive: 68000 },
    city: { standard: 22000, executive: 34000 },
    'long-distance': { standard: 72000, executive: 108000 },
    vip: { standard: 0, executive: 0 },
    partner: { standard: 42000, executive: 72000 },
  };

  let base =
    basePrices[category]?.[data.transferType] ||
    basePrices.airport[data.transferType];

  if (category === 'vip') {
    const anyAirport = data.fromType === 'airport' || data.toType === 'airport';
    base = anyAirport ? 85000 : 55000;
    if (data.transferType === 'executive') base = Math.round(base * 1.5);
  }

  const fromLower = (data.fromAddress || '').toLowerCase();
  const toLower = (data.toAddress || '').toLowerCase();
  const isLongDistance =
    /miskolc|debrecen|szeged|pécs|győr|székesfehérvár|budapest airport|liszt ferenc/i.test(
      fromLower + ' ' + toLower
    ) ||
    /(airport.*budapest|budapest.*airport)/i.test(fromLower + ' ' + toLower);

  if (category === 'airport' && isLongDistance) {
    if (data.transferType === 'standard') base = 62000;
    else base = 105000;
  }

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

export function validateTravelConditions(
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
  }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const conditions = getTravelConditions();

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
    companyName,
  } = bookingData;

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
    warnings.push('Executive transzfer: VIP kategória lesz használva');
  }

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
  await col.createIndex({ userEmail: 1 });
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

export async function createBooking(data: CreateBookingData): Promise<Booking> {
  const validation = validateTravelConditions(data);
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

  const computedPrice = calculateBookingPrice({
    category,
    transferType: data.transferType,
    travelers: data.travelers,
    luggage: data.luggage,
    fromType: data.fromType,
    toType: data.toType,
    fromAddress: data.fromAddress,
    toAddress: data.toAddress,
  });

  const companyName = data.companyName || 'CATL Hungary Kft.';

  const auditEntry: AuditTrailEntry = {
    timestamp: now,
    action: 'created',
    actor: data.userEmail,
    details: `Foglalás létrehozva. Becsült ár: ${computedPrice.toLocaleString('hu-HU')} Ft`,
  };

  const booking: Booking = {
    ...data,
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

export async function listUserBookings(userEmail: string): Promise<Booking[]> {
  const col = await getBookingsCollection();
  const docs = await col
    .find({ userEmail })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(convertDocId);
}

export async function getBookingByCode(code: string): Promise<Booking | null> {
  const col = await getBookingsCollection();
  const doc = await col.findOne({ bookingCode: code });
  if (!doc) return null;
  return convertDocId(doc);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const col = await getBookingsCollection();
  const oid = new ObjectId(id);
  const doc = await col.findOne({ _id: oid as any });
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
  details?: string
): Promise<Booking | null> {
  const col = await getBookingsCollection();
  const oid = new ObjectId(id);
  const now = Date.now();

  const { _id, bookingCode, createdAt, auditTrail, ...rest } = patch;

  const auditEntry: AuditTrailEntry = {
    timestamp: now,
    action: 'modified',
    actor,
    details: details || 'Foglalás adatai módosítva',
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
  return convertDocId(res);
}
