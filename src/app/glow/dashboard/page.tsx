"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, CalendarDays, Star, Heart, User, Settings,
  Bell, Crown, Search, MapPin, Clock, Gift, ChevronRight, LogOut
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlowAuthGuard from "@/components/glow/auth-guard";
import { useGlowAuthStore } from "@/lib/glow-auth-store";
import { glowBookingApi, AppointmentResponse } from "@/lib/glow-api";
import { BookingsTab, SavedTab, LoyaltyTab, ProfileTab } from "@/components/glow/client-dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"bookings" | "saved" | "loyalty" | "profile">("bookings");
  const { user, logout } = useGlowAuthStore();
  const [bookings, setBookings] = useState<AppointmentResponse[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    glowBookingApi.getMyAppointments()
      .then(res => setBookings(res.content || []))
      .catch(console.error)
      .finally(() => setLoadingBookings(false));
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await glowBookingApi.cancelAppointment(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "CANCELLED" } : b));
    } catch (e) { console.error(e); alert("Failed to cancel appointment"); }
  };

  const handleLogout = () => {
    logout();
    router.push("/glow");
  };

  const displayName = user?.firstName || user?.username || "Beautiful";
  const initials = user ? `${(user.firstName || "G")[0]}${(user.lastName || "L")[0]}`.toUpperCase() : "GL";
  const upcomingCount = bookings.filter(b => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status)).length;

  const tabs = [
    { id: "bookings", icon: <CalendarDays className="h-4 w-4" />, label: "Bookings", count: upcomingCount },
    { id: "saved", icon: <Heart className="h-4 w-4" />, label: "Favorites" },
    { id: "loyalty", icon: <Star className="h-4 w-4" />, label: "GlowPoints" },
    { id: "profile", icon: <User className="h-4 w-4" />, label: "Profile" },
  ] as const;

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <GlowAuthGuard requireRole={["CUSTOMER", "ADMIN"]}>
      <div className="min-h-screen relative p-4 md:p-8 lg:p-12 flex justify-center items-start font-sans bg-transparent">
        <div className="w-full max-w-[1400px] bg-[#FAF5EE] rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 min-h-[850px] border border-white/20 flex flex-col">

          {/* ═══════ TOP NAV ═══════ */}
          <header className="px-6 md:px-10 py-5 flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-[#F0E4D8]">
            <Link href="/glow/discover" className="flex items-center gap-2 group">
              <span className="text-[#D4864A] text-xl">✦</span>
              <span className="text-xl font-bold text-[#5C3D2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>GlowLink</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/glow/search" className="p-2.5 rounded-full bg-[#FBF7F3] text-[#B5A090] hover:text-[#D4864A] border border-[#F0E4D8] hover:border-[#FADEC9] transition-all">
                <Search className="h-5 w-5" />
              </Link>
              <Link href="/glow/notifications" className="p-2.5 rounded-full bg-[#FBF7F3] text-[#B5A090] hover:text-[#D4864A] border border-[#F0E4D8] hover:border-[#FADEC9] transition-all relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-400 border-2 border-white" />
              </Link>
              <Link href="/glow/settings" className="p-2.5 rounded-full bg-[#FBF7F3] text-[#B5A090] hover:text-[#D4864A] border border-[#F0E4D8] hover:border-[#FADEC9] transition-all">
                <Settings className="h-5 w-5" />
              </Link>
              <button onClick={handleLogout} title="Logout" className="p-2.5 rounded-full bg-[#FFF0F0] text-[#D47A7A] hover:text-white hover:bg-[#D47A7A] border border-[#FFD6D6] transition-all ml-2">
                <LogOut className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md ml-1"
                style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                {initials}
              </div>
            </div>
          </header>

          <div className="flex-1 flex flex-col">

            {/* ═══════ HERO WELCOME BANNER ═══════ */}
            <div className="mx-6 md:mx-10 mt-8 rounded-[32px] overflow-hidden relative"
              style={{ background: "linear-gradient(135deg, #D4864A 0%, #E8A872 40%, #F5C99D 100%)" }}>
              {/* Decorative orbs */}
              <div className="absolute top-[-40px] right-[-30px] w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute bottom-[-30px] left-[20%] w-40 h-40 bg-white/8 rounded-full blur-3xl" />

              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
                    className="h-20 w-20 md:h-24 md:w-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold shadow-xl border-4 border-white/30"
                    style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(10px)", color: "white" }}>
                    {initials}
                  </motion.div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{greeting} 🌸</p>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mt-0.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {displayName}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white backdrop-blur-sm border border-white/20 flex items-center gap-1.5">
                        <Crown className="h-3 w-3" /> Gold Member
                      </span>
                      <span className="text-white/90 text-xs font-bold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" /> 2,450 pts
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-3">
                  <Link href="/glow/book"
                    className="px-5 py-3 rounded-full text-sm font-bold bg-white text-[#D4864A] shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Book Now
                  </Link>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="bg-white/10 backdrop-blur-sm border-t border-white/15 px-8 md:px-12 py-4 flex items-center justify-around">
                {[
                  { icon: <CalendarDays className="h-4 w-4" />, val: upcomingCount, label: "Upcoming" },
                  { icon: <Star className="h-4 w-4" />, val: "2,450", label: "GlowPoints" },
                  { icon: <Heart className="h-4 w-4" />, val: "2", label: "Saved" },
                  { icon: <Gift className="h-4 w-4" />, val: "3", label: "Rewards" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-white mb-0.5">
                      {s.icon}
                      <span className="text-lg font-bold">{s.val}</span>
                    </div>
                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══════ TAB NAVIGATION ═══════ */}
            <div className="flex justify-center mt-8 mb-6 px-6">
              <div className="bg-white p-1.5 rounded-full shadow-sm border border-[#F0E4D8] flex overflow-x-auto max-w-full">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className="flex items-center gap-2 px-5 md:px-7 py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 shrink-0 relative"
                    style={{
                      background: activeTab === tab.id ? "linear-gradient(135deg, #D4864A, #C07540)" : "transparent",
                      color: activeTab === tab.id ? "white" : "#B5A090",
                      boxShadow: activeTab === tab.id ? "0 4px 15px rgba(212,134,74,0.3)" : "none",
                    }}>
                    {tab.icon} {tab.label}
                    {"count" in tab && tab.count ? (
                      <span className="ml-1 h-5 w-5 text-[9px] rounded-full flex items-center justify-center font-bold"
                        style={{
                          background: activeTab === tab.id ? "rgba(255,255,255,0.25)" : "#FFF5ED",
                          color: activeTab === tab.id ? "white" : "#D4864A",
                        }}>
                        {tab.count}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* ═══════ TAB CONTENT ═══════ */}
            <div className="flex-1 px-6 md:px-10 pb-12">
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
                  {activeTab === "bookings" && (
                    <BookingsTab bookings={bookings} loading={loadingBookings} onCancel={handleCancel}
                      onReschedule={(name) => router.push(`/glow/search?q=${encodeURIComponent(name)}`)} />
                  )}
                  {activeTab === "saved" && <SavedTab />}
                  {activeTab === "loyalty" && <LoyaltyTab points={2450} tierName="GOLD" />}
                  {activeTab === "profile" && <ProfileTab userStore={user} />}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </GlowAuthGuard>
  );
}
