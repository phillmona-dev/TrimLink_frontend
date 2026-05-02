import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { Payment } from "@/types";

export const paymentService = {
  initiate: (payload: {
    referenceId: string;
    referenceType: "APPOINTMENT" | "QUEUE_ENTRY";
    provider: "CHAPA" | "TELEBIRR";
    amount: number;
  }) => unwrap<Payment>(http.post("/payments/initiate", payload)),

  getStatus: (id: string) => unwrap<Payment>(http.get(`/payments/${id}`))
};
