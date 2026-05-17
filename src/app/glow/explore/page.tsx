"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Star, Search, Scissors, Clock,
  ChevronRight, Sparkles, LogIn
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  glowShopApi,
  ShopSearchResponse, Service, BarberResponse
} from "@/lib/glow-api";

type Step = "salon" | "service" | "stylist";

const STEPS: { id: Step; label: string; num: number }[] = [
  { id: "salon", label: "Salon", num: 1 },
  { id: "service", label: "Service", num: 2 },
  { id: "stylist", label: "Stylist", num: 3 },
];

export default function ExplorePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("salon");

  // Selections
  const [selectedShop, setSelectedShop] = useState<ShopSearchResponse | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberResponse | null>(null);

  // Data
  const [shops, setShops] = useState<ShopSearchResponse[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<BarberResponse[]>([]);
  const [searchQ, setSearchQ] = useState("");

  // Loading
  const [loading, setLoading] = useState(false);

  // Load shops
  useEffect(() => {
    setLoading(true);
    glowShopApi.searchShops(searchQ || undefined)
      .then(r => setShops(r.content || []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [searchQ]);

  // Load services when shop selected
  useEffect(() => {
    if (!selectedShop) return;
    setLoading(true);
    glowShopApi.getShopServices(selectedShop.id)
      .then(s => setServices(s.filter(sv => sv.active)))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [selectedShop]);

  // Load barbers when shop selected
  useEffect(() => {
    if (!selectedShop) return;
    glowShopApi.getShopBarbers(selectedShop.id)
      .then(setBarbers)
      .catch(() => setBarbers([]));
  }, [selectedShop]);

  const stepIndex = STEPS.findIndex(s => s.id === step);

  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].id);
    else router.push("/glow/discover");
  };

  // When user selects a stylist (final step), redirect to login with booking data in URL
  const handleStylistSelect = (barber: BarberResponse) => {
    setSelectedBarber(barber);

    // Build the redirect URL with all selections as query params
    const bookingParams = new URLSearchParams();
    if (selectedShop) bookingParams.set("shopId", selectedShop.id);
    if (selectedService) bookingParams.set("serviceId", selectedService.id);
    bookingParams.set("barberId", barber.id);

    const redirectUrl = `/glow/book?${bookingParams.toString()}`;
    const loginUrl = `/glow/auth/login?redirect=${encodeURIComponent(redirectUrl)}`;

    router.push(loginUrl);
  };

  return (
    <div className="min-h-screen relative p-4 md:p-8 lg:p-12 flex justify-center items-start font-sans bg-transparent">
      <div className="w-full max-w-[1100px] bg-[#FAF5EE] rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 min-h-[880px] border border-white/20 flex flex-col">

        {/* Header */}
        <header className="px-6 md:px-10 py-5 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-[#F0E4D8]">
          <div className="flex items-center gap-4">
            <button onClick={goBack} className="p-2.5 rounded-full bg-[#FBF7F3] text-[#7A6350] hover:text-[#D4864A] border border-[#F0E4D8] transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#5C3D2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Explore & Book
              </h1>
              <p className="text-[10px] text-[#B5A090] font-bold uppercase tracking-widest">
                Step {stepIndex + 1} of 3 — {STEPS[stepIndex].label}
              </p>
            </div>
          </div>

          {/* Login / Sign Up buttons */}
          <div className="flex items-center gap-2">
            <Link href="/glow/auth/login"
              className="px-4 py-2 rounded-full text-xs font-bold text-[#D4864A] border border-[#FADEC9] hover:bg-[#FFF5ED] transition-colors flex items-center gap-1.5">
              <LogIn className="h-3.5 w-3.5" /> Login
            </Link>
            <Link href="/glow/auth/register"
              className="px-4 py-2 rounded-full text-xs font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
              Sign Up
            </Link>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="px-6 md:px-10 pt-6">
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex-1 flex items-center gap-1">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#F0E4D8]">
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: i <= stepIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                    style={{ background: "linear-gradient(90deg, #D4864A, #F5B07B)" }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span key={s.id} className="text-[9px] font-bold uppercase tracking-wider"
                style={{ color: i <= stepIndex ? "#D4864A" : "#D9CFC6" }}>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mx-6 md:mx-10 mt-4 px-4 py-3 rounded-2xl bg-[#FFF0E8] border border-[#FADEC9] flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#D4864A] shrink-0" />
          <p className="text-xs text-[#7A6350]">
            Browse our salons and services freely! When you&apos;re ready to book, you&apos;ll be asked to sign in — your selections will be saved.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 md:px-10 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

              {/* ═══ STEP 1: SALON ═══ */}
              {step === "salon" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#5C3D2E] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Choose a Salon
                  </h2>
                  <p className="text-sm text-[#B5A090] mb-6">Discover premium beauty salons near you</p>

                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#B5A090]" />
                    <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                      placeholder="Search salons..." className="w-full h-12 pl-12 pr-4 rounded-2xl text-sm font-semibold text-[#5C3D2E] bg-white border-2 border-[#F0E4D8] focus:border-[#D4864A] focus:outline-none transition-all" />
                  </div>

                  {loading && <div className="text-center py-10"><div className="h-8 w-8 mx-auto rounded-full border-2 border-[#F0E4D8] border-t-[#D4864A] animate-spin" /></div>}

                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {shops.map(shop => (
                      <button key={shop.id} onClick={() => { setSelectedShop(shop); setStep("service"); }}
                        className="w-full text-left p-5 rounded-[20px] bg-white border-2 transition-all duration-300 hover:shadow-md flex items-center gap-4 group"
                        style={{ borderColor: selectedShop?.id === shop.id ? "#D4864A" : "#F0E4D8" }}>
                        <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[#FFF5ED] to-[#FADEC9] text-[#D4864A] group-hover:scale-105 transition-transform">
                          <Scissors className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[#5C3D2E] text-base truncate">{shop.name}</p>
                          <p className="text-xs text-[#B5A090] mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> {shop.city} · {shop.address}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[#D9CFC6] group-hover:text-[#D4864A] transition-colors shrink-0" />
                      </button>
                    ))}
                    {!loading && shops.length === 0 && (
                      <div className="text-center py-12 text-[#B5A090] text-sm">No salons found</div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══ STEP 2: SERVICE ═══ */}
              {step === "service" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#5C3D2E] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Select a Service
                  </h2>
                  <p className="text-sm text-[#B5A090] mb-6">at {selectedShop?.name}</p>

                  {loading && <div className="text-center py-10"><div className="h-8 w-8 mx-auto rounded-full border-2 border-[#F0E4D8] border-t-[#D4864A] animate-spin" /></div>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map(svc => (
                      <button key={svc.id} onClick={() => { setSelectedService(svc); setStep("stylist"); }}
                        className="text-left p-5 rounded-[20px] bg-white border-2 transition-all duration-300 hover:shadow-md group"
                        style={{ borderColor: selectedService?.id === svc.id ? "#D4864A" : "#F0E4D8" }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[#FFF5ED] text-[#D4864A]">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <span className="text-lg font-bold text-[#D4864A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            ETB {svc.basePrice}
                          </span>
                        </div>
                        <p className="font-bold text-[#5C3D2E] text-sm">{svc.name}</p>
                        {svc.description && <p className="text-xs text-[#B5A090] mt-1 line-clamp-2">{svc.description}</p>}
                        <div className="flex items-center gap-1 mt-3 text-xs text-[#D4864A] font-medium">
                          <Clock className="h-3.5 w-3.5" /> {svc.durationMinutes} min
                        </div>
                      </button>
                    ))}
                  </div>
                  {!loading && services.length === 0 && (
                    <div className="text-center py-12 text-[#B5A090] text-sm">No services available</div>
                  )}
                </div>
              )}

              {/* ═══ STEP 3: STYLIST (triggers login redirect) ═══ */}
              {step === "stylist" && (
                <div>
                  <h2 className="text-2xl font-bold text-[#5C3D2E] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Choose a Stylist
                  </h2>
                  <p className="text-sm text-[#B5A090] mb-3">Who would you like for your {selectedService?.name}?</p>

                  {/* Reminder */}
                  <div className="px-4 py-3 rounded-xl bg-[#FFF0E8] border border-[#FADEC9] mb-6 flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-[#D4864A] shrink-0" />
                    <p className="text-xs text-[#7A6350]">
                      Selecting a stylist will redirect you to login. Your salon, service, and stylist choices will be preserved automatically.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {barbers.map(b => (
                      <button key={b.id} onClick={() => handleStylistSelect(b)}
                        className="text-left p-5 rounded-[20px] bg-white border-2 transition-all duration-300 hover:shadow-md group"
                        style={{ borderColor: "#F0E4D8" }}>
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                            style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                            {b.firstName[0]}{b.lastName[0]}
                          </div>
                          <div>
                            <p className="font-bold text-[#5C3D2E]">{b.firstName} {b.lastName}</p>
                            {b.specialty && <p className="text-xs text-[#D4864A] font-medium mt-0.5">{b.specialty}</p>}
                            <div className="flex items-center gap-1 mt-1 text-xs text-[#B5A090]">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {b.averageRating > 0 ? b.averageRating.toFixed(1) : "New"}
                            </div>
                          </div>
                        </div>
                        {b.bio && <p className="text-xs text-[#B5A090] mt-3 line-clamp-2">{b.bio}</p>}
                        <div className="mt-3 pt-3 border-t border-[#F0E4D8] flex items-center justify-center gap-2 text-xs font-bold text-[#D4864A]">
                          <LogIn className="h-3.5 w-3.5" /> Select & Continue to Book
                        </div>
                      </button>
                    ))}
                  </div>
                  {barbers.length === 0 && (
                    <div className="text-center py-12 text-[#B5A090] text-sm">No stylists available</div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
