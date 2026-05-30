"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { bookingService } from "@/api/bookingService";
import { barberService } from "@/api/barberService";
import { ownerService } from "@/api/ownerService";
import { http } from "@/api/http";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { 
  Scissors, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Store,
  ChevronRight,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { formatCurrency, formatEthiopianTime } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { EthDateTime } from 'ethiopian-calendar-date-converter';
import { formatImageUrl } from "@/utils/constants";

export function BookingFlowPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);

  // Style reference states
  const [styleReferenceUrl, setStyleReferenceUrl] = useState("");
  const [isUploadingStyle, setIsUploadingStyle] = useState(false);
  const [styleSelectionSource, setStyleSelectionSource] = useState<"library" | "custom" | null>(null);

  const selectedDateLabel = (() => {
    try {
      const d = new Date(`${selectedDate}T00:00:00`);
      const ethDate = EthDateTime.fromEuropeanDate(d);
      const ethMonthNames = ["Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miazia", "Genbot", "Sene", "Hamle", "Nehase", "Pagumē"];
      const base = `${ethMonthNames[ethDate.month - 1]} ${ethDate.date}, ${ethDate.year}`;
      const today = new Date().toISOString().split("T")[0];
      return selectedDate === today ? `${base} (Today)` : base;
    } catch {
      return selectedDate;
    }
  })();

  const shopId = searchParams.get("shopId");
  const barberId = searchParams.get("barberId");
  const serviceId = searchParams.get("serviceId");

  // Fetch Details
  const { data: shop } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => barberService.getShop(shopId!),
    enabled: !!shopId
  });

  const { data: barber } = useQuery({
    queryKey: ["barber", barberId],
    queryFn: () => barberService.getBarber(barberId!),
    enabled: !!barberId
  });

  const { data: service } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => barberService.getService(serviceId!),
    enabled: !!serviceId
  });

  // Fetch barber service assignments to extract linked hairstyles
  const { data: assignments } = useQuery({
    queryKey: ["barber-assignments", barberId],
    queryFn: () => ownerService.getBarberServices(barberId!),
    enabled: !!barberId
  });

  const selectedAssignment = assignments?.find((a: any) => a.serviceId === serviceId);
  const linkedStyles = selectedAssignment?.styleImageUrls || [];

  type ShopHour = {
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    closed?: boolean;
  };

  type ScheduleBlock = { scheduledStart: string; scheduledEnd: string };

  const { data: shopHours } = useQuery({
    queryKey: ["shop-hours", shopId],
    queryFn: () => barberService.getShopHours(shopId!),
    enabled: !!shopId,
  });

  const { data: barberAppointments, isLoading: isLoadingSchedule, error: scheduleError } = useQuery({
    queryKey: ["barber-day-schedule", barberId, selectedDate],
    queryFn: () => bookingService.getBarberDaySchedule(barberId!, selectedDate),
    enabled: !!barberId && !!selectedDate,
    retry: false,
  });

  const scheduleErrorMessage = (scheduleError as any)?.response?.data?.message;

  const [bookingError, setBookingError] = useState<string | null>(null);
  const [scheduleToast, setScheduleToast] = useState<string | null>(null);

  const parseIsoToMinutes = (iso: string) => {
    const hh = Number(iso.substring(11, 13));
    const mm = Number(iso.substring(14, 16));
    return hh * 60 + mm;
  };

  const parseTimeToMinutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  };

  const formatMinutesToTime = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const snapMinutes = (minutes: number, step = 15) => {
    const snapped = Math.round(minutes / step) * step;
    return Math.max(0, Math.min(24 * 60 - step, snapped));
  };

  const getDayOfWeekName = (isoDate: string) => {
    const date = new Date(`${isoDate}T00:00:00`);
    return ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][date.getDay()];
  };

  const selectedDayHours = (() => {
    const dayName = getDayOfWeekName(selectedDate);
    return (shopHours as ShopHour[] | undefined)?.find((h) => h.dayOfWeek === dayName) || null;
  })();

  const displayDuration = service?.durationMinutes || 30;

  const getApptBounds = (appt: ScheduleBlock) => {
    const startMin = parseIsoToMinutes(appt.scheduledStart);
    const endMin = appt.scheduledEnd
      ? parseIsoToMinutes(appt.scheduledEnd)
      : startMin + displayDuration;
    return { startMin, endMin };
  };

  const appointmentsList: ScheduleBlock[] = Array.isArray(barberAppointments) ? barberAppointments : [];

  const overlapsAppointment = (startMin: number, durationMin: number) => {
    const endMin = startMin + durationMin;
    return appointmentsList.some((appt) => {
      const { startMin: s, endMin: e } = getApptBounds(appt);
      return startMin < e && endMin > s;
    });
  };

  const isWithinWorkingHours = (startMin: number, durationMin: number) => {
    if (!selectedDayHours || selectedDayHours.closed) return false;
    const openMin = parseTimeToMinutes(selectedDayHours.openTime.substring(0, 5));
    const closeMin = parseTimeToMinutes(selectedDayHours.closeTime.substring(0, 5));
    return startMin >= openMin && startMin + durationMin <= closeMin;
  };

  const slotTimeline = (() => {
    const defaultStart = 10 * 60;
    const defaultEnd = 19 * 60;
    const openMinutes = selectedDayHours && !selectedDayHours.closed
      ? parseTimeToMinutes(selectedDayHours.openTime.substring(0, 5))
      : defaultStart;
    const closeMinutes = selectedDayHours && !selectedDayHours.closed
      ? parseTimeToMinutes(selectedDayHours.closeTime.substring(0, 5))
      : defaultEnd;

    let minAppt = Number.POSITIVE_INFINITY;
    let maxAppt = Number.NEGATIVE_INFINITY;
    for (const appt of appointmentsList) {
      const { startMin, endMin } = getApptBounds(appt);
      minAppt = Math.min(minAppt, startMin);
      maxAppt = Math.max(maxAppt, endMin);
    }

    const apptStartMin = Number.isFinite(minAppt) ? Math.floor(minAppt / 60) * 60 : openMinutes;
    const apptEndMin = Number.isFinite(maxAppt) ? Math.ceil(maxAppt / 60) * 60 : closeMinutes;

    const startMin = Math.min(defaultStart, openMinutes, apptStartMin);
    const endMin = Math.max(defaultEnd, closeMinutes, apptEndMin);
    const pxPerMinute = 1.25;
    const heightPx = Math.max(360, (endMin - startMin) * pxPerMinute);
    const hours: { minute: number; label: string }[] = [];
    for (let m = Math.ceil(startMin / 60) * 60; m <= endMin; m += 60) {
      hours.push({ minute: m, label: formatMinutesToTime(m) });
    }
    return { startMin, endMin, pxPerMinute, heightPx, hours, openMinutes, closeMinutes };
  })();

  const showScheduleToast = (msg: string) => {
    setScheduleToast(msg);
    setTimeout(() => setScheduleToast(null), 3000);
  };

  const changeDate = (days: number) => {
    const date = new Date(`${selectedDate}T00:00:00`);
    date.setDate(date.getDate() + days);
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDate(dateStr);
    setCurrentMonth(date);
    setSelectedSlot(null);
  };

  const jumpWeeks = (weeks: number) => changeDate(weeks * 7);

  const renderMiniCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const days: any[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isSelected = dateStr === selectedDate;
      const isToday = new Date().toISOString().split("T")[0] === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            isSelected
              ? "bg-orange-500 text-black shadow-lg shadow-orange-500/35 scale-110 font-black"
              : isToday
                ? "border border-orange-500 text-orange-500 font-black"
                : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          {day}
        </button>
      );
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return (
      <div className="space-y-3 p-4 bg-white/[0.03] border border-white/5 rounded-3xl">
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-black text-white">{monthNames[month]} {year}</span>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-xl hover:bg-white/10 text-white/40 hover:text-white"
            >
              ‹
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-xl hover:bg-white/10 text-white/40 hover:text-white"
            >
              ›
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d, idx) => (
            <span key={idx} className="text-[10px] font-black text-white/20 uppercase tracking-wider">{d}</span>
          ))}
          {days}
        </div>
      </div>
    );
  };

  const mutation = useMutation({
    mutationFn: bookingService.createAppointment,
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => router.push("/app/appointments"), 3000);
    },
    onError: (error: any) => {
      console.error("Booking Error:", error);
      const data = error?.response?.data;
      
      let msg = "Booking failed. Please try again.";
      
      if (data) {
        if (data.data && typeof data.data === 'object') {
          const errors = Object.values(data.data);
          if (errors.length > 0) {
            msg = String(errors[0]);
          } else if (data.message) {
            msg = data.message;
          }
        } else if (data.message) {
          msg = data.message;
        }
      } else if (error.message) {
        msg = error.message;
      }
      
      setBookingError(msg);
      setTimeout(() => setBookingError(null), 8000);
    }
  });

  const handleConfirm = () => {
    if (!selectedSlot || !barberId || !shopId || !serviceId) return;
    mutation.mutate({
      barberId,
      shopId,
      serviceId,
      scheduledStart: selectedSlot,
      notes: styleSelectionSource === "custom"
        ? "Custom hairstyle reference attached by client."
        : styleSelectionSource === "library"
          ? "Hairstyle selected from library."
          : "",
      receiptImageUrl: receiptImageUrl,
      styleReferenceUrl: styleReferenceUrl
    });
  };

  const handleStyleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingStyle(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await http.post("/uploads/receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setStyleReferenceUrl(data.data.url);
      setStyleSelectionSource("custom");
    } catch (err) {
      console.error("Style upload error:", err);
      alert("Failed to upload style reference. Please try again.");
    } finally {
      setIsUploadingStyle(false);
    }
  };

  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
      setReceiptImageUrl("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const { data } = await http.post("/uploads/receipt", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setReceiptImageUrl(data.data.url);
      setUploadSuccess(true);
      setSelectedFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload receipt. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-black text-white">Booking Confirmed!</h2>
          <p className="mt-4 text-white/50">Redirecting to your appointments...</p>
        </motion.div>
      </div>
    );
  }

  const requiresPayment = shop?.bankAccounts && shop.bankAccounts.length > 0;
  const canProceedToStep2 = !!selectedSlot;
  const canProceedToStep3 = !requiresPayment || (requiresPayment && !!receiptImageUrl);

  return (
    <div className={`mx-auto space-y-8 ${currentStep === 1 ? "max-w-6xl w-full px-2 sm:px-4" : "max-w-xl"}`}>
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40 px-2">
        <span className={currentStep >= 1 ? "text-orange-500" : ""}>1. Time</span>
        <div className="h-[2px] flex-1 mx-2 sm:mx-4 bg-white/10 relative rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-orange-500 transition-all duration-500" style={{ width: currentStep >= 2 ? '100%' : currentStep === 1 ? '50%' : '0%' }} />
        </div>
        <span className={currentStep >= 2 ? "text-orange-500" : ""}>2. Review</span>
        <div className="h-[2px] flex-1 mx-2 sm:mx-4 bg-white/10 relative rounded-full overflow-hidden">
          <div className="absolute left-0 top-0 h-full bg-orange-500 transition-all duration-500" style={{ width: currentStep >= 3 ? '100%' : currentStep === 2 ? '50%' : '0%' }} />
        </div>
        <span className={currentStep >= 3 ? "text-orange-500" : ""}>3. Payment</span>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: CHOOSE TIME */}
        {currentStep === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Choose Time</h2>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 px-4 focus-within:border-orange-500/50 transition-colors">
                <CalendarIcon className="h-4 w-4 text-orange-400" />
                <span className="text-white text-sm font-bold pr-2">{selectedDateLabel}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="h-8 w-8 rounded-xl hover:bg-white/10 text-white/60 hover:text-white">‹</Button>
                  <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="h-8 w-8 rounded-xl hover:bg-white/10 text-white/60 hover:text-white">›</Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch w-full">
              {/* Left sidebar (calendar + jump) */}
              <div className="w-full lg:w-[240px] shrink-0 space-y-4">
                <Card className="border-white/5 bg-black/40 backdrop-blur-md p-4 rounded-3xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3 px-1">Calendar Picker</span>
                  {renderMiniCalendar()}
                </Card>

                <Card className="border-white/5 bg-black/40 backdrop-blur-md p-5 rounded-3xl space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block px-1">Jump By Week</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => jumpWeeks(-1)} className="rounded-xl border-white/5 bg-white/5 font-bold hover:bg-white/10 text-xs">
                      -1 Week
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => jumpWeeks(1)} className="rounded-xl border-white/5 bg-white/5 font-bold hover:bg-white/10 text-xs">
                      +1 Week
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => jumpWeeks(-2)} className="rounded-xl border-white/5 bg-white/5 font-bold hover:bg-white/10 text-xs">
                      -2 Weeks
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => jumpWeeks(2)} className="rounded-xl border-white/5 bg-white/5 font-bold hover:bg-white/10 text-xs">
                      +2 Weeks
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Timeline card */}
              <Card className="min-h-[300px] flex flex-col flex-1 min-w-0 w-full">
              {scheduleToast && (
                <div className="mx-4 mt-3 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-bold">
                  {scheduleToast}
                </div>
              )}
              {isLoadingSchedule ? (
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                </div>
              ) : scheduleErrorMessage ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                  <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white/40">Selection Error</h3>
                  <p className="text-red-400/80 text-sm max-w-xs">{scheduleErrorMessage}</p>
                </div>
              ) : selectedDayHours?.closed ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white/40">Shop is closed</h3>
                  <p className="text-white/20 text-sm max-w-xs">This barbershop is closed on the selected day.</p>
                </div>
              ) : (
                <div className="p-2">
                  {/* Match barber schedule look/feel */}
                  <div className="border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-4 rounded-[2rem] overflow-x-auto">
                    <div className="flex gap-3 items-stretch">
                      {/* Time header */}
                      <div className="w-24 shrink-0 p-2">
                        <div className="p-3 rounded-2xl text-center bg-white/[0.02] border border-white/5">
                          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Time</div>
                        </div>
                      </div>

                      {/* Barber header (single column) */}
                      <div className="flex-1 p-2">
                        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 bg-white/10 text-white">
                            {barber?.user?.firstName?.charAt(0) || barber?.user?.username?.charAt(0) || "B"}
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-sm font-black text-white truncate">
                              {barber?.user ? `${barber.user.firstName} ${barber.user.lastName}` : "Barber"}
                            </p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider truncate">
                              {selectedDayHours
                                ? `${selectedDayHours.openTime.substring(0, 5)} - ${selectedDayHours.closeTime.substring(0, 5)}`
                                : service?.durationMinutes
                                  ? `${service.durationMinutes} min`
                                  : "Hours"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      ref={timelineScrollRef}
                      className="mt-3 flex gap-3 items-start overflow-y-auto"
                      style={{ maxHeight: "56vh" }}
                    >
                      {/* Time axis */}
                      <div className="w-24 shrink-0">
                        <div className="relative" style={{ height: slotTimeline.heightPx }}>
                          {slotTimeline.hours.map((h) => {
                            const top = (h.minute - slotTimeline.startMin) * slotTimeline.pxPerMinute;
                            return (
                              <div key={h.minute} className="absolute left-0 right-0" style={{ top }}>
                                <div className="absolute left-0 right-0 border-t border-white/[0.08]" />
                                <div className="absolute right-2 -translate-y-1/2 pr-1 text-right font-mono text-[11px] text-white/50 bg-black/40 backdrop-blur-sm rounded-md">
                                  <span className="font-black text-white/70">{h.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Single timeline column — click anywhere except occupied blocks */}
                      <div className="flex-1 min-w-0 rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
                        <div
                          className="relative cursor-pointer"
                          style={{ height: slotTimeline.heightPx }}
                          onMouseDown={(e) => {
                            const container = e.currentTarget as HTMLDivElement;
                            const rect = container.getBoundingClientRect();
                            const scrollTop = timelineScrollRef.current?.scrollTop || 0;
                            const y = (e.clientY - rect.top) + scrollTop;
                            const minuteOffset = Math.max(0, Math.min(slotTimeline.heightPx, y)) / slotTimeline.pxPerMinute;
                            const startMin = snapMinutes(slotTimeline.startMin + minuteOffset, 15);

                            if (overlapsAppointment(startMin, displayDuration)) return;
                            if (!isWithinWorkingHours(startMin, displayDuration)) {
                              showScheduleToast("Selected time is outside shop working hours.");
                              return;
                            }

                            const startIso = `${selectedDate}T${formatMinutesToTime(startMin)}:00`;
                            setSelectedSlot(startIso);
                          }}
                        >
                          {/* background grid (hour solid, 15-min dashed — same as barber) */}
                          <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: Math.ceil((slotTimeline.endMin - slotTimeline.startMin) / 15) + 1 }).map((_, i) => {
                              const minute = slotTimeline.startMin + i * 15;
                              const top = (minute - slotTimeline.startMin) * slotTimeline.pxPerMinute;
                              const isHour = minute % 60 === 0;
                              return (
                                <div
                                  key={minute}
                                  className={`absolute left-0 right-0 ${isHour ? "border-t border-white/[0.08]" : "border-t border-dashed border-white/[0.04]"}`}
                                  style={{ top }}
                                />
                              );
                            })}
                          </div>

                          {/* Closed / outside-hours shading */}
                          {selectedDayHours && !selectedDayHours.closed && (() => {
                            const topOpen = (slotTimeline.openMinutes - slotTimeline.startMin) * slotTimeline.pxPerMinute;
                            const topClose = (slotTimeline.closeMinutes - slotTimeline.startMin) * slotTimeline.pxPerMinute;
                            const heightBefore = Math.max(0, topOpen);
                            const heightAfter = Math.max(0, slotTimeline.heightPx - topClose);
                            return (
                              <>
                                {heightBefore > 0 && (
                                  <div className="absolute left-0 right-0 bg-white/[0.01] opacity-70 pointer-events-none" style={{ top: 0, height: heightBefore }} />
                                )}
                                {heightAfter > 0 && (
                                  <div className="absolute left-0 right-0 bg-white/[0.01] opacity-70 pointer-events-none" style={{ top: topClose, height: heightAfter }} />
                                )}
                              </>
                            );
                          })()}

                          {/* Occupied appointments (time range only) */}
                          {appointmentsList.map((appt) => {
                            const { startMin, endMin } = getApptBounds(appt);
                            const top = (startMin - slotTimeline.startMin) * slotTimeline.pxPerMinute;
                            const height = Math.max(18, (endMin - startMin) * slotTimeline.pxPerMinute);
                            const timeRange = `${formatEthiopianTime(appt.scheduledStart)} — ${formatEthiopianTime(appt.scheduledEnd)}`;

                            return (
                              <div
                                key={`${appt.scheduledStart}-${appt.scheduledEnd}`}
                                className="absolute left-2 right-2 z-20 rounded-2xl border border-white/10 bg-white/[0.03] text-white/60 overflow-hidden pointer-events-none"
                                style={{ top, height }}
                              >
                                <div className="p-3 h-full flex items-center">
                                  <div className="text-[11px] font-black font-mono truncate">{timeRange}</div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Selected time indicator */}
                          {selectedSlot && (() => {
                            const startMin = parseIsoToMinutes(selectedSlot);
                            const endMin = startMin + displayDuration;
                            const top = (startMin - slotTimeline.startMin) * slotTimeline.pxPerMinute;
                            const height = Math.max(18, (endMin - startMin) * slotTimeline.pxPerMinute);
                            return (
                              <div
                                className="absolute left-2 right-2 z-10 rounded-2xl border-2 border-orange-500/70 bg-orange-500/10 pointer-events-none"
                                style={{ top, height }}
                              />
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
            </div>

            {/* HAIRSTYLE INSPIRATION / ATTACHMENT SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Scissors className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-black text-white">Select Hairstyle Reference (Optional)</h3>
              </div>
              <p className="text-xs text-white/40">
                Choose a style from the barber's portfolio or upload your own to show the barber exactly what you want.
              </p>

              {/* Selection preview */}
              {styleReferenceUrl && (
                <div className="relative group rounded-3xl overflow-hidden aspect-[4/3] w-full max-w-[320px] bg-black/40 border border-orange-500/20 shadow-xl shadow-orange-500/5 mx-auto">
                  <img 
                    src={formatImageUrl(styleReferenceUrl)} 
                    alt="Selected Style Reference" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
                      {styleSelectionSource === "custom" ? "Custom Reference Loaded" : "Barber Catalog Style"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 h-9 px-4 rounded-xl text-xs font-bold"
                      onClick={() => {
                        setStyleReferenceUrl("");
                        setStyleSelectionSource(null);
                      }}
                    >
                      <X className="w-3.5 h-3.5 mr-1" />
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}

              {/* Options list */}
              {!styleReferenceUrl && (
                <div className="space-y-4">
                  {/* Barber linked styles list */}
                  {linkedStyles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Barber's Style Catalog</p>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                        {linkedStyles.map((url: string, index: number) => (
                          <div 
                            key={index}
                            onClick={() => {
                              setStyleReferenceUrl(url);
                              setStyleSelectionSource("library");
                            }}
                            className="relative shrink-0 w-28 h-28 rounded-2xl bg-black/40 border border-white/5 overflow-hidden cursor-pointer hover:border-orange-500/50 hover:scale-102 transition-all active:scale-98"
                          >
                            <img 
                              src={formatImageUrl(url)} 
                              alt={`Catalog style ${index + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom upload container */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Upload Your Own Image</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      id="custom-style-upload"
                      className="hidden"
                      onChange={handleStyleFileChange}
                      disabled={isUploadingStyle}
                    />
                    <label 
                      htmlFor="custom-style-upload"
                      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${
                        isUploadingStyle
                          ? "border-orange-500/30 bg-orange-500/5"
                          : "border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/5"
                      }`}
                    >
                      {isUploadingStyle ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">Uploading style...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-white/30 mb-2" />
                          <span className="text-xs font-bold text-white/60 text-center">Click to select a hairstyle photo</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-2"></div>
            
            <Button 
              className="w-full h-14 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-2xl shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
              disabled={!canProceedToStep2}
              onClick={() => setCurrentStep(2)}
            >
              Continue to Review
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* STEP 2: REVIEW & CONFIRM (Selection Verification) */}
        {currentStep === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-white">Review Selection</h2>
            <Card className="bg-white/5 border-white/10 space-y-6 p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Schedule</p>
                  <p className="font-bold text-white">
                    {selectedSlot ? formatEthiopianTime(selectedSlot) : ""} on {selectedDateLabel.split(" (")[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Barbershop</p>
                  <p className="font-bold text-white">{shop?.name || "Loading..."}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center border border-white/5">
                  {barber?.user?.avatarUrl ? (
                    <img src={formatImageUrl(barber.user.avatarUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-6 w-6 text-white/40" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Barber</p>
                  <p className="font-bold text-white">
                    {barber?.user ? `${barber.user.firstName} ${barber.user.lastName}` : "Loading..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                  <Scissors className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Service</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{service?.name || "Loading..."}</p>
                      <Badge className="bg-white/5 text-white/60 mt-1">{service?.durationMinutes} min</Badge>
                    </div>
                    <span className="font-black text-white">{service && formatCurrency(service.basePrice)}</span>
                  </div>
                </div>
              </div>

              {styleReferenceUrl && (
                <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                  <div className="h-12 w-12 rounded-2xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center">
                    <img src={formatImageUrl(styleReferenceUrl)} alt="Style attachment" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Hairstyle Attachment</p>
                    <p className="font-bold text-white">
                      {styleSelectionSource === "custom" ? "Custom Reference Image" : "Barber Catalog Hairstyle"}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">Total Amount</span>
                  <span className="text-white/60">{service && formatCurrency(service.basePrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-orange-400">Reservation Deposit</span>
                    <span className="text-[10px] text-orange-400/50 uppercase font-bold">Pay 50% now to secure slot</span>
                  </div>
                  <span className="text-xl font-black text-orange-400">
                    {service && formatCurrency(Number(service.basePrice) * 0.5)}
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline"
                className="w-full h-14 rounded-2xl border-white/10"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button 
                className="w-full h-14 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
                onClick={() => setCurrentStep(3)}
              >
                Continue to Payment
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PAYMENT VERIFICATION */}
        {currentStep === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-black text-white">Payment Verification</h2>
            <Card className="bg-white/5 border-white/10 p-6 space-y-6">
               {requiresPayment ? (
                 <>
                   <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl mb-2">
                     <p className="text-xs font-bold text-orange-400 mb-1 flex items-center gap-2">
                       <AlertCircle className="w-4 h-4" /> 50% Prepayment Required
                     </p>
                     <p className="text-[11px] text-orange-200/60 leading-relaxed">
                       To secure your booking, please pay <b>50%</b> of the total price ({service && formatCurrency(Number(service.basePrice) * 0.5)}) to one of the accounts below. Your booking will <b>not be approved</b> without a valid receipt.
                     </p>
                   </div>

                   <div className="space-y-4">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Select Payment Method</p>
                     <div className="grid grid-cols-1 gap-3">
                       {shop?.bankAccounts?.map((acc: any) => (
                         <button
                           key={acc.id}
                           onClick={() => setSelectedAccount(acc)}
                           className={`p-4 rounded-2xl border text-left transition-all ${
                             selectedAccount?.id === acc.id 
                               ? "bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/10" 
                               : "bg-black/40 border-white/5 hover:border-white/20"
                           }`}
                         >
                           <div className="flex justify-between items-center">
                             <span className="font-bold text-white">{acc.bankName}</span>
                             {selectedAccount?.id === acc.id && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                           </div>
                           <p className="text-xs text-white/40 mt-1">{acc.accountNumber}</p>
                           {acc.accountHolder && <p className="text-[10px] text-white/20 uppercase mt-1">{acc.accountHolder}</p>}
                         </button>
                       ))}
                     </div>
                   </div>

                   {selectedAccount && (
                     <div className="space-y-4 pt-4 border-t border-white/5">
                        <p className="text-xs text-white/50 leading-relaxed">
                          Please make the payment to the selected account and upload the receipt below.
                        </p>
                       
                        <div className="space-y-4">
                          <input 
                            type="file" 
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="hidden" 
                            id="receipt-upload"
                          />
                          
                          {!receiptImageUrl && (
                            <label 
                              htmlFor="receipt-upload"
                              className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${
                                selectedFile 
                                  ? "border-orange-500/50 bg-orange-500/5" 
                                  : "border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/5"
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                <Store className="w-5 h-5 text-white/40" />
                              </div>
                              <span className="text-xs font-bold text-white/60 text-center px-4">
                                {selectedFile ? selectedFile.name : "Click to select receipt image"}
                              </span>
                            </label>
                          )}

                          {selectedFile && !isUploading && (
                            <Button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleUpload();
                              }}
                              className="w-full bg-orange-500 text-black font-black h-14 rounded-2xl shadow-xl shadow-orange-500/20 transition-all active:scale-95"
                            >
                              Confirm & Upload Receipt
                            </Button>
                          )}

                          {isUploading && (
                            <div className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-orange-500/30 rounded-[2rem] bg-orange-500/5">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                              <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Uploading...</span>
                            </div>
                          )}

                          {receiptImageUrl && uploadSuccess && (
                            <div className="space-y-4">
                              <div className="relative group w-full">
                                <img 
                                  src={formatImageUrl(receiptImageUrl)} 
                                  alt="Receipt Preview" 
                                  className="w-full h-48 object-cover rounded-[2rem] border-2 border-green-500/30 shadow-2xl shadow-green-500/10"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-[2rem] gap-2">
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white h-8 px-4 rounded-xl text-[10px] font-bold"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setReceiptImageUrl("");
                                      setUploadSuccess(false);
                                    }}
                                  >
                                    Remove & Change
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Receipt uploaded successfully!</span>
                              </div>
                            </div>
                          )}
                       </div>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                     <CheckCircle2 className="w-8 h-8 text-green-500" />
                   </div>
                   <h3 className="font-bold text-white mb-2">No upfront payment required</h3>
                   <p className="text-xs text-white/40">You can pay at the shop after your service.</p>
                 </div>
               )}
            </Card>

            <AnimatePresence>
              {bookingError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm overflow-hidden"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{bookingError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-white/10"
                onClick={() => setCurrentStep(2)}
                disabled={mutation.isPending}
              >
                Back
              </Button>
              <Button 
                className="w-full h-14 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-2xl shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
                disabled={!selectedSlot || mutation.isPending || (requiresPayment && !receiptImageUrl)}
                onClick={handleConfirm}
              >
                {mutation.isPending ? "Confirming..." : "Confirm Booking"}
                <CheckCircle2 className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
