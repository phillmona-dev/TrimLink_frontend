"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { GlowAIStyleAdvisor } from "@/components/common/glow-ai-style-advisor";

/* ─── Brand colors ─────────────────────────────────────────── */
const ACCENT      = "#D4864A";
const ACCENT_SOFT = "#F5B07B";
const TEXT_MAIN   = "#5C3D2E";
const TEXT_MUTED  = "#B5A090";

/* ─── Style catalogue ──────────────────────────────────────── */
const GLOW_STYLES = [
  // ── Habesha Women Hair ──
  { id:"gw_h1", name:"Habesha Box Braids", category:"Braids", imageUrl:"/glow/braiding.png", tags:["Braids","Protective","Habesha"], description:"Long classic box braids parted into clean sections — a timeless Habesha protective style that suits all face shapes." },
  { id:"gw_h2", name:"Ethiopian Natural Crown", category:"Natural", imageUrl:"/glow/hero.png", tags:["Natural","Afro","Crown","Habesha"], description:"A gorgeous natural afro crown celebrating authentic Ethiopian hair texture. Best for oval and round faces." },
  { id:"gw_h3", name:"Habesha Goddess Braids", category:"Braids", imageUrl:"https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Goddess","Braids","Habesha"], description:"Thick goddess braids styled upward into a regal crown. Complements heart and diamond face shapes." },
  { id:"gw_h4", name:"Ethiopian Twist Out", category:"Natural", imageUrl:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Twists","Natural","Volume"], description:"Two-strand twists styled out into defined coil spirals with full body and volume. Versatile for all ages." },
  { id:"gw_h5", name:"Habesha Cornrow Updo", category:"Braids", imageUrl:"https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Cornrows","Updo","Elegant","Habesha"], description:"Intricately cornrowed sides leading into a voluminous natural updo at the crown. Perfect for special occasions." },
  { id:"gw_h6", name:"Addis Loc Styles", category:"Natural", imageUrl:"https://images.unsplash.com/photo-1596215143952-0d893a3f3853?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Locs","Dreadlocks","Ethiopian"], description:"Beautifully maintained starter or mature locs styled elegantly. Suits all face shapes and age groups." },
  { id:"gw_h7", name:"Habesha Crochet Braids", category:"Braids", imageUrl:"https://images.unsplash.com/photo-1590330297626-d7aff25a0431?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Crochet","Braids","Protective"], description:"Volume crochet braids in soft curls installed over cornrows. Low maintenance and ideal for busy women." },
  { id:"gw_h8", name:"Ethiopian Senegalese Twist", category:"Braids", imageUrl:"https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Senegalese","Twists","Elegant"], description:"Sleek, rope-like Senegalese twists flowing to the shoulders. Sophisticated and great for formal settings." },
  { id:"gw_h9", name:"Habesha Side-Swept Braids", category:"Braids", imageUrl:"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Side","Braids","Romantic"], description:"Romantic braids swept to one side with loose waves at the ends. Ideal for heart and oval face shapes." },
  { id:"gw_h10", name:"Ethiopian Elder Grace Wrap", category:"Classic", imageUrl:"https://images.unsplash.com/photo-1559582798-678dfc71ccd8?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Wrap","Classic","Mature","Elegant"], description:"A dignified head wrap style with natural grey locs or hair — celebrating the beauty of mature Habesha women." },

  // ── Nails ──
  { id:"gw_n1", name:"Ethiopian Gold Nail Art", category:"Nails", imageUrl:"/glow/nails.png", tags:["Nails","Gold","Art"], description:"Intricate gold-tone nail art with geometric Ethiopian-inspired patterns. Elegant and culturally rich." },
  { id:"gw_n2", name:"Natural French Manicure", category:"Nails", imageUrl:"https://images.unsplash.com/photo-1604654894618-3a1e5c9e2e74?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Nails","French","Classic"], description:"The timeless French manicure — clean white tips over a soft blush base for an understated elegance." },
  { id:"gw_n3", name:"Gradient Ombré Nails", category:"Nails", imageUrl:"https://images.unsplash.com/photo-1604654894576-d5b36e1e6540?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Nails","Ombre","Gradient","Modern"], description:"Smooth pink-to-nude gradient ombré. A modern and trendy finish that works for all occasions." },

  // ── Makeup ──
  { id:"gw_mk1", name:"Habesha Glam Look", category:"Makeup", imageUrl:"/glow/makeup.png", tags:["Makeup","Glam","Smoky"], description:"Full glam makeup with dramatic smoky eyes, winged liner, and a nude lip. Ideal for events and celebrations." },
  { id:"gw_mk2", name:"Natural Glow Skin", category:"Makeup", imageUrl:"/glow/spa.png", tags:["Makeup","Natural","Glow","Skin"], description:"Dewy skin-first makeup that enhances natural beauty with a luminous finish. Perfect for everyday wear." },
  { id:"gw_mk3", name:"Bold Ethiopian Eye", category:"Makeup", imageUrl:"https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Makeup","Bold","Eyes","Dramatic"], description:"Rich golden and deep brown eyeshadow palette paired with bold liner — inspired by traditional Ethiopian artistry." },

  // ── Skincare / Spa ──
  { id:"gw_sp1", name:"Ethiopian Honey Facial", category:"Skincare", imageUrl:"/glow/med_hero_main.png", tags:["Skincare","Facial","Honey","Treatment"], description:"A traditional Ethiopian honey and herb facial mask treatment for deeply nourished and radiant skin." },
  { id:"gw_sp2", name:"Full Body Glow Treatment", category:"Skincare", imageUrl:"https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=1000&auto=format&fit=crop&q=90", tags:["Spa","Body","Glow","Treatment"], description:"Full body exfoliation, oil massage, and moisturizing treatment for silky smooth glowing skin from head to toe." },
];

