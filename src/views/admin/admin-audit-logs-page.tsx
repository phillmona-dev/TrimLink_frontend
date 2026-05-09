"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminService } from "@/api/adminService";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Monitor, 
  Smartphone, 
  Globe, 
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Info
} from "lucide-react";
import { format } from "date-fns";

export function AdminAuditLogsPage() {
  const [page, setPage] = useState(0);
  const [username, setUsername] = useState("");
  const [action, setAction] = useState("");

  const { data: logsPage, isLoading, error } = useQuery({
    queryKey: ["admin-audit-logs", page, username, action],
    queryFn: () => adminService.getAuditLogs({ 
      page, 
      size: 10, 
      username: username || undefined, 
      action: action || undefined 
    }),
  });

  if (error) {
    console.error("Audit Logs Query Error:", error);
  }

  const logs = logsPage?.content || [];
  const totalPages = logsPage?.totalPages || 0;

  console.log("Audit Logs Debug:", { logs, isLoading, logsPage, error });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white/90 tracking-tight">System Audit Logs</h2>
          <p className="text-sm text-white/50">Monitor user actions, security events, and device fingerprints.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Filter by user..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-48"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setPage(0); }}
            />
          </div>
          <select 
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none"
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(0); }}
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="USER_REGISTER">Registration</option>
            <option value="APPROVE_SHOP">Approval</option>
          </select>
        </div>
      </div>

      <Card className="border-white/5 bg-black/30 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-xs uppercase text-white/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Device/IP</th>
                <th className="px-6 py-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4 animate-pulse">
                      <div className="h-4 bg-white/10 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-white/50 whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white/90">@{log.username}</span>
                        <span className="text-[10px] text-white/30 uppercase tracking-tighter">{log.resourceType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-1 rounded bg-white/5 text-white/60 text-[11px] font-mono w-fit">
                          {log.action}
                        </span>
                        {log.metadata && (
                          <span className="text-[10px] text-white/40 italic max-w-[200px] truncate">
                            {log.metadata}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "SUCCESS" ? (
                        <div className="flex items-center text-emerald-400 gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold">SUCCESS</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-rose-400 gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span className="text-xs font-semibold uppercase">FAILED</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-white/50 text-[11px]">
                          {log.device === "Mobile" ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                          <span className="font-semibold text-white/70">{log.device}</span>
                          <span className="text-white/30">•</span>
                          <span>{log.browser} on {log.os}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/30 text-[10px]">
                          <Globe className="w-2.5 h-2.5" />
                          <span>{log.ipAddress}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            log.requestMethod === "POST" ? "bg-blue-500/20 text-blue-400" :
                            log.requestMethod === "GET" ? "bg-emerald-500/20 text-emerald-400" :
                            "bg-orange-500/20 text-orange-400"
                          }`}>
                            {log.requestMethod}
                          </span>
                          <span className="text-[10px] font-mono text-white/30 max-w-[150px] truncate">
                            {log.requestUrl?.split("/api/v1")[1] || log.requestUrl}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-white/20 hover:text-white/60">
                          <Info className="w-3 h-3 mr-1" />
                          Full Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/30">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="text-white/50 disabled:opacity-20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="text-white/50 disabled:opacity-20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
