"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/common/button";
import { barberService } from "@/api/barberService";
import { ownerService } from "@/api/ownerService";
import { http } from "@/api/http";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Scissors, Plus, ChevronLeft, ChevronRight, X, Info, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/common/dialog";
import { AIStyleAdvisor } from "@/components/common/ai-style-advisor";

const STYLES = [
  // Existing static styles
  { id:"h1", name:"Habesha Curly Top Fade", category:"Fade", imageUrl:"/images/haircuts/habesha_cut_1.png", tags:["Habesha","Curly","Fade"], description:"Beautiful natural curly volume on top with clean tapered skin fade on sides." },
  { id:"h2", name:"Habesha Taper Cut", category:"Short", imageUrl:"/images/haircuts/habesha_cut_2.png", tags:["Classic","Taper","Habesha"], description:"Traditional low-taper cut suited for daily formal and casual wear." },
  { id:"h3", name:"Habesha Twist Fade", category:"Fade", imageUrl:"/images/haircuts/habesha_cut_3.png", tags:["Twists","Ethiopian","Fade"], description:"Addis-trending twist curls with a sharp drop skin fade." },
  
  // 10 new Habesha styles for all age groups
  { id:"hab_y1", name:"Habesha Youth High-Top Fade", category:"Fade", imageUrl:"/images/haircuts/habesha_youth_hightop.png", tags:["Habesha","Fade","Youth","Curly"], description:"Natural curly coily afro hair on top with a fresh clean skin fade on the sides. Very popular for teens." },
  { id:"hab_y2", name:"Habesha Temple Taper", category:"Fade", imageUrl:"/images/haircuts/habesha_temple_fade.png", tags:["Habesha","Taper","Modern","Young Adult"], description:"Sharp clean lines at the temples with a low taper fade and neatly shaped natural coils. Ideal for young adults." },
  { id:"hab_m1", name:"Habesha Caesar Cut", category:"Short", imageUrl:"/images/haircuts/habesha_caesar.png", tags:["Habesha","Short","Classic","Adult"], description:"Very short uniform length all over the top with a precise lineup and low skin fade. Great clean professional look." },
  { id:"hab_y3", name:"Habesha Edgar Cut", category:"Modern", imageUrl:"/images/haircuts/habesha_edgar.png", tags:["Habesha","Modern","Crop","Teen"], description:"Straight horizontal blunt fringe across the forehead with a high skin fade and short textured top. Modern youth style." },
  { id:"hab_o1", name:"Habesha Mature Taper", category:"Short", imageUrl:"/images/haircuts/habesha_mature_taper.png", tags:["Habesha","Classic","Taper","Mature"], description:"Dignified low taper cut with a well-groomed short top and subtle gray blends. Excellent for mature gentlemen." },
  { id:"hab_a1", name:"Habesha Natural Afro", category:"Modern", imageUrl:"/images/haircuts/habesha_natural_afro.png", tags:["Habesha","Afro","Natural","All Ages"], description:"A gorgeous, perfectly symmetrical rounded natural afro highlighting natural coils. Classic style for all ages." },
  { id:"hab_c1", name:"Habesha Low Crop", category:"Short", imageUrl:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=540&auto=format&fit=crop&q=90", tags:["Habesha","Short","Clean","Adult"], description:"Ultra-neat low-cropped natural waves with a low shadow taper. Versatile and sharp." },
  { id:"hab_b1", name:"Habesha Clean Buzz Cut", category:"Short", imageUrl:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=540&auto=format&fit=crop&q=90", tags:["Habesha","Buzz","Classic","All Ages"], description:"Uniform buzz cut with a crisp hairline and micro-fade on the sideburns. Suited for all age groups." },
  { id:"hab_mo", name:"Habesha Modern Mohawk Taper", category:"Fade", imageUrl:"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=540&auto=format&fit=crop&q=90", tags:["Habesha","Mohawk","Fade","Modern"], description:"Bold look featuring natural curls tapering down into a high fade, running from forehead to nape." },
  { id:"hab_tw", name:"Habesha Twist Out", category:"Modern", imageUrl:"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=540&auto=format&fit=crop&q=90", tags:["Habesha","Twists","Volume","Youth"], description:"Beautifully defined two-strand twist out volume with medium length coils. Trendy and expressive." },

  // Rest of existing static styles
  { id:"t1", name:"Textured Crop", category:"Modern", imageUrl:"/images/haircuts/haircut1.png", tags:["Crop","Textured","Teen"], description:"Blunt messy fringe on top with high bald fade for teenagers." },
  { id:"t2", name:"Urban Shadow Taper", category:"Fade", imageUrl:"/images/haircuts/haircut2.png", tags:["Shadow","Taper","Modern"], description:"Smooth shadow taper fade preserving volume around the crown." },
  { id:"t3", name:"Precise Skin Burst", category:"Fade", imageUrl:"/images/haircuts/haircut3.png", tags:["Burst","Skin","Modern"], description:"Burst fade curving around the ear, creating a clean athletic silhouette." },
  { id:"t4", name:"High Top Textures", category:"Modern", imageUrl:"/images/haircuts/haircut4.png", tags:["High Top","Volume","Teen"], description:"High top volume textured curls with sharp side line-ups." },
  { id:"t5", name:"Classic Clean Crop", category:"Short", imageUrl:"/images/haircuts/haircut5.png", tags:["Short","Clean","Crop"], description:"Minimal crop cut with short neat fringe and soft taper." },
  { id:"e1", name:"Sleek Side Quiff", category:"Classic", imageUrl:"/images/haircuts/ext_cut_1.jpg", tags:["Quiff","Sleek","Classic"], description:"Polished side-swept quiff for professional and formal styling." },
  { id:"e2", name:"Buzz Cut Fade", category:"Short", imageUrl:"/images/haircuts/ext_cut_2.jpg", tags:["Buzz","Short","Fade"], description:"Very low-maintenance uniform buzz cut with soft skin taper." },
  { id:"e3", name:"Gentleman Parted Taper", category:"Classic", imageUrl:"/images/haircuts/ext_cut_3.jpg", tags:["Parted","Taper","Gentleman"], description:"Clean side parting with classic scissor-cut tapered sides." },
  { id:"e5", name:"Modern Pomp Taper", category:"Classic", imageUrl:"/images/haircuts/ext_cut_5.jpg", tags:["Pompadour","Volume","Taper"], description:"Swept-back volume pompadour with subtle taper outline." },
  { id:"e8", name:"Addis Burst Fade", category:"Modern", imageUrl:"/images/haircuts/ext_cut_8.jpg", tags:["Burst","Fade","Modern"], description:"Trending burst fade style with natural textured growth on top." },
  { id:"s1", name:"Classic Buzz Cut", category:"Short", imageUrl:"https://images.unsplash.com/photo-1605497746444-052d59fac596?w=800&h=540&auto=format&fit=crop&q=90", tags:["Buzz","Classic"], description:"Uniform short length all over — the cleanest low-maintenance cut." },
  { id:"s2", name:"Mid Skin Fade", category:"Fade", imageUrl:"https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&h=540&auto=format&fit=crop&q=90", tags:["Mid","Fade"], description:"Fade begins at the midpoint for a balanced silhouette." },
  { id:"s3", name:"Executive Crop", category:"Classic", imageUrl:"https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&h=540&auto=format&fit=crop&q=90", tags:["Formal","Classic"], description:"Professional side-parted style with clean lines." },
  { id:"s4", name:"Textured Top", category:"Modern", imageUrl:"https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&h=540&auto=format&fit=crop&q=90", tags:["Texture","Modern"], description:"Messy textured volume paired with a crisp fade." },
  { id:"s5", name:"Afro Taper", category:"Fade", imageUrl:"https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&h=540&auto=format&fit=crop&q=90", tags:["Afro","Natural"], description:"Natural curl volume with a clean tapered line." },
];

const CATS = ["ALL","Fade","Short","Classic","Modern"];
const PHOTOS_PER_SPREAD = 6; // 3 rows × 2 cols = 6 per open spread
const FLIP_DURATION = 1.8; // Elegant, slow-motion physical page turn

export function StylesLibraryPage() {
  const { session } = useAuth();
  const [pg, setPg] = useState(0);
  const [zoom, setZoom] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [cat, setCat] = useState("ALL");
  const [toast, setToast] = useState<string|null>(null);
  const [flipDir, setFlipDir] = useState<"n"|"p">("n");
  const [isFlipping, setIsFlipping] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);

  const { data: dbStyles } = useQuery({ queryKey:["hs"], queryFn: async()=>{ const {data}=await http.get("/haircut-styles"); return data?.data||[]; } });

  // Merge database styles and frontend static styles dynamically
  const list: any[] = [];
  const seen = new Set<string>();
  if (dbStyles && dbStyles.length > 0) {
    dbStyles.forEach((s: any) => {
      list.push(s);
      seen.add(s.name.toLowerCase());
    });
  }
  STYLES.forEach((s: any) => {
    if (!seen.has(s.name.toLowerCase())) {
      list.push(s);
      seen.add(s.name.toLowerCase());
    }
  });

  const filtered = cat==="ALL" ? list : list.filter((s:any)=>s.category===cat);
  const totalSpreads = Math.max(1, Math.ceil(filtered.length / PHOTOS_PER_SPREAD));

  const isBarber = session?.role==="BARBER";
  const { data:bp } = useQuery({ queryKey:["bp",session?.userId], queryFn:()=>barberService.getBarber(session!.userId), enabled:!!session?.userId&&isBarber });
  const { data:bsvc, refetch } = useQuery({ queryKey:["bsvc",bp?.id], queryFn:()=>ownerService.getBarberServices(bp!.id), enabled:!!bp?.id });
  const linkMut = useMutation({
    mutationFn: async(v:{aid:string;urls:string[]})=>{ const {data}=await http.put(`/barber/services/${bp!.id}/assignments/${v.aid}/styles`,v.urls); return data; },
    onSuccess: ()=>{ refetch(); setAddOpen(false); setToast("Linked!"); setTimeout(()=>setToast(null),2500); },
  });

  const getSpreadPhotos = (idx: number) => {
    const start = idx * PHOTOS_PER_SPREAD;
    return filtered.slice(start, start + PHOTOS_PER_SPREAD);
  };

  const go = (d: "n"|"p") => {
    if (isFlipping) return;
    if (d==="n" && pg < totalSpreads-1) {
      setFlipDir("n");
      setIsFlipping(true);
      setTimeout(() => {
        setPg(p => p + 1);
        setIsFlipping(false);
      }, FLIP_DURATION * 1000);
    }
    if (d==="p" && pg > 0) {
      setFlipDir("p");
      setIsFlipping(true);
      setTimeout(() => {
        setPg(p => p - 1);
        setIsFlipping(false);
      }, FLIP_DURATION * 1000);
    }
  };

  // Underneath Stationary pages setup during page turn animation
  const currentPhotos = getSpreadPhotos(pg);
  const nextPhotos = getSpreadPhotos(pg + 1);
  const prevPhotos = getSpreadPhotos(pg - 1);

  // Left Page Content (Left Column)
  const leftColCurrent = [currentPhotos[0], currentPhotos[2], currentPhotos[4]];
  const leftColPrev = [prevPhotos[0], prevPhotos[2], prevPhotos[4]];
  const leftColDisplay = (isFlipping && flipDir === "p") ? leftColPrev : leftColCurrent;

  // Right Page Content (Right Column)
  const rightColCurrent = [currentPhotos[1], currentPhotos[3], currentPhotos[5]];
  const rightColNext = [nextPhotos[1], nextPhotos[3], nextPhotos[5]];
  const rightColDisplay = (isFlipping && flipDir === "n") ? rightColNext : rightColCurrent;

  // Flipping sheet page contents
  const flipFrontPhotos = flipDir === "n" ? rightColCurrent : leftColCurrent;
  const flipBackPhotos = flipDir === "n" 
    ? [nextPhotos[0], nextPhotos[2], nextPhotos[4]] // next left column
    : [prevPhotos[1], prevPhotos[3], prevPhotos[5]]; // prev right column

  const PhotoSlot = ({ s }: { s: any|undefined }) => {
    if (!s) return <div style={{flex:1,background:"#111",border:"1px solid rgba(255,255,255,0.02)",borderRadius:2}} />;
    return (
      <div onClick={()=>setZoom(s)} className="group relative cursor-pointer overflow-hidden" style={{flex:1,borderRadius:3,border:"3px solid rgba(255,255,255,0.12)",boxShadow:"0 2px 8px rgba(0,0,0,0.5)",background:"#000"}}>
        <img src={s.imageUrl} alt={s.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" style={{display:"block"}} />
        {/* Clear plastic sleeve shine effect */}
        <div className="absolute inset-0 pointer-events-none" style={{background:"linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.06) 100%)"}} />
        {/* Hover overlay with name */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end opacity-0 group-hover:opacity-100">
          <div className="p-2.5 w-full text-left">
            <p className="text-white font-black text-xs drop-shadow-xl">{s.name}</p>
            <p className="text-orange-300 text-[8px] font-bold uppercase tracking-wider">{s.category}</p>
          </div>
        </div>
      </div>
    );
  };

  const PageContent = ({ photos, side, pageNum }: { photos: any[]; side: "L" | "R"; pageNum: number }) => (
    <div className="flex flex-col flex-1 h-full" style={{
      // Spine padding calculations: 18px next to spine, 10px next to leather edge
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingLeft: side === "L" ? "10px" : "18px",
      paddingRight: side === "L" ? "18px" : "10px",
      gap: "6px",
      background: "#1a1a1a",
      boxShadow: side === "L"
        ? "inset -12px 0 24px rgba(0,0,0,0.5)"
        : "inset 12px 0 24px rgba(0,0,0,0.5)",
      position: "relative",
    }}>
      {photos.map((s, i) => <PhotoSlot key={s?.id || `empty-${side}-${i}`} s={s} />)}
      
      <div className="text-center text-[8px] font-black tracking-widest uppercase mt-1.5"
        style={{ color: "rgba(255,255,255,0.15)" }}>Page {pageNum}</div>
    </div>
  );

  return (
    <div className="relative flex flex-col items-center overflow-hidden" style={{
      minHeight:"calc(100vh - 96px)",
      backgroundImage:"url('/wood_desk_background.png')",
      backgroundSize:"cover",
      backgroundPosition:"center",
    }}>
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 100% 100% at 50% 50%, transparent 25%, rgba(0,0,0,0.6) 100%)"}} />

      {/* Toast */}
      <AnimatePresence>{toast && <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="fixed top-6 right-6 z-[200] bg-orange-500 text-black px-5 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-2"><Sparkles className="w-4 h-4"/>{toast}</motion.div>}</AnimatePresence>

      {/* Category filters + AI button */}
      <div className="relative z-20 flex items-center gap-1.5 pt-4 pb-3 flex-wrap justify-center">
        {CATS.map(c=><button key={c} onClick={()=>{if(!isFlipping){setCat(c);setPg(0);}}} className={`px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${cat===c?"bg-orange-500 text-black border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]":"bg-black/50 text-white/40 border-white/10 hover:text-white/60"}`}>{c}</button>)}

        {/* AI Style Advisor Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setAdvisorOpen(true)}
          className="ml-2 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border border-orange-500/40"
          style={{
            background: "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(251,146,60,0.10))",
            color: "#fb923c",
            boxShadow: "0 0 14px rgba(249,115,22,0.2), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <Sparkles className="w-3 h-3" />
          AI Style Advisor
        </motion.button>
      </div>

      {/* AI Style Advisor Modal */}
      <AIStyleAdvisor
        open={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
        styles={list}
        onStyleSelect={(style) => {
          setAdvisorOpen(false);
          // Open the chosen style in the lightbox after a short delay for nice UX
          setTimeout(() => setZoom(style), 300);
          setToast(`✨ ${style.name} recommended for you!`);
          setTimeout(() => setToast(null), 3000);
        }}
      />

      {/* FLAT TOP-DOWN ALBUM — No full-book rotation, page flippes in the middle */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4 py-2">
        <div style={{
          perspective: "1600px",
          width: "min(960px, 94vw)",
          maxHeight: "min(720px, 78vh)",
          filter: "drop-shadow(0 25px 65px rgba(0,0,0,0.85)) drop-shadow(0 10px 25px rgba(0,0,0,0.6))",
        }}>
          {/* THE OPEN ALBUM CONTAINER */}
          <div className="flex w-full relative" style={{ aspectRatio: "4/3", transformStyle: "preserve-3d" }}>
            
            {/* LEFT OUTER LEATHER EDGE */}
            <div style={{width:26,flexShrink:0,background:"linear-gradient(to right,#111,#1e1e1e,#111)",borderRadius:"6px 0 0 6px",boxShadow:"inset -3px 0 8px rgba(0,0,0,0.7)"}} />

            {/* LEFT STATIONARY UNDERNEATH PAGE */}
            <PageContent 
              photos={leftColDisplay} 
              side="L" 
              pageNum={(isFlipping && flipDir === "p") ? (pg - 1) * 2 + 1 : pg * 2 + 1} 
            />

            {/* CENTER SPINE — stitched leather binding */}
            <div style={{width:36,flexShrink:0,zIndex:40,background:"linear-gradient(to right,#0d0d0d,#222,#0d0d0d)",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:12,padding:"16px 0",boxShadow:"0 0 16px rgba(0,0,0,0.9)"}}>
              {[...Array(14)].map((_,i)=><div key={i} style={{width:2,height:8,borderRadius:1,background:"rgba(255,255,255,0.12)"}} />)}
            </div>

            {/* RIGHT STATIONARY UNDERNEATH PAGE */}
            <PageContent 
              photos={rightColDisplay} 
              side="R" 
              pageNum={(isFlipping && flipDir === "n") ? (pg + 1) * 2 + 2 : pg * 2 + 2} 
            />

            {/* RIGHT OUTER LEATHER EDGE */}
            <div style={{width:26,flexShrink:0,background:"linear-gradient(to left,#111,#1e1e1e,#111)",borderRadius:"0 6px 6px 0",boxShadow:"inset 3px 0 8px rgba(0,0,0,0.7)"}} />

            {/* ── 3D FLIPPING PAGE SHEET OVERLAY ── */}
            {isFlipping && (
              <motion.div
                initial={{ rotateY: flipDir === "n" ? 0 : -180 }}
                animate={{ rotateY: flipDir === "n" ? -180 : 0 }}
                transition={{ duration: FLIP_DURATION, ease: [0.25, 1, 0.5, 1] }}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: "50%",
                  width: "calc(50% - 26px)", // exactly half book page width
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                  zIndex: 30,
                }}
              >
                {/* FRONT FACE (Flipping Page Front Side) */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                }}>
                  <PageContent 
                    photos={flipFrontPhotos} 
                    side={flipDir === "n" ? "R" : "L"} 
                    pageNum={flipDir === "n" ? pg * 2 + 2 : pg * 2 + 1} 
                  />
                </div>

                {/* BACK FACE (Flipping Page Back Side, turned over) */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  transformStyle: "preserve-3d",
                }}>
                  <PageContent 
                    photos={flipBackPhotos} 
                    side={flipDir === "n" ? "L" : "R"} 
                    pageNum={flipDir === "n" ? (pg + 1) * 2 + 1 : (pg - 1) * 2 + 2} 
                  />
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Page flip controls */}
      <div className="relative z-20 flex items-center gap-8 pb-5">
        <button onClick={()=>go("p")} disabled={pg===0||isFlipping} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black/55 border border-white/10 text-white/50 hover:text-white hover:bg-black/75 disabled:opacity-20 disabled:pointer-events-none transition-all text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
          <ChevronLeft className="w-3.5 h-3.5"/> Prev
        </button>
        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{pg+1} / {totalSpreads}</span>
        <button onClick={()=>go("n")} disabled={pg===totalSpreads-1||isFlipping} className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-20 disabled:pointer-events-none transition-all text-[10px] font-black uppercase tracking-widest shadow-[0_0_18px_rgba(249,115,22,0.45)]">
          Next <ChevronRight className="w-3.5 h-3.5"/>
        </button>
      </div>

      {/* ZOOM LIGHTBOX */}
      <AnimatePresence>
        {zoom && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={e=>{if(e.target===e.currentTarget)setZoom(null);}} className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{
            backgroundImage: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(0,0,0,0.4) 25%, rgba(0,0,0,0.8) 100%), url('/wood_desk_background.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
            <motion.div initial={{scale:0.86,y:30,opacity:0}} animate={{scale:1,y:0,opacity:1}} exit={{scale:0.86,y:30,opacity:0}} transition={{type:"spring",stiffness:300,damping:26}} className="relative bg-zinc-950 border border-white/10 rounded-[2.5rem] overflow-hidden w-full max-w-[800px] flex flex-col md:flex-row" style={{boxShadow:"0 40px 80px rgba(0,0,0,0.9)"}}>
              <button onClick={()=>setZoom(null)} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/75 hover:bg-white/10 text-white/60 hover:text-white transition"><X className="w-5 h-5"/></button>
              <div className="w-full md:w-[55%] overflow-hidden bg-black" style={{minHeight:300}}><img src={zoom.imageUrl} alt={zoom.name} className="w-full h-full object-cover" style={{maxHeight:520}}/></div>
              <div className="flex-1 p-7 flex flex-col justify-between gap-5 text-left">
                <div className="space-y-4">
                  <span className="inline-block text-[9px] font-black uppercase tracking-widest bg-orange-500/15 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full">{zoom.category}</span>
                  <h2 className="text-2xl font-black text-white">{zoom.name}</h2>
                  <p className="text-white/55 text-xs sm:text-sm leading-relaxed">{zoom.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(zoom.tags)?zoom.tags:String(zoom.tags||"").split(",")).map((t:string)=><span key={t} className="text-[9px] font-black bg-white/5 border border-white/8 px-2.5 py-1 rounded-lg text-white/40 uppercase tracking-wider">{t}</span>)}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 space-y-3">
                  {isBarber
                    ? <button onClick={()=>setAddOpen(true)} className="w-full h-11 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-2xl flex items-center gap-2 justify-center text-sm"><Plus size={16}/>Add to My Services</button>
                    : <div className="flex items-center gap-2 p-3 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] text-white/40 font-bold uppercase tracking-wider justify-center"><Info size={13} color="#fb923c"/>Attach when booking</div>
                  }
                  <button onClick={()=>setZoom(null)} className="w-full h-11 bg-transparent border border-white/10 rounded-2xl text-white/70 font-bold hover:bg-white/5 transition text-sm">Back to Album</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LINK TO SERVICE DIALOG */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white rounded-[2rem] sm:max-w-[420px]">
          <DialogHeader><DialogTitle className="text-xl font-black flex items-center gap-2"><Scissors className="w-5 h-5 text-orange-400"/>Link to Service</DialogTitle></DialogHeader>
          <div className="py-3 space-y-2 text-left">
            {zoom && <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-2xl"><img src={zoom.imageUrl} alt={zoom.name} className="w-11 h-11 rounded-xl object-cover"/><div><p className="font-bold text-white text-sm">{zoom.name}</p><p className="text-[10px] text-white/40">{zoom.category}</p></div></div>}
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {!bsvc?.length ? <p className="text-center text-white/30 text-xs py-4">No services.</p>
                : bsvc.map((a:any)=>{const linked=a.styleImageUrls?.includes(zoom?.imageUrl);return(
                  <div key={a.assignmentId} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                    <div><p className="font-bold text-white text-sm">{a.serviceName}</p><p className="text-[10px] text-white/40">{a.effectivePrice} ETB</p></div>
                    <Button onClick={()=>linkMut.mutate({aid:a.assignmentId,urls:[...(a.styleImageUrls||[]),zoom?.imageUrl]})} disabled={linked||linkMut.isPending} className={`h-8 px-3 text-xs font-bold rounded-lg ${linked?"bg-emerald-500/20 text-emerald-400":"bg-white text-black hover:bg-gray-200"}`}>{linked?<><Check className="w-3 h-3 mr-1"/>Linked</>:"Link"}</Button>
                  </div>);
                })}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={()=>setAddOpen(false)} className="w-full rounded-xl border-white/10 font-bold">Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
