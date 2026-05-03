"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/common/card";
import { Button } from "@/components/common/button";
import { useWebSocket } from "@/hooks/useWebSocket";
import { http } from "@/api/http";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { WS_BASE_URL } from "@/utils/constants";

export function StaffQueuePage() {
  const { session } = useAuth();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 1. Initial Fetch of Pending Bookings
  const { data: initialData, refetch } = useQuery({
    queryKey: ["bookings", "pending", session?.userId],
    queryFn: async () => {
      const { data } = await http.get("/bookings/staff?status=PENDING");
      return data.data.content;
    },
    enabled: !!session?.userId
  });

  const [pendingBookings, setPendingBookings] = useState<any[]>([]);

  useEffect(() => {
    if (initialData) setPendingBookings(initialData);
  }, [initialData]);

  // 2. Real-time Updates via WebSocket
  const { connected } = useWebSocket({
    url: WS_BASE_URL,
    topic: `/topic/staffs/${session?.userId}/bookings`,
    onMessage: (booking) => {
      console.log("WebSocket booking received:", booking);
      setToastMsg(`New booking request from ${booking.customerName}!`);
      setPendingBookings((prev) => [booking, ...prev]);
      setTimeout(() => setToastMsg(null), 5000);
    },
    enabled: !!session?.userId,
  });

  const handleAction = async (appointmentId: string, action: "confirm" | "reject" | "reschedule") => {
    try {
      await http.patch(`/bookings/${appointmentId}/${action}`);
      setPendingBookings((prev) => prev.filter(b => b.id !== appointmentId));
    } catch (err) {
      console.error(`Failed to ${action} booking`, err);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-orange-500 text-black px-4 py-3 rounded-xl font-bold shadow-lg z-50">
          {toastMsg}
        </div>
      )}

      <Card className="border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2rem] text-white">
        <h2 className="text-3xl font-normal tracking-tight text-white/90">Pending Approvals</h2>
        <div className="mt-2 text-sm text-white/50">
          Status: {connected ? "Connected to live updates" : "Connecting..."}
        </div>
        
        <div className="mt-6 space-y-4">
          {pendingBookings.length === 0 ? (
            <div className="text-white/40 text-sm">No pending booking requests.</div>
          ) : (
            pendingBookings.map((booking, idx) => (
              <div key={idx} className="rounded-3xl bg-secondary/60 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="font-semibold text-lg">{booking.customerName}</div>
                  <div className="text-white/60 text-sm mt-1">{booking.serviceName} at {new Date(booking.scheduledStart).toLocaleString()}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleAction(booking.id, "confirm")} className="bg-green-600 hover:bg-green-700">Approve</Button>
                  <Button onClick={() => handleAction(booking.id, "reschedule")} variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10">Reschedule</Button>
                  <Button onClick={() => handleAction(booking.id, "reject")} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">Reject</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      
      <Card className="border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-8 rounded-[2rem] text-white">
        <h2 className="text-3xl font-normal tracking-tight text-white/90">Queue management</h2>
        <div className="mt-6 rounded-3xl bg-secondary/60 p-5">
          <div className="font-semibold text-white/70">Current caller</div>
          <div className="mt-2 text-5xl font-black text-orange-400">#--</div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="rounded-full h-12 px-6 font-semibold bg-white text-black hover:bg-gray-200">Call next</Button>
            <Button variant="outline" className="rounded-full h-12 px-6">Start service</Button>
            <Button variant="outline" className="rounded-full h-12 px-6">Complete</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
