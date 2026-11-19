"use client";

import { Plus, X, User, Mail, Phone, MapPin } from "lucide-react";
import { useNiLanguage } from "../useNiLanguage";
import { MAX_ADDITIONAL_PASSENGERS } from "@/lib/passengers";

/** Űrlap-állapot egy további utashoz (minden mező szöveg, a küldéskor tisztítjuk). */
export interface PassengerDraft {
  name: string;
  email: string;
  phone: string;
  pickupAddress: string;
}

export const emptyPassengerDraft = (): PassengerDraft => ({
  name: "",
  email: "",
  phone: "",
  pickupAddress: "",
});

/** A kitöltött sorokból összeállítja a szervernek küldendő listát (teljesen üres sorokat kihagyja). */
export function passengerDraftsToPayload(drafts: PassengerDraft[]) {
  return drafts
    .map((d) => ({
      name: d.name.trim(),
      email: d.email.trim(),
      phone: d.phone.trim(),
      pickupAddress: d.pickupAddress.trim(),
    }))
    .filter((d) => d.name || d.email || d.phone || d.pickupAddress)
    .map((d) => ({
      name: d.name,
      ...(d.email ? { email: d.email } : {}),
      ...(d.phone ? { phone: d.phone } : {}),
      ...(d.pickupAddress ? { pickupAddress: d.pickupAddress } : {}),
    }));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Kliensoldali ellenőrzés: név kötelező, ha más adat is van; az e-mail formátuma helyes legyen. */
export function validatePassengerDrafts(
  drafts: PassengerDraft[],
  tr: <T,>(hu: T, en: T) => T,
): string[] {
  const errors: string[] = [];
  drafts.forEach((d, index) => {
    const hasAny = d.name.trim() || d.email.trim() || d.phone.trim() || d.pickupAddress.trim();
    if (!hasAny) return;
    const position = index + 2;
    if (!d.name.trim()) {
      errors.push(
        tr(
          `A(z) ${position}. utas nevének megadása kötelező`,
          `The name of passenger ${position} is required`,
        ),
      );
    }
    if (d.email.trim() && !EMAIL_RE.test(d.email.trim())) {
      errors.push(
        tr(
          `A(z) ${position}. utas e-mail címének formátuma érvénytelen`,
          `The email address of passenger ${position} is invalid`,
        ),
      );
    }
  });
  return errors;
}

interface Props {
  passengers: PassengerDraft[];
  onChange: (next: PassengerDraft[]) => void;
  /** Megjeleníti-e a hibákat (pl. beküldési kísérlet után). */
  showErrors?: boolean;
  /** Egy sor hozzáadásakor hívódik – az utasok számláló növeléséhez. */
  onAdd?: (nextCount: number) => void;
}

const inputWrap =
  "w-full bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-center gap-3 text-slate-300 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all";
const inputWrapInvalid =
  "w-full bg-white/[0.03] border border-red-500/70 ring-1 ring-red-500/20 rounded-lg p-3 flex items-center gap-3 text-slate-300 focus-within:border-red-500 transition-all";
const inputClass =
  "bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white";
const labelClass = "text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1";

export default function AdditionalPassengersEditor({ passengers, onChange, showErrors, onAdd }: Props) {
  const { tr } = useNiLanguage();
  const canAdd = passengers.length < MAX_ADDITIONAL_PASSENGERS;

  const update = (index: number, patch: Partial<PassengerDraft>) => {
    onChange(passengers.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  };

  const remove = (index: number) => {
    onChange(passengers.filter((_, i) => i !== index));
  };

  const add = () => {
    if (!canAdd) return;
    onChange([...passengers, emptyPassengerDraft()]);
    onAdd?.(passengers.length + 1);
  };

  return (
    <div className="space-y-4 pt-2 border-t border-slate-800/50" data-testid="additional-passengers">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
            {tr("További utasok (opcionális)", "Additional passengers (optional)")}
          </p>
          <p className="text-[11px] text-slate-500 ml-1 mt-1 leading-relaxed">
            {tr(
              "Ha többen utaznak, add meg a további utasokat. A név kötelező, az e-mail cím, a telefonszám és az eltérő felvételi hely opcionális.",
              "If more people are travelling, add the additional passengers. The name is required; email, phone number and a different pick-up point are optional.",
            )}
          </p>
        </div>
      </div>

      {passengers.map((passenger, index) => {
        const position = index + 2;
        const nameMissing =
          !passenger.name.trim() &&
          !!(passenger.email.trim() || passenger.phone.trim() || passenger.pickupAddress.trim());
        const emailInvalid = !!passenger.email.trim() && !EMAIL_RE.test(passenger.email.trim());
        const nameInvalid = !!showErrors && nameMissing;
        return (
          <div
            key={index}
            className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-4"
            data-testid={`additional-passenger-${index}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#41B679]">
                {tr(`${position}. utas`, `Passenger ${position}`)}
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label={tr(`${position}. utas törlése`, `Remove passenger ${position}`)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                {tr("Törlés", "Remove")}
              </button>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>
                {tr("Név", "Name")} <span className="text-[#10B981]">*</span>
              </label>
              <div className={nameInvalid ? inputWrapInvalid : inputWrap}>
                <User className={`w-4 h-4 ${nameInvalid ? "text-red-400" : "text-slate-500"}`} />
                <input
                  type="text"
                  value={passenger.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                  placeholder={tr("Az utas teljes neve", "Passenger's full name")}
                  maxLength={200}
                  className={inputClass}
                />
              </div>
              {nameInvalid && (
                <p className="text-[11px] text-red-400 ml-1 font-medium">
                  {tr("Név megadása kötelező", "Name is required")}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>{tr("E-mail cím (opcionális)", "Email (optional)")}</label>
                <div className={showErrors && emailInvalid ? inputWrapInvalid : inputWrap}>
                  <Mail className="w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={passenger.email}
                    onChange={(e) => update(index, { email: e.target.value })}
                    placeholder={tr("Opcionális", "Optional")}
                    maxLength={200}
                    className={inputClass}
                  />
                </div>
                {showErrors && emailInvalid && (
                  <p className="text-[11px] text-red-400 ml-1 font-medium">
                    {tr("Érvénytelen e-mail cím", "Invalid email address")}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className={labelClass}>{tr("Telefonszám (opcionális)", "Phone number (optional)")}</label>
                <div className={inputWrap}>
                  <Phone className="w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={passenger.phone}
                    onChange={(e) => update(index, { phone: e.target.value.replace(/[^\d]/g, "") })}
                    placeholder="36301234567"
                    maxLength={40}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>
                {tr("Eltérő felvételi hely (opcionális)", "Different pick-up point (optional)")}
              </label>
              <div className={inputWrap}>
                <MapPin className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={passenger.pickupAddress}
                  onChange={(e) => update(index, { pickupAddress: e.target.value })}
                  placeholder={tr(
                    "Ha üres, a fő felvételi címen vesszük fel",
                    "If empty, picked up at the main pick-up address",
                  )}
                  maxLength={500}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        disabled={!canAdd}
        className="inline-flex items-center gap-2 rounded-lg border border-[#41B679]/40 bg-[#41B679]/10 px-4 py-2.5 text-sm font-bold text-[#41B679] hover:bg-[#41B679]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        {tr("Utas hozzáadása", "Add passenger")}
      </button>
    </div>
  );
}
