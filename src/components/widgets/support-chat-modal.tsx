"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Shield, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/common/button";
import { supportService, type SupportMessage } from "@/api/supportService";
import { Client } from "@stomp/stompjs";
import { WS_BASE_URL } from "@/utils/constants";

interface SupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function SupportChatModal({ isOpen, onClose, username }: SupportChatModalProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stompClient = useRef<Client | null>(null);

  useEffect(() => {
    if (isOpen && username) {
      loadHistory();
      connectWebSocket();
    }
    return () => {
      stompClient.current?.deactivate();
    };
  }, [isOpen, username]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadHistory = async () => {
    try {
      const history = await supportService.getHistory(username);
      setMessages(history || []);
    } catch (err) {
      console.error("Failed to load support history", err);
    }
  };

  const connectWebSocket = () => {
    const client = new Client({
      brokerURL: WS_BASE_URL,
      onConnect: () => {
        client.subscribe(`/topic/support/${username}`, (msg) => {
          const message = JSON.parse(msg.body);
          setMessages(prev => [...prev, message]);
        });
      },
    });
    client.activate();
    stompClient.current = client;
  };

  const handleSend = async () => {
    if (!newMessage.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const sent = await supportService.send(username, newMessage);
      if (sent) {
        setMessages(prev => [...prev, sent]);
      }
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send support message", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[600px]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-orange-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white">System Admin Support</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Typically replies in 10 mins</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onClose}
                className="rounded-full border-white/5 bg-white/5 hover:bg-white/10 text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide"
            >
              <div className="text-center py-4">
                <div className="inline-block px-4 py-2 bg-white/5 rounded-full text-[10px] text-white/40 font-bold uppercase tracking-widest border border-white/5">
                  Start of Support Thread
                </div>
              </div>

              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.fromAdmin ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id || idx}
                  className={`flex ${msg.fromAdmin ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.fromAdmin 
                      ? "bg-white/10 text-white/90 border border-white/5 rounded-tl-none" 
                      : "bg-orange-500 text-black font-medium rounded-tr-none"
                  }`}>
                    {msg.content}
                    <div className={`text-[9px] mt-1 opacity-50 ${msg.fromAdmin ? "text-white" : "text-black"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                  <MessageCircle className="w-12 h-12" />
                  <p className="text-sm">No messages yet. Tell us how we can help.</p>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
              <div className="relative flex items-center gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!newMessage.trim() || isLoading}
                  className="w-12 h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-black p-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
