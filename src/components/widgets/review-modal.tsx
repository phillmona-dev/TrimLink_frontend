import { Star } from "lucide-react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";

export function ReviewModal() {
  return (
    <Card className="rounded-[1.75rem]">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-secondary p-3 text-primary">
          <Star className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold">Customer review prompt</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Reusable review capture surface for completed appointments and retention campaigns.
          </p>
          <Button className="mt-4">Rate service</Button>
        </div>
      </div>
    </Card>
  );
}
