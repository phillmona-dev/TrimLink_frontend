"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CalendarDays, Star, Heart, User, Settings,
  MapPin, Clock, ChevronRight, ArrowLeft, Bell, Gift,
  CheckCircle2, XCircle, RotateCcw, Crown, Flame, Shield, Zap, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlowAuthGuard from "@/components/glow/auth-guard";
import { useGlowAuthStore } from "@/lib/glow-auth-store";
import { glowBookingApi, AppointmentResponse } from "@/lib/glow-api";

// ── Mock Data ─────────────────────────────────────────────────────────────────
const USER = {
  name: "Tigist Alemayehu", email: "tigist@example.com",
  phone: "+251 91 234 5678", tier: "GOLD", points: 2_450, totalBookings: 18,
  avatar: "TA",
};

const SAVED = [
  { id: "1", name: "Lumiere Beauty Lounge", category: "Hair & Makeup", location: "Bole", rating: 4.9, gradient: "from-rose-800 to-purple-900" },
  { id: "3", name: "The Glow Spa", category: "Spa & Skincare", location: "Sarbet", rating: 5.0, gradient: "from-purple-800 to-indigo-900" },
];

const TIER_INFO = {
  BRONZE:   { color: "#CD7F32", glow: "rgba(205,127,50,0.4)",  bg: "rgba(205,127,50,0.12)",  grad: "linear-gradient(135deg,#CD7F32,#A0522D)", next: "SILVER",   needed: 500  },
  SILVER:   { color: "#C0C0C0", glow: "rgba(192,192,192,0.4)", bg: "rgba(192,192,192,0.12)", grad: "linear-gradient(135deg,#C0C0C0,#909090)", next: "GOLD",     needed: 1000 },
  GOLD:     { color: "#FFD700", glow: "rgba(255,215,0,0.5)",   bg: "rgba(255,215,0,0.12)",   grad: "linear-gradient(135deg,#FFD700,#C8956C)", next: "PLATINUM", needed: 2000 },
  PLATINUM: { color: "#E5E4E2", glow: "rgba(229,228,226,0.4)", bg: "rgba(229,228,226,0.1)",  grad: "linear-gradient(135deg,#E5E4E2,#A8A9AD)", next: null,      needed: 0    },
};

