import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findEnterairUserByInviteToken,
  findEnterairUserByEmail,
  compareEnterairPassword,
  recordEnterairLogin,
  type EnterairPortalUser as EnterairDbUser,
} from "./enterair-portal-users";

export const ENTERAIR_SESSION_COOKIE = "pannon_enterair_portal_session";
export const ENTERAIR_COOKIE_SECRET =
  process.env.ENTERAIR_COOKIE_SECRET || "enterair_portal_super_secret_session_key_2026";

export interface EnterairPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: EnterairDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findEnterairUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateEnterairByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EnterairDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findEnterairUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareEnterairPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordEnterairLogin(user._id!);
  return { success: true, user };
}

export async function setEnterairPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EnterairDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setEnterairPasswordAndActivate } = await import("./enterair-portal-users");
  const updated = await setEnterairPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createEnterairSessionToken(user: EnterairDbUser | EnterairPortalSessionUser): string {
  const payload: EnterairPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as EnterairDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as EnterairDbUser).requireTwoFactor,
          twoFactorEnabled: (user as EnterairDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as EnterairPortalSessionUser);
  return jwt.sign(payload as any, ENTERAIR_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyEnterairSessionToken(token: string): EnterairPortalSessionUser | null {
  try {
    const d = jwt.verify(token, ENTERAIR_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as EnterairPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setEnterairSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(ENTERAIR_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearEnterairSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ENTERAIR_SESSION_COOKIE);
}

export async function getCurrentEnterairSession(): Promise<EnterairPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ENTERAIR_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyEnterairSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
