"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/api/bookingService";
import { mockAppointments } from "@/assets/mock-data";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { formatCurrency, formatDateTime } from "@/utils/format";

import { useRouter } from "next/navigation";

export function AppointmentsPage() {
  const router = useRouter();
  const appointmentsQuery = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => bookingService.getMine(0),
    placeholderData: {
      content: mockAppointments,
      page: 0,
      size: 10,
      totalElements: mockAppointments.length,
      totalPages: 1,
      first: true,
      last: true
    }
  });

  return (
    <div className="space-y-5">
      {appointmentsQuery.data?.content.map((appointment) => (
        <Card className="rounded-[1.75rem]" key={appointment.id}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-xl font-bold">{appointment.serviceName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {appointment.shopName} · {appointment.staffName}
              </p>
              <p className="mt-3 text-sm">{formatDateTime(appointment.scheduledStart)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">{appointment.status}</div>
              <div className="font-black text-primary">{formatCurrency(appointment.priceCharged)}</div>
              <Button 
                variant="outline"
                onClick={() => router.push(`/app/booking?shopId=${appointment.shopId}&staffId=${appointment.staffId}&serviceId=${appointment.serviceId}`)}
              >
                Rebook
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
