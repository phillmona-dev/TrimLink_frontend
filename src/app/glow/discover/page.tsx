"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Play, CheckCircle2, Star, Calendar, MapPin, Search } from "lucide-react";

export default function DiscoverPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
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
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans text-[#5c443b] overflow-hidden bg-transparent">
      {/* Main Container - Floating Opaque App */}
      <div className="w-full max-w-[1400px] bg-white rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700">
        
        {/* ════════════ HEADER & HERO SECTION (#FDF6F0 background) ════════════ */}
        <div className="bg-[#FDF6F0] px-6 py-6 md:px-16 lg:px-24">
          
          {/* Header */}
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} 
            className="flex items-center justify-between mb-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link href="/glow/discover" className="text-[#8e5238] font-bold text-2xl flex items-center gap-1 hover:opacity-80 transition">
                Glow <span className="text-xl">🌸</span> Link
              </Link>
            </div>
            
            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#8e5238]">
              <Link href="/glow/discover" className="hover:opacity-70 transition">Home</Link>
              <Link href="/glow/about" className="hover:opacity-70 transition">About</Link>
              <Link href="/glow/shop" className="hover:opacity-70 transition">Products</Link>
              <Link href="/glow/blog" className="hover:opacity-70 transition">Blog</Link>
            </nav>
            
            {/* CTA */}
            <div className="flex items-center gap-3">
              <Link href="/glow/auth/login"
                className="px-6 py-2.5 rounded-md text-sm font-bold transition hover:opacity-90"
                style={{ color: "#854931", border: "1.5px solid #854931" }}>
                Login
              </Link>
              <Link href="/glow/auth/register" 
                className="px-6 py-2.5 rounded-md text-sm font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(to right, #9e5d41, #854931)", boxShadow: "0 4px 14px rgba(158,93,65,0.3)" }}>
                Get Started Free
              </Link>
            </div>
          </motion.header>

          {/* Hero Content */}
          <div className="flex flex-col lg:flex-row items-center gap-12 pb-20">
            {/* Left Column */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex-1 w-full relative z-10">
              <motion.h1 variants={fadeInUp} className="text-[#8e5238]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 6vw, 76px)", fontWeight: 700, lineHeight: 1.1 }}>
                Glow Naturally,<br />Shine Confidently
              </motion.h1>
              <motion.p variants={fadeInUp} className="mt-6 text-[15px] leading-relaxed max-w-md text-[#8e5238] opacity-90">
                Transform your look with the finest salons and specialists. Seamlessly book your next appointment and discover premium beauty experiences.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex items-center gap-6 mt-10">
                <Link href="/glow/explore" className="px-8 py-3 rounded-md text-white text-sm font-bold flex items-center gap-2 transition hover:opacity-90"
                  style={{ background: "linear-gradient(to right, #9e5d41, #854931)", boxShadow: "0 4px 14px rgba(158,93,65,0.3)" }}>
                  Book Now
                </Link>
                
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {/* Avatars */}
                    <div className="h-10 w-10 rounded-full border-2 border-[#FDF6F0] overflow-hidden relative">
                      <Image src="/glow/spa.png" alt="User" fill className="object-cover" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-[#FDF6F0] overflow-hidden relative">
                      <Image src="/glow/makeup.png" alt="User" fill className="object-cover" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-[#FDF6F0] overflow-hidden relative">
                      <Image src="/glow/nails.png" alt="User" fill className="object-cover" />
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-[#FDF6F0] bg-[#e8cdb9] flex items-center justify-center text-xs font-bold text-[#8e5238] relative z-10">
                      +2k
                    </div>
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-[#e5a02e]">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-current" />)}
                    </div>
                    <p className="text-xs font-bold mt-1 text-[#8e5238]">15,725+ loving customers</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Image Composition */}
            <div className="flex-1 w-full relative h-[500px]">
              {/* Decorative Elements */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="absolute top-10 left-10 text-[#c28468] text-2xl">✦</motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-10 left-20 text-[#c28468] text-3xl">✦</motion.div>
              
              {/* Main Image */}
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                className="absolute top-0 right-10 w-[70%] h-[70%] rounded-[40px] overflow-hidden border-[6px] border-[#FDF6F0] shadow-xl z-20"
                style={{ borderTopRightRadius: "80px", borderBottomLeftRadius: "80px" }}>
                <Image src="/glow/med_hero_main.png" alt="Serum application" fill className="object-cover" />
              </motion.div>
              
              {/* Small Image Bottom Left */}
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="absolute bottom-10 left-0 w-[45%] h-[40%] rounded-[30px] overflow-hidden border-[6px] border-[#FDF6F0] shadow-lg z-30">
                <Image src="/glow/makeup.png" alt="Product" fill className="object-cover" />
              </motion.div>
              
              {/* Small Image Bottom Right */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute bottom-0 right-0 w-[55%] h-[45%] rounded-[30px] overflow-hidden border-[6px] border-[#FDF6F0] shadow-lg z-10">
                <Image src="/glow/spa.png" alt="Product" fill className="object-cover" />
              </motion.div>
              
            </div>
          </div>
        </div>

        {/* ════════════ SECTION: HEALTHY SKIN IS BEAUTIFUL SKIN ════════════ */}
        <div className="bg-white px-6 py-24 md:px-16 lg:px-24 overflow-hidden">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} 
            className="flex flex-col md:flex-row items-center gap-16">
            
            {/* Left Image */}
            <motion.div variants={fadeInUp} className="flex-1 w-full">
              <div className="relative w-full aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-lg bg-[#f9ebe2]">
                <Image src="/glow/hero.png" alt="Woman touching face" fill className="object-cover" />
                {/* Simulated frame overlay */}
                <div className="absolute inset-4 border border-[#e8cdb9] rounded-2xl pointer-events-none opacity-50" />
              </div>
            </motion.div>
            
            {/* Right Content */}
            <motion.div variants={staggerContainer} className="flex-1 w-full">
              <motion.h2 variants={fadeInUp} className="text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "42px", fontWeight: 700, lineHeight: 1.1 }}>
                Because Healthy Skin Is<br />Beautiful Skin
              </motion.h2>
              <motion.p variants={fadeInUp} className="mt-4 text-[#8e5238] font-medium">
                We believe in natural beauty powered by top-tier specialists.
              </motion.p>
              
              <motion.div variants={staggerContainer} className="mt-8 space-y-4">
                {[
                  "Find experts for all skin & hair types",
                  "Verified reviews & ratings",
                  "Secure, instant booking",
                  "Loyalty points on every visit"
                ].map((item, i) => (
                  <motion.div variants={fadeInUp} key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-[#9e5d41] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-[#6d4536]">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
              
              <motion.div variants={fadeInUp} className="mt-10">
                <Link href="/glow/explore" className="inline-block px-8 py-3 rounded-md text-white text-sm font-bold transition hover:opacity-90"
                  style={{ background: "linear-gradient(to right, #9e5d41, #854931)", boxShadow: "0 4px 14px rgba(158,93,65,0.3)" }}>
                  Explore Services
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* ════════════ SECTION: HOW IT WORKS (BOOKING) ════════════ */}
        <div className="bg-[#FDF6F0] px-6 py-24 md:px-16 lg:px-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2 variants={fadeInUp} className="text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "42px", fontWeight: 700 }}>
              Seamless Booking Experience
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-sm mt-4 text-[#8e5238]">Find your perfect salon, choose your specialist, and book your appointment in seconds.</motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                icon: <Search className="h-8 w-8 text-[#9e5d41]" />, 
                step: "01",
                title: "Discover Salons", 
                desc: "Browse hundreds of premium salons and spas near you with verified reviews." 
              },
              { 
                icon: <Calendar className="h-8 w-8 text-[#9e5d41]" />, 
                step: "02",
                title: "Pick a Time", 
                desc: "View real-time availability and select a specialist that fits your schedule." 
              },
              { 
                icon: <CheckCircle2 className="h-8 w-8 text-[#9e5d41]" />, 
                step: "03",
                title: "Book Instantly", 
                desc: "Confirm your booking instantly. Manage or reschedule directly from your dashboard." 
              }
            ].map((s, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-[#f0e4db] relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -right-4 -top-4 text-7xl font-black text-[#FDF6F0] opacity-50 group-hover:opacity-100 transition-opacity z-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {s.step}
                </div>
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-[#FDF6F0] flex items-center justify-center mb-6 border border-[#e8cdb9]">
                    {s.icon}
                  </div>
                  <h3 className="font-bold text-[#3c2a23] text-xl mb-3">{s.title}</h3>
                  <p className="text-sm text-[#8e5238] leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mt-16 text-center">
             <Link href="/glow/explore" className="inline-flex px-10 py-4 rounded-md text-white text-sm font-bold transition hover:opacity-90 shadow-lg"
                style={{ background: "linear-gradient(to right, #9e5d41, #854931)" }}>
                Start Booking Now
              </Link>
          </motion.div>
        </div>

        {/* ════════════ SECTION: WHAT MAKES US DIFFERENT ════════════ */}
        <div className="bg-[#fcf7f4] px-6 py-24 md:px-16 lg:px-24 overflow-hidden">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} 
            className="flex flex-col md:flex-row items-center gap-16">
            <motion.div variants={staggerContainer} className="flex-1">
              <motion.h2 variants={fadeInUp} className="text-[#3c2a23] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", fontWeight: 700, lineHeight: 1.1 }}>
                What Makes Our Platform<br />Different
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-sm text-[#8e5238] mb-8">Not just a booking app, it&apos;s a beauty lifestyle.</motion.p>
              
              <motion.div variants={staggerContainer} className="space-y-4">
                {[
                  "Exclusive offers for members",
                  "Earn points on every appointment",
                  "Personalized service recommendations",
                  "Direct messaging with specialists",
                  "Free cancellation up to 2 hours before"
                ].map((item, i) => (
                  <motion.div variants={fadeInUp} key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-white border border-[#9e5d41] flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-[#9e5d41]" />
                    </div>
                    <span className="text-sm font-semibold text-[#6d4536]">{item}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex-1 w-full">
              <div className="relative w-[80%] aspect-[4/5] ml-auto rounded-t-full rounded-b-xl overflow-hidden shadow-xl border-[6px] border-white">
                <Image src="/glow/spa.png" alt="Glowing skin" fill className="object-cover" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ════════════ SECTION: TESTIMONIALS ════════════ */}
        <div className="bg-white px-6 py-20 md:px-16 lg:px-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-12">
            <motion.h2 variants={fadeInUp} className="text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "36px", fontWeight: 700 }}>
              What Glow Lovers Are Saying
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-sm mt-2 text-[#8e5238]">Trusted by 50,000+ happy users worldwide.</motion.p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Adeline", img: "/glow/braiding.png", txt: '"Finding a good stylist used to be a nightmare. GlowLink makes it incredibly easy to see availability and book instantly. Love the loyalty points too!"' },
              { name: "Sofia", img: "/glow/hero.png", txt: '"I travel often and this app is a lifesaver. I can always find highly-rated spas near me, and the interface is absolutely beautiful."' }
            ].map((t, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} transition={{ delay: i * 0.2 }} 
                className="bg-[#FDF6F0] p-8 rounded-2xl shadow-sm border border-[#e8cdb9]">
                <div className="flex gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 relative border border-white">
                    <Image src={t.img} alt={t.name} fill className="object-cover" />
                  </div>
                  <p className="text-sm text-[#8e5238] italic leading-relaxed">{t.txt}</p>
                </div>
                <div className="flex justify-between items-center border-t border-[#e8cdb9] pt-4">
                  <div className="flex gap-0.5 text-[#e5a02e]">
                    {[1,2,3,4,5].map(star => <Star key={star} className="h-3 w-3 fill-current" />)}
                  </div>
                  <span className="font-bold text-[#3c2a23] font-serif text-lg">{t.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
