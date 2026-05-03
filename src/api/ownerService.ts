import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { PlatformUser } from "@/types";

export type StaffPerformance = {
  user: PlatformUser;
  barberId: string;
  available: boolean;
  customersToday: number;
  manualLogsToday: number;
  appBookingsToday: number;
  weeklyAverage: number;
  totalReviews: number;
  averageRating: number;
};

export type WeeklyPerformance = {
  barberId: string;
  barberName: string;
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
  
  getWeeklyReport: () => unwrap<WeeklyPerformance[]>(http.get("/shops/my-shop/staff/weekly-report")),
  
  logDailyWork: (barberId: string, count: number, notes?: string) => 
    unwrap<void>(http.post(`/shops/my-shop/staff/${barberId}/logs`, { count, notes })),
  
  addStaff: (phoneNumber: string) => 
    unwrap<PlatformUser>(http.post("/shops/my-shop/staff", { phoneNumber })),

  toggleStaffAvailability: (barberId: string, available: boolean) =>
    unwrap<void>(http.patch(`/shops/my-shop/staff/${barberId}/availability`, { available })),

  getPlatformServices: () => 
    unwrap<{ content: any[] }>(http.get("/services")),

  getBarberServices: (barberId: string) =>
    unwrap<any[]>(http.get(`/barber/services/${barberId}`)),

  updateBarberServices: (barberId: string, assignments: { serviceId: string, customPrice: number }[]) =>
    unwrap<any[]>(http.put(`/barber/services/${barberId}`, { assignments })),

  createShopService: (service: { name: string, description: string, basePrice: number, durationMinutes: number }) =>
    unwrap<any>(http.post("/services/my-shop", service)),

  updateShopService: (id: string, service: { name: string, description: string, basePrice: number, durationMinutes: number }) =>
    unwrap<any>(http.put(`/services/${id}`, service)),

  deleteShopService: (id: string) =>
    unwrap<any>(http.delete(`/services/${id}`)),

  getShopHours: () =>
    unwrap<any[]>(http.get("/shops/my-shop/hours")),

  updateShopHours: (hours: any[]) =>
    unwrap<any[]>(http.put("/shops/my-shop/hours", hours)),
  
  getShopDetails: () =>
    unwrap<any>(http.get("/shops/my-shop")),
    
  updateShopDetails: (details: any) =>
    unwrap<any>(http.put("/shops/my-shop", details))
};