const CATS = ["ALL", "Braids", "Natural", "Nails", "Makeup", "Skincare", "Classic"];
const PHOTOS_PER_SPREAD = 6;
const FLIP_DURATION = 1.8;

export function GlowStylesLibraryPage() {
  const [pg, setPg]           = useState(0);
  const [zoom, setZoom]       = useState<any>(null);
  const [cat, setCat]         = useState("ALL");
  const [toast, setToast]     = useState<string | null>(null);
  const [flipDir, setFlipDir] = useState<"n" | "p">("n");
  const [isFlipping, setIsFlipping] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const list = GLOW_STYLES;
  const filtered = cat === "ALL" ? list : list.filter((s) => s.category === cat);
  const totalSpreads = Math.max(1, Math.ceil(filtered.length / PHOTOS_PER_SPREAD));

  const getSpreadPhotos = (idx: number) => {
    const start = idx * PHOTOS_PER_SPREAD;
    return filtered.slice(start, start + PHOTOS_PER_SPREAD);
  };

  const go = (d: "n" | "p") => {
    if (isFlipping) return;
    if (d === "n" && pg < totalSpreads - 1) {
      setFlipDir("n"); setIsFlipping(true);
      setTimeout(() => { setPg((p) => p + 1); setIsFlipping(false); }, FLIP_DURATION * 1000);
    }
    if (d === "p" && pg > 0) {
      setFlipDir("p"); setIsFlipping(true);
      setTimeout(() => { setPg((p) => p - 1); setIsFlipping(false); }, FLIP_DURATION * 1000);
    }
  };

  const currentPhotos = getSpreadPhotos(pg);
  const nextPhotos    = getSpreadPhotos(pg + 1);
  const prevPhotos    = getSpreadPhotos(pg - 1);

  const leftColCurrent  = [currentPhotos[0], currentPhotos[2], currentPhotos[4]];
  const leftColPrev     = [prevPhotos[0],    prevPhotos[2],    prevPhotos[4]];
  const leftColDisplay  = isFlipping && flipDir === "p" ? leftColPrev : leftColCurrent;

  const rightColCurrent = [currentPhotos[1], currentPhotos[3], currentPhotos[5]];
  const rightColNext    = [nextPhotos[1],    nextPhotos[3],    nextPhotos[5]];
  const rightColDisplay = isFlipping && flipDir === "n" ? rightColNext : rightColCurrent;

  const flipFrontPhotos = flipDir === "n" ? rightColCurrent : leftColCurrent;
  const flipBackPhotos  = flipDir === "n"
    ? [nextPhotos[0], nextPhotos[2], nextPhotos[4]]
    : [prevPhotos[1], prevPhotos[3], prevPhotos[5]];

  /* ─── Photo slot ─── */
  const PhotoSlot = ({ s }: { s: any | undefined }) => {
    if (!s) return <div style={{ flex: 1, background: "#f9f0e8", border: "1px solid rgba(212,134,74,0.08)", borderRadius: 4 }} />;
    return (
      <div
        onClick={() => setZoom(s)}
        className="group relative cursor-pointer overflow-hidden"
        style={{ flex: 1, borderRadius: 4, border: "3px solid rgba(212,134,74,0.25)", boxShadow: "0 2px 10px rgba(140,60,20,0.12)", background: "#f5ede4" }}
      >
        <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" style={{ display: "block" }} />
        {/* Sleeve shine */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)" }} />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end opacity-0 group-hover:opacity-100">
          <div className="p-2.5 w-full text-left">
            <p className="text-white font-black text-xs drop-shadow-xl">{s.name}</p>
            <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: ACCENT_SOFT }}>{s.category}</p>
          </div>
        </div>
      </div>
    );
  };

  /* ─── Page content ─── */
  const PageContent = ({ photos, side, pageNum }: { photos: any[]; side: "L" | "R"; pageNum: number }) => (
    <div className="flex flex-col flex-1 h-full" style={{
      paddingTop: "10px", paddingBottom: "10px",
      paddingLeft: side === "L" ? "10px" : "18px",
      paddingRight: side === "L" ? "18px" : "10px",
      gap: "6px",
      background: "#fdf7f1",
      boxShadow: side === "L" ? "inset -12px 0 24px rgba(140,60,20,0.08)" : "inset 12px 0 24px rgba(140,60,20,0.08)",
      position: "relative",
    }}>
      {photos.map((s, i) => <PhotoSlot key={s?.id || `empty-${side}-${i}`} s={s} />)}
      <div className="text-center text-[8px] font-black tracking-widest uppercase mt-1.5" style={{ color: "rgba(212,134,74,0.25)" }}>
        Page {pageNum}
      </div>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center overflow-hidden" style={{
      minHeight: "calc(100vh - 96px)",
      backgroundImage: "url('/glow/glow_desk_bg.png'), linear-gradient(135deg, #FDF6F0 0%, #F5E6D8 50%, #EDD5C0 100%)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      {/* Soft vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 20%, rgba(140,60,20,0.15) 100%)" }} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-6 right-6 z-[200] px-5 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-2 text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})` }}
          >
            <Sparkles className="w-4 h-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page title */}
      <div className="relative z-20 pt-5 pb-1 text-center">
        <h1 className="text-2xl font-black" style={{ color: TEXT_MAIN, fontFamily: "'Cormorant Garamond', serif" }}>
          Glow 🌸 Styles Library
        </h1>
        <p className="text-xs font-medium mt-1" style={{ color: TEXT_MUTED }}>Browse curated beauty styles — let our AI recommend your perfect match</p>
      </div>

      {/* Category filters + AI button */}
      <div className="relative z-20 flex items-center gap-1.5 pt-3 pb-3 flex-wrap justify-center">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => { if (!isFlipping) { setCat(c); setPg(0); } }}
            className="px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border"
            style={
              cat === c
                ? { background: ACCENT, color: "#fff", borderColor: ACCENT, boxShadow: `0 0 10px ${ACCENT}50` }
                : { background: "rgba(253,247,241,0.7)", color: TEXT_MUTED, borderColor: `${ACCENT}30` }
            }
          >
            {c}
          </button>
        ))}

        {/* AI Advisor button */}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          onClick={() => setAdvisorOpen(true)}
          className="ml-2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT_SOFT}10)`,
            color: ACCENT,
            borderColor: `${ACCENT}40`,
            boxShadow: `0 0 14px ${ACCENT}20`,
          }}
        >
          <Sparkles className="w-3 h-3" />
          AI Beauty Advisor
        </motion.button>
      </div>

      {/* AI Style Advisor Modal */}
      <GlowAIStyleAdvisor
        open={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
        styles={list}
        onStyleSelect={(style) => {
          setAdvisorOpen(false);
          setTimeout(() => setZoom(style), 300);
          setToast(`🌸 ${style.name} recommended for you!`);
          setTimeout(() => setToast(null), 3000);
        }}
      />

      {/* Album */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4 py-2">
        <div style={{
          perspective: "1600px",
          width: "min(960px, 94vw)",
          maxHeight: "min(720px, 78vh)",
          filter: "drop-shadow(0 25px 65px rgba(140,60,20,0.35)) drop-shadow(0 10px 25px rgba(140,60,20,0.2))",
        }}>
          <div className="flex w-full relative" style={{ aspectRatio: "4/3", transformStyle: "preserve-3d" }}>

            {/* Left leather edge */}
            <div style={{ width: 26, flexShrink: 0, background: "linear-gradient(to right, #8B5E3C, #A67850, #8B5E3C)", borderRadius: "6px 0 0 6px", boxShadow: "inset -3px 0 8px rgba(0,0,0,0.4)" }} />

            {/* Left page */}
            <PageContent
              photos={leftColDisplay} side="L"
              pageNum={isFlipping && flipDir === "p" ? (pg - 1) * 2 + 1 : pg * 2 + 1}
            />

            {/* Center spine */}
            <div style={{ width: 36, flexShrink: 0, zIndex: 40, background: "linear-gradient(to right, #6B3F22, #A67850, #6B3F22)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12, padding: "16px 0", boxShadow: "0 0 16px rgba(0,0,0,0.4)" }}>
              {[...Array(14)].map((_, i) => (
                <div key={i} style={{ width: 2, height: 8, borderRadius: 1, background: "rgba(255,255,255,0.18)" }} />
              ))}
            </div>

            {/* Right page */}
            <PageContent
              photos={rightColDisplay} side="R"
              pageNum={isFlipping && flipDir === "n" ? (pg + 1) * 2 + 2 : pg * 2 + 2}
            />

            {/* Right leather edge */}
            <div style={{ width: 26, flexShrink: 0, background: "linear-gradient(to left, #8B5E3C, #A67850, #8B5E3C)", borderRadius: "0 6px 6px 0", boxShadow: "inset 3px 0 8px rgba(0,0,0,0.4)" }} />

            {/* ── 3D Flipping page ── */}
            {isFlipping && (
              <motion.div
                initial={{ rotateY: flipDir === "n" ? 0 : -180 }}
                animate={{ rotateY: flipDir === "n" ? -180 : 0 }}
                transition={{ duration: FLIP_DURATION, ease: [0.25, 0.1, 0.25, 1] }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: flipDir === "n" ? "50%" : 0,
                  width: "50%",
                  height: "100%",
                  transformOrigin: flipDir === "n" ? "left center" : "right center",
                  transformStyle: "preserve-3d",
                  zIndex: 50,
                  pointerEvents: "none",
                }}
              >
                {/* Front face */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", display: "flex", flexDirection: "column",
                  padding: "10px 10px 10px 18px", gap: "6px", background: "#fdf7f1" }}>
                  {flipFrontPhotos.map((s, i) => <PhotoSlot key={s?.id || `flip-f-${i}`} s={s} />)}
                </div>
                {/* Back face */}
                <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", display: "flex", flexDirection: "column",
                  padding: "10px 18px 10px 10px", gap: "6px", background: "#fdf7f1" }}>
                  {flipBackPhotos.map((s, i) => <PhotoSlot key={s?.id || `flip-b-${i}`} s={s} />)}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Nav arrows */}
      <div className="relative z-20 flex items-center gap-6 pb-5 pt-2">
        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
          onClick={() => go("p")}
          disabled={pg === 0 || isFlipping}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
          style={{ background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}15)`, border: `1.5px solid ${ACCENT}40`, color: ACCENT }}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{ width: i === pg ? 20 : 6, height: 6, background: i === pg ? ACCENT : `${ACCENT}30` }} />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
          onClick={() => go("n")}
          disabled={pg >= totalSpreads - 1 || isFlipping}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
          style={{ background: `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}15)`, border: `1.5px solid ${ACCENT}40`, color: ACCENT }}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* ── Lightbox zoom ── */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6"
            style={{ background: "rgba(60,25,10,0.8)", backdropFilter: "blur(20px)" }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative rounded-3xl overflow-hidden flex"
              style={{
                maxWidth: 720, maxHeight: "88vh", width: "100%",
                background: "#FDF9F6",
                border: `1.5px solid ${ACCENT}30`,
                boxShadow: `0 40px 80px rgba(80,30,10,0.4), 0 0 0 1px ${ACCENT}20`,
              }}
            >
              <div className="w-[45%] flex-shrink-0">
                <img src={zoom.imageUrl} alt={zoom.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                    style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30` }}
                  >
                    {zoom.category}
                  </span>
                  <h2 className="text-2xl font-black mt-4 mb-3" style={{ color: TEXT_MAIN, fontFamily: "'Cormorant Garamond', serif" }}>
                    {zoom.name}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>{zoom.description}</p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {zoom.tags?.map((tag: string) => (
                      <span key={tag} className="text-[9px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${ACCENT}10`, color: ACCENT, border: `1px solid ${ACCENT}20` }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setZoom(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`, boxShadow: `0 0 18px ${ACCENT}40` }}
                  >
                    🌸 Book This Style
                  </button>
                  <button
                    onClick={() => setZoom(null)}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition"
                    style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}25`, color: TEXT_MUTED }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
