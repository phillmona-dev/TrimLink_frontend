"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Users, Scissors, BarChart3, Bell, ArrowLeft, CheckCircle2, XCircle, Clock, ChevronRight, Plus, Star, TrendingUp, DollarSign, UserCheck } from "lucide-react";
import Link from "next/link";
import GlowAuthGuard from "@/components/glow/auth-guard";
import { useGlowAuthStore } from "@/lib/glow-auth-store";
import { glowShopApi, glowBookingApi, AppointmentResponse } from "@/lib/glow-api";

const SALON = { name: "Lumiere Beauty Lounge", owner: "Sara Tesfaye", avatar: "ST", tier: "Verified" };

const STAFF = [
  { id: "st1", name: "Sara Tesfaye", role: "Senior Stylist", specialty: "Hair & Braiding", rating: 5.0, bookings: 142, status: "active" },
  { id: "st2", name: "Meron Haile", role: "Makeup Artist", specialty: "Bridal & Glam", rating: 4.9, bookings: 98, status: "active" },
  { id: "st3", name: "Hanna Bekele", role: "Esthetician", specialty: "Skincare & Spa", rating: 4.8, bookings: 74, status: "active" },
];

const SERVICES = [
  { id: "s1", name: "Silk Press & Style", cat: "Hair", dur: 90, price: 850, bookings: 48 },
  { id: "s2", name: "Full Glam Makeup", cat: "Makeup", dur: 75, price: 1200, bookings: 36 },
  { id: "s3", name: "Deep Condition", cat: "Hair", dur: 60, price: 600, bookings: 29 },
  { id: "s4", name: "Bridal Package", cat: "Bridal", dur: 240, price: 4500, bookings: 12 },
  { id: "s5", name: "Eyebrow Shaping", cat: "Brows", dur: 30, price: 250, bookings: 67 },
];

const CLIENTS = [
  { name: "Tigist Alemayehu", phone: "+251 91 234 5678", visits: 8, lastVisit: "May 8", spent: 6800, note: "Prefers Sara. Allergic to ammonia." },
  { name: "Meron Girma", phone: "+251 92 345 6789", visits: 5, lastVisit: "May 1", spent: 4200, note: "Monthly hair client." },
  { name: "Bethel Kebede", phone: "+251 93 456 7890", visits: 12, lastVisit: "Apr 28", spent: 9600, note: "VIP bridal client." },
];

const ANALYTICS = { revenue: { today: 7400, week: 42500, month: 168000 }, bookings: { today: 5, week: 32, month: 124 }, topService: "Silk Press & Style", avgRating: 4.9 };

function StatusBadge({ s }: { s: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    confirmed: { bg: "rgba(124,185,154,0.15)", color: "#7CB99A", label: "Confirmed" },
    pending: { bg: "rgba(200,149,108,0.15)", color: "#C8956C", label: "Pending" },
    cancelled: { bg: "rgba(248,113,113,0.12)", color: "#f87171", label: "Cancelled" },
  };
  const c = cfg[s] ?? cfg.confirmed;
  return <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
}

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <div className={`rounded-2xl p-4 ${className}`} style={{ background: "rgba(253,246,238,0.04)", border: "1px solid rgba(200,149,108,0.12)" }} onClick={onClick}>{children}</div>;
}

