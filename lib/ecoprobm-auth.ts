import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findEcoproBmUserByInviteToken,
  findEcoproBmUserByEmail,
  compareEcoproBmPassword,
  recordEcoproBmLogin,
  type EcoproBmPortalUser as EcoproBmDbUser,
} from "./ecoprobm-portal-users";

export const ECOPROBM_SESSION_COOKIE = "pannon_ecoprobm_portal_session";
export const ECOPROBM_COOKIE_SECRET =
  process.env.ECOPROBM_COOKIE_SECRET || "ecoprobm_portal_super_secret_session_key_2026";

export interface EcoproBmPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: EcoproBmDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findEcoproBmUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateEcoproBmByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EcoproBmDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findEcoproBmUserByEmail(email);
  if (!user) return { success: false, message: "Hibás e-mail cím vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareEcoproBmPassword(user, password);
  if (!ok) return { success: false, message: "Hibás e-mail cím vagy jelszó." };
  await recordEcoproBmLogin(user._id!);
  return { success: true, user };
}

export async function setEcoproBmPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EcoproBmDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setEcoproBmPasswordAndActivate } = await import("./ecoprobm-portal-users");
  const updated = await setEcoproBmPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createEcoproBmSessionToken(user: EcoproBmDbUser | EcoproBmPortalSessionUser): string {
  const payload: EcoproBmPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as EcoproBmDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as EcoproBmDbUser).requireTwoFactor,
          twoFactorEnabled: (user as EcoproBmDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as EcoproBmPortalSessionUser);
  return jwt.sign(payload as any, ECOPROBM_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyEcoproBmSessionToken(token: string): EcoproBmPortalSessionUser | null {
  try {
    const d = jwt.verify(token, ECOPROBM_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as EcoproBmPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setEcoproBmSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(ECOPROBM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearEcoproBmSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ECOPROBM_SESSION_COOKIE);
}

export async function getCurrentEcoproBmSession(): Promise<EcoproBmPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ECOPROBM_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyEcoproBmSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
