export const dynamic = "force-dynamic";

import { db } from "@/db";
import { screens, locations, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Monitor, Wifi, WifiOff } from "lucide-react";

export default async function DisplaysPage() {
  const allScreens = await db
    .select({
      id: screens.id,
      name: screens.name,
      hostname: screens.hostname,
      displayType: screens.displayType,
      orientation: screens.orientation,
      isOnline: screens.isOnline,
      lastCheckIn: screens.lastCheckIn,
      rustdeskId: screens.rustdeskId,
      locationName: locations.name,
      clientName: clients.name,
    })
    .from(screens)
    .leftJoin(locations, eq(screens.locationId, locations.id))
    .leftJoin(clients, eq(locations.clientId, clients.id))
    .orderBy(clients.name, locations.name, screens.name);

  const online = allScreens.filter((s) => s.isOnline);
  const offline = allScreens.filter((s) => !s.isOnline);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Displays</h2>
          <p className="text-sm text-muted-foreground mt-1">
            All screens across your signage network
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 glow-online status-pulse" />
            <span className="text-muted-foreground">
              {online.length} online
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500/80" />
            <span className="text-muted-foreground">
              {offline.length} offline
            </span>
          </div>
        </div>
      </div>

      {allScreens.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Monitor className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No displays registered yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add a client and location first, then register screens.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Display
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Client
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Location
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Hostname
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground text-right">
                  Last Check-in
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allScreens.map((screen) => (
                <TableRow
                  key={screen.id}
                  className="border-border/30 hover:bg-accent/50"
                >
                  <TableCell>
                    {screen.isOnline ? (
                      <Wifi className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500/60" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium text-sm">{screen.name}</span>
                      {screen.rustdeskId && (
                        <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                          RD:{screen.rustdeskId}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{screen.clientName || "—"}</TableCell>
                  <TableCell className="text-sm">{screen.locationName || "—"}</TableCell>
                  <TableCell>
                    {screen.displayType ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-normal bg-muted/80"
                      >
                        {screen.displayType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {screen.hostname || "—"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {screen.lastCheckIn
                      ? screen.lastCheckIn.toLocaleString()
                      : "Never"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
