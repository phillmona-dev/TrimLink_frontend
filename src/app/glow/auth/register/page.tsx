"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowLeft, Lock, User, Phone,
  Eye, EyeOff, Building2, CheckCircle2, AtSign
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useGlowAuthStore } from "@/lib/glow-auth-store";

// ─── Role Selector Card ───────────────────────────────────────────────────────
function RoleCard({ role, selected, onClick }: {
  role: "customer" | "salon";
  selected: boolean;
  onClick: () => void;
}) {
  const isCustomer = role === "customer";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex-1 p-5 rounded-2xl text-left transition-all"
      style={{
        background: selected ? "rgba(200,149,108,0.12)" : "rgba(253,246,238,0.04)",
        border: selected ? "1.5px solid rgba(200,149,108,0.5)" : "1px solid rgba(200,149,108,0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: selected ? "linear-gradient(135deg, #C8956C, #E8B4A0)" : "rgba(200,149,108,0.15)" }}>
          {isCustomer
            ? <User className={`h-5 w-5 ${selected ? "text-white" : "text-[#C8956C]"}`} />
            : <Building2 className={`h-5 w-5 ${selected ? "text-white" : "text-[#C8956C]"}`} />
          }
        </div>
        {selected && <CheckCircle2 className="h-5 w-5" style={{ color: "#C8956C" }} />}
      </div>
      <p className="font-bold text-sm text-white">{isCustomer ? "I'm a Client" : "I Own a Salon"}</p>
      <p className="text-xs mt-1" style={{ color: "rgba(253,246,238,0.45)" }}>
        {isCustomer ? "Book services & discover salons" : "List my business & manage bookings"}
      </p>
    </motion.button>
  );
}

// ─── Input Field Component ────────────────────────────────────────────────────
function GlowInput({ icon, label, type = "text", value, onChange, placeholder }: {
  icon: React.ReactNode; label: string; type?: string;
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: focused ? "#C8956C" : "rgba(200,149,108,0.5)" }}>
        {icon}
      </div>
      <input
        type={isPassword && showPwd ? "text" : type}
        required value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} aria-label={label}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full h-14 pl-11 pr-12 rounded-2xl text-sm text-white placeholder:text-white/25 focus:outline-none transition-all"
        style={{
          background: "rgba(253,246,238,0.05)",
          border: focused ? "1.5px solid rgba(200,149,108,0.5)" : "1px solid rgba(200,149,108,0.15)",
        }}
      />
      {isPassword && (
        <button type="button" onClick={() => setShowPwd(!showPwd)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition">
          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ role }: { role: "customer" | "salon" }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center p-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="h-24 w-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: "0 0 60px rgba(200,149,108,0.4)" }}>
        <CheckCircle2 className="h-12 w-12 text-white" />
      </motion.div>
      <h2 className="text-3xl font-black font-editorial text-white mb-3">
        {role === "customer" ? "Welcome to GlowLink! 🌸" : "Salon Registered! ✨"}
      </h2>
      <p className="text-base mb-8" style={{ color: "rgba(253,246,238,0.6)" }}>
        {role === "customer"
          ? "Your account is ready. Start discovering amazing salons near you."
          : "Your salon profile is being reviewed. We'll notify you within 24 hours."}
      </p>
      <Link href={role === "customer" ? "/glow/discover" : "/glow/salon/dashboard"}
        className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E]"
        style={{ background: "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: "0 0 30px rgba(200,149,108,0.3)" }}>
        {role === "customer" ? "Explore Salons →" : "Go to Dashboard →"}
      </Link>
    </motion.div>
  );
}

// ─── Main Register Form ───────────────────────────────────────────────────────
function RegisterForm() {
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "salon" ? "salon" : "customer";
  const router = useRouter();
  const { register, registerSalon, isLoading: loading, error, clearError } = useGlowAuthStore();

  const [role, setRole] = useState<"customer" | "salon">(defaultRole);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const [form, setForm] = useState({
    username: "", firstName: "", lastName: "", phone: "", password: "", confirm: "",
    salonName: "", salonAddress: "", salonCity: "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setPwdError("Passwords do not match"); return; }
    setPwdError("");
    clearError();
    if (role === "customer") {
      handleCustomerSubmit();
    } else {
      setStep(2);
    }
  };

  const handleCustomerSubmit = async () => {
    try {
      await register({
        username: form.username,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone || undefined,
      });
      setSuccess(true);
    } catch {
      // Error set in store
    }
  };

  const handleSalonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerSalon({
        username: form.username,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone,
        shopName: form.salonName,
        city: form.salonCity,
        address: form.salonAddress,
      });
      setSuccess(true);
    } catch {
      // Error set in store
    }
  };

  if (success) return <SuccessScreen role={role} />;

  return (
    <motion.div className="w-full max-w-md rounded-[2rem] overflow-hidden relative"
      style={{ background: "rgba(15,8,24,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(200,149,108,0.18)" }}
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

      {/* Shimmer top line */}
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(200,149,108,0.6), transparent)" }} />
      {/* Ambient glow behind form */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full -translate-y-1/2 opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.5), transparent 70%)", filter: "blur(30px)" }} />

      <div className="p-8 md:p-10 relative">
      {/* Back + Brand */}
      <div className="flex items-center gap-3 mb-8">
        <Link href={step === 2 ? "#" : "/glow/auth/login"}
          onClick={() => step === 2 ? setStep(1) : undefined}
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

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2].map(s => (
          <div key={s} className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{ background: step >= s ? "linear-gradient(90deg, #C8956C, #E8B4A0)" : "rgba(200,149,108,0.2)" }} />
        ))}
      </div>

      {/* Step 1: Account Info */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h1 className="text-3xl font-black text-white font-editorial mb-1">Create account</h1>
            <p className="text-sm mb-6" style={{ color: "rgba(253,246,238,0.5)" }}>
              Join thousands of women glowing every day
            </p>

            {/* API Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-2xl text-sm font-medium"
                style={{ background: "rgba(220,80,100,0.12)", border: "1px solid rgba(220,80,100,0.3)", color: "#f87171" }}>
                {error}
              </motion.div>
            )}

            {/* Role selector */}
            <div className="flex gap-3 mb-6">
              <RoleCard role="customer" selected={role === "customer"} onClick={() => setRole("customer")} />
              <RoleCard role="salon" selected={role === "salon"} onClick={() => setRole("salon")} />
            </div>

            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <GlowInput icon={<User className="h-4 w-4" />} label="First Name" value={form.firstName} onChange={v => update("firstName", v)} placeholder="First name" />
                <GlowInput icon={<User className="h-4 w-4" />} label="Last Name" value={form.lastName} onChange={v => update("lastName", v)} placeholder="Last name" />
              </div>
              <GlowInput icon={<AtSign className="h-4 w-4" />} label="Username" value={form.username} onChange={v => update("username", v)} placeholder="Choose a username" />
              <GlowInput icon={<Phone className="h-4 w-4" />} label="Phone" type="tel" value={form.phone} onChange={v => update("phone", v)} placeholder="+251 9XX XXX XXXX" />
              <GlowInput icon={<Lock className="h-4 w-4" />} label="Password" type="password" value={form.password} onChange={v => update("password", v)} placeholder="Create password (min 6 chars)" />
              <GlowInput icon={<Lock className="h-4 w-4" />} label="Confirm Password" type="password" value={form.confirm} onChange={v => update("confirm", v)} placeholder="Confirm password" />

              {(pwdError || (form.confirm && form.password !== form.confirm)) && (
                <p className="text-xs" style={{ color: "#f87171" }}>{pwdError || "Passwords do not match"}</p>
              )}

              <motion.button type="submit" disabled={loading || (form.confirm !== "" && form.password !== form.confirm)}
                className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E] mt-2 flex items-center justify-center gap-2"
                style={{ background: loading ? "rgba(200,149,108,0.5)" : "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: "0 0 30px rgba(200,149,108,0.3)" }}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                {loading ? (
                  <><div className="h-4 w-4 border-2 border-[#1A0F1E]/40 border-t-[#1A0F1E] rounded-full animate-spin" /> Creating…</>
                ) : role === "salon" ? "Next: Salon Details →" : "Create My Account"}
              </motion.button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: "rgba(253,246,238,0.45)" }}>
              Already have an account?{" "}
              <Link href="/glow/auth/login" className="font-bold" style={{ color: "#C8956C" }}>Sign in</Link>
            </p>
          </motion.div>
        )}

        {/* Step 2: Salon Details (only for salon owners) */}
        {step === 2 && role === "salon" && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h1 className="text-3xl font-black text-white font-editorial mb-1">Your Salon</h1>
            <p className="text-sm mb-6" style={{ color: "rgba(253,246,238,0.5)" }}>
              Tell us about your beauty business
            </p>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-2xl text-sm font-medium"
                style={{ background: "rgba(220,80,100,0.12)", border: "1px solid rgba(220,80,100,0.3)", color: "#f87171" }}>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSalonSubmit} className="flex flex-col gap-4">
              <GlowInput icon={<Building2 className="h-4 w-4" />} label="Salon Name" value={form.salonName} onChange={v => update("salonName", v)} placeholder="e.g. Lumiere Beauty Lounge" />
              <GlowInput icon={<Building2 className="h-4 w-4" />} label="Salon Address" value={form.salonAddress} onChange={v => update("salonAddress", v)} placeholder="e.g. Bole Road, Addis Ababa" />
              <GlowInput icon={<Building2 className="h-4 w-4" />} label="City" value={form.salonCity} onChange={v => update("salonCity", v)} placeholder="e.g. Addis Ababa" />

              {/* Service categories */}
              <div>
                <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: "rgba(200,149,108,0.7)" }}>
                  Services Offered
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Hair Salon", "Makeup", "Nails", "Spa", "Lash & Brow", "Bridal", "Skincare"].map(cat => (
                    <button key={cat} type="button"
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all glass border border-[rgba(200,149,108,0.2)] text-white/70 hover:border-[rgba(200,149,108,0.5)] hover:text-white">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <motion.button type="submit" disabled={loading}
                className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-wider text-[#1A0F1E] mt-2 flex items-center justify-center gap-2"
                style={{ background: loading ? "rgba(200,149,108,0.5)" : "linear-gradient(135deg, #C8956C, #E8B4A0)", boxShadow: "0 0 30px rgba(200,149,108,0.3)" }}
                whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}>
                {loading ? (
                  <><div className="h-4 w-4 border-2 border-[#1A0F1E]/40 border-t-[#1A0F1E] rounded-full animate-spin" /> Registering…</>
                ) : "Submit Salon Registration"}
              </motion.button>
            </form>
          </motion.div>
        )}


      </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Page wrapper with Suspense for useSearchParams ──────────────────────────
