import { redirect } from "next/navigation";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function createClient(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const notes = formData.get("notes") as string;

  await db.insert(clients).values({
    name,
    contactName: contactName || null,
    contactEmail: contactEmail || null,
    contactPhone: contactPhone || null,
    notes: notes || null,
  });

  redirect("/clients");
}

export default function NewClientPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Add New Client</h2>

      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createClient} className="space-y-4">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g., Vida Mexican Kitchen"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  placeholder="Owner or manager"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="owner@restaurant.com"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Service plan, special requirements, etc."
              />
            </div>

            <Button type="submit">Create Client</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
