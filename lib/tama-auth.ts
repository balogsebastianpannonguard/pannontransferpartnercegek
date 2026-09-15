import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findTamaUserByInviteToken,
  findTamaUserByEmail,
  compareTamaPassword,
  recordTamaLogin,
  type TamaPortalUser as TamaDbUser,
} from "./tama-portal-users";

export const TAMA_SESSION_COOKIE = "pannon_tama_portal_session";
export const TAMA_COOKIE_SECRET =
  process.env.TAMA_COOKIE_SECRET || "tama_portal_super_secret_session_key_2026";

export interface TamaPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: TamaDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findTamaUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateTamaByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: TamaDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findTamaUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareTamaPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordTamaLogin(user._id!);
  return { success: true, user };
}

export async function setTamaPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: TamaDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setTamaPasswordAndActivate } = await import("./tama-portal-users");
  const updated = await setTamaPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createTamaSessionToken(user: TamaDbUser | TamaPortalSessionUser): string {
  const payload: TamaPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as TamaDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as TamaDbUser).requireTwoFactor,
          twoFactorEnabled: (user as TamaDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as TamaPortalSessionUser);
  return jwt.sign(payload as any, TAMA_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyTamaSessionToken(token: string): TamaPortalSessionUser | null {
  try {
    const d = jwt.verify(token, TAMA_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as TamaPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setTamaSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(TAMA_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearTamaSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TAMA_SESSION_COOKIE);
}

export async function getCurrentTamaSession(): Promise<TamaPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TAMA_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyTamaSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
