import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/actions/clients";
import { Mail, Monitor } from "lucide-react";

export default function NewClientPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight mb-6">
        Add New Client
      </h2>

      <form action={createClient} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="contactEmail">Email *</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                required
                placeholder="owner@restaurant.com"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                This email will be used for their login account
              </p>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Service plan, special requirements, etc."
              />
            </div>
          </CardContent>
        </Card>

        {/* Automation */}
        <Card className="border-copper/20">
          <CardHeader>
            <CardTitle className="text-sm text-copper">
              Automatic Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="sendInvite"
                name="sendInvite"
                defaultChecked
                className="rounded mt-0.5"
              />
              <div>
                <Label htmlFor="sendInvite" className="font-normal flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-copper" />
                  Send login invitation to client
                </Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Client receives an email to create their account. They&apos;ll
                  see only their restaurant&apos;s menu, screens, and promos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="provisionXibo"
                name="provisionXibo"
                defaultChecked
                className="rounded mt-0.5"
              />
              <div>
                <Label htmlFor="provisionXibo" className="font-normal flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 text-copper" />
                  Provision in Xibo CMS
                </Label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Creates display groups and folders in Xibo automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="bg-copper text-copper-foreground hover:bg-copper/90"
        >
          Create Client & Send Invitation
        </Button>
      </form>
    </div>
  );
}
