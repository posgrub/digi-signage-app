export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/db";
import { changeRequests, clients, locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateRequestStatus } from "@/lib/actions/requests";
import { redirect } from "next/navigation";

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

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requestId = parseInt(id);

  const [request] = await db
    .select({
      id: changeRequests.id,
      description: changeRequests.description,
      status: changeRequests.status,
      requestedBy: changeRequests.requestedBy,
      attachments: changeRequests.attachments,
      adminNotes: changeRequests.adminNotes,
      createdAt: changeRequests.createdAt,
      resolvedAt: changeRequests.resolvedAt,
      clientName: clients.name,
      locationName: locations.name,
    })
    .from(changeRequests)
    .leftJoin(clients, eq(changeRequests.clientId, clients.id))
    .leftJoin(locations, eq(changeRequests.locationId, locations.id))
    .where(eq(changeRequests.id, requestId));

  if (!request) notFound();

  async function handleStatusUpdate(formData: FormData) {
    "use server";
    const status = formData.get("status") as
      | "pending"
      | "in_progress"
      | "completed"
      | "rejected";
    const notes = formData.get("adminNotes") as string;
    await updateRequestStatus(requestId, status, notes);
    redirect(`/requests/${requestId}`);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Request #{request.id}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {request.clientName}
            {request.locationName && ` · ${request.locationName}`}
          </p>
        </div>
        <Badge variant={statusColors[request.status]} className="text-xs">
          {statusLabels[request.status]}
        </Badge>
      </div>

      <div className="grid gap-4">
        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Requested By
              </span>
              <p className="text-sm mt-0.5">{request.requestedBy}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Description
              </span>
              <p className="text-sm mt-0.5 whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
            {request.attachments && (
              <div>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Attachments
                </span>
                <p className="text-sm mt-0.5 text-copper break-all">
                  {request.attachments}
                </p>
              </div>
            )}
            <div className="flex gap-6 pt-2 text-xs text-muted-foreground">
              <span>
                Submitted: {request.createdAt.toLocaleDateString()}{" "}
                {request.createdAt.toLocaleTimeString()}
              </span>
              {request.resolvedAt && (
                <span>
                  Resolved: {request.resolvedAt.toLocaleDateString()}{" "}
                  {request.resolvedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        {request.status !== "completed" && request.status !== "rejected" && (
          <Card className="border-copper/20">
            <CardHeader>
              <CardTitle className="text-sm text-copper">
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleStatusUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={request.status}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    name="adminNotes"
                    rows={3}
                    defaultValue={request.adminNotes || ""}
                    placeholder="Notes about the change (what was done, why rejected, etc.)"
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-copper text-copper-foreground hover:bg-copper/90"
                >
                  Update Request
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Show admin notes if resolved */}
        {request.adminNotes &&
          (request.status === "completed" ||
            request.status === "rejected") && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {request.adminNotes}
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
