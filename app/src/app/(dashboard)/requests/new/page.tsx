export const dynamic = "force-dynamic";

import { db } from "@/db";
import { clients, locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createChangeRequest } from "@/lib/actions/requests";

export default async function NewRequestPage() {
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .orderBy(clients.name);

  const allLocations = await db
    .select({
      id: locations.id,
      name: locations.name,
      clientId: locations.clientId,
    })
    .from(locations)
    .orderBy(locations.name);

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight mb-2">
        New Change Request
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Submit a menu update or content change
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createChangeRequest} className="space-y-4">
            <div>
              <Label htmlFor="clientId">Client *</Label>
              <select
                id="clientId"
                name="clientId"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">Select client...</option>
                {allClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="locationId">Location (optional)</Label>
              <select
                id="locationId"
                name="locationId"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">All locations</option>
                {allLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Input
                id="requestedBy"
                name="requestedBy"
                required
                placeholder="Name of person requesting the change"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Describe the change: new menu prices, updated items, seasonal promotion, etc."
              />
            </div>

            <div>
              <Label htmlFor="attachments">Attachments (URLs)</Label>
              <Input
                id="attachments"
                name="attachments"
                placeholder="Links to images, PDFs, or Google Drive files"
              />
            </div>

            <Button
              type="submit"
              className="bg-copper text-copper-foreground hover:bg-copper/90"
            >
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
