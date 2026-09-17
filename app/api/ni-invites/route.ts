import { NextResponse } from "next/server";
import { getCurrentNiSession } from "@/lib/ni-auth";
import { sendEmail } from "@/lib/email";
import {
  createDelegatedNiInvite,
  findNiUserByEmail,
  getNiCollection,
  type NiPortalUser,
} from "@/lib/ni-portal-users";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "balogh.sebastian@pannonguard.hu";
const EMERSON_DOMAIN = "@emerson.com";

function inviteEmail(email: string, link: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:32px;color:#0f172a">
    <h1>NI partner meghívó</h1>
    <p>Meghívást kapott a Pannon Transfer NI partnerportáljára.</p>
    <p><a href="${link}" style="display:inline-block;padding:14px 22px;background:#0f766e;color:#fff;border-radius:8px;text-decoration:none">Fiók aktiválása</a></p>
    <p style="color:#64748b;font-size:13px">A link 7 napig érvényes.</p>
  </div>`;
}

export async function GET() {
  const session = await getCurrentNiSession();
  if (!session) return NextResponse.json({ success: false, message: "Nincs aktív munkamenet." }, { status: 401 });

  const col = await getNiCollection();
  const users = await col.find({ invitedByUserId: session.userId }).sort({ createdAt: -1 }).toArray();
  const bookings = await (await import("@/lib/bookings")).getBookingsCollection();
  const stats = await bookings
    .aggregate([
      { $match: { userEmail: { $in: users.map((user: NiPortalUser) => user.email) } } },
      { $group: { _id: "$userEmail", count: { $sum: 1 } } },
    ])
    .toArray();
  const counts = new Map(stats.map((item) => [String(item._id).toLowerCase(), item.count]));

  return NextResponse.json({
    success: true,
    users: users.map((user: NiPortalUser) => ({
      id: user._id?.toString(),
      email: user.email,
      status: user.inviteStatus || "active",
      activated: !!user.isActivated,
      bookings: counts.get(user.email.toLowerCase()) || 0,
      createdAt: user.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const session = await getCurrentNiSession();
  if (!session) return NextResponse.json({ success: false, message: "Nincs aktív munkamenet." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, message: "Érvénytelen e-mail cím." }, { status: 400 });
  }
  if (email === session.email.toLowerCase()) {
    return NextResponse.json({ success: false, message: "Saját magadat nem hívhatod meg." }, { status: 400 });
  }

  const pendingApproval = !email.endsWith(EMERSON_DOMAIN);
  const existing = await findNiUserByEmail(email);
  if (existing?.isActivated) {
    return NextResponse.json({ success: false, message: "Ez az e-mail cím már aktív NI-fiókhoz tartozik." }, { status: 409 });
  }

  const invited = await createDelegatedNiInvite(email, {
    _id: existing?._id || session.userId,
    email: session.email,
  }, { pendingApproval });

  if (pendingApproval) {
    const approvalMail = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `NI meghívás jóváhagyásra vár · ${email}`,
      text: `${session.email} NI partner meghívást szeretne küldeni ennek a címnek: ${email}. Jóváhagyás után az adminisztrációs felületen küldhető ki.`,
    });
    return NextResponse.json({
      success: true,
      pendingApproval: true,
      message: approvalMail.success
        ? "A meghívás jóváhagyásra elküldve az adminisztrátornak."
        : "A meghívási kérelem mentve, de az adminisztrátori e-mail nem küldhető el.",
    });
  }

  const setupLink = `${new URL(request.url).origin}/ni/setup-password?token=${encodeURIComponent(invited.rawToken)}`;
  const mail = await sendEmail({
    to: email,
    subject: "Meghívás az NI Partner Portálra – Pannon Transfer",
    html: inviteEmail(email, setupLink),
    text: `NI partner meghívó: ${setupLink}`,
  });
  if (!mail.success) {
    return NextResponse.json({ success: false, message: mail.error || "A meghívó e-mail nem küldhető el." }, { status: 502 });
  }

  return NextResponse.json({ success: true, pendingApproval: false, message: "A meghívó sikeresen elküldve." });
}
