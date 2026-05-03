"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { barberService } from "@/api/barberService";
import { bookingService } from "@/api/bookingService";
import { featuredBarbers, featuredShops } from "@/assets/mock-data";
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
    queryFn: () => barberService.getShop(shopId),
    placeholderData: featuredShops[0]
  });

  const barbersQuery = useQuery({
    queryKey: ["shop-barbers", shopId],
    queryFn: () => barberService.getShopBarbers(shopId),
    placeholderData: featuredBarbers
  });

  const reviewsQuery = useQuery({
    queryKey: ["shop-reviews", shopId],
    queryFn: () => bookingService.getShopReviews(shopId),
    enabled: !!shopId
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
          <h2 className="text-2xl font-black">Barbers</h2>
          <div className="mt-5 space-y-4">
            {barbersQuery.data?.map((barber) => (
              <div className="rounded-3xl border border-border p-5" key={barber.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{barber.user.firstName} {barber.user.lastName}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{barber.bio}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={barber.available ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}>
                      {barber.available ? "Available" : "Away"}
                    </Badge>
                    <Badge className={barber.status === "BUSY" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"}>
                      {barber.status === "BUSY" ? "On Work" : "Idle"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {barber.serviceAssignments?.map((assignment) => (
                    <div className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3 group/service" key={assignment.id}>
                      <div className="flex-1">
                        <div className="font-semibold text-white/90">{assignment.serviceName || "Unknown Service"}</div>
                        <div className="text-xs text-white/40">{assignment.durationMinutes || 0} min</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-black text-orange-400">{formatCurrency(assignment.effectivePrice ?? 0)}</div>
                        {assignment.serviceId && (
                          <Link 
                            href={`/app/booking?shopId=${shopId}&barberId=${barber.id}&serviceId=${assignment.serviceId}`}
                          >
                            <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-black font-bold h-9 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95">
                              Book
                            </Button>
                          </Link>
                        )}
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
            {reviewsQuery.data?.content.map((review) => (
              <div className="rounded-[2rem] bg-white/5 border border-white/5 p-6 hover:bg-white/10 transition-all" key={review.id}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-black text-white/90">{review.reviewerName}</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mt-0.5">Reviewed {review.barberName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <span className="text-sm font-black text-orange-400">{review.rating}</span>
                    <span className="text-[10px] text-orange-400/50">/ 5</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/50">{review.comment}</p>
              </div>
            ))}
            {(!reviewsQuery.data?.content || reviewsQuery.data.content.length === 0) && (
              <div className="text-center py-10 text-white/20 border border-dashed border-white/10 rounded-3xl">
                No reviews yet for this shop.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
