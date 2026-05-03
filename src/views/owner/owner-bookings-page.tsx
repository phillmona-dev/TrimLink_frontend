"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { formatDateTime } from "@/utils/format";
import { Play, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/common/badge";

export function OwnerBookingsPage() {
  const queryClient = useQueryClient();
  
  const { data: bookingsPage, isLoading } = useQuery({
    queryKey: ["staff-bookings", "PENDING"],
    queryFn: () => bookingService.getStaffAppointments("PENDING")
  });

  const { data: activeBookings } = useQuery({
    queryKey: ["staff-bookings", "CONFIRMED"],
    queryFn: () => bookingService.getStaffAppointments("CONFIRMED")
  });

  const { data: inProgressBookings } = useQuery({
    queryKey: ["staff-bookings", "IN_PROGRESS"],
    queryFn: () => bookingService.getStaffAppointments("IN_PROGRESS")
  });

  const confirmMutation = useMutation({
    mutationFn: bookingService.confirmAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-bookings"] })
  });

  const startMutation = useMutation({
    mutationFn: bookingService.startAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-bookings"] })
  });

  const completeMutation = useMutation({
    mutationFn: bookingService.completeAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-bookings"] })
  });

  const bookings = [
    ...(inProgressBookings?.content || []),
    ...(activeBookings?.content || []),
    ...(bookingsPage?.content || [])
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-black">Operational bookings view</h2>
        <p className="text-sm text-white/50 mt-1">Manage live appointments and track service progress.</p>
        
        <div className="mt-8 space-y-4">
          {bookings.length === 0 && !isLoading && (
            <div className="text-center py-10 text-white/20 border border-dashed border-white/10 rounded-3xl">
              No active or pending appointments
            </div>
          )}
          
          {bookings.map((appointment) => (
            <div className="flex items-center justify-between rounded-[2rem] bg-white/5 border border-white/10 p-6 transition-all hover:bg-white/8" key={appointment.id}>
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  appointment.status === 'IN_PROGRESS' ? 'bg-orange-500/20 text-orange-500 animate-pulse' :
                  appointment.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/10 text-white/40'
                }`}>
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-black text-lg text-white/90">{appointment.serviceName}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-white/40">{formatDateTime(appointment.scheduledStart)}</span>
                    <span className="text-white/20">•</span>
                    <span className="text-sm font-bold text-orange-400">{appointment.customerName}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                  appointment.status === 'IN_PROGRESS' ? 'bg-orange-500 text-black border-transparent' :
                  appointment.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                  'bg-white/10 text-white/40 border-white/10'
                }`}>
                  {appointment.status.replace('_', ' ')}
                </Badge>

                {appointment.status === 'PENDING' && (
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-10 px-4 font-bold"
                    onClick={() => confirmMutation.mutate(appointment.id)}
                  >
                    Confirm
                  </Button>
                )}

                {appointment.status === 'CONFIRMED' && (
                  <Button 
                    size="sm" 
                    className="bg-orange-500 hover:bg-orange-400 text-black rounded-xl h-10 px-4 font-bold transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => startMutation.mutate(appointment.id)}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Cut
                  </Button>
                )}

                {appointment.status === 'IN_PROGRESS' && (
                  <Button 
                    size="sm" 
                    className="bg-white hover:bg-white/90 text-black rounded-xl h-10 px-4 font-bold transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => completeMutation.mutate(appointment.id)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Finish
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
