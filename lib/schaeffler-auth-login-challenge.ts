import jwt from "jsonwebtoken";
import { SCHAEFFLER_COOKIE_SECRET } from "./schaeffler-auth";

export interface SchaefflerLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const SCHAEFFLER_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signSchaefflerLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: SchaefflerLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + SCHAEFFLER_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, SCHAEFFLER_COOKIE_SECRET);
}

export function verifySchaefflerLoginChallenge(
  token: string
): SchaefflerLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, SCHAEFFLER_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > SCHAEFFLER_LOGIN_CHALLENGE_TTL_MS) return null;
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
