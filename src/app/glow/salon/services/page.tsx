"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scissors, Plus, User, Clock, Sparkles, ChevronRight, X, DollarSign
} from "lucide-react";
import { glowShopApi } from "@/lib/glow-api";

export default function SalonServicesPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [platformServices, setPlatformServices] = useState<any[]>([]);
  const [barberServices, setBarberServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Create service modal
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [staffData, servicesData] = await Promise.all([
        glowShopApi.getShopStaff(),
        glowShopApi.getPlatformServices(),
      ]);
      setStaff(staffData || []);
      setPlatformServices(servicesData?.content || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (!selectedBarberId) return;
    setLoadingServices(true);
    glowShopApi.getBarberServices(selectedBarberId)
      .then(data => setBarberServices(data || []))
      .catch(() => setBarberServices([]))
      .finally(() => setLoadingServices(false));
  }, [selectedBarberId]);

  const handleCreateService = async () => {
    if (!newName || !newPrice) return;
    setCreateLoading(true);
    try {
      await glowShopApi.createShopService({
        name: newName,
        description: newDesc,
        basePrice: parseFloat(newPrice),
        durationMinutes: parseInt(newDuration),
      });
      setIsCreating(false);
      setNewName(""); setNewDesc(""); setNewPrice(""); setNewDuration("30");
      // Reload services
      const servicesData = await glowShopApi.getPlatformServices();
      setPlatformServices(servicesData?.content || []);
    } catch (e) { console.error(e); }
    setCreateLoading(false);
  };

  const handleAddService = async (serviceId: string) => {
    if (!selectedBarberId) return;
    if (barberServices.find((s: any) => s.serviceId === serviceId)) return;

    const platSvc = platformServices.find((s: any) => s.id === serviceId);
    if (!platSvc) return;

    const updated = [
      ...barberServices,
      { serviceId: platSvc.id, serviceName: platSvc.name, durationMinutes: platSvc.durationMinutes, customPrice: platSvc.basePrice },
    ];

    try {
      await glowShopApi.updateBarberServices(selectedBarberId, updated.map(s => ({
        serviceId: s.serviceId, customPrice: s.customPrice,
      })));
      setBarberServices(updated);
    } catch (e) { console.error(e); }
  };

  const handlePriceChange = async (serviceId: string, newPriceStr: string) => {
    if (!selectedBarberId) return;
    const price = parseFloat(newPriceStr);
    if (isNaN(price)) return;

    const updated = barberServices.map((s: any) =>
      s.serviceId === serviceId ? { ...s, customPrice: price } : s
    );

    try {
      await glowShopApi.updateBarberServices(selectedBarberId, updated.map(s => ({
        serviceId: s.serviceId, customPrice: s.customPrice,
      })));
      setBarberServices(updated);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Service Management</h1>
          <p className="text-sm text-[#B5A090] mt-1">Register services and set custom prices for your staff</p>
        </div>
        <button onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center gap-2 shadow-lg"
          style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
          <Plus className="h-4 w-4" /> Register New Service
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Staff Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] px-2">Select Staff</p>
          {staff.map((s: any) => (
            <button key={s.barberId} onClick={() => setSelectedBarberId(s.barberId)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                selectedBarberId === s.barberId
                  ? "bg-[#FFF5ED] border-[#D4864A]/30 text-[#D4864A]"
                  : "bg-white border-[#F0E4D8] text-[#7A6350] hover:bg-[#FAF5EE]"
              }`}>
              <div className="h-10 w-10 rounded-xl bg-[#FAF5EE] flex items-center justify-center shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block font-bold text-sm truncate">{s.user?.firstName} {s.user?.lastName}</span>
                <span className="block text-[10px] uppercase tracking-wider opacity-60">Stylist</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${selectedBarberId === s.barberId ? "rotate-90" : ""}`} />
            </button>
          ))}
        </div>

        {/* Services Panel */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedBarberId ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed border-[#E8DDD2] rounded-2xl bg-white">
              <div className="h-16 w-16 rounded-2xl bg-[#FAF5EE] flex items-center justify-center text-[#D9CFC6] mb-4">
                <Scissors className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-[#B5A090]">No staff selected</h3>
              <p className="text-sm text-[#D9CFC6] max-w-xs mx-auto">Select a staff member from the left to manage their service catalog.</p>
            </div>
          ) : (
            <>
              {/* Assigned Services */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] px-2">Assigned Services</p>

                {loadingServices ? (
                  <div className="text-center py-10">
                    <div className="h-8 w-8 mx-auto rounded-full border-2 border-[#F0E4D8] border-t-[#D4864A] animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                      {barberServices.map((assignment: any) => (
                        <motion.div layout key={assignment.assignmentId || assignment.serviceId}
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="rounded-2xl bg-white border border-[#F0E4D8] p-5 hover:shadow-sm transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-[#FFF5ED] flex items-center justify-center text-[#D4864A]">
                                <Sparkles className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-[#2C2416] text-sm">{assignment.serviceName}</h4>
                                <p className="text-xs text-[#B5A090] flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" /> {assignment.durationMinutes} min
                                </p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#B5A090] mb-1 block">Price (ETB)</label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D9CFC6]" />
                              <input type="number" value={assignment.customPrice}
                                onChange={(e) => handlePriceChange(assignment.serviceId, e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl text-sm text-[#2C2416] font-semibold focus:outline-none focus:border-[#D4864A] transition-all" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {!loadingServices && barberServices.length === 0 && (
                  <div className="text-center py-8 bg-[#FAF5EE] rounded-xl border border-[#F0E4D8] text-sm text-[#B5A090]">
                    No services assigned yet. Add from the catalog below.
                  </div>
                )}
              </div>

              {/* Catalog */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4864A] px-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Shop Catalog — Click to Assign
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {platformServices
                    .filter(ps => !barberServices.find(bs => bs.serviceId === ps.id))
                    .map((ps: any) => (
                      <button key={ps.id} onClick={() => handleAddService(ps.id)}
                        className="group text-left p-4 rounded-xl bg-white border border-[#F0E4D8] hover:border-[#D4864A]/30 hover:shadow-sm transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-9 w-9 rounded-lg bg-[#FAF5EE] flex items-center justify-center text-[#D9CFC6] group-hover:bg-[#FFF5ED] group-hover:text-[#D4864A] transition-colors">
                            <Plus className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-[#B5A090] group-hover:text-[#2C2416]">{ps.basePrice} ETB</span>
                        </div>
                        <p className="font-bold text-sm text-[#7A6350] group-hover:text-[#2C2416] transition-colors">{ps.name}</p>
                        <p className="text-[10px] text-[#B5A090] mt-1">{ps.durationMinutes} min</p>
                      </button>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════ CREATE SERVICE MODAL ══════ */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white border border-[#E8DDD2] rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#FFF5ED] flex items-center justify-center text-[#D4864A]">
                      <Scissors className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Register Service</h2>
                      <p className="text-sm text-[#B5A090]">Create a new service for your shop catalog</p>
                    </div>
                  </div>
                  <button onClick={() => setIsCreating(false)} className="text-[#B5A090] hover:text-[#2C2416] transition-all">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-2 block">Service Name</label>
                    <input placeholder="e.g. Silk Press Premium" value={newName} onChange={e => setNewName(e.target.value)}
                      className="w-full h-12 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl px-4 text-sm text-[#2C2416] focus:outline-none focus:border-[#D4864A] transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-2 block">Description</label>
                    <input placeholder="Short description..." value={newDesc} onChange={e => setNewDesc(e.target.value)}
                      className="w-full h-12 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl px-4 text-sm text-[#2C2416] focus:outline-none focus:border-[#D4864A] transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-2 block">Base Price (ETB)</label>
                      <input type="number" placeholder="300" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                        className="w-full h-12 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl px-4 text-sm text-[#2C2416] focus:outline-none focus:border-[#D4864A] transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#B5A090] mb-2 block">Duration (Min)</label>
                      <input type="number" placeholder="30" value={newDuration} onChange={e => setNewDuration(e.target.value)}
                        className="w-full h-12 bg-[#FAF5EE] border border-[#E8DDD2] rounded-xl px-4 text-sm text-[#2C2416] focus:outline-none focus:border-[#D4864A] transition-all" />
                    </div>
                  </div>
                  <button onClick={handleCreateService} disabled={createLoading || !newName || !newPrice}
                    className="w-full h-14 rounded-xl font-bold text-white text-sm disabled:opacity-50 shadow-lg transition-all mt-2"
                    style={{ background: "linear-gradient(135deg, #D4864A, #C07540)" }}>
                    {createLoading ? "Creating..." : "Create Service"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
