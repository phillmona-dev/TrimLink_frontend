"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { formatEthiopianDateTime } from "@/utils/format";
import { Play, CheckCircle, XCircle, Clock, Search, Filter, AlertCircle } from "lucide-react";
import { Badge } from "@/components/common/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/common/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/common/select";
import { Textarea } from "@/components/common/textarea";

export function OwnerBookingsPage() {
  const queryClient = useQueryClient();
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");
  const [rejectingAppt, setRejectingAppt] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const { data: bookingsPage, isLoading } = useQuery({
    queryKey: ["barber-bookings", filterStatus, search, filterDate],
    queryFn: () => bookingService.getBarberAppointments(filterStatus, 0, search, filterDate)
  });

  const confirmMutation = useMutation({
    mutationFn: bookingService.confirmAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barber-bookings"] })
  });

  const startMutation = useMutation({
    mutationFn: bookingService.startAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barber-bookings"] })
  });

  const completeMutation = useMutation({
    mutationFn: bookingService.completeAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barber-bookings"] })
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => 
      fetch(`/api/v1/bookings/${id}/reject?reason=${encodeURIComponent(reason)}`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barber-bookings"] });
      setRejectingAppt(null);
      setRejectReason("");
    }
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => bookingService.updatePaymentStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["barber-bookings"] })
  });

  const bookings = bookingsPage?.content || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input 
            placeholder="Search by customer name..." 
            className="pl-12 bg-white/5 border-white/5 rounded-2xl h-14 text-sm focus:border-orange-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-14">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/20" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <div className="bg-white/5 border border-white/10 rounded-2xl h-14 px-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/20" />
            <input 
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-white text-xs font-bold focus:outline-none appearance-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      <Card className="rounded-[2.5rem] p-8 border-white/5 bg-black/30 backdrop-blur-md">
        <h2 className="text-3xl font-black text-white">Booking Management</h2>
        <p className="text-sm text-white/30 mt-1">Manage live appointments and track service progress.</p>
        
        <div className="mt-8 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-white/10 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center">
              <Clock className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">No matching appointments</p>
            </div>
          ) : (
            bookings.map((appointment) => (
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 rounded-[2rem] bg-white/[0.03] border border-white/5 p-6 transition-all hover:bg-white/[0.06] group" key={appointment.id}>
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    appointment.status === 'IN_PROGRESS' ? 'bg-orange-500/20 text-orange-500 animate-pulse' :
                    appointment.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-white/5 text-white/20'
                  }`}>
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-black text-xl text-white group-hover:text-orange-400 transition-colors">{appointment.serviceName}</div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-xs font-bold text-white/40">{formatEthiopianDateTime(appointment.scheduledStart)}</span>
                      <span className="text-white/10">•</span>
                      <span className="text-xs font-black text-orange-400/80 uppercase tracking-wider">{appointment.customerName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  <Badge className={`px-4 py-2 rounded-full font-black uppercase tracking-tighter text-[10px] ${
                    appointment.status === 'IN_PROGRESS' ? 'bg-orange-500 text-black border-transparent' :
                    appointment.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    'bg-white/5 text-white/30 border-white/5'
                  }`}>
                    {appointment.status.replace('_', ' ')}
                  </Badge>

                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Payment</span>
                    <Select 
                      value={appointment.paymentStatus} 
                      onValueChange={(val) => paymentMutation.mutate({ id: appointment.id, status: val })}
                    >
                      <SelectTrigger className="h-11 w-[140px] border-white/10 bg-black/40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {appointment.status === 'PENDING' && (
                    <div className="flex items-center gap-2 flex-1 xl:flex-none">
                      {appointment.receiptImageUrl && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-white/10 text-white hover:bg-white/10 rounded-xl h-11 px-6 font-bold flex-1 xl:flex-none"
                          onClick={() => setSelectedReceipt(appointment.receiptImageUrl!)}
                        >
                          View Receipt
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl h-11 px-8 font-black flex-1 xl:flex-none shadow-lg shadow-emerald-500/20"
                        onClick={() => confirmMutation.mutate(appointment.id)}
                      >
                        Confirm
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl h-11 px-6 font-bold flex-1 xl:flex-none"
                        onClick={() => setRejectingAppt(appointment)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {appointment.status === 'CONFIRMED' && (
                    <Button 
                      size="sm" 
                      className="bg-orange-500 hover:bg-orange-400 text-black rounded-xl h-11 px-8 font-black flex-1 xl:flex-none shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                      onClick={() => startMutation.mutate(appointment.id)}
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start Service
                    </Button>
                  )}

                  {appointment.status === 'IN_PROGRESS' && (
                    <Button 
                      size="sm" 
                      className="bg-white hover:bg-gray-100 text-black rounded-xl h-11 px-8 font-black flex-1 xl:flex-none shadow-lg shadow-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                      onClick={() => completeMutation.mutate(appointment.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectingAppt} onOpenChange={(open) => !open && setRejectingAppt(null)}>
        <DialogContent className="bg-ink-950 border-white/10 text-white rounded-[2.5rem] sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white">Reject Appointment</DialogTitle>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
              <p className="text-xs text-red-200/60 leading-relaxed font-medium">
                You are rejecting <b>{rejectingAppt?.customerName}'s</b> booking. Please provide a brief reason for the customer.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 px-1">Rejection Reason</p>
              <Textarea 
                placeholder="e.g., Slot unavailable, Barber on leave..."
                className="bg-white/5 border-white/10 rounded-2xl h-32 focus:border-red-500/50 text-sm p-4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setRejectingAppt(null)} className="rounded-2xl border-white/10 h-12 px-6">
              Cancel
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl h-12 px-8 shadow-xl shadow-red-500/20"
              disabled={!rejectReason || rejectMutation.isPending}
              onClick={() => rejectMutation.mutate({ id: rejectingAppt.id, reason: rejectReason })}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full bg-white/5 border border-white/10 p-4 rounded-[2.5rem]">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              ×
            </button>
            <img 
              src={selectedReceipt} 
              alt="Payment Receipt" 
              className="w-full h-auto rounded-[2rem] shadow-2xl"
            />
            <div className="mt-4 text-center">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Customer Payment Proof</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
