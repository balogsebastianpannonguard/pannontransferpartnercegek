import jwt from "jsonwebtoken";
import { ENTERAIR_COOKIE_SECRET } from "./enterair-auth";

export interface EnterairLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const ENTERAIR_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signEnterairLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: EnterairLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + ENTERAIR_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, ENTERAIR_COOKIE_SECRET);
}

export function verifyEnterairLoginChallenge(
  token: string
): EnterairLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, ENTERAIR_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > ENTERAIR_LOGIN_CHALLENGE_TTL_MS) return null;
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
