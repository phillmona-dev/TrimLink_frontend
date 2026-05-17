"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ArrowLeft, CalendarDays, Star, Tag, CheckCheck, Trash2, Sparkles, ShoppingBag, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const C = { primary:"#9e5d41", text:"#3c2a23", text2:"#8e5238", muted:"#b08d7e", border:"#e8cdb9", surface:"#FFFFFF", bg:"#FDF6F0" };
type NotifType = "booking"|"points"|"promo"|"review"|"order"|"system";
interface Notif { id:string; type:NotifType; title:string; body:string; time:string; read:boolean; action?:{label:string;href:string}; }

const INITIAL: Notif[] = [
  { id:"n1", type:"booking", title:"Booking Confirmed! 🌸", body:"Your Silk Press & Style at Lumiere Beauty Lounge is confirmed for May 12 at 10:00 AM.", time:"2 min ago", read:false, action:{label:"View Booking",href:"/glow/dashboard"} },
  { id:"n2", type:"points", title:"GlowPoints Earned ✦", body:"You earned 85 GlowPoints from your Ombré Gel Nails appointment at Saba Nail Studio.", time:"1 hour ago", read:false, action:{label:"View Loyalty",href:"/glow/dashboard"} },
  { id:"n3", type:"promo", title:"Weekend Glow Deal 💅", body:"20% off all Makeup services at Lumiere Beauty Lounge this weekend only.", time:"3 hours ago", read:false, action:{label:"Book Now",href:"/glow/salons/1"} },
  { id:"n4", type:"booking", title:"Reminder: Tomorrow's Appointment", body:"Don't forget! Full Glam Makeup at Lumiere tomorrow at 10:30 AM.", time:"5 hours ago", read:true, action:{label:"View Details",href:"/glow/dashboard"} },
  { id:"n5", type:"review", title:"Rate Your Experience ⭐", body:"How was your Deep Tissue Massage at The Glow Spa on Apr 30?", time:"Yesterday", read:true, action:{label:"Leave Review",href:"/glow/dashboard"} },
  { id:"n6", type:"order", title:"Order Shipped 📦", body:"Your GlowShop order (Vitamin C Glow Serum) has been dispatched.", time:"Yesterday", read:true, action:{label:"Track Order",href:"/glow/shop"} },
  { id:"n7", type:"points", title:"Gold Tier Benefit Unlocked 👑", body:"As a Gold member, you now get priority booking at all partner salons.", time:"2 days ago", read:true },
  { id:"n8", type:"promo", title:"New Salon Near You 💄", body:"Selam Bridal Studio just joined GlowLink! 15% off for first-time bookings.", time:"3 days ago", read:true, action:{label:"Explore",href:"/glow/salons/4"} },
];

const TYPE_CONFIG: Record<NotifType,{icon:React.ReactNode;color:string;bg:string;label:string}> = {
  booking: {icon:<CalendarDays className="h-4 w-4"/>, color:"#9e5d41", bg:"#f9ebe2", label:"Booking"},
  points:  {icon:<Star className="h-4 w-4"/>,         color:"#e5a02e", bg:"#fdf6eb", label:"Loyalty"},
  promo:   {icon:<Tag className="h-4 w-4"/>,          color:"#b8539c", bg:"#fceaf6", label:"Offers"},
  review:  {icon:<Heart className="h-4 w-4"/>,        color:"#c25953", bg:"#fcecec", label:"Review"},
  order:   {icon:<ShoppingBag className="h-4 w-4"/>,  color:"#548c71", bg:"#e6f2eb", label:"Order"},
  system:  {icon:<Sparkles className="h-4 w-4"/>,     color:"#b08d7e", bg:"#f0e4db", label:"System"},
};
const FILTERS = ["All","Booking","Loyalty","Offers","Order","Review"] as const;
type Filter = typeof FILTERS[number];

