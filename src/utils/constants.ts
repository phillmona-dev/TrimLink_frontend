export const APP_NAME = "TrimLink";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  (typeof window !== "undefined"
    ? `http://${window.location.hostname}:9090/api/v1`
    : "http://localhost:9090/api/v1");

export const WS_BASE_URL = 
  process.env.NEXT_PUBLIC_WS_BASE_URL ||
  (typeof window !== "undefined"
    ? `ws://${window.location.hostname}:9090/api/v1/ws`
    : "ws://localhost:9090/api/v1/ws");
export const REFRESH_KEY = "trimlink.refresh_token";
export const ACCESS_KEY = "trimlink.access_token";
export const USER_KEY = "trimlink.user";

export const dashboardRoleMap = {
  CUSTOMER: "/app",
  STAFF: "/staff",
  OWNER: "/owner",
  ADMIN: "/admin"
} as const;
