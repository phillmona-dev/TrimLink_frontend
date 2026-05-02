import axios from "axios";
import { API_BASE_URL, REFRESH_KEY, USER_KEY } from "@/utils/constants";
import { getStoredItem, setStoredItem } from "@/utils/storage";
import { useAuthStore } from "@/store/auth-store";
import type { ApiResponse, UserSession } from "@/types";

type RefreshPayload = {
  refreshToken: string;
};

type RefreshResponse = {
  userId: string;
  phone: string;
  role: UserSession["role"];
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  newUser?: boolean;
};

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000
});

http.interceptors.request.use((config) => {
  const session = getStoredItem<UserSession>(USER_KEY);
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

let refreshingPromise: Promise<UserSession | null> | null = null;

async function refreshSession() {
  const refreshToken = getStoredItem<string>(REFRESH_KEY);
  const session = getStoredItem<UserSession>(USER_KEY);

  if (!refreshToken || !session) {
    return null;
  }

  const { data } = await axios.post<ApiResponse<RefreshResponse>>(
    `${API_BASE_URL}/auth/token/refresh`,
    { refreshToken } satisfies RefreshPayload
  );

  const nextSession: UserSession = {
    userId: data.data.userId,
    phone: data.data.phone,
    role: data.data.role,
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
    accessTokenExpiresIn: data.data.accessTokenExpiresIn,
    newUser: data.data.newUser
  };

  setStoredItem(USER_KEY, nextSession);
  setStoredItem(REFRESH_KEY, nextSession.refreshToken);
  useAuthStore.getState().setSession(nextSession);
  return nextSession;
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest?._retry) {
      if (!refreshingPromise) {
        refreshingPromise = refreshSession().finally(() => {
          refreshingPromise = null;
        });
      }

      const nextSession = await refreshingPromise;
      if (nextSession && originalRequest) {
        originalRequest._retry = true;
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${nextSession.accessToken}`
        };
        return http(originalRequest);
      }

      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);
