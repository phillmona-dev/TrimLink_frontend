import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { PlatformUser } from "@/types";

export type StaffPerformance = {
  user: PlatformUser;
  staffId: string;
  available: boolean;
  customersToday: number;
  manualLogsToday: number;
  appBookingsToday: number;
  weeklyAverage: number;
  totalReviews: number;
  averageRating: number;
};

export type WeeklyPerformance = {
  staffId: string;
  staffName: string;
  totalCustomers: number;
  appBookings: number;
  manualEntries: number;
  dailyAverage: number;
};

export type ShopStats = {
  revenueToday: string;
  revenueHelper: string;
  appointmentsToday: number;
  appointmentsHelper: string;
  queueTraffic: number;
  queueHelper: string;
  repeatCustomerRate: string;
  repeatHelper: string;
  revenueTrend: { label: string; value: number }[];
};

export const ownerService = {
  getShopStats: () => unwrap<ShopStats>(http.get("/shops/my-shop/stats")),
  
  getStaffPerformance: () => unwrap<StaffPerformance[]>(http.get("/shops/my-shop/staff")),
  
  getWeeklyReport: () => unwrap<WeeklyPerformance[]>(http.get("/shops/my-shop/staffs/weekly-report")),
  
  logDailyWork: (staffId: string, count: number, notes?: string) => 
    unwrap<void>(http.post(`/shops/my-shop/staffs/${staffId}/logs`, { count, notes })),
  
  addStaff: (phoneNumber: string) => 
    unwrap<PlatformUser>(http.post("/shops/my-shop/staff", { phoneNumber })),

  toggleStaffAvailability: (staffId: string, available: boolean) =>
    unwrap<void>(http.patch(`/shops/my-shop/staffs/${staffId}/availability`, { available })),

  getPlatformServices: () => 
    unwrap<{ content: any[] }>(http.get("/services")),

  getStaffServices: (staffId: string) =>
    unwrap<any[]>(http.get(`/staffs/services/${staffId}`)),

  updateStaffServices: (staffId: string, assignments: { serviceId: string, customPrice: number }[]) =>
    unwrap<any[]>(http.put(`/staffs/services/${staffId}`, { assignments })),

  createShopService: (service: { name: string, description: string, basePrice: number, durationMinutes: number }) =>
    unwrap<any>(http.post("/services/my-shop", service)),

  updateShopService: (id: string, service: { name: string, description: string, basePrice: number, durationMinutes: number }) =>
    unwrap<any>(http.put(`/services/${id}`, service)),

  deleteShopService: (id: string) =>
    unwrap<any>(http.delete(`/services/${id}`)),

  getShopHours: () =>
    unwrap<any[]>(http.get("/shops/my-shop/hours")),

  updateShopHours: (hours: any[]) =>
    unwrap<any[]>(http.put("/shops/my-shop/hours", hours))
};
