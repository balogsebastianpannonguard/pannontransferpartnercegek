import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findVitescoUserByInviteToken,
  findVitescoUserByEmail,
  compareVitescoPassword,
  recordVitescoLogin,
  type VitescoPortalUser as VitescoDbUser,
} from "./vitesco-portal-users";

export const VITESCO_SESSION_COOKIE = "pannon_vitesco_portal_session";
export const VITESCO_COOKIE_SECRET =
  process.env.VITESCO_COOKIE_SECRET || "vitesco_portal_super_secret_session_key_2026";

export interface VitescoPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: VitescoDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findVitescoUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateVitescoByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: VitescoDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findVitescoUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareVitescoPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordVitescoLogin(user._id!);
  return { success: true, user };
}

export async function setVitescoPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: VitescoDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setVitescoPasswordAndActivate } = await import("./vitesco-portal-users");
  const updated = await setVitescoPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createVitescoSessionToken(user: VitescoDbUser | VitescoPortalSessionUser): string {
  const payload: VitescoPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as VitescoDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as VitescoDbUser).requireTwoFactor,
          twoFactorEnabled: (user as VitescoDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as VitescoPortalSessionUser);
  return jwt.sign(payload as any, VITESCO_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyVitescoSessionToken(token: string): VitescoPortalSessionUser | null {
  try {
    const d = jwt.verify(token, VITESCO_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as VitescoPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setVitescoSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(VITESCO_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearVitescoSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(VITESCO_SESSION_COOKIE);
}

export async function getCurrentVitescoSession(): Promise<VitescoPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(VITESCO_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyVitescoSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
