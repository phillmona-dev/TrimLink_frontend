import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { ApiResponse, StaffProfile, PageResponse, Review, Service, Shop } from "@/types";

export const staffService = {
  listShops: (params?: { q?: string; city?: string; page?: number; size?: number }) =>
    unwrap<PageResponse<Shop>>(http.get("/shops", { params })),

  getShop: (id: string) => unwrap<Shop>(http.get(`/shops/${id}`)),

  getShopStaffs: (id: string) => unwrap<StaffProfile[]>(http.get(`/shops/${id}/staffs`)),

  listServices: () => unwrap<PageResponse<Service>>(http.get("/services")),

  getStaff: (id: string) => unwrap<StaffProfile>(http.get(`/staffs/${id}`)),

  getService: (id: string) => unwrap<Service>(http.get(`/services/${id}`)),

  getReviews: (staffId: string) =>
    unwrap<PageResponse<Review>>(http.get(`/staffs/${staffId}/reviews`))
};
