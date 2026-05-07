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
          
          {/* Brand Header - Full Width */}
          <div className="shrink-0 p-6 md:px-10 md:pt-10 flex items-center justify-between border-b border-white/5 bg-white/[0.02] backdrop-blur-md relative z-20">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                <Scissors className="h-6 w-6 md:h-7 md:h-7 text-black" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">
                  Trim<span className="text-orange-500">Link</span>
                </h1>
                <p className="hidden sm:block text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/30 font-bold mt-1">
                  Premium Grooming Marketplace
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="outline" className="hidden sm:flex rounded-full border-white/10 text-white/60 hover:text-white h-9 px-5 text-xs font-bold uppercase tracking-widest">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="rounded-full bg-orange-500 text-black hover:bg-orange-400 h-9 px-5 text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-10 flex flex-col lg:flex-row gap-8 md:gap-10 relative z-10 custom-scrollbar">
            
            {/* Left Column (Feed) */}
            <div className="flex-1 flex flex-col gap-10 max-w-2xl">
              
              {/* Elegant Small Search Bar */}
              <form 
                className="flex items-center gap-3 w-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/20 rounded-[1.5rem] p-2 transition-all focus-within:border-orange-500/50 focus-within:bg-black/60 shadow-[0_10px_30px_rgba(0,0,0,0.3)] mb-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setActiveQuery(query);
                }}
              >
                <div className="hidden sm:flex h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-400 items-center justify-center text-white shrink-0 ml-1">
                  <AnimatedIcon icon={Scissors} size={18} animate="wiggle" />
                </div>
                <div className="pl-3 sm:pl-1">
                  <Search className="h-5 w-5 text-white/40 group-focus-within:text-orange-500 transition-colors" />
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
                  placeholder="Search for shops or barbers"
                  className="flex-1 min-w-0 h-10 bg-transparent px-2 text-white/90 text-sm focus:outline-none placeholder:text-white/30"
                />
                <Button type="submit" className="shrink-0 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold h-10 px-6 text-sm transition-transform active:scale-95 shadow-md shadow-orange-500/20 mr-1">
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
                <div className="flex flex-col gap-10">
                  {/* Showcase Section (Moving Cards) */}
                  <section className="relative py-4 -mx-4 md:-mx-10 overflow-hidden">
                    <div className="px-4 md:px-10 mb-6">
                      <h3 className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.3em]">
                        Style Showcase
                      </h3>
                      <h2 className="text-xl font-bold text-white mt-1">
                        Trending Trims
                      </h2>
                    </div>
                    
                    <Marquee baseVelocity={-3}>
                      <div className="flex gap-4 pr-4">
                        <HaircutCard image="/images/haircuts/haircut1.png" name="Sharp Fade" tag="Modern" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut1.png", name: "Sharp Fade" })} />
                        <HaircutCard image="/images/haircuts/habesha_cut_1.png" name="Curly Top Fade" tag="Habesha Teen" onClick={() => setZoomedImage({ url: "/images/haircuts/habesha_cut_1.png", name: "Curly Top Fade" })} />
                        <HaircutCard image="/images/haircuts/haircut2.png" name="Urban Taper" tag="Teenager" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut2.png", name: "Urban Taper" })} />
                        <HaircutCard image="/images/haircuts/habesha_cut_2.png" name="Fresh Taper" tag="Habesha Style" onClick={() => setZoomedImage({ url: "/images/haircuts/habesha_cut_2.png", name: "Fresh Taper" })} />
                        <HaircutCard image="/images/haircuts/haircut3.png" name="Habesha Classic" tag="Ethiopian" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut3.png", name: "Habesha Classic" })} />
                        <HaircutCard image="/images/haircuts/habesha_cut_3.png" name="Sponge Curls" tag="Habesha Teen" onClick={() => setZoomedImage({ url: "/images/haircuts/habesha_cut_3.png", name: "Sponge Curls" })} />
                        <HaircutCard image="/images/haircuts/haircut4.png" name="Design Fade" tag="Street" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut4.png", name: "Design Fade" })} />
                        <HaircutCard image="/images/haircuts/haircut5.png" name="Skin Fade" tag="Modern" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut5.png", name: "Skin Fade" })} />
                        <HaircutCard image="/images/haircuts/haircut1.png" name="Textured Crop" tag="Trending" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut1.png", name: "Textured Crop" })} />
                        <HaircutCard image="/images/haircuts/haircut2.png" name="Curly Top" tag="Habesha" onClick={() => setZoomedImage({ url: "/images/haircuts/haircut2.png", name: "Curly Top" })} />
                      </div>
                    </Marquee>
                  </section>

                  {/* Featured Shop Feature */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30">
                        <Scissors className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="w-[1px] flex-1 bg-white/10 my-2"></div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-white/90">Featured Destination</span>
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <span>Verified</span>
                          <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                        </div>
                      </div>
                      
                      <div className="w-full h-72 rounded-3xl overflow-hidden relative group cursor-pointer shadow-2xl border border-white/5">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
                        <div className="relative z-20 p-8 h-full flex flex-col justify-end">
                          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                            The Master's Touch
                          </h2>
                          <p className="text-white/60 text-sm mb-6 max-w-sm">
                            Experience the highest level of craftsmanship in a premium environment.
                          </p>
                          <Link href="/shops">
                            <Button className="w-fit bg-orange-500 text-black hover:bg-orange-400 rounded-full px-8 h-12 text-sm font-black transition-all hover:scale-105 shadow-[0_10px_20px_rgba(249,115,22,0.3)]">
                              EXPLORE SHOPS
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>



                  {/* How it Works Section */}
                  <section className="flex flex-col gap-8">
                    <div>
                      <h3 className="text-[10px] font-black text-orange-500/60 uppercase tracking-[0.3em]">
                        Simplicity Redefined
                      </h3>
                      <h2 className="text-xl font-bold text-white mt-1">
                        How TrimLink Works
                      </h2>
                    </div>

                    <div className="space-y-6">
                      {[
                        { step: "01", title: "Find your shop", desc: "Discover premium barbershops in your area with detailed service listings.", icon: Search },
                        { step: "02", title: "Pick a slot", desc: "Book your preferred time and barber instantly without the phone calls.", icon: CalendarDays },
                        { step: "03", title: "Join the queue", desc: "Track your spot in line and arrive just in time for your premium cut.", icon: Clock }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="flex gap-6 items-start group"
                        >
                          <div className="text-4xl font-black text-white/5 group-hover:text-orange-500/10 transition-colors">
                            {item.step}
                          </div>
                          <div className="flex-1 pt-2">
                            <h4 className="text-base font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-white/50 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
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

              {/* Queue Widget - Removed */}
              {/* Pricing Widget - Removed */}

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

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {zoomedImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomedImage(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="relative max-w-3xl w-full aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
            >
              <img 
                src={zoomedImage.url} 
                alt={zoomedImage.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-2xl font-black text-white">{zoomedImage.name}</h3>
                <p className="text-orange-400 font-bold uppercase tracking-[0.2em] text-xs mt-1">Premium Trim</p>
              </div>
              <button 
                onClick={() => setZoomedImage(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white transition backdrop-blur-md"
              >
                <X size={24} />
              </button>
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
