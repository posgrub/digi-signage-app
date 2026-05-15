export const dynamic = "force-dynamic";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Monitor, MapPin, FileText, ArrowUpRight } from "lucide-react";
import { db } from "@/db";
import { clients, locations, screens, changeRequests } from "@/db/schema";
import { count, eq, desc, and, sql } from "drizzle-orm";
import Link from "next/link";
import { getClientScope } from "@/lib/scope";

export default async function DashboardPage() {
  const { isAdmin, clientId, clientName } = await getClientScope();

  // Scoped counts
  const [clientCount] = isAdmin
    ? await db.select({ value: count() }).from(clients)
    : [{ value: 1 }];

  const [locationCount] = clientId
    ? await db.select({ value: count() }).from(locations).where(eq(locations.clientId, clientId))
    : await db.select({ value: count() }).from(locations);

  const screenQuery = clientId
    ? sql`SELECT COUNT(*) as total, SUM(CASE WHEN s.is_online = 1 THEN 1 ELSE 0 END) as online FROM screens s JOIN locations l ON s.location_id = l.id WHERE l.client_id = ${clientId}`
    : sql`SELECT COUNT(*) as total, SUM(CASE WHEN is_online = 1 THEN 1 ELSE 0 END) as online FROM screens`;

  const screenResult = await db.execute(screenQuery);
  const screenTotal = Number(screenResult[0]?.total || 0);
  const screenOnline = Number(screenResult[0]?.online || 0);

  const [pendingRequests] = clientId
    ? await db.select({ value: count() }).from(changeRequests).where(and(eq(changeRequests.clientId, clientId), eq(changeRequests.status, "pending")))
    : await db.select({ value: count() }).from(changeRequests).where(eq(changeRequests.status, "pending"));

  const onlinePct = screenTotal > 0 ? Math.round((screenOnline / screenTotal) * 100) : 0;

  const recentClients = isAdmin
    ? await db.select({ id: clients.id, name: clients.name, createdAt: clients.createdAt }).from(clients).orderBy(desc(clients.createdAt)).limit(5)
    : [];

  const stats = isAdmin
    ? [
        { title: "Clients", value: clientCount.value, icon: Users, sub: "Active restaurants", href: "/clients", accent: false },
        { title: "Locations", value: locationCount.value, icon: MapPin, sub: "Across all clients", href: "/locations", accent: false },
        { title: "Displays", value: screenTotal, icon: Monitor, sub: `${screenOnline} online`, badge: `${onlinePct}%`, href: "/displays", accent: true },
        { title: "Requests", value: pendingRequests.value, icon: FileText, sub: "Pending review", href: "/requests", accent: false },
      ]
    : [
        { title: "Locations", value: locationCount.value, icon: MapPin, sub: "Your restaurants", href: "/locations", accent: false },
        { title: "Displays", value: screenTotal, icon: Monitor, sub: `${screenOnline} online`, badge: `${onlinePct}%`, href: "/displays", accent: true },
        { title: "Requests", value: pendingRequests.value, icon: FileText, sub: "Pending", href: "/requests", accent: false },
      ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          {isAdmin ? "Overview" : `Welcome, ${clientName}`}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isAdmin ? "Your signage network at a glance" : "Your restaurant signage at a glance"}
        </p>
      </div>

      <div className={`grid gap-3 mb-8 ${isAdmin ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className={`card-hover cursor-pointer group ${stat.accent ? "border-copper/20 glow-copper" : ""}`}>
              <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted-foreground">{stat.title}</span>
                  <stat.icon className={`h-4 w-4 ${stat.accent ? "text-copper" : "text-muted-foreground/60"}`} />
                </div>
                <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-muted-foreground">{stat.sub}</span>
                  {stat.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-copper/10 text-copper border-copper/20">{stat.badge}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {isAdmin && (
          <Card>
            <CardContent className="pt-5 px-5 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Recent Clients</h3>
                <Link href="/clients" className="text-xs text-copper hover:text-copper/80 flex items-center gap-1">View all <ArrowUpRight className="h-3 w-3" /></Link>
              </div>
              {recentClients.length === 0 ? (
                <p className="text-sm text-muted-foreground/60 py-4">No clients yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentClients.map((c) => (
                    <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground">{c.createdAt.toLocaleDateString()}</span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50">
          <CardContent className="pt-5 px-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Network Health</h3>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${onlinePct >= 90 ? "bg-emerald-500 glow-online status-pulse" : onlinePct >= 50 ? "bg-amber-400" : "bg-red-500"}`} />
                <span className="text-xs text-muted-foreground">
                  {onlinePct >= 90 ? "Healthy" : onlinePct >= 50 ? "Degraded" : screenTotal === 0 ? "No displays" : "Critical"}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Display Uptime</span>
                  <span className="font-mono text-foreground">{onlinePct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500/80 transition-all duration-500" style={{ width: `${onlinePct}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <div className="text-lg font-semibold">{screenOnline}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Online</div>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <div className="text-lg font-semibold">{screenTotal - screenOnline}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Offline</div>
                </div>
                <div className="text-center p-2 rounded-md bg-muted/50">
                  <div className="text-lg font-semibold">{screenTotal}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
