"use client";

import { useEffect, useState } from "react";
import { glowAdminApi, ShopSearchResponse } from "@/lib/glow-api";
import { Building2, Search, MapPin, Star, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

export default function SalonsPage() {
  const [salons, setSalons] = useState<ShopSearchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    glowAdminApi.listAllShops()
      .then(res => setSalons(res.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = salons.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            All Salons
          </h2>
          <p className="text-[#7A6350] mt-1 text-sm">Manage active salons on the platform.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5A090]" />
          <input 
            type="text" 
            placeholder="Search salons..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-full text-sm outline-none transition-all"
            style={{ background: "#FFFFFF", border: "1.5px solid #E8DDD2", color: "#2C2416" }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 border-4 border-[#D4864A]/30 border-t-[#D4864A] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((salon, i) => (
            <motion.div 
              key={salon.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[24px] border border-[#E8DDD2] overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="h-24 bg-gradient-to-br from-[#FFF0E8] to-[#FDE8F0] relative">
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/50 hover:bg-white text-[#7A6350] transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 pb-6 pt-0 relative">
                <div className="h-16 w-16 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center text-[#D4864A] -mt-8 mb-3 z-10 relative">
                  {salon.logoUrl ? (
                    <img src={salon.logoUrl} alt={salon.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 className="h-6 w-6" />
                  )}
                </div>
                
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-[#2C2416] leading-tight mb-1">{salon.name}</h3>
                  {salon.active ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider">Active</span>
                  ) : (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">Inactive</span>
                  )}
                </div>

                <div className="space-y-1.5 mt-3">
                  <p className="text-xs text-[#7A6350] flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#B5A090]" />
                    {salon.address}, {salon.city}
                  </p>
                  <p className="text-xs text-[#7A6350] flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-[#D4864A] fill-current" />
                    4.8 (124 reviews) {/* Placeholder for now */}
                  </p>
                </div>
                
                <div className="mt-5 pt-4 border-t border-[#E8DDD2] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#B5A090]">Owner:</span>
                    <span className="font-semibold text-[#2C2416] ml-1">{salon.ownerName || "Unassigned"}</span>
                  </div>
                  <button className="text-[#D4864A] text-xs font-bold hover:underline">View Details</button>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-[#7A6350]">
              No salons found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
