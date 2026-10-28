import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findEcoproInnovationUserByInviteToken,
  findEcoproInnovationUserByEmail,
  compareEcoproInnovationPassword,
  recordEcoproInnovationLogin,
  type EcoproInnovationPortalUser as EcoproInnovationDbUser,
} from "./ecoproinnovation-portal-users";

export const ECOPROINNOVATION_SESSION_COOKIE = "pannon_ecoproinnovation_portal_session";
export const ECOPROINNOVATION_COOKIE_SECRET =
  process.env.ECOPROINNOVATION_COOKIE_SECRET || "ecoproinnovation_portal_super_secret_session_key_2026";

export interface EcoproInnovationPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: EcoproInnovationDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findEcoproInnovationUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateEcoproInnovationByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EcoproInnovationDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findEcoproInnovationUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareEcoproInnovationPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordEcoproInnovationLogin(user._id!);
  return { success: true, user };
}

export async function setEcoproInnovationPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EcoproInnovationDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setEcoproInnovationPasswordAndActivate } = await import("./ecoproinnovation-portal-users");
  const updated = await setEcoproInnovationPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createEcoproInnovationSessionToken(user: EcoproInnovationDbUser | EcoproInnovationPortalSessionUser): string {
  const payload: EcoproInnovationPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as EcoproInnovationDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as EcoproInnovationDbUser).requireTwoFactor,
          twoFactorEnabled: (user as EcoproInnovationDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as EcoproInnovationPortalSessionUser);
  return jwt.sign(payload as any, ECOPROINNOVATION_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyEcoproInnovationSessionToken(token: string): EcoproInnovationPortalSessionUser | null {
  try {
    const d = jwt.verify(token, ECOPROINNOVATION_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as EcoproInnovationPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setEcoproInnovationSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(ECOPROINNOVATION_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearEcoproInnovationSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ECOPROINNOVATION_SESSION_COOKIE);
}

export async function getCurrentEcoproInnovationSession(): Promise<EcoproInnovationPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ECOPROINNOVATION_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyEcoproInnovationSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
