"use client";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const SAVED = [
  { id: "1", name: "Lumiere Beauty Lounge", category: "Hair & Makeup", location: "Bole", rating: 4.9, image: "/glow/spa.png" },
  { id: "3", name: "The Glow Spa", category: "Spa & Skincare", location: "Sarbet", rating: 5.0, image: "/glow/hero.png" },
];

export function SavedTab() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {SAVED.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="group bg-white rounded-[24px] overflow-hidden border border-[#F0E4D8] hover:border-[#D4864A]/30 transition-all duration-500 hover:shadow-[0_16px_48px_rgba(212,134,74,0.12)] flex flex-col">

          <div className="relative h-44 w-full overflow-hidden">
            <Image src={s.image} alt={s.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#5C3D2E]/40 to-transparent" />
            <button className="absolute top-4 right-4 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Heart className="h-5 w-5 text-rose-400 fill-rose-400" />
            </button>
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-[#5C3D2E]">{s.rating}</span>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4864A] mb-1">{s.category}</p>
            <p className="text-lg font-bold text-[#5C3D2E] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{s.name}</p>
            <div className="flex items-center gap-1.5 text-sm text-[#B5A090] mb-5">
              <MapPin className="h-4 w-4 text-[#D4864A]" /> {s.location}
            </div>
            <Link href={`/glow/salons/${s.id}`}
              className="w-full py-3 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 mt-auto text-[#D4864A] bg-[#FFF5ED] border border-[#FADEC9] group-hover:text-white group-hover:border-transparent"
              style={{ transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, #D4864A, #C07540)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#FFF5ED"; }}>
              View Salon <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      ))}
      {SAVED.length === 0 && (
        <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-[#E8DDD2]">
          <Heart className="h-14 w-14 mx-auto mb-4 text-[#E8DDD2]" />
          <p className="text-lg font-bold text-[#5C3D2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No saved salons yet</p>
          <p className="text-sm text-[#B5A090] mt-1">Tap ♥ on salons you love!</p>
        </div>
      )}
    </motion.div>
  );
}
