import { NextResponse } from "next/server";
import {
  getCurrentPartnerSession,
  getCurrentPartnerSessionForPortal,
  type PartnerPortal,
} from "@/lib/partner-session";
import {
  getBookingById,
  updateBooking,
  updateBookingStatus,
  validateTravelConditions,
  type Booking,
} from "@/lib/bookings";

export const dynamic = "force-dynamic";

function getRequestedPortal(request: Request): PartnerPortal | null {
  const portal = request.headers.get("x-partner-portal");
  return portal &&
    ["catl", "ecopro", "eccoino", "vitesco", "schaeffler", "krones", "enterair", "tama", "ni"].includes(portal)
    ? (portal as PartnerPortal)
    : null;
}

const PICKUP_AFFECTING_FIELDS = [
  "pickupDate",
  "pickupTime",
  "fromAddress",
  "toAddress",
  "travelers",
  "luggage",
 ] as const;

const ALLOWED_PATCH_FIELDS = [
  "travelerPhone",
  "secondTravelerEmail",
  "secondTravelerPhone",
  "pickupDate",
  "pickupTime",
  "fromAddress",
  "toAddress",
  "travelers",
  "luggage",
  "comment",
  "status",
] as const;

type AllowedPatchField = (typeof ALLOWED_PATCH_FIELDS)[number];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requestedPortal = getRequestedPortal(request);
    const session = requestedPortal
      ? await getCurrentPartnerSessionForPortal(requestedPortal)
      : await getCurrentPartnerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nincs aktív munkamenet." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const booking = await getBookingById(id, session.portal);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "A foglalás nem található." },
        { status: 404 }
      );
    }

    if (booking.userEmail !== session.email) {
      return NextResponse.json(
        { success: false, message: "Nincs jogosultság a foglalás megtekintéséhez." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ismeretlen hiba történt.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requestedPortal = getRequestedPortal(request);
    const session = requestedPortal
      ? await getCurrentPartnerSessionForPortal(requestedPortal)
      : await getCurrentPartnerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Nincs aktív munkamenet." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existingBooking = await getBookingById(id, session.portal);

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: "A foglalás nem található." },
        { status: 404 }
      );
    }

    if (existingBooking.userEmail !== session.email) {
      return NextResponse.json(
        { success: false, message: "Nincs jogosultság a foglalás módosításához." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const patch: Partial<Booking> = {};
    const keys = Object.keys(body);

    for (const key of keys) {
      if (ALLOWED_PATCH_FIELDS.includes(key as AllowedPatchField)) {
        const typedKey = key as AllowedPatchField;
        patch[typedKey] = body[typedKey];
      }
    }

    if (patch.status !== undefined) {
      if (patch.status !== "cancelled") {
        return NextResponse.json(
          {
            success: false,
            message: "Státusz csak 'cancelled' értékre módosítható.",
          },
          { status: 400 }
        );
      }
    }

    const hasPickupChange = PICKUP_AFFECTING_FIELDS.some(
      (field) => patch[field] !== undefined
    );

    if (hasPickupChange) {
      const mergedForValidation = {
        travelerEmail: existingBooking.travelerEmail,
        travelerName: existingBooking.travelerName,
        travelerPhone:
          patch.travelerPhone !== undefined
            ? patch.travelerPhone
            : existingBooking.travelerPhone,
        fromType: existingBooking.fromType,
        fromAddress:
          patch.fromAddress !== undefined
            ? patch.fromAddress
            : existingBooking.fromAddress,
        toType: existingBooking.toType,
        toAddress:
          patch.toAddress !== undefined
            ? patch.toAddress
            : existingBooking.toAddress,
        pickupDate:
          patch.pickupDate !== undefined
            ? patch.pickupDate
            : existingBooking.pickupDate,
        pickupTime:
          patch.pickupTime !== undefined
            ? patch.pickupTime
            : existingBooking.pickupTime,
        travelers:
          patch.travelers !== undefined
            ? patch.travelers
            : existingBooking.travelers,
        luggage:
          patch.luggage !== undefined ? patch.luggage : existingBooking.luggage,
        transferType: existingBooking.transferType,
        companyName: existingBooking.companyName,
      };

      const validation = await validateTravelConditions(mergedForValidation);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, errors: validation.errors },
          { status: 400 }
        );
      }
    }

    let updatedBooking: Booking | null;

    if (patch.status === "cancelled") {
      const { status: _status, ...restPatch } = patch;
      if (Object.keys(restPatch).length > 0) {
        updatedBooking = await updateBooking(
          id,
          restPatch,
          session.email,
          "Foglalás adatai módosítva"
        );
      } else {
        updatedBooking = existingBooking;
      }

      if (updatedBooking) {
        updatedBooking = await updateBookingStatus(
          id,
          "cancelled",
          session.email,
          "Felhasználó törölte a foglalást"
        );
      }
    } else {
      // Ha a partner módosítja a foglalást, állítsuk "modified" státuszra,
      // hogy a diszpécser lássa, hogy változás történt.
      const isSignificantChange = Object.keys(patch).some(k => k !== 'comment' && k !== 'status');
      
      const patchToApply: Partial<Booking> = { ...patch };
      
      if (isSignificantChange && existingBooking.status !== 'pending') {
        patchToApply.status = 'modified';
        patchToApply.driverNotified = false;
        patchToApply.driverAcknowledged = false;
      }

      updatedBooking = await updateBooking(
        id,
        patchToApply,
        session.email,
        "Foglalás adatai módosítva a partner által",
        "partner_modified"
      );
    }

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, message: "A foglalás módosítása sikertelen." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ismeretlen hiba történt.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
