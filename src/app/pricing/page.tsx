import { PublicLayout } from "@/layouts/public-layout";
import { AnimatedBackground } from "@/components/common/animated-background";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Pricing — TrimLink",
  description: "Pricing plans for barbershops on TrimLink.",
};

export default function PricingPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 relative overflow-hidden text-white">
        <AnimatedBackground />
        
        <div className="w-full max-w-4xl relative z-10 pt-20">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white/90">Simple, Transparent Pricing</h1>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">Choose the plan that fits your barbershop's needs. No hidden fees, cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Starter Plan */}
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8">
              <h3 className="text-2xl font-black mb-2">Starter</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-white">1,500</span>
                <span className="text-white/50 mb-1">ETB / mo</span>
              </div>
              <ul className="space-y-4 mb-8 text-white/70">
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Up to 3 Barbers</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Basic Booking Management</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Standard Support</li>
              </ul>
              <Link href="/auth/register" className="block w-full py-3 rounded-full border border-white/20 text-center font-bold hover:bg-white/10 transition">Get Started</Link>
            </div>

            {/* Growth Plan */}
            <div className="bg-gradient-to-b from-orange-500/20 to-white/5 backdrop-blur-3xl border border-orange-500/30 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="absolute top-6 right-6 bg-orange-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Popular</div>
              <h3 className="text-2xl font-black mb-2 text-orange-50">Growth</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-white">3,900</span>
                <span className="text-white/50 mb-1">ETB / mo</span>
              </div>
              <ul className="space-y-4 mb-8 text-white/80">
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-400" /> Unlimited Barbers</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-400" /> Advanced Analytics</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-400" /> Priority Support</li>
                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-orange-400" /> Custom Services</li>
              </ul>
              <Link href="/auth/register" className="block w-full py-3 rounded-full bg-orange-500 text-black text-center font-bold hover:bg-orange-400 transition shadow-[0_0_20px_rgba(255,136,0,0.3)]">Select Growth</Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
