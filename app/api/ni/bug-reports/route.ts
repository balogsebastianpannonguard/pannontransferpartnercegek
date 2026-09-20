import { NextRequest, NextResponse } from "next/server";
import { getCurrentPartnerSessionForPortal } from "@/lib/partner-session";
import { getDb } from "@/lib/mongodb";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

function buildBugReportEmail(params: {
  subject: string;
  description: string;
  reporterEmail: string;
  createdAt: number;
}): string {
  const date = new Date(params.createdAt).toLocaleString("hu-HU");
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a1628; color: #ffffff;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f59e0b;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 22px;">Új hibabejelentés érkezett</h1>
        <p style="color: #a0aec0; margin: 8px 0 0 0; font-size: 13px;">NI Admin portál · Céges foglalások</p>
      </div>
      <div style="padding: 24px 0;">
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(245,158,11,0.3); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0 0 4px 0;">TÁRGY</p>
          <p style="color: #ffffff; font-size: 16px; font-weight: bold; margin: 0;">${params.subject}</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #a0aec0; font-size: 12px; margin: 0 0 6px 0;">LEÍRÁS</p>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${params.description}</p>
        </div>
        <p style="color: #718096; font-size: 12px; margin: 0;">
          Bejelentő: ${params.reporterEmail} · ${date}
        </p>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  const session = await getCurrentPartnerSessionForPortal("ni");
  if (!session) {
    return NextResponse.json({ success: false, message: "Nincs aktív munkamenet." }, { status: 401 });
  }
  if (session.role !== "admin-ni") {
    return NextResponse.json(
      { success: false, message: "Ehhez a művelethez admin NI jogosultság szükséges." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!subject || !description) {
    return NextResponse.json(
      { success: false, message: "A tárgy és a leírás megadása kötelező." },
      { status: 400 }
    );
  }

  const createdAt = Date.now();

  const db = await getDb();
  const result = await db.collection("bug_reports").insertOne({
    portal: "ni",
    subject,
    description,
    reporterEmail: session.email,
    status: "open",
    createdAt,
  });

  try {
    await sendEmail({
      to: env.admin.email,
      subject: `[NI Admin] Hibabejelentés: ${subject}`,
      html: buildBugReportEmail({ subject, description, reporterEmail: session.email, createdAt }),
    });
  } catch (err) {
    console.error("[bug-reports] E-mail küldés sikertelen", err);
  }

  return NextResponse.json({ success: true, id: result.insertedId });
}

export async function GET() {
  const session = await getCurrentPartnerSessionForPortal("ni");
  if (!session || session.role !== "admin-ni") {
    return NextResponse.json({ success: false, message: "Nincs jogosultság." }, { status: 403 });
  }

  const db = await getDb();
  const reports = await db
    .collection("bug_reports")
    .find({ portal: "ni" })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({ success: true, reports });
}
