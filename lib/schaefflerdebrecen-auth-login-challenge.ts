import jwt from "jsonwebtoken";
import { SCHAEFFLERDEBRECEN_COOKIE_SECRET } from "./schaefflerdebrecen-auth";

export interface SchaefflerDebrecenLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const SCHAEFFLERDEBRECEN_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signSchaefflerDebrecenLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: SchaefflerDebrecenLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + SCHAEFFLERDEBRECEN_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, SCHAEFFLERDEBRECEN_COOKIE_SECRET);
}

export function verifySchaefflerDebrecenLoginChallenge(
  token: string
): SchaefflerDebrecenLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, SCHAEFFLERDEBRECEN_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > SCHAEFFLERDEBRECEN_LOGIN_CHALLENGE_TTL_MS) return null;
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
