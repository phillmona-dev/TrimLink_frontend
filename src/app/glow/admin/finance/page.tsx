"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, BarChart3, Wallet, Download, Search,
  ChevronRight, Building2, Clock
} from "lucide-react";
import { glowAdminApi } from "@/lib/glow-api";
import { motion } from "framer-motion";

export default function AdminFinancePage() {
  const [summaries, setSummaries] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"shops" | "transactions">("shops");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFinanceData();
  }, [view]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      if (view === "shops") {
        const data = await glowAdminApi.getShopFinanceSummaries();
        setSummaries(data || []);
      } else {
        const data = await glowAdminApi.getTransactions({ page: 0, size: 50 });
        setTransactions(data?.content || []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const totalRevenue = summaries.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);
  const totalAdminShare = summaries.reduce((acc, curr) => acc + (curr.adminShare || 0), 0);
  const totalTx = summaries.reduce((acc, curr) => acc + (curr.totalTransactions || 0), 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", minimumFractionDigits: 0 }).format(val || 0);

  const statCards = [
    { title: "Platform GMV", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", sub: "All-time gross" },
    { title: "Admin Revenue", value: formatCurrency(totalAdminShare), icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50", sub: "Platform cut" },
    { title: "Transactions", value: totalTx, icon: ChevronRight, color: "text-[#D4864A]", bg: "bg-[#FFF0E8]", sub: "Processed bookings" },
    { title: "Active Salons", value: summaries.length, icon: Building2, color: "text-purple-500", bg: "bg-purple-50", sub: "Partner businesses" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Financial Management
          </h2>
          <p className="text-[#7A6350] mt-1 text-sm">Monitor revenue, commissions, and transaction logs.</p>
        </div>
        <button className="px-5 py-2.5 bg-white border border-[#E8DDD2] text-[#7A6350] rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-[#FAF5EE] transition-colors">
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-white border border-[#E8DDD2] p-5 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">{card.title}</p>
              <p className="text-2xl font-bold text-[#2C2416] mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{card.value}</p>
              <p className="text-[10px] text-[#B5A090] mt-1">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8DDD2] rounded-[28px] overflow-hidden shadow-sm">
        {/* Tab header */}
        <div className="p-6 border-b border-[#E8DDD2] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#FAF5EE] rounded-full w-fit">
            <button onClick={() => setView("shops")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${view === "shops" ? "bg-[#D4864A] text-white shadow-md" : "text-[#7A6350] hover:text-[#2C2416]"}`}>
              Salon Summaries
            </button>
            <button onClick={() => setView("transactions")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${view === "transactions" ? "bg-[#D4864A] text-white shadow-md" : "text-[#7A6350] hover:text-[#2C2416]"}`}>
              Transaction Logs
            </button>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5A090]" />
            <input placeholder={view === "shops" ? "Search salon or owner..." : "Search TX ref or customer..."}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#FAF5EE] border border-[#E8DDD2] rounded-full text-sm outline-none text-[#2C2416]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAF5EE]/30">
                {view === "shops" ? (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">#</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Salon Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Gross Revenue</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Platform Cut</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Volume</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">TX Ref</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E4D8]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-6"><div className="h-4 bg-[#FAF5EE] rounded animate-pulse" /></td></tr>
                ))
              ) : view === "shops" ? (
                summaries.filter(s => s.shopName?.toLowerCase().includes(searchQuery.toLowerCase())).map((item, idx) => (
                  <tr key={item.shopId} className="hover:bg-[#FAF5EE]/50 transition-colors">
                    <td className="px-6 py-5 text-xs text-[#B5A090]">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FFF0E8] flex items-center justify-center text-[#D4864A]">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#2C2416]">{item.shopName}</p>
                          <p className="text-xs text-[#B5A090]">Owner: {item.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-[#2C2416]">{formatCurrency(item.totalRevenue)}</td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-[#D4864A]">{formatCurrency(item.adminShare)}</span>
                      <span className="ml-2 text-[10px] font-bold bg-[#FFF0E8] text-[#D4864A] px-2 py-0.5 rounded-full">COMMISSION</span>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#7A6350]">{item.totalTransactions} Bookings</td>
                  </tr>
                ))
              ) : (
                transactions.filter(t =>
                  (t.txRef || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (t.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (t.shopName || "").toLowerCase().includes(searchQuery.toLowerCase())
                ).map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAF5EE]/50 transition-colors">
                    <td className="px-6 py-5 text-xs font-mono text-[#D4864A]/60 uppercase">{tx.txRef}</td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-[#2C2416]">{tx.customerName}</p>
                      <p className="text-xs text-[#B5A090] flex items-center gap-1"><Building2 className="h-3 w-3" /> {tx.shopName}</p>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-[#2C2416]">{formatCurrency(tx.amount)}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        tx.status === "SUCCESS" ? "bg-green-100 text-green-700 border-green-200" :
                        tx.status === "PENDING" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                        "bg-red-100 text-red-700 border-red-200"
                      }`}>{tx.status}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs text-[#B5A090]">
                        <Clock className="h-3 w-3" />
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
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
}
