"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, Users, DollarSign, Clock, TrendingUp,
  CheckCircle2, XCircle, Scissors, ChevronRight, Star, Sparkles
} from "lucide-react";
import Link from "next/link";
import { useGlowAuthStore } from "@/lib/glow-auth-store";
import { glowShopApi, glowBookingApi, AppointmentResponse } from "@/lib/glow-api";

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 bg-white border border-[#F0E4D8] shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <TrendingUp className="h-4 w-4 text-[#D9CFC6]" />
      </div>
      <p className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-[#B5A090]">{label}</p>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    PENDING: { bg: "#FFF8F0", color: "#D4864A", label: "Pending" },
    CONFIRMED: { bg: "#E6F2EB", color: "#548C71", label: "Confirmed" },
    COMPLETED: { bg: "#E6F2EB", color: "#548C71", label: "Completed" },
    IN_PROGRESS: { bg: "#FFF8F0", color: "#D4864A", label: "In Progress" },
    CANCELLED: { bg: "#FCECEC", color: "#C25953", label: "Cancelled" },
    NO_SHOW: { bg: "#FCECEC", color: "#C25953", label: "No Show" },
  };
  const c = cfg[status] ?? cfg.CONFIRMED;
  return <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider" style={{ background: c.bg, color: c.color }}>{c.label}</span>;
}

export default function SalonDashboardPage() {
  const { user } = useGlowAuthStore();
  const [appts, setAppts] = useState<AppointmentResponse[]>([]);
  const [finance, setFinance] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [apptRes, finRes, staffRes] = await Promise.all([
          glowShopApi.getShopAppointments(),
          glowShopApi.getShopFinance(),
          glowShopApi.getShopStaff(),
        ]);
        setAppts(apptRes.content || []);
        setFinance(finRes);
        setStaff(staffRes || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
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
    }
  };

  const pendingCount = appts.filter(a => a.status === "PENDING").length;
  const activeCount = appts.filter(a => a.status !== "CANCELLED").length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Welcome back, {user?.firstName || "Owner"} ✦
        </h1>
        <p className="text-sm text-[#B5A090] mt-1">Here&apos;s what&apos;s happening at your salon today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue Today" value={`${(finance?.revenueToday || 0).toLocaleString()} ETB`} icon={<DollarSign className="h-5 w-5" />} color="#D4864A" />
        <StatCard label="Appointments" value={activeCount} icon={<CalendarDays className="h-5 w-5" />} color="#548C71" />
        <StatCard label="Pending" value={pendingCount} icon={<Clock className="h-5 w-5" />} color="#D4864A" />
        <StatCard label="Active Staff" value={staff.length} icon={<Users className="h-5 w-5" />} color="#6B8EC4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Today&apos;s Appointments
            </h2>
            <Link href="/glow/salon/appointments"
              className="text-xs font-bold text-[#D4864A] hover:underline flex items-center gap-1">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="h-8 w-8 mx-auto rounded-full border-2 border-[#F0E4D8] border-t-[#D4864A] animate-spin" />
            </div>
          )}

          {!loading && appts.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#F0E4D8]">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-[#E8DDD2]" />
              <p className="text-sm font-semibold text-[#B5A090]">No appointments for today</p>
            </div>
          )}

          <div className="space-y-3">
            {appts.slice(0, 5).map((a, i) => {
              const timeStr = new Date(a.scheduledStart).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="rounded-2xl p-5 bg-white border border-[#F0E4D8] shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-[#2C2416] text-base">{a.customerName}</p>
                      <p className="text-sm mt-0.5 text-[#D4864A] font-semibold">{a.serviceName}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="flex gap-5 text-sm text-[#7A6350] font-medium mb-1">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#D4864A]" />{timeStr}</span>
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-[#D4864A]" />{a.barberName}</span>
                    <span className="font-bold text-[#2C2416] ml-auto">{a.priceCharged?.toLocaleString()} ETB</span>
                  </div>

                  {a.status === "PENDING" && (
                    <div className="flex gap-3 pt-4 border-t border-[#F0E4D8] mt-3">
                      <button onClick={() => handleAction(a.id, "confirm")}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all bg-[#E6F2EB] text-[#548C71] hover:bg-[#D1E8DB]">
                        <CheckCircle2 className="h-4 w-4" /> Confirm
                      </button>
                      <button onClick={() => handleAction(a.id, "cancel")}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all bg-[#FCECEC] text-[#C25953] hover:bg-[#FAD4D4]">
                        <XCircle className="h-4 w-4" /> Decline
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Quick Actions
          </h2>

          {[
            { href: "/glow/salon/staff", icon: <Users className="h-5 w-5" />, label: "Manage Staff", desc: "Add and manage your team" },
            { href: "/glow/salon/services", icon: <Scissors className="h-5 w-5" />, label: "Manage Services", desc: "Set prices and assign services" },
            { href: "/glow/salon/settings", icon: <Clock className="h-5 w-5" />, label: "Working Hours", desc: "Configure your schedule" },
            { href: "/glow/salon/finance", icon: <DollarSign className="h-5 w-5" />, label: "View Finance", desc: "Revenue and performance" },
          ].map((link, i) => (
            <motion.div key={link.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}>
              <Link href={link.href}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#F0E4D8] hover:shadow-md hover:border-[#D4864A]/30 transition-all">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-[#FFF5ED] text-[#D4864A] group-hover:scale-105 transition-transform">
                  {link.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#2C2416] text-sm">{link.label}</p>
                  <p className="text-xs text-[#B5A090]">{link.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#D9CFC6] group-hover:text-[#D4864A] transition-colors" />
              </Link>
            </motion.div>
          ))}

          {/* Staff summary */}
          {staff.length > 0 && (
            <div className="rounded-2xl p-5 bg-gradient-to-br from-[#D4864A] to-[#C07540] text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5" />
                <p className="font-bold text-sm">Team Overview</p>
              </div>
              <div className="space-y-2">
                {staff.slice(0, 3).map((s: any) => (
                  <div key={s.barberId} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white/90">
                      {s.user?.firstName || s.barberName || "Staff"} {s.user?.lastName || ""}
                    </span>
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 fill-white/60 text-white/60" />
                      <span className="text-white/70">{(s.averageRating || 0).toFixed(1)}</span>
                      <span className={`h-2 w-2 rounded-full ${s.available ? 'bg-green-300' : 'bg-red-300'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
