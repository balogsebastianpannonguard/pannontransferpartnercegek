import { getCurrentCatlSession } from "./catl-auth";
import { getCurrentEcoproSession } from "./ecopro-auth";
import { getCurrentEccoinoSession } from "./eccoino-auth";
import { getCurrentVitescoSession } from "./vitesco-auth";
import { getCurrentSchaefflerSession } from "./schaeffler-auth";
import { getCurrentKronesSession } from "./krones-auth";
import { getCurrentEnterairSession } from "./enterair-auth";
import { getCurrentTamaSession } from "./tama-auth";
import { getCurrentNiSession } from "./ni-auth";

export type PartnerPortal =
  | "catl"
  | "ecopro"
  | "eccoino"
  | "vitesco"
  | "schaeffler"
  | "krones"
  | "enterair"
  | "tama"
  | "ni";

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

  if (portal === "ecopro") {
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

  if (portal === "eccoino") {
    const eccoino = await getCurrentEccoinoSession();
    if (!eccoino) return null;
    return {
      portal: "eccoino",
      userId: eccoino.userId,
      email: eccoino.email,
      requireTwoFactor: eccoino.requireTwoFactor,
      twoFactorEnabled: eccoino.twoFactorEnabled,
      loginAt: eccoino.loginAt,
    };
  }

  if (portal === "vitesco") {
    const vitesco = await getCurrentVitescoSession();
    if (!vitesco) return null;
    return {
      portal: "vitesco",
      userId: vitesco.userId,
      email: vitesco.email,
      requireTwoFactor: vitesco.requireTwoFactor,
      twoFactorEnabled: vitesco.twoFactorEnabled,
      loginAt: vitesco.loginAt,
    };
  }

  if (portal === "schaeffler") {
    const schaeffler = await getCurrentSchaefflerSession();
    if (!schaeffler) return null;
    return {
      portal: "schaeffler",
      userId: schaeffler.userId,
      email: schaeffler.email,
      requireTwoFactor: schaeffler.requireTwoFactor,
      twoFactorEnabled: schaeffler.twoFactorEnabled,
      loginAt: schaeffler.loginAt,
    };
  }

  if (portal === "krones") {
    const krones = await getCurrentKronesSession();
    if (!krones) return null;
    return {
      portal: "krones",
      userId: krones.userId,
      email: krones.email,
      requireTwoFactor: krones.requireTwoFactor,
      twoFactorEnabled: krones.twoFactorEnabled,
      loginAt: krones.loginAt,
    };
  }

  if (portal === "enterair") {
    const enterair = await getCurrentEnterairSession();
    if (!enterair) return null;
    return {
      portal: "enterair",
      userId: enterair.userId,
      email: enterair.email,
      requireTwoFactor: enterair.requireTwoFactor,
      twoFactorEnabled: enterair.twoFactorEnabled,
      loginAt: enterair.loginAt,
    };
  }

  if (portal === "tama") {
    const tama = await getCurrentTamaSession();
    if (!tama) return null;
    return {
      portal: "tama",
      userId: tama.userId,
      email: tama.email,
      requireTwoFactor: tama.requireTwoFactor,
      twoFactorEnabled: tama.twoFactorEnabled,
      loginAt: tama.loginAt,
    };
  }

  const ni = await getCurrentNiSession();
  if (!ni) return null;
  return {
    portal: "ni",
    userId: ni.userId,
    email: ni.email,
    requireTwoFactor: ni.requireTwoFactor,
    twoFactorEnabled: ni.twoFactorEnabled,
    loginAt: ni.loginAt,
  };
}

export async function getCurrentPartnerSession(): Promise<PartnerSession | null> {
  return (
    (await getCurrentPartnerSessionForPortal("catl")) ||
    (await getCurrentPartnerSessionForPortal("ecopro")) ||
    (await getCurrentPartnerSessionForPortal("eccoino")) ||
    (await getCurrentPartnerSessionForPortal("vitesco")) ||
    (await getCurrentPartnerSessionForPortal("schaeffler")) ||
    (await getCurrentPartnerSessionForPortal("krones")) ||
    (await getCurrentPartnerSessionForPortal("enterair")) ||
    (await getCurrentPartnerSessionForPortal("tama")) ||
    (await getCurrentPartnerSessionForPortal("ni"))
  );
}
