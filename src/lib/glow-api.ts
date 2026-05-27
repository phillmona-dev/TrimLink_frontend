import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ── Types matching the Spring Boot ApiResponse<T> wrapper ─────────────────────
export interface GlowApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface GlowApiError {
  success: false;
  status: number;
  message: string;
  timestamp: string;
}

// ── Axios instance ────────────────────────────────────────────────────────────
const glowApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GLOW_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/glow-api",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ───────────────────────────────────────────
glowApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Only runs client-side
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("glowlink-auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

// ── Response interceptor: handle 401 + refresh ────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

glowApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh for auth endpoints themselves
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/")
    ) {
      return Promise.reject(error);
    }

    // Try to refresh
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(glowApi(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const raw = localStorage.getItem("glowlink-auth");
      const parsed = raw ? JSON.parse(raw) : null;
      const refreshToken = parsed?.state?.refreshToken;

      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post<GlowApiResponse<{ accessToken: string; refreshToken: string }>>(
        `${process.env.NEXT_PUBLIC_GLOW_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "/glow-api"}/auth/token/refresh`,
        { refreshToken }
      );

      const newAccess = data.data.accessToken;
      const newRefresh = data.data.refreshToken;

      // Update Zustand store in localStorage
      if (parsed) {
        parsed.state.accessToken = newAccess;
        parsed.state.refreshToken = newRefresh;
        localStorage.setItem("glowlink-auth", JSON.stringify(parsed));
      }

      processQueue(null, newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return glowApi(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear auth and redirect to login
      localStorage.removeItem("glowlink-auth");
      if (typeof window !== "undefined") {
        window.location.href = "/glow/auth/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Backend Integration Types ──────────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AppointmentResponse {
  id: string;
  shopName: string;
  barberName: string;
  customerName: string;
  serviceName: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  priceCharged: number;
}

export interface ShopStatsResponse {
  totalAppointments: number;
  totalRevenue: number;
  activeStaff: number;
  rating: number;
}

export interface StaffPerformanceResponse {
  barberId: string;
  barberName: string;
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  rating: number;
}

export interface ShopSearchResponse {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  description: string;
  logoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  active: boolean;
  ownerName: string;
  ownerPhone: string;
  averageWaitMinutes: number;
}

export interface BarberResponse {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string | null;
  bio: string | null;
  averageRating: number;
  status: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  durationMinutes: number;
  shopId: string | null;
  active: boolean;
}

export interface TimeSlotResponse {
  startTime: string; // ISO LocalDateTime
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED" | "BREAK";
  barberId: string;
}

export interface CreateAppointmentRequest {
  barberId: string;
  shopId: string;
  serviceId: string;
  scheduledStart: string; // ISO LocalDateTime
  notes?: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

export const glowBookingApi = {
  getMyAppointments: async () => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<AppointmentResponse>>>("/bookings/me");
    return data.data;
  },
  cancelAppointment: async (id: string) => {
    const { data } = await glowApi.patch<GlowApiResponse<AppointmentResponse>>(`/bookings/${id}/cancel`);
    return data.data;
  },
  confirmAppointment: async (id: string) => {
    const { data } = await glowApi.patch<GlowApiResponse<AppointmentResponse>>(`/bookings/${id}/confirm`);
    return data.data;
  },
  rejectAppointment: async (id: string) => {
    const { data } = await glowApi.patch<GlowApiResponse<AppointmentResponse>>(`/bookings/${id}/reject`);
    return data.data;
  },
  getAvailableSlots: async (barberId: string, serviceId: string, date: string) => {
    const { data } = await glowApi.get<GlowApiResponse<TimeSlotResponse[]>>("/bookings/slots", {
      params: { barberId, serviceId, date }
    });
    return data.data;
  },
  createAppointment: async (req: CreateAppointmentRequest) => {
    const { data } = await glowApi.post<GlowApiResponse<AppointmentResponse>>("/bookings", req);
    return data.data;
  }
};

export const glowShopApi = {
  // ── Appointments ───────────────────────────────────────────────
  getShopAppointments: async (params?: {
    status?: string; query?: string; startDate?: string; endDate?: string;
    page?: number; size?: number;
  }) => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<AppointmentResponse>>>("/shops/my-shop/appointments", { params });
    return data.data;
  },

  // ── Stats & Finance ────────────────────────────────────────────
  getShopStats: async () => {
    const { data } = await glowApi.get<GlowApiResponse<any>>("/shops/my-shop/stats");
    return data.data;
  },
  getShopFinance: async () => {
    const { data } = await glowApi.get<GlowApiResponse<any>>("/shops/my-shop/finance");
    return data.data;
  },

  // ── Staff Management ───────────────────────────────────────────
  getShopStaff: async () => {
    const { data } = await glowApi.get<GlowApiResponse<any[]>>("/shops/my-shop/staff");
    return data.data;
  },
  addStaff: async (phoneNumber: string) => {
    const { data } = await glowApi.post<GlowApiResponse<any>>("/shops/my-shop/staff", { phoneNumber });
    return data.data;
  },
  toggleStaffAvailability: async (barberId: string, available: boolean) => {
    const { data } = await glowApi.patch<GlowApiResponse<void>>(`/shops/my-shop/staff/${barberId}/availability`, { available });
    return data.data;
  },
  logDailyWork: async (barberId: string, count: number, notes?: string) => {
    const { data } = await glowApi.post<GlowApiResponse<void>>(`/shops/my-shop/staff/${barberId}/logs`, { count, notes });
    return data.data;
  },
  getWeeklyReport: async () => {
    const { data } = await glowApi.get<GlowApiResponse<any[]>>("/shops/my-shop/staff/weekly-report");
    return data.data;
  },

  // ── Services ───────────────────────────────────────────────────
  getPlatformServices: async () => {
    const { data } = await glowApi.get<GlowApiResponse<{ content: any[] }>>("/services");
    return data.data;
  },
  createShopService: async (service: { name: string; description: string; basePrice: number; durationMinutes: number }) => {
    const { data } = await glowApi.post<GlowApiResponse<any>>("/services/my-shop", service);
    return data.data;
  },
  getBarberServices: async (barberId: string) => {
    const { data } = await glowApi.get<GlowApiResponse<any[]>>(`/barber/services/${barberId}`);
    return data.data;
  },
  updateBarberServices: async (barberId: string, assignments: { serviceId: string; customPrice: number }[]) => {
    const { data } = await glowApi.put<GlowApiResponse<any[]>>(`/barber/services/${barberId}`, { assignments });
    return data.data;
  },

  // ── Shop Details & Settings ────────────────────────────────────
  getMyShopDetails: async () => {
    const { data } = await glowApi.get<GlowApiResponse<any>>("/shops/my-shop");
    return data.data;
  },
  updateMyShopDetails: async (details: any) => {
    const { data } = await glowApi.put<GlowApiResponse<any>>("/shops/my-shop", details);
    return data.data;
  },
  getShopHours: async () => {
    const { data } = await glowApi.get<GlowApiResponse<any[]>>("/shops/my-shop/hours");
    return data.data;
  },
  updateShopHours: async (hours: any[]) => {
    const { data } = await glowApi.put<GlowApiResponse<any[]>>("/shops/my-shop/hours", hours);
    return data.data;
  },

  // ── Public Shop Browsing ───────────────────────────────────────
  searchShops: async (q?: string, city?: string) => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<ShopSearchResponse>>>("/shops", { params: { q, city, platform: "GLOWLINK" } });
    return data.data;
  },
  getShopDetails: async (id: string) => {
    const { data } = await glowApi.get<GlowApiResponse<ShopSearchResponse>>(`/shops/${id}`);
    return data.data;
  },
  getShopBarbers: async (id: string) => {
    const { data } = await glowApi.get<GlowApiResponse<BarberResponse[]>>(`/shops/${id}/barbers`);
    return data.data;
  },
  getShopServices: async (id: string) => {
    const { data } = await glowApi.get<GlowApiResponse<Service[]>>(`/services/shop/${id}`);
    return data.data;
  },
};

export interface AdminDashboardStats {
  totalUsers: number;
  totalBarbers: number;
  totalShops: number;
  totalAppointmentsToday: number;
  totalAppointmentsThisMonth: number;
  activeQueueEntries: number;
  completedServicesToday: number;
  pendingAppointments: number;
  revenueToday: number;
  revenueThisMonth: number;
}

export interface AdminUserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  role: string;
  active: boolean;
  approvalStatus: string;
  createdAt: string;
}

export interface AdminAppointmentStats {
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  totalRevenue: number;
  revenueToday: number;
  adminShare: number;
  adminSharePercent: number;
  shopRevenues: Array<{ shopId: string; shopName: string; revenue: number }>;
  barberRevenues: Array<{ barberId: string; barberName: string; revenue: number }>;
}

export const glowAdminApi = {
  // Dashboard
  getDashboardStats: async () => {
    const { data } = await glowApi.get<GlowApiResponse<AdminDashboardStats>>("/admin/dashboard");
    return data.data;
  },

  // Users
  listUsers: async (page = 0, size = 20) => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<AdminUserResponse>>>(`/admin/users?page=${page}&size=${size}`);
    return data.data;
  },
  getPendingShops: async () => {
    const { data } = await glowApi.get<GlowApiResponse<AdminUserResponse[]>>("/admin/users/pending");
    return data.data;
  },
  approveUser: async (id: string) => {
    const { data } = await glowApi.patch<GlowApiResponse<void>>(`/admin/users/${id}/approve`);
    return data.data;
  },
  rejectUser: async (id: string) => {
    const { data } = await glowApi.patch<GlowApiResponse<void>>(`/admin/users/${id}/reject`);
    return data.data;
  },

  // Shops
  listAllShops: async (page = 0, size = 50) => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<ShopSearchResponse>>>(`/shops/admin/all?page=${page}&size=${size}`);
    return data.data;
  },

  // Appointments
  getAppointments: async (params?: {
    shopId?: string;
    barberId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    query?: string;
    page?: number;
    size?: number;
  }) => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<AppointmentResponse>>>("/admin/appointments", { params });
    return data.data;
  },
  getAppointmentStats: async () => {
    const { data } = await glowApi.get<GlowApiResponse<AdminAppointmentStats>>("/admin/appointments/stats");
    return data.data;
  },

  // Finance
  getShopFinanceSummaries: async () => {
    const { data } = await glowApi.get<GlowApiResponse<any[]>>("/admin/finance/shops");
    return data.data;
  },
  getTransactions: async (params?: { page?: number; size?: number }) => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<any>>>("/admin/finance/transactions", { params });
    return data.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: { page?: number; size?: number; username?: string; action?: string }) => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<any>>>("/admin/audit-logs", { params });
    return data.data;
  },

  // Settings
  updateSetting: async (key: string, value: string) => {
    const { data } = await glowApi.patch<GlowApiResponse<void>>(`/admin/settings/${key}?value=${encodeURIComponent(value)}`);
    return data.data;
  },
};

export default glowApi;
