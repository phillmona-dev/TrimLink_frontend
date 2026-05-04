"use client";

import { useQuery } from "@tanstack/react-query";
import { queueService } from "@/api/queueService";
import { QueueWidget } from "@/components/widgets/queue-widget";
import { Card } from "@/components/common/card";
export function QueuePage() {
  // In a real app, this would come from a URL param or state
  const entryId = typeof window !== "undefined" ? localStorage.getItem("active_queue_id") : null;

  const ticketQuery = useQuery({
    queryKey: ["queue-ticket", entryId],
    queryFn: () => queueService.ticket(entryId!),
    enabled: !!entryId
  });

  return (
    <div className="max-w-md mx-auto mt-8">
      <QueueWidget ticket={ticketQuery.data ?? null} />
    </div>
  );
}
