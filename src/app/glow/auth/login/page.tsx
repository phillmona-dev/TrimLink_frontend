"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, ArrowLeft, User, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlowAuthStore } from "@/lib/glow-auth-store";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading: loading, error, clearError } = useGlowAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const auth = await login(username, password);
      // Role-based redirect
      if (auth.role === "OWNER") {
        router.push("/glow/salon/dashboard");
      } else {
        router.push("/glow/dashboard");
      }
    } catch {
      // Error is already set in the store
    }
  };

  const beautyCards = [
    { emoji: "💅", label: "Nail Art",    c1: "#C8956C", c2: "#E8B4A0", top: "8%",  left: "5%" },
    { emoji: "✂️",  label: "Hair Salon", c1: "#EC4899", c2: "#F9A8D4", top: "22%", left: "68%" },
    { emoji: "🌸", label: "Skincare",    c1: "#8B5CF6", c2: "#C4B5FD", top: "55%", left: "8%" },
    { emoji: "💆", label: "Spa",         c1: "#10B981", c2: "#6EE7B7", top: "70%", left: "62%" },
    { emoji: "👄", label: "Makeup",      c1: "#F43F5E", c2: "#FDA4AF", top: "38%", left: "78%" },
  ];

  return (
    <div className="min-h-screen w-full flex">
      {/* ── LEFT PANEL (desktop only) ─────────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[20%] w-72 h-72 rounded-full animate-blob"
            style={{ background: "radial-gradient(circle, rgba(200,149,108,0.3), transparent 70%)", filter: "blur(40px)", animationDuration: "12s" }} />
          <div className="absolute bottom-[15%] right-[10%] w-64 h-64 rounded-full animate-blob"
            style={{ background: "radial-gradient(circle, rgba(232,121,249,0.2), transparent 70%)", filter: "blur(50px)", animationDelay: "5s", animationDuration: "16s" }} />
          <div className="absolute top-[50%] left-[5%] w-48 h-48 rounded-full animate-blob"
            style={{ background: "radial-gradient(circle, rgba(129,140,248,0.2), transparent 70%)", filter: "blur(40px)", animationDelay: "8s", animationDuration: "14s" }} />
        </div>

        {/* Floating category badges */}
        {beautyCards.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.6, y: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 } }}
            className="absolute flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ top: c.top, left: c.left, background: `linear-gradient(135deg, ${c.c1}22, ${c.c2}15)`, border: `1px solid ${c.c1}44`, backdropFilter: "blur(12px)", zIndex: 10 }}>
            <span className="text-xl">{c.emoji}</span>
            <span className="text-xs font-black text-white">{c.label}</span>
          </motion.div>
        ))}

        {/* Main copy */}
        <div className="relative z-10 text-center max-w-sm">
          {/* Logo mark */}
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.23,1,0.32,1] }}
            className="mb-8 h-20 w-20 mx-auto rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: "0 0 50px rgba(200,149,108,0.5), 0 0 100px rgba(200,149,108,0.2)" }}>
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
            className="text-5xl font-black font-editorial text-white mb-4 leading-[1.1]">
            Your Beauty,<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #FBBF24, #F472B6, #C8956C)" }}>Elevated.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
            className="text-base font-medium leading-relaxed" style={{ color: "rgba(253,246,238,0.65)" }}>
            Book top salons, track your beauty journey,<br />and earn rewards with every visit.
          </motion.p>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-10 grid grid-cols-3 gap-4">
            {[
              { val: "800+",  label: "Salons" },
              { val: "50K+", label: "Clients" },
              { val: "4.9★",  label: "Rating" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-2xl text-center"
                style={{ background: "rgba(200,149,108,0.08)", border: "1px solid rgba(200,149,108,0.15)" }}>
                <p className="text-xl font-black font-editorial" style={{ color: "#C8956C" }}>{s.val}</p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(253,246,238,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-6 p-4 rounded-2xl text-left"
            style={{ background: "rgba(200,149,108,0.06)", border: "1px solid rgba(200,149,108,0.12)" }}>
            <p className="text-sm italic" style={{ color: "rgba(253,246,238,0.7)" }}>
              "GlowLink changed how I find and book my beauty appointments. Absolutely love it!"
            </p>
            <p className="text-xs font-bold mt-2" style={{ color: "#C8956C" }}>— Tigist A., Gold Member</p>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Login Form ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <motion.div className="w-full max-w-md rounded-[2rem] overflow-hidden relative"
          style={{ background: "rgba(15,8,24,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(200,149,108,0.18)" }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Shimmer top line */}
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(200,149,108,0.6), transparent)" }} />
          {/* Ambient glow behind form */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full -translate-y-1/2 opacity-30"
            style={{ background: "radial-gradient(circle, rgba(200,149,108,0.6), transparent 70%)", filter: "blur(30px)" }} />

          <div className="p-8 md:p-10 relative">
            {/* Back + Brand */}
            <div className="flex items-center gap-3 mb-10">
              <Link href="/glow/discover"
                className="p-2 rounded-xl transition-all"
                style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.6)" }}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: "0 0 16px rgba(200,149,108,0.4)" }}>
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-black font-editorial text-lg">
                  <span className="gradient-text">Glow</span><span className="text-white">Link</span>
                </span>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-black text-white font-editorial mb-1">Welcome back</h1>
            <p className="text-sm mb-8" style={{ color: "rgba(253,246,238,0.45)" }}>
              Sign in to continue your beauty journey ✨
            </p>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 px-4 py-3 rounded-2xl text-sm font-medium"
                style={{ background: "rgba(220,80,100,0.12)", border: "1px solid rgba(220,80,100,0.3)", color: "#f87171" }}>
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username */}
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors"
                  style={{ color: "rgba(200,149,108,0.6)" }} />
                <input
                  type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full h-14 pl-11 pr-4 rounded-2xl text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
                  style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)" }}
                  onFocus={e => { e.currentTarget.style.border = "1.5px solid rgba(200,149,108,0.55)"; e.currentTarget.style.background = "rgba(253,246,238,0.07)"; }}
                  onBlur={e => { e.currentTarget.style.border = "1px solid rgba(200,149,108,0.15)"; e.currentTarget.style.background = "rgba(253,246,238,0.05)"; }}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "rgba(200,149,108,0.6)" }} />
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-14 pl-11 pr-12 rounded-2xl text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
                  style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)" }}
                  onFocus={e => { e.currentTarget.style.border = "1.5px solid rgba(200,149,108,0.55)"; e.currentTarget.style.background = "rgba(253,246,238,0.07)"; }}
                  onBlur={e => { e.currentTarget.style.border = "1px solid rgba(200,149,108,0.15)"; e.currentTarget.style.background = "rgba(253,246,238,0.05)"; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition"
                  style={{ color: "rgba(253,246,238,0.3)" }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Forgot */}
              <div className="flex justify-end -mt-1">
                <Link href="/glow/auth/forgot-password"
                  className="text-xs font-semibold transition-colors hover:text-white"
                  style={{ color: "rgba(200,149,108,0.7)" }}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={loading}
                className="relative w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest text-[#1A0F1E] overflow-hidden mt-1 disabled:opacity-60"
                style={{ background: loading ? "rgba(200,149,108,0.5)" : "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: loading ? "none" : "0 0 35px rgba(200,149,108,0.4), 0 4px 20px rgba(200,149,108,0.3)" }}
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: loading ? 1 : 0.985 }}>
                {!loading && <div className="absolute inset-0 shimmer-overlay" />}
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-[#1A0F1E]/40 border-t-[#1A0F1E] rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : "Sign In"}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ background: "rgba(200,149,108,0.12)" }} />
              <span className="text-xs" style={{ color: "rgba(253,246,238,0.25)" }}>or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(200,149,108,0.12)" }} />
            </div>

            {/* Register link */}
            <p className="text-center text-sm" style={{ color: "rgba(253,246,238,0.45)" }}>
              Don't have an account?{" "}
              <Link href="/glow/auth/register" className="font-bold transition-colors hover:text-white" style={{ color: "#C8956C" }}>
                Create one free
              </Link>
            </p>

            {/* Salon owner link */}
            <div className="mt-4 p-4 rounded-2xl text-center" style={{ background: "rgba(200,149,108,0.05)", border: "1px solid rgba(200,149,108,0.1)" }}>
              <p className="text-xs" style={{ color: "rgba(253,246,238,0.35)" }}>
                Own a beauty business?{" "}
                <Link href="/glow/auth/register?role=salon" className="font-bold" style={{ color: "#C8956C" }}>
                  Register your salon →
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
