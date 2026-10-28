import jwt from "jsonwebtoken";
import { ECOPROINNOVATION_COOKIE_SECRET } from "./ecoproinnovation-auth";

export interface EcoproInnovationLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const ECOPROINNOVATION_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signEcoproInnovationLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: EcoproInnovationLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + ECOPROINNOVATION_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, ECOPROINNOVATION_COOKIE_SECRET);
}

export function verifyEcoproInnovationLoginChallenge(
  token: string
): EcoproInnovationLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, ECOPROINNOVATION_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > ECOPROINNOVATION_LOGIN_CHALLENGE_TTL_MS) return null;
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
