import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { ApiResponse, BarberProfile, PageResponse, Review, Service, Shop } from "@/types";

export const barberService = {
  listShops: (params?: { q?: string; city?: string; page?: number; size?: number }) =>
    unwrap<PageResponse<Shop>>(http.get("/shops", { params: { ...params, platform: "TRIMLINK" } })),

  getShop: (id: string) => unwrap<Shop>(http.get(`/shops/${id}`)),

  getShopBarbers: (id: string) => unwrap<BarberProfile[]>(http.get(`/shops/${id}/barbers`)),

  listServices: () => unwrap<PageResponse<Service>>(http.get("/services")),

  listBarbers: (params?: { q?: string; page?: number; size?: number }) =>
    unwrap<PageResponse<BarberProfile>>(http.get("/barbers", { params })),

  getBarber: (id: string) => unwrap<BarberProfile>(http.get(`/barbers/${id}`)),

  getService: (id: string) => unwrap<Service>(http.get(`/services/${id}`)),

  getReviews: (barberId: string) =>
    unwrap<PageResponse<Review>>(http.get(`/barbers/${barberId}/reviews`)),

  getShopCatalog: () => unwrap<Service[]>(http.get("/services/my-shop"))
};
