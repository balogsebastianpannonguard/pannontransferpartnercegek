import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findEccoinoUserByInviteToken,
  findEccoinoUserByEmail,
  compareEccoinoPassword,
  recordEccoinoLogin,
  type EccoinoPortalUser as EccoinoDbUser,
} from "./eccoino-portal-users";

export const ECCOINO_SESSION_COOKIE = "pannon_eccoino_portal_session";
export const ECCOINO_COOKIE_SECRET =
  process.env.ECCOINO_COOKIE_SECRET || "eccoino_portal_super_secret_session_key_2026";

export interface EccoinoPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: EccoinoDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findEccoinoUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateEccoinoByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EccoinoDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findEccoinoUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareEccoinoPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordEccoinoLogin(user._id!);
  return { success: true, user };
}

export async function setEccoinoPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: EccoinoDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setEccoinoPasswordAndActivate } = await import("./eccoino-portal-users");
  const updated = await setEccoinoPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createEccoinoSessionToken(user: EccoinoDbUser | EccoinoPortalSessionUser): string {
  const payload: EccoinoPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as EccoinoDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as EccoinoDbUser).requireTwoFactor,
          twoFactorEnabled: (user as EccoinoDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as EccoinoPortalSessionUser);
  return jwt.sign(payload as any, ECCOINO_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyEccoinoSessionToken(token: string): EccoinoPortalSessionUser | null {
  try {
    const d = jwt.verify(token, ECCOINO_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as EccoinoPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setEccoinoSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(ECCOINO_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearEccoinoSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ECCOINO_SESSION_COOKIE);
}

export async function getCurrentEccoinoSession(): Promise<EccoinoPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ECCOINO_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyEccoinoSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
