import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { PageResponse, PlatformUser } from "@/types";

export type DashboardStats = {
  totalUsers: number;
  totalBarbers: number;
  totalShops: number;
  totalAppointmentsToday: number;
  totalAppointmentsThisMonth: number;
  activeQueueEntries: number;
  revenueToday: number;
  revenueThisMonth: number;
  completedServicesToday: number;
  pendingAppointments: number;
};

export type BarberPerformance = {
  barberId: string;
  userId: string;
  shopId: string;
  barberName: string;
  averageRating: number;
  totalReviews: number;
  completedAppointmentsToday: number;
  completedAppointmentsThisMonth: number;
  pendingAppointments: number;
  activeQueueEntries: number;
  completedQueueServicesToday: number;
};

export type AdminAppointmentStats = {
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  totalRevenue: number;
  revenueToday: number;
  adminShare: number;
  adminSharePercent: number;
  shopRevenues: Array<{ shopId: string; shopName: string; revenue: number }>;
  barberRevenues: Array<{ barberId: string; barberName: string; revenue: number }>;
};

export const adminService = {
  dashboard: () => unwrap<DashboardStats>(http.get("/admin/dashboard")),
  users: () => unwrap<PageResponse<PlatformUser>>(http.get("/admin/users")),
  barberPerformance: () =>
    unwrap<PageResponse<BarberPerformance>>(http.get("/admin/barbers/performance")),
  pendingShops: () => unwrap<PlatformUser[]>(http.get("/admin/users/pending")),
  approveShop: (id: string) => unwrap<void>(http.patch(`/admin/users/${id}/approve`)),
  rejectShop: (id: string) => unwrap<void>(http.patch(`/admin/users/${id}/reject`)),
  getAppointments: (params?: { 
    shopId?: string; 
    barberId?: string; 
    status?: string; 
    startDate?: string; 
    endDate?: string; 
    query?: string;
    page?: number; 
    size?: number 
  }) => 
    unwrap<PageResponse<any>>(http.get("/admin/appointments", { params })),
  getAppointmentStats: () => unwrap<AdminAppointmentStats>(http.get("/admin/appointments/stats")),
  getShopFinanceSummaries: () => unwrap<any[]>(http.get("/admin/finance/shops")),
  getTransactions: (params?: { page?: number; size?: number }) => 
    unwrap<PageResponse<any>>(http.get("/admin/finance/transactions", { params })),
  getAuditLogs: (params?: { page?: number; size?: number; username?: string; action?: string }) =>
    unwrap<PageResponse<any>>(http.get("/admin/audit-logs", { params })),
};
