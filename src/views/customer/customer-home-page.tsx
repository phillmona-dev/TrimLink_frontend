"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { barberService } from "@/api/barberService";
import { featuredBarbers, featuredShops } from "@/assets/mock-data";
import { Card } from "@/components/common/card";
import { Input } from "@/components/common/input";
import { QueueWidget } from "@/components/widgets/queue-widget";
import { StatCard } from "@/components/widgets/stat-card";
import { mockQueueTicket } from "@/assets/mock-data";
import { AnimatedIcon } from "@/components/common/animated-icon";

export function CustomerHomePage() {
  const [search, setSearch] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveQuery(search);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [search]);

  const shopsQuery = useQuery({
    queryKey: ["shops", activeQuery],
    queryFn: () => barberService.listShops({ q: activeQuery, size: 6 }),
    placeholderData: {
      content: featuredShops,
      page: 0,
      size: 6,
      totalElements: featuredShops.length,
      totalPages: 1,
      first: true,
      last: true
    }
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="relative overflow-hidden rounded-[2.5rem] border-white/10 bg-white/5 backdrop-blur-3xl p-8 md:p-10 text-white shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-glow-400">Customer home</p>
              <h2 className="mt-3 text-4xl font-black">Book faster. Wait smarter.</h2>
              <p className="mt-4 max-w-xl text-sm leading-8 text-white/70">
                Discover nearby shops, see who is available, and lock in a slot before you even leave.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/60">This week saved</div>
              <div className="mt-2 text-3xl font-black">1h 42m</div>
            </div>
          </div>
          
          <div className="relative z-10 mt-10 group">
            <AnimatedIcon icon={Search} className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40 group-focus-within:text-orange-400 transition-colors" />
            <Input 
              className="border-white/10 bg-black/30 pl-14 text-white placeholder:text-white/30 focus:border-orange-500/50 h-14 rounded-2xl" 
              placeholder="Search by shop, barber, or location" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Card>
        <QueueWidget ticket={mockQueueTicket} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Shops near you" value={shopsQuery.data?.content.length ?? 0} helper="Based on your selected city" />
        <StatCard label="Barbers available now" value={featuredBarbers.filter((item) => item.available).length} helper="Ready for bookings and walk-ins" />
        <StatCard label="Flash promos" value="3 live" helper="Haircut + beard bundles this week" />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">Nearby barbershops</h3>
            <p className="text-sm text-muted-foreground">Curated for fast discovery and strong service quality.</p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {shopsQuery.data?.content.map((shop) => (
            <Card key={shop.id} className="rounded-[1.75rem]">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xl font-bold">{shop.name}</h4>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground group">
                    <AnimatedIcon icon={MapPin} size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    {shop.address}
                  </div>
                </div>
                <div className="group relative">
                  <AnimatedIcon icon={Sparkles} size={20} className="text-primary" animate="rotate" />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                    Premium Shop
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{shop.description}</p>
              <Link href={`/app/shops/${shop.id}`} className="mt-5 flex items-center justify-between rounded-2xl bg-secondary/70 px-4 py-3 hover:bg-secondary transition-colors">
                <div className="text-sm">
                  <div className="font-semibold">Open queue</div>
                  <div className="text-muted-foreground">Wait from 10-25 minutes</div>
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">View shop</div>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black">Featured barbers</h3>
            <p className="text-sm text-muted-foreground">High-rated professionals customers keep coming back to.</p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {featuredBarbers.map((barber) => (
            <Card key={barber.id} className="rounded-[1.75rem]">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-glow-400 to-glow-600 font-black text-ink-950">
                  {barber.user.firstName[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold">{barber.user.firstName} {barber.user.lastName}</h4>
                    <div className="flex items-center gap-1 text-amber-500 group relative">
                      <AnimatedIcon icon={Star} size={16} className="fill-current" />
                      <span className="font-semibold">{barber.averageRating}</span>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 scale-90 -translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                        Rating
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{barber.bio}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
