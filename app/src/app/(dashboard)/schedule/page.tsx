export const dynamic = "force-dynamic";

import { db } from "@/db";
import { promos, screens, locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Monitor, Sunrise, Sun, Sunset, Moon } from "lucide-react";
import { getActiveClientId } from "@/lib/scope";

const timeSlots = [
  { label: "Morning", icon: Sunrise, range: "6am – 11am" },
  { label: "Afternoon", icon: Sun, range: "11am – 5pm" },
  { label: "Evening", icon: Sunset, range: "5pm – 10pm" },
  { label: "Night", icon: Moon, range: "10pm – 6am" },
];

function getSlot(time: string | null) {
  if (!time) return null;
  const hour = parseInt(time.split(":")[0]);
  if (hour >= 6 && hour < 11) return "Morning";
  if (hour >= 11 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 22) return "Evening";
  return "Night";
}

export default async function SchedulePage() {
  const { clientId, clientName } = await getActiveClientId();

  const activePromos = clientId
    ? await db.select().from(promos).where(eq(promos.clientId, clientId)).orderBy(promos.startTime)
    : [];

  const clientScreens = clientId
    ? await db
        .select({ id: screens.id, name: screens.name, isOnline: screens.isOnline, displayType: screens.displayType, locationName: locations.name })
        .from(screens)
        .leftJoin(locations, eq(screens.locationId, locations.id))
        .where(eq(locations.clientId, clientId))
        .orderBy(locations.name, screens.name)
    : [];

  const scheduledPromos = activePromos.filter((p) => p.status === "active" || p.status === "scheduled");

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Content Schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {clientName ? `${clientName} — ` : ""}What&apos;s showing on your screens throughout the day
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {timeSlots.map((slot) => {
            const slotPromos = scheduledPromos.filter((p) => getSlot(p.startTime) === slot.label);
            return (
              <Card key={slot.label}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <slot.icon className="h-4 w-4 text-copper" />
                    <CardTitle className="text-sm">{slot.label}</CardTitle>
                    <span className="text-xs text-muted-foreground">{slot.range}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {slotPromos.length > 0 ? (
                    <div className="space-y-2">
                      {slotPromos.map((p) => (
                        <div key={p.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-muted/30">
                          <div>
                            <span className="text-sm font-medium">{p.title}</span>
                            {p.daysOfWeek && <span className="text-[10px] text-muted-foreground ml-2 font-mono">{p.daysOfWeek}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">{p.startTime}–{p.endTime}</span>
                            <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[9px]">{p.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground/40 py-2">Default menu layout</p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {scheduledPromos.filter((p) => !p.startTime).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-copper" />
                  <CardTitle className="text-sm">All Day</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {scheduledPromos.filter((p) => !p.startTime).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-muted/30">
                      <span className="text-sm font-medium">{p.title}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {p.startDate && <span>{p.startDate}</span>}
                        {p.endDate && <span>→ {p.endDate}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Monitor className="h-4 w-4 text-copper" />My Screens
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientScreens.length === 0 ? (
                <p className="text-xs text-muted-foreground/60">No screens registered.</p>
              ) : (
                <div className="space-y-2">
                  {clientScreens.map((screen) => (
                    <div key={screen.id} className="flex items-center justify-between py-1.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{screen.name}</p>
                        <p className="text-[10px] text-muted-foreground">{screen.locationName} · {screen.displayType || "Menu"}</p>
                      </div>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${screen.isOnline ? "bg-emerald-500 glow-online" : "bg-red-500/60"}`} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
