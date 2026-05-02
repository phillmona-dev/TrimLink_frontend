import { CreditCard } from "lucide-react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";

export function PaymentModal() {
  return (
    <Card className="rounded-[1.75rem]">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-secondary p-3 text-primary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Checkout handoff</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Plug this surface into appointment or queue flows when you want a modal-first payment step.
          </p>
          <div className="mt-4 flex gap-3">
            <Button>Telebirr</Button>
            <Button variant="outline">Chapa</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
