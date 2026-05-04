import { PublicLayout } from "@/layouts/public-layout";
import { AnimatedBackground } from "@/components/common/animated-background";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service — TrimLink",
  description: "Terms and conditions for using TrimLink.",
};

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 relative overflow-hidden text-white">
        <AnimatedBackground />
        
        <div className="w-full max-w-3xl relative z-10 pt-20">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-white/90">Terms of Service</h1>
            <div className="space-y-6 text-white/70 leading-relaxed text-base">
              <p>Welcome to TrimLink. By using our platform, you agree to these terms.</p>
              
              <h2 className="text-xl font-bold text-white/90 mt-6">1. Acceptance of Terms</h2>
              <p>By accessing and using TrimLink, you accept and agree to be bound by the terms and provision of this agreement.</p>
              
              <h2 className="text-xl font-bold text-white/90 mt-6">2. User Accounts</h2>
              <p>If you create an account on the platform, you are responsible for maintaining the security of your account, and you are fully responsible for all activities that occur under the account.</p>

              <h2 className="text-xl font-bold text-white/90 mt-6">3. Bookings and Cancellations</h2>
              <p>Users are expected to honor their booking commitments. Shops reserve the right to enforce their own cancellation policies, which will be clearly displayed during the booking process.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
