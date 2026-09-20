import { getDb } from './mongodb';
import { ObjectId, Collection } from 'mongodb';
import { randomBytes } from 'crypto';
import type { PartnerPortal } from './bookings';

export interface CompanyBookingToken {
  _id?: string;
  token: string;
  portal: PartnerPortal;
  companyName: string;
  label?: string;
  createdBy: string; // NI admin email who generated the link
  createdAt: number;
  updatedAt: number;
  active: boolean;
  usageCount: number;
  lastUsedAt?: number;
}

const COLLECTION_NAME = 'company_booking_tokens';

export async function getCompanyBookingTokensCollection(): Promise<
  Collection<CompanyBookingToken>
> {
  const db = await getDb();
  return db.collection<CompanyBookingToken>(COLLECTION_NAME);
}

export async function initCompanyBookingTokenIndexes(): Promise<void> {
  const col = await getCompanyBookingTokensCollection();
  await col.createIndex({ token: 1 }, { unique: true });
  await col.createIndex({ portal: 1, active: 1 });
}

export function generateCompanyBookingToken(): string {
  return randomBytes(32).toString('base64url');
}

function convertDocId(doc: any): CompanyBookingToken {
  if (!doc) return doc;
  return {
    ...doc,
    _id: doc._id ? doc._id.toString() : undefined,
  } as CompanyBookingToken;
}

export async function createCompanyBookingToken(data: {
  portal: PartnerPortal;
  companyName: string;
  createdBy: string;
  label?: string;
}): Promise<CompanyBookingToken> {
  await initCompanyBookingTokenIndexes();
  const col = await getCompanyBookingTokensCollection();
  const now = Date.now();

  const token = generateCompanyBookingToken();
  const doc: CompanyBookingToken = {
    token,
    portal: data.portal,
    companyName: data.companyName,
    label: data.label,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
    active: true,
    usageCount: 0,
  };

  const res = await col.insertOne(doc as any);
  const created = await col.findOne({ _id: res.insertedId });
  if (!created) throw new Error('A céges foglalási link létrehozása sikertelen.');
  return convertDocId(created);
}

export async function listCompanyBookingTokens(
  portal: PartnerPortal
): Promise<CompanyBookingToken[]> {
  const col = await getCompanyBookingTokensCollection();
  const docs = await col.find({ portal }).sort({ createdAt: -1 }).toArray();
  return docs.map(convertDocId);
}

export async function getActiveCompanyBookingToken(
  token: string
): Promise<CompanyBookingToken | null> {
  if (!token || token.length < 10) return null;
  const col = await getCompanyBookingTokensCollection();
  const doc = await col.findOne({ token, active: true });
  return doc ? convertDocId(doc) : null;
}

export async function deactivateCompanyBookingToken(
  id: string,
  portal: PartnerPortal
): Promise<boolean> {
  const col = await getCompanyBookingTokensCollection();
  const res = await col.updateOne(
    { _id: new ObjectId(id) as any, portal },
    { $set: { active: false, updatedAt: Date.now() } }
  );
  return res.modifiedCount > 0;
}

export async function incrementCompanyBookingTokenUsage(token: string): Promise<void> {
  const col = await getCompanyBookingTokensCollection();
  await col.updateOne(
    { token },
    { $inc: { usageCount: 1 }, $set: { lastUsedAt: Date.now(), updatedAt: Date.now() } }
  );
}
