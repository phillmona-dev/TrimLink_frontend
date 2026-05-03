"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { bookingService } from "@/api/bookingService";
import { barberService } from "@/api/barberService";
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
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";

export function BookingFlowPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  // Fetch Slots
  const { data: slots, isLoading: isLoadingSlots, error: slotsError } = useQuery({
    queryKey: ["slots", barberId, serviceId, selectedDate],
    queryFn: () => bookingService.getSlots({ 
      barberId: barberId!, 
      serviceId: serviceId!, 
      date: selectedDate 
    }),
    enabled: !!barberId && !!serviceId && !!selectedDate,
    retry: false
  });

  const slotsErrorMessage = (slotsError as any)?.response?.data?.message;

  const [bookingError, setBookingError] = useState<string | null>(null);

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
      notes: "",
      receiptImageUrl: receiptImageUrl
    });
  };

  const [receiptImageUrl, setReceiptImageUrl] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Mock upload delay
    setTimeout(() => {
      // In a real app, this would be an actual upload to S3/Cloudinary
      setReceiptImageUrl("https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2000&auto=format&fit=crop");
      setIsUploading(false);
    }, 1500);
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

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Selection Summary */}
      <div className="lg:col-span-4 space-y-6">
        <h2 className="text-2xl font-black text-white">Your Selection</h2>
        <Card className="bg-white/5 border-white/10 space-y-6 p-6">
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
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
              <User className="h-6 w-6" />
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
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Service</p>
              <p className="font-bold text-white">{service?.name || "Loading..."}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-white/5 text-white/60">{service?.durationMinutes} min</Badge>
                <span className="font-black text-orange-400">{service && formatCurrency(service.basePrice)}</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="rounded-[2.5rem] bg-orange-500/10 border border-orange-500/20 p-6">
          <div className="flex items-center gap-3 text-orange-500 mb-2">
            <CalendarCheck className="h-5 w-5" />
            <h4 className="font-bold">Pro Tip</h4>
          </div>
          <p className="text-xs leading-relaxed text-orange-200/60">
            Select a time slot on the right. If you don't see a preferred time, try changing the date.
          </p>
        </div>

        {/* Payment Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest px-2">Payment Verification</h3>
          <Card className="bg-white/5 border-white/10 p-6 space-y-6">
             {shop?.bankAccounts && shop.bankAccounts.length > 0 ? (
               <>
                 <div className="space-y-4">
                   <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 px-1">Select Payment Method</p>
                   <div className="grid grid-cols-1 gap-3">
                     {shop.bankAccounts.map((acc: any) => (
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
                       Please make a reservation payment of <b>{service && formatCurrency(service.basePrice)}</b> to the selected account and upload the receipt below.
                     </p>
                     
                     <div className="relative">
                       <input 
                         type="file" 
                         accept="image/*"
                         onChange={handleFileUpload}
                         className="hidden" 
                         id="receipt-upload"
                       />
                       <label 
                         htmlFor="receipt-upload"
                         className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${
                           receiptImageUrl 
                             ? "border-green-500/50 bg-green-500/5" 
                             : "border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-orange-500/5"
                         }`}
                       >
                         {isUploading ? (
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                         ) : receiptImageUrl ? (
                           <>
                             <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                             <span className="text-xs font-bold text-green-500">Receipt Uploaded</span>
                           </>
                         ) : (
                           <>
                             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                               <Store className="w-5 h-5 text-white/40" />
                             </div>
                             <span className="text-xs font-bold text-white/60 text-center px-4">Click to upload receipt image</span>
                           </>
                         )}
                       </label>
                     </div>
                   </div>
                 )}
               </>
             ) : (
               <div className="text-center py-4">
                 <p className="text-xs text-white/20">This shop hasn't configured bank details yet. You can pay after the service.</p>
               </div>
             )}
          </Card>
        </div>
      </div>

      {/* Date & Slot Selection */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Choose Time</h2>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 px-4">
            <CalendarIcon className="h-4 w-4 text-white/40" />
            <input 
              type="date" 
              className="bg-transparent border-none text-white text-sm focus:outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <Card className="min-h-[400px] flex flex-col">
          {isLoadingSlots ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
            </div>
          ) : slotsErrorMessage ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white/40">Selection Error</h3>
              <p className="text-red-400/80 text-sm max-w-xs">{slotsErrorMessage}</p>
            </div>
          ) : slots?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-white/40">No slots available</h3>
              <p className="text-white/20 text-sm max-w-xs">This barber is fully booked or unavailable for the selected date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-2">
              {slots?.map((slot: any) => {
                const timeStr = new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isSelected = selectedSlot === slot.start;
                return (
                  <button
                    key={slot.start}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.start)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                      !slot.available 
                        ? "bg-white/[0.02] border-white/5 text-white/10 cursor-not-allowed"
                        : isSelected
                          ? "bg-orange-500 border-orange-500 text-black font-bold shadow-lg shadow-orange-500/20"
                          : "bg-white/5 border-white/5 text-white/60 hover:border-orange-500/30 hover:bg-orange-500/5"
                    }`}
                  >
                    <span className="text-sm">{timeStr}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-auto border-t border-white/5 p-6 bg-white/[0.01] space-y-4">
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

            <Button 
              className="w-full h-14 bg-orange-500 hover:bg-orange-400 text-black font-black rounded-2xl shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
              disabled={!selectedSlot || mutation.isPending}
              onClick={handleConfirm}
            >
              {mutation.isPending ? "Confirming..." : "Confirm Booking"}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
