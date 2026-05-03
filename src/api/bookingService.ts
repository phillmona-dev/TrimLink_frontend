import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { Appointment, PageResponse, Review } from "@/types";

export const bookingService = {
  createAppointment: (payload: {
    staffId: string;
    shopId: string;
    serviceId: string;
    scheduledStart: string;
    notes?: string;
  }) => unwrap<Appointment>(http.post("/bookings", payload)),

  getMine: (page = 0, query = "", since = "") => {
    const params: any = { page, size: 10 };
    if (query) params.query = query;
    if (since) params.since = since;
    return unwrap<PageResponse<Appointment>>(http.get("/bookings/me", { params }));
  },

  getStaffAppointments: (status: string, page = 0) =>
    unwrap<PageResponse<Appointment>>(
      http.get("/bookings/staff", { params: { status, page, size: 50 } })
    ),

  cancelAppointment: (id: string, reason: string) =>
    unwrap<Appointment>(
      http.patch(`/bookings/${id}/cancel`, null, { params: { reason } })
    ),

  rejectAppointment: (id: string, reason: string) =>
    unwrap<Appointment>(
      http.patch(`/bookings/${id}/reject`, null, { params: { reason } })
    ),

  submitReview: (appointmentId: string, payload: { rating: number; comment?: string }) =>
    unwrap<Review>(http.post(`/bookings/${appointmentId}/review`, payload)),

  getSlots: (params: { staffId: string; serviceId: string; date: string }) =>
    unwrap<any[]>(http.get("/bookings/slots", { params })),

  confirmAppointment: (id: string) =>
    unwrap<Appointment>(http.patch(`/bookings/${id}/confirm`)),

  startAppointment: (id: string) =>
    unwrap<Appointment>(http.patch(`/bookings/${id}/start`)),

  completeAppointment: (id: string) =>
    unwrap<Appointment>(http.patch(`/bookings/${id}/complete`)),

  getStaffReviews: (staffId: string, page = 0) =>
    unwrap<PageResponse<Review>>(
      http.get(`/staffs/${staffId}/reviews`, { params: { page, size: 10 } })
    ),

  getShopReviews: (shopId: string, page = 0) =>
    unwrap<PageResponse<Review>>(
      http.get(`/shops/${shopId}/reviews`, { params: { page, size: 10 } })
    )
};
