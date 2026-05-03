"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { ReviewDialog } from "@/components/modals/review-dialog";
import { Star, Search, Filter } from "lucide-react";
import { Input } from "@/components/common/input";

import { useRouter } from "next/navigation";

export function AppointmentsPage() {
  const router = useRouter();
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input 
            placeholder="Search bookings, shops, staffs..." 
            className="pl-12 bg-white/5 border-white/5 rounded-2xl h-12 text-sm focus:border-orange-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="rounded-2xl h-12 border-white/5 bg-white/5 px-6 text-xs font-bold text-white/40">
          <Filter className="w-4 h-4 mr-2" />
          Last 30 Days
        </Button>
      </div>

      <div className="space-y-3">
        {appointmentsQuery.data?.content.map((appointment) => (
          <Card className="rounded-3xl bg-white/5 border-white/5 p-4 hover:bg-white/8 transition-all group" key={appointment.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  appointment.status === 'COMPLETED' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                  appointment.status === 'CANCELLED' ? 'bg-red-500' :
                  'bg-orange-500 animate-pulse'
                }`} />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-white/30">{formatDateTime(appointment.scheduledStart)}</span>
                    <span className="text-[10px] text-white/10">•</span>
                    <span className={`text-[10px] font-bold uppercase ${
                      appointment.status === 'COMPLETED' ? 'text-emerald-500/70' : 'text-white/40'
                    }`}>{appointment.status}</span>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors leading-tight">{appointment.serviceName}</h3>
                  <p className="text-xs text-white/40 font-medium">
                    {appointment.shopName} · {appointment.staffName}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 pl-6 lg:pl-0">
                <div className="text-left lg:text-right">
                  <div className="text-[9px] text-white/20 font-bold uppercase tracking-tighter">Paid</div>
                  <div className="text-lg font-black text-white">{formatCurrency(appointment.priceCharged)}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  {appointment.status === 'COMPLETED' && (
                    <Button 
                      size="sm"
                      disabled={appointment.reviewed}
                      className={`${
                        appointment.reviewed 
                        ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-400 text-black'
                      } font-black rounded-xl h-9 px-4 text-[11px] transition-all active:scale-95`}
                      onClick={() => setSelectedAppt({ id: appointment.id, staffName: appointment.staffName || "" })}
                    >
                      <Star className={`w-3.5 h-3.5 mr-1.5 ${appointment.reviewed ? 'fill-white/10' : 'fill-current'}`} />
                      {appointment.reviewed ? "Reviewed" : "Review"}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-9 px-4 border-white/5 bg-white/5 hover:bg-white/10 text-white/60 text-[11px] font-bold"
                    onClick={() => router.push(`/app/booking?shopId=${appointment.shopId}&staffId=${appointment.staffId}&serviceId=${appointment.serviceId}`)}
                  >
                    Rebook
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {appointmentsQuery.data?.content.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem]">
            <div className="text-white/20 font-bold">No results found for "{search}"</div>
            <p className="text-white/10 text-xs mt-1">Try searching for a different shop or service.</p>
          </div>
        )}
      </div>

      {selectedAppt && (
        <ReviewDialog
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          appointmentId={selectedAppt.id}
          staffName={selectedAppt.staffName}
        />
      )}
    </div>
  );
}
