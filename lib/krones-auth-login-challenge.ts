import jwt from "jsonwebtoken";
import { KRONES_COOKIE_SECRET } from "./krones-auth";

export interface KronesLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const KRONES_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signKronesLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: KronesLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + KRONES_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, KRONES_COOKIE_SECRET);
}

export function verifyKronesLoginChallenge(
  token: string
): KronesLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, KRONES_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > KRONES_LOGIN_CHALLENGE_TTL_MS) return null;
    return {
      userId: d.userId,
      email: d.email,
      requireTwoFactor: !!d.requireTwoFactor,
      issuedAt: d.issuedAt || Date.now(),
    };
  } catch {
    return null;
  }
}
