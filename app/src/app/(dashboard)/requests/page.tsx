export const dynamic = "force-dynamic";

import { db } from "@/db";
import { changeRequests, clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
  rejected: "destructive",
};

export default async function RequestsPage() {
  const allRequests = await db
    .select({
      id: changeRequests.id,
      description: changeRequests.description,
      status: changeRequests.status,
      requestedBy: changeRequests.requestedBy,
      createdAt: changeRequests.createdAt,
      clientName: clients.name,
    })
    .from(changeRequests)
    .leftJoin(clients, eq(changeRequests.clientId, clients.id))
    .orderBy(desc(changeRequests.createdAt));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Change Requests</h2>

      {allRequests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No change requests yet.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <Badge variant={statusColors[req.status]}>
                    {req.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{req.clientName || "—"}</TableCell>
                <TableCell className="max-w-md truncate">
                  {req.description}
                </TableCell>
                <TableCell>{req.requestedBy}</TableCell>
                <TableCell>
                  {req.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
