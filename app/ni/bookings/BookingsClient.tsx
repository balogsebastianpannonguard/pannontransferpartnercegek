"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Building2,
  LogOut,
  UserCircle,
  CalendarPlus,
  Clock,
  Users,
  Luggage,
  CreditCard,
  Building,
  Car,
  User,
  Truck,
  Plane,
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
  DollarSign,
  Phone,
  Minus,
  Plus,
  Bell,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "../../context/LanguageContext";
import NiPremiumLogin from "../components/NiPremiumLogin";

interface NiPortalUser {
  email: string;
  company?: string;
  role?: string;
}

interface Booking {
  _id: string;
  bookingCode: string;
  status: "pending" | "modified" | "confirmed" | "in-progress" | "completed" | "cancelled";
  travelerEmail: string;
  travelerName: string;
  travelerPhone: string;
  secondTravelerEmail?: string;
  secondTravelerPhone?: string;
  companyName: string;
  paymentMethod: "card" | "bank";
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
  driverName?: string;
  vehicleName?: string;
  price?: number;
  createdAt?: number;
}

type FilterTab = "all" | "pending" | "confirmed" | "closed";

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

interface StatusChangeNotification {
  id: string;
  _id: string;
  bookingCode: string;
  travelerName: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: number;
  details?: string;
  dismissed: boolean;
}

interface RawStatusChangeNotification {
  _id: string;
  bookingCode: string;
  travelerName: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: number;
  details?: string;
}

const STATUS_LABELS: Record<Booking["status"], string> = {
  pending: "Függőben",
  modified: "Módosítva",
  confirmed: "Jóváhagyott",
  "in-progress": "Folyamatban",
  completed: "Lezárt",
  cancelled: "Lemondott",
};
const STATUS_LABELS_EN: Record<Booking["status"], string> = {
  pending: "Pending",
  modified: "Modified",
  confirmed: "Confirmed",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<Booking["status"], string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  modified: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  confirmed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  completed: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  cancelled: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const STATUS_DOT: Record<Booking["status"], string> = {
  pending: "bg-amber-400",
  modified: "bg-orange-400",
  confirmed: "bg-emerald-400",
  "in-progress": "bg-blue-400",
  completed: "bg-slate-400",
  cancelled: "bg-rose-400",
};

function playNotificationSound() {
  try {
    const AudioContextCtor =
      window.AudioContext ||
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1320;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.65);
  } catch {}
}

