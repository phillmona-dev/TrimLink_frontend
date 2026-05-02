import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/routes/protected-route";

export default function OwnerRouteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
