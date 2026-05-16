"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Globe, Shield, Moon, Sun, ChevronRight, LogOut, Trash2, Sparkles, CreditCard, HelpCircle, MessageSquare, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlowAuthStore } from "@/lib/glow-auth-store";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="h-7 w-12 rounded-full relative transition-all shrink-0"
      style={{ background: on ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "rgba(253,246,238,0.1)" }}>
      <div className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all shadow" style={{ left: on ? "calc(100% - 26px)" : "2px" }} />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[9px] font-black uppercase tracking-[0.35em] px-1 mb-2.5" style={{ color: "rgba(200,149,108,0.5)" }}>{title}</p>
      <div className="rounded-2xl overflow-hidden relative" style={{ background: "rgba(253,246,238,0.035)", border: "1px solid rgba(200,149,108,0.12)" }}>
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(200,149,108,0.2),transparent)" }} />
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, desc, right, onClick, danger }: {
  icon: React.ReactNode; label: string; desc?: string;
  right?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={!onClick && !right}
      className="flex items-center gap-3 w-full px-4 py-3.5 text-left transition-all border-b last:border-0 border-[rgba(200,149,108,0.06)] hover:bg-[rgba(200,149,108,0.03)]">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: danger ? "rgba(248,113,113,0.12)" : "rgba(200,149,108,0.09)", color: danger ? "#f87171" : "#C8956C" }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${danger ? "text-red-400" : "text-white"}`}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: "rgba(253,246,238,0.35)" }}>{desc}</p>}
      </div>
      {right ?? (onClick && <ChevronRight className="h-4 w-4 text-white/20 shrink-0" />)}
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useGlowAuthStore();
  const [bookingNotifs, setBookingNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(true);
  const [pointsNotifs, setPointsNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("English");
  const [profileVisible, setProfileVisible] = useState(true);
  const [reviewsVisible, setReviewsVisible] = useState(true);
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const [showLang, setShowLang] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const LANGS = ["English", "Amharic (አማርኛ)", "Tigrinya (ትግርኛ)", "Oromo (Afaan Oromoo)"];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40"
        style={{ background: "rgba(10,5,18,0.93)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(200,149,108,0.1)" }}>
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent,rgba(200,149,108,0.4),transparent)" }} />
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/glow/dashboard"
              className="p-2 rounded-xl transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.6)" }}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-white font-editorial">Settings</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] mt-0.5" style={{ color: "rgba(200,149,108,0.45)" }}>Account preferences</p>
            </div>
          </div>
          <button onClick={handleSave}
            className="relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 overflow-hidden"
            style={{ background: saved ? "rgba(124,185,154,0.2)" : "linear-gradient(135deg,#C8956C,#E8B4A0)", color: saved ? "#7CB99A" : "#1A0F1E", border: saved ? "1px solid rgba(124,185,154,0.4)" : "none", boxShadow: saved ? "none" : "0 0 16px rgba(200,149,108,0.3)" }}>
            {!saved && <div className="absolute inset-0 shimmer-overlay" />}
            {saved ? <><CheckCircle2 className="h-3.5 w-3.5" /> Saved</> : "Save"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <Section title="Notifications">
          <Row icon={<Bell className="h-4 w-4" />} label="Booking Updates" desc="Confirmations, reminders, cancellations" right={<Toggle on={bookingNotifs} onChange={setBookingNotifs} />} />
          <Row icon={<Sparkles className="h-4 w-4" />} label="Promotions & Offers" desc="Weekend deals, new salon discounts" right={<Toggle on={promoNotifs} onChange={setPromoNotifs} />} />
          <Row icon={<CreditCard className="h-4 w-4" />} label="GlowPoints & Rewards" desc="Points earned, tier upgrades" right={<Toggle on={pointsNotifs} onChange={setPointsNotifs} />} />
          <Row icon={<MessageSquare className="h-4 w-4" />} label="SMS Notifications" desc="Receive booking alerts via SMS" right={<Toggle on={smsNotifs} onChange={setSmsNotifs} />} />
        </Section>

        <Section title="Appearance">
          <Row icon={darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} label="Dark Mode" desc="Luxurious dark theme" right={<Toggle on={darkMode} onChange={setDarkMode} />} />
          <Row icon={<Globe className="h-4 w-4" />} label="Language" desc={language} onClick={() => setShowLang(true)}
            right={<span className="text-xs font-bold" style={{ color: "#C8956C" }}>{language.split(" ")[0]} <ChevronRight className="h-3 w-3 inline" /></span>} />
        </Section>

        <Section title="Privacy & Security">
          <Row icon={<Eye className="h-4 w-4" />} label="Public Profile" desc="Others can see your name & reviews" right={<Toggle on={profileVisible} onChange={setProfileVisible} />} />
          <Row icon={<Shield className="h-4 w-4" />} label="Show My Reviews" desc="Display reviews on salon pages" right={<Toggle on={reviewsVisible} onChange={setReviewsVisible} />} />
          <Row icon={<Lock className="h-4 w-4" />} label="Change Password" onClick={() => {}} />
          <Row icon={<Shield className="h-4 w-4" />} label="Two-Factor Authentication" desc="Add extra security to your account" onClick={() => {}} />
        </Section>

        <Section title="Payment">
          <Row icon={<CreditCard className="h-4 w-4" />} label="Payment Methods" desc="Telebirr, CBE Birr, Chapa" onClick={() => {}} />
          <Row icon={<CreditCard className="h-4 w-4" />} label="Transaction History" onClick={() => {}} />
        </Section>

        <Section title="Support">
          <Row icon={<HelpCircle className="h-4 w-4" />} label="Help Center" desc="FAQs and guides" onClick={() => {}} />
          <Row icon={<MessageSquare className="h-4 w-4" />} label="Contact Support" desc="Chat with our team" onClick={() => {}} />
        </Section>

        <Section title="Account">
          <Row icon={<LogOut className="h-4 w-4" />} label="Log Out" danger onClick={() => setShowLogout(true)} />
          <Row icon={<Trash2 className="h-4 w-4" />} label="Delete Account" desc="Permanently remove your data" danger onClick={() => setShowDelete(true)} />
        </Section>

        <p className="text-center text-[10px] mt-6 mb-10" style={{ color: "rgba(253,246,238,0.2)" }}>
          GlowLink v1.0.0 · Part of the BeauLink Ecosystem
        </p>
      </div>

      {showLang && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(10px)" }}
          onClick={e => e.target === e.currentTarget && setShowLang(false)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl p-5" style={{ background: "#1A0F1E", border: "1px solid rgba(200,149,108,0.2)" }}>
            <h3 className="font-black text-white font-editorial text-lg mb-4">Choose Language</h3>
            <div className="flex flex-col gap-2">
              {LANGS.map(l => (
                <button key={l} onClick={() => { setLanguage(l); setShowLang(false); }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-left transition-all"
                  style={{ background: language === l ? "rgba(200,149,108,0.12)" : "rgba(253,246,238,0.04)", color: language === l ? "#C8956C" : "rgba(253,246,238,0.7)", border: `1px solid ${language === l ? "rgba(200,149,108,0.4)" : "rgba(200,149,108,0.1)"}` }}>
                  {l}
                  {language === l && <CheckCircle2 className="h-4 w-4" style={{ color: "#C8956C" }} />}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {showLogout && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(10px)" }}
          onClick={e => e.target === e.currentTarget && setShowLogout(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: "#1A0F1E", border: "1px solid rgba(200,149,108,0.2)" }}>
            <LogOut className="h-10 w-10 mx-auto mb-3 text-red-400" />
            <h3 className="font-black text-white font-editorial text-lg mb-2">Log Out?</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(253,246,238,0.5)" }}>You'll need to sign in again to access your account.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold glass border border-[rgba(200,149,108,0.2)] text-white/70">Cancel</button>
              <button onClick={() => { logout(); router.push("/glow/discover"); }} className="flex-1 py-3 rounded-2xl text-sm font-black text-white" style={{ background: "rgba(248,113,113,0.3)", border: "1px solid rgba(248,113,113,0.4)" }}>Log Out</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showDelete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(10,5,15,0.85)", backdropFilter: "blur(10px)" }}
          onClick={e => e.target === e.currentTarget && setShowDelete(false)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
            className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: "#1A0F1E", border: "1px solid rgba(248,113,113,0.3)" }}>
            <Trash2 className="h-10 w-10 mx-auto mb-3 text-red-400" />
            <h3 className="font-black text-white font-editorial text-lg mb-2">Delete Account?</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(253,246,238,0.5)" }}>This action cannot be undone. All your data, bookings, and GlowPoints will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold glass border border-[rgba(200,149,108,0.2)] text-white/70">Cancel</button>
              <button onClick={() => { logout(); router.push("/glow/discover"); }} className="flex-1 py-3 rounded-2xl text-sm font-black text-white" style={{ background: "rgba(248,113,113,0.4)", border: "1px solid rgba(248,113,113,0.5)" }}>Delete Forever</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