export default function NiBookingsClient() {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const english = language === "en";
  const [scrolled, setScrolled] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authedUser, setAuthedUser] = useState<NiPortalUser | null>(null);
  const [portalBooting, setPortalBooting] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [editModal, setEditModal] = useState<Booking | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const [cancelModal, setCancelModal] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const [statusNotifications, setStatusNotifications] = useState<StatusChangeNotification[]>([]);
  const lastNotifPollTimestamp = useRef<number>(0);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);

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
            setPortalBooting(true);
            window.setTimeout(() => {
              if (active) setPortalBooting(false);
            }, 1500);
          } else {
            setPortalBooting(false);
          }
        }
      } catch {}
      if (active) {
        setPortalBooting(false);
        setAuthChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ni-dismissed-notifications") || "[]");
      if (Array.isArray(stored)) {
        setDismissedNotificationIds(stored.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      // Ignore malformed local notification state and start cleanly.
    }
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/ni-auth/logout", { method: "POST" });
    } catch {}
    setAuthedUser(null);
  };

  const handleLoginSuccess = (user: NiPortalUser) => {
    setAuthedUser(user);
    setPortalBooting(true);
    window.setTimeout(() => {
      setPortalBooting(false);
    }, 1500);
  };

  const fetchBookings = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const res = await fetch("/api/bookings", {
        cache: "no-store",
        headers: { "x-partner-portal": "ni" },
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
    if (!authChecked || !authedUser) return;
    const timer = window.setTimeout(() => {
      void fetchBookings();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [authChecked, authedUser, fetchBookings]);

  useEffect(() => {
    if (!authedUser) return;
    const interval = setInterval(() => {
      fetchBookings(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [authedUser, fetchBookings]);

  useEffect(() => {
    if (!authedUser) return;
    
    const pollNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?lastPollTimestamp=${lastNotifPollTimestamp.current}`, {
          cache: "no-store",
          headers: { "x-partner-portal": "ni" },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.success && json?.statusChanges?.length > 0) {
            playNotificationSound();
            const newNotifs = json.statusChanges.map((sc: RawStatusChangeNotification) => ({
              ...sc,
              id: `${sc._id}-${sc.updatedAt}`,
              dismissed: dismissedNotificationIds.includes(`${sc._id}-${sc.updatedAt}`),
            }));
            setStatusNotifications(prev => {
              const merged = [...newNotifs, ...prev];
              return Array.from(new Map(merged.map((notification) => [notification.id, notification])).values())
                .slice(0, 20);
            });
            setNotificationPanelOpen(true);
            fetchBookings();
          }
          // A small overlap prevents events written during the request from being missed.
          // Notification IDs deduplicate events returned by the overlap.
          lastNotifPollTimestamp.current = Date.now() - 3000;
        }
      } catch {}
    };

    const timer = setInterval(pollNotifications, 10000);
    return () => clearInterval(timer);
  }, [authedUser, fetchBookings, dismissedNotificationIds]);

  const dismissNotification = (id: string) => {
    const next = Array.from(new Set([...dismissedNotificationIds, id])).slice(-100);
    setDismissedNotificationIds(next);
    localStorage.setItem("ni-dismissed-notifications", JSON.stringify(next));
    setStatusNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n));
  };

  const dismissAllNotifications = () => {
    const ids = statusNotifications.map((notification) => notification.id);
    const next = Array.from(new Set([...dismissedNotificationIds, ...ids])).slice(-100);
    setDismissedNotificationIds(next);
    localStorage.setItem("ni-dismissed-notifications", JSON.stringify(next));
    setStatusNotifications(prev => prev.map(n => ({ ...n, dismissed: true })));
    setNotificationPanelOpen(false);
  };

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const openEditModal = (booking: Booking) => {
    setEditModal(booking);
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
    setEditErrors({});
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditLoading(false);
    setEditErrors({});
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setEditLoading(true);
    setEditErrors({});
    try {
      const res = await fetch(`/api/bookings/${editModal._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-partner-portal": "ni",
        },
        body: JSON.stringify(editForm),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        if (json?.errors) {
          const errMap: Record<string, string> = {};
          Object.entries(json.errors as Record<string, string | string[]>).forEach(([k, v]) => {
            errMap[k] = Array.isArray(v) ? v[0] : String(v);
          });
          setEditErrors(errMap);
        } else {
          addToast("error", json?.message || "A módosítás sikertelen.");
        }
        return;
      }
      addToast("success", "Foglalás sikeresen módosítva.");
      closeEditModal();
      fetchBookings();
    } catch {
      addToast("error", "Hálózati hiba történt.");
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
          "x-partner-portal": "ni",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        addToast("error", json?.message || "A lemondás sikertelen.");
        return;
      }
      addToast("success", "Foglalás sikeresen lemondva.");
      setCancelModal(null);
      fetchBookings();
    } catch {
      addToast("error", "Hálózati hiba történt.");
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return b.status === "pending" || b.status === "modified";
    if (activeTab === "confirmed") return b.status === "confirmed" || b.status === "in-progress";
    if (activeTab === "closed") return b.status === "completed" || b.status === "cancelled";
    return true;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending" || b.status === "modified").length,
    confirmed: bookings.filter((b) => b.status === "confirmed" || b.status === "in-progress").length,
    closed: bookings.filter((b) => b.status === "completed" || b.status === "cancelled").length,
  };

  if (!authChecked) {
    return (
      <div className="relative min-h-screen bg-[#030816] text-white flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,92,203,0.36),transparent_30%),radial-gradient(circle_at_78%_18%,rgba(65,182,121,0.2),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(4,38,86,0.72),transparent_50%),linear-gradient(135deg,#020613_0%,#051326_36%,#062043_68%,#071628_100%)]" />
          <div className="absolute left-[-10%] top-[-8%] h-[30rem] w-[30rem] rounded-full bg-[#41B679]/16 blur-[120px]" />
          <div className="absolute right-[-12%] top-[4%] h-[36rem] w-[36rem] rounded-full bg-[#0A5CCB]/22 blur-[140px]" />
          <div className="absolute inset-x-[12%] top-[16%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>
        <div className="w-full border-b border-white/10 bg-[#030816]/70 backdrop-blur-xl relative z-10">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                <Image
                  src="/partners/ni/hero.png"
                  alt="NI"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-bold text-white leading-none">NI Portál</span>
                <span className="text-[11px] text-slate-400 mt-0.5 tracking-wide">
                  Pannon Transfer · Hozzáférés ellenőrzése
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
          <div className="w-full max-w-[440px]">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center py-20 gap-6"
            >
              <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(65,182,121,0.18),transparent_50%)]" />
                <Image
                  src="/partners/ni/hero.png"
                  alt="NI"
                  width={40}
                  height={40}
                  className="relative z-10 h-10 w-10 object-contain"
                />
              </div>
              <div className="text-center">
                <div className="mb-3 flex items-center justify-center gap-4">
                  <span className="font-serif text-xl tracking-[0.24em] text-white/90">
                    EMERSON
                  </span>
                  <span className="h-5 w-px bg-white/20" />
                  <span className="font-sans text-xl font-black tracking-[0.22em] text-[#41B679]">
                    NI
                  </span>
                </div>
                <p className="text-[10px] tracking-[0.42em] uppercase text-slate-500 font-medium">
                  Corporate Mobility Access
                </p>
              </div>
              <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-5 h-5 rounded-full border-2 border-white/20 border-t-[#41B679]"
                />
                <p className="text-[14px] text-slate-300 font-semibold tracking-wide">
                  Hozzáférés és munkamenet ellenőrzése...
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="w-full border-t border-white/10 bg-[#030816]/70 backdrop-blur-xl mt-auto relative z-10">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>© {new Date().getFullYear()} Pannon Transfer · Minden jog fenntartva.</span>
            <span className="tracking-wider">NI Dedikált Ügyfélportál · Kizárólagos linkalapú hozzáférés</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authedUser) {
    return <NiPremiumLogin _onSuccess={handleLoginSuccess} />;
  }

  if (portalBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,92,203,0.36),transparent_28%),radial-gradient(circle_at_78%_16%,rgba(65,182,121,0.24),transparent_22%),radial-gradient(circle_at_50%_60%,rgba(4,38,86,0.78),transparent_48%),linear-gradient(135deg,#01040D_0%,#041229_40%,#062043_68%,#071628_100%)]" />
        <div className="absolute left-[-8%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-[#41B679]/16 blur-[140px]" />
        <div className="absolute right-[-14%] top-[2%] h-[42rem] w-[42rem] rounded-full bg-[#0A5CCB]/22 blur-[160px]" />
        <div className="absolute bottom-[-24%] left-[20%] h-[28rem] w-[40rem] rounded-full bg-[#003E7E]/28 blur-[160px]" />
        <div className="absolute inset-x-[14%] top-[18%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 0.35, 0], scale: [0.75, 1.05, 1.2] }}
          transition={{ duration: 2.2, ease: "easeOut" }}
          className="absolute h-[24rem] w-[24rem] rounded-full border border-[#41B679]/15"
        />
        <motion.div
          initial={{ x: "-120%", opacity: 0 }}
          animate={{ x: "120%", opacity: [0, 0.65, 0] }}
          transition={{ duration: 1.6, delay: 0.15, ease: "easeInOut" }}
          className="absolute top-1/2 h-px w-[36rem] bg-gradient-to-r from-transparent via-[#41B679]/70 to-transparent blur-[1px]"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.65 }}
          transition={{ duration: 2.4, ease: "easeOut" }}
          className="absolute w-[860px] h-[860px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#41B679]/14 via-[#0A5CCB]/10 to-transparent rounded-full blur-[110px] pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#41B679] rounded-full blur-[1px]"
        />
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-[#0A5CCB] rounded-full blur-[2px]"
        />
        <motion.div
          animate={{ x: [-12, 12, -12], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="absolute top-[22%] right-[22%] h-24 w-24 rounded-full border border-white/6"
        />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-10 flex h-48 w-48 items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, ease: "linear", repeat: Infinity }}
              className="absolute inset-0 rounded-full border-[1px] border-white/[0.03] border-t-[#41B679]/60 border-r-[#0A5CCB]/40"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 16, ease: "linear", repeat: Infinity }}
              className="absolute inset-[-16px] rounded-full border-[1px] border-white/[0.02] border-b-[#0A5CCB]/30 border-l-[#41B679]/50"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, ease: "linear", repeat: Infinity }}
              className="absolute inset-[-34px] rounded-full border border-white/[0.02]"
            />
            <div className="absolute inset-4 rounded-full bg-[#03111E]/90 shadow-[inset_0_0_30px_rgba(65,182,121,0.08)] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                className="flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/15 bg-white shadow-[0_0_60px_rgba(10,92,203,0.22)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                <Image
                  src="/partners/ni/hero.png"
                  alt="NI"
                  width={42}
                  height={42}
                  className="relative z-10 h-10 w-10 object-contain"
                />
              </motion.div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-center"
          >
            <div className="mb-4 inline-flex items-center gap-5 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 backdrop-blur-md">
              <span className="font-serif text-2xl tracking-[0.25em] text-white/90">EMERSON</span>
              <span className="w-[1px] h-6 bg-white/20" />
              <span className="font-sans font-black text-2xl tracking-[0.2em] text-[#41B679]">NI</span>
            </div>
            <h2 className="text-[42px] font-semibold tracking-[-0.05em] text-white sm:text-[56px]">
              Executive Mobility Portal
            </h2>
            <p className="mt-4 text-[10px] tracking-[0.4em] uppercase text-slate-500 font-medium">
              NI | Emerson Corporate Transfer Experience
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="mt-14 w-[320px]"
          >
            <div className="h-[3px] w-full bg-white/5 relative overflow-hidden rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.7, ease: [0.7, 0, 0.3, 1], delay: 0.2 }}
                className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-transparent via-[#41B679] to-[#0A5CCB] shadow-[0_0_12px_rgba(65,182,121,0.7)]"
              />
            </div>
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 text-center text-[9px] tracking-[0.3em] text-[#41B679] uppercase font-bold"
            >
              Rendszer előkészítése...
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  return (
    <div className="min-h-screen bg-[#030816] text-slate-300 font-sans selection:bg-[#41B679]/30 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,92,203,0.42),transparent_30%),radial-gradient(circle_at_80%_12%,rgba(65,182,121,0.24),transparent_20%),radial-gradient(circle_at_55%_62%,rgba(6,31,79,0.82),transparent_46%),linear-gradient(135deg,#01050E_0%,#041229_34%,#072447_66%,#071A2F_100%)]" />
        <div className="absolute top-[-10%] left-[-14%] h-[36rem] w-[36rem] rounded-full bg-[#41B679]/20 blur-[130px]" />
        <div className="absolute right-[-12%] top-[2%] h-[40rem] w-[40rem] rounded-full bg-[#0A5CCB]/26 blur-[160px]" />
        <div className="absolute bottom-[-24%] left-[16%] h-[34rem] w-[44rem] rounded-full bg-[#003E7E]/34 blur-[170px]" />
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(4,9,20,0))]" />
        <div className="absolute inset-x-[10%] top-[14%] h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
        <div className="absolute inset-y-0 left-[10%] w-[1px] bg-gradient-to-b from-transparent via-[#41B679]/8 to-transparent" />
      </div>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#020813]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            : "bg-transparent border-b border-white/5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex justify-between items-center">
          <div className="flex items-center gap-5 md:gap-8 h-full">
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-lg md:text-xl tracking-widest text-white leading-none">
                PANNON
              </span>
              <span className="font-serif font-bold text-[10px] md:text-xs tracking-[0.25em] text-[#D4AF37] leading-tight mt-1">
                TRANSFER
              </span>
            </div>
            <div className="w-px h-8 bg-white/20 transform rotate-12"></div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                <Image
                  src="/partners/ni/hero.png"
                  alt="NI"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-lg md:text-xl tracking-tight text-white leading-none flex items-center gap-2">
                  <span className="text-[#41B679]">NI</span>
                  <span className="text-white/50">|</span>
                  Emerson
                </span>
                <span className="text-[10px] font-medium tracking-[0.24em] text-slate-400 uppercase mt-1">
                  NI Corporate Access
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8 h-full">
            <div className="flex items-center gap-8 h-full">
              <Link
                href="/ni#booking"
                className="text-slate-300 text-sm font-medium tracking-[0.12em] uppercase hover:text-white transition-colors h-full flex items-center border-b-2 border-transparent hover:border-[#41B679]/30"
              >
                {t("nav", "booking")}
              </Link>
              <Link
                href="/ni/bookings"
                className="text-white text-sm font-medium tracking-[0.12em] uppercase hover:text-white transition-colors h-full flex items-center border-b-2 border-[#41B679]"
              >
                {english ? "My bookings" : "Saját foglalásaim"}
              </Link>
              {authedUser.role === "admin-ni" && (
                <Link
                  href="/ni/company"
                  className="text-slate-300 text-sm font-medium tracking-[0.12em] uppercase hover:text-white transition-colors h-full flex items-center border-b-2 border-transparent hover:border-[#41B679]/30"
                >
                  {english ? "Company bookings" : "Céges foglalások"}
                </Link>
              )}
            </div>

            <div className="w-px h-5 bg-white/10 mx-2"></div>

            <button
              type="button"
              onClick={() => setNotificationPanelOpen((open) => !open)}
              aria-label="Értesítések megnyitása"
              className="relative w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <Bell className={`mx-auto h-4 w-4 ${statusNotifications.some((notification) => !notification.dismissed) ? "animate-bounce text-[#41B679]" : ""}`} />
              {statusNotifications.filter((notification) => !notification.dismissed).length > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-[#020813]">
                  {Math.min(statusNotifications.filter((notification) => !notification.dismissed).length, 99)}
                </span>
              )}
            </button>

            <div className="flex items-center gap-1">
              {availableLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-[11px] font-bold tracking-wider transition-all duration-200 ${
                    language === lang
                      ? "bg-[#41B679] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-white/10 mx-2"></div>

            <div className="flex items-center gap-3 pl-2">
              <div className="hidden xl:flex flex-col items-end">
                <span className="text-[12px] font-semibold text-white leading-none truncate max-w-[180px]">
                  {authedUser.email}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003E7E] to-[#41B679] flex items-center justify-center shadow-[0_0_20px_rgba(65,182,121,0.28)] shrink-0 ring-1 ring-white/10">
                <UserCircle className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={handleLogout}
                title={english ? "Log out" : "Kijelentkezés"}
                className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {notificationPanelOpen && statusNotifications.filter(n => !n.dismissed).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-20 left-0 right-0 z-40 px-6 pt-4"
          >
            <div className="max-w-[1280px] mx-auto">
              <div className="bg-[#0B1221]/95 backdrop-blur-xl rounded-2xl border border-[#41B679]/25 shadow-[0_8px_32px_rgba(65,182,121,0.14)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#41B679]/15 bg-gradient-to-r from-[#41B679]/10 to-[#0A5CCB]/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#41B679] animate-pulse" />
                    <span className="text-sm font-bold text-white">Értesítések</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#41B679]/20 text-[#41B679] text-[10px] font-black">
                      {statusNotifications.filter(n => !n.dismissed).length}
                    </span>
                  </div>
                  <button
                    onClick={dismissAllNotifications}
                    className="text-[11px] font-bold text-slate-400 hover:text-white transition px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    Összes elvetése
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
                  {statusNotifications.filter(n => !n.dismissed).map((notif) => {
                    const statusMessages: Record<string, { message: string; accent: string; bg: string }> = {
                      confirmed: { message: "A foglalása jóváhagyásra került!", accent: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
                      modified: { message: "A diszpécser módosítást kér a foglalásán", accent: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
                      cancelled: { message: "A foglalása lemondásra került", accent: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30" },
                      "in-progress": { message: "A foglalása folyamatban van", accent: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
                      completed: { message: "A foglalása befejeződött", accent: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30" },
                    };
                    const meta = statusMessages[notif.newStatus] || { message: `Státusz: ${notif.newStatus}`, accent: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30" };
                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setExpandedId(notif._id);
                          dismissNotification(notif.id);
                          setNotificationPanelOpen(false);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            setExpandedId(notif._id);
                            dismissNotification(notif.id);
                            setNotificationPanelOpen(false);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition cursor-pointer"
                      >
                        <div className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${meta.bg}`}>
                          {notif.newStatus === "confirmed" ? <CheckCircle2 className={`w-5 h-5 ${meta.accent}`} /> :
                           notif.newStatus === "modified" ? <Edit3 className={`w-5 h-5 ${meta.accent}`} /> :
                           notif.newStatus === "cancelled" ? <Ban className={`w-5 h-5 ${meta.accent}`} /> :
                           <Clock className={`w-5 h-5 ${meta.accent}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${meta.accent} mb-1`}>{meta.message}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black text-white bg-white/10 px-2 py-0.5 rounded">#{notif.bookingCode}</span>
                            <span className="text-[11px] text-slate-400">{notif.travelerName}</span>
                            <span className="text-[10px] text-slate-500">
                              {STATUS_LABELS[notif.oldStatus as Booking["status"]] || notif.oldStatus} → {STATUS_LABELS[notif.newStatus as Booking["status"]] || notif.newStatus}
                            </span>
                          </div>
                          {notif.details && <p className="text-[11px] text-slate-500 mt-1">{notif.details}</p>}
                        </div>
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="shrink-0 w-7 h-7 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative pt-32 pb-24 px-6 min-h-screen flex items-start justify-center z-10">
        <div className="max-w-[1280px] mx-auto w-full">
          <div className="mb-10">
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(135deg,rgba(65,182,121,0.08),rgba(11,18,33,0.95)_35%,rgba(10,92,203,0.14))] px-5 py-6 md:px-7 md:py-7 shadow-[0_20px_70px_rgba(10,92,203,0.12)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#41B679]/10 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#41B679]/70 to-transparent" />
              <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.05] border border-white/10 mb-6"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#41B679]" />
              <span className="text-[10px] font-bold text-[#41B679] tracking-widest uppercase">
                {english ? "Booking manager" : "Foglalás Kezelő"}
              </span>
              {isRefreshing && (
                <RefreshCw className="w-3 h-3 text-[#41B679] animate-spin ml-1" />
              )}
            </motion.div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3"
                >
                  {english ? "My bookings" : "Saját foglalásaim"}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-400 text-sm md:text-base"
                >
                  {english ? "Real-time status and details" : "Valós idejű státusz és részletek"}
                </motion.p>
              </div>
              <motion.div className="flex items-center gap-3">
                <button
                  onClick={() => fetchBookings(true)}
                  className="h-10 px-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all inline-flex items-center gap-2 text-sm font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {english ? "Refresh" : "Frissítés"}
                </button>
                <Link
                  href="/ni"
                  className="h-10 px-4 rounded-lg bg-[#41B679] hover:bg-[#10B981] text-white font-semibold text-sm tracking-wide transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(65,182,121,0.28)]"
                >
                  <Plus className="w-4 h-4" />
                  {english ? "New booking" : "Új foglalás"}
                </Link>
              </motion.div>
            </div>
              </div>
            </div>
          </div>

          {bookings.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <motion.div
              variants={fadeIn}
              className="bg-[#0B1221]/92 rounded-2xl border border-white/8 p-5 relative overflow-hidden group hover:border-[#41B679]/20 transition-colors backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#41B679]/15 via-transparent to-transparent blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1">
                  {english ? "Total bookings" : "Összes foglalás"}
                </p>
                <p className="text-3xl font-black text-white tracking-tight">{stats.total}</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-[#0B1221]/92 rounded-2xl border border-white/8 p-5 relative overflow-hidden group hover:border-[#41B679]/20 transition-colors backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#41B679]/12 via-transparent to-transparent blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold tracking-wider uppercase border border-amber-500/30">
                    {english ? "Pending" : "Függőben"}
                  </span>
                </div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1">
                  {english ? "Processing" : "Feldolgozás alatt"}
                </p>
                <p className="text-3xl font-black text-white tracking-tight">{stats.pending}</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-[#0B1221]/92 rounded-2xl border border-white/8 p-5 relative overflow-hidden group hover:border-[#41B679]/25 transition-colors backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30">
                    {english ? "Active" : "Aktív"}
                  </span>
                </div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1">
                  {english ? "Confirmed" : "Jóváhagyott"}
                </p>
                <p className="text-3xl font-black text-white tracking-tight">{stats.confirmed}</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="bg-[#0B1221]/92 rounded-2xl border border-white/8 p-5 relative overflow-hidden group hover:border-[#0A5CCB]/25 transition-colors backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-500/15 via-transparent to-transparent blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/15 text-slate-400 text-[10px] font-bold tracking-wider uppercase border border-slate-500/30">
                    {english ? "Closed" : "Lezárt"}
                  </span>
                </div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1">
                  {english ? "Completed" : "Befejezett"}
                </p>
                <p className="text-3xl font-black text-white tracking-tight">{stats.closed}</p>
              </div>
            </motion.div>
          </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#0B1221]/92 border border-white/8 backdrop-blur-xl">
              {([
                { key: "all", label: english ? "All" : "Minden" },
                { key: "pending", label: english ? "Pending" : "Függőben" },
                { key: "confirmed", label: english ? "Confirmed" : "Jóváhagyott" },
                { key: "closed", label: english ? "Closed" : "Lezárt" },
              ] as { key: FilterTab; label: string }[]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all ${
                    activeTab === tab.key
                      ? "bg-white/[0.06] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#41B679]/10 border border-[#41B679]/20 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#41B679] animate-spin" />
              </div>
              <p className="text-sm text-slate-400 font-medium">{english ? "Loading bookings..." : "Foglalások betöltése..."}</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0B1221]/92 rounded-[28px] border border-white/8 p-16 text-center relative overflow-hidden backdrop-blur-xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#41B679]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
              <div className="relative flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <CalendarPlus className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{english ? "No bookings yet" : "Még nincs foglalása"}</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-sm">
                  Nincs még foglalás a kiválasztott szűrésnél. Menjen a foglalási oldalra és hozzon létre egy új átutalást.
                </p>
                <Link
                  href="/ni"
                  className="h-11 px-6 rounded-xl bg-[#41B679] hover:bg-[#10B981] text-white font-semibold text-sm tracking-wide transition-all inline-flex items-center gap-2 shadow-[0_0_20px_rgba(65,182,121,0.28)]"
                >
                  {english ? "Go to booking page" : "Menjen a foglalási oldalra"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.3 } },
              }}
              className="space-y-4"
            >
              {filteredBookings.map((booking) => {
                const isExpanded = expandedId === booking._id;
                const canModify = booking.status !== "cancelled" && booking.status !== "completed";
                return (
                  <motion.div
                    key={booking._id}
                    variants={fadeIn}
                    className="bg-[#0B1221]/92 rounded-[26px] border border-white/8 overflow-hidden hover:border-[#41B679]/18 transition-colors backdrop-blur-xl"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
                        <div className="flex-1 lg:max-w-[320px] flex flex-col gap-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-br from-[#003E7E]/40 to-[#41B679]/15 border border-[#41B679]/20 text-[11px] font-black tracking-wider text-white tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#41B679]" />
                              #{booking.bookingCode}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-wide ${
                                STATUS_COLORS[booking.status]
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[booking.status]}`}
                              />
                              {(english ? STATUS_LABELS_EN : STATUS_LABELS)[booking.status]}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <CalendarDays className="w-4 h-4 text-[#41B679] shrink-0" />
                              <p className="text-2xl font-black text-white tracking-tight">
                                {booking.pickupDate}
                              </p>
                              <span className="text-lg font-bold text-slate-400">
                                {booking.pickupTime}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center pt-1">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                              <div className="w-px h-10 bg-gradient-to-b from-emerald-400/60 to-rose-400/60" />
                              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-0.5">
                                  Honnan
                                </p>
                                <p className="text-sm font-semibold text-white truncate">
                                  {booking.fromAddress}
                                </p>
                                {booking.flightNumber && (
                                  <p className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#41B679]/10 border border-[#41B679]/30 text-[#41B679] text-[10px] font-black tracking-wider uppercase">
                                    Flight Number / Járatszám: <span className="font-mono">{booking.flightNumber}</span>
                                  </p>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-0.5">
                                  Hova
                                </p>
                                <p className="text-sm font-semibold text-white truncate">
                                  {booking.toAddress}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden lg:block w-px bg-white/5 shrink-0" />

                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Car className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                Típus
                              </span>
                            </div>
                            <p
                              className={`text-sm font-bold ${
                                booking.transferType === "executive"
                                  ? "text-[#41B679]"
                                  : "text-white"
                              }`}
                            >
                              {booking.transferType === "executive" ? "Executive" : "Standard"}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                Utasok
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white">
                              {booking.travelers} fő
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Luggage className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                Csomag
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white">
                              {booking.luggage} db
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              {booking.paymentMethod === "card" ? (
                                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                              ) : (
                                <Building className="w-3.5 h-3.5 text-slate-500" />
                              )}
                              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                Fizetés
                              </span>
                            </div>
                            <p className="text-sm font-bold text-white">
                              {booking.paymentMethod === "card" ? "Bankkártya" : "Banki átutalás"}
                            </p>
                          </div>

                          <div className="space-y-1 col-span-2 md:col-span-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Truck className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                Sofőr & Jármű
                              </span>
                            </div>
                            {booking.driverName || booking.vehicleName ? (
                              <p className="text-sm font-bold text-white">
                                {booking.driverName}
                                {booking.vehicleName && (
                                  <span className="text-slate-400 font-medium ml-2">
                                  · {booking.vehicleName}
                                  </span>
                                )}
                              </p>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400 text-[11px] font-medium">
                                <Clock className="w-3 h-3" />
                                Hozzárendelés függőben
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="hidden lg:block w-px bg-white/5 shrink-0" />

                        <div className="flex lg:flex-col items-stretch lg:items-end gap-2 lg:min-w-[140px]">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : booking._id)}
                            className="flex-1 lg:flex-none h-10 px-4 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all inline-flex items-center justify-center gap-1.5 text-sm font-medium"
                          >
                            Részletek
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          {canModify && (
                            <>
                              <button
                                onClick={() => openEditModal(booking)}
                                className="flex-1 lg:flex-none h-10 px-4 rounded-lg bg-[#41B679]/15 border border-[#41B679]/30 text-[#41B679] hover:bg-[#41B679]/25 hover:border-[#41B679]/50 transition-all inline-flex items-center justify-center gap-1.5 text-sm font-bold"
                              >
                                <Edit3 className="w-4 h-4" />
                                Módosítás
                              </button>
                              <button
                                onClick={() => setCancelModal(booking)}
                                className="flex-1 lg:flex-none h-10 px-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/40 transition-all inline-flex items-center justify-center gap-1.5 text-sm font-bold"
                              >
                                <Ban className="w-4 h-4" />
                                Lemondás
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
                          <div className="border-t border-slate-800 px-6 py-5 bg-slate-900/40">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">
                                  Utas adatai
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span className="text-sm font-semibold text-white">
                                      {booking.travelerName}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <UserCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span className="text-sm text-slate-300">
                                      {booking.travelerEmail}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span className="text-sm text-slate-300">
                                      {booking.travelerPhone}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">
                                  Cég
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                    <span className="text-sm font-semibold text-white">
                                      {booking.companyName}
                                    </span>
                                  </div>
                                  {booking.price !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span className="text-sm font-bold text-[#41B679]">
                                        {booking.price.toLocaleString("hu-HU")} Ft
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">
                                  Megjegyzés
                                </p>
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                  <span className="text-sm text-slate-300">
                                    {booking.comment || (
                                      <span className="text-slate-500 italic">
                                        Nincs megjegyzés
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>

                              {booking.secondTravelerEmail && (
                                <div>
                                  <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">
                                    2. Utas
                                  </p>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <UserCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span className="text-sm text-slate-300">
                                        {booking.secondTravelerEmail}
                                      </span>
                                    </div>
                                    {booking.secondTravelerPhone && (
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <span className="text-sm text-slate-300">
                                          {booking.secondTravelerPhone}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
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
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#030816]/80 py-10 px-6 z-10 relative backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col text-center md:text-left">
              <span className="font-serif font-bold tracking-widest text-slate-400 text-sm leading-none">
                PANNON <span className="text-[#41B679]/80">TRANSFER</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium tracking-[0.2em] mt-1">
                NI CORPORATE TRAVEL
              </span>
            </div>
            <div className="hidden md:block w-px h-6 bg-white/10"></div>
            <div className="flex flex-col text-center md:text-left">
              <span className="font-bold text-white tracking-wide text-sm leading-none flex items-center gap-2">
                NI <span className="text-xs font-normal text-slate-400">{t("footer", "portal")}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-slate-500">Dedikált ügyfélszolgálat</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeEditModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-[#0B1221]/96 rounded-2xl border border-white/8 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden max-h-[90vh] overflow-y-auto backdrop-blur-xl"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#41B679] to-[#0A5CCB]" />
              <div className="sticky top-0 z-10 bg-[#0B1221]/95 border-b border-white/8 px-6 py-4 flex items-center justify-between backdrop-blur-xl">
                <div>
                  <h3 className="text-lg font-bold text-white">Foglalás módosítása</h3>
                  <p className="text-xs text-slate-400 mt-0.5">#{editModal.bookingCode}</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Dátum <span className="text-[#41B679]">*</span>
                    </label>
                    <div
                      className={`w-full bg-[#151E32] border rounded-lg p-3.5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all ${
                        editErrors.pickupDate
                          ? "border-rose-500/50 ring-1 ring-rose-500/20"
                          : "border-slate-700/50"
                      }`}
                    >
                      <input
                        type="date"
                        value={editForm.pickupDate}
                        onChange={(e) =>
                          setEditForm({ ...editForm, pickupDate: e.target.value })
                        }
                        className="bg-transparent border-none outline-none w-full text-sm font-medium text-white [color-scheme:dark]"
                      />
                    </div>
                    {editErrors.pickupDate && (
                      <p className="text-[11px] text-rose-400 font-medium">
                        {editErrors.pickupDate}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Időpont <span className="text-[#41B679]">*</span>
                    </label>
                    <div
                      className={`w-full bg-[#151E32] border rounded-lg p-3.5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all ${
                        editErrors.pickupTime
                          ? "border-rose-500/50 ring-1 ring-rose-500/20"
                          : "border-slate-700/50"
                      }`}
                    >
                      <input
                        type="time"
                        value={editForm.pickupTime}
                        onChange={(e) =>
                          setEditForm({ ...editForm, pickupTime: e.target.value })
                        }
                        className="bg-transparent border-none outline-none w-full text-sm font-medium text-white [color-scheme:dark]"
                      />
                    </div>
                    {editErrors.pickupTime && (
                      <p className="text-[11px] text-rose-400 font-medium">
                        {editErrors.pickupTime}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                    Indulási cím <span className="text-[#41B679]">*</span>
                  </label>
                  <div
                    className={`w-full bg-[#151E32] border rounded-lg p-3.5 flex items-center gap-3 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all ${
                      editErrors.fromAddress
                        ? "border-rose-500/50 ring-1 ring-rose-500/20"
                        : "border-slate-700/50"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={editForm.fromAddress}
                      onChange={(e) =>
                        setEditForm({ ...editForm, fromAddress: e.target.value })
                      }
                      className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                    />
                  </div>
                  {editErrors.fromAddress && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      {editErrors.fromAddress}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                    Célcím <span className="text-[#41B679]">*</span>
                  </label>
                  <div
                    className={`w-full bg-[#151E32] border rounded-lg p-3.5 flex items-center gap-3 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all ${
                      editErrors.toAddress
                        ? "border-rose-500/50 ring-1 ring-rose-500/20"
                        : "border-slate-700/50"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={editForm.toAddress}
                      onChange={(e) =>
                        setEditForm({ ...editForm, toAddress: e.target.value })
                      }
                      className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                    />
                  </div>
                  {editErrors.toAddress && (
                    <p className="text-[11px] text-rose-400 font-medium">
                      {editErrors.toAddress}
                    </p>
                  )}
                </div>

                {(editModal.toType === "airport" || editModal.fromType === "airport") && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Flight Number / Járatszám <span className="text-[#41B679]">*</span>
                    </label>
                    <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-3.5 flex items-center gap-3 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                      <Plane className="w-4 h-4 text-slate-500 shrink-0" />
                      <input
                        type="text"
                        value={editForm.flightNumber}
                        onChange={(e) => setEditForm({ ...editForm, flightNumber: e.target.value.toUpperCase() })}
                        className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white"
                        placeholder="pl. LH1234"
                      />
                    </div>
                    {editErrors.flightNumber && (
                      <p className="text-[11px] text-rose-400 font-medium">{editErrors.flightNumber}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Utasok száma <span className="text-[#41B679]">*</span>
                    </label>
                    <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-2.5 flex justify-between items-center text-white">
                      <div className="flex items-center gap-3 px-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold">{editForm.travelers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              travelers: Math.max(1, editForm.travelers - 1),
                            })
                          }
                          className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              travelers: editForm.travelers + 1,
                            })
                          }
                          className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1 flex gap-1">
                      Csomagok száma <span className="text-[#41B679]">*</span>
                    </label>
                    <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-2.5 flex justify-between items-center text-white">
                      <div className="flex items-center gap-3 px-2">
                        <Luggage className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold">{editForm.luggage}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              luggage: Math.max(0, editForm.luggage - 1),
                            })
                          }
                          className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditForm({
                              ...editForm,
                              luggage: editForm.luggage + 1,
                            })
                          }
                          className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 font-bold tracking-widest uppercase ml-1">
                    Megjegyzés
                  </label>
                  <div className="w-full bg-[#151E32] border border-slate-700/50 rounded-lg p-3.5 focus-within:border-[#41B679] focus-within:ring-1 focus-within:ring-[#41B679]/30 transition-all">
                    <textarea
                      rows={3}
                      value={editForm.comment}
                      onChange={(e) =>
                        setEditForm({ ...editForm, comment: e.target.value })
                      }
                      placeholder="Speciális kérések vagy utasítások..."
                      className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-slate-600 text-white resize-none"
                    />
                  </div>
                </div>

                {Object.keys(editErrors).length > 0 &&
                  !editErrors.pickupDate &&
                  !editErrors.pickupTime &&
                  !editErrors.fromAddress &&
                  !editErrors.toAddress && (
                    <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <p className="text-[12px] text-rose-400 font-medium">
                        Kérjük, javítsa a fenti hibákat.
                      </p>
                    </div>
                  )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-semibold text-sm"
                  >
                    Mégse
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-[2] h-11 rounded-lg bg-[#41B679] hover:bg-[#10B981] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(65,182,121,0.28)]"
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mentés...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Módosítások mentése
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
              className="relative w-full max-w-md bg-[#0B1221] rounded-2xl border border-slate-800 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden"
            >
              <div className="p-7">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-5">
                    <AlertTriangle className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Biztosan lemondja ezt a foglalást?
                  </h3>
                  <p className="text-sm text-slate-400">
                    #{cancelModal.bookingCode} · {cancelModal.pickupDate} {cancelModal.pickupTime}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center mb-3">
                      <DollarSign className="w-4 h-4 text-rose-400" />
                    </div>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1">
                      Visszatérítés
                    </p>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      Nincs pénzvisszatérítés lehetősége a lemondás után
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center mb-3">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-1">
                      Sofőr
                    </p>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                      A hozzárendelt sofőr automatikusan visszavonásra kerül
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelModal(null)}
                    disabled={cancelLoading}
                    className="flex-1 h-11 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-semibold text-sm disabled:opacity-50"
                  >
                    Mégse
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelConfirm}
                    disabled={cancelLoading}
                    className="flex-1 h-11 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wide transition-all inline-flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
                  >
                    {cancelLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Feldolgozás...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Lemondás
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
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-xl ${
                toast.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-rose-500/10 border-rose-500/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  toast.type === "success"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
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
