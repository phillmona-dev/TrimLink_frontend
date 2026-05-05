"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck, Search, Filter, TrendingUp, Clock, XCircle,
  CheckCircle2, User, ChevronRight, MoreVertical, Eye, Download,
  BarChart3
} from "lucide-react";
import { ownerService } from "@/api/ownerService";
import { formatEthiopianDate, formatEthiopianTime, formatCurrency } from "@/utils/format";

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CONFIRMED:  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  COMPLETED:  "bg-green-500/10 text-green-400 border-green-500/20",
  REJECTED:   "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED:  "bg-red-500/10 text-red-400 border-red-500/20",
  IN_PROGRESS:"bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export const OwnerAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
      const [apptRes, financeRes] = await Promise.all([
        ownerService.getMyShopAppointments({
          status: filterStatus || undefined,
          query: debouncedSearch || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          size: 20,
        }),
        ownerService.getMyShopFinance(),
      ]);
      setAppointments(apptRes?.content || []);
      setTotalPages(apptRes?.totalPages || 0);
      setStats(financeRes);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, debouncedSearch, startDate, endDate, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-orange-500" />
            Shop Appointments
          </h1>
          <p className="text-white/40 mt-1">Manage and monitor all bookings for your shop.</p>
        </div>
        <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-bold">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat title="Approved" value={stats?.totalApproved ?? 0} icon={<CheckCircle2 className="w-5 h-5 text-green-500" />} />
        <MiniStat title="Pending" value={stats?.totalPending ?? 0} icon={<Clock className="w-5 h-5 text-yellow-500" />} />
        <MiniStat title="Revenue Today" value={formatCurrency(stats?.revenueToday ?? 0)} icon={<TrendingUp className="w-5 h-5 text-emerald-500" />} />
        <MiniStat title="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} icon={<BarChart3 className="w-5 h-5 text-orange-500" />} />
      </div>

      {/* Filters */}
      <div className="bg-[#121212] border border-white/5 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              placeholder="Search by customer or barber..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer text-xs appearance-none min-w-[130px]"
          >
            <option value="" className="bg-[#1a1a1a] text-white">All Statuses</option>
            <option value="PENDING" className="bg-[#1a1a1a] text-white">Pending</option>
            <option value="CONFIRMED" className="bg-[#1a1a1a] text-white">Confirmed</option>
            <option value="IN_PROGRESS" className="bg-[#1a1a1a] text-white">In Progress</option>
            <option value="COMPLETED" className="bg-[#1a1a1a] text-white">Completed</option>
            <option value="REJECTED" className="bg-[#1a1a1a] text-white">Rejected</option>
            <option value="CANCELLED" className="bg-[#1a1a1a] text-white">Cancelled</option>
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none [color-scheme:dark]" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none [color-scheme:dark]" />

          {(filterStatus || startDate || endDate || searchQuery) && (
            <button onClick={() => { setFilterStatus(""); setStartDate(""); setEndDate(""); setSearchQuery(""); }}
              className="px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all">
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 w-14">#</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Barber / Service</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Fee</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-6 h-14 bg-white/[0.02]"></td>
                  </tr>
                ))
              ) : appointments.length > 0 ? (
                appointments.map((appt, idx) => (
                  <tr key={appt.id} className="group/row hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-white/20 group-hover/row:text-orange-500/50 transition-colors">
                        {page * 20 + idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm shrink-0">
                          {(appt.customerName || "W").charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{appt.customerName || "Walk-in"}</p>
                          <p className="text-white/30 text-xs">{appt.id?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{appt.barberName}</p>
                      <p className="text-white/40 text-xs">{appt.serviceName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-bold text-sm">{appt.priceCharged ? formatCurrency(appt.priceCharged) : "—"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white text-sm">{formatEthiopianDate(appt.scheduledStart)}</p>
                      <p className="text-white/40 text-xs">{formatEthiopianTime(appt.scheduledStart)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight uppercase border ${STATUS_COLORS[appt.status] || "bg-white/5 text-white/40 border-white/10"}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left group/menu">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-2xl opacity-0 invisible group-focus-within/menu:opacity-100 group-focus-within/menu:visible transition-all z-50 overflow-hidden">
                          <div className="py-2">
                            <button className="w-full px-4 py-2.5 text-left text-xs text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-2">
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button className="w-full px-4 py-2.5 text-left text-xs text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Confirm
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button className="w-full px-4 py-2.5 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-white/30 text-sm">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-white/5 flex items-center justify-between">
            <p className="text-white/30 text-xs">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-xl text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                Previous
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MiniStat = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
  <div className="bg-[#121212] border border-white/5 p-4 rounded-[1.5rem] hover:bg-white/[0.02] transition-all group flex flex-col justify-between">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-xl font-black text-white mt-1 leading-none">{value}</h3>
    </div>
  </div>
);
