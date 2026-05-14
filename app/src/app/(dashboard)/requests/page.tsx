export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { changeRequests, clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText } from "lucide-react";

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
  rejected: "destructive",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Change Requests
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Menu updates and content changes
          </p>
        </div>
        <Link href="/requests/new">
          <Button className="bg-copper text-copper-foreground hover:bg-copper/90">
            <Plus className="h-4 w-4 mr-1.5" />
            New Request
          </Button>
        </Link>
      </div>

      {allRequests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No change requests yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Submit a request when a client needs a menu update.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground w-24">
                  Status
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Client
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Requested By
                </TableHead>
                <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground text-right">
                  Date
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRequests.map((req) => (
                <TableRow
                  key={req.id}
                  className="border-border/30 hover:bg-accent/50 cursor-pointer"
                >
                  <TableCell>
                    <Link href={`/requests/${req.id}`}>
                      <Badge variant={statusColors[req.status]} className="text-[10px]">
                        {statusLabels[req.status]}
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/requests/${req.id}`}
                      className="text-sm font-medium hover:text-copper"
                    >
                      {req.clientName || "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <Link
                      href={`/requests/${req.id}`}
                      className="text-sm text-muted-foreground truncate block"
                    >
                      {req.description}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {req.requestedBy}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {req.createdAt.toLocaleDateString()}
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
