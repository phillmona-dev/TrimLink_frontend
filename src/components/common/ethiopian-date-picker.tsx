"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

// ─── Calendar Conversion Utilities ──────────────────────────────────────────

const ETHIOPIAN_MONTHS = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miyazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy +
    Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
  const l = jdn + 68569;
  const n = Math.floor(4 * l / 146097);
  const ll = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor(4000 * (ll + 1) / 1461001);
  const lll = ll - Math.floor(1461 * i / 4) + 31;
  const j = Math.floor(80 * lll / 2447);
  const day = lll - Math.floor(2447 * j / 80);
  const lv = Math.floor(j / 11);
  const month = j + 2 - 12 * lv;
  const year = 100 * (n - 49) + i + lv;
  return { year, month, day };
}

function jdnToEthiopian(jdn: number): { year: number; month: number; day: number } {
  const EPOCH = 1723856;
  const r = (jdn - EPOCH) % 1461;
  const n = r % 365 + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - EPOCH) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = n % 30 + 1;
  return { year, month, day };
}

function ethiopianToJDN(ey: number, em: number, ed: number): number {
  const EPOCH = 1723856;
  const n = 30 * (em - 1) + (ed - 1);
  const yc = ey % 4;
  const q = Math.floor(ey / 4);
  return EPOCH + 1461 * q + 365 * yc + n;
}

export function ethiopianToGregorianISO(ey: number, em: number, ed: number): string {
  const jdn = ethiopianToJDN(ey, em, ed);
  const { year, month, day } = jdnToGregorian(jdn);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function gregorianISOToEthiopian(iso: string): { year: number; month: number; day: number } | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const jdn = gregorianToJDN(y, m, d);
  return jdnToEthiopian(jdn);
}

function todayEthiopian() {
  const now = new Date();
  const etMs = now.getTime() + 3 * 60 * 60 * 1000;
  const etDate = new Date(etMs);
  const jdn = gregorianToJDN(etDate.getUTCFullYear(), etDate.getUTCMonth() + 1, etDate.getUTCDate());
  return jdnToEthiopian(jdn);
}

function daysInEthMonth(year: number, month: number): number {
  if (month < 13) return 30;
  return year % 4 === 3 ? 6 : 5;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface EthiopianDatePickerProps {
  value: string;
  onChange: (gregorianISO: string) => void;
  placeholder?: string;
  className?: string;
}

export function EthiopianDatePicker({
  value,
  onChange,
  placeholder = "Pick Ethiopian date",
  className = "",
}: EthiopianDatePickerProps) {
  const today = todayEthiopian();
  const currentEth = gregorianISOToEthiopian(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(currentEth?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(currentEth?.month ?? today.month);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Popover fixed position state
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currentEth) {
      setViewYear(currentEth.year);
      setViewMonth(currentEth.month);
    }
  }, [value]);

  // Calculate fixed position from trigger rect whenever opened
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const POPOVER_WIDTH = 288; // w-72
    const POPOVER_HEIGHT = 420; // estimated
    
    // Check space below vs above
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT;

    // Prefer opening below-right, but flip left if near right edge
    let left = rect.right - POPOVER_WIDTH;
    if (left < 10) left = 10;
    if (left + POPOVER_WIDTH > window.innerWidth - 10) left = window.innerWidth - POPOVER_WIDTH - 10;
    
    setPopoverStyle({
      position: "fixed",
      top: showAbove ? rect.top - POPOVER_HEIGHT : rect.bottom + 8,
      left: left,
      zIndex: 9999,
      width: POPOVER_WIDTH,
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleDayClick = (day: number) => {
    const iso = ethiopianToGregorianISO(viewYear, viewMonth, day);
    onChange(iso);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(13); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 13) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const daysInMonth = daysInEthMonth(viewYear, viewMonth);

  const displayLabel = currentEth
    ? `${ETHIOPIAN_MONTHS[currentEth.month - 1]} ${currentEth.day}, ${currentEth.year}`
    : placeholder;

  const popoverContent = (
    <div
      ref={popoverRef}
      style={popoverStyle}
      className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Month / Year header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <p className="text-white font-black text-sm">{ETHIOPIAN_MONTHS[viewMonth - 1]}</p>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <button type="button" onClick={() => setViewYear(y => y - 1)} className="text-white/30 hover:text-white text-xs">‹</button>
            <span className="text-orange-400 font-black text-xs">{viewYear}</span>
            <button type="button" onClick={() => setViewYear(y => y + 1)} className="text-white/30 hover:text-white text-xs">›</button>
          </div>
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day grid */}
      <div className="p-3 grid grid-cols-5 gap-1.5">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const isSelected = currentEth?.year === viewYear &&
            currentEth?.month === viewMonth &&
            currentEth?.day === day;
          const isToday = today.year === viewYear && today.month === viewMonth && today.day === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={`
                h-9 w-full rounded-xl text-sm font-bold transition-all
                ${isSelected
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/30"
                  : isToday
                  ? "bg-white/10 text-orange-400 ring-1 ring-orange-500/40"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Today shortcut */}
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            setViewYear(today.year);
            setViewMonth(today.month);
            handleDayClick(today.day);
          }}
          className="w-full py-2 text-xs font-black uppercase tracking-widest text-orange-400 hover:bg-orange-500/10 rounded-xl transition-all border border-orange-500/20"
        >
          Today — {ETHIOPIAN_MONTHS[today.month - 1]} {today.day}, {today.year}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50 whitespace-nowrap"
      >
        <CalendarDays className="w-4 h-4 text-white/40 shrink-0" />
        <span className={currentEth ? "text-white font-medium" : "text-white/30"}>
          {displayLabel}
        </span>
        {currentEth && (
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="ml-1 text-white/30 hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </button>

      {/* Popover via Portal */}
      {open && mounted && createPortal(popoverContent, document.body)}
    </div>
  );
}
