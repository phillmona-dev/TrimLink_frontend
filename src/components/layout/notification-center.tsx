"use client";

import React, { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { Bell, Calendar, User, Scissors, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { WS_BASE_URL } from "@/utils/constants";
import { Button } from "@/components/common/button";
import { AnimatedIcon } from "@/components/common/animated-icon";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/common/badge";

interface BookingNotification {
  id: string;
  customerName: string;
  serviceName: string;
  scheduledStart: string;
  price: number;
  status: string;
  timestamp: number;
  read: boolean;
}

export function NotificationCenter() {
  const { session } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const stompClient = useRef<Client | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!session?.userId) return;

    const client = new Client({
      brokerURL: WS_BASE_URL,
      onConnect: () => {
        console.log("Connected to WebSocket");
        
        // Subscribe to staff notifications
        if (session.role === "STAFF" || session.role === "OWNER") {
          client.subscribe(`/topic/staffs/${session.userId}/bookings`, (message) => {
            const booking = JSON.parse(message.body);
            addNotification(booking);
          });
        }

        // Subscribe to customer notifications
        if (session.role === "CUSTOMER") {
          client.subscribe(`/topic/customers/${session.userId}/bookings`, (message) => {
            const booking = JSON.parse(message.body);
            addNotification(booking);
          });
        }
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [session]);

  const addNotification = (booking: any) => {
    const isStaff = session?.role === "STAFF" || session?.role === "OWNER";
    
    let title = isStaff 
      ? `New booking from ${booking.customerName}`
      : `Booking Update: ${booking.serviceName}`;
      
    let icon = CheckCircle2;
    
    if (booking.status === "REJECTED") {
      title = isStaff ? `You rejected ${booking.customerName}` : `Booking rejected by ${booking.staffName}`;
      icon = XCircle;
    } else if (booking.status === "CONFIRMED") {
      title = isStaff ? `Booking confirmed` : `Booking confirmed by ${booking.staffName}`;
      icon = CheckCircle2;
    } else if (booking.status === "RESCHEDULE_REQUESTED") {
      title = isStaff ? `Reschedule requested` : `${booking.staffName} requested a reschedule`;
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

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: BookingNotification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setIsOpen(false);
    
    if (session?.role === "OWNER") {
      router.push("/owner/bookings");
    } else if (session?.role === "STAFF") {
      router.push("/staff");
    } else {
      router.push("/app/appointments");
    }
  };

  const viewAllPath = session?.role === "OWNER" 
    ? "/owner/bookings" 
    : session?.role === "STAFF" 
      ? "/staff" 
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
                          notif.status === 'RESCHEDULE_REQUESTED' ? 'bg-orange-500/10 text-orange-500' : 
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {notif.status === 'REJECTED' ? <XCircle className="w-5 h-5" /> : 
                           notif.status === 'RESCHEDULE_REQUESTED' ? <Calendar className="w-5 h-5" /> : 
                           <CheckCircle2 className="w-5 h-5" />}
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
