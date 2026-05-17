"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, User, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlowAuthStore } from "@/lib/glow-auth-store";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  
  const { login, isLoading: loading, error, clearError } = useGlowAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const auth = await login(username, password);
      // Role-based redirect
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (auth.role === "OWNER") {
        router.push("/glow/salon/dashboard");
      } else if (auth.role === "ADMIN") {
        router.push("/glow/admin/dashboard");
      } else {
        router.push("/glow/dashboard");
      }
    } catch {
      // Error is already set in the store
    }
  };

  return (
    <div className="relative overflow-hidden"
      style={{ background: "#FFFFFF", borderRadius: "80px 80px 32px 32px", border: "1px solid #E8DDD2", boxShadow: "0 8px 40px rgba(44,36,22,0.08)" }}>

      <div className="pt-10 pb-4 text-center" style={{ background: "linear-gradient(180deg, #FFF0E8, #FFFFFF)" }}>
        <div className="h-14 w-14 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{ background: "#D4864A", boxShadow: "0 4px 20px rgba(212,134,74,0.3)" }}>
          <span className="text-xl text-white">✦</span>
        </div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#2C2416" }}>Welcome Back</h2>
        <p className="text-xs mt-1" style={{ color: "#B5A090" }}>Sign in to continue your beauty journey</p>
      </div>

      <form onSubmit={handleSubmit} className="px-7 pb-8">
        
        {/* Username */}
        <div className="mb-3">
          <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: "#B5A090" }}>Username</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}><User className="h-4 w-4" /></div>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
              placeholder="tigist_glow" className="w-full h-11 pl-9 pr-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#FAF5EE", border: "1.5px solid #E8DDD2", color: "#2C2416" }}
              onFocus={e => e.currentTarget.style.borderColor = "#D4864A"}
              onBlur={e => e.currentTarget.style.borderColor = "#E8DDD2"} />
          </div>
        </div>

        {/* Password */}
        <div className="mb-2">
          <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: "#B5A090" }}>Password</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}><Lock className="h-4 w-4" /></div>
            <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter password" className="w-full h-11 pl-9 pr-10 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#FAF5EE", border: "1.5px solid #E8DDD2", color: "#2C2416" }}
              onFocus={e => e.currentTarget.style.borderColor = "#D4864A"}
              onBlur={e => e.currentTarget.style.borderColor = "#E8DDD2"} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}>
              {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end mb-4">
          <Link href="/glow/auth/forgot-password"
            className="text-[10px] font-bold transition-colors hover:underline"
            style={{ color: "#D4864A" }}>
            Forgot password?
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-3 px-4 py-2.5 rounded-xl text-xs text-center font-medium"
            style={{ background: "#FDECEE", border: "1px solid #D4847A44", color: "#C04060" }}>{error}</div>
        )}

        {/* Submit */}
        <motion.button type="submit" disabled={loading}
          className="w-full h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          style={{ background: "#2C2416", color: "#F5EFE6" }}
          whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
          {loading ? "Signing in..." : <> Sign In <ArrowRight className="h-4 w-4" /></>}
        </motion.button>

        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px" style={{ background: "#E8DDD2" }} />
          <span className="text-xs" style={{ color: "#B5A090" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "#E8DDD2" }} />
        </div>
        <p className="text-center text-sm" style={{ color: "#7A6350" }}>
          Don&apos;t have an account?{" "}
          <Link href="/glow/auth/register" className="font-bold hover:underline" style={{ color: "#D4864A" }}>Create one free</Link>
        </p>

        {/* Salon owner link */}
        <div className="mt-4 p-4 rounded-2xl text-center" style={{ background: "rgba(212,134,74,0.05)", border: "1px solid rgba(212,134,74,0.1)" }}>
          <p className="text-xs" style={{ color: "#7A6350" }}>
            Own a beauty business?{" "}
            <Link href="/glow/auth/register?role=salon" className="font-bold hover:underline" style={{ color: "#D4864A" }}>
              Register your salon →
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans bg-transparent">
      <div className="w-full max-w-[1400px] bg-[#F5EFE6] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700 min-h-[800px] border border-white/20">
        
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <Link href="/glow/discover" className="flex items-center gap-2">
            <span style={{ color: "#D4864A", fontSize: 22 }}>✦</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#2C2416" }}>GlowLink</span>
          </Link>
          <Link href="/glow/auth/register" className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "#2C2416", color: "#F5EFE6" }}>Sign Up</Link>
        </nav>

        <div className="max-w-6xl mx-auto px-6 pt-4 pb-16">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* LEFT — Hero */}
            <motion.div className="flex-1 w-full max-w-xl lg:mb-0 mb-8"
              initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 700, lineHeight: 1.05, color: "#2C2416", letterSpacing: "-0.02em" }}>
                ELEVATE<br />YOUR<br /><span style={{ fontStyle: "italic", color: "#D4864A" }}>RADIANCE</span><span style={{ color: "#D4864A", marginLeft: 8 }}>✦</span>
              </h1>
              <p className="mt-6 text-base leading-relaxed max-w-sm" style={{ color: "#7A6350" }}>
                Log in to access your curated beauty experiences, manage appointments, and connect with premium salons.
              </p>
              
              <div className="mt-10 grid grid-cols-3 gap-4">
                {[
                  { val: "800+",  label: "Salons" },
                  { val: "50K+", label: "Clients" },
                  { val: "4.9★",  label: "Rating" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-2xl text-center"
                    style={{ background: "#FFFFFF", border: "1px solid #E8DDD2", boxShadow: "0 2px 12px rgba(44,36,22,0.04)" }}>
                    <p className="text-xl font-bold" style={{ color: "#D4864A", fontFamily: "'Cormorant Garamond', serif" }}>{s.val}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#B5A090" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className="mt-8 p-4 rounded-2xl text-left"
                style={{ background: "#FFF0E8", border: "1px solid #FADEC9" }}>
                <p className="text-sm italic" style={{ color: "#7A6350" }}>
                  "GlowLink changed how I find and book my beauty appointments. Absolutely love it!"
                </p>
                <p className="text-xs font-bold mt-2" style={{ color: "#D4864A" }}>— Tigist A., Gold Member</p>
              </motion.div>
            </motion.div>

            {/* RIGHT — Login Card */}
            <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <Suspense fallback={<div className="h-64 flex items-center justify-center bg-white rounded-[32px]"><div className="animate-spin h-6 w-6 border-2 border-[#D4864A] rounded-full border-t-transparent" /></div>}>
                <LoginForm />
              </Suspense>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
