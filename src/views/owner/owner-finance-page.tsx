"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet, TrendingUp, BarChart3, ArrowUpRight,
  Download, Clock
} from "lucide-react";
import { ownerService } from "@/api/ownerService";
import { formatCurrency } from "@/utils/format";
import { exportToPDF } from "@/utils/export";

export const OwnerFinancePage: React.FC = () => {
  const [finance, setFinance] = useState<any>(null);
  const [barberRevenues, setBarberRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleExportPDF = () => {
    const headers = ["Barber", "Bookings Today", "Manual Logs", "Avg Rating", "Status"];
    const rows = barberRevenues.map((b: any) => [
      `${b.user?.firstName} ${b.user?.lastName}`,
      b.appBookingsToday,
      b.manualLogsToday,
      `${b.averageRating?.toFixed(1) ?? "N/A"} ⭐`,
      b.available ? "Available" : "Unavailable"
    ]);

    const title = `Finance Report: ${finance?.shopName || "Your Shop"}`;
    exportToPDF(title, headers, rows, `Finance_${new Date().toISOString().split('T')[0]}`);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [financeRes, staffRes] = await Promise.all([
          ownerService.getMyShopFinance(),
          ownerService.getStaffPerformance(),
        ]);
        setFinance(financeRes);
        setBarberRevenues(staffRes || []);
      } catch (err) {
        console.error("Failed to load finance data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-orange-500" />
            Shop Finance
          </h1>
          <p className="text-white/40 mt-1">
            {finance?.shopName ? `Revenue and financial overview for ${finance.shopName}` : "Loading your shop's financial data..."}
          </p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="px-5 py-2.5 bg-orange-500 text-black rounded-2xl hover:bg-orange-400 transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-orange-500/20"
        >
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat
          title="Total Revenue"
          value={formatCurrency(finance?.totalRevenue ?? 0)}
          icon={TrendingUp}
          iconColor="text-emerald-500"
        />
        <MiniStat
          title="Revenue Today"
          value={formatCurrency(finance?.revenueToday ?? 0)}
          icon={ArrowUpRight}
          iconColor="text-orange-500"
        />
        <MiniStat
          title="Approved Bookings"
          value={finance?.totalApproved ?? 0}
          icon={BarChart3}
          iconColor="text-blue-500"
        />
        <MiniStat
          title="Pending Bookings"
          value={finance?.totalPending ?? 0}
          icon={Clock}
          iconColor="text-yellow-500"
        />
      </div>

      {/* Staff Revenue Breakdown */}
      <div className="bg-[#121212] border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-lg">Staff Performance</h2>
            <p className="text-white/30 text-xs mt-0.5">Bookings and service count per barber today</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 w-14">#</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Barber</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Bookings Today</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Avg Rating</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i: number) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6 h-14 bg-white/[0.02]"></td>
                  </tr>
                ))
              ) : barberRevenues.length > 0 ? (
                barberRevenues.map((b: any, idx: number) => (
                  <tr key={b.barberId} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-white/20">{idx + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm shrink-0">
                          {(b.user?.firstName || "B").charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{b.user?.firstName} {b.user?.lastName}</p>
                          <p className="text-white/30 text-xs">{b.user?.phoneNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-bold text-sm">{b.customersToday}</p>
                      <p className="text-white/30 text-xs">{b.appBookingsToday} app + {b.manualLogsToday} manual</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{b.averageRating?.toFixed(1) ?? "N/A"} ⭐</p>
                      <p className="text-white/30 text-xs">{b.totalReviews} reviews</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${b.available ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                        {b.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-white/30 text-sm">
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
};

const MiniStat = ({ title, value, icon: Icon, iconColor }: {
  title: string; value: string | number; icon: any; iconColor: string;
}) => (
  <div className="bg-[#121212] border border-white/5 p-4 rounded-[1.5rem] hover:bg-white/[0.02] transition-all group flex flex-col justify-between">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/20 transition-colors" />
    </div>
    <div>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-xl font-black text-white mt-1 leading-none">{value}</h3>
    </div>
  </div>
);
