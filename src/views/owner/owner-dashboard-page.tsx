"use client";

import { useQuery } from "@tanstack/react-query";
import { ownerService } from "@/api/ownerService";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StatCard } from "@/components/widgets/stat-card";
import { Card } from "@/components/common/card";
import { Scissors, ArrowRight } from "lucide-react";
import Link from "next/link";

export function OwnerDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["owner-shop-stats"],
    queryFn: ownerService.getShopStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i: number) => (
            <div key={i} className="h-32 bg-white/5 rounded-3xl" />
          ))}
        </div>
        <div className="h-96 bg-white/5 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard 
          label="Revenue today" 
          value={stats?.revenueToday || "0 ETB"} 
          helper={stats?.revenueHelper || "No data yet"} 
        />
        <StatCard 
          label="Appointments today" 
          value={stats?.appointmentsToday || 0} 
          helper={stats?.appointmentsHelper || "Peak starts at 4 PM"} 
        />
        <StatCard 
          label="Queue traffic" 
          value={stats?.queueTraffic || 0} 
          helper={stats?.queueHelper || "Highest at lunch"} 
        />
        <StatCard 
          label="Repeat customers" 
          value={stats?.repeatCustomerRate || "0%"} 
          helper={stats?.repeatHelper || "Strong retention"} 
        />
      </div>
      {stats?.revenueTrend && (
        <RevenueChart title="Owner revenue trend" data={stats.revenueTrend} />
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/owner/services">
          <Card className="group relative overflow-hidden bg-white/5 border-white/5 p-8 hover:border-orange-500/30 transition-all cursor-pointer">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-orange-500/10 blur-3xl group-hover:bg-orange-500/20 transition-all" />
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <Scissors className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Manage Services</h3>
                  <p className="text-white/40 text-sm mt-1">Set prices and assign services to your staff</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-white/20 group-hover:text-orange-500 transition-all" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
