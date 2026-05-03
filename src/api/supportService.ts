import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";

export type SupportMessage = {
  id: string;
  senderUsername: string;
  content: string;
  fromAdmin: boolean;
  createdAt: string;
  read: boolean;
};

export const supportService = {
  /** Send a message as a user (Public) */
  send: (username: string, message: string) =>
    unwrap<SupportMessage>(http.post("/support/send", { username, message })),

  /** Get history for a user (Public) */
  getHistory: (username: string) =>
    unwrap<SupportMessage[]>(http.get(`/support/history?username=${encodeURIComponent(username)}`)),

  /** Admin: List all unique support threads */
  getThreads: () =>
    unwrap<string[]>(http.get("/support/admin/threads")),

  /** Admin: Respond to a user */
  respond: (username: string, message: string) =>
    unwrap<SupportMessage>(http.post("/support/admin/respond", { username, message })),
};
