"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Plane,
  Calendar,
  Clock,
  Users,
  Luggage,
  Car,
  User,
  Edit3,
  XCircle,
  Ban,
  ShieldCheck,
  X,
} from "lucide-react";

interface Props {
  token: string;
}

interface TrackedBooking {
  bookingCode: string;
  status: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone: string;
  companyName: string;
  transferType: string;
  fromType: "airport" | "other";
  fromAddress: string;
  toType: "airport" | "other";
  toAddress: string;
  flightNumber?: string;
  pickupDate: string;
  pickupTime: string;
  travelers: number;
  luggage: number;
  comment?: string;
  assignedDriverName?: string;
  assignedVehicleName?: string;
  trackLinkActive: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Függőben", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  modified: { label: "Módosítva", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
  confirmed: { label: "Jóváhagyott", color: "text-[#41B679] bg-[#41B679]/10 border-[#41B679]/30" },
  "in-progress": { label: "Folyamatban", color: "text-[#0A5CCB] bg-[#0A5CCB]/10 border-[#0A5CCB]/30" },
  completed: { label: "Lezárt", color: "text-slate-400 bg-white/5 border-white/10" },
  cancelled: { label: "Lemondva", color: "text-red-400 bg-red-500/10 border-red-500/30" },
};

const EDITABLE_STATUSES = ["pending", "modified", "confirmed"];

