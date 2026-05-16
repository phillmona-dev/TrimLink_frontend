"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlowAuthStore } from "@/lib/glow-auth-store";
import {
  Search, MapPin, Star, Heart, Sparkles, ChevronRight,
  Scissors, Paintbrush, Hand, Eye, Flower2, Crown,
  ArrowRight, Bell, User, Menu, X, ShoppingBag, Zap, TrendingUp
} from "lucide-react";
import { glowShopApi, ShopSearchResponse } from "@/lib/glow-api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StyleCard { name: string; tag: string; image: string; color: string; accent: string; }

// ─── Category config with unique per-pill colors ──────────────────────────────
const categories = [
  { icon: <Scissors className="h-4 w-4" />, label: "Hair Salon",    pillClass: "glow-pill-hair",     emoji: "✂️" },
  { icon: <Paintbrush className="h-4 w-4" />, label: "Makeup",      pillClass: "glow-pill-makeup",   emoji: "💄" },
  { icon: <Hand className="h-4 w-4" />,      label: "Nails",        pillClass: "glow-pill-nails",    emoji: "💅" },
  { icon: <Flower2 className="h-4 w-4" />,   label: "Spa & Wellness", pillClass: "glow-pill-spa",    emoji: "🌸" },
  { icon: <Eye className="h-4 w-4" />,       label: "Lash & Brow",  pillClass: "glow-pill-lash",     emoji: "👁" },
  { icon: <Crown className="h-4 w-4" />,     label: "Bridal",       pillClass: "glow-pill-bridal",   emoji: "👑" },
  { icon: <Sparkles className="h-4 w-4" />,  label: "Skincare",     pillClass: "glow-pill-skincare", emoji: "✨" },
];

const trendingStyles: StyleCard[] = [
  { name: "Soft Glam",      tag: "Makeup",   image: "/images/beauty/trending_soft_glam.png", color: "#E879F9", accent: "rgba(232,121,249,0.3)" },
  { name: "Silk Press",     tag: "Hair",     image: "/images/beauty/trending_hair.png",      color: "#C8956C", accent: "rgba(200,149,108,0.3)" },
  { name: "Ombré Nails",    tag: "Nails",    image: "/images/beauty/trending_nails.png",     color: "#F43F5E", accent: "rgba(244,63,94,0.3)"   },
  { name: "Glass Skin",     tag: "Skincare", image: "/images/beauty/trending_spa.png",       color: "#F9A8D4", accent: "rgba(249,168,212,0.3)" },
  { name: "Lash Lift",      tag: "Lash",     image: "/images/beauty/trending_makeup.png",    color: "#818CF8", accent: "rgba(129,140,248,0.3)" },
  { name: "Habesha Bridal", tag: "Bridal",   image: "/images/beauty/trending_salon.png",     color: "#FFD700", accent: "rgba(255,215,0,0.3)"   },
];

const heroStats = [
  { value: "800+", label: "Verified Salons", icon: <Sparkles className="h-4 w-4" /> },
  { value: "50K+", label: "Happy Clients",   icon: <Heart className="h-4 w-4" /> },
  { value: "4.9★", label: "Avg Rating",      icon: <Star className="h-4 w-4" /> },
  { value: "15+",  label: "Cities",          icon: <MapPin className="h-4 w-4" /> },
];

