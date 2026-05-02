import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/routes/protected-route";

export default function AdminRouteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
