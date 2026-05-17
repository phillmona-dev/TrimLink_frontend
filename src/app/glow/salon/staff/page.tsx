"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, TrendingUp, Plus, Calendar, Star, UserPlus,
  X, ChevronRight
} from "lucide-react";
import { glowShopApi } from "@/lib/glow-api";

export default function SalonStaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [isViewingWeekly, setIsViewingWeekly] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // Add staff
  const [newPhone, setNewPhone] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Log work
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [logCount, setLogCount] = useState(1);
  const [logLoading, setLogLoading] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await glowShopApi.getShopStaff();
      setStaff(data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAddStaff = async () => {
    if (!newPhone.trim()) return;
    setAddError(null);
    setAddLoading(true);
    try {
      await glowShopApi.addStaff(newPhone);
      setIsAddingStaff(false);
      setNewPhone("");
      loadStaff();
    } catch (e: any) {
      setAddError(e?.response?.data?.message || e?.message || "Failed to add staff member.");
    }
    setAddLoading(false);
  };

  const handleToggle = async (barberId: string, current: boolean) => {
    try {
      await glowShopApi.toggleStaffAvailability(barberId, !current);
      setStaff(prev => prev.map(s => s.barberId === barberId ? { ...s, available: !current } : s));
    } catch (e) { console.error(e); }
  };

  const handleLogSubmit = async () => {
    if (!selectedStaff) return;
    setLogLoading(true);
    try {
      await glowShopApi.logDailyWork(selectedStaff.barberId, logCount);
      setIsLogging(false);
      setSelectedStaff(null);
      setLogCount(1);
      loadStaff();
    } catch (e) { console.error(e); }
    setLogLoading(false);
  };

  const loadWeekly = async () => {
    setIsViewingWeekly(true);
    setLoadingWeekly(true);
    try {
      const data = await glowShopApi.getWeeklyReport();
      setWeeklyReport(data || []);
    } catch (e) { console.error(e); }
    setLoadingWeekly(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2416] flex items-center gap-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <Users className="h-7 w-7 text-[#D4864A]" />
            Staff Management
          </h1>
          <p className="text-sm text-[#B5A090] mt-1">Track performance and manage your team of stylists.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadWeekly}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#E8DDD2] text-[#7A6350] text-sm font-bold hover:bg-[#FAF5EE] transition-all flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Weekly Report
          </button>
          <button onClick={() => { setAddError(null); setIsAddingStaff(true); }}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center gap-2 shadow-lg"
            style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
            <UserPlus className="h-4 w-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white border border-[#F0E4D8] rounded-2xl animate-pulse" />)}
        </div>
      ) : staff.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-[#E8DDD2] rounded-[2rem] bg-white">
          <div className="h-20 w-20 rounded-2xl bg-[#FFF5ED] flex items-center justify-center text-[#D4864A] mb-6">
            <Users className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No staff members yet</h2>
          <p className="text-sm text-[#B5A090] mt-2 max-w-sm text-center">Add your stylists using their phone number to start tracking their performance.</p>
          <button onClick={() => { setAddError(null); setIsAddingStaff(true); }}
            className="mt-8 px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
            Add your first stylist
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {staff.map((s: any, index: number) => (
            <motion.div key={s.barberId || index} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
              className="group rounded-2xl bg-white border border-[#F0E4D8] hover:shadow-lg hover:border-[#D4864A]/30 transition-all overflow-hidden">
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                        {(s.user?.firstName || "S")[0]}{(s.user?.lastName || "T")[0]}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${s.available ? 'bg-green-500' : 'bg-red-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2C2416] text-base flex items-center gap-2">
                        {s.user?.firstName || "Staff"} {s.user?.lastName || ""}
                        {/* Toggle */}
                        <button onClick={() => handleToggle(s.barberId, s.available)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${s.available ? 'bg-green-500' : 'bg-[#E8DDD2]'}`}>
                          <motion.div animate={{ x: s.available ? 20 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </button>
                      </h3>
                      <p className="text-xs text-[#B5A090]">@{s.user?.username || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FAF5EE] rounded-xl p-3 border border-[#F0E4D8]">
                    <p className="text-[9px] text-[#B5A090] font-bold uppercase tracking-widest mb-1">Today&apos;s Work</p>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-bold text-[#2C2416]">{s.customersToday || 0}</span>
                      <TrendingUp className="h-4 w-4 text-[#548C71]" />
                    </div>
                  </div>
                  <div className="bg-[#FAF5EE] rounded-xl p-3 border border-[#F0E4D8]">
                    <p className="text-[9px] text-[#B5A090] font-bold uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-bold text-[#2C2416]">{(s.averageRating || 0).toFixed(1)}</span>
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#B5A090]">App Bookings</span>
                    <span className="text-[#2C2416] font-semibold">{s.appBookingsToday || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B5A090]">Manual Entries</span>
                    <span className="text-[#2C2416] font-semibold">{s.manualLogsToday || 0}</span>
                  </div>
                </div>

                <button onClick={() => { setSelectedStaff(s); setIsLogging(true); setLogCount(1); }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm border border-[#E8DDD2] text-[#7A6350] hover:bg-[#D4864A] hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Log Daily Work
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ══════ ADD STAFF MODAL ══════ */}
      <AnimatePresence>
        {isAddingStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddingStaff(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-[#E8DDD2] rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-[#FFF5ED] flex items-center justify-center text-[#D4864A]">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Add Staff</h2>
                    <p className="text-sm text-[#B5A090]">Invite a stylist by their phone number</p>
                  </div>
                </div>

                {addError && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    className="mb-5 px-4 py-3 rounded-xl bg-[#FCECEC] border border-[#FFD6D6] text-sm text-[#C25953] font-semibold">
                    {addError}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-2 block">Phone Number</label>
                    <input type="tel" value={newPhone}
                      onChange={(e) => { setNewPhone(e.target.value); if (addError) setAddError(null); }}
                      placeholder="+251..."
                      className="w-full h-14 bg-[#FAF5EE] border-2 border-[#E8DDD2] rounded-xl px-5 text-[#2C2416] text-lg focus:outline-none focus:border-[#D4864A] transition-all" />
                  </div>
                  <button onClick={handleAddStaff} disabled={addLoading || !newPhone}
                    className="w-full h-14 rounded-xl font-bold text-white text-sm disabled:opacity-50 transition-all"
                    style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                    {addLoading ? "Adding..." : "Add Stylist"}
                  </button>
                  <button onClick={() => setIsAddingStaff(false)}
                    className="w-full h-12 text-[#B5A090] font-bold hover:text-[#2C2416] transition-all text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════ LOG WORK MODAL ══════ */}
      <AnimatePresence>
        {isLogging && selectedStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsLogging(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-[#E8DDD2] rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-xl bg-[#FFF5ED] flex items-center justify-center text-[#D4864A]">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Log Daily Work</h2>
                    <p className="text-sm text-[#B5A090] italic">for {selectedStaff.user?.firstName || "Staff"}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-3 block">Number of Customers Served</label>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setLogCount(Math.max(1, logCount - 1))}
                        className="h-14 w-14 rounded-xl bg-[#FAF5EE] border border-[#E8DDD2] flex items-center justify-center text-2xl text-[#7A6350] hover:bg-[#F0E4D8] transition-all">
                        −
                      </button>
                      <div className="flex-1 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl py-3 text-center">
                        <span className="text-4xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{logCount}</span>
                      </div>
                      <button onClick={() => setLogCount(logCount + 1)}
                        className="h-14 w-14 rounded-xl bg-[#FAF5EE] border border-[#E8DDD2] flex items-center justify-center text-[#7A6350] hover:bg-[#F0E4D8] transition-all">
                        <Plus className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  <button onClick={handleLogSubmit} disabled={logLoading}
                    className="w-full h-16 rounded-xl font-bold text-white text-sm disabled:opacity-50 shadow-lg transition-all"
                    style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                    {logLoading ? "Submitting..." : "Confirm & Save"}
                  </button>
                  <button onClick={() => setIsLogging(false)}
                    className="w-full h-12 text-[#B5A090] font-bold hover:text-[#2C2416] transition-all text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════ WEEKLY REPORT MODAL ══════ */}
      <AnimatePresence>
        {isViewingWeekly && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsViewingWeekly(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white border border-[#E8DDD2] rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#FFF5ED] flex items-center justify-center text-[#D4864A]">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Weekly Report</h2>
                      <p className="text-sm text-[#B5A090] italic">Performance for the last 7 days</p>
                    </div>
                  </div>
                  <button onClick={() => setIsViewingWeekly(false)}
                    className="p-2 rounded-xl hover:bg-[#FAF5EE] text-[#B5A090] hover:text-[#2C2416] transition-all">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {loadingWeekly ? (
                  <div className="py-16 flex flex-col items-center gap-4">
                    <div className="h-10 w-10 rounded-full border-2 border-[#F0E4D8] border-t-[#D4864A] animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-[#B5A090]">Generating report...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#F0E4D8]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#FAF5EE]">
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">Stylist</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] text-center">Total Served</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] text-center">App Bookings</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] text-center">Manual</th>
                          <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] text-right">Daily Avg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0E4D8]">
                        {weeklyReport?.map((row: any) => (
                          <tr key={row.barberId} className="hover:bg-[#FAF5EE]/50 transition-colors">
                            <td className="px-6 py-5">
                              <span className="font-bold text-[#2C2416]">{row.barberName}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#FFF5ED] text-[#D4864A] font-bold text-lg">
                                {row.totalCustomers}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-center text-[#7A6350] font-medium">{row.appBookings}</td>
                            <td className="px-6 py-5 text-center text-[#7A6350] font-medium">{row.manualEntries}</td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-[#548C71] font-bold text-lg">{row.dailyAverage?.toFixed(1)}</span>
                                <span className="text-[9px] text-[#B5A090] font-bold uppercase tracking-widest">customers/day</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button onClick={() => setIsViewingWeekly(false)}
                    className="px-6 py-3 bg-[#FAF5EE] border border-[#E8DDD2] text-[#7A6350] font-bold text-sm rounded-xl hover:bg-[#F0E4D8] transition-all">
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
