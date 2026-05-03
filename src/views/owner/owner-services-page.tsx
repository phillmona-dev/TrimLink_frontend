"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ownerService, type StaffPerformance } from "@/api/ownerService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { 
  Scissors, 
  Plus, 
  Save, 
  Trash2, 
  ChevronRight,
  User,
  DollarSign,
  Clock,
  Info,
  X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";
import { ImageUpload } from "@/components/common/image-upload";
import { uploadService } from "@/api/uploadService";
import Image from "next/image";

export function OwnerServicesPage() {
  const queryClient = useQueryClient();
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [isAddingNewGlobal, setIsAddingNewGlobal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDesc, setNewServiceDesc] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState("30");
  
  // Fetch staff
  const { data: staff } = useQuery({
    queryKey: ["owner-staff-performance"],
    queryFn: ownerService.getStaffPerformance,
  });

  // Fetch all platform services
  const { data: platformServices } = useQuery({
    queryKey: ["platform-services"],
    queryFn: ownerService.getPlatformServices,
  });

  // Fetch selected staff's services
  const { data: staffServices, isLoading: isLoadingServices } = useQuery({
    queryKey: ["staff-services", selectedStaffId],
    queryFn: () => ownerService.getStaffServices(selectedStaffId!),
    enabled: !!selectedStaffId,
  });

  const createMutation = useMutation({
    mutationFn: ownerService.createShopService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-services"] });
      setIsAddingNewGlobal(false);
      setNewServiceName("");
      setNewServiceDesc("");
      setNewServicePrice("");
    }
  });

  const handleCreateService = () => {
    if (!newServiceName || !newServicePrice) return;
    createMutation.mutate({
      name: newServiceName,
      description: newServiceDesc,
      basePrice: parseFloat(newServicePrice),
      durationMinutes: parseInt(newServiceDuration)
    });
  };

  const updateMutation = useMutation({
    mutationFn: (vars: { staffId: string; assignments: any[] }) => 
      ownerService.updateStaffServices(vars.staffId, vars.assignments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-services", selectedStaffId] });
    }
  });

  const handlePriceChange = (serviceId: string, newPrice: string) => {
    if (!selectedStaffId || !staffServices) return;
    
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;

    const updatedServices = staffServices.map((s: any) => 
      s.serviceId === serviceId ? { ...s, customPrice: price } : s
    );

    updateMutation.mutate({
      staffId: selectedStaffId,
      assignments: updatedServices.map((s: any) => ({
        serviceId: s.serviceId,
        customPrice: s.customPrice
      }))
    });
  };

  const handleAddService = (serviceId: string) => {
    if (!selectedStaffId || !staffServices) return;
    
    // Check if already exists
    if (staffServices.find((s: any) => s.serviceId === serviceId)) return;

    const platformSvc = platformServices?.content.find((s: any) => s.id === serviceId);
    if (!platformSvc) return;

    const updatedServices = [
      ...staffServices,
      { 
        serviceId: platformSvc.id, 
        serviceName: platformSvc.name, 
        durationMinutes: platformSvc.durationMinutes,
        customPrice: platformSvc.basePrice 
      }
    ];

    updateMutation.mutate({
      staffId: selectedStaffId,
      assignments: updatedServices.map((s: any) => ({
        serviceId: s.serviceId,
        customPrice: s.customPrice
      }))
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Service Management</h1>
          <p className="text-white/40">Register services and set custom prices for your staff</p>
        </div>
        <Button 
          onClick={() => setIsAddingNewGlobal(true)}
          className="bg-orange-500 hover:bg-orange-400 text-black font-black h-12 px-6 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register New Shop Service
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Staff Selection List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest px-2">Select Staff</h3>
          <div className="space-y-2">
            {staff?.map((staff) => (
              <div
                key={staff.staffId}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedStaffId(staff.staffId)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedStaffId(staff.staffId)}
                className={`w-full flex items-center gap-4 p-4 rounded-[2rem] border transition-all cursor-pointer select-none ${
                  selectedStaffId === staff.staffId
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left overflow-hidden">
                  <span className="block font-bold truncate">{staff.user.firstName} {staff.user.lastName}</span>
                  <span className="block text-[10px] uppercase tracking-wider opacity-50">Staff</span>
                </div>
                <ChevronRight className={`ml-auto w-4 h-4 transition-transform ${selectedStaffId === staff.staffId ? "rotate-90" : ""}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedStaffId ? (
            <Card className="h-64 flex flex-col items-center justify-center text-center p-10 border-dashed border-white/10 bg-transparent">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/20 mb-4">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white/40">No staff selected</h3>
              <p className="text-white/20 text-sm max-w-xs mx-auto">Select a staff member from the left to manage their service catalog.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Assigned Services */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest px-2">Assigned Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {staffServices?.map((assignment: any) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={assignment.assignmentId || assignment.serviceId}
                      >
                        <Card className="bg-white/5 border-white/5 p-6 hover:border-white/10 transition-colors">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                                <Scissors className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white leading-tight">{assignment.serviceName}</h4>
                                <p className="text-white/40 text-xs flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" /> {assignment.durationMinutes} min
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Price (ETB)</label>
                            <div className="relative group">
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                              <Input
                                type="number"
                                className="pl-11 bg-black/40 border-white/10 h-12 rounded-2xl focus:border-orange-500/50"
                                value={assignment.customPrice}
                                onChange={(e) => handlePriceChange(assignment.serviceId, e.target.value)}
                              />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Add New Service from Catalog */}
              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest px-2 text-glow-400 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Your Shop Catalog (Global + Custom)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {platformServices?.content
                    .filter((ps: any) => !staffServices?.find((bs: any) => bs.serviceId === ps.id))
                    .map((ps: any) => (
                      <div
                        key={ps.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleAddService(ps.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddService(ps.id)}
                        className="group p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all text-left cursor-pointer select-none"
                      >
                        <div className="flex items-center justify-between mb-4">
                          {ps.imageUrl ? (
                            <div className="w-10 h-10 rounded-xl relative overflow-hidden">
                              <Image src={ps.imageUrl} alt={ps.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-colors">
                              <Plus className="w-5 h-5" />
                            </div>
                          )}
                          <span className="text-xs font-bold text-white/40 group-hover:text-white/80">{formatCurrency(ps.basePrice)}</span>
                        </div>
                        <span className="block font-bold text-white/80 group-hover:text-white transition-colors">{ps.name}</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="block text-[10px] text-white/30 uppercase tracking-widest">{ps.durationMinutes} min</span>
                          <div onClick={(e) => e.stopPropagation()} className="w-20">
                            <ImageUpload 
                              currentImageUrl={ps.imageUrl}
                              label=""
                              shape="square"
                              className="h-8"
                              onUpload={async (file) => {
                                await uploadService.uploadServiceImage(ps.id, file);
                                queryClient.invalidateQueries({ queryKey: ["platform-services"] });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Service Modal */}
      <AnimatePresence>
        {isAddingNewGlobal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingNewGlobal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                      <Scissors className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">Register Service</h2>
                      <p className="text-white/40">Create a new service for your shop catalog</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddingNewGlobal(false)} className="text-white/30 hover:text-white transition">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Service Name</label>
                    <Input 
                      placeholder="e.g. Skin Fade Premium" 
                      className="bg-black/40 border-white/10 h-12 rounded-2xl"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Description</label>
                    <Input 
                      placeholder="Short description of the service..." 
                      className="bg-black/40 border-white/10 h-12 rounded-2xl"
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Base Price (ETB)</label>
                      <Input 
                        type="number" 
                        placeholder="300" 
                        className="bg-black/40 border-white/10 h-12 rounded-2xl"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Duration (Min)</label>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        className="bg-black/40 border-white/10 h-12 rounded-2xl"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleCreateService}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black h-14 rounded-2xl shadow-xl mt-4"
                  >
                    Create Service
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
