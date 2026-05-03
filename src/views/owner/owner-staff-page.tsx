"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ownerService, type StaffPerformance } from "@/api/ownerService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { 
  Users, 
  TrendingUp, 
  Plus, 
  Calendar, 
  Star, 
  MoreVertical,
  CheckCircle2,
  Clock,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function OwnerStaffPage() {
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState<StaffPerformance | null>(null);
  const [logCount, setLogCount] = useState(1);
  const [isLogging, setIsLogging] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [isViewingWeeklyReport, setIsViewingWeeklyReport] = useState(false);
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const { data: staff, isLoading } = useQuery({
    queryKey: ["owner-staff-performance"],
    queryFn: ownerService.getStaffPerformance,
  });

  const { data: weeklyReport, isLoading: isLoadingWeekly } = useQuery({
    queryKey: ["owner-weekly-report"],
    queryFn: ownerService.getWeeklyReport,
    enabled: isViewingWeeklyReport
  });

  const logMutation = useMutation({
    mutationFn: (vars: { staffId: string; count: number }) => 
      ownerService.logDailyWork(vars.staffId, vars.count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-staff-performance"] });
      queryClient.invalidateQueries({ queryKey: ["owner-weekly-report"] });
      setIsLogging(false);
      setSelectedStaff(null);
      setLogCount(1);
    }
  });

  const addStaffMutation = useMutation({
    mutationFn: (phone: string) => ownerService.addStaff(phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-staff-performance"] });
      setIsAddingStaff(false);
      setNewStaffPhone("");
      setAddError(null);
    },
    onError: (error: any) => {
      setAddError(error.message || "Failed to add staff member.");
    }
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: (vars: { staffId: string; available: boolean }) => 
      ownerService.toggleStaffAvailability(vars.staffId, vars.available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-staff-performance"] });
    }
  });

  const handleLogSubmit = () => {
    if (selectedStaff) {
      logMutation.mutate({ 
        staffId: selectedStaff.staffId, 
        count: logCount 
      });
    }
  };

  const handleToggleAvailability = (staffId: string, currentStatus: boolean) => {
    toggleAvailabilityMutation.mutate({ staffId, available: !currentStatus });
  };

  const handleAddStaff = () => {
    setAddError(null);
    if (newStaffPhone.trim()) {
      addStaffMutation.mutate(newStaffPhone);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            Staff Management
          </h1>
          <p className="text-white/50 mt-1">Track performance and manage your team of staffs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsViewingWeeklyReport(true)}
            variant="outline" 
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white/70"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Weekly Report
          </Button>
          <Button 
            onClick={() => {
              setAddError(null);
              setIsAddingStaff(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {staff?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5"
        >
          <div className="w-20 h-20 rounded-3xl bg-orange-500/20 flex items-center justify-center text-orange-500 mb-6">
            <Users className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white text-center">No staff members yet</h2>
          <p className="text-white/40 text-center mt-2 max-w-sm">
            Add your staffs using their phone number to start tracking their performance.
          </p>
          <Button 
            onClick={() => {
              setAddError(null);
              setIsAddingStaff(true);
            }}
            className="mt-8 bg-white text-black hover:bg-white/90 rounded-2xl px-8"
          >
            Add your first staff
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl" />
            ))
          ) : staff?.map((staff, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={staff.user.id}
            >
              <Card className="group relative overflow-hidden border-white/5 bg-black/40 backdrop-blur-xl p-0 hover:border-orange-500/30 transition-all duration-300">
                {/* Background Glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 blur-3xl group-hover:bg-orange-500/20 transition-all" />
                
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white/10">
                           {staff.user.firstName[0]}{staff.user.lastName[0]}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-black rounded-full transition-colors ${staff.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                          {staff.user.firstName} {staff.user.lastName}
                          {/* Premium On/Off Toggle */}
                          <div 
                            onClick={() => handleToggleAvailability(staff.staffId, staff.available)}
                            className={`relative w-12 h-6 rounded-full cursor-pointer p-1 transition-colors duration-300 ${
                              staff.available ? 'bg-emerald-500' : 'bg-white/10'
                            }`}
                          >
                            <motion.div 
                              animate={{ x: staff.available ? 24 : 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                            {/* Subtle Status Text next to toggle */}
                            <span className={`absolute left-14 text-[10px] font-black uppercase tracking-widest ${
                              staff.available ? 'text-emerald-400' : 'text-white/20'
                            }`}>
                              {staff.available ? 'On' : 'Off'}
                            </span>
                          </div>
                        </h3>
                        <p className="text-white/40 text-sm">@{staff.user.username}</p>
                      </div>
                    </div>
                    <button className="p-2 text-white/30 hover:text-white transition">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">Today's Work</p>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-black text-white">{staff.customersToday}</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-xs text-white/40 font-medium uppercase tracking-wider mb-1">Rating</p>
                      <div className="flex items-end justify-between">
                        <span className="text-2xl font-black text-white">{staff.averageRating.toFixed(1)}</span>
                        <Star className="w-4 h-4 text-amber-400 mb-1 fill-amber-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">App Bookings</span>
                      <span className="text-white/80 font-medium">{staff.appBookingsToday}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">Manual Entries</span>
                      <span className="text-white/80 font-medium">{staff.manualLogsToday}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      setSelectedStaff(staff);
                      setIsLogging(true);
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl py-6 group-hover:bg-orange-500 group-hover:text-white group-hover:border-transparent transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Register Daily Work
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isAddingStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingStaff(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Add Staff</h2>
                    <p className="text-white/40">Invite a staff by their phone number</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {addError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex gap-3 items-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                        !
                      </div>
                      <p className="text-red-400 text-sm font-bold">{addError}</p>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">
                      Phone Number
                    </label>
                    <input 
                      type="tel"
                      value={newStaffPhone}
                      onChange={(e) => {
                        setNewStaffPhone(e.target.value);
                        if (addError) setAddError(null);
                      }}
                      placeholder="+251..."
                      className={`w-full h-14 bg-white/5 border ${addError ? 'border-red-500/30' : 'border-white/10'} rounded-2xl px-6 text-white text-lg focus:outline-none focus:border-orange-500 transition`}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={handleAddStaff}
                      disabled={addStaffMutation.isPending || !newStaffPhone}
                      className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl"
                    >
                      {addStaffMutation.isPending ? "Adding..." : "Add Staff"}
                    </Button>
                    <button 
                      onClick={() => setIsAddingStaff(false)}
                      className="w-full h-12 text-white/30 font-bold hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Weekly Report Modal */}
      <AnimatePresence>
        {isViewingWeeklyReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewingWeeklyReport(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-zinc-950/80 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl backdrop-blur-2xl"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">Weekly Report</h2>
                      <p className="text-white/40 italic">Performance for the last 7 days</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsViewingWeeklyReport(false)}
                    className="p-3 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition"
                  >
                    ×
                  </button>
                </div>

                {isLoadingWeekly ? (
                  <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                    <p className="text-white/40 font-bold tracking-widest uppercase text-xs">Generating report...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="pb-4 text-xs font-black text-white/30 uppercase tracking-widest">Staff</th>
                          <th className="pb-4 text-xs font-black text-white/30 uppercase tracking-widest text-center">Total Served</th>
                          <th className="pb-4 text-xs font-black text-white/30 uppercase tracking-widest text-center">App Bookings</th>
                          <th className="pb-4 text-xs font-black text-white/30 uppercase tracking-widest text-center">Manual</th>
                          <th className="pb-4 text-xs font-black text-white/30 uppercase tracking-widest text-right">Daily Avg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {weeklyReport?.map((row) => (
                          <tr key={row.staffId} className="group hover:bg-white/[0.02] transition">
                            <td className="py-6 pr-4">
                              <span className="text-white font-bold text-lg">{row.staffName}</span>
                            </td>
                            <td className="py-6 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 font-black text-lg">
                                {row.totalCustomers}
                              </span>
                            </td>
                            <td className="py-6 px-4 text-center">
                              <span className="text-white/60 font-medium">{row.appBookings}</span>
                            </td>
                            <td className="py-6 px-4 text-center">
                              <span className="text-white/60 font-medium">{row.manualEntries}</span>
                            </td>
                            <td className="py-6 pl-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-emerald-400 font-black text-lg">{row.dailyAverage.toFixed(1)}</span>
                                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">customers/day</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-10 flex justify-end">
                  <Button 
                    onClick={() => setIsViewingWeeklyReport(false)}
                    className="bg-white/5 border border-white/10 text-white font-bold rounded-2xl px-8 hover:bg-white/10"
                  >
                    Close Report
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Modal */}
      <AnimatePresence>
        {isLogging && selectedStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogging(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Log Daily Work</h2>
                    <p className="text-white/40 italic">for {selectedStaff.user.firstName}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-white/50 uppercase tracking-widest px-1">
                      Number of Customers Served
                    </label>
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setLogCount(Math.max(1, logCount - 1))}
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition"
                      >
                        <span className="text-2xl">-</span>
                      </button>
                      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 text-center">
                        <span className="text-4xl font-black text-white">{logCount}</span>
                      </div>
                      <button 
                        onClick={() => setLogCount(logCount + 1)}
                        className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button 
                      onClick={handleLogSubmit}
                      disabled={logMutation.isPending}
                      className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/20"
                    >
                      {logMutation.isPending ? "Submitting..." : "Confirm & Save"}
                    </Button>
                    <button 
                      onClick={() => setIsLogging(false)}
                      className="w-full h-14 text-white/30 font-bold hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