export default function RegisterPage() {
  const beautyCards = [
    { emoji: "💅", label: "Nail Art",    c1: "#C8956C", c2: "#E8B4A0", top: "6%",  left: "4%" },
    { emoji: "✂️",  label: "Hair Salon", c1: "#EC4899", c2: "#F9A8D4", top: "20%", left: "66%" },
    { emoji: "🌸", label: "Skincare",    c1: "#8B5CF6", c2: "#C4B5FD", top: "52%", left: "6%" },
    { emoji: "💆", label: "Spa",         c1: "#10B981", c2: "#6EE7B7", top: "72%", left: "58%" },
    { emoji: "👄", label: "Makeup",      c1: "#F43F5E", c2: "#FDA4AF", top: "36%", left: "75%" },
  ];

  return (
    <div className="min-h-screen w-full flex">
      {/* ── LEFT PANEL (desktop only) ─────────────────────────── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-16 relative overflow-hidden">
        {/* Ambient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-[15%] left-[15%] w-72 h-72 rounded-full animate-blob"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.25), transparent 70%)", filter: "blur(45px)", animationDuration: "13s" }} />
          <div className="absolute bottom-[10%] right-[8%] w-64 h-64 rounded-full animate-blob"
            style={{ background: "radial-gradient(circle, rgba(200,149,108,0.3), transparent 70%)", filter: "blur(50px)", animationDelay: "6s", animationDuration: "17s" }} />
          <div className="absolute top-[45%] left-[3%] w-52 h-52 rounded-full animate-blob"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)", filter: "blur(40px)", animationDelay: "9s", animationDuration: "15s" }} />
        </div>

        {/* Floating category badges */}
        {beautyCards.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.6, y: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 } }}
            className="absolute flex items-center gap-2 px-3 py-2 rounded-2xl"
            style={{ top: c.top, left: c.left, background: `linear-gradient(135deg, ${c.c1}22, ${c.c2}15)`, border: `1px solid ${c.c1}44`, backdropFilter: "blur(12px)", zIndex: 10 }}>
            <span className="text-xl">{c.emoji}</span>
            <span className="text-xs font-black text-white">{c.label}</span>
          </motion.div>
        ))}

        {/* Main copy */}
        <div className="relative z-10 text-center max-w-sm">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.23,1,0.32,1] }}
            className="mb-8 h-20 w-20 mx-auto rounded-3xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #EC4899, #C8956C)", boxShadow: "0 0 50px rgba(236,72,153,0.4), 0 0 100px rgba(200,149,108,0.2)" }}>
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
            className="text-5xl font-black font-editorial text-white mb-4 leading-[1.1]">
            Join the Glow<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #F472B6, #FBBF24, #C8956C)" }}>Community.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
            className="text-base font-medium leading-relaxed" style={{ color: "rgba(253,246,238,0.65)" }}>
            Discover salons, book instantly,<br />and unlock exclusive beauty rewards.
          </motion.p>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-10 grid grid-cols-3 gap-4">
            {[
              { val: "Free",  label: "Forever" },
              { val: "800+",  label: "Salons" },
              { val: "10pts", label: "Per 100 ETB" },
            ].map((s, i) => (
              <div key={i} className="p-3 rounded-2xl text-center"
                style={{ background: "rgba(200,149,108,0.08)", border: "1px solid rgba(200,149,108,0.15)" }}>
                <p className="text-xl font-black font-editorial" style={{ color: "#C8956C" }}>{s.val}</p>
                <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(253,246,238,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* How it works */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
            className="mt-6 flex flex-col gap-3 text-left">
            {[
              { n: "01", text: "Create your free account in 30 seconds" },
              { n: "02", text: "Browse and book premium salons nearby" },
              { n: "03", text: "Earn GlowPoints on every visit" },
            ].map((step) => (
              <div key={step.n} className="flex items-center gap-3">
                <span className="text-xs font-black w-6 shrink-0" style={{ color: "#C8956C" }}>{step.n}</span>
                <span className="text-sm" style={{ color: "rgba(253,246,238,0.65)" }}>{step.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT PANEL: Register Form ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 lg:p-12 overflow-y-auto">
        <Suspense fallback={
          <div className="flex items-center gap-3 text-white/50">
            <div className="h-6 w-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            Loading…
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
