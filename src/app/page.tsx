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
      <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-rose-500/20 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-[-10%] left-[-15%] w-[50vw] h-[50vw] bg-purple-600/15 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[40%] left-[10%] w-[30vw] h-[30vw] bg-pink-400/10 rounded-full blur-[80px] animate-blob" style={{ animationDelay: '6s' }} />
    </div>
  );
}

function StatBadge({ value, label, delay = 0, className = "" }: { value: string; label: string; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`glass rounded-2xl px-4 py-3 text-center animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <p className="text-2xl font-bold text-white font-editorial">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-white/50 mt-0.5">{label}</p>
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
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT: TrimLink (Men) */}
        <motion.div
          className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-16 cursor-pointer overflow-hidden"
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
          <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </motion.div>

        {/* CENTER LOGO (Desktop) */}
        <div className="hidden lg:flex absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 items-center justify-center pointer-events-none">
          <motion.div className="flex flex-col items-center gap-3" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}>
            <div className="glass-strong rounded-full px-6 py-3 shadow-2xl">
              <span className="text-sm font-black text-white/90 tracking-[0.3em] uppercase">BeauLink</span>
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-white/20 to-transparent" />
          </motion.div>
        </div>

        {/* RIGHT: GlowLink (Women) */}
        <motion.div
          className="relative flex-1 flex flex-col items-center justify-center p-8 lg:p-16 cursor-pointer overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1A0F1E 0%, #2d0f2a 100%)" }}
          animate={{ flex: hovered === "women" ? 1.4 : hovered === "men" ? 0.6 : 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          onMouseEnter={() => setHovered("women")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleNavigate("women")}
        >
          <GlowLinkAmbient />
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url('/images/salon-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A0F1E]/50 via-transparent to-[#1A0F1E]/70" />

          <motion.div className="relative z-10 flex flex-col items-center text-center" animate={{ scale: hovered === "women" ? 1.05 : 1 }} transition={{ duration: 0.4 }}>
            <motion.div className="mb-6 h-20 w-20 rounded-3xl flex items-center justify-center animate-pulse-glow"
              style={{ background: "linear-gradient(135deg, #C8956C, #E8B4A0)" }}
              animate={{ rotate: hovered === "women" ? [0, 5, -5, 0] : 0 }} transition={{ duration: 0.5 }}>
              <Sparkles className="h-10 w-10 text-white" />
            </motion.div>
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none font-editorial">
              <span className="gradient-text">Glow</span><span className="text-white">Link</span>
            </h2>
            <p className="mt-2 text-xs uppercase tracking-[0.5em] font-bold" style={{ color: "rgba(200,149,108,0.6)" }}>Premium Women's Beauty</p>
            <p className="mt-6 max-w-xs text-sm leading-relaxed" style={{ color: "rgba(253,246,238,0.6)" }}>
              Discover luxury salons, book your favorite stylist, and glow with confidence.
            </p>
            <motion.button onClick={(e) => { e.stopPropagation(); handleNavigate("women"); }}
              className="mt-8 flex items-center gap-2 px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider shimmer-btn text-[#1A0F1E] transition-all"
              style={{ boxShadow: "0 0 30px rgba(200,149,108,0.4)" }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Enter GlowLink <ArrowRight className="h-4 w-4" />
            </motion.button>
            <div className="mt-10 flex gap-4">
              <StatBadge value="800+" label="Salons" delay={0.2} />
              <StatBadge value="5.0★" label="Rating" delay={0.35} />
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
            style={{ background: leaving === "men" ? "linear-gradient(135deg, #0a0a0a, #1a0800)" : "linear-gradient(135deg, #1A0F1E, #2d0f2a)" }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="flex flex-col items-center gap-4">
              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${leaving === "men" ? "bg-orange-500" : ""}`}
                style={leaving === "women" ? { background: "linear-gradient(135deg, #C8956C, #E8B4A0)" } : {}}>
                {leaving === "men" ? <Scissors className="h-8 w-8 text-black" /> : <Sparkles className="h-8 w-8 text-white" />}
              </div>
              <p className="text-white/70 text-sm font-medium tracking-wider">
                {leaving === "men" ? "Entering TrimLink…" : "Entering GlowLink…"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
