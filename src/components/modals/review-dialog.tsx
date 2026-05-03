"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import { Button } from "@/components/common/button";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/common/dialog";
import { Textarea } from "@/components/common/textarea";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  barberName: string;
}

export function ReviewDialog({ isOpen, onClose, appointmentId, barberName }: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) =>
      bookingService.submitReview(appointmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      onClose();
      setComment("");
      setRating(5);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] border-white/10 rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">Rate your session</DialogTitle>
          <DialogDescription className="text-white/40">
            How was your experience with {barberName}? Your feedback helps others choose the best barbers.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-all hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= rating ? "fill-orange-500 text-orange-500" : "text-white/10"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-lg font-black text-orange-400">{rating} / 5 Stars</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/30 ml-1">Your Feedback</label>
            <Textarea
              placeholder="Tell us what you liked (or what could be better)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] text-white placeholder:text-white/20 focus:border-orange-500/50 transition-all"
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl text-white/40 hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate({ rating, comment })}
            disabled={mutation.isPending}
            className="bg-orange-500 hover:bg-orange-400 text-black font-bold rounded-xl px-8"
          >
            {mutation.isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
