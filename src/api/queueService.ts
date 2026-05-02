import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import type { QueueTicket } from "@/types";

export const queueService = {
  join: (payload: {
    barberId: string;
    shopId: string;
    serviceId: string;
    clientTimestamp?: string;
    notes?: string;
  }) => unwrap<QueueTicket>(http.post("/queue/join", payload)),

  ticket: (entryId: string) => unwrap<QueueTicket>(http.get(`/queue/ticket/${entryId}`)),

  leave: (entryId: string) => unwrap<null>(http.delete(`/queue/${entryId}`))
};
