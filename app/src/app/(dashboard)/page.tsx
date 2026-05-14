export const dynamic = "force-dynamic";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Monitor, MapPin, FileText, ArrowUpRight } from "lucide-react";
import { db } from "@/db";
import { clients, locations, screens, changeRequests } from "@/db/schema";
import { count, eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function DashboardPage() {
  const [clientCount] = await db.select({ value: count() }).from(clients);
  const [locationCount] = await db.select({ value: count() }).from(locations);
  const [screenCount] = await db.select({ value: count() }).from(screens);
  const [onlineCount] = await db
    .select({ value: count() })
    .from(screens)
    .where(eq(screens.isOnline, 1));
  const [pendingRequests] = await db
    .select({ value: count() })
    .from(changeRequests)
    .where(eq(changeRequests.status, "pending"));

  const recentClients = await db
    .select({ id: clients.id, name: clients.name, createdAt: clients.createdAt })
    .from(clients)
    .orderBy(desc(clients.createdAt))
    .limit(5);

  const onlinePct =
    screenCount.value > 0
      ? Math.round((onlineCount.value / screenCount.value) * 100)
      : 0;

  const stats = [
    {
      title: "Clients",
      value: clientCount.value,
      icon: Users,
      sub: "Active restaurants",
      href: "/clients",
      accent: false,
    },
    {
      title: "Locations",
      value: locationCount.value,
      icon: MapPin,
      sub: "Across all clients",
      href: "/locations",
      accent: false,
    },
    {
      title: "Displays",
      value: screenCount.value,
      icon: Monitor,
      sub: `${onlineCount.value} online`,
      badge: `${onlinePct}%`,
      href: "/displays",
      accent: true,
    },
    {
      title: "Requests",
      value: pendingRequests.value,
      icon: FileText,
      sub: "Pending review",
      href: "/requests",
      accent: false,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your signage network at a glance
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card
              className={`card-hover cursor-pointer group ${
                stat.accent ? "border-copper/20 glow-copper" : ""
              }`}
            >
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted-foreground">
                    {stat.title}
                  </span>
                  <stat.icon
                    className={`h-4 w-4 ${
                      stat.accent ? "text-copper" : "text-muted-foreground/60"
                    }`}
                  />
                </div>
                <div className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">
                    {stat.sub}
                  </span>
                  {stat.badge && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 bg-copper/10 text-copper border-copper/20"
                    >
                      {stat.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Clients */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5 px-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Recent Clients
              </h3>
              <Link
                href="/clients"
                className="text-xs text-copper hover:text-copper/80 flex items-center gap-1"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 py-4">
                No clients yet. Add your first restaurant.
              </p>
            ) : (
              <div className="space-y-2">
                {recentClients.map((c) => (
                  <Link
                    key={c.id}
                    href={`/clients/${c.id}`}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors group"
                  >
                    <span className="text-sm font-medium">{c.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {c.createdAt.toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network Status */}
        <Card className="border-border/50">
          <CardContent className="pt-5 px-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Network Health
              </h3>
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    onlinePct >= 90
                      ? "bg-emerald-500 glow-online"
                      : onlinePct >= 50
                        ? "bg-amber-400"
                        : "bg-red-500"
                  } ${onlinePct >= 90 ? "status-pulse" : ""}`}
                />
                <span className="text-xs text-muted-foreground">
                  {onlinePct >= 90
                    ? "Healthy"
                    : onlinePct >= 50
                      ? "Degraded"
                      : screenCount.value === 0
                        ? "No displays"
                        : "Critical"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Online bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    Display Uptime
                  </span>
                  <span className="font-mono text-foreground">
                    {onlinePct}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
                    style={{ width: `${onlinePct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <div className="text-lg font-semibold">
                    {onlineCount.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Online
                  </div>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <div className="text-lg font-semibold">
                    {screenCount.value - onlineCount.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Offline
                  </div>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <div className="text-lg font-semibold">
                    {screenCount.value}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Total
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
