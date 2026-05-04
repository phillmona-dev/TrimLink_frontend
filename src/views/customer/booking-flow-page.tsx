"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { bookingService } from "@/api/bookingService";
import { barberService } from "@/api/barberService";
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
  AlertCircle
} from "lucide-react";
import { formatCurrency, formatEthiopianTime } from "@/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { EthDateTime } from 'ethiopian-calendar-date-converter';

export function BookingFlowPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const availableDates = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    let display = d.toLocaleDateString();
    try {
      const ethDate = EthDateTime.fromEuropeanDate(d);
      const ethMonthNames = ["Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miazia", "Genbot", "Sene", "Hamle", "Nehase", "Pagumē"];
      display = `${ethMonthNames[ethDate.month - 1]} ${ethDate.date}, ${ethDate.year}`;
      if (i === 0) display += " (Today)";
      if (i === 1) display += " (Tomorrow)";
    } catch (e) {
      console.error(e);
    }
    return { value: d.toISOString().split('T')[0], display };
  });

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
    <div className="max-w-xl mx-auto space-y-8">
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
                <select 
                  className="bg-transparent border-none text-white text-sm focus:outline-none appearance-none font-bold pr-4 cursor-pointer"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  {availableDates.map(date => (
                    <option key={date.value} value={date.value} className="bg-ink-950 text-white">
                      {date.display}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Card className="min-h-[300px] flex flex-col">
              {isLoadingSlots ? (
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                </div>
              ) : slotsErrorMessage ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                  <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white/40">Selection Error</h3>
                  <p className="text-red-400/80 text-sm max-w-xs">{slotsErrorMessage}</p>
                </div>
              ) : slots?.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 min-h-[300px]">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-4">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white/40">No slots available</h3>
                  <p className="text-white/20 text-sm max-w-xs">This barber is fully booked or unavailable for the selected date.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-2">
                  {slots?.map((slot: any) => {
                    const timeStr = formatEthiopianTime(slot.start);
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
            </Card>
            
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
                    {selectedSlot ? formatEthiopianTime(selectedSlot) : ""} on {availableDates.find(d => d.value === selectedDate)?.display?.split(' (')[0]}
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
                          Please make the payment to the selected account and upload the receipt below.
                        </p>
                       
                       <div className="relative">
                         <input 
                           type="file" 
                           accept="image/*"
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
                             onClick={handleUpload}
                             className="w-full mt-4 bg-orange-500 text-black font-bold h-12 rounded-2xl shadow-lg shadow-orange-500/20"
                           >
                             Upload Receipt
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
                                 src={receiptImageUrl} 
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
