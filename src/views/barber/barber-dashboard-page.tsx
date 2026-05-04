"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import { ownerService } from "@/api/ownerService";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StatCard } from "@/components/widgets/stat-card";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { formatDateTime } from "@/utils/format";
import { Play, CheckCircle, Clock, User, AlertCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/common/badge";

export function BarberDashboardPage() {
  const queryClient = useQueryClient();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["shop-stats"],
    queryFn: ownerService.getShopStats
  });

  const { data: inProgress } = useQuery({
    queryKey: ["barber-bookings", "IN_PROGRESS"],
    queryFn: () => bookingService.getBarberAppointments("IN_PROGRESS")
  });

  const { data: upcoming } = useQuery({
    queryKey: ["barber-bookings", "CONFIRMED"],
    queryFn: () => bookingService.getBarberAppointments("CONFIRMED")
  });

  const { data: pending } = useQuery({
    queryKey: ["barber-bookings", "PENDING"],
    queryFn: () => bookingService.getBarberAppointments("PENDING")
  });

  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const startMutation = useMutation({
    mutationFn: bookingService.startAppointment,
    onSuccess: () => {
      showToast("Service started!");
      queryClient.invalidateQueries({ queryKey: ["barber-bookings"] });
    },
    onError: (err: any) => showToast(err?.response?.data?.message || "Failed to start service")
  });

  const completeMutation = useMutation({
    mutationFn: bookingService.completeAppointment,
    onSuccess: () => {
      showToast("Service completed!");
      queryClient.invalidateQueries({ queryKey: ["barber-bookings"] });
    },
    onError: (err: any) => showToast(err?.response?.data?.message || "Failed to complete service")
  });

  const confirmMutation = useMutation({
    mutationFn: bookingService.confirmAppointment,
    onSuccess: () => {
      showToast("Booking approved!");
      queryClient.invalidateQueries({ queryKey: ["barber-bookings"] });
    },
    onError: (err: any) => showToast(err?.response?.data?.message || "Failed to approve booking")
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => bookingService.rejectAppointment(id, "Payment verification failed or slot unavailable"),
    onSuccess: () => {
      showToast("Booking rejected!");
      queryClient.invalidateQueries({ queryKey: ["barber-bookings"] });
    },
    onError: (err: any) => showToast(err?.response?.data?.message || "Failed to reject booking")
  });
  
  const paymentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => bookingService.updatePaymentStatus(id, status),
    onSuccess: () => {
      showToast("Payment status updated!");
      queryClient.invalidateQueries({ queryKey: ["barber-bookings"] });
    },
    onError: (err: any) => showToast(err?.response?.data?.message || "Failed to update payment status")
  });

  const activeAppt = inProgress?.content?.[0];

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-orange-500 text-black px-4 py-3 rounded-xl font-bold shadow-lg z-50 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-4">
        <StatCard label="Today’s bookings" value={upcoming?.totalElements || 0} helper="Confirmed sessions" />
        <StatCard label="Queue Traffic" value={stats?.queueTraffic || 0} helper={stats?.queueHelper || "Steady pace"} />
        <StatCard label="Earnings Today" value={stats?.revenueToday || "0 ETB"} helper={stats?.revenueHelper || "Daily total"} />
        <StatCard label="Repeat Rate" value={stats?.repeatCustomerRate || "0%"} helper="Customer loyalty" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Active Session */}
          <Card className="relative overflow-hidden border-orange-500/20 bg-orange-500/5">
            <div className="absolute top-0 right-0 p-4">
              {activeAppt && <div className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-black text-[10px] font-black uppercase tracking-tighter rounded-full animate-pulse">Live Now</div>}
            </div>
            
            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-6">Current Active Session</h3>
            
            {activeAppt ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-3xl bg-orange-500 flex items-center justify-center text-black">
                    <User className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-white">{activeAppt.customerName}</h4>
                    <p className="text-orange-400 font-bold text-lg">{activeAppt.serviceName}</p>
                    <div className="flex items-center gap-2 mt-2 text-white/40">
                      <Clock className="w-4 h-4" />
                      <span>Started at {formatDateTime(activeAppt.scheduledStart)}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => completeMutation.mutate(activeAppt.id)}
                  className="w-full sm:w-auto bg-white hover:bg-white/90 text-black h-16 px-8 rounded-2xl font-black text-lg shadow-2xl shadow-white/10 transition-all active:scale-95"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Finish Cut
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/20">
                  <Play className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white/40">No active session</h4>
                <p className="text-white/20 text-sm">Start a cut from your upcoming bookings below.</p>
              </div>
            )}
          </Card>

          <RevenueChart 
            title="Weekly Performance" 
            data={stats?.revenueTrend || []} 
          />
        </div>

        {/* Right Column: Pending & Upcoming */}
        <div className="space-y-6">
          {/* Pending Requests */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest px-2 flex items-center justify-between">
              Pending Requests
              {pending?.totalElements ? <Badge className="bg-orange-500 text-black border-none">{pending.totalElements}</Badge> : null}
            </h3>
            <div className="space-y-4">
              {pending?.content?.map((appt) => (
                <div key={appt.id} className="p-5 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-orange-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-white/40">{formatDateTime(appt.scheduledStart)}</span>
                    <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Awaiting Approval</Badge>
                  </div>
                  <h4 className="font-bold text-white">{appt.customerName}</h4>
                  <p className="text-xs text-white/40 mt-1">{appt.serviceName}</p>
                  
                  {appt.receiptImageUrl && (
                    <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-white/60">Payment Receipt Attached</span>
                      </div>
                      <button 
                        onClick={() => setSelectedReceipt(appt.receiptImageUrl!)}
                        className="text-[10px] font-black text-orange-400 hover:text-orange-300 uppercase tracking-widest"
                      >
                        View
                      </button>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Payment Status</span>
                    <select 
                      value={appt.paymentStatus} 
                      onChange={(e) => paymentMutation.mutate({ id: appt.id, status: e.target.value })}
                      className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white outline-none focus:border-orange-500 transition-all"
                    >
                      <option value="UNPAID" className="bg-ink-950">Unpaid</option>
                      <option value="PARTIALLY_PAID" className="bg-ink-950">Partially Paid</option>
                      <option value="PAID" className="bg-ink-950">Paid</option>
                      <option value="PENDING" className="bg-ink-950">Pending</option>
                      <option value="SUCCESS" className="bg-ink-950">Success</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button 
                      onClick={() => rejectMutation.mutate(appt.id)}
                      variant="outline" 
                      className="rounded-2xl h-12 border-white/5 bg-white/5 text-white/40 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-xs font-bold"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={() => confirmMutation.mutate(appt.id)}
                      className="bg-orange-500 hover:bg-orange-400 text-black rounded-2xl h-12 font-bold text-xs"
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              ))}
              {(!pending?.content || pending.content.length === 0) && (
                <div className="text-center py-6 text-white/10 text-xs border border-dashed border-white/5 rounded-3xl">
                  No new requests
                </div>
              )}
            </div>
          </div>

          <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest px-2">Up Next</h3>
          <div className="space-y-4">
            {upcoming?.content?.map((appt) => (
              <div key={appt.id} className="p-5 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-orange-400/80">{formatDateTime(appt.scheduledStart)}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Confirmed</Badge>
                </div>
                <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">{appt.customerName}</h4>
                <p className="text-xs text-white/40 mt-1">{appt.serviceName}</p>

                <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Payment Status</span>
                  <select 
                    value={appt.paymentStatus} 
                    onChange={(e) => paymentMutation.mutate({ id: appt.id, status: e.target.value })}
                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white outline-none focus:border-orange-500 transition-all"
                  >
                    <option value="UNPAID" className="bg-ink-950">Unpaid</option>
                    <option value="PARTIALLY_PAID" className="bg-ink-950">Partially Paid</option>
                    <option value="PAID" className="bg-ink-950">Paid</option>
                    <option value="PENDING" className="bg-ink-950">Pending</option>
                    <option value="SUCCESS" className="bg-ink-950">Success</option>
                  </select>
                </div>

                <Button 
                  onClick={() => startMutation.mutate(appt.id)}
                  className="w-full mt-6 bg-white/5 hover:bg-orange-500 hover:text-black border border-white/10 hover:border-transparent rounded-2xl h-12 font-bold transition-all"
                >
                  Start Service
                </Button>
              </div>
            ))}
            {(!upcoming?.content || upcoming.content.length === 0) && (
              <div className="text-center py-10 text-white/20">No upcoming bookings</div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full bg-white/5 border border-white/10 p-4 rounded-[2.5rem]"
            >
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-orange-500 text-black rounded-full flex items-center justify-center hover:bg-orange-400 transition-all shadow-2xl z-50"
                aria-label="Close"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <img 
                src={selectedReceipt} 
                alt="Payment Receipt" 
                className="w-full h-auto rounded-[2rem] shadow-2xl"
              />
              <div className="mt-4 text-center">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Customer Payment Proof</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
