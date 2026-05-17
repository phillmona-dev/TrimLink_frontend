"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";

const CATEGORIES = ["All", "Skincare", "Haircare", "Wellness", "Trends", "Guides"];

const BLOG_POSTS = [
  { id: 1, title: "The Ultimate Guide to Achieving Glass Skin Naturally", category: "Skincare", readTime: "5 min read", img: "/glow/med_hero_main.png", featured: true, excerpt: "Discover the secrets to translucent, luminous skin using plant-based ingredients and a simple daily routine that works for all skin types." },
  { id: 2, title: "5 Hair Care Myths You Need to Stop Believing", category: "Haircare", readTime: "4 min read", img: "/glow/braiding.png", excerpt: "From washing frequency to trimming schedules, we debunk the most common hair care myths to help you achieve your healthiest hair." },
  { id: 3, title: "Why Wellness is the New Standard in Beauty", category: "Wellness", readTime: "6 min read", img: "/glow/spa.png", excerpt: "Beauty is no longer just skin deep. Explore how mental health, diet, and self-care routines are transforming the beauty industry." },
  { id: 4, title: "Top Fall Makeup Trends for 2024", category: "Trends", readTime: "3 min read", img: "/glow/makeup.png", excerpt: "Get ready for the cozy season with these stunning, warm-toned makeup looks inspired by nature's transitioning palette." },
  { id: 5, title: "How to Build a Minimalist Skincare Routine", category: "Guides", readTime: "5 min read", img: "/glow/hero.png", excerpt: "Overwhelmed by 10-step routines? Learn how to strip back your skincare to the essentials without compromising on results." },
  { id: 6, title: "The Best Essential Oils for Glowing Skin", category: "Skincare", readTime: "4 min read", img: "/glow/nails.png", excerpt: "A comprehensive breakdown of which essential oils are safe for your face and how they can boost your natural radiance." }
];

export default function BlogPage() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState("All");

  const filteredPosts = activeCat === "All" ? BLOG_POSTS.filter(p => !p.featured) : BLOG_POSTS.filter(p => p.category === activeCat && !p.featured);
  const featuredPost = activeCat === "All" ? BLOG_POSTS.find(p => p.featured) : null;

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans text-[#5c443b] bg-transparent">
      <div className="w-full max-w-[1400px] bg-white rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700">
        
        {/* ════════════ HEADER ════════════ */}
        <div className="bg-[#FDF6F0] px-6 py-6 md:px-16 lg:px-24">
          <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} 
            className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => router.back()} className="text-[#8e5238] font-bold text-2xl flex items-center gap-1 hover:opacity-80 transition">
                <ArrowLeft className="h-6 w-6 mr-2" /> Glow <span className="text-xl">🌸</span> Link
              </button>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#8e5238]">
              <Link href="/glow/discover" className="hover:opacity-70 transition">Home</Link>
              <Link href="/glow/about" className="hover:opacity-70 transition">About</Link>
              <Link href="/glow/shop" className="hover:opacity-70 transition">Products</Link>
              <Link href="/glow/blog" className="opacity-70 transition">Blog</Link>
            </nav>
            
            <Link href="/glow/search" 
              className="px-6 py-2.5 rounded-md text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(to right, #9e5d41, #854931)", boxShadow: "0 4px 14px rgba(158,93,65,0.3)" }}>
              Book Now
            </Link>
          </motion.header>
        </div>

        {/* ════════════ BLOG HERO / FEATURED ════════════ */}
        <div className="bg-[#FDF6F0] px-6 py-12 md:px-16 lg:px-24 pb-20 border-b border-[#e8cdb9]">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1 variants={fadeInUp} className="text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(48px, 6vw, 64px)", fontWeight: 700, lineHeight: 1.1 }}>
              The Beauty Editorial
            </motion.h1>
            <motion.p variants={fadeInUp} className="mt-4 text-[16px] leading-relaxed text-[#8e5238] font-medium">
              Discover the latest trends, expert advice, and inside stories from the world of premium beauty and wellness.
            </motion.p>
          </motion.div>

          {/* Categories */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-3 mb-16">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                className="px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide transition-all duration-300"
                style={{ 
                  background: activeCat === cat ? "#9e5d41" : "white", 
                  color: activeCat === cat ? "white" : "#8e5238",
                  border: `1px solid ${activeCat === cat ? "transparent" : "#e8cdb9"}`,
                  boxShadow: activeCat === cat ? "0 4px 14px rgba(158,93,65,0.3)" : "none"
                }}>
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Featured Article */}
          {featuredPost && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="group cursor-pointer bg-white rounded-[32px] overflow-hidden shadow-xl border border-[#f0e4db] flex flex-col md:flex-row h-auto md:h-[450px]">
              <div className="relative w-full md:w-1/2 h-[300px] md:h-full overflow-hidden">
                <Image src={featuredPost.img} alt={featuredPost.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-[#9e5d41] shadow-sm">
                  Featured
                </div>
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-xs font-bold text-[#b08d7e] uppercase tracking-wider mb-4">
                  <span className="text-[#e5a02e]">{featuredPost.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featuredPost.readTime}</span>
                </div>
                <h2 className="text-[#3c2a23] mb-4 group-hover:text-[#9e5d41] transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, lineHeight: 1.1 }}>
                  {featuredPost.title}
                </h2>
                <p className="text-[#8e5238] leading-relaxed mb-8 text-sm md:text-base line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-[#9e5d41] uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                  Read Article <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ════════════ RECENT ARTICLES GRID ════════════ */}
        <div className="bg-[#fcf7f4] px-6 py-20 md:px-16 lg:px-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {filteredPosts.map((post, i) => (
              <motion.div key={post.id} variants={fadeInUp} 
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-[#f0e4db] transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <div className="relative h-64 w-full overflow-hidden">
                  <Image src={post.img} alt={post.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-[#9e5d41] shadow-sm">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#b08d7e] uppercase tracking-wider mb-3">
                    <Clock className="h-3.5 w-3.5" /> {post.readTime}
                  </div>
                  <h3 className="text-[#3c2a23] text-2xl font-bold mb-3 group-hover:text-[#9e5d41] transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}>
                    {post.title}
                  </h3>
                  <p className="text-[#8e5238] text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-[12px] font-bold text-[#9e5d41] uppercase tracking-wider group-hover:translate-x-2 transition-transform duration-300">
                    Read More <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredPosts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-xl text-[#8e5238] font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No articles found in this category yet.</p>
              </div>
            )}
            
          </motion.div>
          
          {filteredPosts.length > 0 && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-16 text-center">
              <button className="px-10 py-3.5 rounded-md text-[#9e5d41] text-sm font-bold bg-white border border-[#e8cdb9] hover:bg-[#FDF6F0] transition shadow-sm">
                Load More Articles
              </button>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
