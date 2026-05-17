"use client";
import { motion } from "framer-motion";
import { Crown, Gift, Flame, Shield, Star, TrendingUp } from "lucide-react";

const TIER_INFO: Record<string, { color: string; gradient: string; next: string | null; needed: number }> = {
  BRONZE:   { color: "#CD7F32", gradient: "linear-gradient(135deg, #CD7F32, #A0612B)", next: "SILVER", needed: 500 },
  SILVER:   { color: "#a89f91", gradient: "linear-gradient(135deg, #B8B0A4, #8E8576)", next: "GOLD", needed: 1000 },
  GOLD:     { color: "#d4af37", gradient: "linear-gradient(135deg, #D4AF37, #B89530)", next: "PLATINUM", needed: 2000 },
  PLATINUM: { color: "#8c8c8c", gradient: "linear-gradient(135deg, #9C9C9C, #6E6E6E)", next: null, needed: 0 },
};

const HISTORY = [
  { desc: "Silk Press & Style at Lumiere", pts: +85, date: "May 8" },
  { desc: "Ombré Gel Nails at Saba Nails", pts: +45, date: "May 1" },
  { desc: "Redeemed for 50 ETB discount", pts: -500, date: "Apr 25" },
  { desc: "Deep Tissue Massage", pts: +90, date: "Apr 30" },
];

export function LoyaltyTab({ points = 2450, tierName = "GOLD" }: { points?: number; tierName?: string }) {
  const tier = TIER_INFO[tierName] || TIER_INFO.BRONZE;
  const pct = tierName === "PLATINUM" ? 100 : Math.min((points / (points + tier.needed)) * 100, 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Hero points card */}
      <div className="relative rounded-[32px] overflow-hidden p-10 md:p-14 text-center bg-white border border-[#F0E4D8]">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-30 blur-[100px]" style={{ background: "#FADEC9" }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-20 blur-[80px]" style={{ background: "#D4864A" }} />

        <div className="relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="h-24 w-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg border-4 border-[#FFF5ED]"
            style={{ background: tier.gradient }}>
            <Crown className="h-10 w-10 text-white" />
          </motion.div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold mb-2 text-[#D4864A]">{tierName} MEMBER</p>
          <p className="text-6xl font-bold text-[#5C3D2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {points.toLocaleString()}
          </p>
          <p className="text-xs font-bold text-[#B5A090] tracking-widest uppercase mt-1">GlowPoints</p>

          {tier.next && (
            <div className="mt-10 max-w-md mx-auto bg-[#FBF7F3] p-6 rounded-2xl border border-[#F0E4D8]">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                <span className="text-[#5C3D2E]">{tierName}</span>
                <span className="text-[#D4864A]">{tier.needed} pts to {tier.next}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-[#F0E4D8]">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #D4864A, #F5B07B)" }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Benefits */}
        <div className="rounded-[28px] p-8 bg-white border border-[#F0E4D8]">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-6 text-[#D4864A]">Your Benefits</p>
          <div className="space-y-5">
            {[
              { icon: <Gift className="h-5 w-5" />, title: "Earn Points", desc: "10 pts per $100 spent" },
              { icon: <Flame className="h-5 w-5" />, title: "Birthday Boost", desc: "Double points on birthday month" },
              { icon: <Shield className="h-5 w-5" />, title: "Priority Booking", desc: "Skip the waitlist for top salons" },
              { icon: <Star className="h-5 w-5" />, title: "Exclusive Offers", desc: "Member-only discounts" },
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#FFF5ED] text-[#D4864A] shrink-0 border border-[#FADEC9]">
                  {b.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#5C3D2E]">{b.title}</p>
                  <p className="text-xs text-[#B5A090] mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="rounded-[28px] p-8 bg-white border border-[#F0E4D8] flex flex-col">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-6 text-[#D4864A]">Recent Activity</p>
          <div className="space-y-1 flex-1">
            {HISTORY.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-[#FBF7F3] last:border-0">
                <div>
                  <p className="text-sm font-bold text-[#5C3D2E]">{h.desc}</p>
                  <p className="text-xs text-[#B5A090] mt-1">{h.date}</p>
                </div>
                <span className={`font-bold text-lg ${h.pts > 0 ? "text-[#6BAF7B]" : "text-[#D47A7A]"}`}
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {h.pts > 0 ? "+" : ""}{h.pts}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3.5 rounded-full font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider transition-all hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
            <Gift className="h-4 w-4" /> Redeem Points
          </button>
        </div>
      </div>
    </motion.div>
  );
}
