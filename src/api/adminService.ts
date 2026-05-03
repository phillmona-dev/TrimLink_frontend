import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { PageResponse, PlatformUser } from "@/types";

export type DashboardStats = {
  totalUsers: number;
  totalStaffs: number;
  totalShops: number;
  totalAppointmentsToday: number;
  totalAppointmentsThisMonth: number;
  activeQueueEntries: number;
  revenueToday: number;
  revenueThisMonth: number;
  completedServicesToday: number;
  pendingAppointments: number;
};

export type StaffPerformance = {
  staffId: string;
  userId: string;
  shopId: string;
  staffName: string;
  averageRating: number;
  totalReviews: number;
  completedAppointmentsToday: number;
  completedAppointmentsThisMonth: number;
  pendingAppointments: number;
  activeQueueEntries: number;
  completedQueueServicesToday: number;
};

export const adminService = {
  dashboard: () => unwrap<DashboardStats>(http.get("/admin/dashboard")),
  users: () => unwrap<PageResponse<PlatformUser>>(http.get("/admin/users")),
  staffPerformance: () =>
    unwrap<PageResponse<StaffPerformance>>(http.get("/admin/staffs/performance")),
  pendingShops: () => unwrap<PlatformUser[]>(http.get("/admin/users/pending")),
  approveShop: (id: string) => unwrap<void>(http.patch(`/admin/users/${id}/approve`)),
  rejectShop: (id: string) => unwrap<void>(http.patch(`/admin/users/${id}/reject`)),
};
