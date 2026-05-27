import React, { useState } from "react";
import { format } from "date-fns";
import { 
  History, 
  User, 
  Globe, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Activity 
} from "lucide-react";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";

interface Revision {
  revisionNumber: number;
  revisionTimestamp: number;
  userId: string;
  username: string;
  ipAddress: string;
  entity: any;
}

interface Props {
  revisions: Revision[];
  title?: string;
}

export function AuditHistoryTimeline({ revisions, title = "Data History (Time Machine)" }: Props) {
  const [expandedRev, setExpandedRev] = useState<number | null>(null);

  if (!revisions || revisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground bg-slate-900/20 rounded-xl border border-dashed border-slate-700">
        <History className="w-12 h-12 mb-4 opacity-20" />
        <p>No historical revisions found for this entity.</p>
      </div>
    );
  }

  // Sort revisions descending (newest first)
  const sortedRevisions = [...revisions].sort((a, b) => b.revisionNumber - a.revisionNumber);

  return (
    <Card className="bg-slate-950/50 border-slate-800 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-slate-800/50 pb-4 p-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
          <History className="w-5 h-5" />
          {title}
        </h3>
      </div>
      <div className="pt-6 p-6">
        <div className="relative space-y-6">
          {/* Vertical Line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-500/50 via-slate-700 to-transparent" />

          {sortedRevisions.map((rev, index) => {
            const isExpanded = expandedRev === rev.revisionNumber;
            const dateStr = format(new Date(rev.revisionTimestamp), "PPP p");
            
            return (
              <div key={rev.revisionNumber} className="relative pl-10 group">
                {/* Timeline Dot */}
                <div className={`absolute left-[13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                  index === 0 ? "bg-indigo-500 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-slate-800 border-slate-600"
                }`} />

                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  isExpanded 
                    ? "bg-slate-900/80 border-indigo-500/50 shadow-lg" 
                    : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                }`}>
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedRev(isExpanded ? null : rev.revisionNumber)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                          Rev #{rev.revisionNumber}
                        </Badge>
                        <span className="text-slate-100 font-medium">{index === 0 ? "Current Version" : "Past Version"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {rev.username}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-500" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Source IP</p>
                          <p className="text-sm font-mono text-indigo-300 flex items-center gap-2">
                            <Globe className="w-3 h-3" /> {rev.ipAddress}
                          </p>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">User ID</p>
                          <p className="text-sm font-mono text-slate-400 truncate" title={rev.userId}>
                            {rev.userId}
                          </p>
                        </div>
                      </div>

                      {/* Entity Snapshot (JSON) */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 px-1">Data Snapshot</p>
                        <pre className="text-xs bg-slate-950 p-4 rounded-lg overflow-x-auto text-indigo-200/80 border border-slate-800/50 max-h-60 scrollbar-thin scrollbar-thumb-slate-800">
                          {JSON.stringify(rev.entity, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