function AppointmentsTab({ appts, loading, onAction }: { appts: AppointmentResponse[], loading: boolean, onAction: (id: string, action: "confirm" | "cancel") => void }) {
  if (loading) return <div className="text-center py-10 text-white/50 animate-pulse text-sm">Loading appointments...</div>;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-white">Today — {new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long" })}</p>
        <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: "rgba(200,149,108,0.15)", color: "#C8956C" }}>{appts.filter(a => a.status !== "CANCELLED").length} appointments</span>
      </div>
      {appts.length === 0 && (
        <div className="text-center py-12"><CalendarDays className="h-12 w-12 mx-auto mb-3 text-white/10" /><p className="text-sm text-white/40">No appointments for today</p></div>
      )}
      {appts.map((a, i) => {
        const timeStr = new Date(a.scheduledStart).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        return (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <div className="flex items-start justify-between mb-2">
                <div><p className="font-bold text-white text-sm">{a.customerName}</p><p className="text-xs" style={{ color: "#C8956C" }}>{a.serviceName}</p></div>
                <StatusBadge s={a.status.toLowerCase()} />
              </div>
              <div className="flex gap-4 text-xs mb-3" style={{ color: "rgba(253,246,238,0.45)" }}>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeStr}</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{a.barberName}</span>
                <span className="font-bold" style={{ color: "#C8956C" }}>{a.priceCharged?.toLocaleString()} ETB</span>
              </div>
              {a.status === "PENDING" && (
                <div className="flex gap-2 pt-2 border-t border-[rgba(200,149,108,0.08)]">
                  <button onClick={() => onAction(a.id, "confirm")} className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all" style={{ background: "rgba(124,185,154,0.15)", color: "#7CB99A", border: "1px solid rgba(124,185,154,0.2)" }}><CheckCircle2 className="h-3.5 w-3.5" /> Confirm</button>
                  <button onClick={() => onAction(a.id, "cancel")} className="flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all" style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }}><XCircle className="h-3.5 w-3.5" /> Decline</button>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function StaffTab() {
  return (
    <div className="flex flex-col gap-3">
      <button className="flex items-center gap-2 self-end px-4 py-2 rounded-xl text-xs font-bold transition-all" style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", color: "#1A0F1E" }}><Plus className="h-3.5 w-3.5" /> Add Staff</button>
      {STAFF.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
          <Card className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>{s.name.split(" ").map(n => n[0]).join("")}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">{s.name}</p>
              <p className="text-xs" style={{ color: "#C8956C" }}>{s.role} · {s.specialty}</p>
              <div className="flex gap-3 mt-1 text-xs" style={{ color: "rgba(253,246,238,0.45)" }}>
                <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{s.rating}</span>
                <span>{s.bookings} bookings</span>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full" style={{ background: "rgba(124,185,154,0.15)", color: "#7CB99A" }}>Active</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ServicesTab() {
  return (
    <div className="flex flex-col gap-3">
      <button className="flex items-center gap-2 self-end px-4 py-2 rounded-xl text-xs font-bold" style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", color: "#1A0F1E" }}><Plus className="h-3.5 w-3.5" /> Add Service</button>
      {SERVICES.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
          <Card className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-white text-sm">{s.name}</p>
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(200,149,108,0.12)", color: "rgba(200,149,108,0.8)" }}>{s.cat}</span>
              </div>
              <div className="flex gap-3 text-xs" style={{ color: "rgba(253,246,238,0.4)" }}>
                <span><Clock className="h-3 w-3 inline mr-0.5" />{s.dur} min</span>
                <span className="font-bold" style={{ color: "#C8956C" }}>{s.price.toLocaleString()} ETB</span>
                <span>{s.bookings} bookings</span>
              </div>
            </div>
            <button className="p-2 rounded-xl text-white/40 hover:text-white transition-all glass border border-[rgba(200,149,108,0.15)]"><ChevronRight className="h-4 w-4" /></button>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function CRMTab() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      {CLIENTS.map((c, i) => (
        <motion.div key={c.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
          <Card className="cursor-pointer" onClick={() => setSelected(selected === c.name ? null : c.name)}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{c.name}</p>
                <p className="text-xs" style={{ color: "rgba(253,246,238,0.4)" }}>{c.phone} · Last: {c.lastVisit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black" style={{ color: "#C8956C" }}>{c.spent.toLocaleString()} ETB</p>
                <p className="text-[10px] text-white/40">{c.visits} visits</p>
              </div>
            </div>
            <AnimatePresence>
              {selected === c.name && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 pt-3 border-t border-[rgba(200,149,108,0.1)]">
                    <p className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: "rgba(200,149,108,0.6)" }}>Stylist Notes</p>
                    <p className="text-sm" style={{ color: "rgba(253,246,238,0.6)" }}>{c.note}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function AnalyticsTab({ finance }: { finance: any }) {
  const bars = [65, 80, 45, 90, 70, 85, 100];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today", value: finance?.revenueToday || 0, icon: <DollarSign className="h-4 w-4" /> },
          { label: "Total Rev", value: finance?.totalRevenue || 0, icon: <TrendingUp className="h-4 w-4" /> },
          { label: "Completed", value: finance?.totalApproved || 0, icon: <CheckCircle2 className="h-4 w-4" /> },
        ].map((r, i) => (
          <motion.div key={r.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="text-center">
              <div className="flex justify-center mb-1" style={{ color: "#C8956C" }}>{r.icon}</div>
              <p className="text-base font-black text-white">{(r.value / 1000).toFixed(1)}K</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(253,246,238,0.4)" }}>{r.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card>
        <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "rgba(200,149,108,0.6)" }}>Weekly Revenue</p>
        <div className="flex items-end gap-2 h-24">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.08, duration: 0.6, ease: "easeOut" }} className="w-full rounded-t-lg" style={{ background: i === 6 ? "linear-gradient(180deg,#C8956C,#E8B4A0)" : "rgba(200,149,108,0.25)" }} />
              <span className="text-[9px]" style={{ color: "rgba(253,246,238,0.35)" }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Avg Rating", value: ANALYTICS.avgRating, icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> },
          { label: "Bookings", value: finance?.totalApproved || 0, icon: <CalendarDays className="h-4 w-4" /> },
          { label: "Top Service", value: "Silk Press", icon: <Scissors className="h-4 w-4" /> },
          { label: "Pending", value: finance?.totalPending || 0, icon: <Clock className="h-4 w-4" /> },
        ].map((s, i) => (
          <Card key={i} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(200,149,108,0.12)", color: "#C8956C" }}>{s.icon}</div>
            <div>
              <p className="font-black text-white text-sm">{s.value}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(253,246,238,0.4)" }}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SalonDashboardPage() {
  const [tab, setTab] = useState<"appointments" | "staff" | "services" | "crm" | "analytics">("appointments");
  const { user } = useGlowAuthStore();
  const [appts, setAppts] = useState<AppointmentResponse[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [loadingAppts, setLoadingAppts] = useState(true);

  useEffect(() => {
    glowShopApi.getShopAppointments()
      .then(res => setAppts(res.content || []))
      .catch(console.error)
      .finally(() => setLoadingAppts(false));
    glowShopApi.getShopFinance()
      .then(res => setFinance(res))
      .catch(console.error);
  }, []);

  const handleAction = async (id: string, action: "confirm" | "cancel") => {
    try {
      if (action === "confirm") {
        await glowBookingApi.confirmAppointment(id);
        setAppts(prev => prev.map(a => a.id === id ? { ...a, status: "CONFIRMED" } : a));
      } else {
        await glowBookingApi.rejectAppointment(id);
        setAppts(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update appointment");
    }
  };

  const displayName = user?.firstName || user?.username || SALON.owner.split(" ")[0];
  const initials = user ? `${(user.firstName || "S")[0]}${(user.lastName || "O")[0]}`.toUpperCase() : SALON.avatar;

  const tabs = [
    { id: "appointments", icon: <CalendarDays className="h-5 w-5" />, label: "Today" },
    { id: "staff", icon: <Users className="h-5 w-5" />, label: "Staff" },
    { id: "services", icon: <Scissors className="h-5 w-5" />, label: "Services" },
    { id: "crm", icon: <UserCheck className="h-5 w-5" />, label: "Clients" },
    { id: "analytics", icon: <BarChart3 className="h-5 w-5" />, label: "Revenue" },
  ] as const;

  return (
    <GlowAuthGuard requireRole={["OWNER", "ADMIN"]}>
    <div className="min-h-screen">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50" style={{ background: "rgba(10,5,18,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(200,149,108,0.1)" }}>
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent,rgba(200,149,108,0.4),transparent)" }} />
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/glow/discover"
              className="p-2 rounded-xl transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.6)" }}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-base font-black text-white leading-none font-editorial">{SALON.name}</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(124,185,154,0.15)", color: "#7CB99A", border: "1px solid rgba(124,185,154,0.3)" }}>
                  ✓ {SALON.tier}
                </span>
                <span className="text-[9px]" style={{ color: "rgba(253,246,238,0.3)" }}>Salon Dashboard</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2.5 rounded-xl relative transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.12)", color: "rgba(253,246,238,0.55)" }}>
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-400" />
            </button>
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black text-[#1A0F1E]"
              style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 16px rgba(200,149,108,0.4)" }}>
              {initials}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Today's Rev",   value: `${(finance?.revenueToday || 0).toLocaleString()}`, sub: "ETB", icon: <DollarSign className="h-4 w-4" />, c1: "#FFD700", bg: "rgba(255,215,0,0.12)" },
            { label: "Appointments",  value: appts.filter(a => a.status !== "CANCELLED").length, sub: "today", icon: <CalendarDays className="h-4 w-4" />, c1: "#C8956C", bg: "rgba(200,149,108,0.12)" },
            { label: "Pending",        value: appts.filter(a => a.status === "PENDING").length,   sub: "requests", icon: <Clock className="h-4 w-4" />, c1: "#E879F9", bg: "rgba(232,121,249,0.12)" },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, ease: [0.23,1,0.32,1] }}
              className="rounded-2xl p-3 text-center glow-stat-card">
              <div className="flex justify-center mb-2">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.c1 }}>{s.icon}</div>
              </div>
              <p className="text-lg font-black font-editorial leading-none" style={{ color: s.c1 }}>{s.value}</p>
              <p className="text-[9px] font-semibold mt-0.5" style={{ color: "rgba(253,246,238,0.35)" }}>{s.sub}</p>
              <p className="text-[8px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(253,246,238,0.25)" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── TAB BAR ── */}
        <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: "rgba(253,246,238,0.04)", border: "1px solid rgba(200,149,108,0.1)" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-wide"
              style={{
                background: tab === t.id ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "transparent",
                color: tab === t.id ? "#1A0F1E" : "rgba(253,246,238,0.4)",
                boxShadow: tab === t.id ? "0 0 20px rgba(200,149,108,0.3)" : "none"
              }}>
              {t.icon}<span className="hidden sm:block">{t.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {tab === "appointments" && <AppointmentsTab appts={appts} loading={loadingAppts} onAction={handleAction} />}
            {tab === "staff" && <StaffTab />}
            {tab === "services" && <ServicesTab />}
            {tab === "crm" && <CRMTab />}
            {tab === "analytics" && <AnalyticsTab finance={finance} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="h-10" />
    </div>
    </GlowAuthGuard>
  );
}