const POINTS_HISTORY = [
  { desc: "Silk Press & Style at Lumiere", points: +85, date: "May 8" },
  { desc: "Ombré Gel Nails at Saba Nails", points: +45, date: "May 1" },
  { desc: "Redeemed for 50 ETB discount", points: -500, date: "Apr 25" },
  { desc: "Deep Tissue Massage", points: +90, date: "Apr 30" },
];

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = {
    upcoming: { color: "#C8956C", bg: "rgba(200,149,108,0.12)", icon: <Clock className="h-3 w-3" />, label: "Upcoming" },
    completed: { color: "#7CB99A", bg: "rgba(124,185,154,0.12)", icon: <CheckCircle2 className="h-3 w-3" />, label: "Completed" },
    cancelled: { color: "#f87171", bg: "rgba(248,113,113,0.12)", icon: <XCircle className="h-3 w-3" />, label: "Cancelled" },
  }[status] ?? { color: "#fff", bg: "rgba(255,255,255,0.1)", icon: null, label: status };
  return (
    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

// ── Bookings Tab ──────────────────────────────────────────────────────────────
function BookingsTab({ bookings, loading, onCancel, onReschedule }: { bookings: AppointmentResponse[], loading: boolean, onCancel: (id: string) => void, onReschedule: (shopId: string) => void }) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");
  
  const mapStatusFilter = (s: string) => {
    if (s === "PENDING" || s === "CONFIRMED" || s === "IN_PROGRESS") return "upcoming";
    if (s === "COMPLETED") return "completed";
    return "cancelled";
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => mapStatusFilter(b.status) === filter);

  if (loading) {
    return <div className="text-center py-10 text-white/50 animate-pulse text-sm">Loading bookings...</div>;
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {(["all", "upcoming", "completed", "cancelled"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
            style={{ background: filter === f ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "rgba(253,246,238,0.05)", color: filter === f ? "#1A0F1E" : "rgba(253,246,238,0.5)", border: `1px solid ${filter === f ? "transparent" : "rgba(200,149,108,0.15)"}` }}>
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-white/10" />
              <p className="text-sm text-white/40">No {filter !== "all" ? filter : ""} bookings found</p>
            </div>
          )}
          {filtered.map((b, i) => {
            const startDate = new Date(b.scheduledStart);
            const dateStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const timeStr = startDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            const isUpcoming = mapStatusFilter(b.status) === "upcoming";

            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.07 }}
                className="p-4 rounded-2xl" style={{ background: "rgba(253,246,238,0.04)", border: "1px solid rgba(200,149,108,0.12)" }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-white text-sm">{b.serviceName}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#C8956C" }}>{b.shopName}</p>
                  </div>
                  <StatusBadge status={isUpcoming ? "upcoming" : (b.status === "COMPLETED" ? "completed" : "cancelled")} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs mb-3" style={{ color: "rgba(253,246,238,0.45)" }}>
                  <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{dateStr}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeStr}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{b.barberName}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[rgba(200,149,108,0.1)]">
                  <span className="font-black text-sm" style={{ color: "#C8956C" }}>{b.priceCharged?.toLocaleString()} ETB</span>
                  {isUpcoming && (
                    <div className="flex gap-2">
                      <button onClick={() => onReschedule(b.shopName)} className="px-3 py-1.5 rounded-xl text-xs font-bold glass border border-[rgba(200,149,108,0.2)] text-white/60 hover:text-white transition-all flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" /> Reschedule
                      </button>
                      <button onClick={() => onCancel(b.id)} className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all">
                        Cancel
                      </button>
                    </div>
                  )}
                  {b.status === "COMPLETED" && (
                    <Link href="/glow/search" className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      style={{ background: "rgba(200,149,108,0.1)", color: "#C8956C", border: "1px solid rgba(200,149,108,0.2)" }}>
                      <Star className="h-3 w-3" /> Rate
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Loyalty Tab ───────────────────────────────────────────────────────────────
function LoyaltyTab() {
  const tier = TIER_INFO[USER.tier as keyof typeof TIER_INFO];
  const progressPct = USER.tier === "PLATINUM" ? 100 : Math.min((USER.points / (USER.points + tier.needed)) * 100, 100);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative rounded-3xl overflow-hidden p-6 text-center"
        style={{ background: "linear-gradient(135deg,rgba(200,149,108,0.2),rgba(200,100,150,0.15))", border: "1px solid rgba(200,149,108,0.3)" }}>
        <Crown className="h-8 w-8 mx-auto mb-2" style={{ color: tier.color }} />
        <p className="text-xs uppercase tracking-[0.4em] font-bold mb-1" style={{ color: "rgba(253,246,238,0.5)" }}>{USER.tier} MEMBER</p>
        <p className="text-5xl font-black font-editorial mb-1" style={{ color: "#C8956C" }}>{USER.points.toLocaleString()}</p>
        <p className="text-sm" style={{ color: "rgba(253,246,238,0.5)" }}>GlowPoints</p>
        {tier.next && (
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(253,246,238,0.45)" }}>
              <span>{USER.tier}</span>
              <span>{tier.needed} pts to {tier.next}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(200,149,108,0.2)" }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#C8956C,#E8B4A0)" }} />
            </div>
          </div>
        )}
      </div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(253,246,238,0.03)", border: "1px solid rgba(200,149,108,0.12)" }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(200,149,108,0.6)" }}>Your Benefits</p>
        {[
          { icon: <Gift className="h-4 w-4" />, text: "Earn 10 points per 100 ETB spent" },
          { icon: <Flame className="h-4 w-4" />, text: "Double points on your birthday month" },
          { icon: <Shield className="h-4 w-4" />, text: "Priority booking for Gold members" },
          { icon: <Star className="h-4 w-4" />, text: "Exclusive Gold-only salon offers" },
        ].map((b, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0 border-[rgba(200,149,108,0.08)]">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,149,108,0.12)", color: "#C8956C" }}>{b.icon}</div>
            <p className="text-sm" style={{ color: "rgba(253,246,238,0.7)" }}>{b.text}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-4" style={{ background: "rgba(253,246,238,0.03)", border: "1px solid rgba(200,149,108,0.12)" }}>
        <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(200,149,108,0.6)" }}>Points History</p>
        {POINTS_HISTORY.map((h, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b last:border-0 border-[rgba(200,149,108,0.08)]">
            <div>
              <p className="text-sm text-white">{h.desc}</p>
              <p className="text-xs" style={{ color: "rgba(253,246,238,0.35)" }}>{h.date}</p>
            </div>
            <span className={`font-black text-sm ${h.points > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {h.points > 0 ? "+" : ""}{h.points}
            </span>
          </div>
        ))}
      </div>
      <button onClick={() => alert('Points redemption will be available soon! Keep earning GlowPoints.')}
        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E]"
        style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 25px rgba(200,149,108,0.3)" }}>
        Redeem Points
      </button>
    </div>
  );
}

// ── Saved Tab ─────────────────────────────────────────────────────────────────
function SavedTab() {
  return (
    <div className="flex flex-col gap-3">
      {SAVED.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: "rgba(253,246,238,0.04)", border: "1px solid rgba(200,149,108,0.12)" }}>
          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shrink-0`}>
            <Sparkles className="h-6 w-6 text-white/40" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm">{s.name}</p>
            <p className="text-xs mt-0.5" style={{ color: "#C8956C" }}>{s.category}</p>
            <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: "rgba(253,246,238,0.4)" }}>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{s.rating}</span>
            </div>
          </div>
          <Link href={`/glow/salons/${s.id}`}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            style={{ background: "rgba(200,149,108,0.1)", color: "#C8956C", border: "1px solid rgba(200,149,108,0.2)" }}>
            Book <ChevronRight className="h-3 w-3" />
          </Link>
        </motion.div>
      ))}
      {SAVED.length === 0 && (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto mb-3 text-white/10" />
          <p className="text-sm" style={{ color: "rgba(253,246,238,0.4)" }}>No saved salons yet</p>
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
  const [name, setName] = useState(USER.name);
  const [phone, setPhone] = useState(USER.phone);
  const [hairType, setHairType] = useState("Natural Curly");
  const [skinType, setSkinType] = useState("Combination");
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center py-4">
        <div className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-black text-white mb-3"
          style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 30px rgba(200,149,108,0.4)" }}>
          {USER.avatar}
        </div>
        <p className="text-sm font-bold text-white">{USER.name}</p>
        <p className="text-xs" style={{ color: "rgba(200,149,108,0.7)" }}>{USER.tier} Member · {USER.totalBookings} bookings</p>
      </div>
      <div className="flex flex-col gap-3">
        {[
          { label: "Full Name", value: name, onChange: setName },
          { label: "Phone", value: phone, onChange: setPhone },
        ].map(f => (
          <div key={f.label}>
            <p className="text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "rgba(200,149,108,0.6)" }}>{f.label}</p>
            <input value={f.value} onChange={e => f.onChange(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl text-sm text-white focus:outline-none transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)" }}
              onFocus={e => e.currentTarget.style.border = "1.5px solid rgba(200,149,108,0.5)"}
              onBlur={e => e.currentTarget.style.border = "1px solid rgba(200,149,108,0.15)"} />
          </div>
        ))}
        <div className="pt-2">
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "rgba(200,149,108,0.6)" }}>Beauty Profile</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Hair Type", value: hairType, onChange: setHairType, options: ["Natural Curly", "Straight", "Wavy", "Coily", "Fine"] },
              { label: "Skin Type", value: skinType, onChange: setSkinType, options: ["Combination", "Oily", "Dry", "Normal", "Sensitive"] },
            ].map(sel => (
              <div key={sel.label}>
                <p className="text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: "rgba(253,246,238,0.4)" }}>{sel.label}</p>
                <select value={sel.value} onChange={e => sel.onChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl text-sm text-white focus:outline-none appearance-none"
                  style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)" }}>
                  {sel.options.map(o => <option key={o} value={o} style={{ background: "#1A0F1E" }}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSave}
          className="w-full mt-2 h-13 py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
          style={{ background: saved ? "rgba(124,185,154,0.3)" : "linear-gradient(135deg,#C8956C,#E8B4A0)", color: saved ? "#7CB99A" : "#1A0F1E", border: saved ? "1px solid #7CB99A" : "none" }}>
          {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "loyalty" | "saved" | "profile">("bookings");
  const { user } = useGlowAuthStore();
  const [bookings, setBookings] = useState<AppointmentResponse[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    glowBookingApi.getMyAppointments()
      .then(res => setBookings(res.content || []))
      .catch(console.error)
      .finally(() => setLoadingBookings(false));
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await glowBookingApi.cancelAppointment(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "CANCELLED" } : b));
    } catch (e) {
      console.error(e);
      alert("Failed to cancel appointment");
    }
  };

  const displayName = user?.firstName || user?.username || USER.name.split(" ")[0];
  const initials = user ? `${(user.firstName || "G")[0]}${(user.lastName || "L")[0]}`.toUpperCase() : USER.avatar;
  const upcomingCount = bookings.filter(b => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)).length;

  const tabs = [
    { id: "bookings", icon: <CalendarDays className="h-5 w-5" />, label: "Bookings", count: upcomingCount },
    { id: "loyalty", icon: <Star className="h-5 w-5" />, label: "Loyalty" },
    { id: "saved", icon: <Heart className="h-5 w-5" />, label: "Saved", count: SAVED.length },
    { id: "profile", icon: <User className="h-5 w-5" />, label: "Profile" },
  ] as const;

  return (
    <GlowAuthGuard requireRole={["CUSTOMER", "ADMIN"]}>
    <div className="min-h-screen" style={{ background: "transparent" }}>
      <header className="sticky top-0 z-50"
        style={{ background: "rgba(15,8,24,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(200,149,108,0.1)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/glow/discover"
              className="p-2 rounded-xl transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.6)" }}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-base font-black text-white leading-none font-editorial">
                Hi, {displayName} <span style={{ color: "#C8956C" }}>✦</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-full"
                  style={{ background: TIER_INFO[USER.tier as keyof typeof TIER_INFO].bg, color: TIER_INFO[USER.tier as keyof typeof TIER_INFO].color, border: `1px solid ${TIER_INFO[USER.tier as keyof typeof TIER_INFO].color}44` }}>
                  {USER.tier}
                </span>
                <Crown className="h-3 w-3" style={{ color: TIER_INFO[USER.tier as keyof typeof TIER_INFO].color }} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/glow/settings"
              className="p-2.5 rounded-xl transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.12)", color: "rgba(253,246,238,0.5)" }}>
              <Settings className="h-4 w-4" />
            </Link>
            <Link href="/glow/notifications"
              className="p-2.5 rounded-xl relative transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.12)", color: "rgba(253,246,238,0.5)" }}>
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-400" />
            </Link>
            <div className="relative h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black text-[#1A0F1E] cursor-pointer"
              style={{ background: TIER_INFO[USER.tier as keyof typeof TIER_INFO].grad, boxShadow: `0 0 16px ${TIER_INFO[USER.tier as keyof typeof TIER_INFO].glow}` }}>
              {initials}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "GlowPoints", value: USER.points.toLocaleString(), icon: <Star className="h-4 w-4" />, c1: "#FFD700", c2: "rgba(255,215,0,0.12)", glow: "rgba(255,215,0,0.2)" },
            { label: "Bookings",   value: USER.totalBookings,           icon: <CalendarDays className="h-4 w-4" />, c1: "#C8956C", c2: "rgba(200,149,108,0.12)", glow: "rgba(200,149,108,0.2)" },
            { label: "Saved",      value: SAVED.length,                 icon: <Heart className="h-4 w-4" />,       c1: "#F43F5E", c2: "rgba(244,63,94,0.12)",   glow: "rgba(244,63,94,0.2)"   },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, ease: [0.23,1,0.32,1] }}
              className="rounded-2xl p-3 text-center cursor-default glow-stat-card">
              <div className="flex justify-center mb-2">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{ background: s.c2, color: s.c1 }}>
                  {s.icon}
                </div>
              </div>
              <p className="text-xl font-black font-editorial" style={{ color: s.c1 }}>{s.value}</p>
              <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(253,246,238,0.35)" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "rgba(253,246,238,0.04)", border: "1px solid rgba(200,149,108,0.1)" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all relative text-xs font-bold"
              style={{
                background: activeTab === tab.id ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "transparent",
                color: activeTab === tab.id ? "#1A0F1E" : "rgba(253,246,238,0.4)",
                boxShadow: activeTab === tab.id ? "0 0 20px rgba(200,149,108,0.3)" : "none"
              }}>
              {tab.icon}
              <span className="hidden sm:block text-[10px] uppercase tracking-wider font-black">{tab.label}</span>
              {"count" in tab && tab.count ? (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 text-[9px] font-black rounded-full flex items-center justify-center"
                  style={{ background: activeTab === tab.id ? "#1A0F1E" : "#C8956C", color: activeTab === tab.id ? "#C8956C" : "#1A0F1E" }}>
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {activeTab === "bookings" && <BookingsTab bookings={bookings} loading={loadingBookings} onCancel={handleCancel} onReschedule={(shopName) => router.push(`/glow/search?q=${encodeURIComponent(shopName)}`)} />}
            {activeTab === "loyalty" && <LoyaltyTab />}
            {activeTab === "saved" && <SavedTab />}
            {activeTab === "profile" && <ProfileTab />}
          </motion.div>
        </AnimatePresence>

        {/* Discover CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-8 p-5 rounded-3xl text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,rgba(200,149,108,0.1),rgba(232,121,249,0.07))", border: "1px solid rgba(200,149,108,0.15)" }}>
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(200,149,108,0.5),transparent)" }} />
          <Sparkles className="h-6 w-6 mx-auto mb-2" style={{ color: "#C8956C" }} />
          <p className="text-sm font-bold text-white mb-1">Discover New Salons</p>
          <p className="text-xs mb-4" style={{ color: "rgba(253,246,238,0.4)" }}>Explore 800+ premium beauty spots near you</p>
          <Link href="/glow/discover"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-[#1A0F1E] shimmer-btn"
            style={{ boxShadow: "0 0 20px rgba(200,149,108,0.35)" }}>
            Explore Now <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
        <div className="h-10" />
      </div>
    </div>
    </GlowAuthGuard>
  );
}
