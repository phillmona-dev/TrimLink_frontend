"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  toEthiopian, toGregorian, getEthMonthName, getEthMonthNameEn,
  getEthDayNames, getEthDaysInMonth, getFirstDayOfEthMonth,
  nextEthMonth, prevEthMonth, isEthToday, isEthPast, EthDate
} from "@/lib/ethiopian-calendar";

interface Props {
  selectedDate: EthDate | null;
  onSelect: (eth: EthDate, gregorian: Date) => void;
}

export function EthiopianCalendar({ selectedDate, onSelect }: Props) {
  const today = toEthiopian(new Date());
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);

  const dayNames = getEthDayNames();
  const daysInMonth = getEthDaysInMonth(viewMonth, viewYear);
  const firstDay = getFirstDayOfEthMonth(viewYear, viewMonth);

  const goNext = () => {
    const n = nextEthMonth(viewYear, viewMonth);
    setViewYear(n.year); setViewMonth(n.month);
  };
  const goPrev = () => {
    const p = prevEthMonth(viewYear, viewMonth);
    setViewYear(p.year); setViewMonth(p.month);
  };

  const isSelected = (d: number) =>
    selectedDate?.year === viewYear && selectedDate?.month === viewMonth && selectedDate?.day === d;

  return (
    <div className="bg-white rounded-[28px] border border-[#F0E4D8] overflow-hidden shadow-sm">
      {/* Month/Year Header */}
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#FFF5ED] to-[#FFEBD6]">
        <button onClick={goPrev} className="p-2 rounded-full hover:bg-white/60 transition-colors text-[#D4864A]">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-[#5C3D2E]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {getEthMonthName(viewMonth)} {viewYear}
          </p>
          <p className="text-[10px] text-[#B5A090] font-bold uppercase tracking-widest">
            {getEthMonthNameEn(viewMonth)}
          </p>
        </div>
        <button onClick={goNext} className="p-2 rounded-full hover:bg-white/60 transition-colors text-[#D4864A]">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 px-4 pt-3 pb-1">
        {dayNames.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-[#B5A090] uppercase tracking-wider py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 px-4 pb-5">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const ethDate: EthDate = { year: viewYear, month: viewMonth, day };
          const past = isEthPast(ethDate);
          const isTodayDate = isEthToday(ethDate);
          const sel = isSelected(day);

          return (
            <motion.button key={day} whileHover={!past ? { scale: 1.1 } : {}} whileTap={!past ? { scale: 0.95 } : {}}
              disabled={past}
              onClick={() => {
                const gDate = toGregorian(ethDate);
                onSelect(ethDate, gDate);
              }}
              className="h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 relative"
              style={{
                background: sel ? "linear-gradient(135deg, #D4864A, #C07540)" : isTodayDate ? "#FFF5ED" : "transparent",
                color: sel ? "white" : past ? "#D9CFC6" : isTodayDate ? "#D4864A" : "#5C3D2E",
                cursor: past ? "not-allowed" : "pointer",
                border: isTodayDate && !sel ? "2px solid #D4864A" : "2px solid transparent",
                boxShadow: sel ? "0 4px 12px rgba(212,134,74,0.3)" : "none",
              }}>
              {day}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