// ─── Salon Card ───────────────────────────────────────────────────────────────
function SalonCard({ salon, index }: { salon: ShopSearchResponse; index: number }) {
  const [liked, setLiked] = useState(false);

  const cardGradients = [
    { from: "#C8956C", to: "#8B3A62", mid: "rgba(200,149,108,0.15)" },
    { from: "#E879F9", to: "#7C3AED", mid: "rgba(232,121,249,0.15)" },
    { from: "#F43F5E", to: "#9D174D", mid: "rgba(244,63,94,0.15)" },
    { from: "#7CB99A", to: "#065F46", mid: "rgba(124,185,154,0.15)" },
  ];
  const g = cardGradients[index % cardGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="glow-card rounded-3xl overflow-hidden group cursor-pointer"
    >
      {/* Image area */}
      <div className="relative h-48 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${g.from}22, ${g.to}44)` }}>
        {/* Decorative inner glow */}
        <div className="absolute inset-0 opacity-60"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${g.from}44, transparent 70%)` }} />
        {/* Shimmer line */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${g.from}, transparent)` }} />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-3xl flex items-center justify-center"
            style={{ background: g.mid, border: `1px solid ${g.from}44`, backdropFilter: "blur(10px)" }}>
            <Sparkles className="h-9 w-9" style={{ color: g.from }} />
          </div>
        </div>
        {/* Like button */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center transition-all"
          style={{ background: "rgba(26,15,30,0.7)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}
        >
          <Heart className={`h-4 w-4 transition-all ${liked ? "fill-rose-400 text-rose-400 scale-110" : "text-white/50"}`} />
        </button>
        {/* Category badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
          style={{ background: `${g.from}33`, border: `1px solid ${g.from}55`, color: g.from, backdropFilter: "blur(10px)" }}>
          Premium
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-black text-base text-white font-editorial leading-tight line-clamp-1 mb-1">{salon.name}</h3>
        <p className="text-xs font-semibold mb-3 line-clamp-1" style={{ color: g.from }}>{salon.description || "Premium Beauty Salon"}</p>

        <div className="flex items-center gap-1 text-xs mb-4" style={{ color: "rgba(253,246,238,0.4)" }}>
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{salon.address}, {salon.city}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-white text-xs font-bold ml-1">5.0</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(124,185,154,0.15)", color: "#7CB99A", border: "1px solid rgba(124,185,154,0.2)" }}>
            Open Now
          </span>
        </div>

        <Link href={`/glow/salons/${salon.id}`}
          className="w-full py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-center block transition-all"
          style={{
            background: `linear-gradient(135deg, ${g.from}22, ${g.to}22)`,
            border: `1px solid ${g.from}44`,
            color: g.from,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = `linear-gradient(135deg, ${g.from}, ${g.to})`;
            (e.currentTarget as HTMLAnchorElement).style.color = "#1A0F1E";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 24px ${g.from}66`;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = `linear-gradient(135deg, ${g.from}22, ${g.to}22)`;
            (e.currentTarget as HTMLAnchorElement).style.color = g.from;
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
          }}
        >
          Book Now →
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SalonSkeleton() {
  return (
    <div className="glow-card rounded-3xl overflow-hidden animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-white/5 rounded-full w-3/4" />
        <div className="h-3 bg-white/5 rounded-full w-1/2" />
        <div className="h-3 bg-white/5 rounded-full w-2/3" />
        <div className="h-9 bg-white/5 rounded-2xl mt-4" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiscoverPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useGlowAuthStore();
  const [query, setQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Hair Salon");
  const [shops, setShops] = useState<ShopSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    glowShopApi.searchShops().then(res => setShops(res.content || [])).finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = async (label: string) => {
    setActiveCategory(label);
    setLoading(true);
    try {
      const res = await glowShopApi.searchShops(label);
      setShops(res.content || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await glowShopApi.searchShops(query);
      setShops(res.content || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full"
        style={{ background: "rgba(20,10,25,0.75)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(200,149,108,0.1)" }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-y-3 gap-x-4">

          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative h-10 w-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: "0 0 20px rgba(200,149,108,0.5)" }}>
              <Sparkles className="h-5 w-5 text-white" />
              <div className="absolute -inset-[1px] rounded-2xl animate-glow-pulse-strong pointer-events-none"
                style={{ background: "transparent", boxShadow: "0 0 20px rgba(200,149,108,0.4)" }} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none font-editorial">
                <span className="gradient-text">Glow</span><span className="text-white">Link</span>
              </h1>
              <p className="hidden md:block text-[9px] uppercase tracking-[0.35em] font-bold mt-0.5" style={{ color: "rgba(200,149,108,0.45)" }}>
                Premium Beauty
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="order-3 md:order-2 w-full md:flex-1 md:max-w-2xl md:mx-6">
            <form onSubmit={handleSearch}
              className="flex items-center gap-2 w-full rounded-2xl p-1 transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)" }}
              onFocus={e => (e.currentTarget.style.border = "1px solid rgba(200,149,108,0.45)")}
              onBlur={e => (e.currentTarget.style.border = "1px solid rgba(200,149,108,0.15)")}>
              <div className="pl-3"><Search className="h-4 w-4" style={{ color: "rgba(200,149,108,0.5)" }} /></div>
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search salons, stylists, services..."
                className="flex-1 min-w-0 h-9 bg-transparent px-2 text-white/90 text-sm focus:outline-none placeholder:text-white/20" />
              <button type="submit"
                className="shrink-0 rounded-xl h-9 px-5 text-xs font-black uppercase tracking-wider text-[#1A0F1E] shimmer-btn transition-transform active:scale-95">
                Search
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 order-2 ml-auto md:ml-0">
            <Link href="/glow/shop"
              className="hidden md:flex items-center gap-1.5 px-4 h-9 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.65)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,149,108,0.4)"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,149,108,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(253,246,238,0.65)"; }}>
              <ShoppingBag className="h-3.5 w-3.5" /> Shop
            </Link>
            <Link href="/glow/notifications"
              className="hidden md:flex p-2.5 rounded-xl relative transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.6)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,149,108,0.4)"; (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,149,108,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(253,246,238,0.6)"; }}>
              <Bell size={15} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-400" />
            </Link>
            <div className="hidden md:block w-px h-5 bg-white/10 mx-1" />
            {isAuthenticated ? (
              <Link href="/glow/dashboard"
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-black uppercase tracking-wider text-[#1A0F1E] shimmer-btn transition-all">
                <User size={13} /> {user?.firstName || "Dashboard"}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/glow/auth/login"
                  className="px-4 h-9 flex items-center rounded-xl text-xs font-bold transition-all"
                  style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.2)", color: "rgba(253,246,238,0.75)" }}>
                  Login
                </Link>
                <Link href="/glow/auth/register"
                  className="px-4 h-9 flex items-center rounded-xl text-xs font-black text-[#1A0F1E] shimmer-btn"
                  style={{ boxShadow: "0 0 20px rgba(200,149,108,0.35)" }}>
                  Join Free
                </Link>
              </div>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-white/80 transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)" }}>
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-24 md:pb-12 flex flex-col gap-20">

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section className="relative pt-16 md:pt-24 pb-8 text-center">
          {/* Ambient glow blobs behind hero text */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(200,149,108,0.15), transparent 70%)" }} />

          {/* Floating badges */}
          <div className="hidden lg:block absolute top-12 left-[8%] animate-float-badge">
            <div className="px-4 py-2 rounded-2xl text-xs font-black"
              style={{ background: "rgba(232,121,249,0.12)", border: "1px solid rgba(232,121,249,0.25)", color: "#E879F9", backdropFilter: "blur(12px)" }}>
              💄 Makeup Artists
            </div>
          </div>
          <div className="hidden lg:block absolute top-20 right-[8%] animate-float-badge2">
            <div className="px-4 py-2 rounded-2xl text-xs font-black"
              style={{ background: "rgba(200,149,108,0.12)", border: "1px solid rgba(200,149,108,0.25)", color: "#C8956C", backdropFilter: "blur(12px)" }}>
              ✂️ Top Stylists
            </div>
          </div>
          <div className="hidden lg:block absolute bottom-4 left-[12%] animate-float-badge">
            <div className="px-4 py-2 rounded-2xl text-xs font-black"
              style={{ background: "rgba(124,185,154,0.12)", border: "1px solid rgba(124,185,154,0.25)", color: "#7CB99A", backdropFilter: "blur(12px)", animationDelay: "2s" }}>
              🌸 Spa & Wellness
            </div>
          </div>

          {/* Label */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-[11px] font-black uppercase tracking-[0.35em]"
            style={{ background: "rgba(200,149,108,0.1)", border: "1px solid rgba(200,149,108,0.25)", color: "#C8956C" }}>
            <Zap className="h-3 w-3" /> Ethiopia's #1 Beauty Platform
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black font-editorial leading-[0.92] tracking-tight">
            <span className="text-white">You Deserve</span>
            <br />
            <span className="gradient-text italic" style={{ textShadow: "0 0 80px rgba(200,149,108,0.4)" }}>
              to Glow
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-6 text-base md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(253,246,238,0.5)" }}>
            Discover top salons, book in seconds, shop premium beauty products — all tailored for you.
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => document.getElementById("featured-salons")?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E] shimmer-btn transition-transform active:scale-95"
              style={{ boxShadow: "0 0 50px rgba(200,149,108,0.45), 0 8px 32px rgba(0,0,0,0.4)" }}>
              Explore Salons
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link href="/glow/auth/register?role=salon"
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white/80 hover:text-white transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.25)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,149,108,0.6)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(200,149,108,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200,149,108,0.25)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(253,246,238,0.05)"; }}>
              List Your Salon
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {heroStats.map((s, i) => (
              <div key={i} className="glow-stat-card rounded-2xl px-4 py-4 text-center">
                <div className="flex justify-center mb-2" style={{ color: "#C8956C" }}>{s.icon}</div>
                <p className="text-2xl font-black font-editorial gradient-text">{s.value}</p>
                <p className="text-[9px] uppercase tracking-widest mt-1" style={{ color: "rgba(253,246,238,0.35)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── CATEGORIES ──────────────────────────────────────────────── */}
        <section>
          <div className="glow-section-label mb-6">Browse by Service</div>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.label}
                onClick={() => handleCategoryClick(cat.label)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`${cat.pillClass} flex items-center gap-2.5 shrink-0 px-5 py-3 rounded-2xl text-sm font-black tracking-wide transition-all duration-300 ${
                  activeCategory === cat.label ? "glow-pill-active" : "glow-pill-idle"
                }`}
              >
                <span className="text-base">{cat.emoji}</span>
                {cat.label}
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── TRENDING ────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" style={{ color: "#C8956C" }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "rgba(200,149,108,0.6)" }}>
                  Style Showcase
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-editorial text-white">Trending Now</h2>
            </div>
            <Link href="/glow/search"
              className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider transition-all"
              style={{ color: "rgba(200,149,108,0.7)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#C8956C"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(200,149,108,0.7)"; }}>
              See All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative w-full overflow-hidden mask-edges">
            <motion.div
              className="flex gap-4 min-w-max pb-2"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
            >
              {[...trendingStyles, ...trendingStyles].map((style, i) => (
                <div key={i} className="relative rounded-3xl overflow-hidden cursor-pointer group w-52 h-72 shrink-0 transition-transform duration-300 hover:scale-[0.97]">
                  <img src={style.image} alt={style.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F1E] via-[#1A0F1E]/30 to-transparent" />
                  {/* Accent shimmer top */}
                  <div className="absolute top-0 inset-x-0 h-px opacity-60 transition-opacity group-hover:opacity-100"
                    style={{ background: `linear-gradient(90deg, transparent, ${style.color}, transparent)` }} />
                  {/* Tag pill */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: `${style.accent}`, border: `1px solid ${style.color}44`, color: style.color, backdropFilter: "blur(8px)" }}>
                    {style.tag}
                  </div>
                  {/* Bottom content */}
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <p className="text-base font-black text-white tracking-wide leading-tight">{style.name}</p>
                    <div className="mt-2 h-0.5 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-all group-hover:w-16"
                      style={{ background: style.color }} />
                  </div>
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `inset 0 0 0 1.5px ${style.color}55` }} />
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FEATURED SALONS ─────────────────────────────────────────── */}
        <section id="featured-salons">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: "rgba(200,149,108,0.6)" }}>
                  Top Picks
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-editorial text-white">Featured Salons</h2>
            </div>
            <Link href="/glow/search"
              className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider"
              style={{ color: "rgba(200,149,108,0.7)" }}>
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0,1,2,3].map(i => <SalonSkeleton key={i} />)}
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-20 rounded-3xl"
              style={{ background: "rgba(253,246,238,0.02)", border: "1px solid rgba(200,149,108,0.1)" }}>
              <Sparkles className="h-12 w-12 mx-auto mb-3 text-white/10" />
              <p className="text-sm text-white/40">No salons found. Try a different filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {shops.map((s, i) => <SalonCard key={s.id} salon={s} index={i} />)}
            </div>
          )}
        </section>

        {/* ── CTA BANNER ──────────────────────────────────────────────── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
          >
            {/* Background layers */}
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, rgba(200,149,108,0.12) 0%, rgba(180,80,160,0.1) 50%, rgba(120,60,200,0.12) 100%)" }} />
            <div className="absolute inset-0"
              style={{ background: "radial-gradient(ellipse at 50% -20%, rgba(200,149,108,0.25), transparent 60%)" }} />
            {/* Top shimmer line */}
            <div className="absolute top-0 inset-x-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,149,108,0.6), rgba(232,121,249,0.4), rgba(200,149,108,0.6), transparent)" }} />
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-32 h-32 opacity-30"
              style={{ background: "radial-gradient(circle at 0% 0%, rgba(200,149,108,0.4), transparent 60%)" }} />
            <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30"
              style={{ background: "radial-gradient(circle at 100% 100%, rgba(232,121,249,0.4), transparent 60%)" }} />

            <div className="relative z-10">
              {/* Icon */}
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl mb-6 mx-auto"
                style={{ background: "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: "0 0 40px rgba(200,149,108,0.5)" }}>
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-5xl font-black font-editorial text-white mb-4 leading-tight">
                Own a Beauty Business?
              </h2>
              <p className="text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed" style={{ color: "rgba(253,246,238,0.55)" }}>
                Join 800+ salons on GlowLink. Grow your client base with smart booking, analytics, and loyalty tools.
              </p>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link href="/glow/auth/register?role=salon"
                  className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E] shimmer-btn transition-transform active:scale-95"
                  style={{ boxShadow: "0 0 50px rgba(200,149,108,0.5)" }}>
                  Register Your Salon <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/glow/discover"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm text-white/70 hover:text-white transition-all"
                  style={{ background: "rgba(253,246,238,0.06)", border: "1px solid rgba(200,149,108,0.2)" }}>
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 mt-4 py-10 px-8 text-center"
        style={{ borderTop: "1px solid rgba(200,149,108,0.08)" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)" }}>
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="font-black font-editorial text-sm gradient-text">GlowLink</span>
        </div>
        <p className="text-xs" style={{ color: "rgba(253,246,238,0.2)" }}>
          © 2026 GlowLink · Part of the <span style={{ color: "rgba(200,149,108,0.5)" }}>BeauLink Ecosystem</span>
        </p>
      </footer>

      {/* ── MOBILE NAV ──────────────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-around items-center py-2 safe-area-bottom"
        style={{ background: "rgba(15,8,20,0.97)", backdropFilter: "blur(24px)", borderTop: "1px solid rgba(200,149,108,0.12)" }}>
        {[
          { icon: <Sparkles size={19} />, label: "Discover", href: "/glow/discover", active: true },
          { icon: <Search size={19} />,   label: "Search",   href: "/glow/search" },
          { icon: <ShoppingBag size={19} />, label: "Shop",  href: "/glow/shop" },
          { icon: <User size={19} />,     label: "Profile",  href: isAuthenticated ? "/glow/dashboard" : "/glow/auth/login" },
        ].map((item, i) => (
          <Link key={i} href={item.href}
            className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all"
            style={{ color: item.active ? "#C8956C" : "rgba(253,246,238,0.3)" }}>
            {item.icon}
            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
            {item.active && (
              <div className="h-0.5 w-4 rounded-full" style={{ background: "#C8956C" }} />
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}
