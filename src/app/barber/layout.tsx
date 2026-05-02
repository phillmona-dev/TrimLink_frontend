import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/routes/protected-route";

export default function BarberRouteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["BARBER", "OWNER", "ADMIN"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
