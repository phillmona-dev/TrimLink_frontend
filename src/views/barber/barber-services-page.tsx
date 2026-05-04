import { Card } from "@/components/common/card";

export function BarberServicesPage() {
  return (
    <Card>
      <h2 className="text-2xl font-black">Service management</h2>
      <div className="mt-6 space-y-4">
        <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-white/40">
          No services assigned. Add your first service to start accepting bookings.
        </div>
      </div>
    </Card>
  );
}
