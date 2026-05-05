"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Filter, Check, ChevronDown, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StatusOption {
  id: string;
  label: string;
  colorClass: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { id: "", label: "All Statuses", colorClass: "bg-white/20" },
  { id: "PENDING", label: "Pending", colorClass: "bg-yellow-500" },
  { id: "CONFIRMED", label: "Confirmed", colorClass: "bg-blue-500" },
  { id: "IN_PROGRESS", label: "In Progress", colorClass: "bg-orange-500" },
  { id: "COMPLETED", label: "Completed", colorClass: "bg-green-500" },
  { id: "REJECTED", label: "Rejected", colorClass: "bg-red-500" },
  { id: "CANCELLED", label: "Cancelled", colorClass: "bg-red-600" },
];

interface StatusSelectorProps {
  value: string;
  onChange: (status: string) => void;
  className?: string;
}

export function StatusSelector({
  value,
  onChange,
  className = "",
}: StatusSelectorProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectedOption = STATUS_OPTIONS.find(o => o.id === value) || STATUS_OPTIONS[0];

  // Position calculation
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const POPOVER_WIDTH = Math.max(rect.width, 200);
    const POPOVER_HEIGHT = STATUS_OPTIONS.length * 44 + 16;

    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT;

    setPopoverStyle({
      position: "fixed",
      top: showAbove ? rect.top - POPOVER_HEIGHT - 8 : rect.bottom + 8,
      left: rect.left,
      zIndex: 9999,
      width: POPOVER_WIDTH,
    });
  }, [open]);

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
      <div className="p-2 space-y-1">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = option.id === value;
          return (
            <button
              key={option.id}
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all group ${
                isSelected 
                  ? "bg-white/10 text-white" 
                  : "hover:bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${option.colorClass} shadow-[0_0_8px] ${option.colorClass.replace('bg-', 'shadow-')}/40`} />
                <span className="text-sm font-bold">{option.label}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-orange-500" />}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-sm hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 min-w-[150px] group"
      >
        <Filter className={`w-4 h-4 transition-colors ${open ? "text-orange-500" : "text-white/40 group-hover:text-orange-400"}`} />
        <div className="flex-1 text-left overflow-hidden">
          <div className="flex flex-col -space-y-0.5">
            <span className="text-white/30 text-[9px] uppercase font-black tracking-widest leading-none mb-0.5">Filter Status</span>
            <span className="text-white font-bold truncate text-xs">{selectedOption.label}</span>
          </div>
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
