"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Star, MapPin, Clock, Heart, Share2,
  CheckCircle2, Sparkles, ChevronRight, User, CalendarDays, X
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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
      style={{ background: "rgba(92, 68, 59, 0.6)", backdropFilter: "blur(16px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-lg rounded-t-3xl md:rounded-3xl overflow-hidden relative"
        style={{ background: "#FDF6F0", border: "1px solid #e8cdb9" }}>
        
        <div className="flex items-center justify-between p-6 border-b border-[#f0e4db]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] mb-1 font-bold text-[#9e5d41]">Booking</p>
            <h3 className="font-bold text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px" }}>{service.name}</h3>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl transition-all bg-white border border-[#e8cdb9] text-[#8e5238] hover:bg-[#f9ebe2]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1.5 px-6 py-4">
          {(["staff", "datetime", "confirm"] as const).map((s, i) => (
            <div key={s} className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{ background: (step === "staff" ? 0 : step === "datetime" ? 1 : 2) >= i ? "#9e5d41" : "#e8cdb9" }} />
          ))}
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto bg-white">
          <AnimatePresence mode="wait">
            {step === "staff" && (
              <motion.div key="staff" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold mb-4 text-[#8e5238]">Choose your specialist</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setSelectedStaff("any")}
                    className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                    style={{ background: selectedStaff === "any" ? "#FDF6F0" : "#FFFFFF", border: `1px solid ${selectedStaff === "any" ? "#9e5d41" : "#e8cdb9"}` }}>
                    <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold bg-[#f9ebe2] text-[#9e5d41]">🌸</div>
                    <div className="flex-1"><p className="text-sm font-bold text-[#3c2a23]">Any Available Specialist</p><p className="text-xs text-[#8e5238]">Best match based on your service</p></div>
                    {selectedStaff === "any" && <CheckCircle2 className="h-5 w-5 text-[#9e5d41]" />}
                  </button>
                  {barbers.map(st => (
                    <button key={st.id} onClick={() => setSelectedStaff(st.id)}
                      className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                      style={{ background: selectedStaff === st.id ? "#FDF6F0" : "#FFFFFF", border: `1px solid ${selectedStaff === st.id ? "#9e5d41" : "#e8cdb9"}` }}>
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#8e5238]">{st.firstName[0]}{st.lastName[0]}</div>
                      <div className="flex-1"><p className="text-sm font-bold text-[#3c2a23]">{st.firstName} {st.lastName}</p><p className="text-xs text-[#8e5238]">{st.specialty || "Specialist"}</p></div>
                      <div className="flex items-center gap-1 text-xs text-[#e5a02e]"><Star className="h-3 w-3 fill-current" />{st.averageRating.toFixed(1)}</div>
                      {selectedStaff === st.id && <CheckCircle2 className="h-5 w-5 text-[#9e5d41]" />}
                    </button>
                  ))}
                </div>
                <button disabled={!selectedStaff} onClick={() => setStep("datetime")}
                  className="w-full mt-6 py-3.5 rounded-md font-bold text-sm text-white disabled:opacity-50 transition-all shadow-md"
                  style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>Next: Pick a Time</button>
              </motion.div>
            )}
            {step === "datetime" && (
              <motion.div key="dt" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold mb-4 text-[#8e5238]">Choose date & time</p>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                  {DATES.map(d => (
                    <button key={d.full} onClick={() => handleDateSelect(d.full)}
                      className="shrink-0 flex flex-col items-center px-4 py-3 rounded-xl transition-all shadow-sm"
                      style={{ background: selectedDate === d.full ? "#8e5238" : "#FFFFFF", border: `1px solid ${selectedDate === d.full ? "transparent" : "#e8cdb9"}` }}>
                      <span className="text-xs font-semibold uppercase" style={{ color: selectedDate === d.full ? "#FDF6F0" : "#8e5238" }}>{d.label}</span>
                      <span className="text-sm font-bold mt-1" style={{ color: selectedDate === d.full ? "white" : "#3c2a23" }}>{d.date}</span>
                    </button>
                  ))}
                </div>
                {loadingTimes ? (
                  <div className="text-center py-8 text-[#8e5238] animate-pulse text-sm">Finding available slots...</div>
                ) : !selectedDate ? (
                  <div className="text-center py-8 text-[#8e5238] text-sm">Select a date above to view slots</div>
                ) : availableTimes.length === 0 ? (
                  <div className="text-center py-8 text-red-500 text-sm">No slots available on this date.</div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {availableTimes.map(t => {
                      const timeLabel = new Date(t.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                      const isSelected = selectedTime?.startTime === t.startTime;
                      return (
                        <button key={t.startTime} onClick={() => setSelectedTime(t)}
                          className="py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
                          style={{ background: isSelected ? "#9e5d41" : "#FFFFFF", color: isSelected ? "white" : "#5c443b", border: `1px solid ${isSelected ? "transparent" : "#e8cdb9"}` }}>
                          {timeLabel}
                        </button>
                      );
                    })}
                  </div>
                )}
                <button disabled={!selectedDate || !selectedTime} onClick={() => setStep("confirm")}
                  className="w-full py-3.5 rounded-md font-bold text-sm text-white disabled:opacity-50 transition-all shadow-md"
                  style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>Review Booking</button>
              </motion.div>
            )}
            {step === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm font-semibold mb-4 text-[#8e5238]">Booking Summary</p>
                <div className="rounded-xl p-5 mb-6 flex flex-col gap-3 bg-[#FDF6F0] border border-[#e8cdb9]">
                  {[
                    { label: "Service", value: service.name },
                    { label: "Duration", value: `${service.durationMinutes} min` },
                    { label: "Stylist", value: selectedStaff === "any" ? "Any Available" : barbers.find(s => s.id === selectedStaff)?.firstName || "" },
                    { label: "Date", value: DATES.find(d => d.full === selectedDate)?.date || "" },
                    { label: "Time", value: selectedTime ? new Date(selectedTime.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between">
                      <span className="text-sm text-[#8e5238]">{r.label}</span>
                      <span className="text-sm font-bold text-[#3c2a23]">{r.value}</span>
                    </div>
                  ))}
                  <div className="h-px bg-[#e8cdb9] my-1" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#3c2a23]">Total</span>
                    <span className="font-bold text-lg text-[#9e5d41]">{service.basePrice.toLocaleString()} ETB</span>
                  </div>
                </div>
                <p className="text-xs text-center mb-6 text-[#8e5238]">Pay at the salon · Free cancellation up to 2 hrs before</p>
                <button onClick={handleConfirmBooking} disabled={creating}
                  className="w-full py-3.5 rounded-md font-bold text-sm text-white shadow-md transition-all"
                  style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>
                  {creating ? "Booking..." : "Confirm Booking"}
                </button>
              </motion.div>
            )}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="h-20 w-20 rounded-full flex items-center justify-center mb-6 bg-[#FDF6F0] shadow-md border border-[#e8cdb9]">
                  <CheckCircle2 className="h-10 w-10 text-[#9e5d41]" />
                </motion.div>
                <h3 className="text-3xl font-bold text-[#3c2a23] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Booking Confirmed!</h3>
                <p className="text-sm mb-8 text-[#8e5238] leading-relaxed">
                  <span className="font-bold">{service.name}</span> at {shop.name}<br />
                  {DATES.find(d => d.full === selectedDate)?.date} · {selectedTime ? new Date(selectedTime.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}
                </p>
                <button onClick={() => { onClose(); router.push("/glow/dashboard"); }}
                  className="px-8 py-3 rounded-md font-bold text-sm text-white shadow-md transition-all"
                  style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>Go to Dashboard</button>
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
  const router = useRouter();
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

  if (loading || !shop) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-white p-12 rounded-2xl shadow-xl">
          <div className="h-16 w-16 rounded-full flex items-center justify-center animate-pulse bg-[#FDF6F0]">
            <Sparkles className="h-8 w-8 text-[#9e5d41]" />
          </div>
          <p className="text-sm font-bold text-[#8e5238] animate-pulse">Loading Salon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans text-[#5c443b] bg-transparent">
      <div className="w-full max-w-[1400px] bg-white rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700 flex flex-col">
        
        {/* ── HERO BANNER ── */}
        <div className="relative h-72 md:h-96 overflow-hidden bg-[#FDF6F0]">
          {/* Main Background Image - Using a generic salon/spa image from public */}
          <Image src="/glow/spa.png" alt="Salon Header" fill className="object-cover opacity-50" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDF6F0] via-transparent to-[#3c2a23]/30" />

          {/* Top nav */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
            <button onClick={() => router.back()}
              className="p-3 rounded-xl transition-all bg-white/90 backdrop-blur-md border border-white/50 text-[#8e5238] shadow-sm hover:bg-white cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-3">
              <button onClick={() => setLiked(!liked)}
                className="p-3 rounded-xl transition-all bg-white/90 backdrop-blur-md border border-white/50 shadow-sm hover:bg-white">
                <Heart className={`h-5 w-5 transition-all ${liked ? "fill-rose-500 text-rose-500" : "text-[#8e5238]"}`} />
              </button>
              <button className="p-3 rounded-xl transition-all bg-white/90 backdrop-blur-md border border-white/50 text-[#8e5238] shadow-sm hover:bg-white">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Info area */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] mb-2 font-bold text-[#9e5d41]">
                  {shop.description || "Premium Beauty Spa"}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-[#3c2a23] drop-shadow-sm" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {shop.name}
                </h1>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-md border border-[#e8cdb9]">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm text-[#3c2a23]">5.0</span>
                </div>
                <span className="text-xs mt-2 font-medium text-[#8e5238] bg-white/80 px-2 py-0.5 rounded">0 reviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="bg-[#FDF6F0] p-8 border-b border-[#e8cdb9]">
          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-[#8e5238]">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#9e5d41]" /> {shop.address}, {shop.city}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#9e5d41]" /> Open until 8 PM
            </span>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-[#6d4536] max-w-3xl">
            Experience world-class beauty services at <span className="font-bold text-[#9e5d41]">{shop.name}</span>. Our talented team is dedicated to making you look and feel your absolute best in a relaxing, luxurious environment.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-8 bg-white border-b border-[#f0e4db] pt-2">
          {(["services", "staff", "reviews"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all relative"
              style={{ color: activeTab === tab ? "#9e5d41" : "#b08d7e" }}>
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 rounded-t-md bg-[#9e5d41]" />
              )}
            </button>
          ))}
        </div>

        <div className="p-8 pb-32 bg-white flex-1">
          <AnimatePresence mode="wait">
            {/* Services */}
            {activeTab === "services" && (
              <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-4">
                {services.length === 0 && (
                  <div className="col-span-2 text-center py-16">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-[#e8cdb9]" />
                    <p className="text-[#8e5238] font-medium">No services listed yet.</p>
                  </div>
                )}
                {services.map((svc, i) => (
                  <motion.div key={svc.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all shadow-sm border border-[#f0e4db] bg-[#fdfaf8] hover:shadow-md hover:border-[#e8cdb9]"
                    onClick={() => setSelectedService(svc)}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-[#FDF6F0] border border-[#e8cdb9] text-[#9e5d41]">
                        🌸
                      </div>
                      <div>
                        <p className="font-bold text-[#3c2a23]">{svc.name}</p>
                        <span className="text-xs flex items-center gap-1.5 mt-1 text-[#8e5238] font-medium">
                          <Clock className="h-3.5 w-3.5" />{svc.durationMinutes} min
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-bold text-lg text-[#9e5d41]">${svc.basePrice.toLocaleString()}</span>
                      <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-[#8e5238]">
                        Book <ChevronRight className="h-3 w-3 ml-0.5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Staff */}
            {activeTab === "staff" && (
              <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-4">
                {barbers.length === 0 && (
                  <div className="col-span-2 text-center py-16">
                    <User className="h-12 w-12 mx-auto mb-4 text-[#e8cdb9]" />
                    <p className="text-[#8e5238] font-medium">No staff listed yet.</p>
                  </div>
                )}
                {barbers.map((st, i) => (
                  <motion.div key={st.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-5 p-5 rounded-2xl border border-[#f0e4db] bg-white shadow-sm">
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 rounded-full flex items-center justify-center font-bold text-white text-lg bg-[#8e5238] shadow-inner">
                        {st.firstName[0]}{st.lastName[0]}
                      </div>
                      <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-[#3c2a23]">{st.firstName} {st.lastName}</p>
                      <p className="text-sm mt-0.5 text-[#8e5238]">{st.specialty || "Beauty Specialist"}</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FDF6F0] border border-[#e8cdb9]">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-[#3c2a23]">{st.averageRating.toFixed(1)}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 gap-6">
                {REVIEWS_MOCK.map((rv, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className="p-6 rounded-2xl bg-[#FDF6F0] border border-[#e8cdb9]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-white text-sm bg-[#9e5d41]">
                          {rv.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-bold text-[#3c2a23]">{rv.name}</p>
                          <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: rv.rating }).map((_, j) => (
                              <Star key={j} className="h-3 w-3 fill-[#e5a02e] text-[#e5a02e]" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#b08d7e]">{rv.date}</span>
                    </div>
                    <p className="text-[15px] leading-relaxed text-[#6d4536] italic">"{rv.text}"</p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── STICKY BOOKING CTA ── */}
        <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#f0e4db] shadow-[0_-10px_40px_rgba(142,82,56,0.05)]">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-6 p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#b08d7e] mb-1">Starting from</p>
              <p className="text-2xl font-bold text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                ${services.length > 0 ? Math.min(...services.map(s => s.basePrice)).toLocaleString() : 0}
              </p>
            </div>
            <motion.button
              onClick={() => { if (services.length > 0) setSelectedService(services[0]); }}
              className="px-10 py-4 rounded-md font-bold text-[15px] text-white shadow-lg flex items-center gap-2"
              style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              Book Appointment <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {selectedService && (<BookingPanel shop={shop} service={selectedService} barbers={barbers} onClose={() => setSelectedService(null)} />)}
      </AnimatePresence>
    </div>
  );
}
