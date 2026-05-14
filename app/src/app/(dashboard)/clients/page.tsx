export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default async function ClientsPage() {
  const allClients = await db.select().from(clients).orderBy(clients.name);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Link href="/clients/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      {allClients.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No clients yet.</p>
          <p className="text-sm mt-1">
            Add your first restaurant client to get started.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium hover:underline"
                  >
                    {client.name}
                  </Link>
                </TableCell>
                <TableCell>{client.contactName || "—"}</TableCell>
                <TableCell>{client.contactEmail || "—"}</TableCell>
                <TableCell>{client.contactPhone || "—"}</TableCell>
                <TableCell>
                  {client.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
