import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findCatlUserByInviteToken,
  findCatlUserByEmail,
  compareCatlPassword,
  recordCatlLogin,
  type CatlPortalUser as CatlDbUser,
} from "./catl-portal-users";

export const CATL_SESSION_COOKIE = "pannon_catl_portal_session";
export const CATL_COOKIE_SECRET =
  process.env.CATL_COOKIE_SECRET || "catl_portal_super_secret_session_key_2026";

export interface CatlPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: CatlDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findCatlUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateCatlByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: CatlDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findCatlUserByEmail(email);
  if (!user) return { success: false, message: "Hibás email vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareCatlPassword(user, password);
  if (!ok) return { success: false, message: "Hibás email vagy jelszó." };
  await recordCatlLogin(user._id!);
  return { success: true, user };
}

export async function setCatlPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: CatlDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak minimum 8 karakter hosszúnak kell lennie." };
  }
  const { setCatlPasswordAndActivate } = await import("./catl-portal-users");
  const updated = await setCatlPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "Jelszó módosítás sikertelen." };
  return { success: true, user: updated };
}

export function createCatlSessionToken(user: CatlDbUser | CatlPortalSessionUser): string {
  const payload: CatlPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as CatlDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as CatlDbUser).requireTwoFactor,
          twoFactorEnabled: (user as CatlDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as CatlPortalSessionUser);
  return jwt.sign(payload as any, CATL_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyCatlSessionToken(token: string): CatlPortalSessionUser | null {
  try {
    const d = jwt.verify(token, CATL_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as CatlPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setCatlSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(CATL_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearCatlSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(CATL_SESSION_COOKIE);
}

export async function getCurrentCatlSession(): Promise<CatlPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CATL_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyCatlSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
