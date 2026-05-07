"use client";

import React from "react";
import { motion } from "framer-motion";

interface HaircutCardProps {
  image: string;
  name: string;
  tag?: string;
  className?: string;
  onClick?: () => void;
}

export function HaircutCard({ image, name, tag, className = "", onClick }: HaircutCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }}
      onClick={onClick}
      className={`relative group shrink-0 w-24 md:w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-300 shadow-xl cursor-zoom-in ${className}`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 z-10" />
      
      {/* Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-3 z-20 flex flex-col gap-0.5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 opacity-80">
          {tag || "Classic"}
        </span>
        <h4 className="text-xs md:text-sm font-bold text-white truncate">
          {name}
        </h4>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors duration-300 z-15" />
    </motion.div>
  );
}
