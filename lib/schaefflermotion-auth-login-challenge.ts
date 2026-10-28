import jwt from "jsonwebtoken";
import { SCHAEFFLERMOTION_COOKIE_SECRET } from "./schaefflermotion-auth";

export interface SchaefflerMotionLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const SCHAEFFLERMOTION_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signSchaefflerMotionLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: SchaefflerMotionLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + SCHAEFFLERMOTION_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, SCHAEFFLERMOTION_COOKIE_SECRET);
}

export function verifySchaefflerMotionLoginChallenge(
  token: string
): SchaefflerMotionLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, SCHAEFFLERMOTION_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > SCHAEFFLERMOTION_LOGIN_CHALLENGE_TTL_MS) return null;
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
