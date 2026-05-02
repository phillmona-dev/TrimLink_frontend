import { chartSeries } from "@/assets/mock-data";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { StatCard } from "@/components/widgets/stat-card";

export function BarberDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Today’s bookings" value={8} helper="2 due in the next hour" />
        <StatCard label="Live queue" value={5} helper="Average wait 18 min" />
        <StatCard label="Completed services" value={14} helper="Steady pace today" />
        <StatCard label="Earnings" value="4,900 ETB" helper="+12% this week" />
      </div>
      <RevenueChart title="Daily earnings" data={chartSeries} />
    </div>
  );
}
