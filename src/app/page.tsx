"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Sparkles, ArrowRight } from "lucide-react";

function TrimLinkAmbient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-orange-600/20 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[50vw] h-[50vw] bg-amber-500/15 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] bg-orange-400/10 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '6s' }} />
    </div>
  );
}

function GlowLinkAmbient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#D4864A]/10 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[50vw] h-[50vw] bg-[#F5B07B]/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[40%] left-[10%] w-[30vw] h-[30vw] bg-[#FFFFFF]/30 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '6s' }} />
    </div>
  );
}

function StatBadge({ value, label, delay = 0, className = "", colorTheme = "light" }: { value: string; label: string; delay?: number; className?: string; colorTheme?: "light" | "dark" }) {
  const isDark = colorTheme === "dark";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`rounded-2xl px-4 py-3 text-center animate-float ${className}`}
      style={{ 
        animationDelay: `${delay}s`, 
        background: isDark ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.1)", 
        border: isDark ? "1px solid rgba(212,134,74,0.15)" : "1px solid rgba(255,255,255,0.2)",
        backdropFilter: "blur(12px)"
      }}
    >
      <p className="text-2xl font-bold font-editorial" style={{ color: isDark ? "#D4864A" : "white" }}>{value}</p>
      <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: isDark ? "#B5A090" : "rgba(255,255,255,0.5)" }}>{label}</p>
    </motion.div>
  );
}

