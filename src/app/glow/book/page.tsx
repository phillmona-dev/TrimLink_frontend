"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Star, Search, Scissors, User, Clock,
  CalendarDays, CheckCircle2, ChevronRight, Sparkles, Phone
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import GlowAuthGuard from "@/components/glow/auth-guard";
import { useGlowAuthStore } from "@/lib/glow-auth-store";
import {
  glowShopApi, glowBookingApi,
  ShopSearchResponse, Service, BarberResponse, TimeSlotResponse
} from "@/lib/glow-api";
import { EthiopianCalendar } from "@/components/glow/booking/EthiopianCalendar";
import {
  EthDate, toGregorian, formatEthDate, formatEthDateEn, toEthiopian
} from "@/lib/ethiopian-calendar";

type Step = "salon" | "service" | "stylist" | "datetime" | "confirm";

const STEPS: { id: Step; label: string; num: number }[] = [
  { id: "salon", label: "Salon", num: 1 },
  { id: "service", label: "Service", num: 2 },
  { id: "stylist", label: "Stylist", num: 3 },
  { id: "datetime", label: "Date & Time", num: 4 },
  { id: "confirm", label: "Confirm", num: 5 },
];

function BookFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useGlowAuthStore();
  const [step, setStep] = useState<Step>("salon");

  // Selections
  const [selectedShop, setSelectedShop] = useState<ShopSearchResponse | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberResponse | null>(null);
  const [selectedEthDate, setSelectedEthDate] = useState<EthDate | null>(null);
  const [selectedGregDate, setSelectedGregDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotResponse | null>(null);
  const [notes, setNotes] = useState("");

  // Data
  const [shops, setShops] = useState<ShopSearchResponse[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<BarberResponse[]>([]);
  const [slots, setSlots] = useState<TimeSlotResponse[]>([]);
  const [searchQ, setSearchQ] = useState("");

  // Loading / error
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  // Pre-fill from URL query params (from explore page flow)
  const prefillShopId = searchParams.get("shopId");
  const prefillServiceId = searchParams.get("serviceId");
  const prefillBarberId = searchParams.get("barberId");

  useEffect(() => {
    if (!prefillShopId || prefilled) return;

    const prefillData = async () => {
      setLoading(true);
      try {
        const [shopData, servicesData, barbersData] = await Promise.all([
          glowShopApi.getShopDetails(prefillShopId),
          glowShopApi.getShopServices(prefillShopId),
          glowShopApi.getShopBarbers(prefillShopId)
        ]);

        setSelectedShop(shopData);
        setServices(servicesData);
        setBarbers(barbersData);

        const svc = servicesData.find((s: any) => s.id === prefillServiceId);
        const bbr = barbersData.find((b: any) => b.id === prefillBarberId);
        
        if (svc) setSelectedService(svc);
        if (bbr) setSelectedBarber(bbr);

        if (shopData && svc && bbr) {
          setStep("datetime");
        }
      } catch (err) {
        console.error("Failed to load prefilled data", err);
      } finally {
        setPrefilled(true);
        setLoading(false);
      }
    };

    prefillData();
  }, [prefillShopId, prefillServiceId, prefillBarberId, prefilled]);

  useEffect(() => {
    if (prefillShopId) return; // Don't load all shops if we're prefilling
    const loadShops = async () => {
      setLoading(true);
      try {
        const res = await glowShopApi.searchShops();
        setShops(res.content || []);
      } catch { setShops([]); }
      setLoading(false);
    };
    loadShops();
  }, [prefillShopId]);

  const handleShopSelect = async (shop: ShopSearchResponse) => {
    setSelectedShop(shop);
    setLoading(true);
    try {
      const svcs = await glowShopApi.getShopServices(shop.id);
      setServices(svcs);
      setStep("service");
    } catch {}
    setLoading(false);
  };

  const handleServiceSelect = async (svc: Service) => {
    setSelectedService(svc);
    setLoading(true);
    try {
      const bbrs = await glowShopApi.getShopBarbers(selectedShop!.id);
      setBarbers(bbrs.filter((b: any) => b.services?.some((s: any) => s.id === svc.id) || b.services?.length === 0)); // fallback if no specific assignments
      setStep("stylist");
    } catch {}
    setLoading(false);
  };

  const handleBarberSelect = (bbr: BarberResponse) => {
    setSelectedBarber(bbr);
    setStep("datetime");
  };

  const handleDateSelect = async (ethDate: EthDate) => {
    setSelectedEthDate(ethDate);
    const gregDate = toGregorian(ethDate);
    setSelectedGregDate(gregDate);
    setSelectedSlot(null);

    setLoading(true);
    try {
      const dateStr = gregDate.toISOString().split("T")[0];
      const times = await glowBookingApi.getAvailableSlots(selectedBarber!.id, selectedService!.id, dateStr);
      setSlots(times.filter(t => t.status === "AVAILABLE"));
    } catch { setSlots([]); }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!selectedShop || !selectedService || !selectedBarber || !selectedSlot) return;
    setBooking(true);
    setError("");
    try {
      await glowBookingApi.createAppointment({
        shopId: selectedShop.id,
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        scheduledStart: selectedSlot.startTime,
        notes: notes || undefined
      });
      setBooked(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to book appointment. Please try again.");
    }
    setBooking(false);
  };

  const currentStepNum = STEPS.find(s => s.id === step)?.num || 1;

  if (booked) {
    return (
      <div className="min-h-screen bg-[#FDF6F0] flex flex-col items-center justify-center p-6 text-center font-sans">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-8 border-4 border-white shadow-xl">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-4xl font-bold text-[#2C2416] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Booking Confirmed!
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="text-[#8e5238] max-w-md mx-auto mb-8 text-lg">
          Your appointment for <strong className="text-[#3c2a23]">{selectedService?.name}</strong> with <strong className="text-[#3c2a23]">{selectedBarber?.firstName}</strong> has been successfully booked.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-[#F0E4D8] w-full max-w-md text-left mb-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#FFF5ED] flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-[#D4864A]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">Date & Time</p>
              <p className="text-sm font-bold text-[#2C2416]">{selectedEthDate ? formatEthDateEn(selectedEthDate) : ""}</p>
              <p className="text-sm text-[#8e5238]">{selectedSlot?.startTime ? new Date(selectedSlot.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#FFF5ED] flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-[#D4864A]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">Location</p>
              <p className="text-sm font-bold text-[#2C2416]">{selectedShop?.name}</p>
              <p className="text-sm text-[#8e5238]">{selectedShop?.address}</p>
            </div>
          </div>
        </motion.div>

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          onClick={() => router.push("/glow/dashboard")}
          className="px-8 py-4 rounded-xl text-white font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
          View My Appointments
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF6F0] font-sans pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#F0E4D8]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => {
            if (step === "salon") router.back();
            if (step === "service") setStep("salon");
            if (step === "stylist") setStep("service");
            if (step === "datetime") setStep("stylist");
            if (step === "confirm") setStep("datetime");
          }} className="p-2 -ml-2 rounded-full hover:bg-[#F5EFE6] text-[#8e5238] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {STEPS.find(s => s.id === step)?.label}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {STEPS.map(s => (
                <div key={s.id} className="h-1 rounded-full flex-1 transition-colors duration-300"
                  style={{ background: s.num <= currentStepNum ? "#D4864A" : "#E8DDD2" }} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: SALON */}
          {step === "salon" && (
            <motion.div key="salon" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#B5A090]" />
                <input type="text" placeholder="Search salons by name or location..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-[#E8DDD2] rounded-2xl text-[#2C2416] focus:border-[#D4864A] focus:outline-none transition-colors shadow-sm" />
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-[#F0E4D8] animate-pulse" />)}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {shops.filter(s => s.name.toLowerCase().includes(searchQ.toLowerCase()) || s.city?.toLowerCase().includes(searchQ.toLowerCase())).map(shop => (
                    <button key={shop.id} onClick={() => handleShopSelect(shop)}
                      className="group flex flex-col text-left bg-white rounded-2xl border border-[#F0E4D8] overflow-hidden hover:shadow-lg hover:border-[#D4864A] transition-all">
                      <div className="h-24 bg-[#FAF5EE] relative w-full overflow-hidden">
                        {shop.logoUrl ? (
                          <Image src={shop.logoUrl} alt={shop.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[#D9CFC6]"><Sparkles className="h-8 w-8" /></div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-bold text-[#548C71] flex items-center gap-1 shadow-sm">
                          <Star className="h-3 w-3 fill-current" /> 5.0
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-[#2C2416] mb-1 group-hover:text-[#D4864A] transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{shop.name}</h3>
                        <p className="text-xs text-[#8e5238] flex items-center gap-1 mb-3"><MapPin className="h-3 w-3" /> {shop.address}, {shop.city}</p>
                        <div className="mt-auto pt-3 border-t border-[#F0E4D8] flex justify-between items-center text-[#B5A090] text-xs font-bold uppercase tracking-wider">
                          <span>View Services</span>
                          <span className="text-[#D4864A] group-hover:translate-x-1 transition-transform flex items-center">Select <ChevronRight className="h-3 w-3 ml-1" /></span>
                        </div>
                      </div>
                    </button>
                  ))}
                  {shops.length === 0 && !loading && (
                    <div className="col-span-2 text-center py-16 text-[#B5A090]">No salons found.</div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: SERVICE */}
          {step === "service" && (
            <motion.div key="service" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#F0E4D8] shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-[#FFF5ED] flex items-center justify-center text-[#D4864A]"><MapPin className="h-6 w-6" /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">Selected Salon</p>
                  <p className="font-bold text-[#2C2416]">{selectedShop?.name}</p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#2C2416] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Select a Service</h2>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl border border-[#F0E4D8] animate-pulse" />)}
                </div>
              ) : (
                <div className="grid gap-3">
                  {services.map(svc => (
                    <button key={svc.id} onClick={() => handleServiceSelect(svc)}
                      className="group flex items-center justify-between p-4 bg-white rounded-xl border border-[#F0E4D8] hover:border-[#D4864A] hover:shadow-md transition-all text-left">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-[#FAF5EE] flex items-center justify-center text-[#8e5238] group-hover:bg-[#FFF5ED] group-hover:text-[#D4864A] transition-colors">
                          <Scissors className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#2C2416] text-sm md:text-base group-hover:text-[#D4864A] transition-colors">{svc.name}</p>
                          <p className="text-xs text-[#B5A090] mt-0.5">{svc.durationMinutes} minutes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2C2416]">{svc.basePrice} ETB</p>
                        <ChevronRight className="h-4 w-4 text-[#D9CFC6] group-hover:text-[#D4864A] transition-colors ml-auto mt-1" />
                      </div>
                    </button>
                  ))}
                  {services.length === 0 && <div className="text-center py-12 text-[#B5A090]">No services available.</div>}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: STYLIST */}
          {step === "stylist" && (
            <motion.div key="stylist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#F0E4D8] shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-[#B5A090]"><MapPin className="h-5 w-5" /></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">Salon</p><p className="font-bold text-[#2C2416] text-sm">{selectedShop?.name}</p></div>
                </div>
                <div className="flex-1 flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#F0E4D8] shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-[#B5A090]"><Scissors className="h-5 w-5" /></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090]">Service</p><p className="font-bold text-[#2C2416] text-sm">{selectedService?.name}</p></div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#2C2416] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Choose your Stylist</h2>
              
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-[#F0E4D8] animate-pulse" />)}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Any available option */}
                  {barbers.length > 0 && (
                    <button onClick={() => handleBarberSelect(barbers[0])}
                      className="group flex items-center p-5 bg-white rounded-2xl border border-[#F0E4D8] hover:border-[#D4864A] hover:shadow-md transition-all text-left w-full">
                      <div className="h-14 w-14 rounded-full border-2 border-dashed border-[#D9CFC6] flex items-center justify-center text-[#B5A090] group-hover:border-[#D4864A] group-hover:text-[#D4864A] transition-colors shrink-0">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-[#2C2416] group-hover:text-[#D4864A] transition-colors">Any Stylist</p>
                        <p className="text-xs text-[#B5A090] mt-0.5">First available</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#D9CFC6] group-hover:text-[#D4864A]" />
                    </button>
                  )}

                  {barbers.map(bbr => (
                    <button key={bbr.id} onClick={() => handleBarberSelect(bbr)}
                      className="group flex items-center p-5 bg-white rounded-2xl border border-[#F0E4D8] hover:border-[#D4864A] hover:shadow-md transition-all text-left w-full">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#D4864A] to-[#C07540] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                        {(bbr.firstName || "S")[0]}{(bbr.lastName || "T")[0]}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-[#2C2416] group-hover:text-[#D4864A] transition-colors">{bbr.firstName} {bbr.lastName}</p>
                        <div className="flex items-center gap-1 text-xs text-[#548C71] font-bold mt-1">
                          <Star className="h-3 w-3 fill-current" /> {(bbr.averageRating || 5.0).toFixed(1)}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-[#D9CFC6] group-hover:text-[#D4864A]" />
                    </button>
                  ))}
                  {barbers.length === 0 && <div className="col-span-2 text-center py-12 text-[#B5A090]">No stylists available for this service.</div>}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: DATETIME */}
          {step === "datetime" && (
            <motion.div key="datetime" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F0E4D8]">
                <h2 className="text-xl font-bold text-[#2C2416] mb-6 text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Select Date</h2>
                <EthiopianCalendar selectedDate={selectedEthDate} onSelect={handleDateSelect} />
              </div>

              {selectedEthDate && (
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#F0E4D8]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Available Times</h2>
                    <span className="px-3 py-1 bg-[#FAF5EE] rounded-lg text-xs font-bold text-[#D4864A] uppercase tracking-wider">{formatEthDateEn(selectedEthDate)}</span>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-[#FAF5EE] rounded-xl animate-pulse" />)}
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {slots.map((slot, i) => {
                        const timeStr = new Date(slot.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
                        const isSelected = selectedSlot?.startTime === slot.startTime;
                        return (
                          <button key={slot.startTime + i} onClick={() => setSelectedSlot(slot)}
                            className={`py-3 rounded-xl text-sm font-bold transition-all ${
                              isSelected 
                                ? "bg-[#D4864A] text-white shadow-md scale-105" 
                                : "bg-[#FAF5EE] text-[#7A6350] hover:bg-[#F0E4D8] border border-[#E8DDD2]"
                            }`}>
                            {timeStr}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-[#FAF5EE] rounded-2xl border border-[#E8DDD2]">
                      <Clock className="h-8 w-8 text-[#D9CFC6] mx-auto mb-2" />
                      <p className="text-sm font-bold text-[#B5A090]">No slots available</p>
                      <p className="text-xs text-[#D9CFC6] mt-1">Please select another date</p>
                    </div>
                  )}

                  {selectedSlot && (
                    <button onClick={() => setStep("confirm")}
                      className="w-full mt-8 py-4 rounded-xl font-bold text-white text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                      Continue to Confirmation
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 5: CONFIRM */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-[#2C2416] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Review & Confirm</h2>
              <p className="text-sm text-[#B5A090]">Please review your booking details before confirming.</p>

              <div className="bg-white rounded-3xl border border-[#F0E4D8] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[#F0E4D8] bg-[#FAF5EE]/50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center text-[#D4864A]">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#2C2416]">{selectedShop?.name}</h3>
                      <p className="text-xs text-[#B5A090] flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" /> {selectedShop?.address}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-1">Service</p>
                      <p className="font-bold text-[#2C2416]">{selectedService?.name}</p>
                      <p className="text-xs text-[#8e5238] mt-0.5">{selectedService?.durationMinutes} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-1">Price</p>
                      <p className="font-bold text-[#2C2416] text-lg">{selectedService?.basePrice} ETB</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-[#F0E4D8]" />

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-1">Stylist</p>
                      <p className="font-bold text-[#2C2416]">{selectedBarber?.firstName} {selectedBarber?.lastName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-1">Date & Time</p>
                      <p className="font-bold text-[#2C2416]">{selectedEthDate ? formatEthDateEn(selectedEthDate) : ""}</p>
                      <p className="text-xs text-[#8e5238] mt-0.5">{selectedSlot?.startTime ? new Date(selectedSlot.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#F0E4D8] p-5 shadow-sm">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-2 block">Special Requests (Optional)</label>
                <textarea 
                  value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any notes for your stylist? e.g. 'I have sensitive scalp'"
                  className="w-full bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl p-4 text-sm text-[#2C2416] focus:outline-none focus:border-[#D4864A] transition-all resize-none h-24"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-[#FCECEC] border border-[#FFD6D6] text-sm text-[#C25953] font-semibold flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" /> {error}
                </div>
              )}

              <button onClick={handleBook} disabled={booking}
                className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                {booking ? "Confirming Booking..." : "Confirm Booking"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Icons used in Confirm Step ──
function Store(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>;
}

export default function BookPage() {
  return (
    <GlowAuthGuard requireRole={["CUSTOMER"]}>
      <Suspense fallback={
        <div className="min-h-screen bg-[#FDF6F0] flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-4 border-[#F0E4D8] border-t-[#D4864A] animate-spin" />
        </div>
      }>
        <BookFlow />
      </Suspense>
    </GlowAuthGuard>
  );
}
