export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Monitor, MapPin, FileText } from "lucide-react";
import { db } from "@/db";
import { clients, locations, screens, changeRequests } from "@/db/schema";
import { count, eq } from "drizzle-orm";

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

  const stats = [
    {
      title: "Clients",
      value: clientCount.value,
      icon: Users,
      description: "Active restaurant clients",
    },
    {
      title: "Locations",
      value: locationCount.value,
      icon: MapPin,
      description: "Across all clients",
    },
    {
      title: "Screens",
      value: screenCount.value,
      icon: Monitor,
      description: `${onlineCount.value} online`,
      badge:
        screenCount.value > 0
          ? `${Math.round((onlineCount.value / screenCount.value) * 100)}%`
          : "0%",
    },
    {
      title: "Pending Requests",
      value: pendingRequests.value,
      icon: FileText,
      description: "Awaiting review",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
