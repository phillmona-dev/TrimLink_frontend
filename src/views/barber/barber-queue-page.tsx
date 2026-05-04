"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Badge } from "@/components/common/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { http } from "@/api/http";
import { formatEthiopianDateTime } from "@/utils/format";
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
import { Search, Filter, AlertCircle, CheckCircle2, Clock, XCircle, Copy, Eye, Phone, User, CalendarDays } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import { useAuth } from "@/hooks/use-auth";
import { WS_BASE_URL } from "@/utils/constants";

export function BarberQueuePage() {
  const { session } = useAuth();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDate, setFilterDate] = useState("");

  // 1. Initial Fetch of Pending Bookings
  const { data: initialData, refetch, isLoading } = useQuery({
    queryKey: ["bookings", filterStatus, session?.userId, search, filterDate],
    queryFn: () => bookingService.getBarberAppointments(filterStatus, 0, search, filterDate),
    enabled: !!session?.userId
  });

  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [rejectingAppt, setRejectingAppt] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<any>(null);

  useEffect(() => {
    if (initialData?.content) setPendingBookings(initialData.content);
    else if (initialData && Array.isArray(initialData)) setPendingBookings(initialData); // Fallback for safety
  }, [initialData]);

  // 2. Real-time Updates via WebSocket (only for PENDING)
  const { connected } = useWebSocket({
    url: WS_BASE_URL,
    topic: `/topic/barbers/${session?.userId}/bookings`,
    onMessage: (booking) => {
      if (filterStatus === "PENDING") {
        setToastMsg(`New booking request from ${booking.customerName}!`);
        setPendingBookings((prev) => [booking, ...prev]);
        setTimeout(() => setToastMsg(null), 5000);
      }
    },
    enabled: !!session?.userId,
  });

  const handleAction = async (appointmentId: string, action: "confirm" | "reject" | "reschedule", reason?: string) => {
    try {
      let url = `/bookings/${appointmentId}/${action}`;
      if (reason) url += `?reason=${encodeURIComponent(reason)}`;
      
      await http.patch(url);
      setPendingBookings((prev) => prev.filter(b => b.id !== appointmentId));
      
      const actionDisplay = action === "confirm" ? "Approved" : action === "reject" ? "Rejected" : "Rescheduled";
      setToastMsg(`Booking successfully ${actionDisplay.toLowerCase()}!`);
      setTimeout(() => setToastMsg(null), 5000);

      if (action === "reject") {
        setRejectingAppt(null);
        setRejectReason("");
      }
    } catch (err: any) {
      console.error(`Failed to ${action} booking`, err);
      const errorMsg = err?.response?.data?.message || `Failed to ${action} booking. Please try again.`;
      setToastMsg(errorMsg);
      setTimeout(() => setToastMsg(null), 5000);
    }
  };

  const handleCopyPhone = async (phone: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(phone);
        setToastMsg("Phone number copied to clipboard!");
        setTimeout(() => setToastMsg(null), 3000);
        return;
      } catch (err) {
        console.error("Clipboard API failed", err);
      }
    }
    
    // Fallback for insecure contexts (like local network IPs)
    try {
      const textArea = document.createElement("textarea");
      textArea.value = phone;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      if (successful) {
        setToastMsg("Phone number copied to clipboard!");
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch (err) {
      console.error("Fallback copy failed", err);
    }
  };

  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-orange-500 text-black px-4 py-3 rounded-xl font-bold shadow-lg z-50 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

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

      <Card className="border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2.5rem] text-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              {filterStatus === "ALL" ? "All Bookings" : filterStatus === "PENDING" ? "Pending Approvals" : `${filterStatus} Bookings`}
            </h2>
            <div className="mt-1 text-xs font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-orange-500 animate-pulse"}`} />
              {connected ? "Live System Active" : "Connecting..."}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : pendingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-white/20">
               <Search className="w-12 h-12 mb-4" />
               <p className="text-sm font-bold uppercase tracking-widest">No matching bookings</p>
            </div>
          ) : (
            pendingBookings.map((booking, idx) => (
              <div key={idx} className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:bg-white/[0.05] transition-all">
                <div className="space-y-1 w-full lg:w-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">{booking.customerName}</h3>
                        {booking.ticketNumber && (
                          <span className="bg-orange-500/20 text-orange-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-orange-500/30">
                            {booking.ticketNumber}
                          </span>
                        )}
                      </div>
                      <Badge className={`w-fit px-2 py-0.5 rounded-full font-black uppercase tracking-tighter text-[9px] ${
                        booking.status === 'IN_PROGRESS' ? 'bg-orange-500 text-black border-transparent' :
                        booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        booking.status === 'PENDING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-white/5 text-white/30 border-white/5'
                      }`}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-[11px] font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{booking.serviceName} at <b>{formatEthiopianDateTime(booking.scheduledStart)}</b></span>
                  </div>
                  {booking.receiptImageUrl && (
                    <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 border border-orange-400/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Payment Proof
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  <Button onClick={() => setSelectedDetailBooking(booking)} variant="outline" className="h-9 text-xs rounded-xl border-white/10 text-white hover:bg-white/10 flex-1 lg:flex-none font-bold">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Details
                  </Button>
                  {booking.receiptImageUrl && (
                    <Button onClick={() => setSelectedReceipt(booking.receiptImageUrl)} variant="outline" className="h-9 text-xs rounded-xl border-white/10 text-white hover:bg-white/10 flex-1 lg:flex-none font-bold">
                      View Receipt
                    </Button>
                  )}
                  {booking.status === "PENDING" && (
                    <>
                      <Button onClick={() => handleAction(booking.id, "confirm")} className="h-9 text-xs rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex-1 lg:flex-none font-black shadow-lg shadow-emerald-500/20">
                        Approve
                      </Button>
                      <Button onClick={() => handleAction(booking.id, "reschedule")} variant="outline" className="h-9 text-xs rounded-xl border-orange-500/50 text-orange-400 hover:bg-orange-500/10 flex-1 lg:flex-none font-bold">
                        Reschedule
                      </Button>
                      <Button onClick={() => setRejectingAppt(booking)} variant="outline" className="h-9 text-xs rounded-xl border-red-500/50 text-red-400 hover:bg-red-500/10 flex-1 lg:flex-none font-bold">
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      
      {/* Queue Caller Section remains similar but styled better if needed */}
      <Card className="border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2.5rem] text-white">
        <h2 className="text-3xl font-black text-white">Service Management</h2>
        <div className="mt-8 rounded-3xl bg-orange-500/5 border border-orange-500/10 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="text-xs font-bold text-orange-400/50 uppercase tracking-[0.2em] mb-2">Current caller</div>
            <div className="text-7xl font-black text-orange-400">#--</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button className="rounded-2xl h-14 px-8 font-black bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/5">Call next</Button>
            <Button variant="outline" className="rounded-2xl h-14 px-8 font-bold border-white/10">Start service</Button>
            <Button variant="outline" className="rounded-2xl h-14 px-8 font-bold border-white/10">Complete</Button>
          </div>
        </div>
      </Card>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectingAppt} onOpenChange={(open) => !open && setRejectingAppt(null)}>
        <DialogContent className="bg-ink-950 border-white/10 text-white rounded-[2rem] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">Reject Appointment</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 mt-1 shrink-0" />
              <p className="text-xs text-red-200/60 leading-relaxed">
                You are about to reject <b>{rejectingAppt?.customerName}'s</b> booking for {rejectingAppt?.serviceName}. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Reason for Rejection</p>
              <Textarea 
                placeholder="e.g. Fully booked for this slot, Barber unavailable..."
                className="bg-white/5 border-white/10 rounded-2xl h-32 focus:border-red-500/50"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setRejectingAppt(null)} className="rounded-xl border-white/10">
              Cancel
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl"
              disabled={!rejectReason}
              onClick={() => handleAction(rejectingAppt.id, "reject", rejectReason)}
            >
              Reject Booking
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
              className="absolute top-4 right-4 w-12 h-12 bg-orange-500 text-black rounded-full flex items-center justify-center hover:bg-orange-400 transition-all shadow-2xl z-[110]"
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
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedDetailBooking} onOpenChange={(open) => !open && setSelectedDetailBooking(null)}>
        <DialogContent className="bg-ink-950 border-white/10 text-white rounded-[2rem] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedDetailBooking && (
            <div className="py-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{selectedDetailBooking.customerName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-sm font-bold text-white/70">{selectedDetailBooking.customerPhone || "No phone provided"}</span>
                    {selectedDetailBooking.customerPhone && (
                      <button 
                        onClick={() => handleCopyPhone(selectedDetailBooking.customerPhone)}
                        className="ml-2 p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Scheduled Time</p>
                  <p className="text-sm font-bold text-white/80">{formatEthiopianDateTime(selectedDetailBooking.scheduledStart)}</p>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Duration</p>
                  <p className="text-sm font-bold text-white/80">{selectedDetailBooking.serviceDurationMinutes} Minutes</p>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Service Requested</p>
                  <p className="text-base font-bold text-white">{selectedDetailBooking.serviceName}</p>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Price Charged</p>
                  <p className="text-lg font-black text-orange-400">{selectedDetailBooking.priceCharged} ETB</p>
                </div>
              </div>
              
              {selectedDetailBooking.notes && (
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Customer Notes</p>
                  <p className="text-sm text-white/70 italic">"{selectedDetailBooking.notes}"</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDetailBooking(null)} className="w-full rounded-xl border-white/10 font-bold">
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
