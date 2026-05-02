import { featuredServices } from "@/assets/mock-data";
import { Card } from "@/components/common/card";
import { formatCurrency } from "@/utils/format";

export function BarberServicesPage() {
  return (
    <Card>
      <h2 className="text-2xl font-black">Service management</h2>
      <div className="mt-6 space-y-4">
        {featuredServices.map((service) => (
          <div className="flex items-center justify-between rounded-3xl border border-border p-4" key={service.id}>
            <div>
              <div className="font-semibold">{service.name}</div>
              <div className="text-sm text-muted-foreground">{service.durationMinutes} min</div>
            </div>
            <div className="font-black text-primary">{formatCurrency(service.basePrice)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
