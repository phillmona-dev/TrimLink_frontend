"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, Globe, Shield, Moon, Sun, ChevronRight, LogOut, Trash2, Sparkles, CreditCard, HelpCircle, MessageSquare, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlowAuthStore } from "@/lib/glow-auth-store";

const C = { primary:"#9e5d41", text:"#3c2a23", text2:"#8e5238", muted:"#b08d7e", border:"#e8cdb9", surface:"#FFFFFF", bg:"#FDF6F0", rose:"#c25953" };

function Toggle({ on, onChange }:{ on:boolean; onChange:(v:boolean)=>void }) {
  return (
    <button onClick={()=>onChange(!on)} className="h-7 w-12 rounded-full relative transition-all shrink-0 shadow-inner"
      style={{background:on?"linear-gradient(to right, #9e5d41, #854931)":"#e8cdb9"}}>
      <div className="absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all shadow-sm" style={{left:on?"calc(100% - 26px)":"2px"}}/>
    </button>
  );
}

function Section({ title, children }:{ title:string; children:React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-wider px-2 mb-3" style={{color:C.primary}}>{title}</p>
      <div className="rounded-xl overflow-hidden shadow-sm" style={{background:C.surface,border:`1px solid #f0e4db`}}>
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, desc, right, onClick, danger }:{
  icon:React.ReactNode; label:string; desc?:string; right?:React.ReactNode; onClick?:()=>void; danger?:boolean;
}) {
  return (
    <button onClick={onClick} disabled={!onClick&&!right}
      className="flex items-center gap-4 w-full px-5 py-4 text-left transition-colors border-b last:border-0 hover:bg-[#FDF6F0]"
      style={{borderColor:"#f0e4db"}}>
      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-[#e8cdb9]"
        style={{background:danger?"#fcecec":C.bg,color:danger?C.rose:C.primary}}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{color:danger?C.rose:C.text}}>{label}</p>
        {desc&&<p className="text-xs font-medium mt-1" style={{color:C.muted}}>{desc}</p>}
      </div>
      {right??(onClick&&<ChevronRight className="h-5 w-5 shrink-0" style={{color:C.muted}}/>)}
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
  const [language, setLanguage] = useState("English");
  const [profileVisible, setProfileVisible] = useState(true);
  const [reviewsVisible, setReviewsVisible] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const LANGS = ["English","Amharic (አማርኛ)","Tigrinya (ትግርኛ)","Oromo (Afaan Oromoo)"];

  return (
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans text-[#5c443b] bg-transparent">
      <div className="w-full max-w-[1400px] bg-[#fcf7f4] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700 flex flex-col min-h-[800px] border border-white/20">
        
        <header className="sticky top-0 z-40 bg-[#FDF6F0] rounded-t-xl border-b border-[#e8cdb9]">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2.5 rounded-lg bg-white border border-[#e8cdb9] text-[#8e5238] hover:bg-[#f9ebe2] transition-colors cursor-pointer">
                <ArrowLeft className="h-5 w-5"/>
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Settings
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-[#b08d7e]">Account preferences</p>
              </div>
            </div>
            
            <button onClick={handleSave}
              className="px-6 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 shadow-sm text-white"
              style={{background:saved?"#548c71":"linear-gradient(to right, #9e5d41, #854931)"}}>
              {saved?<><CheckCircle2 className="h-4 w-4"/> Saved</>:"Save Changes"}
            </button>
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 bg-white rounded-b-xl">
          <Section title="Notifications">
            <Row icon={<Bell className="h-5 w-5"/>} label="Booking Updates" desc="Confirmations, reminders, cancellations" right={<Toggle on={bookingNotifs} onChange={setBookingNotifs}/>}/>
            <Row icon={<Sparkles className="h-5 w-5"/>} label="Promotions & Offers" desc="Weekend deals, new salon discounts" right={<Toggle on={promoNotifs} onChange={setPromoNotifs}/>}/>
            <Row icon={<CreditCard className="h-5 w-5"/>} label="GlowPoints & Rewards" desc="Points earned, tier upgrades" right={<Toggle on={pointsNotifs} onChange={setPointsNotifs}/>}/>
            <Row icon={<MessageSquare className="h-5 w-5"/>} label="SMS Notifications" desc="Receive booking alerts via SMS" right={<Toggle on={smsNotifs} onChange={setSmsNotifs}/>}/>
          </Section>
          
          <Section title="Language & Appearance">
            <Row icon={<Globe className="h-5 w-5"/>} label="Language" desc={language} onClick={()=>setShowLang(true)}
              right={<span className="text-sm font-bold flex items-center gap-1" style={{color:C.primary}}>{language.split(" ")[0]} <ChevronRight className="h-4 w-4"/></span>}/>
          </Section>
          
          <Section title="Privacy & Security">
            <Row icon={<Shield className="h-5 w-5"/>} label="Public Profile" desc="Others can see your name & reviews" right={<Toggle on={profileVisible} onChange={setProfileVisible}/>}/>
            <Row icon={<Shield className="h-5 w-5"/>} label="Show My Reviews" desc="Display reviews on salon pages" right={<Toggle on={reviewsVisible} onChange={setReviewsVisible}/>}/>
            <Row icon={<Lock className="h-5 w-5"/>} label="Change Password" onClick={()=>{}}/>
            <Row icon={<Shield className="h-5 w-5"/>} label="Two-Factor Authentication" desc="Add extra security" onClick={()=>{}}/>
          </Section>
          
          <Section title="Payment">
            <Row icon={<CreditCard className="h-5 w-5"/>} label="Payment Methods" desc="Telebirr, CBE Birr, Chapa" onClick={()=>{}}/>
            <Row icon={<CreditCard className="h-5 w-5"/>} label="Transaction History" onClick={()=>{}}/>
          </Section>
          
          <Section title="Support">
            <Row icon={<HelpCircle className="h-5 w-5"/>} label="Help Center" desc="FAQs and guides" onClick={()=>{}}/>
            <Row icon={<MessageSquare className="h-5 w-5"/>} label="Contact Support" desc="Chat with our team" onClick={()=>{}}/>
          </Section>
          
          <Section title="Account">
            <Row icon={<LogOut className="h-5 w-5"/>} label="Log Out" danger onClick={()=>setShowLogout(true)}/>
            <Row icon={<Trash2 className="h-5 w-5"/>} label="Delete Account" desc="Permanently remove your data" danger onClick={()=>setShowDelete(true)}/>
          </Section>
          
          <p className="text-center text-[11px] font-bold mt-8 mb-4 text-[#e8cdb9]">GLOWLINK V1.0.0 · PREMIUM BEAUTY PLATFORM</p>
        </div>

        {/* Language Modal */}
        <AnimatePresence>
          {showLang && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-6"
              style={{background:"rgba(92, 68, 59, 0.4)",backdropFilter:"blur(4px)"}}
              onClick={e=>e.target===e.currentTarget&&setShowLang(false)}>
              <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
                className="w-full max-w-sm rounded-xl p-6 bg-white shadow-2xl border border-[#e8cdb9]">
                <h3 className="font-bold text-2xl mb-5 text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Choose Language</h3>
                <div className="flex flex-col gap-3">
                  {LANGS.map(l=>(
                    <button key={l} onClick={()=>{setLanguage(l);setShowLang(false);}}
                      className="flex items-center justify-between px-5 py-4 rounded-md text-sm font-bold text-left transition-all border border-[#f0e4db]"
                      style={{background:language===l?"#FDF6F0":C.surface,color:language===l?C.primary:C.text,borderColor:language===l?C.border:"#f0e4db"}}>
                      {l} {language===l&&<CheckCircle2 className="h-5 w-5" style={{color:C.primary}}/>}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Modal */}
        <AnimatePresence>
          {showLogout && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-6"
              style={{background:"rgba(92, 68, 59, 0.4)",backdropFilter:"blur(4px)"}}
              onClick={e=>e.target===e.currentTarget&&setShowLogout(false)}>
              <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}}
                className="w-full max-w-sm rounded-xl p-8 text-center bg-white shadow-2xl border border-[#e8cdb9]">
                <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5 bg-[#fcecec] border border-[#f5c2c2]">
                  <LogOut className="h-8 w-8 text-[#c25953]" />
                </div>
                <h3 className="font-bold text-2xl mb-2 text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Log Out?</h3>
                <p className="text-sm font-medium mb-8 text-[#8e5238]">You'll need to sign in again to access your account.</p>
                <div className="flex gap-4">
                  <button onClick={()=>setShowLogout(false)} className="flex-1 py-3 rounded-md text-sm font-bold transition-all bg-[#FDF6F0] border border-[#e8cdb9] text-[#8e5238] hover:bg-[#f9ebe2]">
                    Cancel
                  </button>
                  <button onClick={()=>{logout();router.push("/glow/discover");}} className="flex-1 py-3 rounded-md text-sm font-bold text-white shadow-sm hover:opacity-90 transition-all bg-[#c25953]">
                    Log Out
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {showDelete && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center p-6"
              style={{background:"rgba(92, 68, 59, 0.4)",backdropFilter:"blur(4px)"}}
              onClick={e=>e.target===e.currentTarget&&setShowDelete(false)}>
              <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}}
                className="w-full max-w-sm rounded-xl p-8 text-center bg-white shadow-2xl border border-[#f5c2c2]">
                <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-5 bg-[#fcecec] border border-[#f5c2c2]">
                  <Trash2 className="h-8 w-8 text-[#c25953]" />
                </div>
                <h3 className="font-bold text-2xl mb-2 text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Delete Account?</h3>
                <p className="text-sm font-medium mb-8 text-[#8e5238]">All your data, bookings, and GlowPoints will be permanently deleted. This cannot be undone.</p>
                <div className="flex flex-col gap-3">
                  <button onClick={()=>{logout();router.push("/glow/discover");}} className="w-full py-3.5 rounded-md text-sm font-bold text-white shadow-sm hover:opacity-90 transition-all bg-[#c25953]">
                    Delete Forever
                  </button>
                  <button onClick={()=>setShowDelete(false)} className="w-full py-3.5 rounded-md text-sm font-bold transition-all bg-[#FDF6F0] border border-[#e8cdb9] text-[#8e5238] hover:bg-[#f9ebe2]">
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
