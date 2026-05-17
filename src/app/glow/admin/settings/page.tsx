"use client";

import { useState } from "react";
import { Settings, Save, Percent } from "lucide-react";
import { glowAdminApi } from "@/lib/glow-api";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  const [adminSharePercent, setAdminSharePercent] = useState("10.0");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await glowAdminApi.updateSetting("admin_share_percentage", adminSharePercent);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Platform Settings
        </h2>
        <p className="text-[#7A6350] mt-1 text-sm">Centralized control for payment configuration and platform parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Setting */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#E8DDD2] rounded-[28px] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#FFF0E8] rounded-2xl text-[#D4864A]">
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Commission Rate</h3>
              <p className="text-xs text-[#B5A090]">Platform commission on each completed booking</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-widest text-[#B5A090] mb-2 block">Admin Share Percentage</label>
            <div className="relative">
              <input type="number" step="0.1" min="0" max="100"
                value={adminSharePercent} onChange={(e) => setAdminSharePercent(e.target.value)}
                className="w-full h-13 px-5 py-3.5 rounded-2xl text-sm outline-none transition-all pr-12"
                style={{ background: "#FAF5EE", border: "1.5px solid #E8DDD2", color: "#2C2416" }} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#B5A090] font-bold">%</span>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "#2C2416", color: "#F5EFE6" }}>
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-[#F5EFE6]/40 border-t-[#F5EFE6] rounded-full animate-spin" />
                Saving…
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">✓ Saved Successfully</span>
            ) : (
              <><Save className="h-4 w-4" /> Save Setting</>
            )}
          </button>
        </motion.div>

        {/* Info Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white border border-[#E8DDD2] rounded-[28px] p-8 shadow-sm flex flex-col justify-center">
          <div className="p-3 bg-[#FAF5EE] rounded-2xl w-fit mb-4">
            <Settings className="h-6 w-6 text-[#B5A090]" />
          </div>
          <h3 className="text-lg font-bold text-[#2C2416] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            More Settings Coming Soon
          </h3>
          <p className="text-sm text-[#7A6350] leading-relaxed">
            Additional platform configuration options including notification preferences,
            payment gateway settings, and analytics parameters will be available here in future updates.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
