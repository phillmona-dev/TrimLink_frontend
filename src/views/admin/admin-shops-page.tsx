"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/api/adminService";
import type { PlatformUser } from "@/types";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { featuredShops } from "@/assets/mock-data"; // Fallback for active shops

export function AdminShopsPage() {
  const queryClient = useQueryClient();

  const { data: pendingShops, isLoading } = useQuery({
    queryKey: ["admin-pending-shops"],
    queryFn: adminService.pendingShops,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-shops"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminService.rejectShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-shops"] });
    },
  });

  return (
    <div className="space-y-8">
      {/* Pending Approvals Section */}
      <Card className="border-white/5 bg-black/30 backdrop-blur-md">
        <h2 className="text-2xl font-black text-white/90">Pending Shop Approvals</h2>
        <p className="mt-2 text-sm text-white/50 mb-6">Review and approve new barber shop applications.</p>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : pendingShops && pendingShops.length > 0 ? (
          <div className="space-y-4">
            {pendingShops.map((user: PlatformUser) => (
              <div key={user.id} className="rounded-3xl border border-white/10 bg-white/5 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg text-white">
                      {user.barberProfile?.shop?.name || "Unknown Shop"}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 font-medium uppercase">Pending</span>
                  </div>
                  <div className="text-sm text-white/60 mb-2">
                    {user.barberProfile?.shop?.address}, {user.barberProfile?.shop?.city}
                  </div>
                  <div className="text-xs text-white/40 flex items-center gap-4">
                    <span>Owner: {user.firstName} {user.lastName} (@{user.username})</span>
                    {user.phoneNumber && <span>Phone: {user.phoneNumber}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline"
                    className="border-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
                    disabled={rejectMutation.isPending || approveMutation.isPending}
                    onClick={() => rejectMutation.mutate(user.id)}
                  >
                    {rejectMutation.isPending && rejectMutation.variables === user.id ? "Rejecting..." : "Reject"}
                  </Button>
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    onClick={() => approveMutation.mutate(user.id)}
                  >
                    {approveMutation.isPending && approveMutation.variables === user.id ? "Approving..." : "Approve Shop"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-3xl border border-dashed border-white/10 text-white/40">
            No pending shop applications.
          </div>
        )}
      </Card>

      {/* Active Shops Section */}
      <Card className="border-white/5 bg-black/30 backdrop-blur-md">
        <h2 className="text-2xl font-black text-white/90">Active Shops Oversight</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {featuredShops.map((shop) => (
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 hover:bg-white/5 transition" key={shop.id}>
              <div className="font-semibold text-white/90">{shop.name}</div>
              <div className="text-sm text-white/50">{shop.address}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
