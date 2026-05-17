"use client";

import { useState, useEffect } from "react";
import { Users, Search, MessageCircle } from "lucide-react";
import { glowAdminApi, AdminUserResponse } from "@/lib/glow-api";
import { motion } from "framer-motion";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    glowAdminApi.listUsers(0, 100)
      .then(res => setUsers(res?.content || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200";
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-purple-100 text-purple-700";
      case "OWNER": return "bg-blue-100 text-blue-700";
      case "BARBER": return "bg-[#FFF0E8] text-[#D4864A]";
      case "CUSTOMER": return "bg-[#FAF5EE] text-[#7A6350]";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#2C2416]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Users Management
          </h2>
          <p className="text-[#7A6350] mt-1 text-sm">Directory of all customers, stylists, and salon owners.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5A090]" />
          <input type="text" placeholder="Search users..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-full text-sm outline-none bg-white border border-[#E8DDD2] text-[#2C2416]" />
        </div>
      </div>

      <div className="bg-white border border-[#E8DDD2] rounded-[28px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FAF5EE]/30">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Username</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#B5A090] border-b border-[#E8DDD2]">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E4D8]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-6 py-5"><div className="h-4 bg-[#FAF5EE] rounded animate-pulse" /></td></tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map((user) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-[#FAF5EE]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#FFF0E8] flex items-center justify-center text-[#D4864A] font-bold text-sm">
                          {(user.firstName || "?")[0]}{(user.lastName || "?")[0]}
                        </div>
                        <span className="text-sm font-semibold text-[#2C2416]">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#7A6350]">@{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(user.approvalStatus)}`}>
                        {user.approvalStatus === "APPROVED" ? "Active" : user.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#7A6350]">{user.phoneNumber || "N/A"}</td>
                  </motion.tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[#B5A090]">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
