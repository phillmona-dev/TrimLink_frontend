"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { formatCurrency, formatEthiopianDateTime } from "@/utils/format";
import { ReviewDialog } from "@/components/modals/review-dialog";
import { Star, Search, Filter } from "lucide-react";
import { Input } from "@/components/common/input";

import { useRouter } from "next/navigation";

export function AppointmentsPage() {
  const router = useRouter();
  const [selectedAppt, setSelectedAppt] = useState<{id: string, barberName: string} | null>(null);
  const [search, setSearch] = useState("");

  const appointmentsQuery = useQuery({
    queryKey: ["my-appointments", search],
    queryFn: () => bookingService.getMine(0, search),
  });

  return (
    <div className="space-y-5">
      {/* Header controls: stacked on mobile, side-by-side on sm+ */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input 
            placeholder="Search bookings, shops, barbers..." 
            className="pl-12 bg-white/5 border-white/5 rounded-2xl h-11 text-sm focus:border-orange-500/50 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex-1 rounded-2xl h-11 border-white/5 bg-white/5 text-xs font-bold text-white/40"
          >
            <Filter className="w-4 h-4 mr-2 shrink-0" />
            Last 30 Days
          </Button>
          <Button 
            onClick={() => router.push("/app")}
            className="flex-1 rounded-2xl h-11 bg-orange-500 hover:bg-orange-400 text-black text-xs font-black shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            + New
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {appointmentsQuery.data?.content.map((appointment) => (
          <Card className="rounded-2xl bg-white/5 border-white/5 p-4 transition-all group" key={appointment.id}>
            {/* Top: status dot + service + shop/barber */}
            <div className="flex items-start gap-3 mb-3">
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                appointment.status === 'COMPLETED' ? 'bg-emerald-500' :
                appointment.status === 'CANCELLED' ? 'bg-red-500' :
                'bg-orange-500 animate-pulse'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-tight text-white/30">{formatEthiopianDateTime(appointment.scheduledStart)}</span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    appointment.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                    appointment.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                    'bg-orange-500/10 text-orange-400'
                  }`}>{appointment.status}</span>
                </div>
                <h3 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors leading-tight">{appointment.serviceName}</h3>
                <p className="text-[11px] text-white/40 font-medium truncate">{appointment.shopName} · {appointment.barberName}</p>
              </div>
            </div>

            {/* Bottom: price + actions */}
            <div className="flex items-center justify-between pl-5 gap-3">
              <div>
                <div className="text-[9px] text-white/20 font-bold uppercase">Paid</div>
                <div className="text-sm font-black text-white">{formatCurrency(appointment.priceCharged)}</div>
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
                    } font-black rounded-xl h-8 px-3 text-[10px] transition-all active:scale-95`}
                    onClick={() => setSelectedAppt({ id: appointment.id, barberName: appointment.barberName || "Barber" })}
                  >
                    <Star className={`w-3 h-3 mr-1 shrink-0 ${appointment.reviewed ? 'fill-white/10' : 'fill-current'}`} />
                    {appointment.reviewed ? "Reviewed" : "Review"}
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="rounded-xl h-8 px-3 border-white/5 bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold"
                  onClick={() => router.push(`/app/booking?shopId=${appointment.shopId}&barberId=${appointment.barberId}&serviceId=${appointment.serviceId}`)}
                >
                  Rebook
                </Button>
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
          barberName={selectedAppt.barberName}
        />
      )}
    </div>
  );
}
