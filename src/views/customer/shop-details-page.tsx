"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin, Star, Scissors, 
  Clock, Share2, Heart, ArrowLeft,
  CheckCircle2, Info, Users, MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { barberService } from "@/api/barberService";
import { bookingService } from "@/api/bookingService";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import { type Shop, type BarberProfile, type ServiceAssignment } from "@/types";

export function ShopDetailsPage() {
  const params = useParams<{ shopId: string }>();
  const shopId = params?.shopId;

  const shopQuery = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => barberService.getShop(shopId!),
    enabled: !!shopId,
  });

  const barbersQuery = useQuery({
    queryKey: ["shop-barbers", shopId],
    queryFn: () => barberService.getShopBarbers(shopId!),
    enabled: !!shopId,
  });

  const reviewsQuery = useQuery({
    queryKey: ["shop-reviews", shopId],
    queryFn: () => bookingService.getShopReviews(shopId),
    enabled: !!shopId,
  });

  const shop = shopQuery.data;

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.08 }}
      className="space-y-5 pb-24"
    >
      {/* ── Hero / Cover ── */}
      <motion.section variants={itemVariants} className="relative -mx-4 md:mx-0">
        <div className="relative h-[200px] md:h-[340px] md:rounded-[2.5rem] overflow-hidden border-b border-white/5 md:border">

          {/* Background gradient */}
          <div className="absolute inset-0 bg-[#121212]">
            <div className="w-full h-full bg-gradient-to-br from-orange-500/25 to-blue-600/15" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

          {/* Top nav buttons */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
            <Link href="/app">
              <button className="w-9 h-9 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white active:scale-95 transition-all">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Shop info at bottom of hero */}
          <div className="absolute bottom-4 left-4 right-4 md:bottom-7 md:left-8 md:right-8 z-20">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-orange-500 text-black border-none font-black px-2 py-0.5 text-[9px] uppercase tracking-widest">
                Verified
              </Badge>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
                <Star className="w-3 h-3 text-orange-500 fill-current" />
                4.9 (120+)
              </div>
            </div>

            <h1 className="text-xl md:text-4xl font-black text-white tracking-tight leading-tight mb-1.5">
              {shop?.name || "Loading..."}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-white/60">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                <span className="text-[11px] font-medium line-clamp-1">{shop?.city}{shop?.address ? `, ${shop.address}` : ""}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="text-[11px] font-medium">Open until 8:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Stats Row ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2 px-4 md:px-0">
        <StatMini label="Queue"    value={shop?.activeQueueCount || 0}            icon={Users}        color="orange" />
        <StatMini label="Wait"     value={`${shop?.averageWaitMinutes || 0}m`}    icon={Clock}        color="blue" />
        <StatMini label="Barbers"  value={barbersQuery.data?.length || 0}         icon={Scissors}     color="emerald" />
        <StatMini label="Status"   value="Open"                                   icon={CheckCircle2} color="emerald" />
      </motion.div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 px-4 md:px-0">

        {/* Left: Barbers */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-black text-white tracking-tight">Our Master Barbers</h2>
              <Badge className="bg-white/5 border-white/10 text-[9px] text-white/40 uppercase tracking-widest px-2 py-0.5">
                Tap to book
              </Badge>
            </div>

            <div className="space-y-3">
              {barbersQuery.data?.map((barber: BarberProfile) => (
                <BarberDetailCard key={barber.id} barber={barber} shopId={shopId!} />
              ))}
              {barbersQuery.isLoading &&
                [1, 2].map((i) => (
                  <div key={i} className="h-36 bg-white/5 rounded-[1.5rem] animate-pulse" />
                ))}
              {!barbersQuery.isLoading && barbersQuery.data?.length === 0 && (
                <div className="py-10 text-center text-white/30 border border-dashed border-white/10 rounded-[1.5rem]">
                  No barbers assigned yet.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right: About + Reviews */}
        <div className="space-y-4">
          {/* About */}
          <motion.div variants={itemVariants}>
            <Card className="p-5 border-white/5 bg-white/5 rounded-[1.5rem]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">About the Shop</h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                {shop?.description ||
                  "This shop hasn't provided a description yet, but their service speaks for itself."}
              </p>
            </Card>
          </motion.div>

          {/* Reviews */}
          <motion.div variants={itemVariants}>
            <Card className="p-5 border-white/5 bg-white/5 rounded-[1.5rem]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-white">Reviews</h3>
                </div>
                <div className="text-orange-500 text-[10px] font-black">SEE ALL</div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {reviewsQuery.data?.content.map((review: any) => (
                  <div
                    key={review.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-sm">{review.reviewerName}</span>
                      <div className="flex items-center gap-1 text-orange-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-black">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed italic">"{review.comment}"</p>
                  </div>
                ))}
                {(!reviewsQuery.data?.content || reviewsQuery.data.content.length === 0) && (
                  <div className="text-center py-8 opacity-30">
                    <MessageSquare className="w-7 h-7 mx-auto mb-2" />
                    <p className="text-xs">No reviews yet</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── StatMini ─────────────────────────────────────────────── */
function StatMini({ label, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    blue:   "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald:"text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl border flex flex-col gap-1 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 opacity-60" />
      </div>
      <span className="text-base md:text-xl font-black text-white leading-none">{value}</span>
      <span className="text-[9px] uppercase font-black tracking-wider opacity-50 leading-none">{label}</span>
    </div>
  );
}

/* ── BarberDetailCard ─────────────────────────────────────── */
function BarberDetailCard({ barber, shopId }: { barber: BarberProfile; shopId: string }) {
  return (
    <Card className="p-4 md:p-6 border-white/5 bg-white/5 hover:bg-white/[0.08] rounded-[1.5rem] md:rounded-[2rem] transition-all">
      {/* Barber header row — always horizontal */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative shrink-0">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-xl md:text-2xl font-black text-black">
            {barber.user.firstName?.[0]}
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#121212] ${
              barber.available ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-black text-white leading-tight truncate">
            {barber.user.firstName} {barber.user.lastName}
          </h3>
          <p className="text-white/40 text-[11px] leading-relaxed line-clamp-1 mt-0.5">
            {barber.bio || "Premium grooming specialist."}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white">
              <Star className="w-3 h-3 text-orange-500 fill-current" />
              {barber.averageRating}
            </div>
            <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">
              {barber.totalReviews || 0} reviews
            </span>
          </div>
        </div>
      </div>

      {/* Services */}
      {barber.serviceAssignments && barber.serviceAssignments.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Services</h4>
          {barber.serviceAssignments.map((assignment: ServiceAssignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-white/10 transition-all"
            >
              {/* Service info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-xs truncate">{assignment.serviceName}</p>
                <p className="text-[10px] text-blue-400/70 font-bold mt-0.5">{assignment.durationMinutes}min</p>
              </div>

              {/* Price + Book */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-black text-orange-400 whitespace-nowrap">
                  {formatCurrency(assignment.effectivePrice)}
                </span>
                <Link
                  href={`/app/booking?shopId=${shopId}&barberId=${barber.id}&serviceId=${assignment.serviceId}`}
                >
                  <button className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 active:scale-95 text-black font-black text-[10px] rounded-lg shadow-lg shadow-orange-500/20 transition-all whitespace-nowrap">
                    BOOK
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-white/20 text-xs italic py-4">No services assigned yet.</p>
      )}
    </Card>
  );
}
