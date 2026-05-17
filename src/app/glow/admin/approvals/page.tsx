"use client";

import { useEffect, useState } from "react";
import { glowAdminApi, AdminUserResponse } from "@/lib/glow-api";
import { CheckCircle2, XCircle, Building2, User, Phone, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ApprovalsPage() {
  const [pending, setPending] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const data = await glowAdminApi.getPendingShops();
      // Optionally filter by platform if returned in the API, or just assume they are GlowLink
      // Since the backend doesn't filter by platform yet, we'll display what it returns.
      setPending(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    try {
      if (action === "approve") {
        await glowAdminApi.approveUser(id);
      } else {
        await glowAdminApi.rejectUser(id);
      }
      // Remove from list
      setPending(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action} user`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-[#D4864A]/30 border-t-[#D4864A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Pending Approvals
        </h2>
        <p className="text-[#7A6350] mt-1 text-sm">Review and approve new salon registrations.</p>
      </div>

      {pending.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-[#E8DDD2] text-center shadow-sm flex flex-col items-center">
          <div className="h-20 w-20 bg-[#FAF5EE] rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-[#D4864A]" />
          </div>
          <h3 className="text-xl font-bold text-[#2C2416] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>All Caught Up!</h3>
          <p className="text-[#7A6350] text-sm">There are currently no pending salon registrations to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {pending.map(user => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-[24px] border border-[#E8DDD2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-2xl bg-[#FFF0E8] text-[#D4864A] flex items-center justify-center shrink-0">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#2C2416] flex items-center gap-2">
                      {user.firstName} {user.lastName}
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider">
                        Pending
                      </span>
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#7A6350]">
                      <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {user.username}</span>
                      <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {user.phoneNumber}</span>
                      <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => handleAction(user.id, "reject")}
                    disabled={processingId === user.id}
                    className="px-5 py-2.5 rounded-full border border-[#FFD6D6] text-[#D47A7A] hover:bg-[#FFF0F0] font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction(user.id, "approve")}
                    disabled={processingId === user.id}
                    className="px-5 py-2.5 rounded-full bg-[#2C2416] text-[#F5EFE6] hover:scale-105 font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
