import { readAdditionalPassengers } from "./passengers";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * A további utasok blokkja a levelekhez (név, elérhetőség, egyedi felvételi hely).
 * Ha nincs további utas, üres szöveget ad vissza, így a levél pontosan a régi marad.
 */
export function buildAdditionalPassengersHtml(passengers: unknown, en: boolean): string {
  const list = readAdditionalPassengers(passengers);
  if (list.length === 0) return "";

  const rows = list
    .map((p, index) => {
      const contact = [p.email ? esc(p.email) : "", p.phone ? esc(p.phone) : ""].filter(Boolean).join(" · ");
      return `<div style="padding:10px 0;${index > 0 ? "border-top:1px solid #E2E8F0;" : ""}">
  <div style="font-size:14px;font-weight:800;color:#0F172A;">${index + 2}. ${esc(p.name)}</div>
  ${contact ? `<div style="font-size:12px;color:#475569;margin-top:3px;">${contact}</div>` : ""}
  ${
    p.pickupAddress
      ? `<div style="font-size:12px;color:#0F172A;margin-top:3px;"><span style="font-weight:700;color:#64748B;">${en ? "Pick-up point" : "Felvételi hely"}:</span> ${esc(p.pickupAddress)}</div>`
      : ""
  }
</div>`;
    })
    .join("");

  return `<div style="border:1px solid #E2E8F0;background:#FFFFFF;border-radius:12px;padding:12px 16px;margin-bottom:24px;">
  <div style="font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#64748B;margin-bottom:4px;">${en ? "Additional passengers" : "További utasok"}</div>
  ${rows}
</div>`;
}
