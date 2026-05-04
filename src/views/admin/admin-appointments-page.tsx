import React, { useState, useEffect } from "react";
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Store, 
  User, 
  ChevronRight,
  MoreVertical,
  Download,
  AlertCircle,
  BarChart3
} from "lucide-react";
import { adminService, type AdminAppointmentStats } from "@/api/adminService";
import { shopService, type Shop } from "@/api/shopService";
import { formatEthiopianTime, formatEthiopianDate, formatCurrency } from "@/utils/format";

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminAppointmentStats | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterShop, setFilterShop] = useState("");
  const [filterBarber, setFilterBarber] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 400); // Debounce search
    return () => clearTimeout(timer);
  }, [filterShop, filterBarber, filterStatus, searchQuery, startDate, endDate, page]);

  const fetchInitialData = async () => {
    try {
      const [statsData, shopsData] = await Promise.all([
        adminService.getAppointmentStats(),
        shopService.listAll(0, 100)
      ]);
      setStats(statsData);
      setShops(shopsData?.content || []);
    } catch (err) {
      console.error("Failed to fetch admin initial data", err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAppointments({
        shopId: filterShop || undefined,
        barberId: filterBarber || undefined,
        status: filterStatus || undefined,
        query: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        size: 20
      });
      setAppointments(data?.content || []);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "CONFIRMED": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "PENDING": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "REJECTED": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "CANCELLED": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "BLOCKED": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-white/5 text-white/60 border-white/10";
    }
  };

  const formatEthDate = (isoString: string) => {
    return formatEthiopianDate(isoString);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CalendarCheck className="w-8 h-8 text-orange-500" />
            Platform Appointments
          </h1>
          <p className="text-white/50 mt-1">Monitor, filter, and analyze all bookings across TrimLink.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white flex items-center gap-2 transition-all">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Approved" 
          value={stats?.totalApproved || 0} 
          icon={<CheckCircle2 className="w-6 h-6 text-green-500" />}
          subtitle="Confirmed & Completed"
        />
        <StatCard 
          title="Total Pending" 
          value={stats?.totalPending || 0} 
          icon={<Clock className="w-6 h-6 text-yellow-500" />}
          subtitle="Awaiting action"
        />
        <StatCard 
          title="Total Rejected" 
          value={stats?.totalRejected || 0} 
          icon={<XCircle className="w-6 h-6 text-red-500" />}
          subtitle="Declined by barbers"
        />
        <StatCard 
          title="Revenue (Today)" 
          value={stats?.revenueToday ? `ETB ${stats.revenueToday.toLocaleString()}` : "ETB 0"} 
          icon={<TrendingUp className="w-6 h-6 text-emerald-500" />}
          subtitle="Collected today"
        />
        <StatCard 
          title="Total Platform Revenue" 
          value={stats?.totalRevenue ? `ETB ${stats.totalRevenue.toLocaleString()}` : "ETB 0"} 
          icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
          subtitle="Gross till date"
        />
        <StatCard 
          title="Admin Share (10%)" 
          value={stats?.adminShare ? `ETB ${stats.adminShare.toLocaleString()}` : "ETB 0"} 
          icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
          subtitle="Your commission"
        />
      </div>

      {/* Financial Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shop Revenue */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-orange-500" />
            Shop Collections (Approved)
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stats?.shopRevenues.map((shop) => (
              <div key={shop.shopId} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-white font-medium">{shop.shopName}</span>
                <span className="text-green-400 font-bold">ETB {shop.revenue.toLocaleString()}</span>
              </div>
            ))}
            {(!stats?.shopRevenues || stats.shopRevenues.length === 0) && (
              <div className="text-center py-8 text-white/30">No revenue data available.</div>
            )}
          </div>
        </div>

        {/* Barber Revenue */}
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            Barber Earnings (Approved)
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {stats?.barberRevenues.map((barber) => (
              <div key={barber.barberId} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                <span className="text-white font-medium">{barber.barberName}</span>
                <span className="text-orange-400 font-bold">ETB {barber.revenue.toLocaleString()}</span>
              </div>
            ))}
            {(!stats?.barberRevenues || stats.barberRevenues.length === 0) && (
              <div className="text-center py-8 text-white/30">No barber earnings available.</div>
            )}
          </div>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Filters Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                placeholder="Search customer, shop or barber..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer text-xs"
              />
              <span className="text-white/30">to</span>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer text-xs"
              />
            </div>
            
            <select 
              value={filterShop}
              onChange={(e) => setFilterShop(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer"
            >
              <option value="">All Shops</option>
              {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            <button 
              onClick={() => { setFilterShop(""); setFilterStatus(""); setFilterBarber(""); setSearchQuery(""); setStartDate(""); setEndDate(""); }}
              className="px-4 py-3 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 rounded-2xl transition-all flex items-center gap-2"
            >
              <Filter className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-white/50 text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Shop / Barber</th>
                <th className="px-6 py-4 font-semibold">Service / Price</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8 h-16 bg-white/5 rounded-lg m-2"></td>
                  </tr>
                ))
              ) : appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold">
                          {appt.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{appt.customerName}</p>
                          <p className="text-white/40 text-xs">ID: {appt.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-white">{appt.shopName}</p>
                        <p className="text-white/40 text-sm">Barber: {appt.barberName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-white">{appt.serviceName}</p>
                        <p className="text-green-400 font-bold">ETB {appt.priceCharged?.toLocaleString() || '0'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          <span>{formatEthDate(appt.scheduledStart)}</span>
                        </div>
                        <p className="text-xs text-white/40 ml-5">
                          {formatEthiopianTime(appt.scheduledStart)} LT (Day)
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No appointments found matching filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <p className="text-white/40 text-sm">Showing page {page + 1}</p>
          <div className="flex gap-2">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-30 hover:bg-white/10 transition-all"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle: string }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md hover:bg-white/10 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <BarChart3 className="w-4 h-4 text-white/20" />
    </div>
    <p className="text-white/50 text-sm">{title}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    <p className="text-white/20 text-xs mt-2">{subtitle}</p>
  </div>
);
