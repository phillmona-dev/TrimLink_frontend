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
  baseURL: process.env.NEXT_PUBLIC_GLOW_API_URL || "/glow-api",
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
        `${process.env.NEXT_PUBLIC_GLOW_API_URL || "/glow-api"}/auth/token/refresh`,
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
  getShopAppointments: async () => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<AppointmentResponse>>>("/shops/my-shop/appointments");
    return data.data;
  },
  getShopStats: async () => {
    const { data } = await glowApi.get<GlowApiResponse<ShopStatsResponse>>("/shops/my-shop/stats");
    return data.data;
  },
  getShopStaff: async () => {
    const { data } = await glowApi.get<GlowApiResponse<StaffPerformanceResponse[]>>("/shops/my-shop/staff");
    return data.data;
  },
  getShopFinance: async () => {
    const { data } = await glowApi.get<GlowApiResponse<{ revenueToday: number; totalRevenue: number }>>("/shops/my-shop/finance");
    return data.data;
  },
  searchShops: async (q?: string, city?: string) => {
    const { data } = await glowApi.get<GlowApiResponse<PageResponse<ShopSearchResponse>>>("/shops", { params: { q, city } });
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
  }
};

export default glowApi;
