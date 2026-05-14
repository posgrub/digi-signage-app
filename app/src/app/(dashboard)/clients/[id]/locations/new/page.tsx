import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLocation } from "@/lib/actions/clients";

export default async function NewLocationPage({
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

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">Add Location</h2>
      <p className="text-muted-foreground mb-6">For {client.name}</p>

      <Card>
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLocation} className="space-y-4">
            <input type="hidden" name="clientId" value={clientId} />

            <div>
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g., Katy, Downtown, Main"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, Houston, TX"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="networkType">Network Type</Label>
                <Input
                  id="networkType"
                  name="networkType"
                  placeholder="Ethernet / Wi-Fi"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">On-site Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactName">On-site Contact</Label>
              <Input
                id="contactName"
                name="contactName"
                placeholder="Manager name"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="provisionXibo"
                name="provisionXibo"
                defaultChecked
                className="rounded"
              />
              <Label htmlFor="provisionXibo" className="font-normal">
                Auto-create Xibo display group and folders
              </Label>
            </div>

            <Button type="submit">Create Location</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
