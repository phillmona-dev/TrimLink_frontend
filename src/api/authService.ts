import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { ApiResponse, UserSession } from "@/types";

type LoginPayload = {
  username: string;
  password?: string;
};

type RegisterPayload = {
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: "CUSTOMER" | "BARBER" | "OWNER";
};

type ShopRegistrationPayload = {
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  shopName: string;
  city: string;
  address: string;
  shopDescription?: string;
  latitude?: number;
  longitude?: number;
};

type AuthApiPayload = {
  userId: string;
  phone: string; // Used as username/identifier
  role: UserSession["role"];
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  newUser: boolean;
};

export const authService = {
  login: async (payload: LoginPayload) => {
    const data = await unwrap<AuthApiPayload>(
      http.post("/auth/login", payload)
    );
    return data;
  },

  register: async (payload: RegisterPayload) => {
    const data = await unwrap<AuthApiPayload>(
      http.post("/auth/register", payload)
    );
    return data;
  },

  registerShop: async (payload: ShopRegistrationPayload) => {
    const data = await unwrap<AuthApiPayload>(
      http.post("/auth/register/shop", payload)
    );
    return data;
  }
};
