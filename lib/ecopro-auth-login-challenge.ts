import jwt from "jsonwebtoken";
import { ECOPRO_COOKIE_SECRET } from "./ecopro-auth";

export interface EcoproLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const ECOPRO_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signEcoproLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: EcoproLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + ECOPRO_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, ECOPRO_COOKIE_SECRET);
}

export function verifyEcoproLoginChallenge(
  token: string
): EcoproLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, ECOPRO_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > ECOPRO_LOGIN_CHALLENGE_TTL_MS) return null;
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
