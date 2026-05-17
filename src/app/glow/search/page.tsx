"use client";
import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowLeft, MapPin, Star, Clock, TrendingUp, Sparkles, ArrowRight, Scissors, Sparkle, Brush, Flower2, Droplets, Crown } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { glowShopApi, ShopSearchResponse } from "@/lib/glow-api";

const TRENDING = ["Silk Press", "Braids", "Gel Nails", "Bridal Makeup", "Deep Condition", "Lash Extensions"];

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") || "");
  const [results, setResults] = useState<ShopSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const res = await glowShopApi.searchShops(q);
      setResults(res.content || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSearch(query); };

  return (
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans bg-transparent">
      <div className="w-full max-w-[1400px] bg-[#FAF5EE] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700 min-h-[800px] border border-white/20">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#FDF6F0] border-b border-[#E8DDD2]">
          <div className="max-w-3xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl shrink-0 transition-transform hover:scale-105" style={{ background: "#FFFFFF", border: "1px solid #E8DDD2" }}>
              <ArrowLeft className="h-4 w-4" style={{ color: "#7A6350" }} />
          </button>
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl"
              style={{ background: "#FFFFFF", border: "1.5px solid #E8DDD2", boxShadow: "0 2px 12px rgba(44,36,22,0.06)" }}>
              <Search className="h-4 w-4 shrink-0" style={{ color: "#B5A090" }} />
              <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
                placeholder="Search salons, services..." className="flex-1 text-sm bg-transparent outline-none" style={{ color: "#2C2416" }} />
            </form>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-5 py-6">
          {/* Trending */}
          {!searched && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4" style={{ color: "#D4864A" }} />
                <h2 className="text-sm font-bold" style={{ color: "#2C2416" }}>Trending Searches</h2>
              </div>
              <div className="flex flex-wrap gap-2 mb-10">
                {TRENDING.map(t => (
                  <button key={t} onClick={() => { setQuery(t); doSearch(t); }}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: "#FFFFFF", border: "1px solid #E8DDD2", color: "#2C2416" }}>{t}</button>
                ))}
              </div>

              {/* Browse categories */}
              <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#2C2416" }}>
                Browse by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { Icon: Scissors, label: "Hair", bg: "linear-gradient(135deg, #FFAB91, #FF5722)", shadowColor: "rgba(255,87,34,0.3)" },
                  { Icon: Sparkle, label: "Nails", bg: "linear-gradient(135deg, #F48FB1, #E91E63)", shadowColor: "rgba(233,30,99,0.3)" },
                  { Icon: Brush, label: "Makeup", bg: "linear-gradient(135deg, #CE93D8, #9C27B0)", shadowColor: "rgba(156,39,176,0.3)" },
                  { Icon: Flower2, label: "Spa", bg: "linear-gradient(135deg, #80CBC4, #009688)", shadowColor: "rgba(0,150,136,0.3)" },
                  { Icon: Droplets, label: "Skincare", bg: "linear-gradient(135deg, #90CAF9, #2196F3)", shadowColor: "rgba(33,150,243,0.3)" },
                  { Icon: Crown, label: "Bridal", bg: "linear-gradient(135deg, #FFE082, #FFB300)", shadowColor: "rgba(255,179,0,0.3)" },
                ].map((c, i) => (
                  <motion.button key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => { setQuery(c.label); doSearch(c.label); }}
                    className="flex flex-col items-center gap-3 py-6 rounded-3xl transition-all hover:-translate-y-2 relative group"
                    style={{ 
                      background: "linear-gradient(145deg, #ffffff, #fdfaf6)", 
                      border: "1px solid rgba(255,255,255,0.8)",
                      boxShadow: "8px 8px 16px rgba(44,36,22,0.04), -8px -8px 16px rgba(255,255,255,0.8)" 
                    }}>
                    <div className="h-16 w-16 rounded-full flex items-center justify-center text-white relative z-10 transition-transform group-hover:scale-110" 
                         style={{ 
                           background: c.bg,
                           boxShadow: `0 12px 24px -6px ${c.shadowColor}, inset 0 2px 6px rgba(255,255,255,0.6)`
                         }}>
                      <c.Icon className="h-7 w-7 drop-shadow-md" />
                    </div>
                    <span className="text-sm font-bold tracking-tight" style={{ color: "#2C2416" }}>{c.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 rounded-t-[60px] rounded-b-2xl" style={{ background: "#E8DDD2" }} />
                  <div className="p-3"><div className="h-3 rounded" style={{ background: "#E8DDD2", width: "60%" }} /></div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {searched && !loading && (
            <>
              <p className="text-sm mb-5" style={{ color: "#B5A090" }}>
                {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
              </p>
              {results.length === 0 ? (
                <div className="text-center py-16">
                  <Sparkles className="h-12 w-12 mx-auto mb-3" style={{ color: "#E8DDD2" }} />
                  <p className="text-sm" style={{ color: "#B5A090" }}>No salons found. Try a different search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {results.map((shop, i) => (
                    <motion.div key={shop.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                      <Link href={`/glow/salons/${shop.id}`} className="group block">
                        <div style={{ borderRadius: "60px 60px 20px 20px", background: "#FFFFFF", border: "1px solid #E8DDD2", boxShadow: "0 4px 16px rgba(44,36,22,0.05)", overflow: "hidden" }}>
                          <div className="h-36 flex items-center justify-center"
                            style={{ background: ["#FFF0E8", "#E8F5EC", "#FDE8F0", "#F2E0CC", "#E8EDF5"][i % 5] }}>
                            <Sparkles className="h-10 w-10 group-hover:scale-110 transition-transform" style={{ color: "#D4864A33" }} />
                          </div>
                          <div className="p-3">
                            <h3 className="text-sm font-bold truncate" style={{ color: "#2C2416" }}>{shop.name}</h3>
                            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "#B5A090" }}>
                              <MapPin className="h-3 w-3" /> {shop.city || "Addis Ababa"}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-bold" style={{ color: "#2C2416" }}>5.0</span>
                              </div>
                              <div className="h-7 w-7 rounded-full flex items-center justify-center group-hover:scale-110 transition-all"
                                style={{ background: "#D4864A" }}>
                                <ArrowRight className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-screen" style={{ background: "#F5EFE6" }} />}><SearchContent /></Suspense>;
}
