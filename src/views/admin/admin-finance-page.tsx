"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  Download, 
  Search,
  Filter,
  ArrowUpRight,
  MoreVertical,
  ChevronRight,
  CreditCard,
  Building2,
  Clock
} from "lucide-react";
import { adminService } from "@/api/adminService";
import { formatCurrency, formatEthiopianDate } from "@/utils/format";

export const AdminFinancePage: React.FC = () => {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"shops" | "transactions">("shops");
  const [searchQuery, setSearchQuery] = useState("");

  const handleShopAction = (shopName: string) => {
    setSearchQuery(shopName);
    setView("transactions");
  };

  useEffect(() => {
    fetchFinanceData();
  }, [view]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      if (view === "shops") {
        const data = await adminService.getShopFinanceSummaries();
        setSummaries(data || []);
      } else {
        const data = await adminService.getTransactions({ page: 0, size: 50 });
        setTransactions(data?.content || []);
      }
    } catch (err) {
      console.error("Failed to fetch finance data", err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = summaries.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalAdminShare = summaries.reduce((acc, curr) => acc + curr.adminShare, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-10 h-10 text-orange-500" />
            Financial Management
          </h1>
          <p className="text-white/40 mt-2 text-lg">
            Monitor revenue streams, commissions, and transaction logs across all shops.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 font-bold">
            <Download className="w-5 h-5" /> Export PDF
          </button>
        </div>
      </div>

      {/* High-Level Stats - Minimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          title="Platform GMV" 
          value={formatCurrency(totalRevenue)} 
          icon={TrendingUp}
          iconColor="text-emerald-500"
          subtitle="All-time gross"
        />
        <StatCard 
          title="Admin Revenue" 
          value={formatCurrency(totalAdminShare)} 
          icon={BarChart3}
          iconColor="text-blue-500"
          subtitle="Net platform cut"
        />
        <StatCard 
          title="Transactions" 
          value={summaries.reduce((acc, curr) => acc + curr.totalTransactions, 0)} 
          icon={ArrowUpRight}
          iconColor="text-orange-500"
          subtitle="Processed bookings"
        />
        <StatCard 
          title="Active Shops" 
          value={summaries.length} 
          icon={Building2}
          iconColor="text-purple-500"
          subtitle="Partner businesses"
        />
      </div>

      {/* Main Table Container */}
      <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl w-fit">
            <button 
              onClick={() => setView("shops")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === "shops" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-white/40 hover:text-white"}`}
            >
              Shop Summaries
            </button>
            <button 
              onClick={() => setView("transactions")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === "transactions" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-white/40 hover:text-white"}`}
            >
              Transaction Logs
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input 
              placeholder={view === "shops" ? "Search by shop or owner..." : "Search by TX Ref or Customer..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-white/[0.02]">
                {view === "shops" ? (
                  <>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">#</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Shop Details</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Gross Revenue</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Platform Cut</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Volume</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 text-right">Action</th>
                  </>
                ) : (
                  <>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">TX Ref</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Details</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5 text-right">Action</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-8 h-20 bg-white/5"></td>
                  </tr>
                ))
              ) : view === "shops" ? (
                summaries.filter(s => s.shopName.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                  <tr key={item.shopId} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-xs font-mono text-white/20">{idx + 1}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">{item.shopName}</p>
                          <p className="text-white/40 text-sm">Owner: {item.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-white font-bold">{formatCurrency(item.totalRevenue)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <p className="text-orange-500 font-bold">{formatCurrency(item.adminShare)}</p>
                        <span className="text-[10px] font-black bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">COMMISSION</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-white/70">{item.totalTransactions} Bookings</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleShopAction(item.shopName)}
                        className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white group-hover:bg-orange-500 group-hover:text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                transactions.filter(t => 
                  t.txRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((tx) => (
                  <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-xs font-mono text-orange-500/60 uppercase">{tx.txRef}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-white font-bold">{tx.customerName}</p>
                        <p className="text-white/40 text-sm flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" /> {tx.shopName}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-white font-bold">{formatCurrency(tx.amount)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase border ${
                        tx.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        tx.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-white/40 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatEthiopianDate(tx.createdAt)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, subtitle, iconColor }: { title: string, value: string | number, icon: any, subtitle: string, iconColor?: string }) => (
  <div className="bg-[#121212] border border-white/5 p-5 rounded-[1.5rem] hover:bg-white/[0.02] transition-all group flex flex-col justify-between h-full">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2.5 bg-white/5 rounded-xl group-hover:scale-110 transition-transform ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/30 transition-colors" />
    </div>
    <div>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-2xl font-black text-white mt-1 leading-none tracking-tight">{value}</h3>
      <p className="text-white/10 text-[10px] mt-2 font-medium group-hover:text-white/20 transition-colors">{subtitle}</p>
    </div>
  </div>
);
