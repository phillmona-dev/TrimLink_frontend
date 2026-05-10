"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/api/adminService";
import type { PlatformUser } from "@/types";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { shopService, type Shop } from "@/api/shopService";
import { 
  Eye, 
  Power, 
  PowerOff, 
  Search, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  Calendar,
  X,
  Store
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/common/badge";

export function AdminShopsPage() {
  const queryClient = useQueryClient();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pendingShops, isLoading: isLoadingPending } = useQuery({
    queryKey: ["admin-pending-shops"],
    queryFn: adminService.pendingShops,
  });

  const { data: allShopsData, isLoading: isLoadingAll } = useQuery({
    queryKey: ["admin-all-shops"],
    queryFn: () => shopService.listAll(0, 100),
  });

  const allShops = allShopsData?.content || [];
  const filteredShops = allShops.filter((s: Shop) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-shops"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-shops"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminService.rejectShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-shops"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string, active: boolean }) => 
      active ? shopService.deactivate(id) : shopService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-shops"] });
      if (selectedShop) {
        setSelectedShop(prev => (prev ? { ...prev, active: !prev.active } : null) as Shop | null);
      }
    },
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header with quick stats or search could go here */}
      
      {/* Pending Approvals Section */}
      <Card className="border-white/5 bg-black/30 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white/90">Pending Approvals</h2>
              <p className="text-xs text-white/40">New business applications requiring review</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {isLoadingPending ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : pendingShops && pendingShops.length > 0 ? (
            <div className="space-y-4">
              {pendingShops.map((user: PlatformUser) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={user.id} 
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/[0.08] transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-white">
                        {user.barberProfile?.shop?.name || "Unknown Shop"}
                      </h3>
                      <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20">Pending</Badge>
                    </div>
                    <div className="text-sm text-white/60 mb-2 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-white/30" />
                      {user.barberProfile?.shop?.address}, {user.barberProfile?.shop?.city}
                    </div>
                    <div className="text-xs text-white/40 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> {user.firstName} {user.lastName} (@{user.username})</span>
                      {user.phoneNumber && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {user.phoneNumber}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline"
                      className="border-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 rounded-full"
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      onClick={() => rejectMutation.mutate(user.id)}
                    >
                      {rejectMutation.isPending && rejectMutation.variables === user.id ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-full"
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => approveMutation.mutate(user.id)}
                    >
                      {approveMutation.isPending && approveMutation.variables === user.id ? "Approving..." : "Approve Shop"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-3xl border border-dashed border-white/10 text-white/20">
              <Store className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No pending shop applications.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Shops Management Table Section */}
      <Card className="border-white/5 bg-black/30 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white/90">Shops Management</h2>
              <p className="text-xs text-white/40">Manage all registered businesses on the platform</p>
            </div>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Search shops, owners, cities..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Shop Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Location</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Owner</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoadingAll ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-white/5 rounded-xl w-full" /></td>
                  </tr>
                ))
              ) : filteredShops.length > 0 ? (
                filteredShops.map((shop: Shop) => (
                  <tr key={shop.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white group-hover:text-orange-400 transition-colors">{shop.name}</div>
                      <div className="text-[10px] text-white/30 font-medium">ID: {shop.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/70">{shop.city}</div>
                      <div className="text-[10px] text-white/40 truncate max-w-[150px]">{shop.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/70 font-medium">{shop.ownerName || "Unknown"}</div>
                      <div className="text-[10px] text-white/40">{shop.ownerPhone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge 
                        className={shop.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}
                      >
                        {shop.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => setSelectedShop(shop)}
                          className="w-8 h-8 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => toggleActiveMutation.mutate({ id: shop.id, active: shop.active })}
                          disabled={toggleActiveMutation.isPending}
                          className={`w-8 h-8 rounded-lg border-white/10 bg-white/5 transition-all ${
                            shop.active 
                              ? "hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50" 
                              : "hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/50"
                          }`}
                        >
                          {shop.active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic text-sm">
                    {searchTerm ? "No shops matching your search." : "No shops registered on the platform yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Shop Details Modal */}
      <AnimatePresence>
        {selectedShop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedShop(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a1a1a]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-[2rem] bg-orange-500/10 flex items-center justify-center text-orange-400">
                      <Store className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white">{selectedShop.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          className={selectedShop.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}
                        >
                          {selectedShop.active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-white/30 font-medium tracking-widest uppercase">Member since 2024</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setSelectedShop(null)}
                    className="rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Business Info</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-white/80">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <span>{selectedShop.address}, {selectedShop.city}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/80">
                          <Phone className="w-4 h-4 text-orange-400" />
                          <span>{selectedShop.phone || "No shop phone provided"}</span>
                        </div>
                        {selectedShop.description && (
                          <p className="text-xs text-white/50 leading-relaxed pt-2 italic border-t border-white/5">
                            "{selectedShop.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">Location Details</h4>
                      <div className="flex gap-4">
                        <div className="bg-black/40 rounded-2xl p-3 flex-1 border border-white/5 text-center">
                          <div className="text-[10px] text-white/30 font-bold uppercase mb-1">Lat</div>
                          <div className="text-sm font-mono text-white/80">{selectedShop.latitude?.toFixed(4) || "N/A"}</div>
                        </div>
                        <div className="bg-black/40 rounded-2xl p-3 flex-1 border border-white/5 text-center">
                          <div className="text-[10px] text-white/30 font-bold uppercase mb-1">Long</div>
                          <div className="text-sm font-mono text-white/80">{selectedShop.longitude?.toFixed(4) || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Card className="bg-white/5 border-white/10 p-5 rounded-[2rem]">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-4">Ownership</h4>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white/60">
                          <UserIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{selectedShop.ownerName || "Unknown Owner"}</div>
                          <div className="text-xs text-white/40">{selectedShop.ownerPhone || "No owner phone"}</div>
                        </div>
                      </div>
                      <Button className="w-full h-10 rounded-full bg-white text-black hover:bg-white/90 text-xs font-bold uppercase tracking-wider">
                        Contact Owner
                      </Button>
                    </Card>

                    <div className="flex gap-3">
                      <Button 
                        onClick={() => toggleActiveMutation.mutate({ id: selectedShop.id, active: selectedShop.active })}
                        className={`flex-1 h-12 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                          selectedShop.active 
                            ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" 
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                        }`}
                      >
                        {selectedShop.active ? "Deactivate Shop" : "Activate Shop"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
