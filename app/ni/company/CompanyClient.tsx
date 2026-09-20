"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Copy,
  Check,
  Plus,
  Trash2,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  History,
  MapPin,
  Calendar,
  Clock,
  Luggage,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import NiPremiumLogin from "../components/NiPremiumLogin";

interface NiPortalUser {
  email: string;
  company?: string;
  role?: string;
}

interface CompanyBookingToken {
  _id?: string;
  token: string;
  companyName: string;
  label?: string;
  createdBy: string;
  createdAt: number;
  active: boolean;
  usageCount: number;
  lastUsedAt?: number;
}

interface AuditTrailEntry {
  timestamp: number;
  action: string;
  actor: string;
  details?: string;
}

interface CompanyBooking {
  _id: string;
  bookingCode: string;
  status: string;
  travelerEmail: string;
  travelerName: string;
  travelerPhone: string;
  fromAddress: string;
  toAddress: string;
  flightNumber?: string;
  pickupDate: string;
  pickupTime: string;
  travelers: number;
  luggage: number;
  comment?: string;
  createdAt?: number;
  auditTrail?: AuditTrailEntry[];
}

interface BookingGroup {
  travelerEmail: string;
  travelerName: string;
  count: number;
  bookings: CompanyBooking[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Függőben",
  modified: "Módosítva",
  confirmed: "Jóváhagyott",
  "in-progress": "Folyamatban",
  completed: "Lezárt",
  cancelled: "Lemondott",
};

export default function CompanyClient() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<NiPortalUser | null>(null);

