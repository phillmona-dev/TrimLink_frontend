"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck, Search, Filter, TrendingUp, Clock, XCircle,
  CheckCircle2, Building2, User, MoreVertical, Download, BarChart3
} from "lucide-react";
import { glowAdminApi, AdminAppointmentStats, AppointmentResponse, ShopSearchResponse } from "@/lib/glow-api";
import { motion } from "framer-motion";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [stats, setStats] = useState<AdminAppointmentStats | null>(null);
  const [shops, setShops] = useState<ShopSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterShop, setFilterShop] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    Promise.all([
      glowAdminApi.getAppointmentStats(),
      glowAdminApi.listAllShops(0, 100),
    ]).then(([statsData, shopsData]) => {
      setStats(statsData);
      setShops(shopsData?.content || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchAppointments(), 400);
    return () => clearTimeout(timer);
  }, [filterShop, filterStatus, searchQuery, startDate, endDate, page]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await glowAdminApi.getAppointments({
        shopId: filterShop || undefined,
        status: filterStatus || undefined,
        query: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page, size: 20,
      });
      setAppointments(data?.content || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-700 border-green-200";
      case "CONFIRMED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      case "CANCELLED": return "bg-gray-100 text-gray-600 border-gray-200";
      case "IN_PROGRESS": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", minimumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Platform Bookings
          </h2>
          <p className="text-[#7A6350] mt-1 text-sm">Monitor, filter, and analyze all appointments across GlowLink.</p>
        </div>
        <button className="px-5 py-2.5 bg-white border border-[#E8DDD2] text-[#7A6350] rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-[#FAF5EE] transition-colors">
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { title: "Approved", value: stats?.totalApproved || 0, icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, color: "bg-green-50" },
          { title: "Pending", value: stats?.totalPending || 0, icon: <Clock className="h-5 w-5 text-yellow-500" />, color: "bg-yellow-50" },
          { title: "Rejected", value: stats?.totalRejected || 0, icon: <XCircle className="h-5 w-5 text-red-500" />, color: "bg-red-50" },
          { title: "Revenue (Day)", value: formatCurrency(stats?.revenueToday || 0), icon: <TrendingUp className="h-5 w-5 text-emerald-500" />, color: "bg-emerald-50" },
          { title: "Total Gross", value: formatCurrency(stats?.totalRevenue || 0), icon: <TrendingUp className="h-5 w-5 text-[#D4864A]" />, color: "bg-[#FFF0E8]" },
          { title: "Commission", value: formatCurrency(stats?.adminShare || 0), icon: <BarChart3 className="h-5 w-5 text-blue-500" />, color: "bg-blue-50", subtitle: `${stats?.adminSharePercent || 10}%` },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white border border-[#E8DDD2] p-4 rounded-[20px] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl ${card.color}`}>{card.icon}</div>
              {card.subtitle && <span className="text-[10px] font-bold text-[#D4864A]">{card.subtitle}</span>}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">{card.title}</p>
            <p className="text-lg font-bold text-[#2C2416] mt-0.5">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E8DDD2] rounded-[24px] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#2C2416] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <Building2 className="h-5 w-5 text-[#D4864A]" /> Salon Revenue
          </h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {stats?.shopRevenues?.map((shop) => (
              <div key={shop.shopId} className="flex items-center justify-between p-3 bg-[#FAF5EE] rounded-xl">
                <span className="text-sm font-medium text-[#2C2416]">{shop.shopName}</span>
                <span className="text-sm font-bold text-green-600">{formatCurrency(shop.revenue)}</span>
              </div>
            ))}
            {(!stats?.shopRevenues || stats.shopRevenues.length === 0) && (
              <p className="text-center py-8 text-[#B5A090] text-sm">No revenue data available.</p>
            )}
          </div>
        </div>
        <div className="bg-white border border-[#E8DDD2] rounded-[24px] p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#2C2416] mb-4 flex items-center gap-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <User className="h-5 w-5 text-[#D4864A]" /> Stylist Earnings
          </h3>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {stats?.barberRevenues?.map((barber) => (
              <div key={barber.barberId} className="flex items-center justify-between p-3 bg-[#FAF5EE] rounded-xl">
                <span className="text-sm font-medium text-[#2C2416]">{barber.barberName}</span>
                <span className="text-sm font-bold text-[#D4864A]">{formatCurrency(barber.revenue)}</span>
              </div>
            ))}
            {(!stats?.barberRevenues || stats.barberRevenues.length === 0) && (
              <p className="text-center py-8 text-[#B5A090] text-sm">No stylist earnings available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white border border-[#E8DDD2] rounded-[28px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#E8DDD2] bg-[#FAF5EE]/50 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5A090]" />
            <input placeholder="Search customer, salon, stylist..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E8DDD2] rounded-full text-sm outline-none text-[#2C2416]" />
          </div>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#E8DDD2] rounded-full text-xs text-[#7A6350] outline-none" />
          <span className="text-[#B5A090] text-xs">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#E8DDD2] rounded-full text-xs text-[#7A6350] outline-none" />
          <select value={filterShop} onChange={(e) => setFilterShop(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#E8DDD2] rounded-full text-xs text-[#7A6350] outline-none min-w-[140px]">
            <option value="">All Salons</option>
            {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white border border-[#E8DDD2] rounded-full text-xs text-[#7A6350] outline-none min-w-[120px]">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button onClick={() => { setFilterShop(""); setFilterStatus(""); setSearchQuery(""); setStartDate(""); setEndDate(""); }}
            className="px-4 py-2.5 bg-[#FFF0E8] text-[#D4864A] rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-[#FADEC9] transition-colors">
            <Filter className="h-3.5 w-3.5" /> Reset
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAF5EE]/30">
                {["#", "Customer", "Location / Stylist", "Service / Fee", "Date", "Status"].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E4D8]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-6"><div className="h-4 bg-[#FAF5EE] rounded animate-pulse" /></td></tr>
                ))
              ) : appointments.length > 0 ? (
                appointments.map((appt, idx) => (
                  <tr key={appt.id} className="hover:bg-[#FAF5EE]/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-[#B5A090]">{(page * 20) + idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FFF0E8] flex items-center justify-center text-[#D4864A] font-bold text-sm">
                          {appt.customerName?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#2C2416]">{appt.customerName}</p>
                          <p className="text-[10px] text-[#B5A090]">ID: {appt.id?.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#2C2416]">{appt.shopName}</p>
                      <p className="text-xs text-[#B5A090]">Stylist: {appt.barberName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#2C2416]">{appt.serviceName}</p>
                      <p className="text-sm font-bold text-green-600">{formatCurrency(appt.priceCharged)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-[#2C2416]">{new Date(appt.scheduledStart).toLocaleDateString()}</p>
                      <p className="text-[10px] text-[#B5A090]">{new Date(appt.scheduledStart).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[#B5A090]">No appointments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#E8DDD2] bg-[#FAF5EE]/30 flex items-center justify-between">
          <p className="text-xs text-[#B5A090]">Page {page + 1}</p>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-white border border-[#E8DDD2] rounded-full text-xs text-[#7A6350] disabled:opacity-30 hover:bg-[#FAF5EE] transition-colors">
              Previous
            </button>
            <button onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white border border-[#E8DDD2] rounded-full text-xs text-[#7A6350] hover:bg-[#FAF5EE] transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
