export type PortalLanguage = "hu" | "en";

export function normalizePortalLanguage(value: unknown): PortalLanguage {
  return value === "en" ? "en" : "hu";
}
