import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findSchaefflerUserByInviteToken,
  findSchaefflerUserByEmail,
  compareSchaefflerPassword,
  recordSchaefflerLogin,
  type SchaefflerPortalUser as SchaefflerDbUser,
} from "./schaeffler-portal-users";

export const SCHAEFFLER_SESSION_COOKIE = "pannon_schaeffler_portal_session";
export const SCHAEFFLER_COOKIE_SECRET =
  process.env.SCHAEFFLER_COOKIE_SECRET || "schaeffler_portal_super_secret_session_key_2026";

export interface SchaefflerPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: SchaefflerDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findSchaefflerUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateSchaefflerByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: SchaefflerDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findSchaefflerUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareSchaefflerPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordSchaefflerLogin(user._id!);
  return { success: true, user };
}

export async function setSchaefflerPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: SchaefflerDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setSchaefflerPasswordAndActivate } = await import("./schaeffler-portal-users");
  const updated = await setSchaefflerPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createSchaefflerSessionToken(user: SchaefflerDbUser | SchaefflerPortalSessionUser): string {
  const payload: SchaefflerPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as SchaefflerDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as SchaefflerDbUser).requireTwoFactor,
          twoFactorEnabled: (user as SchaefflerDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as SchaefflerPortalSessionUser);
  return jwt.sign(payload as any, SCHAEFFLER_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifySchaefflerSessionToken(token: string): SchaefflerPortalSessionUser | null {
  try {
    const d = jwt.verify(token, SCHAEFFLER_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as SchaefflerPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setSchaefflerSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(SCHAEFFLER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearSchaefflerSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SCHAEFFLER_SESSION_COOKIE);
}

export async function getCurrentSchaefflerSession(): Promise<SchaefflerPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SCHAEFFLER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySchaefflerSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
