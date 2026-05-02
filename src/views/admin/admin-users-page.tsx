"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/api/adminService";
import { Card } from "@/components/common/card";

export function AdminUsersPage() {
  const { data: usersPage, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminService.users,
  });

  return (
    <Card className="border-white/5 bg-black/30 backdrop-blur-md">
      <h2 className="text-2xl font-black text-white/90">Users Management</h2>
      <p className="mt-2 text-sm text-white/50 mb-6">Directory of all customers, barbers, and shop owners.</p>
      
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="bg-white/5 text-xs uppercase text-white/50 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium tracking-wider">Name</th>
              <th className="px-6 py-4 font-medium tracking-wider">Username</th>
              <th className="px-6 py-4 font-medium tracking-wider">Role</th>
              <th className="px-6 py-4 font-medium tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-white/10 animate-pulse rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-white/10 animate-pulse rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-16 bg-white/10 animate-pulse rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-white/10 animate-pulse rounded" /></td>
                </tr>
              ))
            ) : usersPage?.content && usersPage.content.length > 0 ? (
              usersPage.content.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white/90">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-white/60">@{user.username}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-xs bg-white/10 text-white/70">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.approvalStatus === "PENDING" && (
                      <span className="text-orange-400 font-medium">Pending</span>
                    )}
                    {user.approvalStatus === "APPROVED" && (
                      <span className="text-emerald-400 font-medium">Active</span>
                    )}
                    {user.approvalStatus === "REJECTED" && (
                      <span className="text-red-400 font-medium">Rejected</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-white/40">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
