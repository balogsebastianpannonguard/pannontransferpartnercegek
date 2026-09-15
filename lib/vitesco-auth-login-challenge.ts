import jwt from "jsonwebtoken";
import { VITESCO_COOKIE_SECRET } from "./vitesco-auth";

export interface VitescoLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const VITESCO_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signVitescoLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: VitescoLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + VITESCO_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, VITESCO_COOKIE_SECRET);
}

export function verifyVitescoLoginChallenge(
  token: string
): VitescoLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, VITESCO_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > VITESCO_LOGIN_CHALLENGE_TTL_MS) return null;
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
