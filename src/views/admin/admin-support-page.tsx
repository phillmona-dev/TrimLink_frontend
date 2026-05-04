"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportService, type SupportMessage } from "@/api/supportService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { 
  MessageCircle, 
  Send, 
  User as UserIcon, 
  Search, 
  Clock, 
  CheckCheck,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Client } from "@stomp/stompjs";
import { WS_BASE_URL } from "@/utils/constants";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AdminSupportPage() {
  const router = useRouter();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeChatMessages, setActiveChatMessages] = useState<SupportMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stompClient = useRef<Client | null>(null);

  const { data: threads, isLoading: isLoadingThreads } = useQuery({
    queryKey: ["admin-support-threads"],
    queryFn: supportService.getThreads,
    refetchInterval: 10000, // Polling for new threads
  });

  useEffect(() => {
    if (selectedUsername) {
      loadHistory(selectedUsername);
      connectWebSocket(selectedUsername);
    }
    return () => {
      stompClient.current?.deactivate();
    };
  }, [selectedUsername]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChatMessages]);

  const loadHistory = async (username: string) => {
    try {
      const history = await supportService.getHistory(username);
      setActiveChatMessages(history || []);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const connectWebSocket = (username: string) => {
    if (stompClient.current) stompClient.current.deactivate();

    const client = new Client({
      brokerURL: WS_BASE_URL,
      connectHeaders: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
      onConnect: () => {
        // Subscribe to user topic for both user messages and admin responses
        client.subscribe(`/topic/support/${username}`, (msg) => {
          const message = JSON.parse(msg.body);
          setActiveChatMessages(prev => {
            // Deduplicate: check if message ID already exists
            if (prev.find(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
        });
      },
    });
    client.activate();
    stompClient.current = client;
  };

  const respondMutation = useMutation({
    mutationFn: () => supportService.respond(selectedUsername!, newMessage),
    onSuccess: () => {
      setNewMessage("");
    },
  });

  const handleSend = () => {
    if (!newMessage.trim() || !selectedUsername) return;
    respondMutation.mutate();
  };

  const handleViewProfile = () => {
    if (selectedUsername) {
      router.push(`/admin/users?username=${encodeURIComponent(selectedUsername)}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
      {/* Sidebar - Thread List */}
      <Card className="w-full md:w-80 flex flex-col border-white/5 bg-black/30 backdrop-blur-md p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
            Threads
          </h2>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Filter users..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoadingThreads ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-2xl" />)}
            </div>
          ) : threads && threads.length > 0 ? (
            threads.map((username) => (
              <button
                key={username}
                onClick={() => setSelectedUsername(username)}
                className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-white/5 text-left border-b border-white/5 ${
                  selectedUsername === username ? "bg-white/10 border-r-4 border-r-orange-500" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{username}</div>
                  <div className="text-[10px] text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Active thread
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-white/20 italic text-sm">
              No support threads found.
            </div>
          )}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col border-white/5 bg-black/30 backdrop-blur-md p-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {selectedUsername ? (
            <motion.div 
              key={selectedUsername}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedUsername}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Live Session</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleViewProfile}
                    className="border-white/10 text-white/60 hover:text-white rounded-full"
                  >
                    View Profile
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
              >
                {activeChatMessages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx}
                    className={`flex ${msg.fromAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] rounded-3xl px-6 py-3 text-sm ${
                      msg.fromAdmin 
                        ? "bg-orange-500 text-black font-medium rounded-tr-none" 
                        : "bg-white/5 text-white/90 border border-white/10 rounded-tl-none shadow-xl"
                    }`}>
                      {msg.content}
                      <div className={`text-[10px] mt-2 flex items-center gap-1 opacity-50 ${msg.fromAdmin ? "text-black" : "text-white"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                        {msg.fromAdmin && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={`Reply to ${selectedUsername}...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!newMessage.trim() || respondMutation.isPending}
                    className="h-14 px-8 rounded-2xl bg-orange-500 hover:bg-orange-600 text-black font-black uppercase tracking-widest text-xs"
                  >
                    {respondMutation.isPending ? "Sending..." : "Send Response"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white/40">Select a thread to start chatting</h3>
                <p className="text-sm text-white/20 mt-2 max-w-xs mx-auto">Support requests from deactivated shop owners will appear here.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
