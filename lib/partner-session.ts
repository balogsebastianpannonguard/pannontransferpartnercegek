import { getCurrentCatlSession } from "./catl-auth";
import { getCurrentEcoproSession } from "./ecopro-auth";

export type PartnerPortal = "catl" | "ecopro";

export interface PartnerSession {
  portal: PartnerPortal;
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
}

export async function getCurrentPartnerSessionForPortal(
  portal: PartnerPortal
): Promise<PartnerSession | null> {
  if (portal === "catl") {
    const catl = await getCurrentCatlSession();
    if (!catl) return null;
    return {
      portal: "catl",
      userId: catl.userId,
      email: catl.email,
      requireTwoFactor: catl.requireTwoFactor,
      twoFactorEnabled: catl.twoFactorEnabled,
      loginAt: catl.loginAt,
    };
  }

  const ecopro = await getCurrentEcoproSession();
  if (!ecopro) return null;
  return {
    portal: "ecopro",
    userId: ecopro.userId,
    email: ecopro.email,
    requireTwoFactor: ecopro.requireTwoFactor,
    twoFactorEnabled: ecopro.twoFactorEnabled,
    loginAt: ecopro.loginAt,
  };
}

export async function getCurrentPartnerSession(): Promise<PartnerSession | null> {
  return (
    (await getCurrentPartnerSessionForPortal("catl")) ||
    (await getCurrentPartnerSessionForPortal("ecopro"))
  );
}
