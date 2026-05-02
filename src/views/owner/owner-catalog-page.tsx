"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ownerService } from "@/api/ownerService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { 
  Scissors, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  Clock,
  DollarSign,
  X,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/utils/format";

export function OwnerCatalogPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingService, setEditingService] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("30");

  const { data: services, isLoading } = useQuery({
    queryKey: ["platform-services"],
    queryFn: ownerService.getPlatformServices,
  });

  const createMutation = useMutation({
    mutationFn: ownerService.createShopService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-services"] });
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; data: any }) => ownerService.updateShopService(vars.id, vars.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-services"] });
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ownerService.deleteShopService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-services"] });
    }
  });

  const closeModal = () => {
    setIsAddingNew(false);
    setEditingService(null);
    setName("");
    setDescription("");
    setPrice("");
    setDuration("30");
  };

  const handleEdit = (svc: any) => {
    setEditingService(svc);
    setName(svc.name);
    setDescription(svc.description || "");
    setPrice(svc.basePrice.toString());
    setDuration(svc.durationMinutes.toString());
  };

  const handleSubmit = () => {
    if (!name || !price) return;
    const data = {
      name,
      description,
      basePrice: parseFloat(price),
      durationMinutes: parseInt(duration)
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredServices = services?.content.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Shop Catalog</h1>
          <p className="text-white/40">Manage your master list of services and pricing</p>
        </div>
        <Button 
          onClick={() => setIsAddingNew(true)}
          className="bg-orange-500 hover:bg-orange-400 text-black font-black h-12 px-6 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Service
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10 p-2 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Search services..." 
              className="pl-11 bg-white/5 border-white/5 h-12 rounded-2xl focus:border-orange-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-white/30 uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Base Price</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredServices?.map((svc: any) => (
                <tr key={svc.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white">{svc.name}</p>
                        <p className="text-xs text-white/30 truncate max-w-[200px]">{svc.description || "No description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-4 h-4 opacity-30" />
                      <span className="text-sm font-medium">{svc.durationMinutes} min</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-white font-bold">
                    {formatCurrency(svc.basePrice)}
                  </td>
                  <td className="px-6 py-6">
                    {svc.shopId ? (
                      <span className="px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                        Shop Custom
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                        Global
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {svc.shopId && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(svc)}
                            className="w-9 h-9 rounded-xl hover:bg-white/10 hover:text-orange-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteMutation.mutate(svc.id)}
                            className="w-9 h-9 rounded-xl hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {!svc.shopId && (
                        <div className="group/info relative">
                          <AlertCircle className="w-4 h-4 text-white/10" />
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover/info:block w-48 p-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl text-[10px] text-white/60 text-center shadow-2xl">
                            Global services cannot be edited
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredServices?.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/10 mx-auto mb-4">
                <Scissors className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white/40">No services found</h3>
              <p className="text-white/20 text-sm">Try searching for something else or add a new service.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddingNew || editingService) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
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
                      <h2 className="text-2xl font-black text-white">{editingService ? "Edit Service" : "Add Service"}</h2>
                      <p className="text-white/40">{editingService ? "Update your shop's custom service" : "Create a new service for your catalog"}</p>
                    </div>
                  </div>
                  <button onClick={closeModal} className="text-white/30 hover:text-white transition">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Service Name</label>
                    <Input 
                      placeholder="e.g. Skin Fade Premium" 
                      className="bg-black/40 border-white/10 h-12 rounded-2xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Description</label>
                    <Input 
                      placeholder="Short description..." 
                      className="bg-black/40 border-white/10 h-12 rounded-2xl"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Base Price (ETB)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <Input 
                          type="number" 
                          placeholder="300" 
                          className="pl-11 bg-black/40 border-white/10 h-12 rounded-2xl"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/30 uppercase tracking-widest px-1">Duration (Min)</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <Input 
                          type="number" 
                          placeholder="30" 
                          className="pl-11 bg-black/40 border-white/10 h-12 rounded-2xl"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSubmit}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-black font-black h-14 rounded-2xl shadow-xl mt-4"
                  >
                    {editingService ? "Save Changes" : "Create Service"}
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
