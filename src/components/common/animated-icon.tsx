"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number | string;
  animate?: "scale" | "rotate" | "wiggle" | "none";
}

export function AnimatedIcon({ 
  icon: Icon, 
  className, 
  size, 
  animate = "scale" 
}: AnimatedIconProps) {
  
  const variants = {
    scale: { scale: 1.25, rotate: 5 },
    rotate: { rotate: 45, scale: 1.1 },
    wiggle: { rotate: [0, -10, 10, -10, 10, 0], scale: 1.1 },
    none: {}
  };

  return (
    <motion.div
      whileHover={variants[animate]}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Icon size={size} />
    </motion.div>
  );
}
