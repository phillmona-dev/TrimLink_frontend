"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { paymentService } from "@/api/paymentService";
import { mockAppointments } from "@/assets/mock-data";
import { Button } from "@/components/common/button";
import { Card } from "@/components/common/card";
import { formatCurrency } from "@/utils/format";

export function PaymentsPage() {
  const [selectedProvider, setSelectedProvider] = useState<"CHAPA" | "TELEBIRR">("CHAPA");
  const appointment = mockAppointments[0];

  const paymentMutation = useMutation({
    mutationFn: paymentService.initiate
  });

  return (
    <Card className="max-w-3xl">
      <h2 className="text-2xl font-black">Complete payment</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Use the same backend payment orchestration for Chapa and Telebirr. The returned checkout URL can open in-app or in-browser.
      </p>
      <div className="mt-6 rounded-3xl bg-secondary/60 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold">{appointment.serviceName}</div>
            <div className="text-sm text-muted-foreground">{appointment.shopName}</div>
          </div>
          <div className="text-2xl font-black text-primary">{formatCurrency(appointment.priceCharged)}</div>
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
        className="mt-6"
        onClick={() =>
          paymentMutation.mutate({
            referenceId: appointment.id,
            referenceType: "APPOINTMENT",
            provider: selectedProvider,
            amount: appointment.priceCharged
          })
        }
      >
        Start secure checkout
      </Button>
      {paymentMutation.data?.checkoutUrl ? (
        <p className="mt-4 rounded-2xl bg-secondary p-3 text-sm">
          Gateway ready: <span className="font-semibold">{paymentMutation.data.checkoutUrl}</span>
        </p>
      ) : null}
    </Card>
  );
}
