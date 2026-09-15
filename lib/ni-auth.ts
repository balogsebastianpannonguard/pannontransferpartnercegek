import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findNiUserByInviteToken,
  findNiUserByEmail,
  compareNiPassword,
  recordNiLogin,
  type NiPortalUser as NiDbUser,
} from "./ni-portal-users";

export const NI_SESSION_COOKIE = "pannon_ni_portal_session";
export const NI_COOKIE_SECRET =
  process.env.NI_COOKIE_SECRET || "ni_portal_super_secret_session_key_2026";

export interface NiPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: NiDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findNiUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateNiByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: NiDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findNiUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareNiPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordNiLogin(user._id!);
  return { success: true, user };
}

export async function setNiPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: NiDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setNiPasswordAndActivate } = await import("./ni-portal-users");
  const updated = await setNiPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createNiSessionToken(user: NiDbUser | NiPortalSessionUser): string {
  const payload: NiPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as NiDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as NiDbUser).requireTwoFactor,
          twoFactorEnabled: (user as NiDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as NiPortalSessionUser);
  return jwt.sign(payload as any, NI_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyNiSessionToken(token: string): NiPortalSessionUser | null {
  try {
    const d = jwt.verify(token, NI_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as NiPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setNiSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(NI_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearNiSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(NI_SESSION_COOKIE);
}

export async function getCurrentNiSession(): Promise<NiPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NI_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyNiSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
