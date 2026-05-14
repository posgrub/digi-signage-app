export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { clients, locations, screens } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MapPin, Monitor, ArrowRight } from "lucide-react";

export default async function ClientsPage() {
  const allClients = await db
    .select({
      id: clients.id,
      name: clients.name,
      contactName: clients.contactName,
      contactEmail: clients.contactEmail,
      createdAt: clients.createdAt,
      xiboFolderId: clients.xiboFolderId,
    })
    .from(clients)
    .orderBy(clients.name);

  // Get location and screen counts per client
  const clientStats = await Promise.all(
    allClients.map(async (client) => {
      const [locCount] = await db
        .select({ value: count() })
        .from(locations)
        .where(eq(locations.clientId, client.id));
      const [scrCount] = await db
        .select({ value: count() })
        .from(screens)
        .innerJoin(locations, eq(screens.locationId, locations.id))
        .where(eq(locations.clientId, client.id));
      const [onlineCount] = await db
        .select({ value: count() })
        .from(screens)
        .innerJoin(locations, eq(screens.locationId, locations.id))
        .where(
          sql`${locations.clientId} = ${client.id} AND ${screens.isOnline} = 1`
        );
      return {
        ...client,
        locationCount: locCount.value,
        screenCount: scrCount.value,
        onlineCount: onlineCount.value,
      };
    })
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Clients</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {allClients.length} restaurant
            {allClients.length !== 1 ? "s" : ""} under management
          </p>
        </div>
        <Link href="/clients/new">
          <Button className="bg-copper text-copper-foreground hover:bg-copper/90">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Client
          </Button>
        </Link>
      </div>

      {clientStats.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No clients yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Add your first restaurant client to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {clientStats.map((client) => (
            <Link key={client.id} href={`/clients/${client.id}`}>
              <Card className="card-hover cursor-pointer group">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Client avatar */}
                      <div className="h-10 w-10 rounded-md bg-copper/10 border border-copper/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-copper">
                          {client.name.charAt(0)}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-sm">
                            {client.name}
                          </h3>
                          {client.xiboFolderId && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1.5 py-0 h-4 bg-copper/5 text-copper/70 border border-copper/10"
                            >
                              XIBO
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          {client.contactName && (
                            <span>{client.contactName}</span>
                          )}
                          {client.contactEmail && (
                            <span>{client.contactEmail}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{client.locationCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          <span>
                            {client.onlineCount}/{client.screenCount}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-copper transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
