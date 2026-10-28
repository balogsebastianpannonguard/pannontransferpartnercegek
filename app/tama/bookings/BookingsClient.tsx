"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Banknote,
  Bell,
  Building,
  Building2,
  CalendarDays,
  CalendarPlus,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  CreditCard,
  Edit3,
  Eye,
  History,
  Info,
  Leaf,
  Link2,
  Loader2,
  Luggage,
  Mail,
  MapPin,
  MessageSquare,
  Minus,
  Phone,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  Truck,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import TamaPremiumLogin from "../components/TamaPremiumLogin";
import { useTamaLang } from "../lang";
import {
  type TamaKey,
  makeT,
  formatPickupDate,
  formatTimestamp,
  formatPrice,
  STATUS_KEY,
  translateServerMessage,
  localizeNotificationDetails,
} from "./i18n";
import { MeadowBackdrop, PannonLogo, TamaFooter, TamaHeader, TamaLogo, serifFont } from "../ui";

interface TamaPortalUser {
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

const STATUS_CHIP: Record<BookingStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  modified: "bg-orange-50 text-orange-800 border-orange-200",
  confirmed: "bg-[#EAF1D3] text-[#3E560C] border-[#CFDDA0]",
  "in-progress": "bg-sky-50 text-sky-800 border-sky-200",
  completed: "bg-stone-100 text-stone-700 border-stone-200",
  cancelled: "bg-rose-50 text-rose-800 border-rose-200",
};

const STATUS_DOT: Record<BookingStatus, string> = {
  pending: "bg-amber-500",
  modified: "bg-orange-500",
  confirmed: "bg-[#5F8016]",
  "in-progress": "bg-sky-500",
  completed: "bg-stone-400",
  cancelled: "bg-rose-500",
};

const STATUS_RAIL: Record<BookingStatus, string> = {
  pending: "from-amber-300 to-amber-500",
  modified: "from-orange-300 to-orange-500",
  confirmed: "from-[#B9CC83] to-[#5F8016]",
  "in-progress": "from-sky-300 to-sky-500",
  completed: "from-stone-300 to-stone-400",
  cancelled: "from-rose-300 to-rose-500",
};

