"use client";

import { useState, useEffect } from "react";
import {
  Wallet, TrendingUp, BarChart3, ArrowUpRight, Clock, Star, Users
} from "lucide-react";
import { glowShopApi } from "@/lib/glow-api";

function MiniStat({ title, value, icon: Icon, iconColor }: {
  title: string; value: string | number; icon: any; iconColor: string;
}) {
  return (
    <div className="rounded-2xl p-4 bg-white border border-[#F0E4D8] hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-xl bg-[#FAF5EE] ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-[#E8DDD2]" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">{title}</p>
      <h3 className="text-xl font-bold text-[#2C2416] mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{value}</h3>
    </div>
  );
}

export default function SalonFinancePage() {
  const [finance, setFinance] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [finRes, staffRes] = await Promise.all([
          glowShopApi.getShopFinance(),
          glowShopApi.getShopStaff(),
        ]);
        setFinance(finRes);
        setStaff(staffRes || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2C2416] flex items-center gap-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          <Wallet className="h-7 w-7 text-[#D4864A]" />
          Salon Finance
        </h1>
        <p className="text-sm text-[#B5A090] mt-1">
          {finance?.shopName ? `Revenue and financial overview for ${finance.shopName}` : "Loading your salon's financial data..."}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat title="Total Revenue" value={`${(finance?.totalRevenue ?? 0).toLocaleString()} ETB`} icon={TrendingUp} iconColor="text-[#548C71]" />
        <MiniStat title="Revenue Today" value={`${(finance?.revenueToday ?? 0).toLocaleString()} ETB`} icon={ArrowUpRight} iconColor="text-[#D4864A]" />
        <MiniStat title="Approved Bookings" value={finance?.totalApproved ?? 0} icon={BarChart3} iconColor="text-[#6B8EC4]" />
        <MiniStat title="Pending Bookings" value={finance?.totalPending ?? 0} icon={Clock} iconColor="text-[#D4864A]" />
      </div>

      {/* Staff Performance Table */}
      <div className="bg-white rounded-2xl border border-[#F0E4D8] overflow-hidden">
        <div className="p-5 border-b border-[#F0E4D8] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#2C2416] text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Staff Performance</h2>
            <p className="text-xs text-[#B5A090] mt-0.5">Bookings and service count per stylist today</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAF5EE]">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Stylist</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Bookings Today</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Avg Rating</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E4D8]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-5"><div className="h-4 bg-[#F0E4D8] rounded-lg" /></td>
                  </tr>
                ))
              ) : staff.length > 0 ? (
                staff.map((b: any, idx: number) => (
                  <tr key={b.barberId} className="hover:bg-[#FAF5EE]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-[#B5A090]">{idx + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                          {(b.user?.firstName || "S").charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#2C2416]">{b.user?.firstName} {b.user?.lastName}</p>
                          <p className="text-xs text-[#B5A090]">{b.user?.phoneNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-[#2C2416]">{b.customersToday || 0}</p>
                      <p className="text-xs text-[#B5A090]">{b.appBookingsToday || 0} app + {b.manualLogsToday || 0} manual</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-semibold text-[#2C2416]">{(b.averageRating || 0).toFixed(1)}</span>
                        <span className="text-xs text-[#B5A090]">({b.totalReviews || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        b.available
                          ? "bg-[#E6F2EB] text-[#548C71]"
                          : "bg-[#FCECEC] text-[#C25953]"
                      }`}>
                        {b.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[#B5A090] text-sm">
                    No staff data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
