"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  Building2,
  CalendarPlus,
  Clock,
  Users,
  Luggage,
  CreditCard,
  Building,
  Banknote,
  Car,
  User,
  Truck,
  ChevronDown,
  ChevronUp,
  Edit3,
  X,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Check,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Ban,
  CalendarDays,
  MessageSquare,
  Phone,
  Mail,
  Minus,
  Plus,
  Bell,
  Eye,
  XCircle,
  Plane,
  Search,
  Link2,
  Copy,
  History,
  Info,
  Tag,
} from "lucide-react";
import SchaefflerMotionPremiumLogin from "../components/SchaefflerMotionPremiumLogin";
import { MxBackdrop, MxFooter, MxHeader, PannonChip, SchaefflerChip } from "../components/mx-ui";
import { useMxLang } from "../lang";
import {
  type MxKey,
  makeT,
  formatPickupDate,
  formatTimestamp,
  formatPrice,
  STATUS_KEY,
  translateServerMessage,
  localizeNotificationDetails,
} from "./i18n";

interface PortalUser {
  email: string;
  company?: string;
  role?: string;
}

type BookingStatus = "pending" | "modified" | "confirmed" | "in-progress" | "completed" | "cancelled";

interface Booking {
  _id: string;
  bookingCode: string;
  status: BookingStatus;
  portal?: string;
  travelerEmail: string;
  travelerName: string;
  travelerPhone: string;
  secondTravelerEmail?: string;
  secondTravelerPhone?: string;
  companyName: string;
  paymentMethod: "card" | "bank" | "cash";
  transferType: "standard" | "executive";
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
  driverName?: string;
  vehicleName?: string;
  driverNotified?: boolean;
  driverAcknowledged?: boolean;
  price?: number;
  createdAt?: number;
  updatedAt?: number;
  lastStatusChange?: {
    oldStatus: string;
    newStatus: string;
    changedAt: number;
  };
  bookingTrackToken?: string;
  trackLinkActive?: boolean;
}

type FilterTab = "all" | "pending" | "confirmed" | "closed";

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

interface StatusChangeNotification {
  id: string;
  bookingCode: string;
  travelerName: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: number;
  details?: string;
  dismissed: boolean;
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  modified: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "in-progress": "bg-sky-500/15 text-sky-300 border-sky-500/30",
  completed: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  cancelled: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

const STATUS_DOT: Record<BookingStatus, string> = {
  pending: "bg-amber-400",
  modified: "bg-orange-400",
  confirmed: "bg-emerald-400",
  "in-progress": "bg-sky-400",
  completed: "bg-slate-400",
  cancelled: "bg-rose-400",
};

const STATUS_RAIL: Record<BookingStatus, string> = {
  pending: "from-amber-400 to-amber-600",
  modified: "from-orange-400 to-orange-600",
  confirmed: "from-emerald-400 to-emerald-600",
  "in-progress": "from-sky-400 to-sky-600",
  completed: "from-slate-400 to-slate-600",
  cancelled: "from-rose-400 to-rose-600",
};

function playNotificationSound() {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const tone = (freq: number, start: number, dur: number, vol: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    tone(880, 0, 0.5, 0.3);
    tone(1320, 0.15, 0.5, 0.2);
  } catch {}
}

function statusLabel(status: string, t: ReturnType<typeof makeT>): string {
  const key = STATUS_KEY[status];
  return key ? t(key) : status;
}

function notificationMessage(
  newStatus: string,
  t: ReturnType<typeof makeT>
): { message: string; accent: string } {
  switch (newStatus) {
    case "confirmed":
      return { message: t("notifConfirmed"), accent: "emerald" };
    case "modified":
      return { message: t("notifModified"), accent: "orange" };
    case "cancelled":
      return { message: t("notifCancelled"), accent: "rose" };
    case "in-progress":
      return { message: t("notifInProgress"), accent: "blue" };
    case "completed":
      return { message: t("notifCompleted"), accent: "slate" };
    default:
      return { message: t("notifDefault"), accent: "slate" };
  }
}

const ACCENTS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  emerald: { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-300", dot: "bg-emerald-400" },
  orange: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-300", dot: "bg-orange-400" },
  rose: { border: "border-rose-500/30", bg: "bg-rose-500/10", text: "text-rose-300", dot: "bg-rose-400" },
  blue: { border: "border-sky-500/30", bg: "bg-sky-500/10", text: "text-sky-300", dot: "bg-sky-400" },
  slate: { border: "border-slate-500/30", bg: "bg-slate-500/10", text: "text-slate-300", dot: "bg-slate-400" },
};

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-[#3DDC84] mb-3">
      {icon}
      {children}
    </p>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 w-7 h-7 shrink-0 rounded-[5px] bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-slate-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500">{label}</p>
        <div className="text-sm font-semibold text-white break-words">{children}</div>
      </div>
    </div>
  );
}

