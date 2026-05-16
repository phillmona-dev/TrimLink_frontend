"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ArrowLeft, CalendarDays, Star, Gift, Tag, CheckCheck, Trash2, Sparkles, ShoppingBag, Heart } from "lucide-react";
import Link from "next/link";

type NotifType = "booking" | "points" | "promo" | "review" | "order" | "system";
interface Notif { id: string; type: NotifType; title: string; body: string; time: string; read: boolean; action?: { label: string; href: string }; }

const INITIAL: Notif[] = [
  { id: "n1", type: "booking", title: "Booking Confirmed! 🌸", body: "Your Silk Press & Style at Lumiere Beauty Lounge is confirmed for May 12 at 10:00 AM with Sara Tesfaye.", time: "2 min ago", read: false, action: { label: "View Booking", href: "/glow/dashboard" } },
  { id: "n2", type: "points", title: "GlowPoints Earned ✦", body: "You earned 85 GlowPoints from your Ombré Gel Nails appointment at Saba Nail Studio. Total: 2,450 pts.", time: "1 hour ago", read: false, action: { label: "View Loyalty", href: "/glow/dashboard" } },
  { id: "n3", type: "promo", title: "Weekend Glow Deal 💅", body: "20% off all Makeup services at Lumiere Beauty Lounge this weekend only. Limited slots available!", time: "3 hours ago", read: false, action: { label: "Book Now", href: "/glow/salons/1" } },
  { id: "n4", type: "booking", title: "Reminder: Tomorrow's Appointment", body: "Don't forget! Full Glam Makeup at Lumiere Beauty Lounge tomorrow at 10:30 AM. Stylist: Meron Haile.", time: "5 hours ago", read: true, action: { label: "View Details", href: "/glow/dashboard" } },
  { id: "n5", type: "review", title: "Rate Your Experience ⭐", body: "How was your Deep Tissue Massage at The Glow Spa on Apr 30? Share your experience to help others.", time: "Yesterday", read: true, action: { label: "Leave Review", href: "/glow/dashboard" } },
  { id: "n6", type: "order", title: "Order Shipped 📦", body: "Your GlowShop order (Vitamin C Glow Serum) has been dispatched. Expected delivery: 2–3 business days.", time: "Yesterday", read: true, action: { label: "Track Order", href: "/glow/shop" } },
  { id: "n7", type: "points", title: "Gold Tier Benefit Unlocked 👑", body: "As a Gold member, you now get priority booking at all partner salons. Enjoy your exclusive access!", time: "2 days ago", read: true },
  { id: "n8", type: "promo", title: "New Salon Near You 💄", body: "Selam Bridal Studio just joined GlowLink! They're offering 15% off for first-time bookings this month.", time: "3 days ago", read: true, action: { label: "Explore", href: "/glow/salons/4" } },
  { id: "n9", type: "system", title: "Profile Updated Successfully", body: "Your beauty profile (hair type: Natural Curly, skin type: Combination) has been saved.", time: "4 days ago", read: true },
  { id: "n10", type: "review", title: "Your Review Is Live ⭐", body: "Thank you! Your 5-star review for Lumiere Beauty Lounge is now published and helping other clients.", time: "5 days ago", read: true },
];

const TYPE_CONFIG: Record<NotifType, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  booking: { icon: <CalendarDays className="h-5 w-5" />, color: "#C8956C", bg: "rgba(200,149,108,0.15)", label: "Booking" },
  points: { icon: <Star className="h-5 w-5" />, color: "#FFD700", bg: "rgba(255,215,0,0.12)", label: "Loyalty" },
  promo: { icon: <Tag className="h-5 w-5" />, color: "#E879F9", bg: "rgba(232,121,249,0.12)", label: "Offers" },
  review: { icon: <Heart className="h-5 w-5" />, color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Review" },
  order: { icon: <ShoppingBag className="h-5 w-5" />, color: "#7CB99A", bg: "rgba(124,185,154,0.12)", label: "Order" },
  system: { icon: <Sparkles className="h-5 w-5" />, color: "rgba(253,246,238,0.5)", bg: "rgba(253,246,238,0.06)", label: "System" },
};

