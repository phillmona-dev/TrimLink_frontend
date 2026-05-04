import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
};

export type UserSummary = {
  id: string;
  fullName: string;
  username: string;
  role: string;
  unreadCount?: number;
};

export const chatService = {
  /** Send a private message */
  send: (receiverId: string, content: string) =>
    unwrap<ChatMessage>(http.post("/chat/send", { receiverId, content })),

  /** Get history with a user */
  getHistory: (otherUserId: string) =>
    unwrap<ChatMessage[]>(http.get(`/chat/history/${otherUserId}`)),

  /** List active conversations */
  getConversations: () =>
    unwrap<UserSummary[]>(http.get("/chat/conversations")),

  /** Search for users to start a new conversation */
  searchUsers: (query: string) =>
    unwrap<UserSummary[]>(http.get(`/chat/search?q=${encodeURIComponent(query)}`)),

  /** Get total unread message count */
  getUnreadCount: () =>
    unwrap<number>(http.get("/chat/unread-count")),
};
