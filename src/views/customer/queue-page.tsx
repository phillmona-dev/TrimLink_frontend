"use client";

import { useQuery } from "@tanstack/react-query";
import { queueService } from "@/api/queueService";
import { mockQueueTicket } from "@/assets/mock-data";
import { QueueWidget } from "@/components/widgets/queue-widget";
import { Card } from "@/components/common/card";

export function QueuePage() {
  const ticketQuery = useQuery({
    queryKey: ["queue-ticket", mockQueueTicket.entryId],
    queryFn: () => queueService.ticket(mockQueueTicket.entryId),
    placeholderData: mockQueueTicket
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <QueueWidget ticket={ticketQuery.data ?? null} />
      <Card>
        <h2 className="text-2xl font-black">Realtime-ready queue updates</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          This screen is already structured for SSE or WebSocket delivery. As the backend emits queue position
          changes, the UI can hydrate the ticket widget without refreshing the whole dashboard.
        </p>
        <div className="mt-6 space-y-4">
          {[
            "Queue joined successfully",
            "Staff called the next customer",
            "Service started",
            "Queue completed or cancelled"
          ].map((event) => (
            <div className="rounded-3xl border border-border p-4 text-sm" key={event}>
              {event}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
