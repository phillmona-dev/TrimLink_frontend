"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/api/adminService";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StatCard } from "@/components/widgets/stat-card";
import { chartSeries } from "@/assets/mock-data";

export function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminService.dashboard
  });

  const stats = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Users" value={stats?.totalUsers ?? 0} isLoading={dashboardQuery.isLoading} />
        <StatCard label="Staffs" value={stats?.totalStaffs ?? 0} isLoading={dashboardQuery.isLoading} />
        <StatCard label="Shops" value={stats?.totalShops ?? 0} isLoading={dashboardQuery.isLoading} />
        <StatCard label="Active queue" value={stats?.activeQueueEntries ?? 0} isLoading={dashboardQuery.isLoading} />
        <StatCard label="Pending appointments" value={stats?.pendingAppointments ?? 0} isLoading={dashboardQuery.isLoading} />
      </div>
      <RevenueChart title="Platform revenue trend" data={chartSeries} />
    </div>
  );
}
