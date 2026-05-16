"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Clock, Heart, Share2,
  CheckCircle2, Sparkles, ChevronRight, User, CalendarDays, X
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { glowShopApi, glowBookingApi, ShopSearchResponse, BarberResponse, Service, TimeSlotResponse } from "@/lib/glow-api";

const REVIEWS_MOCK = [
  { name: "Tigist A.", rating: 5, text: "Absolutely amazing! Perfect service.", date: "2 days ago" },
  { name: "Selam M.", rating: 5, text: "Best experience I've ever had. Incredibly talented.", date: "1 week ago" },
  { name: "Bethel K.", rating: 4, text: "Great atmosphere and professional staff. Will definitely return.", date: "2 weeks ago" },
];
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i + 1);
  return { label: d.toLocaleDateString("en", { weekday: "short" }), date: d.toLocaleDateString("en", { day: "numeric", month: "short" }), full: d.toISOString().split("T")[0] };
});

function BookingPanel({ shop, service, barbers, onClose }: { shop: ShopSearchResponse, service: Service | null, barbers: BarberResponse[], onClose: () => void }) {
  const [step, setStep] = useState<"staff" | "datetime" | "confirm" | "done">("staff");
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlotResponse | null>(null);
  const [availableTimes, setAvailableTimes] = useState<TimeSlotResponse[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  if (!service) return null;

  const fetchTimes = async (date: string, barberId: string) => {
    setLoadingTimes(true);
    try {
      const times = await glowBookingApi.getAvailableSlots(barberId, service.id, date);
      setAvailableTimes(times.filter(t => t.status === "AVAILABLE"));
    } catch (e) {
      console.error(e);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleDateSelect = (fullDate: string) => {
    setSelectedDate(fullDate);
    setSelectedTime(null);
    if (selectedStaff) fetchTimes(fullDate, selectedStaff);
  };

  const handleConfirmBooking = async () => {
    if (!selectedStaff || !selectedTime || !service) return;
    setCreating(true);
    try {
      await glowBookingApi.createAppointment({
        shopId: shop.id, barberId: selectedStaff, serviceId: service.id,
        scheduledStart: selectedTime.startTime, notes: ""
      });
      setStep("done");
    } catch (e) {
      console.error(e);
      alert("Failed to create appointment.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
      style={{ background: "rgba(8,4,14,0.88)", backdropFilter: "blur(16px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden relative"
        style={{ background: "rgba(15,8,24,0.97)", border: "1px solid rgba(200,149,108,0.22)" }}>
        {/* Shimmer top line */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(200,149,108,0.7), transparent)" }} />
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 -translate-y-1/2 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(200,149,108,0.8), transparent 70%)", filter: "blur(20px)" }} />
        <div className="flex items-center justify-between p-6 border-b border-[rgba(200,149,108,0.1)] relative">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] mb-1 font-black" style={{ color: "rgba(200,149,108,0.6)" }}>Booking</p>
            <h3 className="font-black text-white font-editorial text-xl">{service.name}</h3>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-all"
            style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.6)" }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1.5 px-6 py-4">
          {(["staff", "datetime", "confirm"] as const).map((s, i) => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{ background: (step === "staff" ? 0 : step === "datetime" ? 1 : 2) >= i ? "linear-gradient(90deg,#C8956C,#E8B4A0)" : "rgba(200,149,108,0.2)" }} />
          ))}
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "staff" && (
              <motion.div key="staff" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold mb-4" style={{ color: "rgba(253,246,238,0.6)" }}>Choose your stylist</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setSelectedStaff("any")}
                    className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                    style={{ background: selectedStaff === "any" ? "rgba(200,149,108,0.1)" : "rgba(253,246,238,0.03)", border: `1px solid ${selectedStaff === "any" ? "rgba(200,149,108,0.5)" : "rgba(200,149,108,0.12)"}` }}>
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "rgba(200,149,108,0.2)", color: "#C8956C" }}>✦</div>
                    <div><p className="text-sm font-bold text-white">Any Available Stylist</p><p className="text-xs text-white/40">Best match based on your service</p></div>
                    {selectedStaff === "any" && <CheckCircle2 className="h-5 w-5 ml-auto" style={{ color: "#C8956C" }} />}
                  </button>
                  {barbers.map(st => (
                    <button key={st.id} onClick={() => setSelectedStaff(st.id)}
                      className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                      style={{ background: selectedStaff === st.id ? "rgba(200,149,108,0.1)" : "rgba(253,246,238,0.03)", border: `1px solid ${selectedStaff === st.id ? "rgba(200,149,108,0.5)" : "rgba(200,149,108,0.12)"}` }}>
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0" style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>{st.firstName[0]}{st.lastName[0]}</div>
                      <div className="flex-1"><p className="text-sm font-bold text-white">{st.firstName} {st.lastName}</p><p className="text-xs text-white/40">{st.specialty || "Barber"}</p></div>
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#C8956C" }}><Star className="h-3 w-3 fill-current" />{st.averageRating.toFixed(1)}</div>
                      {selectedStaff === st.id && <CheckCircle2 className="h-5 w-5" style={{ color: "#C8956C" }} />}
                    </button>
                  ))}
                </div>
                <button disabled={!selectedStaff} onClick={() => setStep("datetime")}
                  className="w-full mt-5 h-12 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E] disabled:opacity-40 transition-all"
                  style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>Next: Pick a Time →</button>
              </motion.div>
            )}
            {step === "datetime" && (
              <motion.div key="dt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold mb-4" style={{ color: "rgba(253,246,238,0.6)" }}>Choose date & time</p>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
                  {DATES.map(d => (
                    <button key={d.full} onClick={() => handleDateSelect(d.full)}
                      className="shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl transition-all"
                      style={{ background: selectedDate === d.full ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "rgba(253,246,238,0.04)", border: `1px solid ${selectedDate === d.full ? "transparent" : "rgba(200,149,108,0.15)"}` }}>
                      <span className="text-[10px] font-bold uppercase" style={{ color: selectedDate === d.full ? "#1A0F1E" : "rgba(253,246,238,0.4)" }}>{d.label}</span>
                      <span className="text-sm font-black mt-0.5" style={{ color: selectedDate === d.full ? "#1A0F1E" : "white" }}>{d.date}</span>
                    </button>
                  ))}
                </div>
                {loadingTimes ? (
                  <div className="text-center py-6 text-white/50 animate-pulse text-sm">Finding available slots...</div>
                ) : !selectedDate ? (
                  <div className="text-center py-6 text-white/50 text-sm">Select a date above to view slots</div>
                ) : availableTimes.length === 0 ? (
                  <div className="text-center py-6 text-red-400 text-sm">No slots available on this date.</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {availableTimes.map(t => {
                      const timeLabel = new Date(t.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                      const isSelected = selectedTime?.startTime === t.startTime;
                      return (
                        <button key={t.startTime} onClick={() => setSelectedTime(t)}
                          className="py-3 rounded-xl text-sm font-bold transition-all"
                          style={{ background: isSelected ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "rgba(253,246,238,0.04)", color: isSelected ? "#1A0F1E" : "rgba(253,246,238,0.7)", border: `1px solid ${isSelected ? "transparent" : "rgba(200,149,108,0.15)"}` }}>
                          {timeLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button disabled={!selectedDate || !selectedTime} onClick={() => setStep("confirm")}
                  className="w-full h-12 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E] disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>Review Booking →</button>
              </motion.div>
            )}
            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold mb-4" style={{ color: "rgba(253,246,238,0.6)" }}>Booking Summary</p>
                <div className="rounded-2xl p-5 mb-4 flex flex-col gap-3" style={{ background: "rgba(200,149,108,0.06)", border: "1px solid rgba(200,149,108,0.2)" }}>
                  {[
                    { label: "Service", value: service.name },
                    { label: "Duration", value: `${service.durationMinutes} min` },
                    { label: "Stylist", value: selectedStaff === "any" ? "Any Available" : barbers.find(s => s.id === selectedStaff)?.firstName || "" },
                    { label: "Date", value: DATES.find(d => d.full === selectedDate)?.date || "" },
                    { label: "Time", value: selectedTime ? new Date(selectedTime.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-sm" style={{ color: "rgba(253,246,238,0.45)" }}>{r.label}</span>
                      <span className="text-sm font-semibold text-white">{r.value}</span>
                    </div>
                  ))}
                  <div className="h-px" style={{ background: "rgba(200,149,108,0.2)" }} />
                  <div className="flex justify-between">
                    <span className="font-black text-white">Total</span>
                    <span className="font-black text-lg" style={{ color: "#C8956C" }}>{service.basePrice.toLocaleString()} ETB</span>
                  </div>
                </div>
                <p className="text-xs text-center mb-4" style={{ color: "rgba(253,246,238,0.35)" }}>Pay at the salon · Free cancellation up to 2 hrs before</p>
                <button onClick={handleConfirmBooking} disabled={creating}
                  className="w-full h-12 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E]"
                  style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 30px rgba(200,149,108,0.3)" }}>
                  {creating ? "Booking..." : "Confirm Booking ✓"}
                </button>
              </motion.div>
            )}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="h-20 w-20 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 40px rgba(200,149,108,0.4)" }}>
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-white font-editorial mb-2">Booking Confirmed!</h3>
                <p className="text-sm mb-6" style={{ color: "rgba(253,246,238,0.55)" }}>
                  {service.name} at {shop.name}<br />
                  {DATES.find(d => d.full === selectedDate)?.date} · {selectedTime ? new Date(selectedTime.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                </p>
                <button onClick={() => { onClose(); router.push("/glow/dashboard"); }}
                  className="px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E]"
                  style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>Go to Dashboard</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SalonDetailPage() {
  const { id } = useParams() as { id: string };
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<"services" | "staff" | "reviews">("services");
  const [shop, setShop] = useState<ShopSearchResponse | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<BarberResponse[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      glowShopApi.getShopDetails(id).then(setShop),
      glowShopApi.getShopServices(id).then(setServices),
      glowShopApi.getShopBarbers(id).then(setBarbers),
    ]).finally(() => setLoading(false));
  }, [id]);

  const svcGradients = [
    ["rgba(200,149,108,0.12)", "rgba(200,149,108,0.06)"],
    ["rgba(232,121,249,0.1)",  "rgba(232,121,249,0.05)"],
    ["rgba(244,63,94,0.1)",   "rgba(244,63,94,0.05)"],
    ["rgba(124,185,154,0.1)", "rgba(124,185,154,0.05)"],
    ["rgba(129,140,248,0.1)", "rgba(129,140,248,0.05)"],
    ["rgba(255,215,0,0.1)",   "rgba(255,215,0,0.05)"],
  ];
  const svcAccents = ["#C8956C","#E879F9","#F43F5E","#7CB99A","#818CF8","#FFD700"];

  if (loading || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-3xl flex items-center justify-center animate-pulse"
            style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 40px rgba(200,149,108,0.4)" }}>
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm font-black uppercase tracking-widest animate-pulse" style={{ color: "rgba(200,149,108,0.6)" }}>Loading Salon…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── HERO BANNER ── */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {/* Layered gradient background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2D1020 0%, #1A0F2E 40%, #0F1A2E 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 30% 40%, rgba(200,149,108,0.3), transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 80% 70%, rgba(180,60,140,0.2), transparent 55%)" }} />
        {/* Decorative glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(200,149,108,0.15), transparent 70%)", filter: "blur(40px)" }} />
        {/* Sparkles watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <Sparkles className="h-48 w-48 text-white" />
        </div>
        {/* Pattern dots */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />

        {/* Top nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-5 z-10">
          <Link href="/glow/discover"
            className="p-2.5 rounded-xl transition-all"
            style={{ background: "rgba(15,8,24,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex gap-2">
            <motion.button onClick={() => setLiked(!liked)}
              className="p-2.5 rounded-xl transition-all"
              style={{ background: "rgba(15,8,24,0.7)", backdropFilter: "blur(16px)", border: `1px solid ${liked ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.12)"}` }}
              whileTap={{ scale: 0.9 }}>
              <Heart className={`h-5 w-5 transition-all ${liked ? "fill-rose-400 text-rose-400" : "text-white"}`} />
            </motion.button>
            <button className="p-2.5 rounded-xl transition-all"
              style={{ background: "rgba(15,8,24,0.7)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)", color: "white" }}>
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Info card emerging from bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="rounded-t-[2rem] relative overflow-hidden"
            style={{ background: "rgba(12,6,20,0.97)", backdropFilter: "blur(30px)", borderTop: "1px solid rgba(200,149,108,0.2)" }}>
            {/* Shimmer top edge */}
            <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,149,108,0.6), transparent)" }} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.35em] mb-1.5 font-black" style={{ color: "rgba(200,149,108,0.6)" }}>
                    {shop.description || "Premium Beauty Salon"}
                  </p>
                  <h1 className="text-2xl font-black text-white font-editorial leading-tight">{shop.name}</h1>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-xl"
                    style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.2)" }}>
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-black text-sm" style={{ color: "#FFD700" }}>5.0</span>
                  </div>
                  <span className="text-[10px] mt-1" style={{ color: "rgba(253,246,238,0.3)" }}>0 reviews</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs" style={{ color: "rgba(253,246,238,0.45)" }}>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" style={{ color: "#C8956C" }} /> {shop.address}, {shop.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" style={{ color: "#C8956C" }} /> Open until 8 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-2xl mx-auto" style={{ background: "rgba(12,6,20,0.97)" }}>
        {/* About */}
        <p className="px-5 pt-4 pb-2 text-sm leading-relaxed" style={{ color: "rgba(253,246,238,0.5)" }}>
          Experience world-class beauty services at <span className="font-bold" style={{ color: "#C8956C" }}>{shop.name}</span>. Our talented team is dedicated to making you look and feel your absolute best.
        </p>

        {/* Tabs */}
        <div className="flex border-b px-5" style={{ borderColor: "rgba(200,149,108,0.1)" }}>
          {(["services", "staff", "reviews"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all relative"
              style={{ color: activeTab === tab ? "#C8956C" : "rgba(253,246,238,0.3)" }}>
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #C8956C, #E8B4A0)" }} />
              )}
            </button>
          ))}
        </div>

        <div className="p-5 pb-36">
          <AnimatePresence mode="wait">
            {/* Services */}
            {activeTab === "services" && (
              <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                {services.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="h-10 w-10 mx-auto mb-3" style={{ color: "rgba(200,149,108,0.25)" }} />
                    <p className="text-sm" style={{ color: "rgba(253,246,238,0.35)" }}>No services listed yet.</p>
                  </div>
                )}
                {services.map((svc, i) => {
                  const [bg1, bg2] = svcGradients[i % svcGradients.length];
                  const accent = svcAccents[i % svcAccents.length];
                  return (
                    <motion.div key={svc.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.015, y: -2 }}
                      className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all"
                      style={{ background: `linear-gradient(135deg, ${bg1}, ${bg2})`, border: `1px solid ${accent}22` }}
                      onClick={() => setSelectedService(svc)}>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${accent}22`, border: `1px solid ${accent}44` }}>
                          <Sparkles className="h-4 w-4" style={{ color: accent }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-white">{svc.name}</p>
                          <span className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "rgba(253,246,238,0.4)" }}>
                            <Clock className="h-3 w-3" />{svc.durationMinutes} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-black text-sm" style={{ color: accent }}>{svc.basePrice.toLocaleString()} ETB</span>
                        <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}22` }}>
                          <ChevronRight className="h-3.5 w-3.5" style={{ color: accent }} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Staff */}
            {activeTab === "staff" && (
              <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                {barbers.length === 0 && (
                  <div className="text-center py-12">
                    <User className="h-10 w-10 mx-auto mb-3" style={{ color: "rgba(200,149,108,0.25)" }} />
                    <p className="text-sm" style={{ color: "rgba(253,246,238,0.35)" }}>No staff listed yet.</p>
                  </div>
                )}
                {barbers.map((st, i) => (
                  <motion.div key={st.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: "rgba(253,246,238,0.03)", border: "1px solid rgba(200,149,108,0.12)" }}>
                    <div className="relative shrink-0">
                      <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-black text-[#1A0F1E] text-sm"
                        style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 20px rgba(200,149,108,0.3)" }}>
                        {st.firstName[0]}{st.lastName[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 bg-emerald-400"
                        style={{ borderColor: "rgba(12,6,20,1)" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{st.firstName} {st.lastName}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(253,246,238,0.45)" }}>{st.specialty || "Beauty Specialist"}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)" }}>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-black" style={{ color: "#FFD700" }}>{st.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                {REVIEWS_MOCK.map((rv, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="p-5 rounded-2xl relative overflow-hidden"
                    style={{ background: "rgba(253,246,238,0.03)", border: "1px solid rgba(200,149,108,0.12)" }}>
                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,149,108,0.3), transparent)" }} />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-[#1A0F1E] text-xs"
                          style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>
                          {rv.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{rv.name}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: rv.rating }).map((_, j) => (
                              <Star key={j} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: "rgba(253,246,238,0.3)" }}>{rv.date}</span>
                    </div>
                    <p className="text-sm leading-relaxed italic" style={{ color: "rgba(253,246,238,0.6)" }}>“{rv.text}”</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── STICKY BOOKING CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 relative overflow-hidden"
        style={{ background: "rgba(10,5,18,0.97)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(200,149,108,0.15)" }}>
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(200,149,108,0.5), transparent)" }} />
        <div className="max-w-2xl mx-auto flex items-center gap-4 p-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: "rgba(253,246,238,0.35)" }}>Starting from</p>
            <p className="text-xl font-black font-editorial" style={{ color: "#C8956C" }}>
              {services.length > 0 ? Math.min(...services.map(s => s.basePrice)).toLocaleString() : 0} ETB
            </p>
          </div>
          <motion.button
            onClick={() => { if (services.length > 0) setSelectedService(services[0]); }}
            className="relative flex-1 h-13 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-[#1A0F1E] overflow-hidden"
            style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 30px rgba(200,149,108,0.35), 0 4px 20px rgba(200,149,108,0.25)" }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="absolute inset-0 shimmer-overlay" />
            Book a Service
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {selectedService && (<BookingPanel shop={shop} service={selectedService} barbers={barbers} onClose={() => setSelectedService(null)} />)}
      </AnimatePresence>
    </div>
  );
}
