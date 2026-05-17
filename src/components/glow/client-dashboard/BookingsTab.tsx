"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  CalendarDays, Clock, User, MapPin, Star,
  CheckCircle2, XCircle, RotateCcw, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { AppointmentResponse } from "@/lib/glow-api";

function StatusBadge({ status }: { status: string }) {
  const cfg = {
    upcoming: { color: "#D4864A", bg: "linear-gradient(135deg, #FFF5ED, #FFE8D6)", label: "Upcoming", icon: <Clock className="h-3 w-3" /> },
    completed: { color: "#6BAF7B", bg: "linear-gradient(135deg, #F0F9F2, #DCEFD8)", label: "Completed", icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { color: "#D47A7A", bg: "linear-gradient(135deg, #FFF0F0, #FFE0E0)", label: "Cancelled", icon: <XCircle className="h-3 w-3" /> },
  }[status] ?? { color: "#D4864A", bg: "#FFF5ED", label: status, icon: null };
  return (
    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm"
      style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

export function BookingsTab({ bookings, loading, onCancel, onReschedule }: {
  bookings: AppointmentResponse[]; loading: boolean;
  onCancel: (id: string) => void; onReschedule: (shopName: string) => void;
}) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("upcoming");

  const mapStatus = (s: string) => {
    if (["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(s)) return "upcoming";
    if (s === "COMPLETED") return "completed";
    return "cancelled";
  };

  const filtered = filter === "all" ? bookings : bookings.filter(b => mapStatus(b.status) === filter);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="h-12 w-12 mx-auto rounded-full border-3 border-[#E8DDD2] border-t-[#D4864A] animate-spin mb-4" />
        <p className="text-sm font-bold text-[#B5A090]">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(["all", "upcoming", "completed", "cancelled"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="shrink-0 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300"
            style={{
              background: filter === f ? "linear-gradient(135deg, #D4864A, #C07540)" : "white",
              color: filter === f ? "white" : "#7A6350",
              border: `1.5px solid ${filter === f ? "#D4864A" : "#E8DDD2"}`,
              boxShadow: filter === f ? "0 4px 15px rgba(212,134,74,0.3)" : "none",
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20 rounded-3xl bg-white border border-[#E8DDD2]">
              <CalendarDays className="h-14 w-14 mx-auto mb-4 text-[#D4864A] opacity-40" />
              <p className="text-xl font-bold text-[#5C3D2E] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                No {filter !== "all" ? filter : ""} bookings
              </p>
              <p className="text-sm text-[#B5A090] mb-6">Time to treat yourself!</p>
              <Link href="/glow/discover" className="px-6 py-3 rounded-full text-sm font-bold text-white shadow-lg inline-block transition-all hover:shadow-xl"
                style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                Discover Salons
              </Link>
            </motion.div>
          )}
          {filtered.map((b, i) => {
            const start = new Date(b.scheduledStart);
            const dateStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const timeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            const isUpcoming = mapStatus(b.status) === "upcoming";

            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group rounded-[24px] bg-white overflow-hidden border border-[#F0E4D8] hover:border-[#D4864A]/30 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(212,134,74,0.1)]">

                {/* Color accent strip */}
                <div className="h-1.5 w-full" style={{ background: isUpcoming ? "linear-gradient(90deg, #D4864A, #F5B07B)" : (b.status === "COMPLETED" ? "linear-gradient(90deg, #6BAF7B, #9DD5A7)" : "linear-gradient(90deg, #D47A7A, #E8A8A8)") }} />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-lg font-bold text-[#5C3D2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{b.serviceName}</p>
                      <p className="text-sm mt-1 text-[#D4864A] font-semibold flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {b.shopName}
                      </p>
                    </div>
                    <StatusBadge status={isUpcoming ? "upcoming" : (b.status === "COMPLETED" ? "completed" : "cancelled")} />
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-[#7A6350] bg-[#FBF7F3] p-3.5 rounded-2xl border border-[#F0E4D8]">
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-[#D4864A]" />{dateStr}</span>
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-[#D4864A]" />{timeStr}</span>
                    <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-[#D4864A]" />{b.barberName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 bg-[#FDFBF9] border-t border-[#F0E4D8]">
                  <span className="font-bold text-lg text-[#5C3D2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    ETB {b.priceCharged?.toLocaleString() ?? "0"}
                  </span>
                  {isUpcoming && (
                    <div className="flex gap-2">
                      <button onClick={() => onReschedule(b.shopName)}
                        className="px-4 py-2 rounded-full text-xs font-bold border border-[#E8DDD2] text-[#7A6350] hover:bg-[#FBF7F3] transition-all flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" /> Reschedule
                      </button>
                      <button onClick={() => onCancel(b.id)}
                        className="px-4 py-2 rounded-full text-xs font-bold text-white transition-all shadow-sm"
                        style={{ background: "linear-gradient(135deg, #D47A7A, #C06060)" }}>
                        Cancel
                      </button>
                    </div>
                  )}
                  {b.status === "COMPLETED" && (
                    <Link href={`/glow/search?q=${encodeURIComponent(b.shopName)}`}
                      className="px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all text-[#D4864A] border border-[#FADEC9] hover:bg-[#FFF5ED]">
                      <Star className="h-3.5 w-3.5 fill-current" /> Book Again
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
