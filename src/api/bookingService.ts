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

  getMine: (page = 0) =>
    unwrap<PageResponse<Appointment>>(
      http.get("/bookings/me", { params: { page, size: 10 } })
    ),

  cancelAppointment: (id: string, reason: string) =>
    unwrap<Appointment>(
      http.patch(`/bookings/${id}/cancel`, null, { params: { reason } })
    ),

  submitReview: (appointmentId: string, payload: { rating: number; comment?: string }) =>
    unwrap<Review>(http.post(`/bookings/${appointmentId}/review`, payload)),

  getSlots: (params: { staffId: string; serviceId: string; date: string }) =>
    unwrap<any[]>(http.get("/bookings/slots", { params }))
};
