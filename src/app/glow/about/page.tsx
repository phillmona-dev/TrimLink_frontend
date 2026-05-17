"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, Heart, Leaf, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  const router = useRouter();
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans text-[#5c443b] bg-transparent">
      <div className="w-full max-w-[1400px] bg-white rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700">
        
        {/* ════════════ HEADER & HERO SECTION ════════════ */}
        <div className="bg-[#FDF6F0] px-6 py-6 md:px-16 lg:px-24">
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} 
            className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()} className="text-[#8e5238] font-bold text-2xl flex items-center gap-1 hover:opacity-80 transition">
                <ArrowLeft className="h-6 w-6 mr-2" /> Glow <span className="text-xl">🌸</span> Link
              </button>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#8e5238]">
              <Link href="/glow/discover" className="hover:opacity-70 transition">Home</Link>
              <Link href="/glow/about" className="opacity-70 transition">About</Link>
              <Link href="/glow/shop" className="hover:opacity-70 transition">Products</Link>
              <Link href="/glow/blog" className="hover:opacity-70 transition">Blog</Link>
            </nav>
            
            <Link href="/glow/search" 
              className="px-6 py-2.5 rounded-md text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(to right, #9e5d41, #854931)", boxShadow: "0 4px 14px rgba(158,93,65,0.3)" }}>
              Book Now
            </Link>
          </motion.header>

          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col lg:flex-row items-center gap-16 pb-20">
            <motion.div variants={fadeInUp} className="flex-1 w-full relative z-10">
              <h1 className="text-[#8e5238]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(42px, 5vw, 64px)", fontWeight: 700, lineHeight: 1.1 }}>
                Redefining Beauty<br />Standards
              </h1>
              <p className="mt-6 text-[15px] leading-relaxed max-w-md text-[#8e5238] opacity-90">
                GlowLink was founded on a simple belief: everyone deserves to feel confident in their own skin. We bridge the gap between premium beauty professionals and those seeking exceptional care.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex-1 w-full relative h-[400px]">
              <div className="absolute top-0 right-0 w-[80%] h-full rounded-[40px] overflow-hidden shadow-xl z-20"
                style={{ borderTopRightRadius: "80px", borderBottomLeftRadius: "80px" }}>
                <Image src="/glow/hero.png" alt="Our Story" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full border-[8px] border-[#FDF6F0] overflow-hidden z-30 shadow-lg">
                <Image src="/glow/spa.png" alt="Spa" fill className="object-cover" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ════════════ SECTION: OUR MISSION ════════════ */}
        <div className="bg-white px-6 py-24 md:px-16 lg:px-24 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="max-w-3xl mx-auto">
            <motion.h2 variants={fadeInUp} className="text-[#3c2a23] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", fontWeight: 700 }}>
              Our Mission
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg leading-relaxed text-[#8e5238]">
              "To empower individuals through accessible, premium beauty services, while providing beauty professionals with the platform they need to thrive and grow their businesses."
            </motion.p>
          </motion.div>
        </div>

        {/* ════════════ SECTION: OUR VALUES ════════════ */}
        <div className="bg-[#fcf7f4] px-6 py-24 md:px-16 lg:px-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", fontWeight: 700 }}>
              What We Stand For
            </motion.h2>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: <Heart className="h-8 w-8 text-[#9e5d41]" />, title: "Community First", desc: "We build strong relationships between salons and clients, fostering a supportive beauty community." },
              { icon: <Leaf className="h-8 w-8 text-[#9e5d41]" />, title: "Sustainable Beauty", desc: "We encourage eco-friendly practices and highlight salons that use natural, sustainable products." },
              { icon: <ShieldCheck className="h-8 w-8 text-[#9e5d41]" />, title: "Verified Quality", desc: "Every salon on our platform is vetted to ensure you receive the highest standard of care." }
            ].map((v, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-white p-8 rounded-2xl shadow-sm border border-[#f0e4db] text-center hover:-translate-y-2 transition-transform duration-300">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-[#FDF6F0] flex items-center justify-center mb-6 border border-[#e8cdb9]">
                  {v.icon}
                </div>
                <h3 className="font-bold text-[#3c2a23] text-xl mb-3">{v.title}</h3>
                <p className="text-sm text-[#8e5238] leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ════════════ SECTION: MEET THE TEAM ════════════ */}
        <div className="bg-white px-6 py-24 md:px-16 lg:px-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", fontWeight: 700 }}>
              The Faces Behind GlowLink
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { img: "/glow/braiding.png", name: "Sara Tesfaye", role: "Founder & CEO" },
              { img: "/glow/makeup.png", name: "Meron Haile", role: "Head of Operations" },
              { img: "/glow/nails.png", name: "Hanna Bekele", role: "Community Director" }
            ].map((t, i) => (
              <motion.div key={i} variants={fadeInUp} className="text-center">
                <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-4 shadow-lg border-4 border-[#FDF6F0]">
                  <Image src={t.img} alt={t.name} width={200} height={200} className="object-cover w-full h-full" />
                </div>
                <h3 className="font-bold text-[#3c2a23] text-lg">{t.name}</h3>
                <p className="text-sm text-[#9e5d41] font-semibold">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