const ACCENTS: Record<string, { box: string; text: string; dot: string }> = {
  emerald: { box: "bg-[#F4F8E6] border-[#CFDDA0]", text: "text-[#3E560C]", dot: "bg-[#5F8016]" },
  orange: { box: "bg-orange-50 border-orange-200", text: "text-orange-800", dot: "bg-orange-500" },
  rose: { box: "bg-rose-50 border-rose-200", text: "text-rose-800", dot: "bg-rose-500" },
  blue: { box: "bg-sky-50 border-sky-200", text: "text-sky-800", dot: "bg-sky-500" },
  slate: { box: "bg-stone-50 border-stone-200", text: "text-stone-700", dot: "bg-stone-400" },
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

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-[#5F8016] mb-3">
      {icon}
      {children}
    </p>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-white border border-[#E4DDC7] flex items-center justify-center text-[#7B9824]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-widest uppercase text-[#8B917D]">{label}</p>
        <div className="text-sm font-semibold text-[#26301B] break-words">{children}</div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[#9CA08A]">
        {icon}
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#8B917D]">{label}</span>
      </div>
      <div className="text-sm font-bold text-[#26301B]">{children}</div>
    </div>
  );
}

const ghostBtn =
  "h-10 px-4 rounded-full bg-white border border-[#E4DDC7] text-[#4A5340] hover:bg-[#F4F0E1] hover:border-[#CFC7A8] transition-all inline-flex items-center justify-center gap-1.5 text-sm font-semibold";

export default function TamaBookingsClient() {
  const [lang, setLang] = useTamaLang();
  const t = useMemo(() => makeT(lang), [lang]);

  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<TamaPortalUser | null>(null);
  const [bootedFor, setBootedFor] = useState<string | null>(null);

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
    if (!authedUser) return;
    const who = authedUser.email;
    const timer = setTimeout(() => setBootedFor(who), 1400);
    return () => clearTimeout(timer);
  }, [authedUser]);

  const portalBooting = !!authedUser && bootedFor !== authedUser.email;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/tama-auth/session", { cache: "no-store" });
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
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/tama-auth/logout", { method: "POST" });
    } catch {}
    setAuthedUser(null);
  };

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings", {
        cache: "no-store",
        headers: { "x-partner-portal": "tama" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.bookings) setBookings(json.bookings);
      }
    } catch {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshBookings = useCallback(() => {
    setIsRefreshing(true);
    void fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (!(authChecked && authedUser)) return;
    const timer = setTimeout(() => void fetchBookings(), 0);
    return () => clearTimeout(timer);
  }, [authChecked, authedUser, fetchBookings]);

  useEffect(() => {
    if (!authedUser) return;
    const interval = setInterval(refreshBookings, 15000);
    return () => clearInterval(interval);
  }, [authedUser, refreshBookings]);

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
        const res = await fetch(`/api/notifications?lastPollTimestamp=${lastNotifPollTimestamp.current}`, {
          cache: "no-store",
          headers: { "x-partner-portal": "tama" },
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
        headers: { "Content-Type": "application/json", "x-partner-portal": "tama" },
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
              translateServerMessage(Array.isArray(v) ? String(v[0]) : String(v), lang),
            ),
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
        headers: { "Content-Type": "application/json", "x-partner-portal": "tama" },
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
    [bookings, tabMatch],
  );

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#FAF8F1] text-[#26301B] flex flex-col [color-scheme:light]">
        <MeadowBackdrop />
        <div className="relative z-10 w-full border-b border-[#E4DDC7] bg-[#FBF9F3]/80 backdrop-blur-md">
          <div className="max-w-[1180px] mx-auto px-6 h-[68px] flex items-center gap-4">
            <div className="h-9 px-3 rounded-full bg-white border border-[#E4DDC7] flex items-center">
              <PannonLogo className="h-5" />
            </div>
            <span className="w-1 h-1 rounded-full bg-[#C9A24D]" />
            <TamaLogo className="h-8" />
          </div>
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#EAF1D3] border border-[#CFDDA0] flex items-center justify-center">
              <Building2 className="w-7 h-7 text-[#5F8016] animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                className="w-5 h-5 rounded-full border-2 border-[#E4DDC7] border-t-[#5F8016]"
              />
              <p className="text-[14px] text-[#5B6450] font-semibold tracking-wide">{t("verifyingAccess")}</p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <TamaPremiumLogin _onSuccess={setAuthedUser} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FAF8F1] flex flex-col items-center justify-center overflow-hidden [color-scheme:light]">
        <MeadowBackdrop />
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative z-10 flex flex-col items-center">
          <div className="relative mb-9">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, ease: "linear", repeat: Infinity }}
              className="absolute -inset-6 rounded-full border border-dashed border-[#B9CC83]"
            />
            <div className="relative h-24 w-24 rounded-full bg-white border border-[#E4DDC7] shadow-[0_18px_50px_rgba(95,128,22,0.18)] flex items-center justify-center">
              <TamaLogo className="h-9" />
            </div>
          </div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#8B917D] font-medium">{t("premiumTagline")}</p>
          <div className="mt-10 w-60">
            <div className="h-[3px] w-full bg-[#E9E3CF] relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: [0.7, 0, 0.3, 1], delay: 0.2 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#B9CC83] to-[#5F8016]"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="mt-4 text-center text-[10px] tracking-[0.25em] text-[#5F8016] uppercase font-bold"
            >
              {t("preparingWorkspace")}
            </motion.div>
          </div>
        </motion.div>
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

  const filterTabs: { key: FilterTab; label: TamaKey; count: number }[] = [
    { key: "all", label: "filterAll", count: stats.total },
    { key: "pending", label: "filterPending", count: stats.pending },
    { key: "confirmed", label: "filterConfirmed", count: stats.confirmed },
    { key: "closed", label: "filterClosed", count: stats.closed },
  ];

  const visibleNotifications = statusNotifications.filter((n) => !n.dismissed);

  const inputField =
    "bg-transparent border-none outline-none w-full text-sm font-medium text-[#26301B] placeholder:text-[#A7AB98] [color-scheme:light]";

  return (
    <div className="relative min-h-screen text-[#3B4530] font-sans selection:bg-[#7B9824]/30 overflow-x-hidden [color-scheme:light]">
      <MeadowBackdrop />

      <TamaHeader lang={lang} onLang={setLang} email={authedUser.email} scrolled={scrolled} active="bookings" onLogout={handleLogout} />

      <AnimatePresence>
        {visibleNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[116px] lg:top-[68px] left-0 right-0 z-40"
          >
            <div className="bg-[#F4F8E6]/95 border-b border-[#CFDDA0] backdrop-blur-xl shadow-[0_10px_30px_rgba(70,80,30,0.08)]">
              <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#5F8016]" />
                    <span className="text-xs font-bold text-[#3E560C] tracking-widest uppercase">{t("notifTitle")}</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#5F8016] text-white text-[10px] font-bold">
                      {visibleNotifications.length}
                    </span>
                  </div>
                  <button onClick={dismissAllNotifications} className="text-[11px] font-semibold text-[#6B705C] hover:text-[#26301B] transition-colors tracking-wide">
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
                          className={`flex items-center gap-4 p-3 rounded-2xl border ${ac.box}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${ac.dot} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-[#26301B]">#{notif.bookingCode}</span>
                              <span className="text-[11px] text-[#9CA08A]">·</span>
                              <span className="text-[11px] text-[#5B6450] truncate">{notif.travelerName}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CHIP[oldKey] || "bg-stone-100 text-stone-600 border-stone-200"}`}>
                                {statusLabel(notif.oldStatus, t)}
                              </span>
                              <ArrowRight className="w-3 h-3 text-[#9CA08A]" />
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_CHIP[newKey] || "bg-stone-100 text-stone-600 border-stone-200"}`}>
                                {statusLabel(notif.newStatus, t)}
                              </span>
                            </div>
                            <p className={`text-[11px] font-semibold ${ac.text}`}>{message}</p>
                            {details && <p className="text-[11px] text-[#6B705C] mt-0.5">{details}</p>}
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
                              className="h-7 px-3 rounded-full bg-white border border-[#E4DDC7] text-[11px] font-semibold text-[#4A5340] hover:bg-[#F4F0E1] transition-all inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              {t("view")}
                            </button>
                            <button
                              onClick={() => dismissNotification(notif.id)}
                              className="h-7 px-3 rounded-full bg-white/70 border border-[#E4DDC7] text-[11px] font-semibold text-[#6B705C] hover:bg-white transition-all inline-flex items-center gap-1"
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

      <section className="relative z-10 pt-[124px] lg:pt-[92px] pb-24 px-4 sm:px-6">
        <div className="max-w-[1180px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#34490D_0%,#5F8016_52%,#8DAA33_100%)] px-7 md:px-12 pt-9 pb-24 shadow-[0_30px_70px_rgba(75,106,14,0.26)]"
          >
            <div className="absolute -top-24 -right-10 w-72 h-72 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 mb-5">
                  <CalendarDays className="w-3.5 h-3.5 text-white" />
                  <span className="text-[11px] font-bold text-white tracking-[0.2em] uppercase">{t("eyebrow")}</span>
                  {isRefreshing && <RefreshCw className="w-3 h-3 text-white animate-spin ml-1" />}
                </div>
                <h1 className="text-[34px] md:text-[46px] leading-[1.05] text-white mb-3" style={serifFont}>
                  {t("pageTitle")}
                </h1>
                <p className="text-white/85 text-sm md:text-base max-w-xl">{t("pageSubtitle")}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={refreshBookings}
                  className="h-11 px-5 rounded-full bg-white/15 border border-white/30 text-white hover:bg-white/25 transition-all inline-flex items-center gap-2 text-sm font-semibold"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {t("refresh")}
                </button>
                <Link
                  href="/tama"
                  className="h-11 px-6 rounded-full bg-white text-[#3E560C] hover:bg-[#F4F8E6] font-bold text-sm tracking-wide transition-all inline-flex items-center gap-2 shadow-[0_10px_26px_rgba(0,0,0,0.18)]"
                >
                  <Plus className="w-4 h-4" />
                  {t("newBooking")}
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
            className="relative -mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 px-1 md:px-6"
          >
            {(
              [
                { label: "statTotal", value: stats.total, icon: <CalendarDays className="w-5 h-5" />, badge: null, tone: "text-[#3E560C] bg-[#EAF1D3] border-[#CFDDA0]" },
                { label: "statPending", value: stats.pending, icon: <Clock className="w-5 h-5" />, badge: "badgePending", tone: "text-amber-800 bg-amber-50 border-amber-200" },
                { label: "statConfirmed", value: stats.confirmed, icon: <UserCheck className="w-5 h-5" />, badge: "badgeActive", tone: "text-[#3E560C] bg-[#EAF1D3] border-[#CFDDA0]" },
                { label: "statClosed", value: stats.closed, icon: <CheckCircle2 className="w-5 h-5" />, badge: "badgeClosed", tone: "text-stone-700 bg-stone-100 border-stone-200" },
              ] as { label: TamaKey; value: number; icon: React.ReactNode; badge: TamaKey | null; tone: string }[]
            ).map((card) => (
              <motion.div
                key={card.label}
                variants={fadeIn}
                className="bg-white rounded-3xl border border-[#E4DDC7] p-4 md:p-5 shadow-[0_14px_36px_rgba(70,80,30,0.09)] hover:shadow-[0_18px_44px_rgba(70,80,30,0.14)] transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${card.tone}`}>{card.icon}</div>
                  {card.badge && (
                    <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${card.tone}`}>
                      {t(card.badge)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#8B917D] mb-1">{t(card.label)}</p>
                <p className="text-3xl text-[#26301B] tabular-nums" style={serifFont}>{card.value}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#F1EDDD] border border-[#E4DDC7] self-start overflow-x-auto max-w-full">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold tracking-wide transition-all inline-flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.key ? "bg-[#5F8016] text-white shadow-[0_4px_14px_rgba(95,128,22,0.35)]" : "text-[#6B705C] hover:text-[#26301B] hover:bg-white/70"
                  }`}
                >
                  {t(tab.label)}
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                      activeTab === tab.key ? "bg-white/25 text-white" : "bg-white text-[#6B705C]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            <div className="relative w-full lg:max-w-md">
              <Search className="w-4 h-4 text-[#9CA08A] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full h-11 pl-11 pr-10 rounded-full bg-white border border-[#E4DDC7] text-sm text-[#26301B] placeholder:text-[#A7AB98] outline-none focus:border-[#7B9824] focus:ring-4 focus:ring-[#7B9824]/15 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  aria-label={t("clearSearch")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[#9CA08A] hover:text-[#26301B] hover:bg-[#F1EDDD]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF1D3] border border-[#CFDDA0] flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#5F8016] animate-spin" />
              </div>
              <p className="text-sm text-[#6B705C] font-medium">{t("loadingBookings")}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-[#E4DDC7] p-10 md:p-16 text-center shadow-[0_14px_36px_rgba(70,80,30,0.07)]">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-[#F4F8E6] border border-[#DCE7B5] flex items-center justify-center mb-6">
                  <CalendarPlus className="w-10 h-10 text-[#7B9824]" />
                </div>
                <h3 className="text-xl text-[#26301B] mb-2" style={serifFont}>{t("emptyTitle")}</h3>
                <p className="text-[#6B705C] text-sm mb-6 max-w-sm">{search ? t("emptySearch") : t("emptyBody")}</p>
                {search ? (
                  <button onClick={() => setSearch("")} className={ghostBtn}>
                    {t("clearSearch")}
                  </button>
                ) : (
                  <Link
                    href="/tama"
                    className="h-11 px-6 rounded-full bg-gradient-to-r from-[#5F8016] to-[#7B9824] hover:from-[#4B6A0E] hover:to-[#5F8016] text-white font-semibold text-sm tracking-wide transition-all inline-flex items-center gap-2 shadow-[0_10px_26px_rgba(95,128,22,0.35)]"
                  >
                    {t("goBook")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <div key="list" className="space-y-4">
              {filteredBookings.map((booking, index) => {
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
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-3xl border border-[#E4DDC7] overflow-hidden hover:border-[#CFC7A8] hover:shadow-[0_18px_44px_rgba(70,80,30,0.10)] transition-[border-color,box-shadow] duration-200 relative"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${STATUS_RAIL[booking.status]}`} />
                    <div className="p-5 md:p-6 pl-7 md:pl-8">
                      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                        <div className="flex-1 lg:max-w-[340px] flex flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F8E6] border border-[#CFDDA0] text-[11px] font-black tracking-wider text-[#3E560C]">
                              <Leaf className="w-3 h-3 text-[#7B9824]" />#{booking.bookingCode}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold tracking-wide ${STATUS_CHIP[booking.status]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[booking.status]}`} />
                              {statusLabel(booking.status, t)}
                            </span>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-[#8B917D] mb-1">{t("pickup")}</p>
                            <div className="flex items-baseline gap-3 flex-wrap">
                              <p className="text-xl md:text-2xl text-[#26301B] tracking-tight" style={serifFont}>
                                {formatPickupDate(booking.pickupDate, lang)}
                              </p>
                              <span className="text-lg font-bold text-[#5F8016] tabular-nums">{booking.pickupTime}</span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center pt-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#7B9824] ring-4 ring-[#7B9824]/15" />
                              <div className="w-px h-10 bg-gradient-to-b from-[#7B9824]/60 to-[#C9A24D]/70" />
                              <div className="w-2.5 h-2.5 rounded-full bg-[#C9A24D] ring-4 ring-[#C9A24D]/15" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2.5">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-[#8B917D] mb-0.5">{t("from")}</p>
                                <p className="text-sm font-semibold text-[#26301B] break-words">{booking.fromAddress}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-[#8B917D] mb-0.5">{t("to")}</p>
                                <p className="text-sm font-semibold text-[#26301B] break-words">{booking.toAddress}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden lg:block w-px bg-[#EFE9D7] shrink-0" />

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5 content-start">
                          <MiniStat icon={<Car className="w-3.5 h-3.5" />} label={t("vehicleClass")}>
                            <span className={isExec ? "text-[#5F8016]" : ""}>{isExec ? t("executive") : t("standard")}</span>
                            <p className="text-[11px] text-[#8B917D] font-medium">{isExec ? t("executiveSub") : t("standardSub")}</p>
                          </MiniStat>
                          <MiniStat icon={<Users className="w-3.5 h-3.5" />} label={t("passengers")}>
                            {t("paxUnit", { n: booking.travelers })}
                          </MiniStat>
                          <MiniStat icon={<Luggage className="w-3.5 h-3.5" />} label={t("luggage")}>
                            {t("bagUnit", { n: booking.luggage })}
                          </MiniStat>
                          <MiniStat icon={<Plane className="w-3.5 h-3.5" />} label={t("flight")}>
                            {booking.flightNumber ? booking.flightNumber : <span className="text-[#9CA08A] font-medium">{t("noFlight")}</span>}
                          </MiniStat>
                          <MiniStat icon={paymentIcon(booking.paymentMethod, "w-3.5 h-3.5")} label={t("payment")}>
                            {paymentLabel(booking.paymentMethod)}
                          </MiniStat>
                          <MiniStat icon={<Tag className="w-3.5 h-3.5" />} label={t("price")}>
                            {booking.price !== undefined && booking.price !== null ? (
                              <span className="text-[#5F8016]">{formatPrice(booking.price, lang)}</span>
                            ) : (
                              <span className="text-[#9CA08A] font-medium">{t("priceNotSet")}</span>
                            )}
                          </MiniStat>

                          <div className="space-y-1.5 col-span-2 md:col-span-3">
                            <div className="flex items-center gap-1.5 text-[#9CA08A]">
                              <Truck className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold tracking-widest uppercase text-[#8B917D]">{t("driverVehicle")}</span>
                            </div>
                            {driver || vehicle ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-[#26301B]">
                                  {driver}
                                  {vehicle && <span className="text-[#6B705C] font-medium ml-2">· {vehicle}</span>}
                                </p>
                                {booking.driverAcknowledged ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF1D3] border border-[#CFDDA0] text-[#3E560C] text-[10px] font-bold">
                                    <Check className="w-3 h-3" />
                                    {t("driverAcknowledged")}
                                  </span>
                                ) : booking.driverNotified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold">
                                    <Bell className="w-3 h-3" />
                                    {t("driverNotified")}
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EDDD] border border-[#E4DDC7] text-[#6B705C] text-[11px] font-medium">
                                <Clock className="w-3 h-3" />
                                {t("driverPending")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="hidden lg:block w-px bg-[#EFE9D7] shrink-0" />

                        <div className="flex lg:flex-col items-stretch lg:items-end gap-2 lg:min-w-[160px]">
                          <button onClick={() => setExpandedId(isExpanded ? null : booking._id)} className={`flex-1 lg:flex-none ${ghostBtn}`}>
                            {isExpanded ? t("hideDetails") : t("details")}
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {canModify && (
                            <>
                              <button
                                onClick={() => openEditModal(booking)}
                                className="flex-1 lg:flex-none h-10 px-4 rounded-full bg-[#EAF1D3] border border-[#CFDDA0] text-[#3E560C] hover:bg-[#DDE8B8] transition-all inline-flex items-center justify-center gap-1.5 text-sm font-bold"
                              >
                                <Edit3 className="w-4 h-4" />
                                {t("modify")}
                              </button>
                              <button
                                onClick={() => setCancelModal(booking)}
                                className="flex-1 lg:flex-none h-10 px-4 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-all inline-flex items-center justify-center gap-1.5 text-sm font-bold"
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
                          <div className="border-t border-[#EFE9D7] px-5 md:px-8 py-6 bg-[#FBF8EC]">
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
                                      <span className="text-[#5F8016]">{formatPrice(booking.price, lang)}</span>
                                    ) : (
                                      <span className="text-[#9CA08A] font-medium">{t("priceNotSet")}</span>
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
                                    {booking.flightNumber || <span className="text-[#9CA08A] font-medium">{t("noFlight")}</span>}
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
                                    {driver || <span className="text-[#9CA08A] font-medium">{t("driverPending")}</span>}
                                  </InfoRow>
                                  <InfoRow icon={<Car className="w-3.5 h-3.5" />} label={t("fieldVehicle")}>
                                    {vehicle || <span className="text-[#9CA08A] font-medium">{t("driverPending")}</span>}
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
                                <p className="text-sm text-[#4A5340] whitespace-pre-wrap break-words">
                                  {booking.comment || <span className="text-[#9CA08A] italic">{t("noComment")}</span>}
                                </p>
                              </div>

                              <div className="md:col-span-2 xl:col-span-3 border-t border-[#EEE5C6] pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
                                        <span className="block text-[11px] text-[#8B917D] font-medium mt-0.5">
                                          {formatTimestamp(booking.lastStatusChange.changedAt, lang)}
                                        </span>
                                      </InfoRow>
                                    )}
                                  </div>
                                  <p className="flex items-start gap-1.5 text-[11px] text-[#8B917D] mt-4">
                                    <Info className="w-3 h-3 mt-0.5 shrink-0" />
                                    {t("timesNote")}
                                  </p>
                                </div>

                                <div>
                                  <SectionLabel icon={<Link2 className="w-3.5 h-3.5" />}>{t("secTracking")}</SectionLabel>
                                  {trackActive ? (
                                    <div className="space-y-3">
                                      <p className="text-sm text-[#5B6450]">{t("trackingHint")}</p>
                                      <div className="flex flex-wrap gap-2">
                                        <a
                                          href={`/track/${booking.bookingTrackToken}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="h-10 px-4 rounded-full bg-[#EAF1D3] border border-[#CFDDA0] text-[#3E560C] hover:bg-[#DDE8B8] transition-all inline-flex items-center gap-2 text-sm font-bold"
                                        >
                                          <Link2 className="w-4 h-4" />
                                          {t("openTracking")}
                                        </a>
                                        <button onClick={() => copyTrackingLink(booking.bookingTrackToken as string)} className={ghostBtn}>
                                          <Copy className="w-4 h-4" />
                                          {t("copyTracking")}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-[#9CA08A] italic">{t("trackingInactive")}</p>
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
            </div>
          )}
          <p className="text-center text-[11px] text-[#9CA08A] mt-8">{t("lastUpdated")}</p>
        </div>
      </section>

      <TamaFooter lang={lang} />

      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#26301B]/50 backdrop-blur-sm" onClick={closeEditModal} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-white rounded-[28px] border border-[#E4DDC7] shadow-[0_30px_80px_rgba(38,48,27,0.3)] overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B9CC83] via-[#5F8016] to-[#C9A24D]" />
              <div className="sticky top-0 z-10 bg-white border-b border-[#EFE9D7] px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl text-[#26301B]" style={serifFont}>{t("editTitle")}</h3>
                  <p className="text-xs text-[#8B917D] mt-0.5">#{editModal.bookingCode}</p>
                </div>
                <button onClick={closeEditModal} aria-label={t("back")} className="w-9 h-9 rounded-full bg-white border border-[#E4DDC7] flex items-center justify-center text-[#6B705C] hover:text-[#26301B] hover:bg-[#F4F0E1] transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-[#F4F8E6] border border-[#CFDDA0]">
                  <Info className="w-4 h-4 text-[#5F8016] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#4A5340] leading-relaxed">
                    <span className="font-bold text-[#26301B]">{t("noticeTitle")}: </span>
                    {t("noticeBody")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldShell label={t("date")} required error={editErrors.pickupDate}>
                    <input type="date" value={editForm.pickupDate} onChange={(e) => setEditForm({ ...editForm, pickupDate: e.target.value })} className={inputField} />
                  </FieldShell>
                  <FieldShell label={t("time")} required error={editErrors.pickupTime}>
                    <input type="time" value={editForm.pickupTime} onChange={(e) => setEditForm({ ...editForm, pickupTime: e.target.value })} className={inputField} />
                  </FieldShell>
                </div>

                <FieldShell label={t("fromAddress")} required error={editErrors.fromAddress} icon={<MapPin className="w-4 h-4 text-[#9CA08A] shrink-0" />}>
                  <input type="text" value={editForm.fromAddress} onChange={(e) => setEditForm({ ...editForm, fromAddress: e.target.value })} className={inputField} />
                </FieldShell>

                <FieldShell label={t("toAddress")} required error={editErrors.toAddress} icon={<MapPin className="w-4 h-4 text-[#9CA08A] shrink-0" />}>
                  <input type="text" value={editForm.toAddress} onChange={(e) => setEditForm({ ...editForm, toAddress: e.target.value })} className={inputField} />
                </FieldShell>

                <div className="grid grid-cols-2 gap-4">
                  <FieldShell
                    label={t("flightLabel")}
                    required={editModal.fromType === "airport" || editModal.toType === "airport"}
                    error={editErrors.flightNumber}
                    icon={<Plane className="w-4 h-4 text-[#9CA08A] shrink-0" />}
                  >
                    <input
                      type="text"
                      value={editForm.flightNumber}
                      onChange={(e) => setEditForm({ ...editForm, flightNumber: e.target.value.toUpperCase() })}
                      placeholder={t("flightPlaceholder")}
                      className={inputField}
                    />
                  </FieldShell>
                  <FieldShell label={t("phoneLabel")} required error={editErrors.travelerPhone} icon={<Phone className="w-4 h-4 text-[#9CA08A] shrink-0" />}>
                    <input type="tel" value={editForm.travelerPhone} onChange={(e) => setEditForm({ ...editForm, travelerPhone: e.target.value })} className={inputField} />
                  </FieldShell>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Stepper
                    label={t("paxCount")}
                    icon={<Users className="w-4 h-4 text-[#9CA08A]" />}
                    value={editForm.travelers}
                    onMinus={() => setEditForm({ ...editForm, travelers: Math.max(1, editForm.travelers - 1) })}
                    onPlus={() => setEditForm({ ...editForm, travelers: editForm.travelers + 1 })}
                  />
                  <Stepper
                    label={t("bagCount")}
                    icon={<Luggage className="w-4 h-4 text-[#9CA08A]" />}
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
                    className={`${inputField} resize-none`}
                  />
                </FieldShell>

                {editGeneral.length > 0 && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-red-50 border border-red-200">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <ul className="text-[12px] text-red-700 font-medium space-y-1">
                      {editGeneral.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeEditModal} className={`flex-1 h-11 ${ghostBtn}`}>
                    {t("back")}
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-[2] h-11 rounded-full bg-gradient-to-r from-[#4B6A0E] via-[#5F8016] to-[#7B9824] hover:from-[#3E560C] hover:to-[#5F8016] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-[0_10px_26px_rgba(95,128,22,0.35)]"
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
            <div className="absolute inset-0 bg-[#26301B]/50 backdrop-blur-sm" onClick={() => !cancelLoading && setCancelModal(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-white rounded-[28px] border border-[#E4DDC7] shadow-[0_30px_80px_rgba(38,48,27,0.3)] overflow-hidden"
            >
              <div className="p-7">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-xl text-[#26301B] mb-2" style={serifFont}>{t("cancelTitle")}</h3>
                  <p className="text-sm text-[#6B705C]">
                    #{cancelModal.bookingCode} · {formatPickupDate(cancelModal.pickupDate, lang)} {cancelModal.pickupTime}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-2xl bg-[#FBF8EC] border border-[#EEE5C6]">
                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center mb-3">
                      <Banknote className="w-4 h-4 text-rose-500" />
                    </div>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-[#8B917D] mb-1">{t("refundTitle")}</p>
                    <p className="text-xs text-[#4A5340] font-medium leading-relaxed">{t("refundBody")}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FBF8EC] border border-[#EEE5C6]">
                    <div className="w-8 h-8 rounded-full bg-[#EAF1D3] flex items-center justify-center mb-3">
                      <UserCheck className="w-4 h-4 text-[#5F8016]" />
                    </div>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-[#8B917D] mb-1">{t("driverTitle")}</p>
                    <p className="text-xs text-[#4A5340] font-medium leading-relaxed">{t("driverBody")}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setCancelModal(null)} disabled={cancelLoading} className={`flex-1 h-11 ${ghostBtn} disabled:opacity-50`}>
                    {t("keepBooking")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelConfirm}
                    disabled={cancelLoading}
                    className="flex-1 h-11 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(244,63,94,0.28)]"
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
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-[0_14px_36px_rgba(38,48,27,0.18)] backdrop-blur-xl ${
                toast.type === "success" ? "bg-[#F4F8E6] border-[#CFDDA0]" : "bg-red-50 border-red-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === "success" ? "bg-[#DDE8B8] text-[#3E560C]" : "bg-red-100 text-red-600"}`}>
                {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <p className={`text-sm font-semibold leading-relaxed ${toast.type === "success" ? "text-[#3E560C]" : "text-red-700"}`}>{toast.message}</p>
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
      <label className="text-[11px] text-[#6B705C] font-bold tracking-widest uppercase ml-1 flex gap-1">
        {label} {required && <span className="text-[#C9A24D]">*</span>}
      </label>
      <div
        className={`w-full bg-[#FBFAF4] border rounded-2xl p-3.5 flex items-center gap-3 focus-within:bg-white focus-within:border-[#7B9824] focus-within:ring-4 focus-within:ring-[#7B9824]/15 transition-all ${
          error ? "border-red-400 ring-4 ring-red-500/10" : "border-[#E4DDC7]"
        }`}
      >
        {icon}
        {children}
      </div>
      {error && <p className="text-[11px] text-red-600 font-medium ml-1">{error}</p>}
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
  const btn = "w-8 h-8 rounded-full bg-white border border-[#E4DDC7] text-[#4B6A0E] hover:bg-[#EAF1D3] hover:border-[#B9CC83] flex items-center justify-center transition-colors";
  return (
    <div className="space-y-2">
      <label className="text-[11px] text-[#6B705C] font-bold tracking-widest uppercase ml-1 flex gap-1">
        {label} <span className="text-[#C9A24D]">*</span>
      </label>
      <div className="w-full bg-[#FBFAF4] border border-[#E4DDC7] rounded-2xl p-2.5 flex justify-between items-center text-[#26301B]">
        <div className="flex items-center gap-3 px-2">
          {icon}
          <span className="text-sm font-bold">{value}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onMinus} className={btn}>
            <Minus className="w-4 h-4" />
          </button>
          <button type="button" onClick={onPlus} className={btn}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
