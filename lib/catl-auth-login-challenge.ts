import jwt from "jsonwebtoken";
import { CATL_COOKIE_SECRET } from "./catl-auth";

export interface CatlLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const CATL_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signCatlLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: CatlLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + CATL_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, CATL_COOKIE_SECRET);
}

export function verifyCatlLoginChallenge(
  token: string
): CatlLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, CATL_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > CATL_LOGIN_CHALLENGE_TTL_MS) return null;
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
