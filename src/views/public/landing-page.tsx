"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "@/api/shopService";
import { barberService } from "@/api/barberService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Heart, Home, MapPin, Search, User, Scissors, X, Star,
  ExternalLink, CalendarDays, Clock, MoreHorizontal, Ticket, MessageSquare, Repeat2, Send, Plus, SquarePen, Image, LogOut, Menu
} from "lucide-react";
import { Button } from "@/components/common/button";
import { useAuth } from "@/hooks/use-auth";
import { Marquee } from "@/components/common/marquee";
import { HaircutCard } from "@/components/common/haircut-card";
import { formatImageUrl } from "@/utils/constants";

/* ─── Integrated Landing Page ────────────────────────────────────────── */
export function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, role, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // States for searching barbers
  const [barberSearchQuery, setBarberSearchQuery] = useState("");
  const [debouncedBarberQuery, setDebouncedBarberQuery] = useState("");

  useEffect(() => { setMounted(true); }, []);

  // Debounced search query trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Debounced barber search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBarberQuery(barberSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [barberSearchQuery]);

  const haircuts = [
    { name: "Curly Top Fade", tag: "Habesha Teen", image: "/images/haircuts/habesha_cut_1.png" },
    { name: "Textured Crop", tag: "Trending", image: "/images/haircuts/haircut1.png" },
    { name: "Urban Taper", tag: "Teenager", image: "/images/haircuts/haircut2.png" },
    { name: "Fresh Taper", tag: "Habesha Style", image: "/images/haircuts/habesha_cut_2.png" },
    { name: "Sharp Fade", tag: "Modern", image: "/images/haircuts/haircut3.png" },
    { name: "Curly Top Fade", tag: "Habesha Teen", image: "/images/haircuts/habesha_cut_3.png" },
    { name: "Textured Crop", tag: "Trending", image: "/images/haircuts/haircut4.png" },
    { name: "Urban Taper", tag: "Modern", image: "/images/haircuts/haircut5.png" }
  ];

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["search-shops", activeQuery],
    queryFn: () => shopService.search(activeQuery),
    enabled: !!activeQuery,
  });

  const { data: nearbyShops } = useQuery({
    queryKey: ["nearby-shops"],
    queryFn: () => shopService.list(0, 8),
  });

  const { data: shopDetail } = useQuery({
    queryKey: ["shop-detail", selectedShopId],
    queryFn: () => shopService.getById(selectedShopId!),
    enabled: !!selectedShopId,
  });

  const { data: shopBarbers, isLoading: isBarbersLoading } = useQuery({
    queryKey: ["shop-barbers", selectedShopId],
    queryFn: () => shopService.getBarbers(selectedShopId!),
    enabled: !!selectedShopId,
  });

  // Query platform barbers for "Featured Barbers" list using debounced query
  const { data: platformBarbersResponse } = useQuery({
    queryKey: ["featured-barbers", debouncedBarberQuery],
    queryFn: () => barberService.listBarbers({ q: debouncedBarberQuery, size: 6 }),
  });

  const fallbackBarbers = [
    { id: "1", user: { firstName: "Jane", lastName: "Cooper", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" }, averageRating: 4.9, shopId: nearbyShops?.content?.[0]?.id },
    { id: "2", user: { firstName: "Arlene", lastName: "McCoy", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" }, averageRating: 4.8, shopId: nearbyShops?.content?.[0]?.id },
    { id: "3", user: { firstName: "Cody", lastName: "Fisher", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" }, averageRating: 4.7, shopId: nearbyShops?.content?.[1]?.id },
    { id: "4", user: { firstName: "Cameron", lastName: "Williamson", avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100" }, averageRating: 4.9, shopId: nearbyShops?.content?.[1]?.id },
    { id: "5", user: { firstName: "Arlene", lastName: "McCoy", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" }, averageRating: 4.6, shopId: nearbyShops?.content?.[2]?.id },
    { id: "6", user: { firstName: "Darlene", lastName: "Robertson", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100" }, averageRating: 4.8, shopId: nearbyShops?.content?.[2]?.id }
  ];

  const featuredBarbers = platformBarbersResponse?.content?.length 
    ? platformBarbersResponse.content.slice(0, 6) 
    : fallbackBarbers;

  const handleOpenMap = (shop: any) => {
    if (shop?.latitude && shop?.longitude) {
      const q = encodeURIComponent(`${shop.name} ${shop.latitude},${shop.longitude}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen w-full relative text-white flex flex-col overflow-x-hidden">
      {/* Inject custom style to hide scrollbars */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>


      {/* COMPREHENSIVE TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 md:h-20 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-4">
          <div className="flex items-center gap-6">
            <Link href="/trim" className="flex items-center gap-3">
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
            </Link>

            <div className="hidden lg:flex items-center gap-6 ml-6 border-l border-white/10 pl-6">
              <Link href="/shops" className="text-xs font-bold uppercase tracking-wider text-white/60 hover:text-orange-500 transition-colors">
                Explore All Shops
              </Link>
              <Link href="/styles-library" className="text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full">
                <Scissors className="w-3.5 h-3.5" />
                Styles Library
              </Link>
            </div>
          </div>

          {/* Search Bar */}
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

          {/* Actions */}
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
              <Link href="/shops" className="text-lg font-bold text-white/60 p-2">Explore All Shops</Link>
              <Link href="/styles-library" className="text-lg font-bold text-orange-400 p-2 flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Styles Library
              </Link>
              {mounted && isAuthenticated ? (
                <Link href="/app" className="text-lg font-bold text-white/60 p-2">Dashboard</Link>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative z-10 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col gap-8 md:gap-12">
        
        {/* SEARCH RESULTS OR SOCIAL THREADS CONTAINER */}
        <section className="relative w-full">
          {activeQuery ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 md:p-10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white">Results for "{activeQuery}"</h3>
                <Button variant="ghost" onClick={() => { setQuery(""); setActiveQuery(""); }} className="text-white/40 hover:text-white">Clear Search</Button>
              </div>

              {isSearchLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-3xl" />)}
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
            /* Layout Container - Left Sidebar icons removed */
            <div className="w-full max-w-[1380px] mx-auto">
              
              {/* Glassmorphic Container matching mockup color combinations */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 rounded-[2.5rem] bg-white/[0.04] backdrop-blur-[35px] border border-white/[0.08] p-6 sm:p-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.85)] overflow-hidden">
                
                {/* Feed Column */}
                <div className="lg:col-span-2 flex flex-col gap-6 max-h-[800px] overflow-y-auto pr-1 no-scrollbar">

                  {/* Post 1: TrimLink Info Card */}
                  <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center border border-white/10 shrink-0">
                        <Scissors size={14} className="text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">TrimLink Guide</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest">Official</span>
                          </div>
                        </div>
                        <p className="text-xs text-white/70 mt-1 leading-relaxed">
                          Welcome to TrimLink. Our premium digital marketplace connects clients with local grooming experts. Browse active barber profiles, view verified ratings, and schedule your appointment online without the hassle of waiting in queues.
                        </p>
                      </div>
                    </div>

                    {/* Featured The Master's Touch Card inside the Post — Minimized height & redirects to shops list */}
                    <Link 
                      href="/shops"
                      className="relative rounded-2xl overflow-hidden h-36 border border-white/10 group cursor-pointer block"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop"
                        alt="The Master's Touch"
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute inset-0 p-4 flex flex-col justify-end items-start gap-0.5">
                        <span className="bg-[#f97316] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-1 group-hover:bg-orange-400 transition-colors">
                          Book Now
                        </span>
                        <h3 className="text-sm font-black text-white leading-tight">The Master's Touch</h3>
                        <p className="text-[10px] text-white/70">Discover top-rated barbers. Book your slot in seconds.</p>
                      </div>
                    </Link>
                  </div>

                  {/* Post 2: Jerome Bell - Moving Marquee Pictures side-to-side */}
                  <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-white/10 shrink-0">
                        <Star size={14} className="text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">Style Directory</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest font-mono">Trends</span>
                          </div>
                        </div>
                        <p className="text-xs text-white/70 mt-1 leading-relaxed">
                          Explore our interactive style showcase. Scroll through trending haircuts below, select your desired style, and instantly discover skilled barbers in your area who specialize in that cut.
                        </p>
                      </div>
                    </div>

                    {/* Moving Marquee Pictures Side-to-Side */}
                    <div className="w-full overflow-hidden select-none py-2 bg-black/10 rounded-2xl border border-white/5">
                      <Marquee baseVelocity={-1.5}>
                        <div className="flex gap-4 pr-4">
                          {haircuts.map((cut, index) => (
                            <HaircutCard
                              key={index}
                              image={cut.image}
                              name={cut.name}
                              tag={cut.tag}
                              onClick={() => setSelectedShopId(nearbyShops?.content?.[0]?.id || null)}
                            />
                          ))}
                        </div>
                      </Marquee>
                    </div>
                  </div>

                  {/* Explore All Shops Call-To-Action Card */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
                        <Scissors size={20} className="text-orange-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Looking for a specific Barbershop?</h4>
                        <p className="text-xs text-white/60 mt-1">Browse our complete directory of premium local shops.</p>
                      </div>
                    </div>
                    <Link href="/shops">
                      <Button className="bg-orange-500 hover:bg-orange-400 text-black font-black px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] shrink-0">
                        Explore All Shops
                      </Button>
                    </Link>
                  </div>

                  {/* Pagination Indicators */}
                  <div className="flex items-center justify-center gap-1.5 py-2">
                    <div className="h-1.5 w-6 rounded-full bg-white/80" />
                    <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  </div>

                </div>

                {/* Suggestions Column (Featured Barbers) */}
                <div className="flex flex-col gap-6 lg:border-l lg:border-white/10 lg:pl-6">
                  
                  {/* Widget 1: Featured Barbers */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white/80 tracking-wider">Featured Barbers</h3>
                      <Link href="/shops" className="text-[9px] font-bold text-white/50 bg-white/10 px-2.5 py-1 rounded-full hover:text-white transition">View All</Link>
                    </div>
                    
                    {/* Barber search input box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
                      <input
                        type="text"
                        value={barberSearchQuery}
                        onChange={(e) => setBarberSearchQuery(e.target.value)}
                        placeholder="Search barbers..."
                        className="w-full bg-white/[0.03] border border-white/5 focus:border-orange-500/50 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-white/25 focus:outline-none transition-all"
                      />
                      {barberSearchQuery && (
                        <button onClick={() => setBarberSearchQuery("")} className="absolute right-3 top-2.5 text-white/30 hover:text-white">
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col gap-3.5">
                      {featuredBarbers.map((barber: any, idx: number) => {
                        const name = barber.user ? `${barber.user.firstName} ${barber.user.lastName}` : "Professional Barber";
                        const avatar = formatImageUrl(barber.user?.avatarUrl) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100";
                        const rating = barber.averageRating || 4.8;
                        const targetShopId = barber.shopId || nearbyShops?.content?.[0]?.id || "";

                        return (
                          <div key={idx} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3 min-w-0">
                              <img src={avatar} alt={name} className="h-8 w-8 rounded-full object-cover border border-white/10 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white/90 truncate">{name}</div>
                                <div className="flex items-center gap-1 text-[9px] text-white/40">
                                  <Star size={10} className="text-orange-400 fill-orange-400" />
                                  <span>{rating.toFixed(1)} Rating</span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                if (targetShopId) {
                                  setSelectedShopId(targetShopId);
                                }
                              }}
                              className="text-[9px] font-black text-white bg-white/10 hover:bg-orange-500 hover:text-black border border-white/10 px-3.5 py-1.5 rounded-full transition"
                            >
                              Book
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Widget 2: Today on TrimLink */}
                  <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-white/80 tracking-wider">Today on TrimLink</h3>
                      <span className="text-[9px] font-bold text-white/50 bg-white/10 px-2.5 py-1 rounded-full">View All</span>
                    </div>
                    
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-orange-500/10 flex items-center justify-center border border-white/10 shrink-0">
                          <Scissors size={10} className="text-orange-400" />
                        </div>
                        <span className="text-[10px] font-bold text-white/80">Queue Management</span>
                      </div>
                      <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                        Discover top-rated barbers, join the virtual queue remotely to save time, and book your next appointment seamlessly from any device.
                      </p>
                      <div className="h-28 rounded-xl overflow-hidden relative border border-white/10">
                        <img src="/images/barber-bg.jpg" className="w-full h-full object-cover" alt="Barber tools" />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 bg-black/40 mt-12 relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-white/80">TrimLink</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {["About", "Privacy", "Terms", "Pricing", "Contact", "FAQ"].map((link: string) => (
              <Link key={link} href={`/${link.toLowerCase()}`} className="text-xs font-bold uppercase tracking-wider text-white/30 hover:text-white/80 transition">
                {link}
              </Link>
            ))}
          </div>
          <div className="text-xs text-white/20">
            © 2026 TrimLink Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* SHOP DETAIL MODAL */}
      <AnimatePresence>
        {selectedShopId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedShopId(null)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-2xl bg-[#211917] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col z-10"
            >
              <div className="p-6 border-b border-white/[0.07] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                    <Scissors size={22} className="text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{shopDetail?.name || "Loading..."}</h2>
                    <div className="flex items-center gap-1.5 text-white/40 text-xs mt-0.5"><MapPin size={12} />{shopDetail?.city}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedShopId(null)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <h3 className="text-xs font-black text-orange-500/60 uppercase tracking-widest mb-2">About</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{shopDetail?.description || "A premium barbershop destination."}</p>
                  {shopDetail?.latitude && (
                    <button onClick={() => handleOpenMap(shopDetail)} className="mt-3 flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition">
                      <ExternalLink size={14} /> Open in Maps
                    </button>
                  )}
                </div>
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                  <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-3">Barbers & Services</h3>
                  {isBarbersLoading ? (
                    <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 bg-white/5 animate-pulse rounded-xl" />)}</div>
                  ) : shopBarbers?.length > 0 ? (
                    <div className="space-y-3">
                      {shopBarbers.map((barber: any) => (
                        <div key={barber.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center border border-white/5">
                              {barber.user?.avatarUrl ? (
                                <img src={formatImageUrl(barber.user.avatarUrl)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <User size={16} className="text-white/30" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate">{barber.user.firstName} {barber.user.lastName}</div>
                              <div className="flex items-center gap-1"><Star size={10} className="text-orange-400 fill-orange-400" /><span className="text-[10px] text-white/40">{barber.averageRating?.toFixed(1)} Rating</span></div>
                            </div>
                          </div>

                          {/* Services for this barber */}
                          {barber.serviceAssignments && barber.serviceAssignments.length > 0 ? (
                            <div className="space-y-1.5 pt-2 border-t border-white/5">
                              {barber.serviceAssignments.map((assignment: any) => (
                                <div
                                  key={assignment.id}
                                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-orange-500/30 transition-all"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-white text-xs truncate">{assignment.serviceName}</p>
                                    <p className="text-[10px] text-orange-400/70 font-bold mt-0.5">{assignment.durationMinutes}min</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs font-black text-white whitespace-nowrap">
                                      ETB {assignment.effectivePrice}
                                    </span>
                                    {mounted && isAuthenticated ? (
                                      <Link
                                        href={`/app/booking?shopId=${selectedShopId}&barberId=${barber.id}&serviceId=${assignment.serviceId}`}
                                      >
                                        <button className="px-2.5 py-1 bg-orange-500 hover:bg-orange-400 text-black font-black text-[9px] rounded-lg transition-all">
                                          BOOK
                                        </button>
                                      </Link>
                                    ) : (
                                      <Link
                                        href={`/auth/login?redirect=/app/booking?shopId=${selectedShopId}%26barberId=${barber.id}%26serviceId=${assignment.serviceId}`}
                                      >
                                        <button className="px-2.5 py-1 bg-orange-500 hover:bg-orange-400 text-black font-black text-[9px] rounded-lg transition-all">
                                          BOOK
                                        </button>
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-white/30 italic">No services assigned yet.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-white/30 py-4">No staff listed.</p>
                  )}
                </div>
                <Link href={mounted && isAuthenticated ? (role === 'CUSTOMER' ? `/app/shops/${selectedShopId}` : '/owner') : `/auth/login?redirect=/app/shops/${selectedShopId}`} className="block">
                  <Button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black h-12 rounded-2xl text-sm">
                    {mounted && isAuthenticated ? 'Book Appointment' : 'Login to Book'}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
