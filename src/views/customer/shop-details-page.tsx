"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin, Phone, Star, Scissors, 
  Clock, Share2, Heart, ArrowLeft,
  CheckCircle2, Info, Users, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { barberService } from "@/api/barberService";
import { bookingService } from "@/api/bookingService";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Button } from "@/components/common/button";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";
import { type Shop, type BarberProfile } from "@/types";

export function ShopDetailsPage() {
  const params = useParams<{ shopId: string }>();
  const shopId = params?.shopId;
  
  const shopQuery = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => barberService.getShop(shopId!),
    enabled: !!shopId
  });

  const barbersQuery = useQuery({
    queryKey: ["shop-barbers", shopId],
    queryFn: () => barberService.getShopBarbers(shopId!),
    enabled: !!shopId
  });

  const reviewsQuery = useQuery({
    queryKey: ["shop-reviews", shopId],
    queryFn: () => bookingService.getShopReviews(shopId),
    enabled: !!shopId
  });

  const shop = shopQuery.data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 pb-20"
    >
      {/* ── Header / Cover Section ── */}
      <motion.section variants={itemVariants} className="relative">
        <div className="relative h-[300px] md:h-[350px] rounded-[2.5rem] overflow-hidden border border-white/5">
          {/* Cover Image Placeholder with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-[#121212]">
            <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-blue-600/20" />
          </div>

          {/* Navigation Overlay */}
          <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
            <Link href="/app">
              <button className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all group">
                <Heart className="w-4 h-4 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>

          {/* Shop Info Overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-20">
            <div className="max-w-4xl">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 mb-3"
              >
                <Badge className="bg-orange-500 text-black border-none font-black px-2 py-0.5 text-[9px] uppercase tracking-widest">
                  Verified
                </Badge>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
                  <Star className="w-3 h-3 text-orange-500 fill-current" />
                  4.9 (120+)
                </div>
              </motion.div>

              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
                {shop?.name || "Loading Shop..."}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-white/60">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium">{shop?.city}, {shop?.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium">Open until 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Barbers & Services */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Shop Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <StatMini label="Active Queue" value={shop?.activeQueueCount || 0} icon={Users} color="orange" />
             <StatMini label="Avg. Wait" value={`${shop?.averageWaitMinutes || 0}m`} icon={Clock} color="blue" />
             <StatMini label="Barbers" value={barbersQuery.data?.length || 0} icon={Scissors} color="emerald" />
             <StatMini label="Status" value="Open" icon={CheckCircle2} color="emerald" />
          </motion.div>

          {/* Barbers List */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-white tracking-tight">Our Master Barbers</h2>
              <Badge className="bg-white/5 border-white/10 text-[9px] text-white/40 uppercase tracking-widest px-2 py-0.5">Select to book</Badge>
            </div>

            <div className="space-y-4">
              {barbersQuery.data?.map((barber) => (
                <BarberDetailCard key={barber.id} barber={barber} shopId={shopId!} />
              ))}
              {barbersQuery.isLoading && [1,2].map(i => <div key={i} className="h-48 bg-white/5 rounded-[2rem] animate-pulse" />)}
            </div>
          </motion.div>
        </div>

        {/* Right Column: About & Reviews */}
        <div className="space-y-8">
          {/* About Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 border-white/5 bg-white/5 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-white">About the Shop</h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                {shop?.description || "This shop hasn't provided a description yet, but their service speaks for itself. Visit us for a premium grooming experience."}
              </p>
            </Card>
          </motion.div>

          {/* Reviews Card */}
          <motion.div variants={itemVariants}>
            <Card className="p-8 border-white/5 bg-white/5 rounded-[2.5rem] flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-white">Reviews</h3>
                </div>
                <div className="text-orange-500 text-xs font-black">SEE ALL</div>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {reviewsQuery.data?.content.map((review) => (
                  <div key={review.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
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
                  <div className="text-center py-10 opacity-30">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2" />
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

function StatMini({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <div className={`p-4 rounded-2xl border flex flex-col gap-1 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <Icon className="w-4 h-4 opacity-60" />
        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{label}</span>
      </div>
      <span className="text-xl font-black text-white">{value}</span>
    </div>
  );
}

function BarberDetailCard({ barber, shopId }: { barber: BarberProfile; shopId: string }) {
  return (
    <Card className="p-6 border-white/5 bg-white/5 hover:bg-white/[0.08] rounded-[2rem] transition-all group">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Barber Info */}
        <div className="md:w-[200px] flex flex-col items-center md:items-start text-center md:text-left">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center text-2xl font-black text-black">
              {barber.user.firstName?.[0]}
            </div>
            <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-[3px] border-[#121212] ${barber.available ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <h3 className="text-xl font-black text-white group-hover:text-orange-400 transition-colors">
            {barber.user.firstName} {barber.user.lastName}
          </h3>
          <p className="text-white/40 text-[10px] mt-2 leading-relaxed line-clamp-3">
            {barber.bio || "Premium grooming specialist ready to deliver exceptional service."}
          </p>
          
          <div className="mt-4 flex items-center gap-2">
             <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white">
               <Star className="w-3 h-3 text-orange-500 fill-current" />
               {barber.averageRating}
             </div>
             <div className="text-[9px] text-white/30 uppercase font-black tracking-widest">
               {barber.totalReviews || 0} reviews
             </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="flex-1 space-y-3">
          <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3">Services</h4>
          <div className="grid grid-cols-1 gap-2">
            {barber.serviceAssignments?.map((assignment) => (
              <div 
                key={assignment.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/30 hover:bg-white/10 transition-all group/service"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{assignment.serviceName}</span>
                    <span className="text-[9px] text-blue-500/60 font-black uppercase tracking-widest">
                      {assignment.durationMinutes}m
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-black text-orange-400">
                    {formatCurrency(assignment.effectivePrice)}
                  </span>
                  <Link href={`/app/booking?shopId=${shopId}&barberId=${barber.id}&serviceId=${assignment.serviceId}`}>
                    <button className="px-4 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-black text-[10px] rounded-lg shadow-lg shadow-orange-500/10 transition-all hover:scale-105 active:scale-95">
                      BOOK
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
