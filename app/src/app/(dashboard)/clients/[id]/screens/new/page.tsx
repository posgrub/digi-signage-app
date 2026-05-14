import { notFound } from "next/navigation";
import { db } from "@/db";
import { clients, locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createScreen } from "@/lib/actions/clients";

export default async function NewScreenPage({
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

  if (clientLocations.length === 0) notFound();

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-2">Add Screen</h2>
      <p className="text-muted-foreground mb-6">For {client.name}</p>

      <Card>
        <CardHeader>
          <CardTitle>Screen Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createScreen} className="space-y-4">
            <input type="hidden" name="clientId" value={clientId} />

            <div>
              <Label htmlFor="locationId">Location *</Label>
              <select
                id="locationId"
                name="locationId"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {clientLocations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder={`${client.name} - Location - Food Menu`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hostname">Hostname</Label>
                <Input
                  id="hostname"
                  name="hostname"
                  placeholder="vida-katy-food-menu"
                />
              </div>
              <div>
                <Label htmlFor="displayType">Screen Type</Label>
                <Input
                  id="displayType"
                  name="displayType"
                  placeholder="Food Menu, Bar Menu, Specials"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orientation">Orientation</Label>
                <select
                  id="orientation"
                  name="orientation"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="landscape">Landscape</option>
                  <option value="portrait">Portrait</option>
                </select>
              </div>
              <div>
                <Label htmlFor="tvModel">TV Model</Label>
                <Input
                  id="tvModel"
                  name="tvModel"
                  placeholder="Samsung 43&quot; etc."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rustdeskId">RustDesk ID</Label>
              <Input
                id="rustdeskId"
                name="rustdeskId"
                placeholder="123 456 789"
              />
            </div>

            <Button type="submit">Add Screen</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
