"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin, Search, Sparkles, Star, Scissors, 
  Calendar, Clock, TrendingUp, ChevronRight,
  ArrowRight, ShieldCheck, Heart
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { barberService } from "@/api/barberService";
import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { QueueWidget } from "@/components/widgets/queue-widget";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { type Shop, type BarberProfile } from "@/types";

export function CustomerHomePage() {
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search logic - faster for "on typing" feel
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(search);
    }, 200); // Reduced from 400ms
    return () => clearTimeout(timer);
  }, [search]);

  const shopsQuery = useQuery({
    queryKey: ["shops", activeQuery],
    queryFn: () => barberService.listShops({ q: activeQuery, size: 6 }),
  });

  const barbersQuery = useQuery({
    queryKey: ["barbers", activeQuery],
    queryFn: () => barberService.listBarbers({ q: activeQuery, size: 6 }),
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 pb-20"
    >
      {/* ── Hero Section ── */}
      <motion.section variants={itemVariants} className="relative">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 p-6 md:p-10 shadow-2xl">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/10 blur-[100px] -mr-24 -mt-24 rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-500/5 blur-[80px] -ml-12 -mb-12 rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-2 text-orange-500 mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Premium Grooming Network</span>
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl font-black text-white leading-[1.1] tracking-tight mb-4">
              Style that <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Defines</span> You.
            </h1>
            
            <p className="text-base text-white/50 leading-relaxed mb-8 max-w-lg">
              Skip the wait. Discover the best barbershops in Ethiopia and book your next session in seconds.
            </p>
            
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Find a shop or barber..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setActiveQuery(search);
                      // Scroll to results
                      document.getElementById("shops-section")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full h-12 pl-12 pr-6 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all text-base"
                />
              </div>
              <Link href="/app/shops" className="contents">
                <button className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 text-sm">
                  Explore Now <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Awareness Strip ── */}
      <motion.section variants={itemVariants} className="flex flex-wrap items-center gap-3 px-2">
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mr-2">Quick Access:</span>
        <AwarenessLink label="Book Appointment" href="#shops-section" />
        <AwarenessLink label="Live Queue" href="#shops-section" />
        <AwarenessLink label="Top Rated Barbers" href="#barbers-section" />
      </motion.section>


      {/* ── Recommended Shops ── */}
      <motion.section id="shops-section" variants={itemVariants} className="space-y-6">
        <div className="flex items-end justify-between px-2">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Nearby Masterpieces</h2>
            <p className="text-white/40 mt-1">Exceptional barbershops around your location.</p>
          </div>
          <Link href="/app/shops" className="text-orange-500 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all group">
            See all <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {shopsQuery.data?.content.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </AnimatePresence>
          {shopsQuery.isLoading && [1,2,3].map(i => <div key={i} className="h-[300px] bg-white/5 rounded-[2rem] animate-pulse" />)}
          {shopsQuery.data?.content.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-[2rem] text-white/30 italic">
              No shops found matching "{activeQuery}"
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Top Barbers ── */}
      <motion.section id="barbers-section" variants={itemVariants} className="space-y-6">
        <div className="flex items-end justify-between px-2">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Expert Hands</h2>
            <p className="text-white/40 mt-1">Highly skilled barbers rated by the community.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {barbersQuery.data?.content.map((barber) => (
            <BarberCard key={barber.id} barber={barber} />
          ))}
        </div>
      </motion.section>

      {/* ── Live Status / Queue ── */}
      <motion.section variants={itemVariants} className="pt-10 border-t border-white/5">
        <div className="mb-6 px-2">
          <h2 className="text-xl font-black text-white/30 uppercase tracking-widest">My Active Queue</h2>
        </div>
        <QueueWidget ticket={null} />
      </motion.section>
    </motion.div>
  );
}

function AwarenessLink({ label, href }: { label: string; href: string }) {
  const isAnchor = href.startsWith("#");
  
  const content = (
    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/20 transition-all cursor-pointer">
      {label}
    </div>
  );

  if (isAnchor) {
    return (
      <button 
        onClick={() => document.getElementById(href.substring(1))?.scrollIntoView({ behavior: "smooth" })}
        className="contents"
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href}>
      {content}
    </Link>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
    >
      <Link href={`/app/shops/${shop.id}`}>
        <Card className="group relative h-[200px] p-0 overflow-hidden border-white/5 hover:border-orange-500/30 transition-all duration-500 cursor-pointer rounded-[1.5rem]">
          {/* Background Image / Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-[#121212]">
             <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-blue-500/20 opacity-40 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 z-20 p-5 flex flex-col justify-end">
            <div className="flex items-center gap-1.5 text-orange-500 mb-1.5">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[9px] font-black uppercase tracking-widest">4.9 • Premium</span>
            </div>
            
            <h3 className="text-lg font-black text-white mb-0.5 group-hover:text-orange-400 transition-colors">{shop.name}</h3>
            
            <div className="flex items-center gap-1.5 text-white/40 text-[10px]">
              <MapPin className="w-3 h-3" />
              {shop.city}
            </div>
          </div>

          {/* Hover state decorations */}
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-2 bg-black/50 backdrop-blur-xl border border-white/10 rounded-full">
              <Heart className="w-3.5 h-3.5 text-white/60 hover:text-red-500 transition-colors" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function BarberCard({ barber }: { barber: BarberProfile }) {
  const targetHref = barber.shopId ? `/app/shops/${barber.shopId}` : "/app/shops";
  
  return (
    <Link href={targetHref}>
      <Card className="group p-4 hover:bg-white/[0.02] border-white/5 hover:border-orange-500/20 transition-all cursor-pointer rounded-[1.5rem]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-2xl font-black text-black">
              {barber.user.firstName?.[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 border-[3px] border-[#121212] w-5 h-5 rounded-full" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <h4 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors">
                {barber.user.firstName} {barber.user.lastName}
              </h4>
              <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                <Star className="w-3 h-3 text-orange-500 fill-current" />
                <span className="text-[10px] font-black text-orange-500">{barber.averageRating}</span>
              </div>
            </div>
            
            <p className="text-white/40 text-[11px] line-clamp-1 mb-2 leading-relaxed">
              {barber.bio || "Specialist in modern fades and beard sculpting."}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[9px] text-white/30 uppercase font-black tracking-widest">
                <ShieldCheck className="w-3 h-3 text-blue-500" />
                Verified
              </div>
              <div className="flex items-center gap-1 text-[9px] text-white/30 uppercase font-black tracking-widest">
                <Clock className="w-3 h-3 text-emerald-500" />
                Available
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
