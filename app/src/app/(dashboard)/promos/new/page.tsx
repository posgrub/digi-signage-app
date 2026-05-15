export const dynamic = "force-dynamic";

import { db } from "@/db";
import { clients, locations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPromo } from "@/lib/actions/promos";

export default async function NewPromoPage() {
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .limit(1);

  const clientId = allClients.length > 0 ? allClients[0].id : null;

  const allLocations = clientId
    ? await db
        .select({ id: locations.id, name: locations.name })
        .from(locations)
        .where(eq(locations.clientId, clientId))
    : [];

  if (!clientId) {
    return (
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">New Promo</h2>
        <p className="text-muted-foreground mt-2">Add a client first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight mb-2">
        Create Promotion
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Specials, happy hours, events, and advertisements
      </p>

      <form action={createPromo} className="space-y-6">
        <input type="hidden" name="clientId" value={clientId} />

        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., Taco Tuesday, Summer Margarita Special"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Details shown on the screen"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="promoType">Type</Label>
                <select
                  id="promoType"
                  name="promoType"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="daily_special">Daily Special</option>
                  <option value="happy_hour">Happy Hour</option>
                  <option value="event">Event</option>
                  <option value="announcement">Announcement</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  placeholder="https://..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="time" />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="time" />
              </div>
            </div>
            <div>
              <Label htmlFor="daysOfWeek">Days (leave blank for every day)</Label>
              <Input
                id="daysOfWeek"
                name="daysOfWeek"
                placeholder="mon,tue,wed,thu,fri"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Comma-separated: mon, tue, wed, thu, fri, sat, sun
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Targeting */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Display Targeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="allLoc"
                name="allLocations"
                value="true"
                defaultChecked
              />
              <Label htmlFor="allLoc" className="font-normal">
                All locations
              </Label>
            </div>
            {allLocations.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="specificLoc"
                  name="allLocations"
                  value="false"
                />
                <Label htmlFor="specificLoc" className="font-normal">
                  Specific location:
                </Label>
                <select
                  name="locationId"
                  className="flex h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  {allLocations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="bg-copper text-copper-foreground hover:bg-copper/90"
        >
          Create Promo
        </Button>
      </form>
    </div>
  );
}
