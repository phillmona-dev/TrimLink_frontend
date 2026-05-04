import { PublicLayout } from "@/layouts/public-layout";
import { AnimatedBackground } from "@/components/common/animated-background";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — TrimLink",
  description: "TrimLink Privacy Policy and Data Protection guidelines.",
};

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 relative overflow-hidden text-white">
        <AnimatedBackground />
        
        <div className="w-full max-w-3xl relative z-10 pt-20">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-white/90">Privacy Policy</h1>
            <div className="space-y-6 text-white/70 leading-relaxed text-base">
              <h2 className="text-xl font-bold text-white/90">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, profile picture, and payment information.</p>
              
              <h2 className="text-xl font-bold text-white/90 mt-6">2. How We Use Information</h2>
              <p>We use the information we collect to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide customer support, and develop new features.</p>

              <h2 className="text-xl font-bold text-white/90 mt-6">3. Data Security</h2>
              <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