export default function TrackPageClient({ token }: Props) {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<TrackedBooking | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    pickupDate: "",
    pickupTime: "",
    fromAddress: "",
    toAddress: "",
    flightNumber: "",
    travelers: 1,
    luggage: 0,
    comment: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<string[]>([]);
  const [editSuccess, setEditSuccess] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(token)}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.booking) {
        setBooking(json.booking);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const openEdit = () => {
    if (!booking) return;
    setEditForm({
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      fromAddress: booking.fromAddress,
      toAddress: booking.toAddress,
      flightNumber: booking.flightNumber || "",
      travelers: booking.travelers,
      luggage: booking.luggage,
      comment: booking.comment || "",
    });
    setEditErrors([]);
    setEditSuccess(false);
    setEditOpen(true);
  };

  const submitEdit = async () => {
    setEditLoading(true);
    setEditErrors([]);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.booking) {
        setBooking(json.booking);
        setEditSuccess(true);
        window.setTimeout(() => setEditOpen(false), 1400);
      } else if (json?.errors) {
        setEditErrors(json.errors);
      } else {
        setEditErrors([json?.message || "A módosítás sikertelen."]);
      }
    } catch {
      setEditErrors(["Hálózati hiba történt."]);
    } finally {
      setEditLoading(false);
    }
  };

  const submitCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(token)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json?.booking) {
        setBooking(json.booking);
        setCancelOpen(false);
      }
    } catch {
    } finally {
      setCancelLoading(false);
    }
  };

  const bgShell = (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,92,203,0.34),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(65,182,121,0.2),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(4,38,86,0.72),transparent_50%),linear-gradient(135deg,#020613_0%,#051326_36%,#062043_68%,#071628_100%)]" />
      <div className="absolute left-[-10%] top-[-8%] h-[30rem] w-[30rem] rounded-full bg-[#41B679]/16 blur-[120px]" />
      <div className="absolute right-[-12%] top-[4%] h-[36rem] w-[36rem] rounded-full bg-[#0A5CCB]/22 blur-[140px]" />
    </div>
  );

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex items-center justify-center overflow-hidden">
        {bgShell}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#41B679]" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">Foglalás betöltése...</p>
        </div>
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex items-center justify-center overflow-hidden px-6">
        {bgShell}
        <div className="relative z-10 max-w-md w-full bg-[#040E1B] border border-slate-800/80 rounded-3xl p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Érvénytelen link</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Ez a követési link érvénytelen. Kérjük, ellenőrizze a visszaigazoló emailben kapott linket.
          </p>
        </div>
      </div>
    );
  }

  if (!booking.trackLinkActive) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex items-center justify-center overflow-hidden px-6">
        {bgShell}
        <div className="relative z-10 max-w-md w-full bg-[#040E1B] border border-slate-800/80 rounded-3xl p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-full bg-[#41B679]/10 border border-[#41B679]/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#41B679]" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Az utazás befejeződött</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            Köszönjük, hogy a Pannon Transfer szolgáltatását választotta! Ez a követési link már inaktív, mivel az utazás lezárult.
          </p>
          <p className="text-slate-500 text-xs font-mono">#{booking.bookingCode}</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[booking.status] || { label: booking.status, color: "text-slate-400 bg-white/5 border-white/10" };
  const canEdit = EDITABLE_STATUSES.includes(booking.status);

  return (
    <div className="relative min-h-screen bg-[#030816] text-white overflow-hidden">
      {bgShell}
      <div className="w-full border-b border-white/10 bg-[#030816]/72 backdrop-blur-xl relative z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-white leading-none">Pannon Transfer</span>
            <span className="text-[11px] text-slate-400 mt-0.5 tracking-wide">Foglalás követése</span>
          </div>
          <ShieldCheck className="w-5 h-5 text-[#41B679]" />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[linear-gradient(180deg,rgba(5,15,31,0.96),rgba(3,10,21,0.97))] rounded-[28px] shadow-[0_38px_120px_rgba(0,0,0,0.55)] border border-white/10 overflow-hidden relative"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#41B679] to-[#0A5CCB]" />
          <div className="p-8 md:p-10 space-y-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Foglalási kód</p>
                <p className="text-2xl font-black text-white font-mono tracking-wider">#{booking.bookingCode}</p>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <MapPin className="w-4 h-4 text-[#41B679] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Honnan</p>
                  <p className="text-sm text-white font-medium">{booking.fromAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <MapPin className="w-4 h-4 text-[#0A5CCB] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Hova</p>
                  <p className="text-sm text-white font-medium">{booking.toAddress}</p>
                </div>
              </div>
              {(booking.fromType === "airport" || booking.toType === "airport") && booking.flightNumber && (
                <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 sm:col-span-2">
                  <Plane className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Flight number / Járatszám</p>
                    <p className="text-sm text-white font-medium">{booking.flightNumber}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Dátum</p>
                  <p className="text-sm text-white font-medium">{booking.pickupDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Időpont</p>
                  <p className="text-sm text-white font-medium">{booking.pickupTime}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Utasok</p>
                  <p className="text-sm text-white font-medium">{booking.travelers}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <Luggage className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Csomag</p>
                  <p className="text-sm text-white font-medium">{booking.luggage}</p>
                </div>
              </div>
              {(booking.assignedDriverName || booking.assignedVehicleName) && (
                <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4 sm:col-span-2">
                  <Car className="w-4 h-4 text-[#41B679] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mb-1">Sofőr & jármű</p>
                    <p className="text-sm text-white font-medium flex items-center gap-2">
                      {booking.assignedDriverName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {booking.assignedDriverName}
                        </span>
                      )}
                      {booking.assignedVehicleName && <span className="text-slate-400">· {booking.assignedVehicleName}</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {canEdit ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <button
                  onClick={openEdit}
                  className="py-3.5 px-5 rounded-xl bg-[#003E7E] hover:bg-[#002A54] text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Módosítás kérése
                </button>
                <button
                  onClick={() => setCancelOpen(true)}
                  className="py-3.5 px-5 rounded-xl bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 text-red-400 font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Foglalás lemondása
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[13px] text-slate-500 text-center">
                  A foglalás jelenlegi állapotában már nem módosítható. Kérdés esetén forduljon diszpécserünkhöz.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !editLoading && setEditOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#040E1B] border border-slate-800/80 rounded-3xl p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Módosítás kérése</h3>
                <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editSuccess ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle2 className="w-10 h-10 text-[#41B679]" />
                  <p className="text-sm text-slate-300">Módosítás elküldve, diszpécserünk hamarosan felülvizsgálja.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Dátum</label>
                      <input
                        type="date"
                        value={editForm.pickupDate}
                        onChange={(e) => setEditForm((f) => ({ ...f, pickupDate: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#41B679] [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Időpont</label>
                      <input
                        type="time"
                        value={editForm.pickupTime}
                        onChange={(e) => setEditForm((f) => ({ ...f, pickupTime: e.target.value }))}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#41B679] [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Honnan</label>
                    <input
                      type="text"
                      value={editForm.fromAddress}
                      onChange={(e) => setEditForm((f) => ({ ...f, fromAddress: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#41B679]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Hova</label>
                    <input
                      type="text"
                      value={editForm.toAddress}
                      onChange={(e) => setEditForm((f) => ({ ...f, toAddress: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#41B679]"
                    />
                  </div>
                  {(booking.fromType === "airport" || booking.toType === "airport") && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Flight number / Járatszám</label>
                      <input
                        type="text"
                        value={editForm.flightNumber}
                        onChange={(e) => setEditForm((f) => ({ ...f, flightNumber: e.target.value.toUpperCase() }))}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#41B679]"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Utasok</label>
                      <input
                        type="number"
                        min={1}
                        value={editForm.travelers}
                        onChange={(e) => setEditForm((f) => ({ ...f, travelers: Math.max(1, Number(e.target.value)) }))}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#41B679]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Csomag</label>
                      <input
                        type="number"
                        min={0}
                        value={editForm.luggage}
                        onChange={(e) => setEditForm((f) => ({ ...f, luggage: Math.max(0, Number(e.target.value)) }))}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#41B679]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase">Megjegyzés</label>
                    <textarea
                      rows={2}
                      value={editForm.comment}
                      onChange={(e) => setEditForm((f) => ({ ...f, comment: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-white outline-none focus:border-[#41B679] resize-none"
                    />
                  </div>

                  {editErrors.length > 0 && (
                    <div className="rounded-xl bg-red-500/[0.08] border border-red-500/20 p-4 space-y-1">
                      {editErrors.map((err, idx) => (
                        <p key={idx} className="text-[12px] text-red-300 flex items-start gap-2">
                          <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          {err}
                        </p>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={submitEdit}
                    disabled={editLoading}
                    className="w-full py-3.5 rounded-xl bg-[#41B679] hover:bg-[#10B981] disabled:opacity-60 text-white font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                  >
                    {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Módosítás elküldése
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel confirm modal */}
      <AnimatePresence>
        {cancelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !cancelLoading && setCancelOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#040E1B] border border-slate-800/80 rounded-3xl p-8 text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                <Ban className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Biztosan lemondja a foglalást?</h3>
              <p className="text-sm text-slate-400">Ez a lépés nem vonható vissza. #{booking.bookingCode}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCancelOpen(false)}
                  className="py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-bold text-sm hover:bg-white/10 transition"
                >
                  Mégse
                </button>
                <button
                  onClick={submitCancel}
                  disabled={cancelLoading}
                  className="py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Lemondás
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
