import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { PageResponse } from "@/types";

export type Shop = {
  id: string;
  name: string;
  phone?: string;
  address: string;
  city: string;
  description?: string;
  logoUrl?: string;
  active: boolean;
  latitude?: number;
  longitude?: number;
  ownerName?: string;
  ownerPhone?: string;
};

export const shopService = {
  /** Fetch all active shops (paginated) */
  list: (page = 0, size = 20) =>
    unwrap<PageResponse<Shop>>(http.get(`/shops?page=${page}&size=${size}&platform=TRIMLINK`)),

  /** Search shops by name, city, or address keyword */
  search: (q: string, page = 0, size = 10) =>
    unwrap<PageResponse<Shop>>(
      http.get(`/shops?q=${encodeURIComponent(q)}&page=${page}&size=${size}&platform=TRIMLINK`)
    ),

  /** Get a single shop by ID */
  getById: (id: string) => unwrap<Shop>(http.get(`/shops/${id}`)),

  /** Get barbers for a shop */
  getBarbers: (id: string) => unwrap<any[]>(http.get(`/shops/${id}/barbers`)),

  /** List all shops including inactive ones (Admin only) */
  listAll: (page = 0, size = 50) =>
    unwrap<PageResponse<Shop>>(http.get(`/shops/admin/all?page=${page}&size=${size}`)),

  /** Deactivate a shop (Admin only) */
  deactivate: (id: string) =>
    unwrap<void>(http.delete(`/shops/${id}`)),

  /** Activate a shop (Admin only) */
  activate: (id: string) =>
    unwrap<void>(http.patch(`/shops/${id}/activate`)),
};
