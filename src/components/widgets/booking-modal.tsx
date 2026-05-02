import { CalendarDays } from "lucide-react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";

export function BookingModal() {
  return (
    <Card className="rounded-[1.75rem]">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-secondary p-3 text-primary">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Quick booking</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Reusable surface for embedded booking on shop or barber detail pages.
          </p>
          <Button className="mt-4">Open booking flow</Button>
        </div>
      </div>
    </Card>
  );
}
