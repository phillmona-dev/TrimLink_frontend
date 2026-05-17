"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Clock, Calendar, Save, CheckCircle2,
  Store, MapPin, Phone, Sun, Moon, Plus, X, CreditCard
} from "lucide-react";
import { glowShopApi } from "@/lib/glow-api";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function SalonSettingsPage() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingHours, setLoadingHours] = useState(true);
  const [loadingShop, setLoadingShop] = useState(true);

  // Working hours
  const [localHours, setLocalHours] = useState<any[]>(
    DAYS.map(day => ({ dayOfWeek: day, openTime: "08:00:00", closeTime: "20:00:00", closed: false }))
  );

  // Shop details
  const [localShop, setLocalShop] = useState<any>({
    name: "", phone: "", address: "", city: "", description: "", bankAccounts: [],
  });

  useEffect(() => {
    // Load hours
    glowShopApi.getShopHours()
      .then(hours => {
        if (hours && hours.length > 0) {
          const merged = DAYS.map(day => {
            const existing = hours.find((h: any) => h.dayOfWeek === day);
            return existing || { dayOfWeek: day, openTime: "08:00:00", closeTime: "20:00:00", closed: false };
          });
          setLocalHours(merged);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingHours(false));

    // Load shop
    glowShopApi.getMyShopDetails()
      .then(shop => {
        if (shop) {
          setLocalShop({
            name: shop.name || "",
            phone: shop.phone || "",
            address: shop.address || "",
            city: shop.city || "",
            description: shop.description || "",
            bankAccounts: (shop.bankAccounts || []).map((acc: any) => ({
              bankName: acc.bankName || "",
              accountNumber: acc.accountNumber || "",
              accountHolder: acc.accountHolder || "",
            })),
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoadingShop(false));
  }, []);

  const handleToggleClosed = (index: number) => {
    const newHours = [...localHours];
    newHours[index] = { ...newHours[index], closed: !newHours[index].closed };
    setLocalHours(newHours);
  };

  const handleTimeChange = (index: number, field: "openTime" | "closeTime", value: string) => {
    const newHours = [...localHours];
    const timeValue = value.length === 5 ? `${value}:00` : value;
    newHours[index] = { ...newHours[index], [field]: timeValue };
    setLocalHours(newHours);
  };

  const handleAddAccount = () => {
    setLocalShop({
      ...localShop,
      bankAccounts: [...localShop.bankAccounts, { bankName: "", accountNumber: "", accountHolder: "" }],
    });
  };

  const handleRemoveAccount = (index: number) => {
    const newAccounts = [...localShop.bankAccounts];
    newAccounts.splice(index, 1);
    setLocalShop({ ...localShop, bankAccounts: newAccounts });
  };

  const handleAccountChange = (index: number, field: string, value: string) => {
    const newAccounts = [...localShop.bankAccounts];
    newAccounts[index] = { ...newAccounts[index], [field]: value };
    setLocalShop({ ...localShop, bankAccounts: newAccounts });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        glowShopApi.updateShopHours(localHours),
        glowShopApi.updateMyShopDetails(localShop),
      ]);
      setSuccessMsg("Settings updated successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      console.error(e);
      setSuccessMsg(null);
    }
    setSaving(false);
  };

  if (loadingHours || loadingShop) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 rounded-full border-2 border-[#F0E4D8] border-t-[#D4864A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Salon Settings</h1>
          <p className="text-sm text-[#B5A090] mt-1">Configure your salon&apos;s schedule and operating profile</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center gap-2 shadow-lg disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
          {saving ? "Saving..." : <><Save className="h-4 w-4" /> Save All Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Working Hours */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-[#F0E4D8] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-[#FFF5ED] flex items-center justify-center text-[#D4864A]">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Operating Hours</h2>
            </div>

            <div className="space-y-3">
              {localHours.map((h: any, idx: number) => (
                <div key={h.dayOfWeek}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                    h.closed
                      ? "bg-[#FAF5EE]/50 border-[#F0E4D8] opacity-50"
                      : "bg-white border-[#F0E4D8]"
                  }`}>
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      h.closed ? "bg-[#FCECEC] text-[#C25953]" : "bg-[#FFF5ED] text-[#D4864A]"
                    }`}>
                      {h.dayOfWeek.substring(0, 3)}
                    </div>
                    <span className="font-bold text-sm text-[#2C2416]">{h.dayOfWeek}</span>
                  </div>

                  <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1">
                      <Sun className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#D9CFC6]" />
                      <input type="time" disabled={h.closed}
                        className="w-full bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl h-10 px-8 text-xs text-[#2C2416] focus:border-[#D4864A] outline-none transition-all"
                        value={h.openTime.substring(0, 5)}
                        onChange={(e) => handleTimeChange(idx, "openTime", e.target.value)} />
                    </div>
                    <span className="text-xs text-[#D9CFC6]">to</span>
                    <div className="relative flex-1">
                      <Moon className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-[#D9CFC6]" />
                      <input type="time" disabled={h.closed}
                        className="w-full bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl h-10 px-8 text-xs text-[#2C2416] focus:border-[#D4864A] outline-none transition-all"
                        value={h.closeTime.substring(0, 5)}
                        onChange={(e) => handleTimeChange(idx, "closeTime", e.target.value)} />
                    </div>
                  </div>

                  <button onClick={() => handleToggleClosed(idx)}
                    className={`px-4 h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      h.closed
                        ? "bg-[#C25953] text-white shadow-sm"
                        : "bg-[#E6F2EB] text-[#548C71] hover:bg-[#D1E8DB]"
                    }`}>
                    {h.closed ? "Closed" : "Open"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-[#F0E4D8] p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#E8F0FF] flex items-center justify-center text-[#6B8EC4]">
                <Store className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Basic Info</h2>
            </div>

            <div className="space-y-4">
              {[
                { label: "Salon Name", icon: <Store className="h-4 w-4" />, field: "name" },
                { label: "Phone Number", icon: <Phone className="h-4 w-4" />, field: "phone" },
                { label: "Address", icon: <MapPin className="h-4 w-4" />, field: "address" },
                { label: "City", icon: <MapPin className="h-4 w-4" />, field: "city" },
              ].map(item => (
                <div key={item.field}>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#B5A090] mb-1.5 block">{item.label}</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D9CFC6]">{item.icon}</div>
                    <input value={localShop[item.field]}
                      onChange={(e) => setLocalShop({ ...localShop, [item.field]: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl text-sm text-[#2C2416] focus:outline-none focus:border-[#D4864A] transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white rounded-2xl border border-[#F0E4D8] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#E6F2EB] flex items-center justify-center text-[#548C71]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Payment</h2>
              </div>
              <button onClick={handleAddAccount}
                className="px-3 py-1.5 bg-[#FAF5EE] border border-[#E8DDD2] text-[#7A6350] text-[10px] font-bold rounded-lg hover:bg-[#F0E4D8] transition-all flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add Account
              </button>
            </div>

            <p className="text-xs text-[#B5A090] leading-relaxed">
              Customers will see these bank details to make a reservation payment.
            </p>

            <div className="space-y-4">
              {localShop.bankAccounts.map((acc: any, idx: number) => (
                <div key={idx} className="space-y-3 p-4 rounded-xl bg-[#FAF5EE] border border-[#F0E4D8] relative group">
                  <button onClick={() => handleRemoveAccount(idx)}
                    className="absolute -top-2 -right-2 h-6 w-6 bg-[#C25953] text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                    <X className="h-3 w-3" />
                  </button>
                  {[
                    { label: "Bank Name", field: "bankName", placeholder: "e.g. CBE, Telebirr" },
                    { label: "Account Number", field: "accountNumber", placeholder: "Enter account number" },
                    { label: "Account Holder", field: "accountHolder", placeholder: "Enter holder name" },
                  ].map(item => (
                    <div key={item.field}>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-[#B5A090] mb-1 block">{item.label}</label>
                      <input placeholder={item.placeholder} value={acc[item.field]}
                        onChange={(e) => handleAccountChange(idx, item.field, e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E8DDD2] rounded-lg text-sm text-[#2C2416] focus:outline-none focus:border-[#D4864A] transition-all" />
                    </div>
                  ))}
                </div>
              ))}

              {localShop.bankAccounts.length === 0 && (
                <div className="text-center py-6 border border-dashed border-[#E8DDD2] rounded-xl text-xs text-[#D9CFC6]">
                  No bank accounts added. Click &quot;+ Add Account&quot; to start.
                </div>
              )}

              <button onClick={handleSave} disabled={saving}
                className="w-full py-3 rounded-xl text-sm font-bold text-[#D4864A] bg-[#FFF5ED] border border-[#FADEC9] hover:bg-[#FADEC9] transition-all disabled:opacity-50">
                {saving ? "Saving..." : "Save Payment Settings"}
              </button>
            </div>
          </div>

          {/* Help Card */}
          <div className="rounded-2xl p-6 text-white relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Need help?</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Your schedule directly affects when customers can book appointments. Make sure to keep it updated!
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider bg-white/10 w-fit px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="h-3 w-3" /> Verified Salon
              </div>
            </div>
            <Calendar className="absolute -right-4 -bottom-4 h-28 w-28 text-white/10 -rotate-12" />
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold text-sm shadow-2xl flex items-center gap-3 z-50 text-white"
            style={{ background: "linear-gradient(135deg, #548C71, #3D7A5D)" }}>
            <CheckCircle2 className="h-5 w-5" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
