export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { clients, locations, screens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, MapPin, Monitor } from "lucide-react";
import { deleteClient } from "@/lib/actions/clients";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clientId = parseInt(id);

  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId));

  if (!client) notFound();

  const clientLocations = await db
    .select()
    .from(locations)
    .where(eq(locations.clientId, clientId))
    .orderBy(locations.name);

  const locationIds = clientLocations.map((l) => l.id);
  const clientScreens =
    locationIds.length > 0
      ? await db
          .select({
            id: screens.id,
            name: screens.name,
            hostname: screens.hostname,
            displayType: screens.displayType,
            orientation: screens.orientation,
            isOnline: screens.isOnline,
            lastCheckIn: screens.lastCheckIn,
            rustdeskId: screens.rustdeskId,
            locationId: screens.locationId,
            locationName: locations.name,
          })
          .from(screens)
          .leftJoin(locations, eq(screens.locationId, locations.id))
          .where(eq(locations.clientId, clientId))
          .orderBy(locations.name, screens.name)
      : [];

  const deleteWithId = deleteClient.bind(null, clientId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <p className="text-muted-foreground">
            {client.contactName && `${client.contactName} · `}
            {client.contactEmail || "No email"}
            {client.contactPhone && ` · ${client.contactPhone}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${clientId}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <form action={deleteWithId}>
            <Button variant="destructive" type="submit">
              Delete
            </Button>
          </form>
        </div>
      </div>

      {/* Xibo Status */}
      {(client.xiboFolderId || client.xiboUserGroupId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Xibo CMS Integration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {client.xiboFolderId && (
              <p>Folder ID: {client.xiboFolderId}</p>
            )}
            {client.xiboUserGroupId && (
              <p>User Group ID: {client.xiboUserGroupId}</p>
            )}
          </CardContent>
        </Card>
      )}

      {client.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{client.notes}</CardContent>
        </Card>
      )}

      {/* Locations */}
      <div className="flex items-center justify-between mb-4 mt-8">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Locations ({clientLocations.length})
        </h3>
        <Link href={`/clients/${clientId}/locations/new`}>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Location
          </Button>
        </Link>
      </div>

      {clientLocations.length === 0 ? (
        <p className="text-muted-foreground text-sm mb-8">
          No locations yet. Add one to start deploying screens.
        </p>
      ) : (
        <Table className="mb-8">
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Xibo Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientLocations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-medium">{loc.name}</TableCell>
                <TableCell>{loc.address || "—"}</TableCell>
                <TableCell>{loc.networkType || "—"}</TableCell>
                <TableCell>{loc.contactName || "—"}</TableCell>
                <TableCell>
                  {loc.xiboDisplayGroupId ? (
                    <Badge variant="secondary">
                      ID: {loc.xiboDisplayGroupId}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Screens */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          Screens ({clientScreens.length})
        </h3>
        {clientLocations.length > 0 && (
          <Link href={`/clients/${clientId}/screens/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Screen
            </Button>
          </Link>
        )}
      </div>

      {clientScreens.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No screens yet.
          {clientLocations.length === 0 && " Add a location first."}
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Screen Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>RustDesk</TableHead>
              <TableHead>Last Check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientScreens.map((screen) => (
              <TableRow key={screen.id}>
                <TableCell>
                  <Badge
                    variant={screen.isOnline ? "default" : "destructive"}
                  >
                    {screen.isOnline ? "Online" : "Offline"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{screen.name}</TableCell>
                <TableCell>{screen.locationName || "—"}</TableCell>
                <TableCell>{screen.displayType || "—"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {screen.hostname || "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {screen.rustdeskId || "—"}
                </TableCell>
                <TableCell>
                  {screen.lastCheckIn
                    ? screen.lastCheckIn.toLocaleString()
                    : "Never"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
