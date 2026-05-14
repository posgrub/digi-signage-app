export const dynamic = "force-dynamic";

import { db } from "@/db";
import { locations, clients, screens } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Monitor } from "lucide-react";
import Link from "next/link";

export default async function LocationsPage() {
  const allLocations = await db
    .select({
      id: locations.id,
      name: locations.name,
      address: locations.address,
      networkType: locations.networkType,
      contactName: locations.contactName,
      clientId: locations.clientId,
      clientName: clients.name,
      xiboDisplayGroupId: locations.xiboDisplayGroupId,
    })
    .from(locations)
    .leftJoin(clients, eq(locations.clientId, clients.id))
    .orderBy(clients.name, locations.name);

  // Get screen counts per location
  const locationStats = await Promise.all(
    allLocations.map(async (loc) => {
      const [scrCount] = await db
        .select({ value: count() })
        .from(screens)
        .where(eq(screens.locationId, loc.id));
      const [onlineCount] = await db
        .select({ value: count() })
        .from(screens)
        .where(
          sql`${screens.locationId} = ${loc.id} AND ${screens.isOnline} = 1`
        );
      return {
        ...loc,
        screenCount: scrCount.value,
        onlineCount: onlineCount.value,
      };
    })
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Locations</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {allLocations.length} location
          {allLocations.length !== 1 ? "s" : ""} across all clients
        </p>
      </div>

      {locationStats.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No locations yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add a client first, then add their locations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Location
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Client
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Address
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Network
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Screens
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Xibo
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationStats.map((loc) => (
                <TableRow
                  key={loc.id}
                  className="border-border/30 hover:bg-accent/50"
                >
                  <TableCell className="font-medium text-sm">
                    {loc.name}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/clients/${loc.clientId}`}
                      className="text-sm text-copper hover:text-copper/80"
                    >
                      {loc.clientName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {loc.address || "—"}
                  </TableCell>
                  <TableCell>
                    {loc.networkType ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-normal bg-muted/80"
                      >
                        {loc.networkType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Monitor className="h-3 w-3" />
                      <span>
                        {loc.onlineCount}/{loc.screenCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {loc.xiboDisplayGroupId ? (
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 h-4 bg-copper/5 text-copper/70 border border-copper/10"
                      >
                        Group {loc.xiboDisplayGroupId}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
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
