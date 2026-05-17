"use client";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, CheckCircle2, User, Phone, Lock, Building2, AtSign, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlowAuthStore } from "@/lib/glow-auth-store";

function RegisterForm() {
  const params = useSearchParams();
  const initRole = params.get("role") === "salon" ? "OWNER" : "CUSTOMER";
  const [role, setRole] = useState(initRole);
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", username: "", phone: "", password: "", confirmPassword: "", shopName: "", city: "", address: "" });
  const router = useRouter();
  const { register, registerSalon, isLoading: loading, error, clearError } = useGlowAuthStore();
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError();
    if (form.password !== form.confirmPassword) return alert("Passwords don't match");
    
    try { 
      if (role === "OWNER") {
        await registerSalon({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          phoneNumber: form.phone,
          password: form.password,
          shopName: form.shopName,
          city: form.city || "Addis Ababa",
          address: form.address || "Unknown",
          platform: "GLOWLINK"
        });
      } else {
        await register({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          phoneNumber: form.phone,
          password: form.password
        });
      }
      setDone(true); 
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans bg-transparent">
        <div className="w-full max-w-[1400px] bg-[#F5EFE6] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700 min-h-[800px] border border-white/20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="h-20 w-20 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ background: "#D4864A", boxShadow: "0 8px 32px rgba(212,134,74,0.3)" }}>
            <CheckCircle2 className="h-10 w-10 text-white" />
          </motion.div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, color: "#2C2416" }}>You&apos;re In!</h3>
          <p className="text-sm mt-2 mb-6" style={{ color: "#7A6350" }}>Your GlowLink account is ready.</p>
          <button onClick={() => router.push("/glow/auth/login")}
            className="px-8 py-3 rounded-full font-bold text-sm" style={{ background: "#2C2416", color: "#F5EFE6" }}>
            Sign In Now <ArrowRight className="h-4 w-4 inline ml-1" />
          </button>
        </motion.div>
        </div>
      </div>
    );
  }

  const fields = [
    { key: "firstName", label: "First Name", icon: <User className="h-4 w-4" />, ph: "Tigist", type: "text" },
    { key: "lastName", label: "Last Name", icon: <User className="h-4 w-4" />, ph: "Alemayehu", type: "text" },
    { key: "phone", label: "Phone", icon: <Phone className="h-4 w-4" />, ph: "+251 91 234 5678", type: "text" },
    { key: "username", label: "Username", icon: <AtSign className="h-4 w-4" />, ph: "tigist_glow", type: "text" },
    { key: "password", label: "Password", icon: <Lock className="h-4 w-4" />, ph: "Create a password", type: showPw ? "text" : "password" },
    { key: "confirmPassword", label: "Confirm Password", icon: <Lock className="h-4 w-4" />, ph: "Confirm password", type: showPw ? "text" : "password" },
  ];

  return (
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans bg-transparent">
      <div className="w-full max-w-[1400px] bg-[#F5EFE6] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700 min-h-[800px] border border-white/20">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/glow/discover" className="flex items-center gap-2">
          <span style={{ color: "#D4864A", fontSize: 22 }}>✦</span>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#2C2416" }}>GlowLink</span>
        </Link>
        <Link href="/glow/auth/login" className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "#2C2416", color: "#F5EFE6" }}>Sign In</Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-4 pb-16">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">

          {/* LEFT — Hero */}
          <motion.div className="flex-1 w-full max-w-xl lg:sticky lg:top-24"
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 700, lineHeight: 1.05, color: "#2C2416", letterSpacing: "-0.02em" }}>
              START YOUR<br /><span style={{ fontStyle: "italic", color: "#D4864A" }}>GLOW</span><br />TODAY<span style={{ color: "#D4864A", marginLeft: 8 }}>✦</span>
            </h1>
            <p className="mt-6 text-base leading-relaxed max-w-sm" style={{ color: "#7A6350" }}>
              Join thousands of beauty lovers and salon owners on Ethiopia&apos;s premier beauty platform.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              {[
                { icon: "🌸", title: "Book Instantly", desc: "Find and book premium salons in seconds" },
                { icon: "⭐", title: "Earn Rewards", desc: "Get GlowPoints on every visit" },
                { icon: "💅", title: "Grow Your Business", desc: "Salon owners reach thousands of clients" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: "#FFFFFF", border: "1px solid #E8DDD2", boxShadow: "0 2px 12px rgba(44,36,22,0.04)" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: "#FFF0E8" }}>{item.icon}</div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#2C2416" }}>{item.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#B5A090" }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Register Card (all fields) */}
          <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="relative overflow-hidden"
              style={{ background: "#FFFFFF", borderRadius: "80px 80px 32px 32px", border: "1px solid #E8DDD2", boxShadow: "0 8px 40px rgba(44,36,22,0.08)" }}>

              <div className="pt-10 pb-4 text-center" style={{ background: "linear-gradient(180deg, #FFF0E8, #FFFFFF)" }}>
                <div className="h-14 w-14 mx-auto rounded-full flex items-center justify-center mb-3"
                  style={{ background: "#D4864A", boxShadow: "0 4px 20px rgba(212,134,74,0.3)" }}>
                  <span className="text-xl text-white">✦</span>
                </div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: "#2C2416" }}>Create Account</h2>
                <p className="text-xs mt-1" style={{ color: "#B5A090" }}>Fill in your details to get started</p>
              </div>

              <form onSubmit={handleSubmit} className="px-7 pb-8">
                {/* Role selector */}
                <p className="text-xs font-bold uppercase tracking-widest mb-2 mt-2" style={{ color: "#B5A090" }}>I am a</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { id: "CUSTOMER", label: "Client", icon: "💅", desc: "Book services" },
                    { id: "OWNER", label: "Salon Owner", icon: "✂️", desc: "Manage salon" },
                  ].map(r => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)}
                      className="p-3 rounded-2xl text-left transition-all"
                      style={{ background: role === r.id ? "#FFF0E8" : "#FAF5EE", border: `2px solid ${role === r.id ? "#D4864A" : "#E8DDD2"}` }}>
                      <span className="text-xl">{r.icon}</span>
                      <p className="text-sm font-bold mt-1" style={{ color: "#2C2416" }}>{r.label}</p>
                      <p className="text-[10px]" style={{ color: "#B5A090" }}>{r.desc}</p>
                    </button>
                  ))}
                </div>

                {/* All fields */}
                <div className="grid grid-cols-2 gap-3 mb-1">
                  {fields.slice(0, 2).map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: "#B5A090" }}>{f.label}</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}>{f.icon}</div>
                        <input type={f.type} required value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)}
                          placeholder={f.ph} className="w-full h-11 pl-9 pr-3 rounded-xl text-sm outline-none transition-all"
                          style={{ background: "#FAF5EE", border: "1.5px solid #E8DDD2", color: "#2C2416" }}
                          onFocus={e => e.currentTarget.style.borderColor = "#D4864A"}
                          onBlur={e => e.currentTarget.style.borderColor = "#E8DDD2"} />
                      </div>
                    </div>
                  ))}
                </div>

                {fields.slice(2).map(f => (
                  <div key={f.key} className="mb-2.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: "#B5A090" }}>{f.label}</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}>{f.icon}</div>
                      <input type={f.type} required value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)}
                        placeholder={f.ph} className="w-full h-11 pl-9 pr-10 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "#FAF5EE", border: "1.5px solid #E8DDD2", color: "#2C2416" }}
                        onFocus={e => e.currentTarget.style.borderColor = "#D4864A"}
                        onBlur={e => e.currentTarget.style.borderColor = "#E8DDD2"} />
                      {(f.key === "password" || f.key === "confirmPassword") && (
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}>
                          {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {role === "OWNER" && (
                  <>
                    <div className="mb-2.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: "#B5A090" }}>Salon Name</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}><Building2 className="h-4 w-4" /></div>
                        <input required value={form.shopName} onChange={e => set("shopName", e.target.value)}
                          placeholder="Lumiere Beauty Lounge" className="w-full h-11 pl-9 pr-3 rounded-xl text-sm outline-none transition-all"
                          style={{ background: "#FAF5EE", border: "1.5px solid #E8DDD2", color: "#2C2416" }}
                          onFocus={e => e.currentTarget.style.borderColor = "#D4864A"}
                          onBlur={e => e.currentTarget.style.borderColor = "#E8DDD2"} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-2.5">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: "#B5A090" }}>City</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}><MapPin className="h-4 w-4" /></div>
                          <input required value={form.city} onChange={e => set("city", e.target.value)}
                            placeholder="Addis Ababa" className="w-full h-11 pl-9 pr-3 rounded-xl text-sm outline-none transition-all"
                            style={{ background: "#FAF5EE", border: "1.5px solid #E8DDD2", color: "#2C2416" }}
                            onFocus={e => e.currentTarget.style.borderColor = "#D4864A"}
                            onBlur={e => e.currentTarget.style.borderColor = "#E8DDD2"} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: "#B5A090" }}>Address</label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#B5A090" }}><MapPin className="h-4 w-4" /></div>
                          <input required value={form.address} onChange={e => set("address", e.target.value)}
                            placeholder="Bole" className="w-full h-11 pl-9 pr-3 rounded-xl text-sm outline-none transition-all"
                            style={{ background: "#FAF5EE", border: "1.5px solid #E8DDD2", color: "#2C2416" }}
                            onFocus={e => e.currentTarget.style.borderColor = "#D4864A"}
                            onBlur={e => e.currentTarget.style.borderColor = "#E8DDD2"} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <div className="mb-3 px-4 py-2.5 rounded-xl text-xs text-center font-medium"
                    style={{ background: "#FDECEE", border: "1px solid #D4847A44", color: "#C04060" }}>{error}</div>
                )}

                <motion.button type="submit" disabled={loading}
                  className="w-full h-12 rounded-full font-bold text-sm flex items-center justify-center gap-2 mt-3 disabled:opacity-50"
                  style={{ background: "#2C2416", color: "#F5EFE6" }}
                  whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                  {loading ? "Creating..." : <> Create Account <ArrowRight className="h-4 w-4" /></>}
                </motion.button>

                <div className="flex items-center gap-4 my-5">
                  <div className="flex-1 h-px" style={{ background: "#E8DDD2" }} />
                  <span className="text-xs" style={{ color: "#B5A090" }}>or</span>
                  <div className="flex-1 h-px" style={{ background: "#E8DDD2" }} />
                </div>
                <p className="text-center text-sm" style={{ color: "#7A6350" }}>
                  Already have an account?{" "}
                  <Link href="/glow/auth/login" className="font-bold hover:underline" style={{ color: "#D4864A" }}>Sign In</Link>
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<div className="min-h-screen" style={{ background: "#F5EFE6" }} />}><RegisterForm /></Suspense>;
}
