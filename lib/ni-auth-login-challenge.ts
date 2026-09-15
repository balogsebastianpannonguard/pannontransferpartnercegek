import jwt from "jsonwebtoken";
import { NI_COOKIE_SECRET } from "./ni-auth";

export interface NiLoginChallengePayload {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  issuedAt: number;
}

export const NI_LOGIN_CHALLENGE_TTL_MS = 10 * 60 * 1000;

export function signNiLoginChallenge(payload: {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
}): string {
  const iat = Date.now();
  const p: NiLoginChallengePayload & { exp: number } = {
    userId: payload.userId,
    email: payload.email,
    requireTwoFactor: !!payload.requireTwoFactor,
    issuedAt: iat,
    exp: Math.floor((iat + NI_LOGIN_CHALLENGE_TTL_MS) / 1000),
  };
  return jwt.sign(p as any, NI_COOKIE_SECRET);
}

export function verifyNiLoginChallenge(
  token: string
): NiLoginChallengePayload | null {
  if (!token) return null;
  try {
    const d = jwt.verify(token, NI_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    if (d.issuedAt && Date.now() - d.issuedAt > NI_LOGIN_CHALLENGE_TTL_MS) return null;
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
