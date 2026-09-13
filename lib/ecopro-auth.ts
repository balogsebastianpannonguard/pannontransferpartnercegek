import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findEcoproUserByInviteToken,
  findEcoproUserByEmail,
  compareEcoproPassword,
  recordEcoproLogin,
  type EcoproPortalUser as EcoproDbUser,
} from "./ecopro-portal-users";

export const ECOPRO_SESSION_COOKIE = "pannon_ecopro_portal_session";
export const ECOPRO_COOKIE_SECRET =
  process.env.ECOPRO_COOKIE_SECRET || "ecopro_portal_super_secret_session_key_2026";

export interface EcoproPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: EcoproDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findEcoproUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateEcoproByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EcoproDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findEcoproUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareEcoproPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordEcoproLogin(user._id!);
  return { success: true, user };
}

export async function setEcoproPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EcoproDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setEcoproPasswordAndActivate } = await import("./ecopro-portal-users");
  const updated = await setEcoproPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createEcoproSessionToken(user: EcoproDbUser | EcoproPortalSessionUser): string {
  const payload: EcoproPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as EcoproDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as EcoproDbUser).requireTwoFactor,
          twoFactorEnabled: (user as EcoproDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as EcoproPortalSessionUser);
  return jwt.sign(payload as any, ECOPRO_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyEcoproSessionToken(token: string): EcoproPortalSessionUser | null {
  try {
    const d = jwt.verify(token, ECOPRO_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as EcoproPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setEcoproSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(ECOPRO_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearEcoproSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ECOPRO_SESSION_COOKIE);
}

export async function getCurrentEcoproSession(): Promise<EcoproPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ECOPRO_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyEcoproSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
