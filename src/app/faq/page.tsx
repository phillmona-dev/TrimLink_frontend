import { PublicLayout } from "@/layouts/public-layout";
import { AnimatedBackground } from "@/components/common/animated-background";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "FAQ — TrimLink",
  description: "Frequently asked questions about TrimLink.",
};

export default function FAQPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 relative overflow-hidden text-white">
        <AnimatedBackground />
        
        <div className="w-full max-w-3xl relative z-10 pt-20">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-white/90">Frequently Asked Questions</h1>
            
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-xl font-bold text-white mb-2">How do I book an appointment?</h3>
                <p className="text-white/60">Simply search for a barber or shop, select a service, pick an available time slot, and confirm your booking. You'll receive a notification once the barber accepts it.</p>
              </div>
              
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-xl font-bold text-white mb-2">How do I register my barbershop?</h3>
                <p className="text-white/60">Click on "Register Shop" or go to the pricing page to select a plan. Once registered, you'll have access to the Owner Dashboard where you can add staff and services.</p>
              </div>

              <div className="pb-6">
                <h3 className="text-xl font-bold text-white mb-2">Is payment processed through the app?</h3>
                <p className="text-white/60">Currently, we support attaching proof of payment (like a transfer receipt) during the booking process. The barber will verify this before confirming your appointment.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
