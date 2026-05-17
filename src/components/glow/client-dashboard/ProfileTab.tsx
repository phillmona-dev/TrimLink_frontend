"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { User, Phone, Scissors, Sparkles, ChevronRight, CheckCircle2, Camera } from "lucide-react";

export function ProfileTab({ userStore }: { userStore: any }) {
  const [name, setName] = useState(userStore?.firstName ? `${userStore.firstName} ${userStore.lastName || ""}` : "");
  const [phone, setPhone] = useState(userStore?.phone || "");
  const [hairType, setHairType] = useState("Natural Curly");
  const [skinType, setSkinType] = useState("Combination");
  const [saved, setSaved] = useState(false);
  const initials = userStore ? `${(userStore.firstName || "G")[0]}${(userStore.lastName || "L")[0]}`.toUpperCase() : "GL";

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
      <div className="bg-white p-8 md:p-10 rounded-[32px] border border-[#F0E4D8]">
        {/* Avatar */}
        <div className="text-center mb-10">
          <div className="relative mx-auto w-fit mb-5">
            <div className="h-28 w-28 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-[#FFF5ED]"
              style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white border-2 border-[#F0E4D8] flex items-center justify-center shadow-md hover:scale-110 transition-transform">
              <Camera className="h-4 w-4 text-[#D4864A]" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-[#5C3D2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Personal Details
          </h2>
          <p className="text-sm text-[#B5A090] mt-1">Update your information</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: "Full Name", value: name, onChange: setName, icon: <User className="h-4 w-4" /> },
              { label: "Phone", value: phone, onChange: setPhone, icon: <Phone className="h-4 w-4" /> },
            ].map(f => (
              <div key={f.label}>
                <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block text-[#D4864A]">{f.label}</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5A090]">{f.icon}</div>
                  <input value={f.value} onChange={e => f.onChange(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-2xl text-sm font-semibold text-[#5C3D2E] focus:outline-none transition-all bg-[#FBF7F3] border-2 border-[#F0E4D8] focus:border-[#D4864A]" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-[#FBF7F3]">
            <h3 className="text-lg font-bold text-[#5C3D2E] mb-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Beauty Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Hair Type", value: hairType, onChange: setHairType, options: ["Natural Curly", "Straight", "Wavy", "Coily", "Fine"], icon: <Scissors className="h-4 w-4" /> },
                { label: "Skin Type", value: skinType, onChange: setSkinType, options: ["Combination", "Oily", "Dry", "Normal", "Sensitive"], icon: <Sparkles className="h-4 w-4" /> },
              ].map(sel => (
                <div key={sel.label}>
                  <label className="text-[10px] font-bold uppercase tracking-widest mb-2 block text-[#D4864A]">{sel.label}</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B5A090]">{sel.icon}</div>
                    <select value={sel.value} onChange={e => sel.onChange(e.target.value)}
                      className="w-full h-12 pl-11 pr-10 rounded-2xl text-sm font-semibold text-[#5C3D2E] focus:outline-none appearance-none bg-[#FBF7F3] border-2 border-[#F0E4D8] focus:border-[#D4864A]">
                      {sel.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5A090] rotate-90" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave}
            className="w-full mt-6 h-14 rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:shadow-xl"
            style={{ background: saved ? "linear-gradient(135deg, #6BAF7B, #5A9A6A)" : "linear-gradient(135deg, #D4864A, #C07540)" }}>
            {saved ? <><CheckCircle2 className="h-5 w-5" /> Saved!</> : "Save Changes"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
