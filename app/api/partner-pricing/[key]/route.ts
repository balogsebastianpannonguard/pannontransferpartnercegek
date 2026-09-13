import { NextResponse } from "next/server";
import { getPartnerPricingLegacy } from "@/lib/partner-pricing";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    if (!key) {
      return NextResponse.json({ success: false, message: "Hiányzó partner kulcs." }, { status: 400 });
    }
    const pricingData = await getPartnerPricingLegacy(key);
    return NextResponse.json({ success: true, data: pricingData });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Szerverhiba történt." }, { status: 500 });
  }
}
