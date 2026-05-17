import { create } from "zustand";
import { persist } from "zustand/middleware";
import glowApi, { GlowApiResponse } from "./glow-api";
import { AxiosError } from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────
export type GlowUserRole = "CUSTOMER" | "BARBER" | "OWNER" | "ADMIN";

export interface GlowAuthUser {
  userId: string;
  phone: string;
  role: GlowUserRole;
  firstName?: string;
  lastName?: string;
  username?: string;
}

interface AuthResponseData {
  userId: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  phone: string;
  role: GlowUserRole;
  newUser: boolean;
}

interface GlowAuthState {
  // State
  user: GlowAuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<AuthResponseData>;
  register: (data: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => Promise<AuthResponseData>;
  registerSalon: (data: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    shopName: string;
    city: string;
    address: string;
    shopDescription?: string;
    latitude?: number;
    longitude?: number;
    platform?: string;
  }) => Promise<AuthResponseData>;
  logout: () => void;
  clearError: () => void;
}

// ── Helper: extract error message from API or Axios error ─────────────────────
function extractError(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (err.response?.status === 0 || err.code === "ERR_NETWORK") {
      return "Cannot connect to server. Please check your connection.";
    }
    return err.message || "An unexpected error occurred";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

// ── Zustand Store ─────────────────────────────────────────────────────────────
export const useGlowAuthStore = create<GlowAuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Login ───────────────────────────────────────────────
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await glowApi.post<GlowApiResponse<AuthResponseData>>(
            "/auth/login",
            { username, password }
          );

          const auth = res.data;
          set({
            user: {
              userId: auth.userId,
              phone: auth.phone,
              role: auth.role,
              username,
            },
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return auth;
        } catch (err) {
          const msg = extractError(err);
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      // ── Register Customer ───────────────────────────────────
      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await glowApi.post<GlowApiResponse<AuthResponseData>>(
            "/auth/register",
            { ...data, role: "CUSTOMER" }
          );

          const auth = res.data;
          set({
            user: {
              userId: auth.userId,
              phone: auth.phone,
              role: auth.role,
              firstName: data.firstName,
              lastName: data.lastName,
              username: data.username,
            },
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return auth;
        } catch (err) {
          const msg = extractError(err);
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      // ── Register Salon Owner ────────────────────────────────
      registerSalon: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await glowApi.post<GlowApiResponse<AuthResponseData>>(
            "/auth/register/shop",
            data
          );

          const auth = res.data;
          set({
            user: {
              userId: auth.userId,
              phone: auth.phone,
              role: auth.role,
              firstName: data.firstName,
              lastName: data.lastName,
              username: data.username,
            },
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return auth;
        } catch (err) {
          const msg = extractError(err);
          set({ isLoading: false, error: msg });
          throw new Error(msg);
        }
      },

      // ── Logout ──────────────────────────────────────────────
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      // ── Clear Error ─────────────────────────────────────────
      clearError: () => set({ error: null }),
    }),
    {
      name: "glowlink-auth", // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
