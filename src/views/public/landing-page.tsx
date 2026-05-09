"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "@/api/shopService";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Clock,
  Heart,
  Home,
  MapPin,
  Search,
  User,
  Scissors,
  X,
  Star,
  ExternalLink,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/common/button";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { AnimatedBackground } from "@/components/common/animated-background";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/context/ChatContext";
import { Marquee } from "@/components/common/marquee";
import { HaircutCard } from "@/components/common/haircut-card";

export function LandingPage() {
  const { isAuthenticated, role, logout } = useAuth();
  const { openChat } = useChat();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string, name: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["search-shops", activeQuery],
    queryFn: () => shopService.search(activeQuery),
    enabled: !!activeQuery,
  });

  const { data: nearbyShops, isLoading: isNearbyLoading } = useQuery({
    queryKey: ["nearby-shops"],
    queryFn: () => shopService.list(0, 8), // Fetch more for grid
  });
  
  const { data: shopDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ["shop-detail", selectedShopId],
    queryFn: () => shopService.getById(selectedShopId!),
    enabled: !!selectedShopId,
  });

  const { data: shopBarbers, isLoading: isBarbersLoading } = useQuery({
    queryKey: ["shop-barbers", selectedShopId],
    queryFn: () => shopService.getBarbers(selectedShopId!),
    enabled: !!selectedShopId,
  });

  const handleOpenMap = (shop: any) => {
    if (shop.latitude && shop.longitude) {
      const query = encodeURIComponent(`${shop.name} ${shop.latitude},${shop.longitude}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative flex flex-col">
      <AnimatedBackground />

      {/* COMPREHENSIVE TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:h-20 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
              <Scissors className="h-6 w-6 md:h-7 md:w-7 text-black" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">
                Trim<span className="text-orange-500">Link</span>
              </h1>
              <p className="hidden md:block text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold mt-1">
                Premium Grooming
              </p>
            </div>
          </div>

          {/* Search Bar - Now Responsive */}
          <div className="flex order-3 md:order-2 w-full md:flex-1 md:max-w-xl md:mx-8">
            <form 
              className="flex items-center gap-2 w-full bg-white/[0.05] border border-white/10 hover:border-white/20 rounded-full p-1 transition-all focus-within:border-orange-500/50 focus-within:bg-white/[0.08]"
              onSubmit={(e) => {
                e.preventDefault();
                setActiveQuery(query);
              }}
            >
              <div className="pl-3">
                <Search className="h-4 w-4 text-white/40 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                id="search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value === "") setActiveQuery("");
                }}
                placeholder="Search for shops or barbers"
                className="flex-1 min-w-0 h-9 bg-transparent px-2 text-white/90 text-sm focus:outline-none placeholder:text-white/20 transition"
              />
              <Button type="submit" className="shrink-0 rounded-full bg-orange-500 text-black hover:bg-orange-400 font-bold h-9 px-5 text-xs transition-transform active:scale-95">
                Search
              </Button>
            </form>
          </div>

          {/* Actions (Auth & Menu) - Visible on all screens */}
          <div className="flex items-center gap-1.5 md:gap-4 order-2 ml-auto md:ml-0">
            {mounted && isAuthenticated && (
              <button className="hidden md:block p-2.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition">
                <Bell size={18} />
              </button>
            )}
            
            <div className="hidden md:block w-px h-8 bg-white/10 mx-2"></div>

            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-1.5 md:gap-3">
                <Link href={role === 'CUSTOMER' ? '/app' : '/owner'}>
                  <Button variant="ghost" className="rounded-full text-white/90 hover:text-white hover:bg-white/10 font-bold px-3 md:px-4 text-[11px] md:text-sm">
                    <User className="md:mr-2 h-4 w-4" /> <span className="hidden md:inline">Dashboard</span>
                  </Button>
                </Link>
                <button onClick={logout} className="p-2 md:p-2.5 text-white/40 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-full transition">
                  <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 md:gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="rounded-full text-white/90 hover:text-white hover:bg-white/10 font-bold px-2.5 md:px-4 h-8 md:h-10 text-[10px] md:text-xs uppercase tracking-wider">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="rounded-full bg-orange-500 text-black hover:bg-orange-400 font-black px-3 md:px-4 h-8 md:h-10 text-[10px] md:text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    Join
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-1.5 text-white/90 bg-white/5 hover:bg-white/10 rounded-full transition">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-20 left-0 right-0 z-40 bg-black/95 backdrop-blur-3xl border-b border-white/10 p-4 shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-lg font-bold text-white p-2">Explore</Link>
              <Link href="/shops" className="text-lg font-bold text-white/60 p-2">Shops</Link>
              {mounted && isAuthenticated ? (
                <>
                  <Link href="/app/appointments" className="text-lg font-bold text-white/60 p-2">Appointments</Link>
                </>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative z-10 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 md:py-12 flex flex-col gap-8 md:gap-16">
        
        {/* HIGH-FIDELITY HERO SECTION */}
        <section className="w-full h-[35vh] md:h-[55vh] min-h-[240px] md:min-h-[380px] rounded-[1.5rem] md:rounded-[3rem] overflow-hidden relative group shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10" />
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center" 
          />
          
          <div className="relative z-20 h-full flex flex-col justify-end p-5 md:p-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-[9px] font-black uppercase tracking-widest mb-3">
                <Star className="h-2.5 w-2.5 fill-orange-400" /> Featured
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-white mb-1 md:mb-3 tracking-tight leading-tight">
                The Master's Touch
              </h2>
              <p className="hidden md:block text-base text-white/60 mb-6 max-w-sm">
                Premium cuts. Skilled barbers. Book instantly.
              </p>
              <Link href="/shops">
                <Button className="bg-orange-500 text-black hover:bg-orange-400 rounded-full px-6 md:px-10 h-9 md:h-12 text-xs md:text-sm font-black transition-all hover:scale-105 shadow-[0_10px_25px_rgba(249,115,22,0.3)]">
                  Explore Shops
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* SEARCH RESULTS AND FEED */}
        <section className="flex flex-col gap-8">
          {activeQuery ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white">Results for "{activeQuery}"</h3>
                <Button variant="ghost" onClick={() => { setQuery(""); setActiveQuery(""); }} className="text-white/40 hover:text-white">Clear Search</Button>
              </div>

              {isSearchLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-3xl" />)}
                </div>
              ) : searchResults?.content && searchResults.content.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.content.map((shop: any) => (
                    <motion.div key={shop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col p-6 rounded-3xl bg-black/40 border border-white/10 hover:border-orange-500/30 transition-colors group cursor-pointer" onClick={() => setSelectedShopId(shop.id)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-14 w-14 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                          <Scissors className="h-6 w-6 text-orange-400" />
                        </div>
                      </div>
                      <h4 className="font-bold text-xl text-white mb-1 group-hover:text-orange-400 transition">{shop.name}</h4>
                      <div className="text-sm text-white/50 mb-4 flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {shop.city}
                      </div>
                      <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="text-xs text-white/30 uppercase font-bold tracking-wider">View Details</span>
                        <Button size="sm" className="bg-white/10 hover:bg-orange-500 text-white hover:text-black rounded-full h-8 px-4 text-xs font-bold transition-colors">
                          Book
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 text-white/40">
                  No shops found matching your search.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-10 md:gap-16">
              
              {/* TRENDING TRIMS SHOWCASE */}
              <section className="relative overflow-hidden -mx-4 md:mx-0">
                <div className="px-4 md:px-0 mb-8 flex items-end justify-between">
                  <div>
                    <h3 className="text-[11px] font-black text-orange-500/60 uppercase tracking-[0.4em] mb-1">Style Showcase</h3>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Trending Trims</h2>
                  </div>
                </div>
                
                <Marquee baseVelocity={-0.8}>
                  <div className="flex gap-6 pr-6">
                    <HaircutCard image="/images/haircuts/haircut1.png" name="Sharp Fade" tag="Modern" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut1.png", name: "Sharp Fade" })} />
                    <HaircutCard image="/images/haircuts/habesha_cut_1.png" name="Curly Top Fade" tag="Habesha Teen" onClick={() => setZoomedImage({ url: "/images/haircuts/habesha_cut_1.png", name: "Curly Top Fade" })} />
                    <HaircutCard image="/images/haircuts/ext_cut_1.jpg" name="Textured Crop" tag="Trending" onClick={() => setZoomedImage({ url: "/images/haircuts/ext_cut_1.jpg", name: "Textured Crop" })} />
                    
                    <HaircutCard image="/images/haircuts/haircut2.png" name="Urban Taper" tag="Teenager" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut2.png", name: "Urban Taper" })} />
                    <HaircutCard image="/images/haircuts/habesha_cut_2.png" name="Fresh Taper" tag="Habesha Style" onClick={() => setZoomedImage({ url: "/images/haircuts/habesha_cut_2.png", name: "Fresh Taper" })} />
                    <HaircutCard image="/images/haircuts/ext_cut_2.jpg" name="Classic Pomp" tag="Classic" onClick={() => setZoomedImage({ url: "/images/haircuts/ext_cut_2.jpg", name: "Classic Pomp" })} />
                    
                    <HaircutCard image="/images/haircuts/haircut3.png" name="Habesha Classic" tag="Ethiopian" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut3.png", name: "Habesha Classic" })} />
                    <HaircutCard image="/images/haircuts/habesha_cut_3.png" name="Sponge Curls" tag="Habesha Teen" onClick={() => setZoomedImage({ url: "/images/haircuts/habesha_cut_3.png", name: "Sponge Curls" })} />
                    <HaircutCard image="/images/haircuts/ext_cut_3.jpg" name="Slick Back" tag="Elegant" onClick={() => setZoomedImage({ url: "/images/haircuts/ext_cut_3.jpg", name: "Slick Back" })} />
                    
                    <HaircutCard image="/images/haircuts/ext_cut_5.jpg" name="Burst Fade" tag="Modern" onClick={() => setZoomedImage({ url: "/images/haircuts/ext_cut_5.jpg", name: "Burst Fade" })} />
                    <HaircutCard image="/images/haircuts/ext_cut_8.jpg" name="Clean Buzz" tag="Minimalist" onClick={() => setZoomedImage({ url: "/images/haircuts/ext_cut_8.jpg", name: "Clean Buzz" })} />
                  </div>
                </Marquee>
              </section>

              {/* GRID LAYOUT: NEARBY SHOPS */}
              <section>
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <h3 className="text-[11px] font-black text-orange-500/60 uppercase tracking-[0.4em] mb-1">Local Excellence</h3>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Nearby Shops</h2>
                  </div>
                  <Link href="/shops" className="text-sm font-bold text-white/50 hover:text-white transition flex items-center gap-1">
                    View Directory
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {isNearbyLoading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl" />)
                  ) : nearbyShops?.content && nearbyShops.content.length > 0 ? (
                    nearbyShops.content.map((shop: any) => (
                      <div key={shop.id} onClick={() => setSelectedShopId(shop.id)} className="flex items-center gap-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/20 hover:bg-white/[0.04] transition-all cursor-pointer group">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenMap(shop); }}
                          className="h-14 w-14 rounded-[1rem] bg-black/50 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-orange-500/20 group-hover:border-orange-500/30 transition shadow-inner"
                        >
                          <MapPin className="h-6 w-6 text-white/40 group-hover:text-orange-400 transition" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-bold text-white/90 truncate mb-1">{shop.name}</div>
                          <div className="text-sm text-white/40 truncate">{shop.address}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-white/40 border border-dashed border-white/10 rounded-3xl">
                      No nearby shops found.
                    </div>
                  )}
                </div>
              </section>

            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 bg-black/80 mt-12 relative z-10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-white/80">TrimLink</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["About", "Privacy", "Terms", "Pricing", "Contact", "FAQ"].map(link => (
              <Link key={link} href={`/${link.toLowerCase()}`} className="text-xs font-bold uppercase tracking-wider text-white/30 hover:text-white/80 transition">
                {link}
              </Link>
            ))}
          </div>
          <div className="text-xs text-white/20">
            © 2026 TrimLink Inc.
          </div>
        </div>
      </footer>

      {/* SHOP DETAIL MODAL */}
      <AnimatePresence>
        {selectedShopId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedShopId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[20px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 30 }}
              className="relative w-full max-w-5xl bg-black md:bg-white/5 border-0 md:border md:border-white/10 rounded-none md:rounded-[3rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.9)] h-[100dvh] md:h-[85vh] flex flex-col"
            >
              <div className="absolute inset-0 z-0 overflow-hidden bg-black/40">
                <div className="hidden md:block"><AnimatedBackground /></div>
              </div>

              <div className="relative z-10 flex-1 flex flex-col p-6 md:p-12 overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-3xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                      <Scissors className="h-8 w-8 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight mb-2">{shopDetail?.name || "Loading..."}</h2>
                      <div className="flex items-center gap-2 text-white/40">
                        <MapPin className="h-4 w-4 text-orange-500/60" />
                        <span className="text-sm font-bold uppercase tracking-wider">{shopDetail?.city}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedShopId(null)} className="p-3 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-white/20 transition">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-0 overflow-y-auto lg:overflow-hidden custom-scrollbar pb-8 lg:pb-0">
                  
                  <div className="lg:col-span-3 flex flex-col gap-8 lg:min-h-0">
                    <section className="shrink-0 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                      <h3 className="text-xs font-black text-orange-500/60 uppercase tracking-[0.3em] mb-4">The Experience</h3>
                      <p className="text-lg text-white/80 leading-relaxed font-medium">
                        {shopDetail?.description || "A premium destination for modern grooming, combining traditional techniques with contemporary style."}
                      </p>
                      <Button variant="ghost" onClick={() => handleOpenMap(shopDetail)} className="mt-4 p-0 h-auto text-orange-400 hover:text-orange-300 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
                        <ExternalLink size={16} /> Locate on Map
                      </Button>
                    </section>

                    <section className="flex-1 flex flex-col lg:min-h-0 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Master Barbers</h3>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Active Now</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 lg:overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {isBarbersLoading ? (
                          [1, 2].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-[1.5rem]" />)
                        ) : shopBarbers && shopBarbers.length > 0 ? (
                          shopBarbers.map((barber: any) => (
                            <motion.div key={barber.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-orange-500/30 transition-all duration-300">
                              <div className="h-12 w-12 rounded-[1rem] bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/10 shadow-inner">
                                <User className="h-6 w-6 text-white/30" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-white truncate mb-1">{barber.user.firstName} {barber.user.lastName}</h4>
                                <div className="flex items-center gap-1.5">
                                  <Star size={12} className="text-orange-400 fill-orange-400" />
                                  <span className="text-xs text-white/40 font-bold">{barber.averageRating.toFixed(1)} Rating</span>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => openChat(barber.user.id, `${barber.user.firstName} ${barber.user.lastName}`)} className="opacity-0 lg:group-hover:opacity-100 transition-opacity border-white/20 hover:bg-white/10 rounded-full px-5 font-bold">
                                Chat
                              </Button>
                            </motion.div>
                          ))
                        ) : (
                          <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-black/20">
                            <p className="text-white/30 font-black uppercase tracking-widest text-xs">No staff listed</p>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="lg:col-span-2 flex flex-col">
                    <section className="flex-1 min-h-[350px] flex flex-col justify-center relative overflow-hidden group rounded-[2.5rem] border border-orange-500/20 bg-gradient-to-b from-orange-500/10 to-black p-8 md:p-10 text-center shadow-2xl shadow-orange-500/5">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full" />
                      <div className="relative z-10">
                        <div className="w-20 h-20 bg-orange-500 rounded-[1.5rem] flex items-center justify-center text-black mx-auto mb-8 shadow-[0_20px_50px_rgba(249,115,22,0.4)]">
                          <CalendarDays size={40} />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Ready to book?</h3>
                        <p className="text-white/60 text-sm mb-10 max-w-[200px] mx-auto leading-relaxed">
                          Join the digital queue at <span className="text-white font-bold">{shopDetail?.name}</span> and skip the wait.
                        </p>
                        {(mounted && isAuthenticated) ? (
                          <Link href={role === 'CUSTOMER' ? '/app' : '/owner'} className="block">
                            <Button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black h-16 rounded-[1.25rem] shadow-xl shadow-orange-500/20 text-lg transition-transform active:scale-95">
                              {role === 'CUSTOMER' ? 'Book Appointment' : 'Go to Dashboard'}
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/auth/login" className="block">
                            <Button className="w-full bg-white hover:bg-gray-200 text-black font-black h-16 rounded-[1.25rem] shadow-xl text-lg transition-transform active:scale-95">
                              Login to Book
                            </Button>
                          </Link>
                        )}
                        <p className="text-xs text-white/30 mt-8 font-bold uppercase tracking-[0.2em]">Open 7 days a week</p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMAGE ZOOM MODAL */}
      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomedImage(null)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative max-w-4xl w-full aspect-[4/5] md:aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10">
              <img src={zoomedImage.url} alt={zoomedImage.name} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black via-black/80 to-transparent">
                <h3 className="text-4xl font-black text-white mb-2">{zoomedImage.name}</h3>
                <p className="text-orange-400 font-bold uppercase tracking-[0.3em] text-sm">Premium Style</p>
              </div>
              <button onClick={() => setZoomedImage(null)} className="absolute top-8 right-8 p-4 bg-black/40 hover:bg-black/60 border border-white/20 rounded-full text-white transition backdrop-blur-md">
                <X size={24} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
