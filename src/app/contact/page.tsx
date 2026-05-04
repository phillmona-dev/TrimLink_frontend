import { PublicLayout } from "@/layouts/public-layout";
import { AnimatedBackground } from "@/components/common/animated-background";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact Us — TrimLink",
  description: "Get in touch with the TrimLink support team.",
};

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen w-full flex flex-col items-center p-6 md:p-12 relative overflow-hidden text-white">
        <AnimatedBackground />
        
        <div className="w-full max-w-3xl relative z-10 pt-20">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)] rounded-[2.5rem] p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black mb-8 tracking-tight text-white/90">Contact Us</h1>
            
            <p className="text-white/70 text-lg mb-12">
              Have questions about TrimLink, need help setting up your barbershop, or want to report an issue? We're here to help. Reach out to us through any of the channels below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">Phone</h3>
                <div className="text-white/60 space-y-1">
                  <p>0962608563</p>
                  <p>0948560005</p>
                </div>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/10 rounded-3xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-bold text-lg mb-2">Email</h3>
                <p className="text-white/60">phillipos1212@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
