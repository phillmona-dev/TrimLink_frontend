"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { staffService } from "@/api/staffService";
import { featuredStaffs, featuredShops, mockReviews } from "@/assets/mock-data";
import { Card } from "@/components/common/card";
import { Badge } from "@/components/common/badge";
import { Button } from "@/components/common/button";
import Link from "next/link";
import { formatCurrency } from "@/utils/format";

export function ShopDetailsPage() {
  const params = useParams<{ shopId: string }>();
  const shopId = params?.shopId ?? "shop-1";
  const shopQuery = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => staffService.getShop(shopId),
    placeholderData: featuredShops[0]
  });

  const staffsQuery = useQuery({
    queryKey: ["shop-staffs", shopId],
    queryFn: () => staffService.getShopStaffs(shopId),
    placeholderData: featuredStaffs
  });

  const shop = shopQuery.data;

  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] bg-hero-grid text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge className="border-white/15 bg-white/10 text-glow-400">{shop?.city}</Badge>
            <h1 className="mt-4 text-4xl font-black">{shop?.name}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70">{shop?.description}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5">
            <div className="text-sm text-white/60">Queue status</div>
            <div className="mt-2 text-3xl font-black">12 active</div>
            <div className="mt-2 text-sm text-glow-400">Average wait 18 min</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="text-2xl font-black">Staffs</h2>
          <div className="mt-5 space-y-4">
            {staffsQuery.data?.map((staff) => (
              <div className="rounded-3xl border border-border p-5" key={staff.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{staff.user.firstName} {staff.user.lastName}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{staff.bio}</p>
                  </div>
                  <Badge>{staff.available ? "Available" : "Busy"}</Badge>
                </div>
                <div className="mt-4 grid gap-3">
                  {staff.serviceAssignments?.map((assignment) => (
                    <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3 group/service" key={assignment.id}>
                      <div className="flex-1">
                        <div className="font-semibold text-white/90">{assignment.service.name}</div>
                        <div className="text-xs text-white/40">{assignment.service.durationMinutes} min</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-black text-orange-400">{formatCurrency(assignment.customPrice ?? assignment.service.basePrice)}</div>
                        <Link 
                          href={`/app/booking?shopId=${shopId}&staffId=${staff.id}&serviceId=${assignment.service.id}`}
                        >
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-black font-bold h-9 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95">
                            Book
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-black">Reviews</h2>
          <div className="mt-5 space-y-4">
            {mockReviews.map((review) => (
              <div className="rounded-3xl border border-border p-5" key={review.id}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">{review.reviewerName}</h3>
                  <Badge>{review.rating}/5</Badge>
                </div>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
