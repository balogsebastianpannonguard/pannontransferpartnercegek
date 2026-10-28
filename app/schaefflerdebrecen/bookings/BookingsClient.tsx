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
import SchaefflerDebrecenPremiumLogin from "../components/SchaefflerDebrecenPremiumLogin";
import SchaefflerDebrecenHeader from "../components/SchaefflerDebrecenHeader";
import { useSdLang } from "../i18n";
import { SD_PATTERN, SD_SUPPORT, SdLogos } from "../ui";
import {
  type SdBKey,
  makeT,
  formatPickupDate,
  formatTimestamp,
  formatPrice,
  STATUS_KEY,
  translateServerMessage,
  localizeNotificationDetails,
} from "./i18n";

interface SdPortalUser {
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
  pending: "bg-rose-50 text-rose-700 border-rose-200",
  modified: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  "in-progress": "bg-sky-50 text-sky-700 border-sky-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-300",
};

const STATUS_DOT: Record<BookingStatus, string> = {
  pending: "bg-rose-500",
  modified: "bg-amber-500",
  confirmed: "bg-sky-500",
  "in-progress": "bg-sky-500",
  completed: "bg-emerald-500",
  cancelled: "bg-slate-500",
};

const STATUS_RAIL: Record<BookingStatus, string> = {
  pending: "bg-rose-500",
  modified: "bg-amber-500",
  confirmed: "bg-sky-500",
  "in-progress": "bg-sky-500",
  completed: "bg-[#00893D]",
  cancelled: "bg-slate-400",
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

function notificationMessage(newStatus: string, t: ReturnType<typeof makeT>): { message: string; accent: string } {
  switch (newStatus) {
    case "confirmed":
      return { message: t("notifConfirmed"), accent: "sky" };
    case "modified":
      return { message: t("notifModified"), accent: "amber" };
    case "cancelled":
      return { message: t("notifCancelled"), accent: "slate" };
    case "in-progress":
      return { message: t("notifInProgress"), accent: "sky" };
    case "completed":
      return { message: t("notifCompleted"), accent: "green" };
    default:
      return { message: t("notifDefault"), accent: "slate" };
  }
}

const ACCENTS: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  green: { border: "border-[#BFE3CC]", bg: "bg-[#E7F4EC]", text: "text-[#007335]", dot: "bg-[#00893D]" },
  amber: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  sky: { border: "border-sky-200", bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  slate: { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
};

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-[#00893D] mb-3">
      {icon}
      {children}
    </p>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 w-7 h-7 shrink-0 rounded-lg bg-[#F1F5F2] border border-[#E1E7E3] flex items-center justify-center text-[#6B7A72]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#8A9890]">{label}</p>
        <div className="text-sm font-semibold text-[#0E1A14] break-words">{children}</div>
      </div>
    </div>
  );
}

export default function SchaefflerDebrecenBookingsClient() {
  const { lang, setLang, tx } = useSdLang();
  const t = useMemo(() => makeT(lang), [lang]);

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<SdPortalUser | null>(null);
  const [bootDone, setBootDone] = useState(false);

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
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (!authedUser || bootDone) return;
    const timer = setTimeout(() => setBootDone(true), 1500);
    return () => clearTimeout(timer);
  }, [authedUser, bootDone]);

  const portalBooting = !!authedUser && !bootDone;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/schaefflerdebrecen-auth/session", { cache: "no-store" });
        if (!active) return;
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.user) setAuthedUser(json.user);
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
      await fetch("/api/schaefflerdebrecen-auth/logout", { method: "POST" });
    } catch {}
    setAuthedUser(null);
    setBootDone(false);
  };

  const loadBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings", {
        cache: "no-store",
        headers: { "x-partner-portal": "schaefflerdebrecen" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.bookings) setBookings(json.bookings);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBookings = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) setIsRefreshing(true);
      await loadBookings();
      if (showSpinner) setIsRefreshing(false);
    },
    [loadBookings]
  );

  useEffect(() => {
    if (!authChecked || !authedUser) return;
    const id = window.setTimeout(() => void loadBookings(), 0);
    return () => window.clearTimeout(id);
  }, [authChecked, authedUser, loadBookings]);

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

    lastNotifPollTimestamp.current = Date.now();

    const pollNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?lastPollTimestamp=${lastNotifPollTimestamp.current}`, {
          cache: "no-store",
          headers: { "x-partner-portal": "schaefflerdebrecen" },
        });
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
        headers: { "Content-Type": "application/json", "x-partner-portal": "schaefflerdebrecen" },
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
        headers: { "Content-Type": "application/json", "x-partner-portal": "schaefflerdebrecen" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        addToast("error", json?.message ? translateServerMessage(json.message, lang) : t("toastCancelFailed"));
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

  const tabMatch = useCallback((b: Booking, tab: FilterTab) => {
    if (tab === "all") return true;
    if (tab === "pending") return b.status === "pending" || b.status === "modified";
    if (tab === "confirmed") return b.status === "confirmed" || b.status === "in-progress";
    return b.status === "completed" || b.status === "cancelled";
  }, []);

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

  const year = new Date().getFullYear();

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#F3F6F4] text-[#0E1A14] flex flex-col">
        <div className="w-full bg-white border-b border-[#E1E7E3]">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <SdLogos />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#E7F4EC] border border-[#CBE6D6] flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#00893D] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-[#DCE3DF] border-t-[#00893D]" />
              <p className="text-[14px] text-[#5C6B63] font-semibold tracking-wide">{t("verifyingAccess")}</p>
            </div>
          </motion.div>
        </div>
        <div className="w-full border-t border-[#E1E7E3] bg-white">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-[11px] text-[#7B8A82] font-medium">
            <span>
              © {year} Pannon Transfer · {t("rightsReserved")}
            </span>
            <span className="tracking-wider">{t("footerPortal")}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <SchaefflerDebrecenPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#0B3D2A] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className={`absolute inset-0 ${SD_PATTERN}`} aria-hidden />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00893D]/35 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none"
        />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mb-10">
            <SdLogos onDark />
          </motion.div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/50 font-medium">{t("premiumTagline")}</p>
          <div className="mt-12 w-64">
            <div className="h-[2px] w-full bg-white/10 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.1, ease: [0.7, 0, 0.3, 1], delay: 0.3 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-[#00893D] to-[#7BE0A6]"
              />
            </div>
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="mt-5 text-center text-[10px] tracking-[0.25em] text-[#7BE0A6] uppercase font-bold">
              {t("preparingWorkspace")}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const paymentLabel = (m: Booking["paymentMethod"]) => (m === "card" ? t("payCard") : m === "cash" ? t("payCash") : t("payBank"));
  const paymentIcon = (m: Booking["paymentMethod"], cls: string) =>
    m === "card" ? <CreditCard className={cls} /> : m === "cash" ? <Banknote className={cls} /> : <Building className={cls} />;

  const filterTabs: { key: FilterTab; label: SdBKey; count: number }[] = [
    { key: "all", label: "filterAll", count: stats.total },
    { key: "pending", label: "filterPending", count: stats.pending },
    { key: "confirmed", label: "filterConfirmed", count: stats.confirmed },
    { key: "closed", label: "filterClosed", count: stats.closed },
  ];

  const visibleNotifications = statusNotifications.filter((n) => !n.dismissed);
  const labelCls = "text-[10px] font-bold tracking-widest uppercase text-[#8A9890]";

  return (
    <div className="min-h-screen bg-[#F3F6F4] text-[#31413A] font-sans selection:bg-[#00893D]/25 relative overflow-x-hidden">
      <SchaefflerDebrecenHeader
        lang={lang}
        tx={tx}
        onLangChange={setLang}
        email={authedUser.email}
        scrolled={scrolled}
        active="bookings"
        onLogout={handleLogout}
      />

      <AnimatePresence>
        {visibleNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[108px] lg:top-[72px] left-0 right-0 z-40"
          >
            <div className="bg-white/95 border-b border-[#DCE3DF] backdrop-blur-xl shadow-[0_10px_30px_rgba(11,61,42,0.1)]">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#00893D]" />
                    <span className="text-xs font-bold text-[#0B3D2A] tracking-widest uppercase">{t("notifTitle")}</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#E7F4EC] text-[#007335] text-[10px] font-bold">{visibleNotifications.length}</span>
                  </div>
                  <button onClick={dismissAllNotifications} className="text-[11px] font-semibold text-[#6B7A72] hover:text-[#0B3D2A] transition-colors tracking-wide">
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
                          className={`flex items-center gap-4 p-3 rounded-xl border ${ac.border} ${ac.bg}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${ac.dot} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-[#0E1A14]">#{notif.bookingCode}</span>
                              <span className="text-[11px] text-[#8A9890]">·</span>
                              <span className="text-[11px] text-[#5C6B63] truncate">{notif.travelerName}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[oldKey] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                {statusLabel(notif.oldStatus, t)}
                              </span>
                              <ArrowRight className="w-3 h-3 text-[#8A9890]" />
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${STATUS_COLORS[newKey] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                                {statusLabel(notif.newStatus, t)}
                              </span>
                            </div>
                            <p className={`text-[11px] font-semibold ${ac.text}`}>{message}</p>
                            {details && <p className="text-[11px] text-[#6B7A72] mt-0.5">{details}</p>}
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
                              className="h-7 px-2.5 rounded-lg bg-white border border-[#DCE3DF] text-[11px] font-semibold text-[#31413A] hover:bg-[#F1F5F2] transition-all inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              {t("view")}
                            </button>
                            <button
                              onClick={() => dismissNotification(notif.id)}
                              className="h-7 px-2.5 rounded-lg bg-white border border-[#DCE3DF] text-[11px] font-semibold text-[#6B7A72] hover:bg-[#F1F5F2] transition-all inline-flex items-center gap-1"
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

      {/* Hero band */}
      <section className="relative bg-[#0B3D2A] pt-[108px] lg:pt-[88px] pb-28 sm:pb-32 overflow-hidden">
        <div className={`absolute inset-0 ${SD_PATTERN}`} aria-hidden />
        <div className="absolute -top-24 right-[-8%] w-[520px] h-[520px] rounded-full bg-[#00893D]/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-[#00893D]" aria-hidden />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 mb-5">
              <CalendarDays className="w-3.5 h-3.5 text-[#9CEBBE]" />
              <span className="text-[11px] font-bold text-[#9CEBBE] tracking-[0.2em] uppercase">{t("eyebrow")}</span>
              {isRefreshing && <RefreshCw className="w-3 h-3 text-[#9CEBBE] animate-spin ml-1" />}
            </div>
            <h1 className="text-[34px] md:text-[46px] font-semibold tracking-[-0.02em] text-white mb-3 leading-[1.08]">{t("pageTitle")}</h1>
            <p className="text-white/70 text-sm md:text-base max-w-xl">{t("pageSubtitle")}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchBookings(true)}
              className="h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white/90 hover:bg-white/20 transition-all inline-flex items-center gap-2 text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("refresh")}
            </button>
            <Link
              href="/schaefflerdebrecen"
              className="h-11 px-5 rounded-xl bg-[#00893D] hover:bg-[#00A04A] text-white font-semibold text-sm tracking-wide transition-all inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
            >
              <Plus className="w-4 h-4" />
              {t("newBooking")}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-20 sm:-mt-24 pb-24 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto w-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8"
          >
            {(
              [
                { label: "statTotal", value: stats.total, icon: <CalendarDays className="w-5 h-5" />, badge: null, tone: "text-[#0B3D2A] bg-[#E7F4EC] border-[#CBE6D6]" },
                { label: "statPending", value: stats.pending, icon: <Clock className="w-5 h-5" />, badge: "badgePending", tone: "text-amber-700 bg-amber-50 border-amber-200" },
                { label: "statConfirmed", value: stats.confirmed, icon: <UserCheck className="w-5 h-5" />, badge: "badgeActive", tone: "text-sky-700 bg-sky-50 border-sky-200" },
                { label: "statClosed", value: stats.closed, icon: <CheckCircle2 className="w-5 h-5" />, badge: "badgeClosed", tone: "text-slate-600 bg-slate-50 border-slate-200" },
              ] as {
                label: SdBKey;
                value: number;
                icon: React.ReactNode;
                badge: SdBKey | null;
                tone: string;
              }[]
            ).map((card) => (
              <motion.div
                key={card.label}
                variants={fadeIn}
                className="bg-white rounded-2xl border border-[#E1E7E3] p-4 md:p-5 relative overflow-hidden shadow-[0_1px_2px_rgba(11,61,42,0.04),0_14px_34px_rgba(11,61,42,0.07)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.tone}`}>{card.icon}</div>
                  {card.badge && (
                    <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${card.tone}`}>
                      {t(card.badge)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#8A9890] mb-1">{t(card.label)}</p>
                <p className="text-3xl font-black text-[#0E1A14] tracking-tight tabular-nums">{card.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E1E7E3] self-start overflow-x-auto max-w-full">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all inline-flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.key ? "bg-[#0B3D2A] text-white shadow-sm" : "text-[#5C6B63] hover:text-[#0B3D2A] hover:bg-[#F1F5F2]"
                  }`}
                >
                  {t(tab.label)}
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                      activeTab === tab.key ? "bg-white/20 text-white" : "bg-[#EEF2EF] text-[#6B7A72]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 text-[#8A9890] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-white border border-[#DCE3DF] text-sm text-[#0E1A14] placeholder:text-[#9AA7A0] outline-none focus:border-[#00893D] focus:ring-4 focus:ring-[#00893D]/10 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label={t("clearSearch")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-[#8A9890] hover:text-[#0B3D2A] hover:bg-[#F1F5F2]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#E7F4EC] border border-[#CBE6D6] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#00893D] animate-spin" />
              </div>
              <p className="text-sm text-[#5C6B63] font-medium">{t("loadingBookings")}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-[#E1E7E3] p-10 md:p-16 text-center">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-[#F1F5F2] border border-[#E1E7E3] flex items-center justify-center mb-6">
                  <CalendarPlus className="w-10 h-10 text-[#9AA7A0]" />
                </div>
                <h3 className="text-xl font-bold text-[#0E1A14] mb-2">{t("emptyTitle")}</h3>
                <p className="text-[#6B7A72] text-sm mb-6 max-w-sm">{search ? t("emptySearch") : t("emptyBody")}</p>
                {search ? (
                  <button onClick={() => setSearch("")} className="h-11 px-6 rounded-xl bg-white border border-[#DCE3DF] text-[#0E1A14] font-semibold text-sm hover:bg-[#F3F6F4] transition-all">
                    {t("clearSearch")}
                  </button>
                ) : (
                  <Link href="/schaefflerdebrecen" className="h-11 px-6 rounded-xl bg-[#00893D] hover:bg-[#007335] text-white font-semibold text-sm tracking-wide transition-all inline-flex items-center gap-2 shadow-[0_8px_24px_rgba(0,137,61,0.3)]">
                    {t("goBook")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial="hidden"
              animate="visible"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
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
                    className="bg-white rounded-2xl border border-[#E1E7E3] overflow-hidden relative shadow-[0_1px_2px_rgba(11,61,42,0.04),0_10px_28px_rgba(11,61,42,0.05)] hover:border-[#C9D6CE] transition-colors"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${STATUS_RAIL[booking.status]}`} />
                    <div className="p-5 md:p-6 pl-7 md:pl-8">
                      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                        <div className="flex-1 lg:max-w-[340px] flex flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B3D2A] text-[11px] font-black tracking-wider text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#7BE0A6]" />#{booking.bookingCode}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-wide ${STATUS_COLORS[booking.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[booking.status]}`} />
                              {statusLabel(booking.status, t)}
                            </span>
                          </div>

                          <div>
                            <p className={`${labelCls} mb-1`}>{t("pickup")}</p>
                            <div className="flex items-baseline gap-3 flex-wrap">
                              <p className="text-xl md:text-2xl font-black text-[#0E1A14] tracking-tight">{formatPickupDate(booking.pickupDate, lang)}</p>
                              <span className="text-lg font-bold text-[#00893D] tabular-nums">{booking.pickupTime}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center pt-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#00893D] ring-4 ring-[#00893D]/15" />
                              <div className="w-px h-10 bg-gradient-to-b from-[#00893D]/60 to-[#0B3D2A]/60" />
                              <div className="w-2.5 h-2.5 rounded-full bg-[#0B3D2A] ring-4 ring-[#0B3D2A]/12" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2.5">
                              <div className="min-w-0">
                                <p className={`${labelCls} mb-0.5`}>{t("from")}</p>
                                <p className="text-sm font-semibold text-[#0E1A14] break-words">{booking.fromAddress}</p>
                              </div>
                              <div className="min-w-0">
                                <p className={`${labelCls} mb-0.5`}>{t("to")}</p>
                                <p className="text-sm font-semibold text-[#0E1A14] break-words">{booking.toAddress}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden lg:block w-px bg-[#EEF2EF] shrink-0" />

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5 content-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-[#8A9890]" />
                              <span className={labelCls}>{t("vehicleClass")}</span>
                            </div>
                            <p className={`text-sm font-bold ${isExec ? "text-[#00893D]" : "text-[#0E1A14]"}`}>{isExec ? t("executive") : t("standard")}</p>
                            <p className="text-[11px] text-[#8A9890]">{isExec ? t("executiveSub") : t("standardSub")}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-[#8A9890]" />
                              <span className={labelCls}>{t("passengers")}</span>
                            </div>
                            <p className="text-sm font-bold text-[#0E1A14]">{t("paxUnit", { n: booking.travelers })}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Luggage className="w-3.5 h-3.5 text-[#8A9890]" />
                              <span className={labelCls}>{t("luggage")}</span>
                            </div>
                            <p className="text-sm font-bold text-[#0E1A14]">{t("bagUnit", { n: booking.luggage })}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Plane className="w-3.5 h-3.5 text-[#8A9890]" />
                              <span className={labelCls}>{t("flight")}</span>
                            </div>
                            <p className="text-sm font-bold text-[#0E1A14]">
                              {booking.flightNumber ? booking.flightNumber : <span className="text-[#8A9890] font-medium">{t("noFlight")}</span>}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {paymentIcon(booking.paymentMethod, "w-3.5 h-3.5 text-[#8A9890]")}
                              <span className={labelCls}>{t("payment")}</span>
                            </div>
                            <p className="text-sm font-bold text-[#0E1A14]">{paymentLabel(booking.paymentMethod)}</p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-[#8A9890]" />
                              <span className={labelCls}>{t("price")}</span>
                            </div>
                            <p className="text-sm font-bold text-[#00893D]">
                              {booking.price !== undefined && booking.price !== null ? formatPrice(booking.price, lang) : <span className="text-[#8A9890] font-medium">{t("priceNotSet")}</span>}
                            </p>
                          </div>

                          <div className="space-y-1.5 col-span-2 md:col-span-3">
                            <div className="flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-[#8A9890]" />
                              <span className={labelCls}>{t("driverVehicle")}</span>
                            </div>
                            {driver || vehicle ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-[#0E1A14]">
                                  {driver}
                                  {vehicle && <span className="text-[#6B7A72] font-medium ml-2">· {vehicle}</span>}
                                </p>
                                {booking.driverAcknowledged ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E7F4EC] border border-[#BFE3CC] text-[#007335] text-[10px] font-bold">
                                    <Check className="w-3 h-3" />
                                    {t("driverAcknowledged")}
                                  </span>
                                ) : booking.driverNotified ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold">
                                    <Bell className="w-3 h-3" />
                                    {t("driverNotified")}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F1F5F2] border border-[#E1E7E3] text-[#6B7A72] text-[11px] font-medium">
                                <Clock className="w-3 h-3" />
                                {t("driverPending")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="hidden lg:block w-px bg-[#EEF2EF] shrink-0" />

                        <div className="flex lg:flex-col items-stretch lg:items-end gap-2 lg:min-w-[160px]">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                            className="flex-1 lg:flex-none h-10 px-4 rounded-lg bg-white border border-[#DCE3DF] text-[#31413A] hover:bg-[#F3F6F4] transition-all inline-flex items-center justify-center gap-1.5 text-sm font-medium"
                          >
                            {isExpanded ? t("hideDetails") : t("details")}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {canModify && (
                            <>
                              <button
                                onClick={() => openEditModal(booking)}
                                className="flex-1 lg:flex-none h-10 px-4 rounded-lg bg-[#E7F4EC] border border-[#BFE3CC] text-[#007335] hover:bg-[#D6EDDF] transition-all inline-flex items-center justify-center gap-1.5 text-sm font-bold"
                              >
                                <Edit3 className="w-4 h-4" />
                                {t("modify")}
                              </button>
                              <button
                                onClick={() => setCancelModal(booking)}
                                className="flex-1 lg:flex-none h-10 px-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all inline-flex items-center justify-center gap-1.5 text-sm font-bold"
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
                          <div className="border-t border-[#EEF2EF] px-5 md:px-8 py-6 bg-[#FAFCFB]">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-7">
                              <div>
                                <SectionLabel icon={<User className="w-3.5 h-3.5" />}>{t("secPassenger")}</SectionLabel>
                                <div className="space-y-3">
                                  <InfoRow icon={<User className="w-3.5 h-3.5" />} label={t("name")}>{booking.travelerName}</InfoRow>
                                  <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label={t("email")}>{booking.travelerEmail}</InfoRow>
                                  <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label={t("phone")}>{booking.travelerPhone}</InfoRow>
                                </div>
                              </div>

                              {(booking.secondTravelerEmail || booking.secondTravelerPhone) && (
                                <div>
                                  <SectionLabel icon={<Users className="w-3.5 h-3.5" />}>{t("secSecond")}</SectionLabel>
                                  <div className="space-y-3">
                                    {booking.secondTravelerEmail && (
                                      <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label={t("email")}>{booking.secondTravelerEmail}</InfoRow>
                                    )}
                                    {booking.secondTravelerPhone && (
                                      <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label={t("phone")}>{booking.secondTravelerPhone}</InfoRow>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div>
                                <SectionLabel icon={<Building2 className="w-3.5 h-3.5" />}>{t("secCompany")}</SectionLabel>
                                <div className="space-y-3">
                                  <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label={t("company")}>{booking.companyName}</InfoRow>
                                  <InfoRow icon={paymentIcon(booking.paymentMethod, "w-3.5 h-3.5")} label={t("payment")}>{paymentLabel(booking.paymentMethod)}</InfoRow>
                                  <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label={t("price")}>
                                    {booking.price !== undefined && booking.price !== null ? (
                                      <span className="text-[#00893D]">{formatPrice(booking.price, lang)}</span>
                                    ) : (
                                      <span className="text-[#8A9890] font-medium">{t("priceNotSet")}</span>
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
                                    {booking.flightNumber || <span className="text-[#8A9890] font-medium">{t("noFlight")}</span>}
                                  </InfoRow>
                                  <InfoRow icon={<Car className="w-3.5 h-3.5" />} label={t("vehicleClass")}>
                                    {isExec ? `${t("executive")} · ${t("executiveSub")}` : `${t("standard")} · ${t("standardSub")}`}
                                  </InfoRow>
                                  <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label={t("bookingCode")}>#{booking.bookingCode}</InfoRow>
                                </div>
                              </div>

                              <div>
                                <SectionLabel icon={<Truck className="w-3.5 h-3.5" />}>{t("secDriver")}</SectionLabel>
                                <div className="space-y-3">
                                  <InfoRow icon={<User className="w-3.5 h-3.5" />} label={t("fieldDriver")}>
                                    {driver || <span className="text-[#8A9890] font-medium">{t("driverPending")}</span>}
                                  </InfoRow>
                                  <InfoRow icon={<Car className="w-3.5 h-3.5" />} label={t("fieldVehicle")}>
                                    {vehicle || <span className="text-[#8A9890] font-medium">{t("driverPending")}</span>}
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
                                <p className="text-sm text-[#31413A] whitespace-pre-wrap break-words">
                                  {booking.comment || <span className="text-[#8A9890] italic">{t("noComment")}</span>}
                                </p>
                              </div>

                              <div className="md:col-span-2 xl:col-span-3 border-t border-[#EEF2EF] pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                  <SectionLabel icon={<History className="w-3.5 h-3.5" />}>{t("secTimeline")}</SectionLabel>
                                  <div className="space-y-3">
                                    <InfoRow icon={<CalendarPlus className="w-3.5 h-3.5" />} label={t("createdAt")}>{formatTimestamp(booking.createdAt, lang)}</InfoRow>
                                    <InfoRow icon={<RefreshCw className="w-3.5 h-3.5" />} label={t("updatedAt")}>{formatTimestamp(booking.updatedAt, lang)}</InfoRow>
                                    {booking.lastStatusChange && (
                                      <InfoRow icon={<ArrowRight className="w-3.5 h-3.5" />} label={t("statusChangedAt")}>
                                        {t("statusChange", {
                                          from: statusLabel(booking.lastStatusChange.oldStatus, t),
                                          to: statusLabel(booking.lastStatusChange.newStatus, t),
                                        })}
                                        <span className="block text-[11px] text-[#8A9890] font-medium mt-0.5">{formatTimestamp(booking.lastStatusChange.changedAt, lang)}</span>
                                      </InfoRow>
                                    )}
                                  </div>
                                  <p className="flex items-start gap-1.5 text-[11px] text-[#8A9890] mt-4">
                                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                    {t("timesNote")}
                                  </p>
                                </div>

                                <div>
                                  <SectionLabel icon={<Link2 className="w-3.5 h-3.5" />}>{t("secTracking")}</SectionLabel>
                                  {trackActive ? (
                                    <div className="space-y-3">
                                      <p className="text-sm text-[#5C6B63]">{t("trackingHint")}</p>
                                      <div className="flex flex-wrap gap-2">
                                        <a
                                          href={`/track/${booking.bookingTrackToken}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="h-10 px-4 rounded-lg bg-[#E7F4EC] border border-[#BFE3CC] text-[#007335] hover:bg-[#D6EDDF] transition-all inline-flex items-center gap-2 text-sm font-bold"
                                        >
                                          <Link2 className="w-4 h-4" />
                                          {t("openTracking")}
                                        </a>
                                        <button
                                          onClick={() => copyTrackingLink(booking.bookingTrackToken as string)}
                                          className="h-10 px-4 rounded-lg bg-white border border-[#DCE3DF] text-[#31413A] hover:bg-[#F3F6F4] transition-all inline-flex items-center gap-2 text-sm font-medium"
                                        >
                                          <Copy className="w-4 h-4" />
                                          {t("copyTracking")}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-[#8A9890] italic">{t("trackingInactive")}</p>
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
          <p className="text-center text-[11px] text-[#9AA7A0] mt-8">{t("lastUpdated")}</p>
        </div>
      </section>

      <footer className="border-t border-[#E1E7E3] bg-white py-10 px-6 z-10 relative">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <SdLogos size="sm" />
            <span className="text-xs font-medium text-[#6B7A72] tracking-wide">{t("footerPortal")}</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1 text-xs text-[#7B8A82]">
            <span className="font-medium text-[#31413A]">
              {t("footerSupport")}: {SD_SUPPORT.name}
            </span>
            <span>
              <a href={`mailto:${SD_SUPPORT.email}`} className="hover:text-[#00893D]">{SD_SUPPORT.email}</a>
              {" · "}
              <a href={`tel:${SD_SUPPORT.phoneHref}`} className="hover:text-[#00893D]">{SD_SUPPORT.phone}</a>
            </span>
            <span>
              © {year} Pannon Transfer. {t("rightsReserved")}
            </span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0B3D2A]/60 backdrop-blur-sm" onClick={closeEditModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-white rounded-2xl border border-[#E1E7E3] shadow-[0_30px_80px_rgba(11,61,42,0.35)] overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00893D]" />
              <div className="sticky top-0 z-10 bg-white border-b border-[#EEF2EF] px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0E1A14]">{t("editTitle")}</h3>
                  <p className="text-xs text-[#6B7A72] mt-0.5">#{editModal.bookingCode}</p>
                </div>
                <button onClick={closeEditModal} aria-label={t("back")} className="w-9 h-9 rounded-xl bg-white border border-[#DCE3DF] flex items-center justify-center text-[#6B7A72] hover:text-[#0B3D2A] hover:bg-[#F1F5F2] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#E7F4EC] border border-[#CBE6D6]">
                  <Info className="w-4 h-4 text-[#00893D] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#31413A] leading-relaxed">
                    <span className="font-bold text-[#0E1A14]">{t("noticeTitle")}: </span>
                    {t("noticeBody")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldShell label={t("date")} required error={editErrors.pickupDate}>
                    <input type="date" value={editForm.pickupDate} onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })} className="bg-transparent border-none outline-none w-full text-sm font-medium text-[#0E1A14]" />
                  </FieldShell>
                  <FieldShell label={t("time")} required error={editErrors.pickupTime}>
                    <input type="time" value={editForm.pickupTime} onChange={(e) => setEditForm({ ...editForm, pickupTime: e.target.value })} className="bg-transparent border-none outline-none w-full text-sm font-medium text-[#0E1A14]" />
                  </FieldShell>
                </div>

                <FieldShell label={t("fromAddress")} required error={editErrors.fromAddress} icon={<MapPin className="w-4 h-4 text-[#8A9890] shrink-0" />}>
                  <input type="text" value={editForm.fromAddress} onChange={(e) => setEditForm({ ...editForm, fromAddress: e.target.value })} className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-[#9AA7A0] text-[#0E1A14]" />
                </FieldShell>

                <FieldShell label={t("toAddress")} required error={editErrors.toAddress} icon={<MapPin className="w-4 h-4 text-[#8A9890] shrink-0" />}>
                  <input type="text" value={editForm.toAddress} onChange={(e) => setEditForm({ ...editForm, toAddress: e.target.value })} className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-[#9AA7A0] text-[#0E1A14]" />
                </FieldShell>

                <div className="grid grid-cols-2 gap-4">
                  <FieldShell label={t("flightLabel")} required={editModal.fromType === "airport" || editModal.toType === "airport"} error={editErrors.flightNumber} icon={<Plane className="w-4 h-4 text-[#8A9890] shrink-0" />}>
                    <input
                      type="text"
                      value={editForm.flightNumber}
                      onChange={(e) => setEditForm({ ...editForm, flightNumber: e.target.value.toUpperCase() })}
                      placeholder={t("flightPlaceholder")}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-[#9AA7A0] text-[#0E1A14]"
                    />
                  </FieldShell>
                  <FieldShell label={t("phoneLabel")} required error={editErrors.travelerPhone} icon={<Phone className="w-4 h-4 text-[#8A9890] shrink-0" />}>
                    <input type="tel" value={editForm.travelerPhone} onChange={(e) => setEditForm({ ...editForm, travelerPhone: e.target.value })} className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-[#9AA7A0] text-[#0E1A14]" />
                  </FieldShell>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Stepper
                    label={t("paxCount")}
                    icon={<Users className="w-4 h-4 text-[#8A9890]" />}
                    value={editForm.travelers}
                    onMinus={() => setEditForm({ ...editForm, travelers: Math.max(1, editForm.travelers - 1) })}
                    onPlus={() => setEditForm({ ...editForm, travelers: editForm.travelers + 1 })}
                  />
                  <Stepper
                    label={t("bagCount")}
                    icon={<Luggage className="w-4 h-4 text-[#8A9890]" />}
                    value={editForm.luggage}
                    onMinus={() => setEditForm({ ...editForm, luggage: Math.max(0, editForm.luggage - 1) })}
                    onPlus={() => setEditForm({ ...editForm, luggage: editForm.luggage + 1 })}
                  />
                </div>

                <FieldShell label={t("commentLabel")}>
                  <textarea rows={3} value={editForm.comment} onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })} placeholder={t("commentPlaceholder")} className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-[#9AA7A0] text-[#0E1A14] resize-none" />
                </FieldShell>

                {editGeneral.length > 0 && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <ul className="text-[12px] text-rose-700 font-medium space-y-1">
                      {editGeneral.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeEditModal} className="flex-1 h-11 rounded-lg bg-white border border-[#DCE3DF] text-[#31413A] hover:bg-[#F3F6F4] transition-all font-semibold text-sm">
                    {t("back")}
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-[2] h-11 rounded-lg bg-[#00893D] hover:bg-[#007335] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,137,61,0.28)]"
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#0B3D2A]/60 backdrop-blur-sm" onClick={() => !cancelLoading && setCancelModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white rounded-2xl border border-[#E1E7E3] shadow-[0_30px_80px_rgba(11,61,42,0.35)] overflow-hidden"
            >
              <div className="p-7">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0E1A14] mb-2">{t("cancelTitle")}</h3>
                  <p className="text-sm text-[#6B7A72]">
                    #{cancelModal.bookingCode} · {formatPickupDate(cancelModal.pickupDate, lang)} {cancelModal.pickupTime}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-xl bg-[#F6F9F7] border border-[#E1E7E3]">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center mb-3">
                      <Banknote className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-[#8A9890] mb-1">{t("refundTitle")}</p>
                    <p className="text-xs text-[#31413A] font-medium leading-relaxed">{t("refundBody")}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#F6F9F7] border border-[#E1E7E3]">
                    <div className="w-8 h-8 rounded-lg bg-[#E7F4EC] flex items-center justify-center mb-3">
                      <UserCheck className="w-4 h-4 text-[#00893D]" />
                    </div>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-[#8A9890] mb-1">{t("driverTitle")}</p>
                    <p className="text-xs text-[#31413A] font-medium leading-relaxed">{t("driverBody")}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setCancelModal(null)} disabled={cancelLoading} className="flex-1 h-11 rounded-lg bg-white border border-[#DCE3DF] text-[#31413A] hover:bg-[#F3F6F4] transition-all font-semibold text-sm disabled:opacity-50">
                    {t("keepBooking")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelConfirm}
                    disabled={cancelLoading}
                    className="flex-1 h-11 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2"
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
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-white ${
                toast.type === "success" ? "border-[#BFE3CC]" : "border-rose-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-[#E7F4EC] text-[#00893D]" : "bg-rose-50 text-rose-500"}`}>
                {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <p className={`text-sm font-semibold leading-relaxed ${toast.type === "success" ? "text-[#007335]" : "text-rose-700"}`}>{toast.message}</p>
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
      <label className="text-[11px] text-[#5C6B63] font-bold tracking-widest uppercase ml-1 flex gap-1">
        {label} {required && <span className="text-[#00893D]">*</span>}
      </label>
      <div
        className={`w-full bg-white border rounded-lg p-3.5 flex items-center gap-3 focus-within:border-[#00893D] focus-within:ring-4 focus-within:ring-[#00893D]/10 transition-all ${
          error ? "border-rose-300 ring-1 ring-rose-200" : "border-[#DCE3DF]"
        }`}
      >
        {icon}
        {children}
      </div>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
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
      <label className="text-[11px] text-[#5C6B63] font-bold tracking-widest uppercase ml-1 flex gap-1">
        {label} <span className="text-[#00893D]">*</span>
      </label>
      <div className="w-full bg-white border border-[#DCE3DF] rounded-lg p-2.5 flex justify-between items-center text-[#0E1A14]">
        <div className="flex items-center gap-3 px-2">
          {icon}
          <span className="text-sm font-bold">{value}</span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onMinus} className="w-8 h-8 rounded bg-[#F1F5F2] hover:bg-[#E7F4EC] flex items-center justify-center transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" onClick={onPlus} className="w-8 h-8 rounded bg-[#F1F5F2] hover:bg-[#E7F4EC] flex items-center justify-center transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
