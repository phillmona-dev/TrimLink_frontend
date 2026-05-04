"use client";

import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { Bell, Calendar, User, Scissors, CheckCircle2, XCircle, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { WS_BASE_URL } from "@/utils/constants";
import { Button } from "@/components/common/button";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/common/badge";

import { useQueryClient } from "@tanstack/react-query";

interface BookingNotification {
  id: string;
  customerName: string;
  serviceName: string;
  scheduledStart: string;
  price: number;
  status: string;
  timestamp: number;
  read: boolean;
  type?: string;
  displayTitle?: string;
}

export function NotificationCenter() {
  const { session } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const stompClient = useRef<Client | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!session?.userId || !session?.accessToken) {
      console.log("No session or token, skipping WebSocket connection");
      return;
    }

    console.log("Initializing WebSocket connection for user:", session.userId, "Role:", session.role);

    const client = new Client({
      brokerURL: WS_BASE_URL,
      connectHeaders: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("STOMP Connected successfully");
        
        // Subscribe to barber notifications
        if (session.role === "BARBER" || session.role === "OWNER") {
          console.log("Subscribing to barber topics...");
          client.subscribe(`/topic/barbers/${session.userId}/bookings`, (message) => {
            const booking = JSON.parse(message.body);
            addNotification(booking);
          });
        }

        // Subscribe to customer notifications
        if (session.role === "CUSTOMER") {
          console.log("Subscribing to customer topics...");
          client.subscribe(`/topic/customers/${session.userId}/bookings`, (message) => {
            const booking = JSON.parse(message.body);
            addNotification(booking);
          });
        }

        // Subscribe to admin notifications
        if (session.role === "ADMIN") {
          console.log("Subscribing to admin topics: /topic/admin/approvals");
          client.subscribe(`/topic/admin/approvals`, (message) => {
            console.log("Received admin notification:", message.body);
            const payload = JSON.parse(message.body);
            addAdminNotification(payload);
            
            // Invalidate admin pending shops query to show it in the list immediately
            queryClient.invalidateQueries({ queryKey: ["admin-pending-shops"] });
          });
        }
      },
      onStompError: (frame) => {
        console.error("STOMP Error Frame:", frame);
      },
      onWebSocketClose: () => {
        console.log("WebSocket connection closed");
      },
      onWebSocketError: (event) => {
        console.error("WebSocket Error:", event);
      }
    });

    client.activate();
    stompClient.current = client;

    return () => {
      console.log("Deactivating WebSocket client");
      client.deactivate();
    };
  }, [session, queryClient]);

  const addNotification = (booking: any) => {
    const isBarber = session?.role === "BARBER" || session?.role === "OWNER";
    
    let title = isBarber 
      ? `New booking from ${booking.customerName}`
      : `Booking Update: ${booking.serviceName}`;
      
    let icon = CheckCircle2;
    
    if (booking.status === "REJECTED") {
      title = isBarber ? `You rejected ${booking.customerName}` : `Booking rejected by ${booking.barberName}`;
      icon = XCircle;
    } else if (booking.status === "CONFIRMED") {
      title = isBarber ? `Booking confirmed` : `Booking confirmed by ${booking.barberName}`;
      icon = CheckCircle2;
    } else if (booking.status === "RESCHEDULE_REQUESTED") {
      title = isBarber ? `Reschedule requested` : `${booking.barberName} requested a reschedule`;
      icon = Calendar;
    }

    const newNotif: BookingNotification = {
      id: booking.id,
      customerName: booking.customerName || "Customer",
      serviceName: booking.serviceName || "Service",
      scheduledStart: booking.scheduledStart,
      price: booking.priceCharged,
      status: booking.status,
      timestamp: Date.now(),
      read: false,
    };

    // Override the display logic in the UI later or just store the title here
    // For now, I'll just store the raw booking and compute display in render or add a message field
    (newNotif as any).displayTitle = title;

    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
  };

  const addAdminNotification = (payload: any) => {
    let newNotif: BookingNotification;
    
    if (payload.type === "SUPPORT_MESSAGE") {
      newNotif = {
        id: Math.random().toString(),
        customerName: payload.username,
        serviceName: "Support Chat",
        scheduledStart: new Date().toISOString(),
        price: 0,
        status: "SUPPORT",
        timestamp: Date.now(),
        read: false,
      };
      (newNotif as any).displayTitle = `New support message from ${payload.username}`;
      (newNotif as any).type = "SUPPORT_MESSAGE";
    } else {
      newNotif = {
        id: payload.id,
        customerName: payload.ownerName,
        serviceName: `Shop: ${payload.shopName}`,
        scheduledStart: new Date().toISOString(),
        price: 0,
        status: "PENDING",
        timestamp: Date.now(),
        read: false,
      };
      (newNotif as any).displayTitle = `New shop registration: ${payload.shopName}`;
      (newNotif as any).type = "SHOP_REGISTRATION";
    }

    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: BookingNotification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsOpen(false);
    
    if ((notif as any).type === "SHOP_REGISTRATION") {
      router.push("/admin/shops");
      return;
    }

    if (session?.role === "OWNER") {
      router.push("/owner/bookings");
    } else if (session?.role === "BARBER") {
      router.push("/barber");
    } else if (session?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/app/appointments");
    }
  };

  const viewAllPath = session?.role === "OWNER" 
    ? "/owner/bookings" 
    : session?.role === "BARBER" 
      ? "/barber" 
      : session?.role === "ADMIN"
        ? "/admin/shops"
        : "/app/appointments";

  return (
    <div className="relative">
      <div className="group relative">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) markAllAsRead();
          }}
          className={`rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white shrink-0 relative transition-all ${unreadCount > 0 ? "border-orange-500/50 shadow-[0_0_15px_rgba(255,136,0,0.2)]" : ""}`}
        >
          <AnimatedIcon icon={Bell} size={16} animate={unreadCount > 0 ? "wiggle" : "rotate"} />
          
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border-2 border-[#121212]"
              >
                <span className="text-[8px] font-black text-black">{unreadCount}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
        
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
          Notifications
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-[#1a1a1a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-black text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-[10px] font-bold text-white/30 hover:text-white transition uppercase tracking-widest"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center space-y-3">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                      <Bell className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-white/30 font-medium">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notif) => (
                      <button
                        key={notif.timestamp}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full p-4 text-left hover:bg-white/5 transition-colors flex gap-3 group relative ${!notif.read ? "bg-orange-500/[0.03]" : ""}`}
                      >
                        {!notif.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                        )}
                        
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          notif.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 
                          notif.status === 'RESCHEDULE_REQUESTED' || notif.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500' : 
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {notif.status === 'REJECTED' ? <XCircle className="w-5 h-5" /> : 
                           notif.status === 'RESCHEDULE_REQUESTED' ? <Calendar className="w-5 h-5" /> : 
                           (notif as any).type === "SHOP_REGISTRATION" ? (
                            <Scissors className="w-4 h-4 text-orange-400" />
                          ) : (notif as any).type === "SUPPORT_MESSAGE" ? (
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs font-bold text-white truncate">
                            {(notif as any).displayTitle}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-white/40">
                            <Scissors className="w-3 h-3" />
                            <span className="truncate">{notif.serviceName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-white/40">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(notif.scheduledStart).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        </div>
                        
                        <div className="text-[10px] font-bold text-white/20 whitespace-nowrap">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white/[0.02] border-t border-white/5">
                  <Button 
                    variant="ghost" 
                    className="w-full h-8 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(viewAllPath);
                    }}
                  >
                    View All Activity
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
