"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { shopService, type Shop } from "@/api/shopService";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  ArrowLeft,
  Scissors,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  CalendarDays,
  User,
} from "lucide-react";
import { Button } from "@/components/common/button";
import { AnimatedBackground } from "@/components/common/animated-background";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

function ShopCard({ shop, onSelect }: { shop: Shop; onSelect: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer group"
      onClick={onSelect}
    >
      {/* Shop Avatar & Name */}
      <div className="flex items-start gap-4">
        {shop.logoUrl ? (
          <div className="h-12 w-12 rounded-xl shrink-0 border border-orange-500/30 group-hover:border-orange-500/60 transition relative overflow-hidden">
            <Image src={shop.logoUrl} alt={shop.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-500/30 group-hover:border-orange-500/60 transition">
            <Scissors className="h-6 w-6 text-orange-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-base leading-tight truncate">{shop.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-white/40">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="text-xs truncate">{shop.address}, {shop.city}</span>
          </div>
        </div>
        {/* Active indicator */}
        {shop.active && (
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Open</span>
          </div>
        )}
      </div>

      {/* Description */}
      {shop.description && (
        <p className="text-sm text-white/50 leading-relaxed line-clamp-2 pl-16">{shop.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex gap-3">
          {shop.latitude && shop.longitude && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              Map
            </a>
          )}
          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="text-xs text-white/30 hover:text-white/60 transition"
              onClick={(e) => e.stopPropagation()}
            >
              {shop.phone}
            </a>
          )}
        </div>
        <Button
          size="sm"
          className="bg-orange-500 text-black hover:bg-orange-400 rounded-full text-xs font-bold h-8 px-4"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          View
        </Button>
      </div>
    </motion.div>
  );
}

function ShopDetailModal({ shopId, onClose }: { shopId: string; onClose: () => void }) {
  const { isAuthenticated, role } = useAuth();
  const { data: shopDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ["shop-detail", shopId],
    queryFn: () => shopService.getById(shopId),
    enabled: !!shopId,
  });

  const { data: shopStaffs, isLoading: isStaffsLoading } = useQuery({
    queryKey: ["shop-staffs", shopId],
    queryFn: () => shopService.getStaffs(shopId),
    enabled: !!shopId,
  });

  const handleOpenMap = () => {
    if (shopDetail?.latitude && shopDetail?.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${shopDetail.latitude},${shopDetail.longitude}`,
        "_blank"
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[20px]"
      />

      {/* Sheet/Modal */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full sm:max-w-2xl bg-zinc-900 border-0 sm:border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] overflow-hidden max-h-[90dvh] sm:max-h-[85vh] flex flex-col shadow-2xl"
      >
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {shopDetail?.logoUrl ? (
                <div className="h-14 w-14 rounded-2xl shrink-0 border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)] relative overflow-hidden">
                  <Image src={shopDetail.logoUrl} alt={shopDetail.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                  <Scissors className="h-7 w-7 text-orange-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-black text-white leading-tight">
                  {isDetailLoading ? <div className="w-32 h-5 bg-white/10 animate-pulse rounded" /> : shopDetail?.name}
                </h2>
                <div className="flex items-center gap-1.5 text-white/40 mt-1">
                  <MapPin className="h-3 w-3 text-orange-500/60" />
                  <span className="text-xs font-bold uppercase tracking-wider">{shopDetail?.city}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/30 hover:text-white hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Description */}
          {shopDetail?.description && (
            <p className="text-sm text-white/60 leading-relaxed italic">
              "{shopDetail.description}"
            </p>
          )}

          {/* Map link */}
          {shopDetail?.latitude && shopDetail?.longitude && (
            <button
              onClick={handleOpenMap}
              className="flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 font-bold uppercase tracking-widest transition"
            >
              <ExternalLink size={13} /> Locate on Google Maps
            </button>
          )}

          {/* Staffs */}
          <div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-3">Staffs</h3>
            <div className="space-y-2">
              {isStaffsLoading
                ? [1, 2].map((i) => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)
                : shopStaffs && shopStaffs.length > 0
                ? shopStaffs.map((staff: any) => (
                    <div
                      key={staff.id}
                      className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4"
                    >
                      {staff.user?.avatarUrl ? (
                        <div className="h-10 w-10 rounded-xl shrink-0 border border-white/5 relative overflow-hidden">
                          <Image src={staff.user.avatarUrl} alt={staff.user.firstName} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 shrink-0">
                          <User className="h-5 w-5 text-white/20" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {staff.user?.firstName} {staff.user?.lastName}
                        </h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={10} className="text-orange-400 fill-orange-400" />
                          <span className="text-[10px] text-white/30">
                            {staff.averageRating?.toFixed(1)} Rating
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                : (
                    <div className="text-center py-6 text-white/20 text-xs">No staffs listed yet</div>
                  )}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2 pb-2">
            {isAuthenticated ? (
              <Link href={role === "CUSTOMER" ? "/app" : "/owner"}>
                <Button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black h-14 rounded-2xl shadow-xl text-base">
                  {role === "CUSTOMER" ? "Book Now" : "Go to Dashboard"}
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black h-14 rounded-2xl shadow-xl text-base">
                  Login to Book
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ShopsPage() {
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const PAGE_SIZE = 12;

  const { data: shops, isLoading } = useQuery({
    queryKey: ["all-shops", activeQuery, page],
    queryFn: () =>
      activeQuery
        ? shopService.search(activeQuery, page, PAGE_SIZE)
        : shopService.list(page, PAGE_SIZE),
    staleTime: 30_000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(query);
    setPage(0);
  };

  const totalPages = shops?.totalPages ?? 0;

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6 pb-24 sm:pt-12 sm:pb-12">

        {/* Top Bar */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Explore Shops</h1>
            <p className="text-sm text-white/40 mt-0.5">Find the perfect staffshop near you</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) { setActiveQuery(""); setPage(0); }
            }}
            placeholder="Search by name, city, or address…"
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-28 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.08] transition"
          />
          <Button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl h-10 px-5 text-sm"
          >
            Search
          </Button>
        </form>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-white/40">
            {isLoading ? "Loading…" : shops ? `${shops.totalElements ?? (shops.content?.length ?? 0)} shops found` : ""}
            {activeQuery && <span className="text-white/60"> for "<strong>{activeQuery}</strong>"</span>}
          </p>
          {activeQuery && (
            <button
              onClick={() => { setQuery(""); setActiveQuery(""); setPage(0); }}
              className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1 transition"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="h-44 bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : shops?.content && shops.content.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.content.map((shop) => (
              <ShopCard key={shop.id} shop={shop} onSelect={() => setSelectedShopId(shop.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Scissors className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/40 font-medium">No shops found</p>
            {activeQuery && (
              <button
                onClick={() => { setQuery(""); setActiveQuery(""); }}
                className="text-sm text-orange-400 hover:text-orange-300 transition"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/50 disabled:opacity-30 hover:bg-white/10 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-white/50 font-medium">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/50 disabled:opacity-30 hover:bg-white/10 transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Mobile bottom padding spacer handled by pb-24 above */}
      </div>

      {/* Shop Detail Modal */}
      <AnimatePresence>
        {selectedShopId && (
          <ShopDetailModal shopId={selectedShopId} onClose={() => setSelectedShopId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