function NotifCard({ notif, index, onRead, onDelete }:{notif:Notif;index:number;onRead:(id:string)=>void;onDelete:(id:string)=>void}) {
  const cfg = TYPE_CONFIG[notif.type];
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20}} transition={{delay:index*0.04}}
      onClick={()=>onRead(notif.id)}
      className="relative flex gap-4 p-5 rounded-xl cursor-pointer transition-shadow hover:shadow-md group"
      style={{
        background: notif.read ? C.surface : "#FDF6F0",
        border: `1px solid ${notif.read ? C.border : cfg.color+"44"}`,
        boxShadow: notif.read ? "0 1px 3px rgba(0,0,0,0.02)" : "0 4px 12px rgba(158,93,65,0.08)"
      }}>
      
      {!notif.read && <span className="absolute top-5 right-5 h-2 w-2 rounded-full" style={{background:cfg.color}}/>}
      
      <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border border-white/50" style={{background:cfg.bg,color:cfg.color}}>
        {cfg.icon}
      </div>
      
      <div className="flex-1 min-w-0 pr-6">
        <p className={`text-base font-bold leading-snug mb-1 ${notif.read ? "" : "text-[#9e5d41]"}`} style={{color: notif.read ? C.text : undefined}}>{notif.title}</p>
        <p className="text-sm leading-relaxed mb-3 font-medium" style={{color:C.text2}}>{notif.body}</p>
        
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold" style={{color:C.muted}}>{notif.time}</span>
          {notif.action && (
            <Link href={notif.action.href} onClick={e=>e.stopPropagation()}
              className="text-xs font-bold hover:underline" style={{color:cfg.color}}>
              {notif.action.label} <span className="ml-0.5">→</span>
            </Link>
          )}
        </div>
      </div>
      
      <button onClick={e=>{e.stopPropagation();onDelete(notif.id);}}
        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-black/5"
        style={{color:C.muted}}>
        <Trash2 className="h-4 w-4"/>
      </button>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const [filter, setFilter] = useState<Filter>("All");
  
  const unread = notifs.filter(n=>!n.read).length;
  const markAllRead = () => setNotifs(prev=>prev.map(n=>({...n,read:true})));
  const markRead = (id:string) => setNotifs(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));
  const deleteNotif = (id:string) => setNotifs(prev=>prev.filter(n=>n.id!==id));
  const clearAll = () => setNotifs([]);
  
  const filtered = notifs.filter(n=>filter==="All"||TYPE_CONFIG[n.type].label===filter);

  return (
    <div className="min-h-screen relative p-4 md:p-12 flex justify-center items-center font-sans text-[#5c443b] bg-transparent">
      <div className="w-full max-w-[1400px] bg-[#fcf7f4] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 transform transition-transform hover:scale-[1.005] duration-700 flex flex-col min-h-[800px] border border-white/20">
        
        <header className="sticky top-0 z-40 bg-[#FDF6F0] rounded-t-xl border-b border-[#e8cdb9]">
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2.5 rounded-lg bg-white border border-[#e8cdb9] text-[#8e5238] hover:bg-[#f9ebe2] transition-colors cursor-pointer">
                <ArrowLeft className="h-5 w-5"/>
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-[#3c2a23]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Notifications
                  {unread > 0 && <span className="text-xs px-2.5 py-1 rounded-md font-bold text-white shadow-sm" style={{background:C.primary}}>{unread}</span>}
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-[#b08d7e]">Your activity feed</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition-all bg-[#FDF6F0] border border-[#e8cdb9] text-[#9e5d41] hover:bg-[#f9ebe2]">
                  <CheckCheck className="h-4 w-4"/> Mark all read
                </button>
              )}
              {notifs.length > 0 && (
                <button onClick={clearAll} className="p-2.5 rounded-lg transition-all bg-white border border-[#e8cdb9] text-[#b08d7e] hover:bg-[#fcecec] hover:text-[#c25953] hover:border-[#f5c2c2]">
                  <Trash2 className="h-5 w-5"/>
                </button>
              )}
            </div>
          </div>
          
          <div className="px-6 py-3 bg-white border-t border-[#e8cdb9] flex gap-2 overflow-x-auto scrollbar-hide">
            {FILTERS.map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className="shrink-0 px-4 py-2 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all"
                style={{
                  background: filter === f ? C.primary : "#FDF6F0",
                  color: filter === f ? "white" : C.text2,
                  border: `1px solid ${filter === f ? "transparent" : C.border}`
                }}>
                {f}
              </button>
            ))}
          </div>
        </header>

        <div className="p-6 md:p-8 flex-1 bg-white rounded-b-xl">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center py-24 gap-5">
                <div className="h-20 w-20 rounded-full flex items-center justify-center bg-[#FDF6F0] border border-[#e8cdb9]">
                  <Bell className="h-10 w-10 text-[#e8cdb9]" />
                </div>
                <p className="text-sm font-bold text-[#8e5238]">No notifications here</p>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col gap-4">
                {filtered.some(n=>!n.read) && (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest px-1 pt-2 pb-2 text-[#9e5d41]">New</p>
                    <div className="flex flex-col gap-3">
                      {filtered.filter(n=>!n.read).map((n,i)=><NotifCard key={n.id} notif={n} index={i} onRead={markRead} onDelete={deleteNotif}/>)}
                    </div>
                  </>
                )}
                
                {filtered.some(n=>n.read) && (
                  <>
                    <p className="text-xs font-bold uppercase tracking-widest px-1 pt-6 pb-2 text-[#b08d7e]">Earlier</p>
                    <div className="flex flex-col gap-3">
                      {filtered.filter(n=>n.read).map((n,i)=><NotifCard key={n.id} notif={n} index={i} onRead={markRead} onDelete={deleteNotif}/>)}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
