import jwt from "jsonwebtoken";
import { TAMA_COOKIE_SECRET } from "./tama-auth";

export interface TamaLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const TAMA_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signTamaLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: TamaLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + TAMA_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, TAMA_COOKIE_SECRET);
}

export function verifyTamaLoginChallenge(
  token: string
): TamaLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, TAMA_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > TAMA_LOGIN_CHALLENGE_TTL_MS) return null;
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