  const [tokens, setTokens] = useState<CompanyBookingToken[]>([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);

  const [groups, setGroups] = useState<BookingGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/ni-auth/session", { cache: "no-store" });
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.user) {
            setAuthedUser(json.user);
          }
        }
      } catch {}
      if (active) setAuthChecked(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const fetchTokens = useCallback(async () => {
    setTokensLoading(true);
    try {
      const res = await fetch("/api/ni/company-booking-links", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setTokens(json.tokens || []);
      }
    } catch {
    } finally {
      setTokensLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const res = await fetch("/api/ni/company-bookings", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setGroups(json.groups || []);
      }
    } catch {
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authedUser?.role === "admin-ni") {
      fetchTokens();
      fetchGroups();
    }
  }, [authedUser, fetchTokens, fetchGroups]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ni/company-booking-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel || undefined }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success) {
        setNewLabel("");
        await fetchTokens();
      }
    } catch {
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}/ni/book/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      window.setTimeout(() => setCopiedToken(null), 2000);
    });
  };

  const handleRevoke = async (id?: string) => {
    if (!id) return;
    setRevokingToken(id);
    try {
      const res = await fetch(`/api/ni/company-booking-links/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchTokens();
      }
    } catch {
    } finally {
      setRevokingToken(null);
    }
  };

  const handleLoginSuccess = (user: NiPortalUser) => {
    setAuthedUser(user);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#030816] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#41B679]" />
      </div>
    );
  }

  if (!authedUser) {
    return <NiPremiumLogin _onSuccess={handleLoginSuccess} />;
  }

  if (authedUser.role !== "admin-ni") {
    return (
      <div className="min-h-screen bg-[#030816] text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-[#040E1B] border border-slate-800/80 rounded-3xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Nincs jogosultsága</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Ez az oldal csak Admin NI foglaló jogosultsággal rendelkező felhasználók számára érhető el.
          </p>
          <Link
            href="/ni/bookings"
            className="inline-flex items-center gap-2 py-3 px-5 rounded-xl bg-[#003E7E] hover:bg-[#002A54] text-white font-bold text-sm tracking-wider uppercase transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Vissza a foglalásaimhoz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030816] text-white">
      <div className="w-full border-b border-white/10 bg-[#030816]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/ni/bookings"
              className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-white leading-none">Céges foglalások</span>
              <span className="text-[11px] text-slate-400 mt-0.5 tracking-wide">National Instruments · Admin</span>
            </div>
          </div>
          <button
            onClick={() => {
              fetchTokens();
              fetchGroups();
            }}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Link generation section */}
        <section className="bg-[#040E1B] border border-slate-800/80 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-[#41B679]/20 flex items-center justify-center border border-[#41B679]/30">
              <Link2 className="w-4 h-4 text-[#41B679]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">Céges foglalási linkek</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Megjegyzés / címke (opcionális, pl. 'HR csapat')"
              className="flex-1 bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#41B679]"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#41B679] hover:bg-[#10B981] disabled:opacity-60 text-white font-bold text-sm tracking-wide transition-all"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Új link generálása
            </button>
          </div>

          {tokensLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : tokens.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Még nincs generált link.</p>
          ) : (
            <div className="space-y-3">
              {tokens.map((t) => {
                const url = `/ni/book/${t.token}`;
                return (
                  <div
                    key={t.token}
                    className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center gap-3 justify-between ${
                      t.active ? "border-white/5 bg-white/[0.02]" : "border-red-500/10 bg-red-500/[0.03] opacity-60"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">
                          {t.label || "Névtelen link"}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            t.active
                              ? "bg-[#41B679]/15 text-[#41B679] border border-[#41B679]/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {t.active ? "Aktív" : "Inaktív"}
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-500 font-mono truncate mt-1">{url}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {t.usageCount} foglalás · Létrehozva: {new Date(t.createdAt).toLocaleString("hu-HU")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(t.token)}
                        disabled={!t.active}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/10 disabled:opacity-40 text-xs font-bold text-white transition"
                      >
                        {copiedToken === t.token ? <Check className="w-3.5 h-3.5 text-[#41B679]" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedToken === t.token ? "Másolva" : "Másolás"}
                      </button>
                      {t.active && (
                        <button
                          onClick={() => handleRevoke(t._id)}
                          disabled={revokingToken === t._id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold text-red-400 transition"
                        >
                          {revokingToken === t._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          Visszavonás
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Bookings section */}
        <section className="bg-[#040E1B] border border-slate-800/80 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full bg-[#0A5CCB]/20 flex items-center justify-center border border-[#0A5CCB]/30">
              <Users className="w-4 h-4 text-[#0A5CCB]" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide">
              Céges foglalások (linkből érkezett) {groups.length > 0 && `· ${groups.reduce((s, g) => s + g.count, 0)} db`}
            </h2>
          </div>

          {groupsLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : groups.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Még nem érkezett foglalás céges linken keresztül.</p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.travelerEmail} className="border border-white/5 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedEmail(expandedEmail === group.travelerEmail ? null : group.travelerEmail)}
                    className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.02] hover:bg-white/[0.04] transition"
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold text-white">{group.travelerName || group.travelerEmail}</p>
                      <p className="text-[12px] text-slate-500">{group.travelerEmail} · {group.count} foglalás</p>
                    </div>
                    {expandedEmail === group.travelerEmail ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedEmail === group.travelerEmail && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="divide-y divide-white/5">
                          {group.bookings.map((b) => (
                            <div key={b._id} className="px-5 py-4">
                              <button
                                onClick={() => setExpandedBookingId(expandedBookingId === b._id ? null : b._id)}
                                className="w-full flex items-center justify-between text-left"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-white font-mono">#{b.bookingCode}</p>
                                  <p className="text-[12px] text-slate-500">
                                    {b.pickupDate} {b.pickupTime} · {b.fromAddress} → {b.toAddress}
                                    {b.flightNumber ? ` · Flight number / Járatszám: ${b.flightNumber}` : ""}
                                  </p>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 shrink-0">
                                  {STATUS_LABELS[b.status] || b.status}
                                </span>
                              </button>

                              {expandedBookingId === b._id && (
                                <div className="mt-3 pl-4 border-l-2 border-white/10 space-y-4">
                                  <div>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                                      Foglalás részletei
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Utasok</p>
                                          <p className="text-[13px] text-white font-semibold">{b.travelers} fő</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                        <Luggage className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Csomag</p>
                                          <p className="text-[13px] text-white font-semibold">{b.luggage} db</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Dátum</p>
                                          <p className="text-[13px] text-white font-semibold">{b.pickupDate}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Időpont</p>
                                          <p className="text-[13px] text-white font-semibold">{b.pickupTime}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-3 col-span-2 sm:col-span-1">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Honnan</p>
                                          <p className="text-[13px] text-white font-semibold break-words">{b.fromAddress}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-3 col-span-2 sm:col-span-1">
                                        <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Hova</p>
                                          <p className="text-[13px] text-white font-semibold break-words">{b.toAddress}</p>
                                        </div>
                                      </div>
                                      {b.comment && (
                                        <div className="flex items-start gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-3 col-span-2 sm:col-span-3">
                                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                          <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Megjegyzés</p>
                                            <p className="text-[13px] text-white font-semibold break-words">{b.comment}</p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                                    <History className="w-3.5 h-3.5" />
                                    Audit napló
                                  </div>
                                  {(b.auditTrail || []).length === 0 ? (
                                    <p className="text-[12px] text-slate-500">Nincs rögzített esemény.</p>
                                  ) : (
                                    (b.auditTrail || []).map((entry, idx) => (
                                      <div key={idx} className="text-[12px] text-slate-400">
                                        <span className="text-slate-300 font-semibold">{entry.action}</span>{" "}
                                        <span className="text-slate-500">
                                          · {entry.actor} · {new Date(entry.timestamp).toLocaleString("hu-HU")}
                                        </span>
                                        {entry.details && <div className="text-slate-500 mt-0.5">{entry.details}</div>}
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
