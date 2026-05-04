"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService, type ChatMessage, type UserSummary } from "@/api/chatService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { 
  MessageCircle, 
  Send, 
  X, 
  User as UserIcon, 
  ChevronLeft,
  MessageSquare,
  Search,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Client } from "@stomp/stompjs";
import { WS_BASE_URL } from "@/utils/constants";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/context/ChatContext";

export function ChatWidget() {
  const { session } = useAuth();
  const { isOpen, selectedUser, clearSelectedUser, closeChat, toggleWidget, openChat } = useChat();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stompClient = useRef<Client | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: chatService.getConversations,
    enabled: isOpen && !selectedUser,
  });

  const { data: searchResults } = useQuery({
    queryKey: ["chat-search-users", searchQuery],
    queryFn: () => chatService.searchUsers(searchQuery),
    enabled: isSearching && searchQuery.length >= 2,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["chat-unread-count"],
    queryFn: chatService.getUnreadCount,
    refetchInterval: 30000, // Poll every 30s as a fallback
  });

  useEffect(() => {
    if (selectedUser) {
      setMessages([]);
      loadHistory(selectedUser.id);
      connectWebSocket();
    } else if (isOpen) {
      // If we open chat but no user selected, we still connect to receive unread updates
      connectWebSocket();
    }
    return () => { stompClient.current?.deactivate(); };
  }, [selectedUser, isOpen]);

  useEffect(() => {
    if (!isOpen && !stompClient.current && session) {
      // Connect websocket in background to update unread badge even when closed
      connectWebSocket();
    }
    return () => { if (!isOpen && !selectedUser) stompClient.current?.deactivate(); };
  }, [isOpen, session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isSearching) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearching]);

  const loadHistory = async (otherUserId: string) => {
    try {
      const history = await chatService.getHistory(otherUserId);
      setMessages(history);
      queryClient.invalidateQueries({ queryKey: ["chat-unread-count"] });
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const connectWebSocket = () => {
    if (stompClient.current && stompClient.current.connected) return;
    const client = new Client({
      brokerURL: WS_BASE_URL,
      connectHeaders: { Authorization: `Bearer ${session?.accessToken}` },
      onConnect: () => {
        client.subscribe(`/topic/chat/${session?.userId}`, (msg) => {
          const message = JSON.parse(msg.body);
          if (selectedUser && (message.senderId === selectedUser.id || message.receiverId === selectedUser.id)) {
            setMessages(prev => {
              if (prev.find(m => m.id === message.id)) return prev;
              return [...prev, message];
            });
            // Mark as read in backend if we are active in chat with them
            if (message.receiverId === session?.userId && message.senderId === selectedUser.id) {
              chatService.getHistory(selectedUser.id);
            }
          } else if (message.receiverId === session?.userId) {
            // New message from someone else, update unread count
            queryClient.invalidateQueries({ queryKey: ["chat-unread-count"] });
          }
          queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
        });
      },
    });
    client.activate();
    stompClient.current = client;
  };

  const sendMutation = useMutation({
    mutationFn: () => chatService.send(selectedUser!.id, newMessage),
    onSuccess: (sentMsg) => {
      setNewMessage("");
      // Add the sent message only if the WebSocket hasn't already added it
      setMessages(prev => {
        if (prev.find(m => m.id === sentMsg.id)) return prev;
        return [...prev, sentMsg];
      });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUser) return;
    sendMutation.mutate();
  };

  const handleStartChat = (user: UserSummary) => {
    openChat(user.id, user.fullName);
    setIsSearching(false);
    setSearchQuery("");
  };

  if (!mounted || !session) return null;

  return (
    <>
      {!isOpen && (
        <Button
          onClick={toggleWidget}
          className="fixed bottom-[88px] right-4 md:bottom-6 md:right-6 w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-black shadow-2xl z-50 p-0 flex items-center justify-center group"
        >
          <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          {unreadCount ? (
            <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-black rounded-full border-2 border-black animate-bounce shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black" />
          )}
        </Button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-0 right-0 w-full h-[100dvh] md:bottom-6 md:right-6 md:w-[400px] md:max-w-[calc(100vw-48px)] md:h-[600px] md:max-h-[calc(100vh-100px)] z-[100]"
          >
            <Card className="h-full w-full rounded-none md:rounded-[2.5rem] flex flex-col border-0 md:border md:border-white/10 bg-[#121212]/95 backdrop-blur-3xl p-0 overflow-hidden shadow-none md:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
              {/* Header */}
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  {(selectedUser || isSearching) && (
                    <button
                      onClick={() => { clearSelectedUser(); setIsSearching(false); setSearchQuery(""); }}
                      className="p-1 hover:bg-white/5 rounded-lg text-white/40 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    {selectedUser ? <UserIcon className="w-5 h-5" /> : isSearching ? <Search className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {selectedUser ? selectedUser.name : isSearching ? "New Conversation" : "Messages"}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active now</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedUser && !isSearching && (
                    <button
                      onClick={() => setIsSearching(true)}
                      className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-orange-400 transition-colors"
                      title="Start new conversation"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={closeChat} className="p-2 hover:bg-white/5 rounded-xl text-white/20 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                {isSearching ? (
                  /* New Chat Search */
                  <div className="flex flex-col h-full">
                    <div className="p-3 border-b border-white/5">
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
                        <input
                          ref={inputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search barbers or shop owners..."
                          className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder-white/20"
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {searchQuery.length < 2 ? (
                        <div className="text-center text-white/20 text-xs py-8">
                          Type at least 2 characters to search
                        </div>
                      ) : searchResults && searchResults.length > 0 ? (
                        searchResults.map((user: UserSummary) => (
                          <button
                            key={user.id}
                            onClick={() => handleStartChat(user)}
                            className="w-full p-4 flex items-center gap-4 hover:bg-white/5 rounded-2xl transition-all group"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors">
                              <UserIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="text-sm font-bold text-white truncate">{user.fullName}</div>
                              <div className="text-[10px] text-white/30 truncate uppercase tracking-wider">{user.role}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center text-white/20 text-xs py-8">No users found</div>
                      )}
                    </div>
                  </div>
                ) : !selectedUser ? (
                  /* Conversations List */
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoadingConversations ? (
                      [1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl m-2" />)
                    ) : conversations && conversations.length > 0 ? (
                      conversations.map((user: UserSummary) => (
                        <button
                          key={user.id}
                          onClick={() => openChat(user.id, user.fullName)}
                          className="w-full p-4 flex items-center gap-4 hover:bg-white/5 rounded-2xl transition-all group relative"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors relative">
                            <UserIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold text-white truncate">{user.fullName}</div>
                              {user.unreadCount ? (
                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0">
                                  {user.unreadCount > 99 ? '99+' : user.unreadCount}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-white/30 truncate uppercase tracking-wider">{user.role}</div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <MessageCircle className="w-12 h-12 mb-4 text-white/10" />
                        <p className="text-sm text-white/20 mb-6">No conversations yet.</p>
                        <Button
                          onClick={() => setIsSearching(true)}
                          className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl px-4 h-10 text-xs font-bold"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Start a Conversation
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Chat Messages */
                  <>
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide min-h-0">
                      {messages.length === 0 && (
                        <div className="text-center text-white/20 text-xs py-8">
                          Send a message to start the conversation!
                        </div>
                      )}
                      {messages.map((msg, idx) => (
                        <div
                          key={msg.id || idx}
                          className={`flex ${msg.senderId === session.userId ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-lg ${
                            msg.senderId === session.userId
                              ? "bg-orange-500 text-black font-medium rounded-tr-none"
                              : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none"
                          }`}>
                            {msg.content}
                            <div className={`text-[10px] mt-1 opacity-50 ${msg.senderId === session.userId ? "text-black" : "text-white"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-white/5 bg-white/[0.01] flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                          placeholder="Type your message..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50 placeholder-white/20"
                        />
                        <Button
                          onClick={handleSend}
                          disabled={!newMessage.trim() || sendMutation.isPending}
                          className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 text-black p-0 flex-shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
