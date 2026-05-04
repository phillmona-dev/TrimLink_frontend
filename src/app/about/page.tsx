import { PublicLayout } from "@/layouts/public-layout";
import { AnimatedBackground } from "@/components/common/animated-background";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "About Us — TrimLink",
  description: "Learn more about TrimLink, Ethiopia's premier barbershop booking platform.",
};

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 relative overflow-hidden text-white">
        <AnimatedBackground />
        
        <div className="w-full max-w-3xl relative z-10 pt-20">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-white/90">About TrimLink</h1>
            <div className="space-y-6 text-white/70 leading-relaxed text-lg">
              <p>
                TrimLink is Ethiopia's premier platform for discovering top-tier barbershops and seamlessly booking your next appointment. 
              </p>
              <p>
                Our mission is to bridge the gap between talented grooming professionals and clients seeking premium services. 
                Whether you need a quick fade, a classic cut, or a complete grooming experience, TrimLink makes finding the right barber effortless.
              </p>
              <p>
                We provide barbers and shop owners with powerful tools to manage their schedules, engage with their clients, and grow their businesses, all within a beautiful, modern interface.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
