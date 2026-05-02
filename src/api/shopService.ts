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
    unwrap<PageResponse<Shop>>(http.get(`/shops?page=${page}&size=${size}`)),

  /** Search shops by name, city, or address keyword */
  search: (q: string, page = 0, size = 10) =>
    unwrap<PageResponse<Shop>>(
      http.get(`/shops?q=${encodeURIComponent(q)}&page=${page}&size=${size}`)
    ),

  /** Get a single shop by ID */
  getById: (id: string) => unwrap<Shop>(http.get(`/shops/${id}`)),

  /** Get barbers for a shop */
  getBarbers: (id: string) => unwrap<any[]>(http.get(`/shops/${id}/barbers`)),
};
