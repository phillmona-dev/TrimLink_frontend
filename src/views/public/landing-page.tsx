"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopService } from "@/api/shopService";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Clock,
  Heart,
  Home,
  MapPin,
  MoreHorizontal,
  Search,
  User,
  Scissors,
  X,
  Star,
  ExternalLink,
  LogOut
} from "lucide-react";
import { Button } from "@/components/common/button";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { AnimatePresence } from "framer-motion";
import { AnimatedBackground } from "@/components/common/animated-background";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/context/ChatContext";

export function LandingPage() {
  const { isAuthenticated, role, logout } = useAuth();
  const { openChat } = useChat();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(query);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [query]);

  const { data: searchResults, isLoading: isSearchLoading } = useQuery({
    queryKey: ["search-shops", activeQuery],
    queryFn: () => shopService.search(activeQuery),
    enabled: !!activeQuery,
  });

  const { data: nearbyShops, isLoading: isNearbyLoading } = useQuery({
    queryKey: ["nearby-shops"],
    queryFn: () => shopService.list(0, 4),
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
    <div className="min-h-[100dvh] md:min-h-screen w-full flex items-center justify-center p-0 md:p-8 lg:p-12 relative overflow-hidden">
      <AnimatedBackground />
      <div className="flex w-full max-w-7xl h-[100dvh] md:h-[85vh] md:gap-6 items-center relative z-10">
        
        {/* Detached Floating Sidebar */}
        <aside className="relative z-50 hidden md:flex flex-col items-center gap-8 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] rounded-full py-8 px-4 w-16 shrink-0 h-fit">
          <div className="group relative">
            <Link href="/" className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 transition shadow-[0_0_15px_rgba(255,136,0,0.3)]">
              <AnimatedIcon icon={Home} size={20} />
            </Link>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 shadow-2xl">
              Home
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
            </div>
          </div>

          <div className="group relative">
            <button onClick={() => document.getElementById('search-input')?.focus()} className="p-3 text-white/50 hover:text-white/90 transition">
              <AnimatedIcon icon={Search} size={20} />
            </button>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 shadow-2xl">
              Search
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
            </div>
          </div>

          <div className="group relative">
            <Link href={(mounted && isAuthenticated) ? "/app" : "/auth/login"} className="p-3 text-white/50 hover:text-white/90 transition">
              <AnimatedIcon icon={CalendarDays} size={20} />
            </Link>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 shadow-2xl">
              Appointments
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
            </div>
          </div>

          <div className="group relative">
            <Link href={(mounted && isAuthenticated) ? "/app" : "/auth/login"} className="p-3 text-white/50 hover:text-white/90 transition">
              <AnimatedIcon icon={Heart} size={20} animate="wiggle" />
            </Link>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 shadow-2xl">
              Favorites
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
            </div>
          </div>

          <div className="group relative">
            <Link href={(mounted && isAuthenticated) ? (role === 'CUSTOMER' ? '/app' : '/owner') : "/auth/login"} className="p-3 text-white/50 hover:text-white/90 transition">
              <AnimatedIcon icon={User} size={20} />
            </Link>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 shadow-2xl">
              {(mounted && isAuthenticated) ? "Profile" : "Login"}
              <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
            </div>
          </div>

          {(mounted && isAuthenticated) && (
            <div className="mt-auto group relative">
              <button onClick={logout} className="p-3 text-white/30 hover:text-red-400 transition">
                <AnimatedIcon icon={LogOut} size={20} />
              </button>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl text-xs font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 shadow-2xl">
                Logout
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
              </div>
            </div>
          )}
        </aside>

        {/* Main Glass Container */}
        <main className="flex-1 h-full bg-black md:bg-white/5 md:backdrop-blur-3xl border-0 md:border md:border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-none md:rounded-[2.5rem] overflow-hidden flex flex-col relative pb-16 md:pb-0">
          
          {/* Subtle inner glass highlight */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none rounded-[2.5rem]"></div>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col lg:flex-row gap-8 md:gap-10 relative z-10 custom-scrollbar">
            
            {/* Left Column (Feed) */}
            <div className="flex-1 flex flex-col gap-8 max-w-2xl">
              
              {/* Search Form */}
              <form 
                className="flex items-center gap-2 md:gap-4 border-b border-white/10 pb-6 w-full"
                onSubmit={(e) => {
                  e.preventDefault();
                  setActiveQuery(query);
                }}
              >
                <div className="hidden sm:flex h-10 w-10 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 items-center justify-center text-white font-bold shrink-0">
                  <AnimatedIcon icon={User} size={20} animate="rotate" />
                </div>
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value === "") {
                      setActiveQuery("");
                    }
                  }}
                  placeholder="Search for a barber or shop..."
                  className="flex-1 min-w-0 h-12 bg-black/40 border border-white/5 rounded-full px-4 md:px-5 flex items-center text-white/90 text-sm focus:outline-none focus:border-orange-500/50 transition"
                />
                <Button type="submit" variant="outline" className="shrink-0 rounded-full border-white/10 bg-white/5 hover:bg-white/10 h-10 px-4 md:px-6 text-sm">
                  Search
                </Button>
              </form>

              {/* Conditional rendering for Feed vs Search Results */}
              {activeQuery ? (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-white/90">Search Results for "{activeQuery}"</span>
                    <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setActiveQuery(""); }} className="text-white/40 hover:text-white/90">
                      Clear
                    </Button>
                  </div>

                  {isSearchLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
                      ))}
                    </div>
                  ) : searchResults?.content && searchResults.content.length > 0 ? (
                    searchResults.content.map(shop => (
                      <motion.div key={shop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition">
                        <div className="flex flex-col items-center">
                          <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                            <Scissors className="h-6 w-6 text-orange-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-lg text-white/90">{shop.name}</span>
                            <Link href={(mounted && isAuthenticated) ? "/app" : "/auth/login"}>
                              <Button size="sm" className="bg-orange-500 text-black hover:bg-orange-600 rounded-full text-xs font-semibold h-8 px-4">
                                Book
                              </Button>
                            </Link>
                          </div>
                          <div className="text-sm text-white/60 mb-2 flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {shop.address}, {shop.city}
                            </div>
                            {shop.latitude && shop.longitude && (
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 transition flex items-center gap-1 w-fit"
                              >
                                <ExternalLink className="h-3 w-3" /> View on Map
                              </a>
                            )}
                            {shop.ownerName && (
                              <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold mt-1">
                                Owned by: <span className="text-white/50">{shop.ownerName}</span>
                              </div>
                            )}
                          </div>
                          {shop.description && (
                            <p className="text-xs text-white/50 line-clamp-2">
                              {shop.description}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 rounded-3xl border border-dashed border-white/10 text-white/40">
                      No shops found matching your search.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {/* Feed Item 1: Hero Feature */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                        <Scissors className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="w-[1px] flex-1 bg-white/10 my-2"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-white/90">TrimLink Booking</span>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <span>Just now</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed mb-4">
                        Book your trim without spending the day waiting. Find trusted barbershops, reserve a slot, and join a live queue.
                      </p>
                      
                      {/* Embedded Hero Banner */}
                      <div className="w-full h-64 rounded-2xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 to-purple-900/80 z-0"></div>
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
                        <div className="relative z-10 p-8 h-full flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
                          <div className="bg-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full w-fit mb-3">
                            Featured Service
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            The Perfect Fade
                          </h2>
                          <p className="text-white/80 text-sm mb-4">
                            Discover top-rated barbers in your area.
                          </p>
                          <Link href="/shops">
                            <Button className="w-fit bg-white text-black hover:bg-white/90 rounded-full px-6 h-10 text-sm font-semibold">
                              Explore Shops
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-4 text-white/40">
                        <AnimatedIcon icon={Heart} size={20} className="hover:text-red-500 cursor-pointer transition" animate="wiggle" />
                        <AnimatedIcon icon={Bell} size={20} className="hover:text-white/90 cursor-pointer transition" animate="rotate" />
                        <span className="text-xs ml-auto">8.2k+ bookings weekly</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Feed Item 2: Testimonial */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-[url('/habesh_man_avatar_1777875648469.png')] bg-cover shrink-0"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-white/90">Amanuel</span>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <span>2h</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed">
                        I no longer spend my evening sitting in a crowded waiting area. I book on TrimLink, arrive when it's my turn, and get served instantly. 🔥
                      </p>
                    </div>
                  </motion.div>

                  {/* Feed Item 3: Core Principles */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                        <Heart className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="w-[1px] flex-1 bg-white/10 my-2"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-white/90">Why TrimLink</span>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <span>4h</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed mb-4">
                        Everything customers need, without the noise. Experience a cleaner way to get a haircut.
                      </p>
                      
                      <div className="grid gap-3">
                        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex gap-4 items-center hover:bg-white/5 transition">
                          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="h-5 w-5 text-white/70" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white/90">Book in a few taps</h4>
                            <p className="text-xs text-white/50 mt-1">Choose a shop and lock in a time instantly.</p>
                          </div>
                        </div>
                        <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex gap-4 items-center hover:bg-white/5 transition">
                          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 text-white/70" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white/90">Join the live queue</h4>
                            <p className="text-xs text-white/50 mt-1">Track your spot in line from anywhere.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Feed Item 4: FAQ Accordion */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                        <Search className="h-5 w-5 text-indigo-400" />
                      </div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-white/90">Help & Support</span>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <span>1d</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="bg-black/20 border border-white/5 rounded-2xl p-5 mt-2 space-y-4">
                        <div className="border-b border-white/5 pb-3">
                          <h4 className="text-sm font-medium text-white/80">Can I use TrimLink with weak data?</h4>
                          <p className="text-xs text-white/50 mt-1">Yes, the experience is designed to stay light and usable on slower connections.</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white/80">Which payments are supported?</h4>
                          <p className="text-xs text-white/50 mt-1">We fully support Telebirr and Chapa for trusted digital payments.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

            </div>

            {/* Right Column (Widgets) */}
            <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
              
              {/* Nearby Shops Widget */}
              <div className="bg-black/20 border border-white/5 rounded-[1.5rem] p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-sm font-medium text-white/60">Nearby Shops</h3>
                  <Link href="/auth/login" className="text-xs text-white/90 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition">View All</Link>
                </div>
                
                <div className="flex flex-col gap-4">
                  {isNearbyLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-white/5 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : nearbyShops?.content && nearbyShops.content.length > 0 ? (
                    nearbyShops.content.map((shop) => (
                      <div key={shop.id} className="flex items-center justify-between gap-3 group">
                        <button 
                          onClick={() => handleOpenMap(shop)}
                          className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/5 hover:bg-orange-500/20 hover:border-orange-500/30 transition group"
                        >
                          <MapPin className="h-4 w-4 text-white/60 group-hover:text-orange-400 transition" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white/90 truncate">{shop.name}</div>
                          <div className="text-xs text-white/40 truncate">{shop.address}</div>
                        </div>
                        <button 
                          onClick={() => setSelectedShopId(shop.id)}
                          className="text-xs font-medium text-white/90 hover:text-orange-400 transition"
                        >
                          View
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-white/40 text-center py-4">No nearby shops found.</div>
                  )}
                </div>
              </div>

              {/* Queue Widget */}
              <div className="bg-black/20 border border-white/5 rounded-[1.5rem] p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-white/60" />
                    <h3 className="text-sm font-medium text-white/60">Live Queue Demo</h3>
                  </div>
                </div>
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  See how the live queue helps you track your spot without waiting in the shop.
                </p>
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/5 p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center text-xs text-white/60">
                    <span>Current Serving: #12</span>
                    <span>Est. Wait: 15m</span>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-white/90 tracking-tighter">#15</div>
                    <div className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mt-1">Your Ticket</div>
                  </div>
                </div>
              </div>

              {/* Pricing Widget */}
              <div className="bg-black/20 border border-white/5 rounded-[1.5rem] p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-white/60">For Shop Owners</h3>
                  <div className="text-[10px] uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">Pricing</div>
                </div>
                
                <div className="space-y-3">
                  {/* Starter Tier */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition">
                    <div>
                      <div className="text-sm font-medium text-white/90">Starter</div>
                      <div className="text-xs text-white/40">1,250 ETB / mo</div>
                    </div>
                    <Link href="/auth/login" className="text-xs bg-white/10 text-white rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition">View</Link>
                  </div>
                  
                  {/* Growth Tier (Popular) */}
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 flex justify-between items-center group cursor-pointer hover:bg-orange-500/20 transition relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-10 h-10 bg-orange-500/20 rotate-45 translate-x-5 -translate-y-5 blur-sm"></div>
                    <div>
                      <div className="text-sm font-medium text-orange-50 flex items-center gap-2">
                        Growth
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
                      </div>
                      <div className="text-xs text-orange-200/60">3,900 ETB / mo</div>
                    </div>
                    <Link href="/auth/login" className="text-xs bg-orange-500 text-black font-medium rounded-full px-3 py-1">Select</Link>
                  </div>

                </div>
              </div>

              {/* Footer Links */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 px-2">
                {[
                  { name: "About", path: "/about" },
                  { name: "Privacy", path: "/privacy" },
                  { name: "Terms", path: "/terms" },
                  { name: "Pricing", path: "/pricing" },
                  { name: "Contact", path: "/contact" },
                  { name: "FAQ", path: "/faq" },
                  { name: "Help", path: "/help" }
                ].map((item) => (
                  <Link key={item.name} href={item.path} className="text-[11px] text-white/30 hover:text-white/60 transition">
                    {item.name}
                  </Link>
                ))}
                <span className="text-[11px] text-white/30 w-full mt-2">© 2026 TrimLink.</span>
              </div>

            </div>

          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-3xl border-t border-white/10 z-[60] flex items-center justify-around px-2">
          <Link href="/" className="flex flex-col items-center gap-1 text-orange-400 p-2">
            <Home size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <button onClick={() => document.getElementById('search-input')?.focus()} className="flex flex-col items-center gap-1 text-white/50 hover:text-white/90 p-2">
            <Search size={20} />
            <span className="text-[10px] font-medium">Search</span>
          </button>
          <Link href={isAuthenticated ? "/app" : "/auth/login"} className="flex flex-col items-center gap-1 text-white/50 hover:text-white/90 p-2">
            <CalendarDays size={20} />
            <span className="text-[10px] font-medium">Book</span>
          </Link>
          <Link href={isAuthenticated ? (role === 'CUSTOMER' ? '/app' : '/owner') : "/auth/login"} className="flex flex-col items-center gap-1 text-white/50 hover:text-white/90 p-2">
            <User size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </nav>
      </div>

      {/* Shop Detail Modal */}
      <AnimatePresence>
        {selectedShopId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedShopId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[20px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 30 }}
              className="relative w-full max-w-4xl bg-black md:bg-white/5 border-0 md:border md:border-white/10 rounded-none md:rounded-[3rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.9)] h-[100dvh] md:h-[85vh] flex flex-col"
            >
              {/* Crystal Clear High-Definition Background - SYSTEM ANIMATED BACKGROUND */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                 <div className="absolute inset-0 bg-black/40 z-10" />
                 <div className="hidden md:block">
                   <AnimatedBackground />
                 </div>
              </div>

              <div className="relative z-10 flex-1 flex flex-col p-6 md:p-10 overflow-hidden">
                {/* Header - Compact */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                      <Scissors className="h-7 w-7 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{shopDetail?.name || "Loading..."}</h2>
                      <div className="flex items-center gap-1.5 text-white/40">
                        <MapPin className="h-3 w-3 text-orange-500/60" />
                        <span className="text-xs font-bold uppercase tracking-wider">{shopDetail?.city}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedShopId(null)}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content Area - Two Columns for efficiency */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 min-h-0 overflow-y-auto md:overflow-hidden">
                  
                  {/* Left Side: About & Barbers */}
                  <div className="flex flex-col gap-8 min-h-0">
                    <section className="shrink-0">
                      <h3 className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.3em] mb-3">The Experience</h3>
                      <p className="text-base text-white/80 leading-relaxed font-medium italic line-clamp-3">
                        "{shopDetail?.description || "A premium destination for modern grooming, combining traditional techniques with contemporary style."}"
                      </p>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleOpenMap(shopDetail)}
                        className="mt-3 p-0 h-auto text-orange-400 hover:text-orange-300 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
                      >
                        <ExternalLink size={14} /> Locate on Map
                      </Button>
                    </section>

                    <section className="flex-1 flex flex-col min-h-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Master Barbers</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest">Active Now</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 md:overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {isBarbersLoading ? (
                          [1, 2].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-[1.5rem]" />)
                        ) : shopBarbers && shopBarbers.length > 0 ? (
                          shopBarbers.map((barber: any) => (
                            <motion.div 
                              key={barber.id} 
                              className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 group hover:bg-white/[0.08] transition-all duration-300"
                            >
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-white/5">
                                <User className="h-5 w-5 text-white/20" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">{barber.user.firstName} {barber.user.lastName}</h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Star size={10} className="text-orange-400 fill-orange-400" />
                                  <span className="text-[10px] text-white/30 font-bold tracking-tighter">{barber.averageRating.toFixed(1)} Rating</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openChat(barber.user.id, `${barber.user.firstName} ${barber.user.lastName}`)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity border-white/10 hover:bg-white/10 text-[10px] h-8 rounded-full"
                              >
                                Chat
                              </Button>
                            </motion.div>
                          ))
                        ) : (
                          <div className="h-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                            <p className="text-white/20 font-black uppercase tracking-widest text-[9px]">No staff listed</p>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>

                  {/* Right Side: CTA Card */}
                  <div className="flex flex-col">
                    <section className="flex-1 flex flex-col justify-center relative overflow-hidden group rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-orange-500/5 to-transparent p-10 text-center">
                      {/* Inner animated glow */}
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full"
                      />

                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-black mx-auto mb-6 shadow-[0_15px_40px_rgba(249,115,22,0.3)]">
                          <CalendarDays size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Ready to book?</h3>
                        <p className="text-white/40 text-xs mb-8 max-w-xs mx-auto leading-relaxed">
                          Join the digital queue at <span className="text-orange-400 font-bold">{shopDetail?.name}</span> and skip the wait.
                        </p>
                        {(mounted && isAuthenticated) ? (
                          <Link href={role === 'CUSTOMER' ? '/app' : '/owner'} className="block">
                            <Button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black h-14 rounded-2xl shadow-xl text-base transition-all hover:scale-[1.02]">
                              {role === 'CUSTOMER' ? 'Book Now' : 'Go to Dashboard'}
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/auth/login" className="block">
                            <Button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black h-14 rounded-2xl shadow-xl text-base transition-all hover:scale-[1.02]">
                              Login to Book Now
                            </Button>
                          </Link>
                        )}
                        <p className="text-[10px] text-white/20 mt-6 font-bold uppercase tracking-[0.2em]">Open 7 days a week</p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global styling for custom scrollbar within the glass pane */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
