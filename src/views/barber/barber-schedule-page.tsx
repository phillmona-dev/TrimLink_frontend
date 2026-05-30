"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { bookingService } from "@/api/bookingService";
import { barberService } from "@/api/barberService";
import { ownerService } from "@/api/ownerService";
import { useAuth } from "@/hooks/use-auth";
import { http } from "@/api/http";
import { unwrap } from "@/api/helpers";
import { formatEthiopianDate, formatEthiopianTime } from "@/utils/format";
import { EthiopianDatePicker } from "@/components/common/ethiopian-date-picker";
import { ServiceSelector } from "@/components/common/service-selector";
import { 
  Calendar, Clock, Lock, Unlock, AlertCircle, ChevronLeft, ChevronRight, 
  User, CheckCircle, HelpCircle, RefreshCw, Search, Plus, Filter, Info, ShieldAlert 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Appointment, BarberProfile } from "@/types";

type ShopHour = {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  closed?: boolean;
};

export function BarberSchedulePage() {
  const { session, role } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  // Cache and catalogs
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [shopCatalog, setShopCatalog] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<BarberProfile[]>([]);
  const [shopName, setShopName] = useState<string | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopHours, setShopHours] = useState<ShopHour[]>([]);
  
  // Visible columns filter
  const [visibleBarberIds, setVisibleBarberIds] = useState<string[]>([]);
  
  // Calendars & Appointments state
  const [allSlots, setAllSlots] = useState<Record<string, any[]>>({});
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Sidebar calendar pagination
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);

  // Fetch barber profile or shop details to get shop info and list of barbers
  useEffect(() => {
    const loadWorkspaceData = async () => {
      if (!session?.userId) return;
      setIsLoading(true);
      try {
        let activeShopId: string | null = null;

        if (role === "OWNER") {
          // 1. Owner flow: Get shop details directly
          try {
            const shopData = await ownerService.getShopDetails();
            if (shopData?.id) {
              activeShopId = shopData.id;
              setShopName(shopData.name);
            }
          } catch (err) {
            console.error("Failed to load owner shop details", err);
          }
        } else {
          // 2. Barber flow: Find the barber's profile by searching for their user.id
          try {
            // Search barbers by phone number first
            const searchRes = await barberService.listBarbers({ q: session.phone || "" });
            let myProfile = searchRes.content?.find((b: any) => b.user?.id === session.userId);
            
            if (!myProfile) {
              // Fallback: list all barbers
              const listRes = await barberService.listBarbers({ size: 100 });
              myProfile = listRes.content?.find((b: any) => b.user?.id === session.userId);
            }

            if (myProfile) {
              setProfile(myProfile);
              if (myProfile.shopId) {
                activeShopId = myProfile.shopId;
                try {
                  const shopDetails = await barberService.getShop(myProfile.shopId);
                  setShopName(shopDetails.name);
                } catch (e) {
                  console.error("Failed to load shop name", e);
                }
              }
            } else {
              showToast("Barber profile not found. Please ask shop owner to add you as staff.");
            }
          } catch (err) {
            console.error("Failed to resolve barber profile", err);
          }
        }

        // 3. Load all barbers, hours, and services for this shop
        if (activeShopId) {
          // Load shop hours for the selected date and shading logic
          try {
            const hours = await ownerService.getShopHours();
            setShopHours(hours || []);
            setShopId(activeShopId);
          } catch (err) {
            console.error("Failed to load shop hours", err);
          }

          // Load shop's barbers
          const shopBarbers = await barberService.getShopBarbers(activeShopId);
          setBarbers(shopBarbers || []);
          setVisibleBarberIds(shopBarbers.map((b: any) => b.id) || []);

          // Load shop's service catalog (accessible to both owners and barbers)
          const catalog = await unwrap<any[]>(http.get(`/services/shop/${activeShopId}`));
          setShopCatalog(catalog || []);
        }
      } catch (err: any) {
        console.error("Failed to load workspace data", err);
        showToast("Error loading workspace data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaceData();
  }, [session?.userId, session?.phone, role]);

  // When catalog loads, pick first service if none selected
  useEffect(() => {
    if (shopCatalog.length > 0 && !selectedServiceId) {
      setSelectedServiceId(shopCatalog[0].id);
    }
  }, [shopCatalog, selectedServiceId]);

  // Fetch appointments for the selected date (we no longer rely on slots)
  const fetchScheduleData = async () => {
    if (!session?.userId || barbers.length === 0) return;
    setIsLoading(true);
    try {
      // Fetch appointments for the day
      try {
        if (role === "OWNER") {
          const appts = await ownerService.getMyShopAppointments({ startDate: selectedDate, endDate: selectedDate, size: 200 });
          setAppointmentsList(appts?.content || []);
        } else {
          const appts = await bookingService.getBarberAppointments("ALL", 0, "", selectedDate);
          setAppointmentsList(appts?.content || []);
        }
      } catch (err) {
        console.error("Failed to fetch appointments", err);
        setAppointmentsList([]);
      }

      // Clear slots map (we don't use it anymore)
      setAllSlots({});
    } catch (err) {
      console.error("Schedule sync failed", err);
      showToast("Sync error. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (barbers.length > 0) {
      fetchScheduleData();
    }
  }, [selectedDate, barbers]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const getDayOfWeekName = (isoDate: string) => {
    const date = new Date(`${isoDate}T00:00:00`);
    return ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][date.getDay()];
  };

  const getHoursForSelectedDate = () => {
    const dayName = getDayOfWeekName(selectedDate);
    return shopHours.find((h) => h.dayOfWeek === dayName) || null;
  };

  const isWithinWorkingHours = (timeStr: string) => {
    const dayHours = getHoursForSelectedDate();
    if (!dayHours || dayHours.closed) return false;

    const parseTime = (value: string) => {
      const [hour, minute] = value.split(":").map(Number);
      return hour * 60 + minute;
    };

    const currentMinutes = parseTime(timeStr.substring(0, 5));
    const openMinutes = parseTime(dayHours.openTime.substring(0, 5));
    const closeMinutes = parseTime(dayHours.closeTime.substring(0, 5));
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  };

  const selectedDayHours = useMemo(() => getHoursForSelectedDate(), [selectedDate, shopHours]);

  const parseTimeToMinutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  };

  const parseIsoToMinutes = (iso: string) => {
    // expected: YYYY-MM-DDTHH:MM:SS... (or with timezone)
    const hh = Number(iso.substring(11, 13));
    const mm = Number(iso.substring(14, 16));
    return hh * 60 + mm;
  };

  const formatMinutesToTime = (minutes: number) => {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  const snapMinutes = (minutes: number, step: number) => {
    const snapped = Math.round(minutes / step) * step;
    return Math.max(0, Math.min(24 * 60 - step, snapped));
  };

  const getTimelineBounds = () => {
    const defaultStart = 10 * 60;
    const defaultEnd = 19 * 60;
    const openMinutes = selectedDayHours && !selectedDayHours.closed
      ? parseTimeToMinutes(selectedDayHours.openTime.substring(0, 5))
      : defaultStart;
    const closeMinutes = selectedDayHours && !selectedDayHours.closed
      ? parseTimeToMinutes(selectedDayHours.closeTime.substring(0, 5))
      : defaultEnd;

    // Also include any returned appointments so nothing is "invisible" even if outside shop hours.
    // (We still shade outside working hours for context.)
    let minAppt = Number.POSITIVE_INFINITY;
    let maxAppt = Number.NEGATIVE_INFINITY;
    for (const appt of appointmentsList) {
      if (!appt?.scheduledStart) continue;
      const s = parseIsoToMinutes(appt.scheduledStart);
      const e = appt.scheduledEnd ? parseIsoToMinutes(appt.scheduledEnd) : s + displayDuration;
      if (Number.isFinite(s)) minAppt = Math.min(minAppt, s);
      if (Number.isFinite(e)) maxAppt = Math.max(maxAppt, e);
    }

    // Expand by 1 hour padding for readability when appointments push bounds.
    const apptStartMin = Number.isFinite(minAppt) ? Math.floor(minAppt / 60) * 60 : defaultStart;
    const apptEndMin = Number.isFinite(maxAppt) ? Math.ceil(maxAppt / 60) * 60 : defaultEnd;

    const startMin = Math.min(defaultStart, openMinutes, apptStartMin);
    const endMin = Math.max(defaultEnd, closeMinutes, apptEndMin);
    return { startMin, endMin };
  };

  const handleToggleSlot = async (barberId: string, slot: any) => {
    // Only allow editing slots in your own column
    const isOwnProfile = barberId === profile?.id;
    if (!isOwnProfile && role !== "OWNER") {
      showToast("Access Denied: You can only edit your own schedule.");
      return;
    }

    try {
      if (slot.available) {
        // Block the slot
        await bookingService.blockSlot(slot.startTime, slot.endTime);
        showToast("Slot blocked successfully");
      } else if (slot.status === "BLOCKED") {
        // Unblock the slot
        if (slot.appointmentId) {
          await bookingService.unblockSlot(slot.appointmentId);
          showToast("Slot opened successfully");
        } else {
          showToast("Cannot unblock: Missing ID");
          return;
        }
      } else {
        showToast("Occupied slot: Action must be completed in Booking dashboard.");
        return;
      }
      fetchScheduleData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Action failed");
    }
  };

  // Booking picker state for walk-in/manual bookings
  const [bookingPicker, setBookingPicker] = useState<{ barberId: string; hour: string } | null>(null);
  // Action chooser (Appointment / Reservation / Day Off)
  const [actionPicker, setActionPicker] = useState<{ barberId: string; hour: string } | null>(null);
  // Appointment drawer state
  const [appointmentDrawer, setAppointmentDrawer] = useState<{ barberId: string; start: string; serviceId?: string } | null>(null);
  const [clientSearch, setClientSearch] = useState<{ open: boolean; barberId?: string; selectedStart?: string }>({ open: false });
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string; name: string } | null>(null);
  const [customerList, setCustomerList] = useState<Array<{ id: string; name: string; phone?: string }>>([]);
  const [customerQuery, setCustomerQuery] = useState<string>("");
  const [showAddClient, setShowAddClient] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>("");
  const [newClientPhone, setNewClientPhone] = useState<string>("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      (async () => {
        if (!customerQuery) return;
        try {
          // Search customers via UserController
          const data: any = await unwrap(http.get(`/users`, { params: { search: customerQuery, size: 50, role: 'CUSTOMER' } }));

          if (Array.isArray(data)) {
            setCustomerList(data.map((u: any) => ({ id: u.id, name: (u.firstName || "") + (u.lastName ? ` ${u.lastName}` : ""), phone: u.phoneNumber || u.phone })));
          } else if (data && data.content) {
            setCustomerList(data.content.map((u: any) => ({ id: u.id, name: (u.firstName || "") + (u.lastName ? ` ${u.lastName}` : ""), phone: u.phoneNumber || u.phone })));
          }
        } catch (err) {
          console.error(err);
        }
      })();
    }, 300);

    return () => clearTimeout(t);
  }, [customerQuery]);

  async function createNewClient() {
    if (!newClientName && !newClientPhone) return showToast("Provide name or phone");
    try {
      setIsLoading(true);
      const payload: any = {};
      const rawName = (newClientName || "").trim();
      const nameParts = rawName ? rawName.split(/\s+/).filter(Boolean) : [];
      const firstName = nameParts.length ? nameParts[0] : "Customer";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Customer";
      payload.firstName = firstName;
      payload.lastName = lastName;

      if (newClientPhone) payload.phoneNumber = newClientPhone;

      // CreateCustomerRequest requires username; use phone if available, else a deterministic fallback
      const safeBase = (newClientPhone || `${firstName}.${lastName}`)
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .toLowerCase();
      // Always add a suffix to avoid collisions (backend currently throws RuntimeException -> 500)
      const suffix = String(Date.now()).slice(-6);
      payload.username = `${(safeBase || "customer").slice(0, 40)}_${suffix}`;

      const created: any = await unwrap(http.post(`/users/customers`, payload));

      if (created) {
        const name = (created.firstName || "") + (created.lastName ? ` ${created.lastName}` : "");
        const entity = { id: created.id, name, phone: created.phoneNumber || created.phone };
        setCustomerList([entity, ...customerList]);
        setSelectedCustomer({ id: entity.id, name: entity.name });
        setShowAddClient(false);
        setClientSearch({ open: false });
      }
    } catch (err) {
      console.error(err);
      // backend may return message in response wrapper or plain message
      const msg =
        (err as any)?.response?.data?.message ||
        (err as any)?.response?.data?.error ||
        "Failed to create client";
      showToast(msg);
    } finally { setIsLoading(false); }
  }

  function openBookingPicker(barberId: string, hour: string) {
    // Only allow own barber or owner
    const isOwn = barberId === profile?.id;
    if (!isOwn && role !== "OWNER") {
      showToast("Access Denied: You can only create bookings in your own column.");
      return;
    }
    setBookingPicker({ barberId, hour });
  }

  async function handleCreateManualBooking(minuteOffset: number) {
    if (!bookingPicker) return;
    const { barberId, hour } = bookingPicker;
    const startMinutes = parseTimeToMinutes(hour) + minuteOffset;
    const endMinutes = startMinutes + (selectedService?.durationMinutes || 30);

    const startTime = `${selectedDate}T${formatMinutesToTime(startMinutes)}:00`;
    const endTime = `${selectedDate}T${formatMinutesToTime(endMinutes)}:00`;

    try {
      setIsLoading(true);
      await bookingService.blockSlot(startTime, endTime);
      showToast("Customer reserved — slot blocked");
      setBookingPicker(null);
      fetchScheduleData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to reserve slot");
    } finally {
      setIsLoading(false);
    }
  }

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setCurrentMonth(date);
  };

  const jumpWeeks = (weeks: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (weeks * 7));
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setCurrentMonth(date);
  };

  // Build lookup maps
  const apptDetailsMap = new Map<string, any>();
  appointmentsList.forEach(appt => {
    if (appt.id) apptDetailsMap.set(appt.id, appt);
  });

  const selectedService = shopCatalog.find(s => s.id === selectedServiceId);
  const displayDuration = selectedService?.durationMinutes || 30;

  const timeline = useMemo(() => {
    const { startMin, endMin } = getTimelineBounds();
    const pxPerMinute = 1.25; // tune: 75px per hour
    const heightPx = Math.max(480, (endMin - startMin) * pxPerMinute);
    const hours: { minute: number; label: string }[] = [];
    for (let m = Math.ceil(startMin / 60) * 60; m <= endMin; m += 60) {
      hours.push({ minute: m, label: formatMinutesToTime(m) });
    }
    return { startMin, endMin, pxPerMinute, heightPx, hours };
  }, [selectedDayHours, appointmentsList, displayDuration]);

  const appointmentsByBarberId = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const a of appointmentsList) {
      if (!a?.barberId) continue;
      (map[a.barberId] ||= []).push(a);
    }
    // sort by start time for stable rendering
    for (const key of Object.keys(map)) {
      map[key].sort((x, y) => x.scheduledStart.localeCompare(y.scheduledStart));
    }
    return map;
  }, [appointmentsList]);

  // Mini Calendar rendering
  const renderMiniCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = dateStr === selectedDate;
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(dateStr)}
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
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="w-8 h-8 rounded-xl hover:bg-white/10 text-white/40 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="w-8 h-8 rounded-xl hover:bg-white/10 text-white/40 hover:text-white">
              <ChevronRight className="w-4 h-4" />
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

  const visibleBarbers = barbers.filter(b => visibleBarberIds.includes(b.id));

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-orange-500 text-black px-4 py-3 rounded-xl font-bold shadow-lg z-50 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-9 h-9 text-orange-500" />
            Shop Schedule Planner
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs mt-1">
            All-In-One calendar interface for {shopName || "the barbershop"}
          </p>
          <p className="text-[11px] mt-2 text-white/40">
            {selectedDayHours ? (
              selectedDayHours.closed ? "Closed today" : `Open: ${selectedDayHours.openTime.substring(0,5)} — ${selectedDayHours.closeTime.substring(0,5)}`
            ) : "Working hours not loaded"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl">
          <ServiceSelector
            services={shopCatalog}
            value={selectedServiceId}
            onChange={setSelectedServiceId}
            placeholder="Slot Duration Basis"
          />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => changeDate(-1)} className="rounded-xl hover:bg-white/10 h-10 w-10">
              <ChevronLeft className="w-5 h-5 text-white/60" />
            </Button>
            <EthiopianDatePicker
              value={selectedDate}
              onChange={(iso) => iso && setSelectedDate(iso)}
              placeholder="Select date"
            />
            <Button variant="ghost" size="icon" onClick={() => changeDate(1)} className="rounded-xl hover:bg-white/10 h-10 w-10">
              <ChevronRight className="w-5 h-5 text-white/60" />
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" onClick={fetchScheduleData} className="rounded-xl hover:bg-white/10 h-10 w-10 text-white/60 hover:text-white">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 space-y-5">
          {/* Calendar Selector Card */}
          <Card className="border-white/5 bg-black/40 backdrop-blur-md p-4 rounded-3xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3 px-1">Calendar Picker</span>
            {renderMiniCalendar()}
          </Card>

          {/* Jump By Week Card */}
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

          {/* Staffers Toggle Filter */}
          <Card className="border-white/5 bg-black/40 backdrop-blur-md p-5 rounded-3xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Active Staff</span>
              <button 
                onClick={() => setVisibleBarberIds(visibleBarberIds.length === barbers.length ? [] : barbers.map(b => b.id))}
                className="text-[9px] font-black text-orange-400 uppercase tracking-wider hover:underline"
              >
                {visibleBarberIds.length === barbers.length ? "Hide All" : "Show All"}
              </button>
            </div>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {barbers.length === 0 ? (
                <p className="text-white/20 text-xs py-2 px-1">No staffers found.</p>
              ) : (
                barbers.map((barber) => (
                  <label 
                    key={barber.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-black text-white shrink-0">
                        {barber.user?.firstName?.charAt(0) || "B"}
                      </div>
                      <span className="text-sm font-bold text-white/80">{barber.user?.firstName} {barber.user?.lastName}</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={visibleBarberIds.includes(barber.id)}
                      onChange={() => toggleBarberVisibility(barber.id)}
                      className="accent-orange-500 h-4 w-4 bg-black border-white/10 rounded"
                    />
                  </label>
                ))
              )}
            </div>
          </Card>

          {/* Legend Details */}
          <Card className="border-white/5 bg-black/40 backdrop-blur-md p-5 rounded-3xl space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block px-1">Legend</span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 shrink-0" />
                <span className="text-white/60">Available for Online Booking</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-md bg-red-500/20 border border-red-500/30 shrink-0" />
                <span className="text-white/60">Blocked / Closed by Staff</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-md bg-orange-500/10 border border-orange-500/30 shrink-0 animate-pulse" />
                <span className="text-white/60">Booked (Pending Confirmation)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3.5 h-3.5 rounded-md bg-[#00d2ff]/10 border border-[#00d2ff]/30 shrink-0" />
                <span className="text-white/60">Booked & Confirmed</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Columns (Side-by-side Timelines) */}
        <div className="flex-1 w-full overflow-hidden">
          <Card className="border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-6 rounded-[2.5rem] overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-28 gap-4">
                <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-white/20 font-bold uppercase tracking-widest text-[10px]">Updating Scheduler Board...</p>
              </div>
            ) : visibleBarbers.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
                  <Filter className="w-8 h-8" />
                </div>
                <p className="text-white/40 font-bold">No active staff members selected.</p>
                <p className="text-white/20 text-xs">Select columns in the sidebar to view schedules.</p>
              </div>
            ) : (
              <div className="w-full">
                {/* Header row */}
                <div className="flex gap-3 items-stretch">
                  <div className="w-24 shrink-0 p-2">
                    <div className="p-3 rounded-2xl text-center bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">Time</div>
                    </div>
                  </div>

                  <div className="flex-1 flex gap-3 overflow-x-auto pb-2">
                    {visibleBarbers.map((barber) => {
                      const isOwn = barber.id === profile?.id;
                      return (
                        <div key={barber.id} className="min-w-[260px]">
                          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-2xl">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                              isOwn ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20" : "bg-white/10 text-white"
                            }`}>
                              {barber.user?.firstName?.charAt(0) || "B"}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-black text-white flex items-center gap-1.5">
                                {barber.user?.firstName} {barber.user?.lastName}
                                {isOwn && <Badge className="bg-orange-500/20 text-orange-400 text-[8px] font-black uppercase tracking-widest border-none px-1 py-0.5 rounded">You</Badge>}
                              </p>
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                {selectedDayHours
                                  ? (selectedDayHours.closed ? "Closed" : `${selectedDayHours.openTime.substring(0,5)} - ${selectedDayHours.closeTime.substring(0,5)}`)
                                  : "Hours loading..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable timeline area */}
                <div
                  ref={timelineScrollRef}
                  className="mt-4 flex gap-3 items-start overflow-y-auto"
                  style={{ maxHeight: "72vh" }}
                >
                  {/* Time axis */}
                  <div className="w-24 shrink-0">
                    <div className="relative" style={{ height: timeline.heightPx }}>
                      {timeline.hours.map((h) => {
                        const top = (h.minute - timeline.startMin) * timeline.pxPerMinute;
                        return (
                          <div key={h.minute} className="absolute left-0 right-0" style={{ top }}>
                            {/* hour line */}
                            <div className="absolute left-0 right-0 border-t border-white/[0.08]" />
                            {/* hour label aligned to the same line */}
                            <div className="absolute right-2 -translate-y-1/2 pr-1 text-right font-mono text-[11px] text-white/50 bg-black/40 backdrop-blur-sm rounded-md">
                              <span className="font-black text-white/70">{h.label}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Barber columns */}
                  <div className="flex-1 flex gap-3 overflow-x-auto pb-3">
                    {visibleBarbers.map((barber) => {
                      const colAppointments = appointmentsByBarberId[barber.id] || [];
                      const isOwn = barber.id === profile?.id;

                      return (
                        <div
                          key={barber.id}
                          className="min-w-[260px] rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden"
                        >
                          <div
                            className="relative"
                            style={{ height: timeline.heightPx }}
                            onMouseDown={(e) => {
                              // Only allow own barber or owner to add entries
                              if (!isOwn && role !== "OWNER") {
                                showToast("Access Denied: You can only add to your own column.");
                                return;
                              }
                              const container = e.currentTarget as HTMLDivElement;
                              const rect = container.getBoundingClientRect();
                              const scrollTop = timelineScrollRef.current?.scrollTop || 0;
                              const y = (e.clientY - rect.top) + scrollTop;
                              const minuteOffset = Math.max(0, Math.min(timeline.heightPx, y)) / timeline.pxPerMinute;
                              const minuteOfDay = timeline.startMin + minuteOffset;
                              const snapped = snapMinutes(minuteOfDay, 15);
                              const timeStr = formatMinutesToTime(snapped);
                              if (selectedDayHours?.closed) {
                                showToast("Shop is closed on this day.");
                                return;
                              }
                              setActionPicker({ barberId: barber.id, hour: timeStr });
                            }}
                          >
                            {/* background grid */}
                            <div className="absolute inset-0 pointer-events-none">
                              {/* 15-min dotted lines */}
                              {Array.from({ length: Math.ceil((timeline.endMin - timeline.startMin) / 15) + 1 }).map((_, i) => {
                                const minute = timeline.startMin + i * 15;
                                const top = (minute - timeline.startMin) * timeline.pxPerMinute;
                                const isHour = minute % 60 === 0;
                                return (
                                  <div
                                    key={minute}
                                    className={`absolute left-0 right-0 ${isHour ? "border-t border-white/[0.08]" : "border-t border-dashed border-white/[0.04]"}`}
                                    style={{ top }}
                                  />
                                );
                              })}

                              {/* closed shading */}
                              {selectedDayHours?.closed ? (
                                <div className="absolute inset-0 bg-red-500/5" />
                              ) : (
                                (() => {
                                  const openMin = selectedDayHours ? parseTimeToMinutes(selectedDayHours.openTime.substring(0, 5)) : 10 * 60;
                                  const closeMin = selectedDayHours ? parseTimeToMinutes(selectedDayHours.closeTime.substring(0, 5)) : 19 * 60;
                                  const topBefore = (Math.max(timeline.startMin, 0) - timeline.startMin) * timeline.pxPerMinute;
                                  const topOpen = (openMin - timeline.startMin) * timeline.pxPerMinute;
                                  const topClose = (closeMin - timeline.startMin) * timeline.pxPerMinute;
                                  const heightBefore = Math.max(0, topOpen - topBefore);
                                  const heightAfter = Math.max(0, timeline.heightPx - topClose);
                                  return (
                                    <>
                                      {heightBefore > 0 && <div className="absolute left-0 right-0 bg-white/[0.01] opacity-70" style={{ top: 0, height: heightBefore }} />}
                                      {heightAfter > 0 && <div className="absolute left-0 right-0 bg-white/[0.01] opacity-70" style={{ top: topClose, height: heightAfter }} />}
                                    </>
                                  );
                                })()
                              )}
                            </div>

                            {/* appointments */}
                            <div className="absolute inset-0">
                              {colAppointments.map((appt) => {
                                const startMin = parseIsoToMinutes(appt.scheduledStart);
                                const endMin = appt.scheduledEnd ? parseIsoToMinutes(appt.scheduledEnd) : startMin + displayDuration;
                                const top = (startMin - timeline.startMin) * timeline.pxPerMinute;
                                const height = Math.max(18, (endMin - startMin) * timeline.pxPerMinute);
                                const clippedTop = Math.max(0, top);
                                const clippedHeight = Math.max(12, Math.min(timeline.heightPx - clippedTop, height - Math.max(0, -top)));
                                if (clippedHeight <= 0) return null;

                                const status = appt.status;
                                const cardClass =
                                  status === "PENDING"
                                    ? "bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/25"
                                    : status === "CONFIRMED"
                                      ? "bg-[#00d2ff]/20 border-[#00d2ff]/40 text-[#bff2ff] hover:bg-[#00d2ff]/25"
                                      : status === "IN_PROGRESS"
                                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                                        : "bg-white/[0.04] border-white/10 text-white/70";

                                return (
                                  <div
                                    key={appt.id}
                                    className={`absolute left-2 right-2 rounded-2xl border transition-all shadow-lg z-20 cursor-pointer overflow-hidden ${cardClass}`}
                                    style={{ top: clippedTop, height: clippedHeight }}
                                    onMouseDown={(e) => {
                                      // prevent column click -> action picker
                                      e.stopPropagation();
                                      setSelectedAppointment(appt);
                                    }}
                                  >
                                    <div className="p-3 h-full flex flex-col justify-between gap-2">
                                      <div className="space-y-1 min-w-0">
                                        <div className="text-[11px] font-black text-white/90 font-mono truncate">
                                          {appt.scheduledStart.substring(11,16)} — {appt.scheduledEnd?.substring(11,16) || formatMinutesToTime(endMin)}
                                        </div>
                                        <div className="text-[11px] font-black truncate">
                                          {appt.customerName || "Walk-in Client"}
                                        </div>
                                        <div className="text-[10px] text-white/60 truncate">
                                          {appt.serviceName || "Service"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {/* empty state hint */}
                              {colAppointments.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="text-[10px] font-black uppercase tracking-widest text-white/15">
                                    Click to add
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Guide section */}
      <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-[2.5rem] flex items-start gap-4">
        <div className="p-3 bg-orange-500/20 rounded-2xl text-orange-400">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-white font-black">All-In-One Scheduler Board</h4>
          <p className="text-white/40 text-sm mt-1 leading-relaxed">
            * **Toggle Slots:** Click on any <span className="text-emerald-400 font-bold">Available</span> slot in your column to block it, or <span className="text-red-400 font-bold">Blocked</span> to re-open it.
            <br />
            * **Multi-staffer columns:** Shop Owners can view and verify all staff members' workloads side-by-side. 
            <br />
            * **Bookings Integration:** Live customer bookings are automatically synchronized and display the customer name, service type, price, and status (Pending / Confirmed) directly on the grid.
          </p>
        </div>
      </div>

      {/* Booking picker modal (minute selection) */}
      <AnimatePresence>
        {bookingPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setBookingPicker(null)} />
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-card p-6 rounded-2xl w-[320px] shadow-glow z-50">
              <h4 className="text-lg font-extrabold mb-2">Select start time</h4>
              <p className="text-sm text-muted-foreground mb-4">Hour: <span className="font-mono font-bold">{bookingPicker.hour}</span></p>
              <div className="grid grid-cols-4 gap-3">
                {[0,15,30,45].map(m => (
                  <Button key={m} onClick={() => handleCreateManualBooking(m)} className="h-10 rounded-xl" variant="outline">
                    {String(m).padStart(2,'0')}
                  </Button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Button variant="ghost" onClick={() => setBookingPicker(null)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Action picker modal (Appointment / Reservation / Day Off) */}
        <AnimatePresence>
          {actionPicker && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setActionPicker(null)} />
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-card p-6 rounded-2xl w-[360px] shadow-glow z-50">
                <h4 className="text-lg font-extrabold mb-3">Add to schedule</h4>
                <p className="text-sm text-muted-foreground mb-4">Choose the type of entry to add for <span className="font-mono">{actionPicker.hour}</span></p>
                <div className="grid grid-cols-1 gap-3">
                  <Button onClick={() => { setAppointmentDrawer({ barberId: actionPicker.barberId, start: `${selectedDate}T${actionPicker.hour}:00`, serviceId: selectedServiceId || shopCatalog[0]?.id }); setActionPicker(null); }}>Appointment</Button>
                  <Button variant="outline" onClick={() => { setBookingPicker({ barberId: actionPicker.barberId, hour: actionPicker.hour }); setActionPicker(null); }}>Reservation</Button>
                  <Button variant="ghost" onClick={async () => {
                    // Block whole working day as day-off
                    const dayHours = getHoursForSelectedDate();
                    if (!dayHours || dayHours.closed) {
                      showToast("No working hours for this day to block.");
                      setActionPicker(null);
                      return;
                    }
                    const startISO = `${selectedDate}T${dayHours.openTime.substring(0,5)}:00`;
                    const endISO = `${selectedDate}T${dayHours.closeTime.substring(0,5)}:00`;
                    try {
                      setIsLoading(true);
                      await bookingService.blockSlot(startISO, endISO);
                      showToast("Day marked as closed.");
                      fetchScheduleData();
                    } catch (err: any) {
                      showToast(err?.response?.data?.message || "Failed to mark day off");
                    } finally { setIsLoading(false); setActionPicker(null); }
                  }}>Day Off</Button>
                  <div className="text-right">
                    <Button variant="ghost" onClick={() => setActionPicker(null)}>Cancel</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Appointment drawer (right side) */}
        <AnimatePresence>
          {appointmentDrawer && (
            <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="fixed right-0 top-0 bottom-0 w-[420px] z-50 bg-card p-6 overflow-auto border-l border-white/5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-black">New Appointment</h3>
                <Button variant="ghost" onClick={() => setAppointmentDrawer(null)}>X</Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-black text-white/40 uppercase mb-1">Staff</p>
                  <div className="p-3 bg-white/5 rounded-lg">{barbers.find(b => b.id === appointmentDrawer.barberId)?.user?.firstName || 'Staff'}</div>
                </div>

                <div>
                  <p className="text-xs font-black text-white/40 uppercase mb-1">Service</p>
                  <ServiceSelector services={shopCatalog} value={appointmentDrawer.serviceId ?? null} onChange={(v:any) => setAppointmentDrawer(prev => prev ? { ...prev, serviceId: v } : prev)} />
                </div>

                <div>
                  <p className="text-xs font-black text-white/40 uppercase mb-1">Start</p>
                  <div className="flex gap-2">
                    <input className="w-2/3 p-2 rounded-lg bg-white/5" value={appointmentDrawer.start.substring(11,16)} onChange={(e) => setAppointmentDrawer(prev => prev ? { ...prev, start: `${selectedDate}T${e.target.value}:00` } : prev)} />
                    <div className="w-1/3 p-2 rounded-lg bg-white/5">{(() => {
                      const svc = shopCatalog.find(s => s.id === appointmentDrawer.serviceId);
                      const duration = svc?.durationMinutes || displayDuration;
                      const [hh, mm] = appointmentDrawer.start.substring(11,16).split(":").map(Number);
                      const startM = hh * 60 + mm;
                      const endM = startM + duration;
                      return formatMinutesToTime(endM);
                    })()}</div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black text-white/40 uppercase mb-1">Customer</p>
                  <div className="flex items-center gap-2">
                    <input id="ap-customer" value={selectedCustomer?.name || ''} readOnly className="flex-1 p-2 rounded-lg bg-white/5" placeholder="Walk-in or pick customer" />
                    <Button variant="ghost" onClick={() => setClientSearch({ open: true, barberId: appointmentDrawer?.barberId || '', selectedStart: appointmentDrawer?.start || '' })}>+</Button>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <Button variant="ghost" onClick={() => setAppointmentDrawer(null)}>Discard</Button>
                  <Button onClick={async () => {
                    // Save appointment
                    if (!shopId || !appointmentDrawer) return showToast('Missing shop or data');
                    const svcId = appointmentDrawer.serviceId || selectedServiceId || shopCatalog[0]?.id;
                    if (!svcId) return showToast('Please select a service');
                    try {
                      setIsLoading(true);
                      const payload: any = { shopId: shopId as string, barberId: appointmentDrawer.barberId, serviceId: svcId, scheduledStart: appointmentDrawer.start };
                      if (selectedCustomer?.id) payload.customerId = selectedCustomer.id;
                      await bookingService.createAppointment(payload);
                      showToast('Appointment created');
                      setAppointmentDrawer(null);
                      fetchScheduleData();
                    } catch (err: any) {
                      showToast(err?.response?.data?.message || 'Failed to create appointment');
                    } finally { setIsLoading(false); }
                  }}>Save</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Client search drawer */}
        <AnimatePresence>
          {clientSearch.open && (
            <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="fixed right-0 top-0 bottom-0 w-[420px] z-50 bg-card p-6 overflow-auto border-l border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black">Client search</h3>
                <Button variant="ghost" onClick={() => setClientSearch({ open: false })}>X</Button>
              </div>

              <div className="space-y-4">
                <div>
                  <input value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} placeholder="Search by name or phone number..." className="w-full p-3 rounded-full bg-white/5" />
                </div>

                {!showAddClient && (
                  <div>
                    <Button variant="outline" onClick={() => setShowAddClient(true)}>Add New Client</Button>
                  </div>
                )}

                {showAddClient && (
                  <div className="space-y-2 p-3 bg-white/2 rounded-lg">
                    <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Full name" className="w-full p-2 rounded-md bg-white/5" />
                    <input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} placeholder="Phone number" className="w-full p-2 rounded-md bg-white/5" />
                    <div className="flex gap-2">
                      <Button onClick={createNewClient} disabled={isLoading}>Save</Button>
                      <Button variant="ghost" onClick={() => setShowAddClient(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {customerList.filter(c => !customerQuery || c.name.toLowerCase().includes(customerQuery.toLowerCase()) || (c.phone || '').includes(customerQuery)).map(c => (
                    <div key={c.id} onClick={() => { setSelectedCustomer({ id: c.id, name: c.name }); setClientSearch({ open: false }); }} className="p-3 rounded-lg hover:bg-white/5 cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">{c.name.charAt(0)}</div>
                      <div>
                        <div className="font-black">{c.name}</div>
                        <div className="text-xs text-white/40">{c.phone}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Appointment details modal */}
        <AnimatePresence>
          {selectedAppointment && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onMouseDown={() => setSelectedAppointment(null)} />
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="relative w-[520px] max-w-[92vw] bg-card border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="p-5 flex items-start justify-between gap-4 border-b border-white/5 bg-white/[0.02]">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Appointment</div>
                    <div className="text-xl font-black truncate">
                      {selectedAppointment.customerName || "Walk-in Client"}
                    </div>
                    <div className="text-sm text-white/60 truncate">
                      {selectedAppointment.serviceName || "Service"}
                    </div>
                    <div className="text-sm font-mono text-white/70 mt-1">
                      {selectedAppointment.scheduledStart.substring(0,10)} {selectedAppointment.scheduledStart.substring(11,16)}
                      {" — "}
                      {selectedAppointment.scheduledEnd?.substring(11,16) || "--:--"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="bg-white/10 text-white/80 border-none text-[9px] font-black uppercase tracking-widest">
                      {selectedAppointment.status}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAppointment(null)} className="rounded-xl">
                      X
                    </Button>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Payment</div>
                      <div className="text-sm font-black text-white/80">{selectedAppointment.paymentStatus}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Price</div>
                      <div className="text-sm font-black text-white/80">
                        {typeof selectedAppointment.priceCharged === "number" ? `${selectedAppointment.priceCharged} ETB` : "—"}
                      </div>
                    </div>
                  </div>

                  {selectedAppointment.notes && (
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Notes</div>
                      <div className="text-sm text-white/80 whitespace-pre-wrap">{selectedAppointment.notes}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );

  function toggleBarberVisibility(id: string) {
    if (visibleBarberIds.includes(id)) {
      setVisibleBarberIds(visibleBarberIds.filter(bid => bid !== id));
    } else {
      setVisibleBarberIds([...visibleBarberIds, id]);
    }
  }
}
