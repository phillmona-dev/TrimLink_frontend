import { mockAppointments } from "@/assets/mock-data";
import { Card } from "@/components/common/card";
import { formatDateTime } from "@/utils/format";

export function OwnerBookingsPage() {
  return (
    <Card>
      <h2 className="text-2xl font-black">Operational bookings view</h2>
      <div className="mt-6 space-y-4">
        {mockAppointments.map((appointment) => (
          <div className="flex items-center justify-between rounded-3xl border border-border p-4" key={appointment.id}>
            <div>
              <div className="font-semibold">{appointment.serviceName}</div>
              <div className="text-sm text-muted-foreground">{formatDateTime(appointment.scheduledStart)}</div>
            </div>
            <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">{appointment.status}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
