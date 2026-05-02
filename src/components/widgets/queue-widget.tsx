import { Clock3, Ticket } from "lucide-react";
import { Card } from "@/components/common/card";
import type { QueueTicket } from "@/types";

export function QueueWidget({ ticket }: { ticket: QueueTicket | null }) {
  if (!ticket) {
    return (
      <Card className="bg-black/20 p-6 flex items-center justify-center border-dashed border-white/20">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
            <Ticket className="h-6 w-6 text-white/50" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white/90">No active queue ticket</h3>
            <p className="mt-1 text-sm text-white/50">Join a walk-in queue to track live updates.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-black/30 border-orange-500/30 shadow-[0_0_30px_rgba(255,136,0,0.1)] text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/70 uppercase tracking-widest font-medium">Live queue ticket</p>
          <h3 className="mt-2 text-5xl font-black text-white/90">#{ticket.position}</h3>
        </div>
        <div className="rounded-2xl bg-orange-500/20 border border-orange-500/30 p-3">
          <Clock3 className="h-6 w-6 text-orange-400" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-white/55">Wait time</div>
          <div className="mt-2 text-xl font-bold">{ticket.estimatedWaitMinutes} min</div>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.24em] text-white/55">Status</div>
          <div className="mt-2 text-xl font-bold">{ticket.status}</div>
        </div>
      </div>
    </Card>
  );
}
