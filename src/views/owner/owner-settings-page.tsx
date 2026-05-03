"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ownerService } from "@/api/ownerService";
import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { ImageUpload } from "@/components/common/image-upload";
import { uploadService } from "@/api/uploadService";
import { 
  Settings, 
  Clock, 
  Calendar, 
  Save, 
  CheckCircle2,
  Store,
  MapPin,
  Phone,
  Moon,
  Sun
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
];

export function OwnerSettingsPage() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch Working Hours
  const { data: hours, isLoading: isLoadingHours } = useQuery({
    queryKey: ["shop-hours"],
    queryFn: ownerService.getShopHours
  });

  const [localHours, setLocalHours] = useState<any[]>(
    DAYS.map(day => ({ dayOfWeek: day, openTime: "08:00:00", closeTime: "20:00:00", closed: false }))
  );

  useEffect(() => {
    if (hours && hours.length > 0) {
      // Ensure all 7 days are present, merging with existing data
      const mergedHours = DAYS.map(day => {
        const existing = hours.find((h: any) => h.dayOfWeek === day);
        return existing || { dayOfWeek: day, openTime: "08:00:00", closeTime: "20:00:00", closed: false };
      });
      setLocalHours(mergedHours);
    }
  }, [hours]);

  const mutation = useMutation({
    mutationFn: ownerService.updateShopHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-hours"] });
      setSuccessMessage("Schedule updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  });

  const handleToggleClosed = (index: number) => {
    const newHours = [...localHours];
    newHours[index] = { ...newHours[index], closed: !newHours[index].closed };
    setLocalHours(newHours);
  };

  const handleTimeChange = (index: number, field: "openTime" | "closeTime", value: string) => {
    const newHours = [...localHours];
    // Ensure HH:mm:ss format
    const timeValue = value.length === 5 ? `${value}:00` : value;
    newHours[index] = { ...newHours[index], [field]: timeValue };
    setLocalHours(newHours);
  };

  const handleSave = () => {
    mutation.mutate(localHours);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Shop Settings</h1>
          <p className="text-white/40">Configure your shop's schedule and operating profile</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={mutation.isPending}
          className="bg-orange-500 hover:bg-orange-400 text-black font-black h-12 px-6 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95"
        >
          {mutation.isPending ? "Saving..." : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Working Hours Section */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-white/5 border-white/10 p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Operating Hours</h2>
            </div>

            <div className="space-y-4">
              {localHours.map((h, idx) => (
                <div 
                  key={h.dayOfWeek}
                  className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-[2rem] border transition-all ${
                    h.closed 
                      ? "bg-white/[0.02] border-white/5 opacity-50 grayscale" 
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-[140px]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      h.closed ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
                    }`}>
                      {h.dayOfWeek.substring(0, 3)}
                    </div>
                    <span className="font-bold text-sm text-white">{h.dayOfWeek}</span>
                  </div>

                  <div className="flex flex-1 items-center gap-3">
                    <div className="relative flex-1">
                      <Sun className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                      <input 
                        type="time" 
                        disabled={h.closed}
                        className="w-full bg-black/40 border border-white/5 rounded-xl h-10 px-8 text-xs text-white focus:border-orange-500/50 outline-none"
                        value={h.openTime.substring(0, 5)}
                        onChange={(e) => handleTimeChange(idx, "openTime", e.target.value)}
                      />
                    </div>
                    <div className="text-white/20 text-xs">to</div>
                    <div className="relative flex-1">
                      <Moon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                      <input 
                        type="time" 
                        disabled={h.closed}
                        className="w-full bg-black/40 border border-white/5 rounded-xl h-10 px-8 text-xs text-white focus:border-orange-500/50 outline-none"
                        value={h.closeTime.substring(0, 5)}
                        onChange={(e) => handleTimeChange(idx, "closeTime", e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleClosed(idx)}
                    className={`px-4 h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      h.closed 
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                        : "bg-white/10 text-white/40 hover:bg-white/20"
                    }`}
                  >
                    {h.closed ? "Closed" : "Open"}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Shop Info Section */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white/5 border-white/10 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Basic Info</h2>
            </div>

            <div className="space-y-4">
              <ImageUpload
                label="Shop Logo"
                onUpload={async (file) => {
                  await uploadService.uploadShopLogo(file);
                  // Optional: invalidate queries to refresh
                }}
              />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Shop Name</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input defaultValue="Summit Staff Shop" className="pl-11 bg-black/40 border-white/5 h-12 rounded-2xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input defaultValue="+251911222333" className="pl-11 bg-black/40 border-white/5 h-12 rounded-2xl" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input defaultValue="Summit, Addis Ababa" className="pl-11 bg-black/40 border-white/5 h-12 rounded-2xl" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-black relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-xl font-black mb-2">Need help?</h3>
               <p className="text-black/60 text-sm leading-relaxed mb-4">
                 Your schedule directly affects when customers can book appointments. Make sure to keep it updated!
               </p>
               <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-black/10 w-fit px-3 py-1 rounded-full">
                 <CheckCircle2 className="w-3 h-3" />
                 Verified Shop
               </div>
             </div>
             <Calendar className="absolute -right-4 -bottom-4 w-32 h-32 text-black/5 -rotate-12" />
          </Card>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