export default function GatewayPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<"men" | "women" | null>(null);
  const [leaving, setLeaving] = useState<"men" | "women" | null>(null);

  const handleNavigate = (target: "men" | "women") => {
    setLeaving(target);
    // Prefetch the target route immediately
    router.prefetch(target === "men" ? "/trim" : "/glow/discover");
    setTimeout(() => {
      if (target === "men") router.push("/trim");
      else router.push("/glow/discover");
    }, 500);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col p-4 md:p-12 lg:justify-center lg:items-center font-sans bg-[#544448] overflow-y-auto overflow-x-hidden">
      {/* ════════════ ARCHITECTURAL ROOM BACKGROUND ════════════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Wall Paneling Grid */}
        <div className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.3) 3px, transparent 3px),
              linear-gradient(to bottom, rgba(0,0,0,0.3) 3px, transparent 3px)
            `,
            backgroundSize: '250px 200px'
          }}
        />
        {/* Warm Lamp Glow on the Right */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[1000px] bg-[#ffb685] mix-blend-screen opacity-[0.6] filter blur-[150px] rounded-full" />
        <div className="absolute top-[30%] right-[-5%] w-[500px] h-[500px] bg-[#ffe4a0] mix-blend-screen opacity-[0.5] filter blur-[120px] rounded-full" />
        
        {/* Subtle cool shadow/light on the left */}
        <div className="absolute bottom-0 left-[-10%] w-[600px] h-[600px] bg-[#688fb5] mix-blend-screen opacity-30 filter blur-[150px] rounded-full" />
      </div>

      {/* ════════════ MAIN SPLIT CARDS ════════════ */}
      <div className="w-full max-w-[1600px] relative z-10 min-h-screen lg:min-h-[850px] flex flex-col lg:flex-row gap-6 lg:gap-12 py-4 lg:p-4">
        {/* LEFT: TrimLink (Men) */}
        <motion.div
          className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-16 min-h-[600px] lg:min-h-0 cursor-pointer overflow-hidden rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10"
          style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0800 100%)" }}
          animate={{ flex: hovered === "men" ? 1.4 : hovered === "women" ? 0.6 : 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setHovered("men")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleNavigate("men")}
        >
          <TrimLinkAmbient />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('/images/barber-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

          <motion.div className="relative z-10 flex flex-col items-center text-center" animate={{ scale: hovered === "men" ? 1.05 : 1 }} transition={{ duration: 0.4 }}>
            <motion.div className="mb-6 h-20 w-20 rounded-3xl bg-orange-500 flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.5)]"
              animate={{ rotate: hovered === "men" ? [0, -5, 5, 0] : 0 }} transition={{ duration: 0.5 }}>
              <Scissors className="h-10 w-10 text-black" />
            </motion.div>
            <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
              Trim<span className="text-orange-500">Link</span>
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.5em] text-white/30 font-bold">Premium Men's Grooming</p>
            <p className="mt-6 max-w-xs text-white/60 text-sm leading-relaxed">
              Book your barber, join the queue, discover the freshest cuts in your city.
            </p>
            <motion.button onClick={(e) => { e.stopPropagation(); handleNavigate("men"); }}
              className="mt-8 flex items-center gap-2 px-8 py-4 rounded-full bg-orange-500 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Enter TrimLink <ArrowRight className="h-4 w-4" />
            </motion.button>
            <div className="mt-10 flex gap-4">
              <StatBadge value="1,200+" label="Barbers" delay={0.2} />
              <StatBadge value="4.9★" label="Rating" delay={0.35} />
            </div>
          </motion.div>
        </motion.div>

        {/* CENTER LOGO (Desktop) */}
        <div className="hidden lg:flex absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 items-center justify-center pointer-events-none">
          <motion.div className="flex flex-col items-center gap-3" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}>
            <div className="glass-strong rounded-full px-6 py-3 shadow-2xl">
              <span className="text-sm font-black text-white/90 tracking-[0.3em] uppercase">BeauLink</span>
            </div>
          </motion.div>
        </div>

        {/* RIGHT: GlowLink (Women) */}
        <motion.div
          className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-16 min-h-[600px] lg:min-h-0 cursor-pointer overflow-hidden rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-[#E8DDD2]"
          style={{ background: "#FDF6F0" }}
          animate={{ flex: hovered === "women" ? 1.4 : hovered === "men" ? 0.6 : 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setHovered("women")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleNavigate("women")}
        >
          <GlowLinkAmbient />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/salon-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", filter: "grayscale(100%) sepia(20%)" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDF6F0]/80 via-transparent to-[#FDF6F0]/90" />

          <motion.div className="relative z-10 flex flex-col items-center text-center" animate={{ scale: hovered === "women" ? 1.05 : 1 }} transition={{ duration: 0.4 }}>
            <motion.div className="mb-6 h-20 w-20 rounded-full flex items-center justify-center"
              style={{ background: "#D4864A", boxShadow: "0 8px 32px rgba(212,134,74,0.3)" }}
              animate={{ rotate: hovered === "women" ? [0, 5, -5, 0] : 0 }} transition={{ duration: 0.5 }}>
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2C2416" }}>
              Glow<span style={{ fontStyle: "italic", color: "#D4864A" }}>Link</span>
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.5em] font-bold" style={{ color: "#B5A090" }}>Premium Women's Beauty</p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed" style={{ color: "#7A6350" }}>
              Discover luxury salons, book your favorite stylist, and glow with confidence.
            </p>
            <motion.button onClick={(e) => { e.stopPropagation(); handleNavigate("women"); }}
              className="mt-8 flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all"
              style={{ background: "#2C2416", color: "#FDF6F0", boxShadow: "0 8px 24px rgba(44,36,22,0.2)" }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Enter GlowLink <ArrowRight className="h-4 w-4" />
            </motion.button>
            <div className="mt-10 flex gap-4">
              <StatBadge value="800+" label="Salons" delay={0.2} colorTheme="dark" />
              <StatBadge value="5.0★" label="Rating" delay={0.35} colorTheme="dark" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* MOBILE BRAND HEADER */}
      <div className="lg:hidden flex justify-center py-6 bg-black/30 backdrop-blur-xl border-t border-white/10">
        <div className="glass rounded-full px-6 py-2">
          <span className="text-xs font-black text-white/70 tracking-[0.4em] uppercase">BeauLink Ecosystem</span>
        </div>
      </div>

      {/* FULL-PAGE TRANSITION OVERLAY */}
      <AnimatePresence>
        {leaving && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: leaving === "men" ? "linear-gradient(135deg, #0a0a0a, #1a0800)" : "#FDF6F0" }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="flex flex-col items-center gap-4">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${leaving === "men" ? "bg-orange-500" : ""}`}
                style={leaving === "women" ? { background: "#D4864A", borderRadius: "50%", boxShadow: "0 8px 32px rgba(212,134,74,0.3)" } : {}}>
                {leaving === "men" ? <Scissors className="h-8 w-8 text-black" /> : <Sparkles className="h-8 w-8 text-white" />}
              </div>
              <p className="text-sm font-medium tracking-wider" style={leaving === "women" ? { color: "#2C2416" } : { color: "rgba(255,255,255,0.7)" }}>
                {leaving === "men" ? "Entering TrimLink…" : "Entering GlowLink…"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
