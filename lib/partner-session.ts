import { getCurrentCatlSession } from "./catl-auth";
import { getCurrentEcoproInnovationSession } from "./ecoproinnovation-auth";
import { getCurrentEcoproBmSession } from "./ecoprobm-auth";
import { getCurrentSchaefflerMotionSession } from "./schaefflermotion-auth";
import { getCurrentSchaefflerDebrecenSession } from "./schaefflerdebrecen-auth";
import { getCurrentTamaSession } from "./tama-auth";
import { getCurrentIbuszSession } from "./ibusz-auth";
import { getCurrentNiSession } from "./ni-auth";

export type PartnerPortal =
  | "catl"
  | "ecoproinnovation"
  | "ecoprobm"
  | "schaefflermotion"
  | "schaefflerdebrecen"
  | "tama"
  | "ibusz"
  | "ni";

export interface PartnerSession {
  portal: PartnerPortal;
  userId: string;
  email: string;
  requireTwoFactor: boolean;
  twoFactorEnabled: boolean;
  loginAt: number;
  role?: "admin-ni" | "normal";
  displayName?: string | null;
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

  if (portal === "ecoproinnovation") {
    const ecoproinnovation = await getCurrentEcoproInnovationSession();
    if (!ecoproinnovation) return null;
    return {
      portal: "ecoproinnovation",
      userId: ecoproinnovation.userId,
      email: ecoproinnovation.email,
      requireTwoFactor: ecoproinnovation.requireTwoFactor,
      twoFactorEnabled: ecoproinnovation.twoFactorEnabled,
      loginAt: ecoproinnovation.loginAt,
    };
  }

  if (portal === "ecoprobm") {
    const ecoprobm = await getCurrentEcoproBmSession();
    if (!ecoprobm) return null;
    return {
      portal: "ecoprobm",
      userId: ecoprobm.userId,
      email: ecoprobm.email,
      requireTwoFactor: ecoprobm.requireTwoFactor,
      twoFactorEnabled: ecoprobm.twoFactorEnabled,
      loginAt: ecoprobm.loginAt,
    };
  }

  if (portal === "schaefflermotion") {
    const schaefflermotion = await getCurrentSchaefflerMotionSession();
    if (!schaefflermotion) return null;
    return {
      portal: "schaefflermotion",
      userId: schaefflermotion.userId,
      email: schaefflermotion.email,
      requireTwoFactor: schaefflermotion.requireTwoFactor,
      twoFactorEnabled: schaefflermotion.twoFactorEnabled,
      loginAt: schaefflermotion.loginAt,
    };
  }

  if (portal === "schaefflerdebrecen") {
    const schaefflerdebrecen = await getCurrentSchaefflerDebrecenSession();
    if (!schaefflerdebrecen) return null;
    return {
      portal: "schaefflerdebrecen",
      userId: schaefflerdebrecen.userId,
      email: schaefflerdebrecen.email,
      requireTwoFactor: schaefflerdebrecen.requireTwoFactor,
      twoFactorEnabled: schaefflerdebrecen.twoFactorEnabled,
      loginAt: schaefflerdebrecen.loginAt,
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

  if (portal === "ibusz") {
    const ibusz = await getCurrentIbuszSession();
    if (!ibusz) return null;
    return {
      portal: "ibusz",
      userId: ibusz.userId,
      email: ibusz.email,
      requireTwoFactor: ibusz.requireTwoFactor,
      twoFactorEnabled: ibusz.twoFactorEnabled,
      loginAt: ibusz.loginAt,
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
    role: ni.role === "admin-ni" ? "admin-ni" : "normal",
    displayName: ni.displayName ?? null,
  };
}

export async function getCurrentPartnerSession(): Promise<PartnerSession | null> {
  return (
    (await getCurrentPartnerSessionForPortal("catl")) ||
    (await getCurrentPartnerSessionForPortal("ecoproinnovation")) ||
    (await getCurrentPartnerSessionForPortal("ecoprobm")) ||
    (await getCurrentPartnerSessionForPortal("schaefflermotion")) ||
    (await getCurrentPartnerSessionForPortal("schaefflerdebrecen")) ||
    (await getCurrentPartnerSessionForPortal("tama")) ||
    (await getCurrentPartnerSessionForPortal("ibusz")) ||
    (await getCurrentPartnerSessionForPortal("ni"))
  );
}
