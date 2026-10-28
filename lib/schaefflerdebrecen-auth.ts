import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findSchaefflerDebrecenUserByInviteToken,
  findSchaefflerDebrecenUserByEmail,
  compareSchaefflerDebrecenPassword,
  recordSchaefflerDebrecenLogin,
  type SchaefflerDebrecenPortalUser as SchaefflerDebrecenDbUser,
} from "./schaefflerdebrecen-portal-users";

export const SCHAEFFLERDEBRECEN_SESSION_COOKIE = "pannon_schaefflerdebrecen_portal_session";
export const SCHAEFFLERDEBRECEN_COOKIE_SECRET =
  process.env.SCHAEFFLERDEBRECEN_COOKIE_SECRET || "schaefflerdebrecen_portal_super_secret_session_key_2026";

export interface SchaefflerDebrecenPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: SchaefflerDebrecenDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findSchaefflerDebrecenUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateSchaefflerDebrecenByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: SchaefflerDebrecenDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findSchaefflerDebrecenUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareSchaefflerDebrecenPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordSchaefflerDebrecenLogin(user._id!);
  return { success: true, user };
}

export async function setSchaefflerDebrecenPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: SchaefflerDebrecenDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setSchaefflerDebrecenPasswordAndActivate } = await import("./schaefflerdebrecen-portal-users");
  const updated = await setSchaefflerDebrecenPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createSchaefflerDebrecenSessionToken(user: SchaefflerDebrecenDbUser | SchaefflerDebrecenPortalSessionUser): string {
  const payload: SchaefflerDebrecenPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as SchaefflerDebrecenDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as SchaefflerDebrecenDbUser).requireTwoFactor,
          twoFactorEnabled: (user as SchaefflerDebrecenDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as SchaefflerDebrecenPortalSessionUser);
  return jwt.sign(payload as any, SCHAEFFLERDEBRECEN_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifySchaefflerDebrecenSessionToken(token: string): SchaefflerDebrecenPortalSessionUser | null {
  try {
    const d = jwt.verify(token, SCHAEFFLERDEBRECEN_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as SchaefflerDebrecenPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setSchaefflerDebrecenSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(SCHAEFFLERDEBRECEN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearSchaefflerDebrecenSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SCHAEFFLERDEBRECEN_SESSION_COOKIE);
}

export async function getCurrentSchaefflerDebrecenSession(): Promise<SchaefflerDebrecenPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SCHAEFFLERDEBRECEN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySchaefflerDebrecenSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
