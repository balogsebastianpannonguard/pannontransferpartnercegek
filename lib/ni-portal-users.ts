import { connectToDatabase } from "./mongodb";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import type { ObjectId } from "mongodb";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

export const NI_BCRYPT_ROUNDS = 12;
export const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MAGIC_LOGIN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 nap
export const TWO_FACTOR_ISSUER = "Pannon Transfer NI";

export const NI_SHARED_DB_NAME = "pannontransferfoglalasikozpont";

export interface NiPortalUser {
  _id?: ObjectId;
  email: string;
  normalizedEmail: string;
  hashedPassword: string | null;
  inviteRawToken: string;
  inviteTokenHash: string;
  inviteIssuedAt: number;
  inviteExpiresAt: number;
  isActivated: boolean;
  activatedAt: number | null;
  requireTwoFactor: boolean;
  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;
  twoFactorBackupCodes: string[] | null;
  welcomeEmailSent: boolean;
  magicLoginRawToken: string | null;
  magicLoginTokenHash: string | null;
  magicLoginExpiresAt: number | null;
  createdAt: number;
  updatedAt: number;
  lastLoginAt: number | null;
}

const COLLECTION_NAME = "ni_portal_users";

let cachedNiCol: any = null;

export async function getNiCollection() {
  if (cachedNiCol) {
    return cachedNiCol;
  }
  // Ugyanazon a MongoClienten át, de KÖZÖS CRM DB-t használunk
  const { client } = await connectToDatabase();
  const db = client.db(NI_SHARED_DB_NAME);
  const col = db.collection<NiPortalUser>(COLLECTION_NAME);
  
  // Indexek létrehozása csak az első alkalommal
  try {
    await col.createIndex({ normalizedEmail: 1 }, { unique: true });
    await col.createIndex({ inviteTokenHash: 1 });
    await col.createIndex({ inviteRawToken: 1 });
    await col.createIndex({ inviteExpiresAt: 1 }, { expireAfterSeconds: 0 });
  } catch (err) {
    console.error("Index creation error (ignored):", err);
  }
  
  cachedNiCol = col;
  return col;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashToken(token: string) {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(token).digest("hex");
}

export async function findNiUserByInviteToken(rawToken: string, opts?: { allowExpired?: boolean }): Promise<NiPortalUser | null> {
  const col = await getNiCollection();
  const cleanToken = String(rawToken || "").trim();
  if (!cleanToken) return null;

  const hash = await hashToken(cleanToken);
  const filter: any = { $or: [{ inviteTokenHash: hash }, { inviteRawToken: cleanToken }] };
  if (!opts?.allowExpired) {
    filter.inviteExpiresAt = { $gt: Date.now() };
  }

  // Prefer hash match; fallback to raw. Sorting by a stable match score would be overkill,
  // so we simply findOne — if the hash exists, MongoDB will return it deterministically.
  const u = await col.findOne(filter);
  return (u as NiPortalUser) || null;
}

export async function findNiUserByEmail(email: string): Promise<NiPortalUser | null> {
  const col = await getNiCollection();
  const normalized = normalizeEmail(email);
  return (await col.findOne({ normalizedEmail: normalized })) as NiPortalUser | null;
}

export async function setNiPasswordAndActivate(
  id: ObjectId,
  password: string
): Promise<NiPortalUser | null> {
  const col = await getNiCollection();
  const hashed = await bcrypt.hash(password, NI_BCRYPT_ROUNDS);
  await col.updateOne(
    { _id: id },
    {
      $set: {
        hashedPassword: hashed,
        isActivated: true,
        activatedAt: Date.now(),
        updatedAt: Date.now(),
      },
    }
  );
  return (await col.findOne({ _id: id })) as NiPortalUser | null;
}

export async function markNiWelcomeEmailSent(id: ObjectId) {
  const col = await getNiCollection();
  await col.updateOne({ _id: id }, { $set: { welcomeEmailSent: true } });
}

export async function compareNiPassword(user: NiPortalUser, password: string): Promise<boolean> {
  if (!user.hashedPassword) return false;
  return bcrypt.compare(password, user.hashedPassword);
}

export async function recordNiLogin(id: ObjectId) {
  const col = await getNiCollection();
  await col.updateOne({ _id: id }, { $set: { lastLoginAt: Date.now(), updatedAt: Date.now() } });
}

// ============ MAGIC LOGIN (unique emailed link) ============
export function generateMagicLoginToken(): { raw: string; hash: string; expiresAt: number } {
  const raw = randomBytes(28).toString("base64url");
  const hash = createHash("sha256").update(raw).digest("hex");
  const expiresAt = Date.now() + MAGIC_LOGIN_TTL_MS;
  return { raw, hash, expiresAt };
}

export async function rotateMagicLoginToken(id: ObjectId): Promise<{ raw: string; hash: string; expiresAt: number }> {
  const col = await getNiCollection();
  const { raw, hash, expiresAt } = generateMagicLoginToken();
  await col.updateOne(
    { _id: id },
    {
      $set: {
        magicLoginRawToken: raw,
        magicLoginTokenHash: hash,
        magicLoginExpiresAt: expiresAt,
        updatedAt: Date.now(),
      },
    }
  );
  return { raw, hash, expiresAt };
}

export async function findNiUserByMagicLoginToken(raw: string, allowExpired = false): Promise<NiPortalUser | null> {
  const col = await getNiCollection();
  const clean = String(raw || "").trim();
  if (!clean) return null;
  const hash = createHash("sha256").update(clean).digest("hex");
  const filter: any = {
    $or: [{ magicLoginTokenHash: hash }, { magicLoginRawToken: clean }],
  };
  if (!allowExpired) {
    filter.magicLoginExpiresAt = { $gt: Date.now() };
  }
  return (await col.findOne(filter)) as NiPortalUser | null;
}

// ============ 2FA / TOTP ============
export function generateNiTwoFactorSecret(email: string): {
  secretBase32: string;
  uri: string;
  qrDataUrl: Promise<string>;
  backupCodes: string[];
} {
  const secret = new OTPAuth.Secret();
  const totp = new OTPAuth.TOTP({
    issuer: TWO_FACTOR_ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  const backupCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const s = randomBytes(5).toString("hex").toUpperCase();
    backupCodes.push(`${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 10)}`);
  }
  return {
    secretBase32: secret.base32,
    uri: totp.toString(),
    qrDataUrl: QRCode.toDataURL(totp.toString(), {
      margin: 1,
      width: 280,
      errorCorrectionLevel: "M",
      color: { dark: "#0F172A", light: "#FFFFFF" },
    }),
    backupCodes,
  };
}

export function verifyNiTwoFactorToken(
  user: Pick<NiPortalUser, "twoFactorSecret">,
  token: string
): { valid: boolean; delta: number | null } {
  if (!user.twoFactorSecret) return { valid: false, delta: null };
  try {
    const totp = new OTPAuth.TOTP({
      issuer: TWO_FACTOR_ISSUER,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
    });
    const delta = totp.validate({ token, window: 1 });
    if (delta === null) return { valid: false, delta: null };
    return { valid: true, delta };
  } catch {
    return { valid: false, delta: null };
  }
}

export async function setNiTwoFactorSecret(
  id: ObjectId,
  opts: { secretBase32: string; backupCodes: string[] }
) {
  const col = await getNiCollection();
  await col.updateOne(
    { _id: id },
    {
      $set: {
        twoFactorSecret: opts.secretBase32,
        twoFactorBackupCodes: opts.backupCodes,
        updatedAt: Date.now(),
      },
    }
  );
}

export async function setNiTwoFactorEnabled(id: ObjectId, enabled: boolean) {
  const col = await getNiCollection();
  await col.updateOne(
    { _id: id },
    { $set: { twoFactorEnabled: enabled, updatedAt: Date.now() } }
  );
}

export async function consumeNiTwoFactorBackupCode(id: ObjectId, code: string): Promise<boolean> {
  const col = await getNiCollection();
  const clean = code.trim().toUpperCase();
  const res = await col.updateOne(
    {
      _id: id,
      twoFactorBackupCodes: { $in: [clean] },
    },
    {
      $set: { updatedAt: Date.now() },
      $pull: { twoFactorBackupCodes: clean },
    }
  );
  return res.matchedCount > 0;
}
