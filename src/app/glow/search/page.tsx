"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, MapPin, Star, SlidersHorizontal, X, Sparkles, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { glowShopApi, ShopSearchResponse } from "@/lib/glow-api";

const POPULAR = ["Silk Press", "Bridal Makeup", "Gel Nails", "Deep Condition", "Lash Lift", "Eyebrow Threading", "Facial Treatment", "Hair Braiding"];
const SORT_OPTIONS = ["Relevance", "Rating", "Distance", "Price: Low", "Price: High"] as const;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState<typeof SORT_OPTIONS[number]>("Relevance");
  const [city, setCity] = useState("");

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await glowShopApi.searchShops(searchQuery, city || undefined);
      setResults(res.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const cardGradients = [
    { bg: "linear-gradient(135deg,rgba(200,149,108,0.12),rgba(200,149,108,0.04))", border: "rgba(200,149,108,0.2)",  accent: "#C8956C",  icon: "linear-gradient(135deg,#C8956C,#E8B4A0)" },
    { bg: "linear-gradient(135deg,rgba(232,121,249,0.1),rgba(232,121,249,0.04))",  border: "rgba(232,121,249,0.2)", accent: "#E879F9",  icon: "linear-gradient(135deg,#E879F9,#C084FC)" },
    { bg: "linear-gradient(135deg,rgba(244,63,94,0.1),rgba(244,63,94,0.04))",      border: "rgba(244,63,94,0.2)",   accent: "#F43F5E",  icon: "linear-gradient(135deg,#F43F5E,#FB7185)" },
    { bg: "linear-gradient(135deg,rgba(124,185,154,0.1),rgba(124,185,154,0.04))", border: "rgba(124,185,154,0.2)", accent: "#7CB99A",  icon: "linear-gradient(135deg,#7CB99A,#6EE7B7)" },
    { bg: "linear-gradient(135deg,rgba(129,140,248,0.1),rgba(129,140,248,0.04))", border: "rgba(129,140,248,0.2)", accent: "#818CF8",  icon: "linear-gradient(135deg,#818CF8,#C4B5FD)" },
    { bg: "linear-gradient(135deg,rgba(255,215,0,0.1),rgba(255,215,0,0.04))",      border: "rgba(255,215,0,0.2)",   accent: "#FFD700",  icon: "linear-gradient(135deg,#FFD700,#FDE68A)" },
  ];

  return (
    <div className="min-h-screen">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40"
        style={{ background: "rgba(10,5,18,0.93)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(200,149,108,0.1)" }}>
        {/* Shimmer top line */}
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent,rgba(200,149,108,0.4),transparent)" }} />
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/glow/discover"
              className="p-2 rounded-xl transition-all shrink-0"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.6)" }}>
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <form onSubmit={e => { e.preventDefault(); handleSearch(); }}
              className="flex-1 flex items-center gap-2 rounded-2xl px-1 transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.2)" }}>
              <div className="pl-3 shrink-0">
                <Search className="h-4 w-4" style={{ color: "rgba(200,149,108,0.55)" }} />
              </div>
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Salons, services, stylists…"
                className="flex-1 h-11 bg-transparent px-1 text-white text-sm focus:outline-none placeholder:text-white/20"
                autoFocus />
              {query && (
                <button type="button" onClick={() => { setQuery(""); setSearched(false); setResults([]); }}
                  className="p-1.5 transition-colors" style={{ color: "rgba(253,246,238,0.3)" }}>
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button type="submit"
                className="shrink-0 rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest text-[#1A0F1E] mr-1"
                style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 12px rgba(200,149,108,0.3)" }}>
                Search
              </button>
            </form>

            <button onClick={() => setShowFilters(!showFilters)}
              className="p-2.5 rounded-xl transition-all shrink-0"
              style={{
                background: showFilters ? "rgba(200,149,108,0.15)" : "rgba(253,246,238,0.05)",
                border: `1px solid ${showFilters ? "rgba(200,149,108,0.45)" : "rgba(200,149,108,0.15)"}`,
                color: showFilters ? "#C8956C" : "rgba(253,246,238,0.55)"
              }}>
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden">
                <div className="pb-4 flex flex-col gap-4">
                  {/* Sort pills */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] mb-2.5" style={{ color: "rgba(200,149,108,0.5)" }}>Sort By</p>
                    <div className="flex gap-2 flex-wrap">
                      {SORT_OPTIONS.map(s => (
                        <button key={s} onClick={() => setSort(s)}
                          className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
                          style={{
                            background: sort === s ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "rgba(253,246,238,0.04)",
                            color: sort === s ? "#1A0F1E" : "rgba(253,246,238,0.45)",
                            border: `1px solid ${sort === s ? "transparent" : "rgba(200,149,108,0.15)"}`,
                            boxShadow: sort === s ? "0 0 16px rgba(200,149,108,0.3)" : "none"
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* City input */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.35em] mb-2.5" style={{ color: "rgba(200,149,108,0.5)" }}>City</p>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "rgba(200,149,108,0.5)" }} />
                      <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Addis Ababa"
                        className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
                        style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)" }}
                        onFocus={e => e.currentTarget.style.border = "1.5px solid rgba(200,149,108,0.5)"}
                        onBlur={e => e.currentTarget.style.border = "1px solid rgba(200,149,108,0.15)"} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ── IDLE STATE ── */}
        {!searched && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-4 w-4" style={{ color: "#C8956C" }} />
              <p className="text-[10px] font-black uppercase tracking-[0.35em]" style={{ color: "rgba(200,149,108,0.6)" }}>Trending Searches</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-12">
              {POPULAR.map((p, i) => (
                <motion.button key={p}
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  onClick={() => { setQuery(p); handleSearch(p); }}
                  className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                  style={{ background: "rgba(253,246,238,0.04)", border: "1px solid rgba(200,149,108,0.18)", color: "rgba(253,246,238,0.65)" }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {p}
                </motion.button>
              ))}
            </div>

            {/* Hero prompt */}
            <div className="text-center py-8">
              <div className="h-20 w-20 mx-auto rounded-3xl flex items-center justify-center mb-5"
                style={{ background: "rgba(200,149,108,0.08)", border: "1px solid rgba(200,149,108,0.15)" }}>
                <Search className="h-10 w-10" style={{ color: "rgba(200,149,108,0.3)" }} />
              </div>
              <p className="text-base font-bold text-white mb-1">Find Your Perfect Salon</p>
              <p className="text-sm" style={{ color: "rgba(253,246,238,0.35)" }}>Search across 800+ premium beauty spots</p>
            </div>
          </div>
        )}

        {/* ── LOADING SKELETONS ── */}
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl animate-pulse"
                style={{ background: "rgba(253,246,238,0.03)", border: "1px solid rgba(200,149,108,0.08)" }}>
                <div className="h-16 w-16 rounded-2xl shrink-0" style={{ background: "rgba(200,149,108,0.08)" }} />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 rounded-full w-3/5" style={{ background: "rgba(253,246,238,0.08)" }} />
                  <div className="h-3 rounded-full w-2/5" style={{ background: "rgba(200,149,108,0.08)" }} />
                  <div className="h-3 rounded-full w-4/5" style={{ background: "rgba(253,246,238,0.05)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY RESULTS ── */}
        {searched && !loading && results.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="h-20 w-20 mx-auto rounded-3xl flex items-center justify-center mb-5"
              style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.15)" }}>
              <Search className="h-10 w-10" style={{ color: "rgba(244,63,94,0.35)" }} />
            </div>
            <p className="text-base font-bold text-white mb-1">No results found</p>
            <p className="text-sm" style={{ color: "rgba(253,246,238,0.35)" }}>No salons match &ldquo;{query}&rdquo;</p>
            <p className="text-xs mt-1" style={{ color: "rgba(253,246,238,0.2)" }}>Try a different term or browse by category</p>
            <Link href="/glow/discover"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-[#1A0F1E]"
              style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", boxShadow: "0 0 20px rgba(200,149,108,0.3)" }}>
              Browse Discover
            </Link>
          </motion.div>
        )}

        {/* ── RESULTS ── */}
        {searched && !loading && results.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold" style={{ color: "rgba(253,246,238,0.4)" }}>
                <span className="font-black" style={{ color: "#C8956C" }}>{results.length}</span> results for &ldquo;{query}&rdquo;
              </p>
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
                style={{ background: "rgba(200,149,108,0.1)", color: "rgba(200,149,108,0.7)", border: "1px solid rgba(200,149,108,0.2)" }}>
                {sort}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {results.map((salon, i) => {
                const card = cardGradients[i % cardGradients.length];
                return (
                  <motion.div key={salon.id}
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, ease: [0.23,1,0.32,1] }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}>
                    <Link href={`/glow/salons/${salon.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                      style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                      {/* Avatar icon */}
                      <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
                        style={{ background: card.icon, boxShadow: `0 0 20px ${card.accent}33` }}>
                        <Sparkles className="h-7 w-7 text-white/60" />
                        <div className="absolute inset-0 shimmer-overlay" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{salon.name}</p>
                        <p className="text-xs mt-0.5 truncate font-semibold" style={{ color: card.accent }}>
                          {salon.description || "Premium Salon"}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "rgba(253,246,238,0.4)" }}>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" style={{ color: card.accent }} />{salon.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />5.0
                          </span>
                          {salon.averageWaitMinutes > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{salon.averageWaitMinutes}m wait
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 h-8 w-8 rounded-xl flex items-center justify-center"
                        style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}33` }}>
                        <Search className="h-3.5 w-3.5" style={{ color: card.accent }} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
