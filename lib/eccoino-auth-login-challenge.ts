import jwt from "jsonwebtoken";
import { ECCOINO_COOKIE_SECRET } from "./eccoino-auth";

export interface EccoinoLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const ECCOINO_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signEccoinoLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: EccoinoLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + ECCOINO_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, ECCOINO_COOKIE_SECRET);
}

export function verifyEccoinoLoginChallenge(
  token: string
): EccoinoLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, ECCOINO_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > ECCOINO_LOGIN_CHALLENGE_TTL_MS) return null;
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