export default function SchaefflerMotionBookingsClient() {
  const [lang, setLang] = useMxLang();
  const t = useMemo(() => makeT(lang), [lang]);

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<PortalUser | null>(null);
  const [bootDone, setBootDone] = useState(false);
  const portalBooting = !!authedUser && !bootDone;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [editModal, setEditModal] = useState<Booking | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editGeneral, setEditGeneral] = useState<string[]>([]);

  const [cancelModal, setCancelModal] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [statusNotifications, setStatusNotifications] = useState<StatusChangeNotification[]>([]);
  const lastNotifPollTimestamp = useRef<number>(0);

  const [editForm, setEditForm] = useState({
    pickupDate: "",
    pickupTime: "",
    fromAddress: "",
    toAddress: "",
    flightNumber: "",
    travelerPhone: "",
    travelers: 1,
    luggage: 0,
    comment: "",
  });

  useEffect(() => {
    if (!authedUser || bootDone) return;
    const timer = setTimeout(() => setBootDone(true), 1800);
    return () => clearTimeout(timer);
  }, [authedUser, bootDone]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/schaefflermotion-auth/session", { cache: "no-store" });
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/schaefflermotion-auth/logout", { method: "POST" });
    } catch {}
    setAuthedUser(null);
    setBootDone(false);
  };

  const fetchBookings = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch("/api/bookings", {
        cache: "no-store",
        headers: { "x-partner-portal": "schaefflermotion" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.bookings) {
          setBookings(json.bookings);
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
      if (showSpinner) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (authChecked && authedUser) {
      Promise.resolve().then(() => fetchBookings());
    }
  }, [authChecked, authedUser, fetchBookings]);

  useEffect(() => {
    if (!authedUser) return;
    const interval = setInterval(() => fetchBookings(true), 15000);
    return () => clearInterval(interval);
  }, [authedUser, fetchBookings]);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismissNotification = (id: string) => {
    setStatusNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, dismissed: true } : n)));
  };

  const dismissAllNotifications = () => {
    setStatusNotifications((prev) => prev.map((n) => ({ ...n, dismissed: true })));
  };

  useEffect(() => {
    if (!authedUser) return;
    if (!lastNotifPollTimestamp.current) lastNotifPollTimestamp.current = Date.now();

    const pollNotifications = async () => {
      try {
        const res = await fetch(
          `/api/notifications?lastPollTimestamp=${lastNotifPollTimestamp.current}`,
          {
            cache: "no-store",
            headers: { "x-partner-portal": "schaefflermotion" },
          }
        );
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.statusChanges?.length > 0) {
            playNotificationSound();
            const newNotifs: StatusChangeNotification[] = (
              json.statusChanges as Array<Omit<StatusChangeNotification, "id" | "dismissed"> & { _id: string }>
            ).map((sc) => ({
              ...sc,
              id: sc._id + "-" + sc.updatedAt,
              dismissed: false,
            }));
            setStatusNotifications((prev) => [...newNotifs, ...prev].slice(0, 20));
            fetchBookings();
          }
          lastNotifPollTimestamp.current = Date.now();
        }
      } catch {}
    };

    const timer = setInterval(pollNotifications, 10000);
    return () => clearInterval(timer);
  }, [authedUser, fetchBookings]);

  const openEditModal = (booking: Booking) => {
    setEditModal(booking);
    setEditForm({
      pickupDate: booking.pickupDate,
      pickupTime: booking.pickupTime,
      fromAddress: booking.fromAddress,
      toAddress: booking.toAddress,
      flightNumber: booking.flightNumber || "",
      travelerPhone: booking.travelerPhone || "",
      travelers: booking.travelers,
      luggage: booking.luggage,
      comment: booking.comment || "",
    });
    setEditErrors({});
    setEditGeneral([]);
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditLoading(false);
    setEditErrors({});
    setEditGeneral([]);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;

    const errs: Record<string, string> = {};
    if (!editForm.pickupDate) errs.pickupDate = t("required");
    if (!editForm.pickupTime) errs.pickupTime = t("required");
    if (!editForm.fromAddress.trim()) errs.fromAddress = t("required");
    if (!editForm.toAddress.trim()) errs.toAddress = t("required");
    if (!editForm.travelerPhone.trim()) errs.travelerPhone = t("required");
    const airportTrip = editModal.fromType === "airport" || editModal.toType === "airport";
    if (airportTrip && !editForm.flightNumber.trim()) errs.flightNumber = t("flightRequired");
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      setEditGeneral([t("fixErrors")]);
      return;
    }

    setEditLoading(true);
    setEditErrors({});
    setEditGeneral([]);
    try {
      const res = await fetch(`/api/bookings/${editModal._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-partner-portal": "schaefflermotion",
        },
        body: JSON.stringify({
          ...editForm,
          flightNumber: editForm.flightNumber.trim(),
          travelerPhone: editForm.travelerPhone.trim(),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (Array.isArray(json?.errors)) {
          setEditGeneral((json.errors as string[]).map((m) => translateServerMessage(m, lang)));
        } else if (json?.errors && typeof json.errors === "object") {
          setEditGeneral(
            Object.values(json.errors as Record<string, unknown>).map((v) =>
              translateServerMessage(Array.isArray(v) ? String(v[0]) : String(v), lang)
            )
          );
        } else {
          const msg = json?.message ? translateServerMessage(json.message, lang) : t("toastUpdateFailed");
          setEditGeneral([msg]);
          addToast("error", msg);
        }
        return;
      }
      addToast("success", t("toastUpdated"));
      closeEditModal();
      fetchBookings();
    } catch {
      addToast("error", t("toastNetwork"));
    } finally {
      setEditLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/bookings/${cancelModal._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-partner-portal": "schaefflermotion",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        addToast(
          "error",
          json?.message ? translateServerMessage(json.message, lang) : t("toastCancelFailed")
        );
        return;
      }
      addToast("success", t("toastCancelled"));
      setCancelModal(null);
      fetchBookings();
    } catch {
      addToast("error", t("toastNetwork"));
    } finally {
      setCancelLoading(false);
    }
  };

  const copyTrackingLink = async (token: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/track/${token}`);
      addToast("success", t("copied"));
    } catch {}
  };

  const tabMatch = useCallback(
    (b: Booking, tab: FilterTab) => {
      if (tab === "all") return true;
      if (tab === "pending") return b.status === "pending" || b.status === "modified";
      if (tab === "confirmed") return b.status === "confirmed" || b.status === "in-progress";
      return b.status === "completed" || b.status === "cancelled";
    },
    []
  );

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (!tabMatch(b, activeTab)) return false;
      if (!q) return true;
      const hay = [
        b.bookingCode,
        b.travelerName,
        b.travelerEmail,
        b.travelerPhone,
        b.fromAddress,
        b.toAddress,
        b.flightNumber,
        b.assignedDriverName,
        b.driverName,
        b.comment,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, activeTab, search, tabMatch]);

  const stats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((b) => tabMatch(b, "pending")).length,
      confirmed: bookings.filter((b) => tabMatch(b, "confirmed")).length,
      closed: bookings.filter((b) => tabMatch(b, "closed")).length,
    }),
    [bookings, tabMatch]
  );

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#0B100E] text-slate-300 flex flex-col">
        <MxBackdrop />
        <div className="relative z-10 h-[3px] w-full bg-[linear-gradient(90deg,#00893D,#3DDC84_55%,transparent)]" />
        <div className="relative z-10 flex-1 flex items-center justify-center px-4">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <PannonChip className="h-10" />
              <span className="w-px h-6 bg-white/15" />
              <SchaefflerChip className="h-10" />
            </div>
            <div className="flex items-center gap-3 font-mono text-[12px] tracking-[0.12em] text-slate-400">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }} className="w-4 h-4 rounded-full border-2 border-white/10 border-t-[#3DDC84]" />
              {t("verifyingAccess")}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <SchaefflerMotionPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0B100E] flex flex-col items-center justify-center overflow-hidden font-sans">
        <MxBackdrop />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="flex items-center gap-4 mb-12">
            <PannonChip className="h-12 px-3" imgClass="h-[20px] w-auto" />
            <span className="w-px h-7 bg-white/20" />
            <SchaefflerChip className="h-12 px-3" imgClass="h-[17px] w-auto" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-center">
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-[#3DDC84] font-bold mb-2">Schaeffler Motion</p>
            <p className="text-[10px] tracking-[0.4em] uppercase text-slate-500 font-medium">{t("premiumTagline")}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-12 w-72">
            <div className="h-[3px] w-full bg-white/[0.07] relative overflow-hidden">
              <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.4 }} className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#00893D] to-[#3DDC84] shadow-[0_0_14px_rgba(61,220,132,0.9)]" />
            </div>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="mt-4 text-center font-mono text-[10px] tracking-[0.28em] text-[#3DDC84] uppercase font-bold">
              {t("preparingWorkspace")}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const paymentLabel = (m: Booking["paymentMethod"]) =>
    m === "card" ? t("payCard") : m === "cash" ? t("payCash") : t("payBank");
  const paymentIcon = (m: Booking["paymentMethod"], cls: string) =>
    m === "card" ? <CreditCard className={cls} /> : m === "cash" ? <Banknote className={cls} /> : <Building className={cls} />;

  const filterTabs: { key: FilterTab; label: MxKey; count: number }[] = [
    { key: "all", label: "filterAll", count: stats.total },
    { key: "pending", label: "filterPending", count: stats.pending },
    { key: "confirmed", label: "filterConfirmed", count: stats.confirmed },
    { key: "closed", label: "filterClosed", count: stats.closed },
  ];

  const visibleNotifications = statusNotifications.filter((n) => !n.dismissed);

  return (
    <div className="min-h-screen bg-[#0B100E] text-slate-300 font-sans selection:bg-[#00893D]/40 relative overflow-hidden">
      <MxBackdrop />

      <MxHeader lang={lang} onLangChange={setLang} email={authedUser.email} scrolled={scrolled} active="bookings" onLogout={handleLogout} />

      <AnimatePresence>
        {visibleNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[107px] lg:top-[67px] left-0 right-0 z-40"
          >
            <div className="bg-gradient-to-r from-[#00893D]/25 to-[#3DDC84]/10 border-b border-white/10 backdrop-blur-xl">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#3DDC84]" />
                    <span className="text-xs font-bold text-[#3DDC84] font-mono tracking-[0.16em] uppercase">
                      {t("notifTitle")}
                    </span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#3DDC84]/20 text-[#3DDC84] text-[10px] font-bold">
                      {visibleNotifications.length}
                    </span>
                  </div>
                  <button
                    onClick={dismissAllNotifications}
                    className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors tracking-wide"
                  >
                    {t("dismissAll")}
                  </button>
                </div>
                <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
                  <AnimatePresence>
                    {visibleNotifications.map((notif) => {
                      const { message, accent } = notificationMessage(notif.newStatus, t);
                      const ac = ACCENTS[accent] || ACCENTS.slate;
                      const oldKey = notif.oldStatus as BookingStatus;
                      const newKey = notif.newStatus as BookingStatus;
                      const details = localizeNotificationDetails(notif.details, lang);
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{ duration: 0.25 }}
                          className={`flex items-center gap-4 p-3 rounded-[6px] border ${ac.border} ${ac.bg} backdrop-blur-sm`}
                        >
                          <div className={`w-2 h-2 rounded-full ${ac.dot} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-white">#{notif.bookingCode}</span>
                              <span className="text-[11px] text-slate-400">·</span>
                              <span className="text-[11px] text-slate-300 truncate">{notif.travelerName}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  STATUS_COLORS[oldKey] || "bg-slate-500/15 text-slate-400 border-slate-500/30"
                                }`}
                              >
                                {statusLabel(notif.oldStatus, t)}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  STATUS_COLORS[newKey] || "bg-slate-500/15 text-slate-400 border-slate-500/30"
                                }`}
                              >
                                {statusLabel(notif.newStatus, t)}
                              </span>
                            </div>
                            <p className={`text-[11px] font-semibold ${ac.text}`}>{message}</p>
                            {details && <p className="text-[11px] text-slate-400 mt-0.5">{details}</p>}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                const el = document.getElementById(`booking-${notif.bookingCode}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                                  dismissNotification(notif.id);
                                }
                              }}
                              className="h-7 px-2.5 rounded-[5px] bg-white/[0.06] border border-white/[0.1] text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              {t("view")}
                            </button>
                            <button
                              onClick={() => dismissNotification(notif.id)}
                              className="h-7 px-2.5 rounded-[5px] bg-white/[0.04] border border-white/[0.08] text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all inline-flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              {t("dismiss")}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative pt-32 md:pt-32 pb-24 px-4 sm:px-6 min-h-screen flex items-start justify-center z-10">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="mb-10 pb-8 border-b border-white/[0.08]">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.24em] uppercase text-[#3DDC84] mb-4">
                  <span className="w-2 h-2 bg-[#3DDC84] rounded-[1px] shadow-[0_0_10px_rgba(61,220,132,0.9)]" />
                  {t("eyebrow")}
                  {isRefreshing && <RefreshCw className="w-3 h-3 text-[#3DDC84] animate-spin" />}
                </div>
                <h1 className="text-[38px] md:text-[52px] font-semibold tracking-[-0.03em] text-white leading-[1.04] mb-3">{t("pageTitle")}</h1>
                <p className="text-slate-400 text-sm md:text-base max-w-xl">{t("pageSubtitle")}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => fetchBookings(true)}
                  className="h-11 px-4 rounded-[6px] border border-white/15 text-slate-300 hover:text-white hover:bg-white/[0.06] hover:border-white/30 transition-all inline-flex items-center gap-2 text-[12.5px] font-bold tracking-[0.1em] uppercase"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {t("refresh")}
                </button>
                <Link
                  href="/schaefflermotion"
                  className="h-11 px-5 rounded-[6px] bg-[#00893D] hover:bg-[#00A04A] text-white font-bold text-[12.5px] tracking-[0.1em] uppercase transition-all inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(0,137,61,0.4)]"
                >
                  <Plus className="w-4 h-4" />
                  {t("newBooking")}
                </Link>
              </div>
            </div>
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8"
          >
            {(
              [
                { label: "statTotal", value: stats.total, icon: <CalendarDays className="w-5 h-5" />, badge: null, tone: "text-slate-300 bg-white/5 border-white/10", glow: "from-[#00893D]/20" },
                { label: "statPending", value: stats.pending, icon: <Clock className="w-5 h-5" />, badge: "badgePending", tone: "text-amber-300 bg-amber-500/10 border-amber-500/20", glow: "from-amber-500/15" },
                { label: "statConfirmed", value: stats.confirmed, icon: <UserCheck className="w-5 h-5" />, badge: "badgeActive", tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20", glow: "from-emerald-500/15" },
                { label: "statClosed", value: stats.closed, icon: <CheckCircle2 className="w-5 h-5" />, badge: "badgeClosed", tone: "text-slate-300 bg-slate-500/10 border-slate-500/20", glow: "from-slate-500/15" },
              ] as {
                label: MxKey;
                value: number;
                icon: React.ReactNode;
                badge: MxKey | null;
                tone: string;
                glow: string;
              }[]
            ).map((card) => (
              <motion.div
                key={card.label}
                variants={fadeIn}
                className="bg-[#111815]/90 rounded-[10px] border border-white/10 p-4 md:p-5 relative overflow-hidden hover:border-slate-700/70 transition-colors"
              >
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${card.glow} via-transparent to-transparent blur-2xl pointer-events-none`}
                />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-[6px] border flex items-center justify-center ${card.tone}`}>
                      {card.icon}
                    </div>
                    {card.badge && (
                      <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${card.tone}`}>
                        {t(card.badge)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500 mb-1">
                    {t(card.label)}
                  </p>
                  <p className="text-3xl font-black text-white tracking-tight tabular-nums">{card.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-1 p-1 rounded-[6px] bg-[#111815] border border-white/10 self-start overflow-x-auto max-w-full">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-[5px] text-sm font-medium tracking-wide transition-all inline-flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.key
                      ? "bg-[#00893D] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  {t(tab.label)}
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-[4px] tabular-nums ${
                      activeTab === tab.key ? "bg-white/20 text-white" : "bg-white/[0.06] text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full h-11 pl-10 pr-10 rounded-[6px] bg-[#111815] border border-white/10 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#00893D] focus:ring-1 focus:ring-[#00893D]/40 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label={t("clearSearch")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-[4px] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-12 h-12 rounded-[10px] bg-[#00893D]/15 border border-[#00893D]/30 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#3DDC84] animate-spin" />
              </div>
              <p className="text-sm text-slate-400 font-medium">{t("loadingBookings")}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <motion.div
              key="booking-empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111815] rounded-[10px] border border-white/10 p-10 md:p-16 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00893D]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
              <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 rounded-[10px] bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <CalendarPlus className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t("emptyTitle")}</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm">
                  {search ? t("emptySearch") : t("emptyBody")}
                </p>
                {search ? (
                  <button
                    onClick={() => setSearch("")}
                    className="h-11 px-6 rounded-[6px] bg-white/[0.06] border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all"
                  >
                    {t("clearSearch")}
                  </button>
                ) : (
                  <Link
                    href="/schaefflermotion"
                    className="h-11 px-6 rounded-[6px] bg-[#00893D] hover:bg-[#00A04A] text-white font-semibold text-sm tracking-wide transition-all inline-flex items-center gap-2 shadow-[0_0_24px_rgba(0,137,61,0.4)]"
                  >
                    {t("goBook")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="booking-list"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
              }}
              className="space-y-4"
            >
              {filteredBookings.map((booking) => {
                const isExpanded = expandedId === booking._id;
                const canModify = booking.status !== "cancelled" && booking.status !== "completed";
                const driver = booking.assignedDriverName || booking.driverName;
                const vehicle = booking.assignedVehicleName || booking.vehicleName;
                const trackActive = !!booking.bookingTrackToken && booking.trackLinkActive !== false;
                const isExec = booking.transferType === "executive";

                return (
                  <motion.div
                    key={booking._id}
                    id={`booking-${booking.bookingCode}`}
                    variants={fadeIn}
                    className="bg-[#111815] rounded-[10px] border border-white/10 overflow-hidden hover:border-slate-700/70 transition-colors relative"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${STATUS_RAIL[booking.status]}`} />
                    <div className="p-5 md:p-6 pl-6 md:pl-7">
                      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                        <div className="flex-1 lg:max-w-[340px] flex flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-gradient-to-br from-[#00893D]/25 to-[#3DDC84]/10 border border-[#00893D]/40 text-[11px] font-black tracking-wider text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3DDC84]" />#{booking.bookingCode}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] border text-[11px] font-bold tracking-wide ${STATUS_COLORS[booking.status]}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[booking.status]}`} />
                              {statusLabel(booking.status, t)}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500 mb-1">
                              {t("pickup")}
                            </p>
                            <div className="flex items-baseline gap-3 flex-wrap">
                              <p className="text-xl md:text-2xl font-black text-white tracking-tight">
                                {formatPickupDate(booking.pickupDate, lang)}
                              </p>
                              <span className="text-lg font-bold text-[#3DDC84] tabular-nums">{booking.pickupTime}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center pt-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/15" />
                              <div className="w-px h-10 bg-gradient-to-b from-emerald-400/60 to-[#3DDC84]/60" />
                              <div className="w-2.5 h-2.5 rounded-full bg-[#3DDC84] ring-4 ring-[#3DDC84]/15" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2.5">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500 mb-0.5">
                                  {t("from")}
                                </p>
                                <p className="text-sm font-semibold text-white break-words">{booking.fromAddress}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500 mb-0.5">
                                  {t("to")}
                                </p>
                                <p className="text-sm font-semibold text-white break-words">{booking.toAddress}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden lg:block w-px bg-white/5 shrink-0" />

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5 content-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500">
                                {t("vehicleClass")}
                              </span>
                            </div>
                            <p className={`text-sm font-bold ${isExec ? "text-[#3DDC84]" : "text-white"}`}>
                              {isExec ? t("executive") : t("standard")}
                            </p>
                            <p className="text-[11px] text-slate-500">{isExec ? t("executiveSub") : t("standardSub")}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500">
                                {t("passengers")}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white">{t("paxUnit", { n: booking.travelers })}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Luggage className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500">
                                {t("luggage")}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white">{t("bagUnit", { n: booking.luggage })}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Plane className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500">
                                {t("flight")}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white">
                              {booking.flightNumber ? (
                                booking.flightNumber
                              ) : (
                                <span className="text-slate-500 font-medium">{t("noFlight")}</span>
                              )}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {paymentIcon(booking.paymentMethod, "w-3.5 h-3.5 text-slate-500")}
                              <span className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500">
                                {t("payment")}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white">{paymentLabel(booking.paymentMethod)}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500">
                                {t("price")}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-[#3DDC84]">
                              {booking.price !== undefined && booking.price !== null ? (
                                formatPrice(booking.price, lang)
                              ) : (
                                <span className="text-slate-500 font-medium">{t("priceNotSet")}</span>
                              )}
                            </p>
                          </div>

                          <div className="space-y-1.5 col-span-2 md:col-span-3">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500">
                                {t("driverVehicle")}
                              </span>
                            </div>
                            {driver || vehicle ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-white">
                                  {driver}
                                  {vehicle && (
                                    <span className="text-slate-400 font-medium ml-2">· {vehicle}</span>
                                  )}
                                </p>
                                {booking.driverAcknowledged ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-bold">
                                    <Check className="w-3 h-3" />
                                    {t("driverAcknowledged")}
                                  </span>
                                ) : booking.driverNotified ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-sky-500/10 border border-sky-500/25 text-sky-300 text-[10px] font-bold">
                                    <Bell className="w-3 h-3" />
                                    {t("driverNotified")}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[11px] font-medium">
                                <Clock className="w-3 h-3" />
                                {t("driverPending")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="hidden lg:block w-px bg-white/5 shrink-0" />

                        <div className="flex lg:flex-col items-stretch lg:items-end gap-2 lg:min-w-[160px]">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                            className="flex-1 lg:flex-none h-10 px-4 rounded-[5px] bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all inline-flex items-center justify-center gap-1.5 text-sm font-medium"
                          >
                            {isExpanded ? t("hideDetails") : t("details")}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {canModify && (
                            <>
                              <button
                                onClick={() => openEditModal(booking)}
                                className="flex-1 lg:flex-none h-10 px-4 rounded-[5px] bg-[#00893D]/20 border border-[#00893D]/40 text-[#7DF0AE] hover:bg-[#00893D]/35 hover:border-[#00893D]/60 transition-all inline-flex items-center justify-center gap-1.5 text-sm font-bold"
                              >
                                <Edit3 className="w-4 h-4" />
                                {t("modify")}
                              </button>
                              <button
                                onClick={() => setCancelModal(booking)}
                                className="flex-1 lg:flex-none h-10 px-4 rounded-[5px] bg-rose-500/10 border border-rose-500/25 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all inline-flex items-center justify-center gap-1.5 text-sm font-bold"
                              >
                                <Ban className="w-4 h-4" />
                                {t("cancel")}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/10 px-5 md:px-7 py-6 bg-slate-900/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-7">
                              <div>
                                <SectionLabel icon={<User className="w-3.5 h-3.5" />}>{t("secPassenger")}</SectionLabel>
                                <div className="space-y-3">
                                  <InfoRow icon={<User className="w-3.5 h-3.5" />} label={t("name")}>
                                    {booking.travelerName}
                                  </InfoRow>
                                  <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label={t("email")}>
                                    {booking.travelerEmail}
                                  </InfoRow>
                                  <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label={t("phone")}>
                                    {booking.travelerPhone}
                                  </InfoRow>
                                </div>
                              </div>

                              {(booking.secondTravelerEmail || booking.secondTravelerPhone) && (
                                <div>
                                  <SectionLabel icon={<Users className="w-3.5 h-3.5" />}>{t("secSecond")}</SectionLabel>
                                  <div className="space-y-3">
                                    {booking.secondTravelerEmail && (
                                      <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label={t("email")}>
                                        {booking.secondTravelerEmail}
                                      </InfoRow>
                                    )}
                                    {booking.secondTravelerPhone && (
                                      <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label={t("phone")}>
                                        {booking.secondTravelerPhone}
                                      </InfoRow>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div>
                                <SectionLabel icon={<Building2 className="w-3.5 h-3.5" />}>{t("secCompany")}</SectionLabel>
                                <div className="space-y-3">
                                  <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label={t("company")}>
                                    {booking.companyName}
                                  </InfoRow>
                                  <InfoRow icon={paymentIcon(booking.paymentMethod, "w-3.5 h-3.5")} label={t("payment")}>
                                    {paymentLabel(booking.paymentMethod)}
                                  </InfoRow>
                                  <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label={t("price")}>
                                    {booking.price !== undefined && booking.price !== null ? (
                                      <span className="text-[#3DDC84]">{formatPrice(booking.price, lang)}</span>
                                    ) : (
                                      <span className="text-slate-500 font-medium">{t("priceNotSet")}</span>
                                    )}
                                  </InfoRow>
                                </div>
                              </div>

                              <div>
                                <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />}>{t("secTrip")}</SectionLabel>
                                <div className="space-y-3">
                                  <InfoRow icon={<CalendarDays className="w-3.5 h-3.5" />} label={t("pickup")}>
                                    {formatPickupDate(booking.pickupDate, lang)} · {booking.pickupTime}
                                  </InfoRow>
                                  <InfoRow icon={<Plane className="w-3.5 h-3.5" />} label={t("flight")}>
                                    {booking.flightNumber || <span className="text-slate-500 font-medium">{t("noFlight")}</span>}
                                  </InfoRow>
                                  <InfoRow icon={<Car className="w-3.5 h-3.5" />} label={t("vehicleClass")}>
                                    {isExec ? `${t("executive")} · ${t("executiveSub")}` : `${t("standard")} · ${t("standardSub")}`}
                                  </InfoRow>
                                  <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label={t("bookingCode")}>
                                    #{booking.bookingCode}
                                  </InfoRow>
                                </div>
                              </div>

                              <div>
                                <SectionLabel icon={<Truck className="w-3.5 h-3.5" />}>{t("secDriver")}</SectionLabel>
                                <div className="space-y-3">
                                  <InfoRow icon={<User className="w-3.5 h-3.5" />} label={t("fieldDriver")}>
                                    {driver || <span className="text-slate-500 font-medium">{t("driverPending")}</span>}
                                  </InfoRow>
                                  <InfoRow icon={<Car className="w-3.5 h-3.5" />} label={t("fieldVehicle")}>
                                    {vehicle || <span className="text-slate-500 font-medium">{t("driverPending")}</span>}
                                  </InfoRow>
                                  {(driver || vehicle) && (booking.driverNotified || booking.driverAcknowledged) && (
                                    <InfoRow icon={<Bell className="w-3.5 h-3.5" />} label={t("secDriver")}>
                                      {booking.driverAcknowledged ? t("driverAcknowledged") : t("driverNotified")}
                                    </InfoRow>
                                  )}
                                </div>
                              </div>

                              <div>
                                <SectionLabel icon={<MessageSquare className="w-3.5 h-3.5" />}>{t("secComment")}</SectionLabel>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap break-words">
                                  {booking.comment || <span className="text-slate-500 italic">{t("noComment")}</span>}
                                </p>
                              </div>

                              <div className="md:col-span-2 xl:col-span-3 border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                  <SectionLabel icon={<History className="w-3.5 h-3.5" />}>{t("secTimeline")}</SectionLabel>
                                  <div className="space-y-3">
                                    <InfoRow icon={<CalendarPlus className="w-3.5 h-3.5" />} label={t("createdAt")}>
                                      {formatTimestamp(booking.createdAt, lang)}
                                    </InfoRow>
                                    <InfoRow icon={<RefreshCw className="w-3.5 h-3.5" />} label={t("updatedAt")}>
                                      {formatTimestamp(booking.updatedAt, lang)}
                                    </InfoRow>
                                    {booking.lastStatusChange && (
                                      <InfoRow icon={<ArrowRight className="w-3.5 h-3.5" />} label={t("statusChangedAt")}>
                                        {t("statusChange", {
                                          from: statusLabel(booking.lastStatusChange.oldStatus, t),
                                          to: statusLabel(booking.lastStatusChange.newStatus, t),
                                        })}
                                        <span className="block text-[11px] text-slate-500 font-medium mt-0.5">
                                          {formatTimestamp(booking.lastStatusChange.changedAt, lang)}
                                        </span>
                                      </InfoRow>
                                    )}
                                  </div>
                                  <p className="flex items-start gap-1.5 text-[11px] text-slate-500 mt-4">
                                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                    {t("timesNote")}
                                  </p>
                                </div>

                                <div>
                                  <SectionLabel icon={<Link2 className="w-3.5 h-3.5" />}>{t("secTracking")}</SectionLabel>
                                  {trackActive ? (
                                    <div className="space-y-3">
                                      <p className="text-sm text-slate-400">{t("trackingHint")}</p>
                                      <div className="flex flex-wrap gap-2">
                                        <a
                                          href={`/track/${booking.bookingTrackToken}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="h-10 px-4 rounded-[5px] bg-[#00893D]/20 border border-[#00893D]/40 text-[#7DF0AE] hover:bg-[#00893D]/35 transition-all inline-flex items-center gap-2 text-sm font-bold"
                                        >
                                          <Link2 className="w-4 h-4" />
                                          {t("openTracking")}
                                        </a>
                                        <button
                                          onClick={() => copyTrackingLink(booking.bookingTrackToken as string)}
                                          className="h-10 px-4 rounded-[5px] bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 transition-all inline-flex items-center gap-2 text-sm font-medium"
                                        >
                                          <Copy className="w-4 h-4" />
                                          {t("copyTracking")}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-500 italic">{t("trackingInactive")}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          <p className="text-center text-[11px] text-slate-600 mt-8">{t("lastUpdated")}</p>
        </div>
      </section>

      <MxFooter lang={lang} />

      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeEditModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-[#111815] rounded-[10px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00893D] to-transparent" />
              <div className="sticky top-0 z-10 bg-[#111815] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{t("editTitle")}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">#{editModal.bookingCode}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  aria-label={t("back")}
                  className="w-9 h-9 rounded-[6px] bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                <div className="flex items-start gap-3 px-4 py-3 rounded-[5px] bg-[#00893D]/10 border border-[#00893D]/25">
                  <Info className="w-4 h-4 text-[#3DDC84] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    <span className="font-bold text-white">{t("noticeTitle")}: </span>
                    {t("noticeBody")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldShell label={t("date")} required error={editErrors.pickupDate}>
                    <input
                      type="date"
                      value={editForm.pickupDate}
                      onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium text-white [color-scheme:dark]"
                    />
                  </FieldShell>
                  <FieldShell label={t("time")} required error={editErrors.pickupTime}>
                    <input
                      type="time"
                      value={editForm.pickupTime}
                      onChange={(e) => setEditForm({ ...editForm, pickupTime: e.target.value })}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium text-white [color-scheme:dark]"
                    />
                  </FieldShell>
                </div>

                <FieldShell label={t("fromAddress")} required error={editErrors.fromAddress} icon={<MapPin className="w-4 h-4 text-slate-500 shrink-0" />}>
                  <input
                    type="text"
                    value={editForm.fromAddress}
                    onChange={(e) => setEditForm({ ...editForm, fromAddress: e.target.value })}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                  />
                </FieldShell>

                <FieldShell label={t("toAddress")} required error={editErrors.toAddress} icon={<MapPin className="w-4 h-4 text-slate-500 shrink-0" />}>
                  <input
                    type="text"
                    value={editForm.toAddress}
                    onChange={(e) => setEditForm({ ...editForm, toAddress: e.target.value })}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                  />
                </FieldShell>

                <div className="grid grid-cols-2 gap-4">
                  <FieldShell
                    label={t("flightLabel")}
                    required={editModal.fromType === "airport" || editModal.toType === "airport"}
                    error={editErrors.flightNumber}
                    icon={<Plane className="w-4 h-4 text-slate-500 shrink-0" />}
                  >
                    <input
                      type="text"
                      value={editForm.flightNumber}
                      onChange={(e) => setEditForm({ ...editForm, flightNumber: e.target.value.toUpperCase() })}
                      placeholder={t("flightPlaceholder")}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                    />
                  </FieldShell>
                  <FieldShell
                    label={t("phoneLabel")}
                    required
                    error={editErrors.travelerPhone}
                    icon={<Phone className="w-4 h-4 text-slate-500 shrink-0" />}
                  >
                    <input
                      type="tel"
                      value={editForm.travelerPhone}
                      onChange={(e) => setEditForm({ ...editForm, travelerPhone: e.target.value })}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                    />
                  </FieldShell>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Stepper
                    label={t("paxCount")}
                    icon={<Users className="w-4 h-4 text-slate-500" />}
                    value={editForm.travelers}
                    onMinus={() => setEditForm({ ...editForm, travelers: Math.max(1, editForm.travelers - 1) })}
                    onPlus={() => setEditForm({ ...editForm, travelers: editForm.travelers + 1 })}
                  />
                  <Stepper
                    label={t("bagCount")}
                    icon={<Luggage className="w-4 h-4 text-slate-500" />}
                    value={editForm.luggage}
                    onMinus={() => setEditForm({ ...editForm, luggage: Math.max(0, editForm.luggage - 1) })}
                    onPlus={() => setEditForm({ ...editForm, luggage: editForm.luggage + 1 })}
                  />
                </div>

                <FieldShell label={t("commentLabel")}>
                  <textarea
                    rows={3}
                    value={editForm.comment}
                    onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                    placeholder={t("commentPlaceholder")}
                    className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white resize-none"
                  />
                </FieldShell>

                {editGeneral.length > 0 && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-[5px] bg-rose-500/10 border border-rose-500/20">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <ul className="text-[12px] text-rose-300 font-medium space-y-1">
                      {editGeneral.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 h-11 rounded-[5px] bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-semibold text-sm"
                  >
                    {t("back")}
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-[2] h-11 rounded-[5px] bg-[#00893D] hover:bg-[#00A04A] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,137,61,0.35)]"
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("saving")}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {t("saveChanges")}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cancelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !cancelLoading && setCancelModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-[#111815] rounded-[10px] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="p-7">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-[10px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{t("cancelTitle")}</h3>
                  <p className="text-sm text-slate-400">
                    #{cancelModal.bookingCode} · {formatPickupDate(cancelModal.pickupDate, lang)} {cancelModal.pickupTime}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-[6px] bg-slate-900/60 border border-white/10">
                    <div className="w-8 h-8 rounded-[5px] bg-rose-500/10 flex items-center justify-center mb-3">
                      <Banknote className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-[11px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500 mb-1">
                      {t("refundTitle")}
                    </p>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{t("refundBody")}</p>
                  </div>
                  <div className="p-4 rounded-[6px] bg-slate-900/60 border border-white/10">
                    <div className="w-8 h-8 rounded-[5px] bg-slate-500/10 flex items-center justify-center mb-3">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] font-bold font-mono tracking-[0.16em] uppercase text-slate-500 mb-1">
                      {t("driverTitle")}
                    </p>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">{t("driverBody")}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelModal(null)}
                    disabled={cancelLoading}
                    className="flex-1 h-11 rounded-[5px] bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-semibold text-sm disabled:opacity-50"
                  >
                    {t("keepBooking")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelConfirm}
                    disabled={cancelLoading}
                    className="flex-1 h-11 rounded-[5px] bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
                  >
                    {cancelLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("processing")}
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        {t("confirmCancel")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 30, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 30, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-[6px] border shadow-lg backdrop-blur-xl ${
                toast.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-[5px] flex items-center justify-center shrink-0 ${
                  toast.type === "success"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <p
                className={`text-sm font-semibold leading-relaxed ${
                  toast.type === "success" ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {toast.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FieldShell({
  label,
  required,
  error,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] text-slate-400 font-bold font-mono tracking-[0.16em] uppercase ml-1 flex gap-1">
        {label} {required && <span className="text-[#3DDC84]">*</span>}
      </label>
      <div
        className={`w-full bg-[#0E1511] border rounded-[5px] p-3.5 flex items-center gap-3 focus-within:border-[#00893D] focus-within:ring-1 focus-within:ring-[#00893D]/30 transition-all ${
          error ? "border-rose-500/50 ring-1 ring-rose-500/20" : "border-white/12"
        }`}
      >
        {icon}
        {children}
      </div>
      {error && <p className="text-[11px] text-rose-400 font-medium">{error}</p>}
    </div>
  );
}

function Stepper({
  label,
  icon,
  value,
  onMinus,
  onPlus,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] text-slate-400 font-bold font-mono tracking-[0.16em] uppercase ml-1 flex gap-1">
        {label} <span className="text-[#3DDC84]">*</span>
      </label>
      <div className="w-full bg-[#0E1511] border border-white/12 rounded-[5px] p-2.5 flex justify-between items-center text-white">
        <div className="flex items-center gap-3 px-2">
          {icon}
          <span className="text-sm font-bold">{value}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMinus}
            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onPlus}
            className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
