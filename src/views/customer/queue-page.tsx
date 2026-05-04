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
    <div className="max-w-md mx-auto mt-8">
      <QueueWidget ticket={ticketQuery.data ?? null} />
    </div>
  );
}
