import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function PaymentResultPage() {
  const params = useSearchParams();
  const status = params.get("status") ?? "success";
  const success = status === "success";

  return (
    <Card className="max-w-2xl text-center">
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${success ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
        {success ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
      </div>
      <h2 className="mt-6 text-3xl font-black">{success ? "Payment successful" : "Payment failed"}</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        {success
          ? "Your booking is now ready for confirmation and arrival reminders."
          : "The provider did not confirm payment. You can retry from your appointments tab."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/app/appointments">View appointments</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/app/payments">Back to payments</Link>
        </Button>
      </div>
    </Card>
  );
}
