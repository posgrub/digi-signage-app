export const dynamic = "force-dynamic";

import { db } from "@/db";
import { screens, locations, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      locationName: locations.name,
      clientName: clients.name,
    })
    .from(screens)
    .leftJoin(locations, eq(screens.locationId, locations.id))
    .leftJoin(clients, eq(locations.clientId, clients.id))
    .orderBy(clients.name, locations.name, screens.name);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Displays</h2>

      {allScreens.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No displays registered yet.</p>
          <p className="text-sm mt-1">
            Add a client and location first, then register screens.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Check-in</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allScreens.map((screen) => (
              <TableRow key={screen.id}>
                <TableCell>
                  <Badge
                    variant={screen.isOnline ? "default" : "destructive"}
                  >
                    {screen.isOnline ? "Online" : "Offline"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{screen.name}</TableCell>
                <TableCell>{screen.clientName || "—"}</TableCell>
                <TableCell>{screen.locationName || "—"}</TableCell>
                <TableCell>{screen.displayType || "—"}</TableCell>
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
