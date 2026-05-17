"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck, Search, TrendingUp, Clock, CheckCircle2,
  XCircle, MoreVertical, Eye, BarChart3, ChevronLeft, ChevronRight
} from "lucide-react";
import { glowShopApi, glowBookingApi, AppointmentResponse } from "@/lib/glow-api";

const STATUS_OPTIONS = ["", "PENDING", "CONFIRMED", "COMPLETED", "IN_PROGRESS", "CANCELLED"];
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: "#FFF8F0", color: "#D4864A" },
  CONFIRMED:   { bg: "#E6F2EB", color: "#548C71" },
  COMPLETED:   { bg: "#E6F2EB", color: "#548C71" },
  IN_PROGRESS: { bg: "#FFF8F0", color: "#D4864A" },
  CANCELLED:   { bg: "#FCECEC", color: "#C25953" },
  REJECTED:    { bg: "#FCECEC", color: "#C25953" },
  NO_SHOW:     { bg: "#FCECEC", color: "#C25953" },
};

function MiniStat({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 bg-white border border-[#F0E4D8] hover:shadow-sm transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-xl bg-[#FFF5ED]">{icon}</div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">{title}</p>
      <h3 className="text-xl font-bold text-[#2C2416] mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{value}</h3>
    </div>
  );
}

export default function SalonAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [apptRes, finRes] = await Promise.all([
        glowShopApi.getShopAppointments({
          status: filterStatus || undefined,
          query: debouncedSearch || undefined,
          page,
          size: 15,
        }),
        glowShopApi.getShopFinance(),
      ]);
      setAppointments(apptRes?.content || []);
      setTotalPages(apptRes?.totalPages || 0);
      setStats(finRes);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, debouncedSearch, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (id: string, action: "confirm" | "reject") => {
    try {
      if (action === "confirm") {
        await glowBookingApi.confirmAppointment(id);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "CONFIRMED" } : a));
      } else {
        await glowBookingApi.rejectAppointment(id);
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "CANCELLED" } : a));
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat title="Approved" value={stats?.totalApproved ?? 0} icon={<CheckCircle2 className="h-5 w-5 text-[#548C71]" />} />
        <MiniStat title="Pending" value={stats?.totalPending ?? 0} icon={<Clock className="h-5 w-5 text-[#D4864A]" />} />
        <MiniStat title="Revenue Today" value={`${(stats?.revenueToday ?? 0).toLocaleString()} ETB`} icon={<TrendingUp className="h-5 w-5 text-[#548C71]" />} />
        <MiniStat title="Total Revenue" value={`${(stats?.totalRevenue ?? 0).toLocaleString()} ETB`} icon={<BarChart3 className="h-5 w-5 text-[#D4864A]" />} />
      </div>

      {/* Filter bar + Table */}
      <div className="bg-white rounded-2xl border border-[#F0E4D8] overflow-hidden">
        {/* Filters */}
        <div className="p-5 border-b border-[#F0E4D8] flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5A090]" />
            <input
              placeholder="Search by customer or stylist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl text-[#2C2416] text-sm focus:outline-none focus:border-[#D4864A] transition-all"
            />
          </div>

          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            className="px-4 py-2.5 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl text-[#2C2416] text-sm focus:outline-none focus:border-[#D4864A] appearance-none cursor-pointer">
            <option value="">All Status</option>
            {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {(filterStatus || searchQuery) && (
            <button onClick={() => { setFilterStatus(""); setSearchQuery(""); }}
              className="px-4 py-2.5 bg-[#FCECEC] text-[#C25953] border border-[#FFD6D6] rounded-xl text-xs font-bold hover:bg-[#FAD4D4] transition-all">
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAF5EE]">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">#</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Stylist / Service</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Fee</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#F0E4D8] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E4D8]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-5"><div className="h-4 bg-[#F0E4D8] rounded-lg" /></td>
                  </tr>
                ))
              ) : appointments.length > 0 ? (
                appointments.map((appt, idx) => {
                  const time = new Date(appt.scheduledStart).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                  const date = new Date(appt.scheduledStart).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const sc = STATUS_COLORS[appt.status] || { bg: "#FAF5EE", color: "#7A6350" };
                  return (
                    <tr key={appt.id} className="hover:bg-[#FAF5EE]/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-[#B5A090]">{page * 15 + idx + 1}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                            {(appt.customerName || "W").charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#2C2416]">{appt.customerName || "Walk-in"}</p>
                            <p className="text-[10px] text-[#B5A090]">{appt.id?.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-[#2C2416]">{appt.barberName}</p>
                        <p className="text-xs text-[#B5A090]">{appt.serviceName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#2C2416]">{appt.priceCharged ? `${appt.priceCharged.toLocaleString()} ETB` : "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#2C2416]">{date}</p>
                        <p className="text-xs text-[#B5A090]">{time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: sc.bg, color: sc.color }}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {appt.status === "PENDING" && (
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={() => handleAction(appt.id, "confirm")}
                              className="p-2 rounded-lg bg-[#E6F2EB] text-[#548C71] hover:bg-[#D1E8DB] transition-colors"
                              title="Confirm">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleAction(appt.id, "reject")}
                              className="p-2 rounded-lg bg-[#FCECEC] text-[#C25953] hover:bg-[#FAD4D4] transition-colors"
                              title="Reject">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#B5A090] text-sm">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-[#F0E4D8] flex items-center justify-between">
            <p className="text-xs text-[#B5A090]">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-[#FAF5EE] border border-[#E8DDD2] text-[#7A6350] rounded-xl text-xs font-bold hover:bg-[#F0E4D8] transition-all disabled:opacity-30 flex items-center gap-1">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 flex items-center gap-1"
                style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