const FILTERS = ["All", "Booking", "Loyalty", "Offers", "Order", "Review"] as const;
type Filter = typeof FILTERS[number];

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const [filter, setFilter] = useState<Filter>("All");

  const unread = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setNotifs([]);

  const filtered = notifs.filter(n => {
    if (filter === "All") return true;
    return TYPE_CONFIG[n.type].label === filter;
  });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40"
        style={{ background: "rgba(10,5,18,0.93)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(200,149,108,0.1)" }}>
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg,transparent,rgba(200,149,108,0.4),transparent)" }} />
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/glow/discover"
              className="p-2 rounded-xl transition-all"
              style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.6)" }}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-lg font-black text-white font-editorial flex items-center gap-2">
                Notifications
                {unread > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-black" style={{ background: "linear-gradient(135deg,#C8956C,#E8B4A0)", color: "#1A0F1E" }}>
                    {unread} new
                  </span>
                )}
              </h1>
              <p className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(200,149,108,0.5)" }}>
                Your activity feed
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {unread > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                style={{ background: "rgba(200,149,108,0.1)", border: "1px solid rgba(200,149,108,0.25)", color: "#C8956C" }}>
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
            {notifs.length > 0 && (
              <button onClick={clearAll}
                className="p-2 rounded-xl transition-all"
                style={{ background: "rgba(253,246,238,0.05)", border: "1px solid rgba(200,149,108,0.15)", color: "rgba(253,246,238,0.35)" }}>
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
              style={{
                background: filter === f ? "linear-gradient(135deg,#C8956C,#E8B4A0)" : "rgba(253,246,238,0.04)",
                color: filter === f ? "#1A0F1E" : "rgba(253,246,238,0.45)",
                border: `1px solid ${filter === f ? "transparent" : "rgba(200,149,108,0.15)"}`,
                boxShadow: filter === f ? "0 0 14px rgba(200,149,108,0.3)" : "none"
              }}>
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 gap-4">
              <Bell className="h-16 w-16 text-white/8" />
              <p className="text-sm" style={{ color: "rgba(253,246,238,0.35)" }}>No notifications here</p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.some(n => !n.read) && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest px-1 pt-2 pb-1" style={{ color: "rgba(200,149,108,0.5)" }}>New</p>
                  {filtered.filter(n => !n.read).map((n, i) => (
                    <NotifCard key={n.id} notif={n} index={i} onRead={markRead} onDelete={deleteNotif} />
                  ))}
                </>
              )}
              {filtered.some(n => n.read) && (
                <>
                  <p className="text-[10px] font-black uppercase tracking-widest px-1 pt-4 pb-1" style={{ color: "rgba(253,246,238,0.2)" }}>Earlier</p>
                  {filtered.filter(n => n.read).map((n, i) => (
                    <NotifCard key={n.id} notif={n} index={i} onRead={markRead} onDelete={deleteNotif} />
                  ))}
                </>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
      <div className="h-10" />
    </div>
  );
}

function NotifCard({ notif, index, onRead, onDelete }: {
  notif: Notif; index: number;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => onRead(notif.id)}
      className="relative flex gap-3 p-4 rounded-2xl cursor-pointer transition-all group overflow-hidden"
      style={{
        background: notif.read ? "rgba(253,246,238,0.03)" : "rgba(200,149,108,0.07)",
        border: `1px solid ${notif.read ? "rgba(200,149,108,0.1)" : "rgba(200,149,108,0.25)"}`,
      }}>
      {/* Shimmer top edge for unread */}
      {!notif.read && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${cfg.color}66, transparent)` }} />
      )}
      {!notif.read && (
        <span className="absolute top-4 right-4 h-2 w-2 rounded-full animate-pulse" style={{ background: cfg.color }} />
      )}
      <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: cfg.bg, color: cfg.color, boxShadow: notif.read ? "none" : `0 0 16px ${cfg.color}33` }}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <p className={`text-sm font-bold leading-snug mb-0.5 ${notif.read ? "text-white/70" : "text-white"}`}>{notif.title}</p>
        <p className="text-xs leading-relaxed mb-2" style={{ color: "rgba(253,246,238,0.45)" }}>{notif.body}</p>
        <div className="flex items-center gap-3">
          <span className="text-[10px]" style={{ color: "rgba(253,246,238,0.3)" }}>{notif.time}</span>
          {notif.action && (
            <Link href={notif.action.href} onClick={e => e.stopPropagation()}
              className="text-[10px] font-black uppercase tracking-wider transition-colors hover:opacity-80"
              style={{ color: cfg.color }}>
              {notif.action.label} →
            </Link>
          )}
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(notif.id); }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/30 hover:text-red-400">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
