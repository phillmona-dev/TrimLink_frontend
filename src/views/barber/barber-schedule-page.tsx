"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { bookingService } from "@/api/bookingService";
import { useAuth } from "@/hooks/use-auth";
import { formatEthiopianDate, formatEthiopianTime } from "@/utils/format";
import { Calendar, Clock, Lock, Unlock, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BarberSchedulePage() {
  const { session } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchSlots = async () => {
    if (!session?.userId) return;
    setIsLoading(true);
    try {
      // Use a default duration of 30 mins to visualize the day
      const data = await bookingService.getSlots({
        barberId: session.userId,
        serviceId: "00000000-0000-0000-0000-000000000000", // Dummy/Generic for schedule view
        date: selectedDate
      });
      setSlots(data);
    } catch (err) {
      console.error("Failed to fetch slots", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedDate, session?.userId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleSlot = async (slot: any) => {
    try {
      if (slot.available) {
        // Block the slot
        await bookingService.blockSlot(slot.startTime, slot.endTime);
        showToast("Slot closed successfully");
      } else if (slot.status === "BLOCKED") {
        // Unblock the slot
        // Find the appointment ID from the slot (we might need to update the backend to return apptId in slot)
        // For now, assume the backend returns 'appointmentId' in slot if it's blocked
        if (slot.appointmentId) {
          await bookingService.unblockSlot(slot.appointmentId);
          showToast("Slot opened successfully");
        } else {
          showToast("Cannot unblock: Slot is occupied by a booking");
          return;
        }
      } else {
        showToast("This slot is occupied by a customer booking");
        return;
      }
      fetchSlots();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Action failed");
    }
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Daily Schedule</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">
            Manage your availability for <span className="text-orange-400">{formatEthiopianDate(selectedDate)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-2xl">
          <Button variant="outline" size="icon" onClick={() => changeDate(-1)} className="rounded-xl border-white/5 h-10 w-10">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="px-4 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-orange-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-white font-black text-sm focus:outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => changeDate(1)} className="rounded-xl border-white/5 h-10 w-10">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <Card className="border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2.5rem]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">Syncing your calendar...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-white/30 font-bold">No slots available for this day.</p>
            <p className="text-white/10 text-xs">The shop might be closed or working hours are not set.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {slots.map((slot, idx) => {
              const isBlocked = !slot.available && slot.status === "BLOCKED";
              const isOccupied = !slot.available && slot.status !== "BLOCKED";
              
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => !isOccupied && handleToggleSlot(slot)}
                  className={`relative overflow-hidden cursor-pointer p-5 rounded-3xl border transition-all active:scale-95 group ${
                    isOccupied 
                      ? "bg-white/[0.02] border-white/5 grayscale pointer-events-none opacity-50" 
                      : isBlocked
                        ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                        : "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-xl ${isBlocked ? "bg-red-500/20 text-red-400" : isOccupied ? "bg-white/5 text-white/20" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {isBlocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </div>
                    <Badge className={`text-[9px] font-black uppercase tracking-tighter rounded-lg border-none ${
                      isOccupied ? "bg-white/10 text-white/40" : isBlocked ? "bg-red-500 text-white" : "bg-emerald-500 text-black"
                    }`}>
                      {isOccupied ? "Occupied" : isBlocked ? "Closed" : "Open"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <p className={`text-xl font-black ${isOccupied ? "text-white/20" : "text-white"}`}>
                      {formatEthiopianTime(slot.startTime)}
                    </p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isOccupied ? "text-white/10" : "text-white/30"}`}>
                      Slot Duration: 30m
                    </p>
                  </div>

                  {/* Hover Indicator */}
                  {!isOccupied && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-0 group-hover:opacity-10 transition-opacity" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-[2.5rem] flex items-start gap-4">
        <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-white font-black">How to use</h4>
          <p className="text-white/40 text-sm mt-1 leading-relaxed">
            Click on any <span className="text-emerald-400 font-bold">Open</span> slot to manually close it. 
            Closed slots will not be visible to customers. 
            Slots marked as <span className="text-white/60 font-bold">Occupied</span> are already booked by customers and cannot be changed here.
          </p>
        </div>
      </div>
    </div>
  );
}
