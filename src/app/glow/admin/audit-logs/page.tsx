"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck, ShieldAlert, Monitor, Smartphone, Globe,
  Search, ChevronLeft, ChevronRight, Info
} from "lucide-react";
import { glowAdminApi } from "@/lib/glow-api";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [username, setUsername] = useState("");
  const [action, setAction] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [page, username, action]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await glowAdminApi.getAuditLogs({
        page, size: 10,
        username: username || undefined,
        action: action || undefined,
      });
      setLogs(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            System Audit Logs
          </h2>
          <p className="text-[#7A6350] mt-1 text-sm">Monitor user actions, security events, and device fingerprints.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5A090]" />
            <input type="text" placeholder="Filter by user..."
              value={username} onChange={(e) => { setUsername(e.target.value); setPage(0); }}
              className="pl-10 pr-4 py-2 bg-white border border-[#E8DDD2] rounded-full text-sm text-[#2C2416] outline-none w-48" />
          </div>
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(0); }}
            className="px-4 py-2 bg-white border border-[#E8DDD2] rounded-full text-sm text-[#7A6350] outline-none">
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="USER_REGISTER">Registration</option>
            <option value="APPROVE_USER">Approval</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#E8DDD2] rounded-[28px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAF5EE]/30">
                {["Timestamp", "User", "Action", "Status", "Device / IP", "Details"].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E4D8]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-5"><div className="h-4 bg-[#FAF5EE] rounded animate-pulse" /></td></tr>
                ))
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF5EE]/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-[#7A6350] whitespace-nowrap">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-[#2C2416]">@{log.username}</p>
                      <p className="text-[10px] text-[#B5A090] uppercase tracking-wider">{log.resourceType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-[#FAF5EE] text-[#7A6350] text-[11px] font-mono">
                        {log.action}
                      </span>
                      {log.metadata && (
                        <p className="text-[10px] text-[#B5A090] italic mt-1 max-w-[200px] truncate">{log.metadata}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "SUCCESS" ? (
                        <div className="flex items-center text-green-600 gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span className="text-xs font-semibold">SUCCESS</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500 gap-1.5">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span className="text-xs font-semibold uppercase">FAILED</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-[#7A6350]">
                        {log.device === "Mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                        <span className="font-semibold">{log.device}</span>
                        <span className="text-[#B5A090]">•</span>
                        <span>{log.browser} on {log.os}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#B5A090] mt-0.5">
                        <Globe className="h-2.5 w-2.5" />
                        <span>{log.ipAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            log.requestMethod === "POST" ? "bg-blue-100 text-blue-700" :
                            log.requestMethod === "GET" ? "bg-green-100 text-green-700" :
                            "bg-[#FFF0E8] text-[#D4864A]"
                          }`}>{log.requestMethod}</span>
                          <span className="text-[10px] font-mono text-[#B5A090] max-w-[150px] truncate">
                            {log.requestUrl?.split("/api/v1")[1] || log.requestUrl}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-[#B5A090]">No audit logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#FAF5EE]/30 border-t border-[#E8DDD2] flex items-center justify-between">
            <span className="text-xs text-[#B5A090]">Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-full hover:bg-[#FAF5EE] disabled:opacity-20 text-[#7A6350] transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-full hover:bg-[#FAF5EE] disabled:opacity-20 text-[#7A6350] transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
