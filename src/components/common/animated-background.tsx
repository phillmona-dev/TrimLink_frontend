"use client";

import { motion } from "framer-motion";

const backgroundImages = [
  "/images/haircuts/haircut1.png",
  "/images/haircuts/habesha_cut_1.png",
  "/images/haircuts/ext_cut_1.jpg",
  "/images/haircuts/haircut2.png",
  "/images/haircuts/ext_cut_2.jpg",
  "/images/haircuts/habesha_cut_2.png",
  "/images/haircuts/ext_cut_3.jpg",
  "/images/haircuts/haircut3.png",
  "/images/haircuts/ext_cut_5.jpg",
  "/images/haircuts/habesha_cut_3.png",
  "/images/haircuts/ext_cut_8.jpg"
];

export function AnimatedBackground() {
  return (
    <>
      {/* Mobile Fluid Glassmorphic Background */}
      <div className="md:hidden fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.2, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] bg-orange-600/30 rounded-full blur-[80px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -30, 20, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.9, 1.2, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] -right-[20%] w-[90vw] h-[90vw] bg-blue-600/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            x: [0, 40, -30, 0],
            y: [0, 20, -40, 0],
            scale: [1, 1.1, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[10%] left-[10%] w-[70vw] h-[70vw] bg-purple-600/20 rounded-full blur-[90px]"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[60px] z-10" />
      </div>

      {/* Desktop Image Tracks Background */}
      <div className="hidden md:block fixed inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        {/* Dark gradient overlay to blend images smoothly with the theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]/80 z-10" />
        
        {/* Image Tracks */}
        <div className="absolute inset-0 opacity-60 flex flex-col justify-around rotate-[-12deg] scale-[1.5]">
          {/* Row 1 moving right */}
          <motion.div
            className="flex gap-4"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          >
            {[...backgroundImages, ...backgroundImages].map((src, i) => (
              <div key={i} className="w-64 h-64 shrink-0 rounded-3xl overflow-hidden shadow-2xl">
                <img src={src} alt="Barber style" className="w-full h-full object-cover mix-blend-luminosity" />
              </div>
            ))}
          </motion.div>
          
          {/* Row 2 moving left */}
          <motion.div
            className="flex gap-4"
            animate={{ x: [-1000, 0] }}
            transition={{ repeat: Infinity, duration: 45, ease: "linear" }}
          >
            {[...backgroundImages, ...backgroundImages].reverse().map((src, i) => (
              <div key={i} className="w-80 h-80 shrink-0 rounded-3xl overflow-hidden shadow-2xl">
                <img src={src} alt="Barber style" className="w-full h-full object-cover mix-blend-luminosity" />
              </div>
            ))}
          </motion.div>

          {/* Row 3 moving right */}
          <motion.div
            className="flex gap-4"
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 50, ease: "linear" }}
          >
            {[...backgroundImages, ...backgroundImages].map((src, i) => (
              <div key={i} className="w-64 h-64 shrink-0 rounded-3xl overflow-hidden shadow-2xl">
                <img src={src} alt="Barber style" className="w-full h-full object-cover mix-blend-luminosity" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
