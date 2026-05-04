"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { paymentService } from "@/api/paymentService";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";

export function PaymentsPage() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const amountStr = searchParams.get("amount");
  const amount = amountStr ? parseFloat(amountStr) : 0;
  const serviceName = searchParams.get("service") || "Grooming Service";
  
  const [selectedProvider, setSelectedProvider] = useState<"CHAPA" | "TELEBIRR">("CHAPA");

  const paymentMutation = useMutation({
    mutationFn: paymentService.initiate
  });

  if (!appointmentId || !amount) {
    return (
      <Card className="max-w-3xl">
        <h2 className="text-2xl font-black">No active payment request</h2>
        <p className="mt-4 text-muted-foreground text-center py-10 border border-dashed border-white/10 rounded-3xl">
          Please initiate a payment from your bookings or queue ticket.
        </p>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl">
      <h2 className="text-2xl font-black">Complete payment</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Securely pay for your service using your preferred provider.
      </p>
      <div className="mt-6 rounded-3xl bg-secondary/60 p-5 border border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold">{serviceName}</div>
            <div className="text-xs text-muted-foreground mt-1">ID: {appointmentId}</div>
          </div>
          <div className="text-2xl font-black text-glow-400">ETB {amount}</div>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant={selectedProvider === "CHAPA" ? "primary" : "outline"} onClick={() => setSelectedProvider("CHAPA")}>
          Pay with Chapa
        </Button>
        <Button variant={selectedProvider === "TELEBIRR" ? "primary" : "outline"} onClick={() => setSelectedProvider("TELEBIRR")}>
          Pay with Telebirr
        </Button>
      </div>
      <Button
        className="mt-6 w-full h-14 text-lg font-bold"
        isLoading={paymentMutation.isPending}
        onClick={() =>
          paymentMutation.mutate({
            referenceId: appointmentId,
            referenceType: "APPOINTMENT",
            provider: selectedProvider,
            amount: amount
          })
        }
      >
        Start secure checkout
      </Button>
      {paymentMutation.data?.checkoutUrl ? (
        <div className="mt-6 p-4 rounded-2xl bg-primary/10 border border-primary/20">
          <p className="text-sm font-medium text-primary">Redirecting to payment gateway...</p>
          <a 
            href={paymentMutation.data.checkoutUrl} 
            className="mt-2 block text-xs underline break-all opacity-60"
          >
            {paymentMutation.data.checkoutUrl}
          </a>
        </div>
      ) : null}
    </Card>
  );
}
