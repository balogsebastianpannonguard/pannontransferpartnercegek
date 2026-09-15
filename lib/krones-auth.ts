import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findKronesUserByInviteToken,
  findKronesUserByEmail,
  compareKronesPassword,
  recordKronesLogin,
  type KronesPortalUser as KronesDbUser,
} from "./krones-portal-users";

export const KRONES_SESSION_COOKIE = "pannon_krones_portal_session";
export const KRONES_COOKIE_SECRET =
  process.env.KRONES_COOKIE_SECRET || "krones_portal_super_secret_session_key_2026";

export interface KronesPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: KronesDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findKronesUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateKronesByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: KronesDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findKronesUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareKronesPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordKronesLogin(user._id!);
  return { success: true, user };
}

export async function setKronesPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: KronesDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setKronesPasswordAndActivate } = await import("./krones-portal-users");
  const updated = await setKronesPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createKronesSessionToken(user: KronesDbUser | KronesPortalSessionUser): string {
  const payload: KronesPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as KronesDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as KronesDbUser).requireTwoFactor,
          twoFactorEnabled: (user as KronesDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as KronesPortalSessionUser);
  return jwt.sign(payload as any, KRONES_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyKronesSessionToken(token: string): KronesPortalSessionUser | null {
  try {
    const d = jwt.verify(token, KRONES_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as KronesPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setKronesSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(KRONES_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearKronesSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(KRONES_SESSION_COOKIE);
}

export async function getCurrentKronesSession(): Promise<KronesPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(KRONES_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyKronesSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
