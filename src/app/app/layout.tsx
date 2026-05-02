import { DashboardLayout } from "@/layouts/dashboard-layout";
import { ProtectedRoute } from "@/routes/protected-route";

export default function CustomerDashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["CUSTOMER"]}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
