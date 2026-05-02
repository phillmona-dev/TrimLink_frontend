import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";

export type User = {
  id: string;
  username: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  avatarUrl?: string;
  role: string;
  active: boolean;
};

export type DeviceToken = {
  id: string;
  platform: "ANDROID" | "IOS" | "WEB";
  deviceId?: string;
  appVersion?: string;
  active: boolean;
  lastSeenAt: string;
  createdAt: string;
};

export const userService = {
  me: () => unwrap<User>(http.get("/users/me")),
  updateProfile: (payload: {
    firstName: string;
    lastName: string;
    email?: string;
    username?: string;
    password?: string;
    avatarUrl?: string;
  }) => unwrap<User>(http.put("/users/me", payload)),
  registerDevice: (payload: {
    token: string;
    platform: "ANDROID" | "IOS" | "WEB";
    deviceId?: string;
    appVersion?: string;
  }) => unwrap<DeviceToken>(http.post("/notifications/devices", payload)),
  listDevices: () => unwrap<DeviceToken[]>(http.get("/notifications/devices")),
  removeDevice: (id: string) => unwrap<null>(http.delete(`/notifications/devices/${id}`))
};
