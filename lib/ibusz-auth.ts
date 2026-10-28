import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findIbuszUserByInviteToken,
  findIbuszUserByEmail,
  compareIbuszPassword,
  recordIbuszLogin,
  type IbuszPortalUser as IbuszDbUser,
} from "./ibusz-portal-users";

export const IBUSZ_SESSION_COOKIE = "pannon_ibusz_portal_session";
export const IBUSZ_COOKIE_SECRET =
  process.env.IBUSZ_COOKIE_SECRET || "ibusz_portal_super_secret_session_key_2026";

export interface IbuszPortalSessionUser {
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function validateInviteTokenOnly(rawToken: string): Promise<{
  success: boolean;
  message?: string;
  user?: IbuszDbUser;
}> {
  if (!rawToken) return { success: false, message: "Hiányzó meghívó token." };
  const user = await findIbuszUserByInviteToken(rawToken);
  if (!user) return { success: false, message: "Érvénytelen vagy lejárt meghívó link." };
  return { success: true, user };
}

export async function authenticateIbuszByPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: IbuszDbUser }> {
  if (!email || !password) return { success: false, message: "Hiányzó hitelesítő adatok." };
  const user = await findIbuszUserByEmail(email);
  if (!user) return { success: false, message: "Hibás e-mail cím vagy jelszó." };
  if (!user.isActivated || !user.hashedPassword) {
    return { success: false, message: "Ehhez a fiókhoz előbb be kell állítani a jelszót a meghívó linken keresztül." };
  }
  const ok = await compareIbuszPassword(user, password);
  if (!ok) return { success: false, message: "Hibás e-mail cím vagy jelszó." };
  await recordIbuszLogin(user._id!);
  return { success: true, user };
}

export async function setIbuszPasswordByInvite(
  rawToken: string,
  password: string
): Promise<{ success: boolean; message?: string; user?: IbuszDbUser }> {
  const check = await validateInviteTokenOnly(rawToken);
  if (!check.success || !check.user) return { success: false, message: check.message };
  if (check.user.isActivated && check.user.hashedPassword) {
    return { success: false, message: "A jelszó már be van állítva ehhez a fiókhoz." };
  }
  if (!password || password.length < 8) {
    return { success: false, message: "A jelszónak legalább 8 karakter hosszúnak kell lennie." };
  }
  const { setIbuszPasswordAndActivate } = await import("./ibusz-portal-users");
  const updated = await setIbuszPasswordAndActivate(check.user._id!, password);
  if (!updated) return { success: false, message: "A jelszó módosítása sikertelen." };
  return { success: true, user: updated };
}

export function createIbuszSessionToken(user: IbuszDbUser | IbuszPortalSessionUser): string {
  const payload: IbuszPortalSessionUser =
    "normalizedEmail" in (user as any) || "requireTwoFactor" in (user as any)
      ? {
          userId: (user as IbuszDbUser)._id!.toString(),
          email: user.email,
          requireTwoFactor: (user as IbuszDbUser).requireTwoFactor,
          twoFactorEnabled: (user as IbuszDbUser).twoFactorEnabled,
          loginAt: Date.now(),
        }
      : (user as IbuszPortalSessionUser);
  return jwt.sign(payload as any, IBUSZ_COOKIE_SECRET, { expiresIn: "7d" });
}

export function verifyIbuszSessionToken(token: string): IbuszPortalSessionUser | null {
  try {
    const d = jwt.verify(token, IBUSZ_COOKIE_SECRET) as any;
    if (!d?.userId || !d?.email) return null;
    return d as IbuszPortalSessionUser;
  } catch {
    return null;
  }
}

export async function setIbuszSessionCookie(token: string, remember: boolean = true) {
  const cookieStore = await cookies();
  cookieStore.set(IBUSZ_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
  });
}

export async function clearIbuszSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(IBUSZ_SESSION_COOKIE);
}

export async function getCurrentIbuszSession(): Promise<IbuszPortalSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(IBUSZ_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyIbuszSessionToken(token);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
