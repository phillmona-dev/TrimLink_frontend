"use client";

import { motion } from "framer-motion";

const backgroundImages = [
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521490685714-3d02a9eb556b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512496015851-a1cba23e7a07?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605497788044-5a32c707d386?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=800&auto=format&fit=crop"
];

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
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
              <img src={src} alt="Staff style" className="w-full h-full object-cover mix-blend-luminosity" />
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
              <img src={src} alt="Staff style" className="w-full h-full object-cover mix-blend-luminosity" />
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
              <img src={src} alt="Staff style" className="w-full h-full object-cover mix-blend-luminosity" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
