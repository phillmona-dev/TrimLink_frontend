"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Scissors, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Service {
  id: string;
  name: string;
  durationMinutes: number;
}

interface ServiceSelectorProps {
  services: Service[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}

export function ServiceSelector({
  services,
  value,
  onChange,
  placeholder = "Select Service",
  className = "",
}: ServiceSelectorProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedService = services.find(s => s.id === value);

  // Position calculation
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const POPOVER_WIDTH = Math.max(rect.width, 220);
    const POPOVER_HEIGHT = Math.min(services.length * 48 + 16, 300);

    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT;

    setPopoverStyle({
      position: "fixed",
      top: showAbove ? rect.top - POPOVER_HEIGHT - 8 : rect.bottom + 8,
      left: rect.left,
      zIndex: 9999,
      width: POPOVER_WIDTH,
    });
  }, [open, services.length]);

  // Outside click handler
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const popoverContent = (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      style={popoverStyle}
      className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
    >
      <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {services.length === 0 ? (
          <p className="text-white/20 text-[10px] uppercase font-bold text-center py-4 tracking-widest">No services found</p>
        ) : (
          services.map((service) => {
            const isSelected = service.id === value;
            return (
              <button
                key={service.id}
                onClick={() => {
                  onChange(service.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all group ${
                  isSelected 
                    ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20" 
                    : "hover:bg-white/5 text-white/70 hover:text-white"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">{service.name}</span>
                  <span className={`text-[10px] uppercase font-black tracking-tighter ${isSelected ? "text-black/60" : "text-white/20 group-hover:text-white/40"}`}>
                    {service.durationMinutes} Minutes
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            );
          })
        )}
      </div>
    </motion.div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-sm hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 min-w-[180px] group"
      >
        <Scissors className={`w-4 h-4 transition-transform ${open ? "rotate-12 text-orange-500" : "text-white/40 group-hover:text-orange-400"}`} />
        <div className="flex-1 text-left overflow-hidden">
          {selectedService ? (
            <div className="flex flex-col -space-y-0.5">
              <span className="text-white font-bold truncate text-xs">{selectedService.name}</span>
              <span className="text-[9px] text-white/30 uppercase font-black tracking-tighter truncate">
                {selectedService.durationMinutes}m duration
              </span>
            </div>
          ) : (
            <span className="text-white/30 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-3 h-3 text-white/20 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && mounted && createPortal(
        <AnimatePresence>
          {popoverContent}
        </AnimatePresence>, 
        document.body
      )}
    </div>
  );
}
