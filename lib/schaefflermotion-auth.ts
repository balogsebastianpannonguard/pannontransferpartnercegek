import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findSchaefflerMotionUserByInviteToken,
  findSchaefflerMotionUserByEmail,
  compareSchaefflerMotionPassword,
  recordSchaefflerMotionLogin,
  type SchaefflerMotionPortalUser as SchaefflerMotionDbUser,
} from "./schaefflermotion-portal-users";

export const SCHAEFFLERMOTION_SESSION_COOKIE = "pannon_schaefflermotion_portal_session";
export const SCHAEFFLERMOTION_COOKIE_SECRET =
  process.env.SCHAEFFLERMOTION_COOKIE_SECRET || "schaefflermotion_portal_super_secret_session_key_2026";

export interface SchaefflerMotionPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: SchaefflerMotionDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findSchaefflerMotionUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateSchaefflerMotionByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: SchaefflerMotionDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findSchaefflerMotionUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareSchaefflerMotionPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordSchaefflerMotionLogin(user._id!);
  return { success: true, user };
}

export async function setSchaefflerMotionPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: SchaefflerMotionDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setSchaefflerMotionPasswordAndActivate } = await import("./schaefflermotion-portal-users");
  const updated = await setSchaefflerMotionPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createSchaefflerMotionSessionToken(user: SchaefflerMotionDbUser | SchaefflerMotionPortalSessionUser): string {
  const payload: SchaefflerMotionPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as SchaefflerMotionDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as SchaefflerMotionDbUser).requireTwoFactor,
          twoFactorEnabled: (user as SchaefflerMotionDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as SchaefflerMotionPortalSessionUser);
  return jwt.sign(payload as any, SCHAEFFLERMOTION_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifySchaefflerMotionSessionToken(token: string): SchaefflerMotionPortalSessionUser | null {
  try {
    const d = jwt.verify(token, SCHAEFFLERMOTION_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as SchaefflerMotionPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setSchaefflerMotionSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(SCHAEFFLERMOTION_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearSchaefflerMotionSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SCHAEFFLERMOTION_SESSION_COOKIE);
}

export async function getCurrentSchaefflerMotionSession(): Promise<SchaefflerMotionPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SCHAEFFLERMOTION_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySchaefflerMotionSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
