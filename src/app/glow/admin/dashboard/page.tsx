"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Building2, CalendarDays, TrendingUp, Sparkles, Clock } from "lucide-react";
import { glowAdminApi, AdminDashboardStats } from "@/lib/glow-api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    glowAdminApi.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#D4864A]/30 border-t-[#D4864A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "#4A90E2", bg: "#EFF6FF" },
    { label: "Active Salons", value: stats.totalShops, icon: Building2, color: "#D4864A", bg: "#FFF0E8" },
    { label: "Pending Approvals", value: stats.pendingAppointments, icon: Clock, color: "#EAB308", bg: "#FEF9C3" },
    { label: "Today's Bookings", value: stats.totalAppointmentsToday, icon: CalendarDays, color: "#10B981", bg: "#ECFDF5" },
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Platform Overview
        </h2>
        <p className="text-[#7A6350] mt-1 text-sm">Welcome back to the GlowLink administrative center.</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[24px] border border-[#E8DDD2] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon className="h-16 w-16" style={{ color: card.color }} />
              </div>
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 relative z-10"
                style={{ background: card.bg, color: card.color }}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#B5A090] mb-1 relative z-10">{card.label}</p>
              <p className="text-3xl font-bold text-[#2C2416] relative z-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {card.value.toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-[#2C2416] p-8 rounded-[32px] text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20px] left-[20%] w-40 h-40 bg-[#D4864A]/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <TrendingUp className="h-6 w-6 text-[#D4864A]" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Financial Overview</h3>
                <p className="text-xs text-white/60">Platform-wide transaction volume</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mt-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">Today&apos;s Revenue</p>
                <p className="text-4xl font-bold text-[#F5EFE6]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {formatCurrency(stats.revenueToday)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2">This Month</p>
                <p className="text-4xl font-bold text-[#D4864A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {formatCurrency(stats.revenueThisMonth)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions / Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white p-8 rounded-[32px] border border-[#E8DDD2] flex flex-col justify-center text-center shadow-sm">
          <div className="h-16 w-16 mx-auto bg-[#FFF0E8] rounded-full flex items-center justify-center mb-4 text-[#D4864A]">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-[#2C2416] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Platform Growth
          </h3>
          <p className="text-[#7A6350] text-sm leading-relaxed mb-6">
            The platform is growing steadily. Make sure to review pending salon approvals to onboard them faster.
          </p>
          <a href="/glow/admin/approvals" 
            className="w-full py-3 rounded-full bg-[#FAF5EE] text-[#D4864A] font-bold text-sm border border-[#FADEC9] hover:bg-[#FFF0E8] transition-colors">
            Review Approvals
          </a>
        </motion.div>
      </div>

    </div>
  );
}
