export const dynamic = "force-dynamic";

import { db } from "@/db";
import { locations, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function LocationsPage() {
  const allLocations = await db
    .select({
      id: locations.id,
      name: locations.name,
      address: locations.address,
      networkType: locations.networkType,
      contactName: locations.contactName,
      clientName: clients.name,
    })
    .from(locations)
    .leftJoin(clients, eq(locations.clientId, clients.id))
    .orderBy(clients.name, locations.name);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Locations</h2>

      {allLocations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No locations yet.</p>
          <p className="text-sm mt-1">
            Add a client first, then add their locations.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allLocations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-medium">{loc.name}</TableCell>
                <TableCell>{loc.clientName || "—"}</TableCell>
                <TableCell>{loc.address || "—"}</TableCell>
                <TableCell>{loc.networkType || "—"}</TableCell>
                <TableCell>{loc.contactName || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
