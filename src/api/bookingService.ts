import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { Appointment, PageResponse, Review } from "@/types";

export const bookingService = {
  createAppointment: (payload: {
    barberId: string;
    shopId: string;
    serviceId: string;
    scheduledStart: string;
    notes?: string;
    receiptImageUrl?: string;
    styleReferenceUrl?: string;
  }) => unwrap<Appointment>(http.post("/bookings", payload)),

  getMine: (page = 0, query = "", since = "") => {
    const params: any = { page, size: 10 };
    if (query) params.query = query;
    if (since) params.since = since;
    return unwrap<PageResponse<Appointment>>(http.get("/bookings/me", { params }));
  },

  getBarberAppointments: (status: string, page = 0, search = "", date = "") => {
    const params: any = { page, size: 50 };
    if (search && search.trim() !== "") params.search = search;
    if (date && date.trim() !== "") params.date = date;
    if (status && status !== "ALL") params.status = status;
    return unwrap<PageResponse<Appointment>>(http.get("/bookings/barber", { params }));
  },

  cancelAppointment: (id: string, reason: string) =>
    unwrap<Appointment>(
      http.patch(`/bookings/${id}/cancel`, null, { params: { reason } })
    ),

  submitReview: (appointmentId: string, payload: { rating: number; comment?: string }) =>
    unwrap<Review>(http.post(`/bookings/${appointmentId}/review`, payload)),

  getSlots: (params: { barberId: string; serviceId: string; date: string }) =>
    unwrap<any[]>(http.get("/bookings/slots", { params })),

  getBarberDaySchedule: (barberId: string, date: string) =>
    unwrap<{ scheduledStart: string; scheduledEnd: string }[]>(
      http.get(`/barbers/${barberId}/day-schedule`, { params: { date } })
    ),

  confirmAppointment: (id: string) =>
    unwrap<Appointment>(http.patch(`/bookings/${id}/confirm`)),

  rejectAppointment: (id: string, reason: string) =>
    unwrap<Appointment>(http.patch(`/bookings/${id}/reject`, null, { params: { reason } })),

  startAppointment: (id: string) =>
    unwrap<Appointment>(http.patch(`/bookings/${id}/start`)),

  completeAppointment: (id: string) =>
    unwrap<Appointment>(http.patch(`/bookings/${id}/complete`)),

  updatePaymentStatus: (id: string, status: string) =>
    unwrap<Appointment>(http.patch(`/bookings/${id}/payment-status`, null, { params: { status } })),

  getBarberReviews: (barberId: string, page = 0) =>
    unwrap<PageResponse<Review>>(
      http.get(`/barbers/${barberId}/reviews`, { params: { page, size: 10 } })
    ),

  getShopReviews: (shopId: string, page = 0) =>
    unwrap<PageResponse<Review>>(
      http.get(`/shops/${shopId}/reviews`, { params: { page, size: 10 } })
    ),

  blockSlot: (start: string, end: string) =>
    unwrap<Appointment>(http.post("/bookings/block", null, { params: { start, end } })),

  unblockSlot: (id: string) =>
    unwrap<void>(http.post(`/bookings/unblock/${id}`))
};
