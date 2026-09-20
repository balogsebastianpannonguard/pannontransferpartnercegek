import { NextResponse } from "next/server";
import {
  getBookingByTrackToken,
  updateBooking,
  updateBookingStatus,
  validateTravelConditions,
  type Booking,
} from "@/lib/bookings";

export const dynamic = "force-dynamic";

const PICKUP_AFFECTING_FIELDS = [
  "pickupDate",
  "pickupTime",
  "fromAddress",
  "toAddress",
  "flightNumber",
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
  "flightNumber",
  "travelers",
  "luggage",
  "comment",
  "status",
] as const;

type AllowedPatchField = (typeof ALLOWED_PATCH_FIELDS)[number];

// Fields safe to expose to the public track view (no internal/session data).
function toPublicBooking(booking: Booking) {
  return {
    bookingCode: booking.bookingCode,
    status: booking.status,
    travelerName: booking.travelerName,
    travelerEmail: booking.travelerEmail,
    travelerPhone: booking.travelerPhone,
    secondTravelerEmail: booking.secondTravelerEmail,
    secondTravelerPhone: booking.secondTravelerPhone,
    companyName: booking.companyName,
    transferType: booking.transferType,
    fromType: booking.fromType,
    fromAddress: booking.fromAddress,
    toType: booking.toType,
    toAddress: booking.toAddress,
    flightNumber: booking.flightNumber,
    pickupDate: booking.pickupDate,
    pickupTime: booking.pickupTime,
    travelers: booking.travelers,
    luggage: booking.luggage,
    comment: booking.comment,
    assignedDriverName: booking.assignedDriverName,
    assignedVehicleName: booking.assignedVehicleName,
    trackLinkActive: booking.trackLinkActive !== false,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const booking = await getBookingByTrackToken(token);
  if (!booking) {
    return NextResponse.json(
      { success: false, message: "A követési link érvénytelen." },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, booking: toPublicBooking(booking) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const existingBooking = await getBookingByTrackToken(token);
    if (!existingBooking) {
      return NextResponse.json(
        { success: false, message: "A követési link érvénytelen." },
        { status: 404 }
      );
    }

    if (existingBooking.trackLinkActive === false) {
      return NextResponse.json(
        { success: false, message: "Az utazás már lezárult, módosítás nem lehetséges." },
        { status: 403 }
      );
    }

    if (["completed", "cancelled", "in-progress"].includes(existingBooking.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "A foglalás jelenlegi állapotában már nem módosítható. Kérjük, vegye fel a kapcsolatot diszpécserünkkel.",
        },
        { status: 403 }
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

    if (patch.status !== undefined && patch.status !== "cancelled") {
      return NextResponse.json(
        { success: false, message: "Státusz csak 'cancelled' értékre módosítható." },
        { status: 400 }
      );
    }

    const hasPickupChange = PICKUP_AFFECTING_FIELDS.some((field) => patch[field] !== undefined);

    if (hasPickupChange) {
      const mergedForValidation = {
        travelerEmail: existingBooking.travelerEmail,
        travelerName: existingBooking.travelerName,
        travelerPhone: patch.travelerPhone !== undefined ? patch.travelerPhone : existingBooking.travelerPhone,
        fromType: existingBooking.fromType,
        fromAddress: patch.fromAddress !== undefined ? patch.fromAddress : existingBooking.fromAddress,
        toType: existingBooking.toType,
        toAddress: patch.toAddress !== undefined ? patch.toAddress : existingBooking.toAddress,
        flightNumber: patch.flightNumber !== undefined ? patch.flightNumber : existingBooking.flightNumber,
        pickupDate: patch.pickupDate !== undefined ? patch.pickupDate : existingBooking.pickupDate,
        pickupTime: patch.pickupTime !== undefined ? patch.pickupTime : existingBooking.pickupTime,
        travelers: patch.travelers !== undefined ? patch.travelers : existingBooking.travelers,
        luggage: patch.luggage !== undefined ? patch.luggage : existingBooking.luggage,
        transferType: existingBooking.transferType,
        companyName: existingBooking.companyName,
      };

      const validation = await validateTravelConditions(mergedForValidation);
      if (!validation.valid) {
        return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
      }
    }

    const actor = `${existingBooking.travelerEmail} (track link)`;
    let updatedBooking: Booking | null;

    if (patch.status === "cancelled") {
      const { status: _status, ...restPatch } = patch;
      if (Object.keys(restPatch).length > 0) {
        updatedBooking = await updateBooking(existingBooking._id!, restPatch, actor, "Foglalás adatai módosítva");
      } else {
        updatedBooking = existingBooking;
      }
      if (updatedBooking) {
        updatedBooking = await updateBookingStatus(
          existingBooking._id!,
          "cancelled",
          actor,
          "Utas törölte a foglalást a követési linken keresztül"
        );
      }
    } else {
      const isSignificantChange = Object.keys(patch).some((k) => k !== "comment" && k !== "status");
      const patchToApply: Partial<Booking> = { ...patch };
      if (isSignificantChange && existingBooking.status !== "pending") {
        patchToApply.status = "modified";
        patchToApply.driverNotified = false;
        patchToApply.driverAcknowledged = false;
      }
      updatedBooking = await updateBooking(
        existingBooking._id!,
        patchToApply,
        actor,
        "Foglalás adatai módosítva az utas által a követési linken keresztül",
        "partner_modified"
      );
    }

    if (!updatedBooking) {
      return NextResponse.json({ success: false, message: "A foglalás módosítása sikertelen." }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: toPublicBooking(updatedBooking) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ismeretlen hiba történt.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
