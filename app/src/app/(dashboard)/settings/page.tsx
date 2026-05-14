export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { clients, locations, screens, changeRequests } from "@/db/schema";
import { count } from "drizzle-orm";
import { Server, Database, Shield, Monitor } from "lucide-react";

export default async function SettingsPage() {
  const [clientCount] = await db.select({ value: count() }).from(clients);
  const [locationCount] = await db.select({ value: count() }).from(locations);
  const [screenCount] = await db.select({ value: count() }).from(screens);
  const [requestCount] = await db
    .select({ value: count() })
    .from(changeRequests);

  const xiboConfigured =
    process.env.XIBO_CLIENT_ID &&
    process.env.XIBO_CLIENT_ID !== "CHANGE_ME" &&
    process.env.XIBO_CLIENT_ID !== "PLACEHOLDER";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          System configuration and status
        </p>
      </div>

      <div className="grid gap-4 max-w-3xl">
        {/* Xibo CMS */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4 text-copper" />
              Xibo CMS
            </CardTitle>
            <Badge
              variant={xiboConfigured ? "default" : "outline"}
              className={`text-[10px] ${xiboConfigured ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : ""}`}
            >
              {xiboConfigured ? "Connected" : "Not configured"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">URL</span>
              <span className="font-mono text-xs">
                {process.env.XIBO_CMS_URL || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Client</span>
              <span className="font-mono text-xs">
                {xiboConfigured ? "Configured" : "Set XIBO_CLIENT_ID in Coolify"}
              </span>
            </div>
            {!xiboConfigured && (
              <p className="text-xs text-muted-foreground/60 pt-2 border-t border-border/50">
                To connect: Log into Xibo CMS → Admin → Applications → Add an
                application → Copy Client ID and Secret → Update env vars in
                Coolify.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-copper" />
              Database
            </CardTitle>
            <Badge
              variant="default"
              className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            >
              Connected
            </Badge>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="grid grid-cols-4 gap-3 pt-1">
              <div className="text-center p-2 rounded-md bg-muted/50">
                <div className="text-lg font-semibold">{clientCount.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Clients
                </div>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/50">
                <div className="text-lg font-semibold">
                  {locationCount.value}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Locations
                </div>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/50">
                <div className="text-lg font-semibold">{screenCount.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Screens
                </div>
              </div>
              <div className="text-center p-2 rounded-md bg-muted/50">
                <div className="text-lg font-semibold">
                  {requestCount.value}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Requests
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-copper" />
              Authentication
            </CardTitle>
            <Badge
              variant="default"
              className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            >
              Active
            </Badge>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider</span>
              <span>Clerk (Signage-App)</span>
            </div>
          </CardContent>
        </Card>

        {/* Display Sync */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Monitor className="h-4 w-4 text-copper" />
              Display Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Sync display status from Xibo CMS by calling:
            </p>
            <code className="block mt-2 p-2 bg-muted/50 rounded text-xs font-mono text-foreground">
              GET /api/sync-displays
            </code>
            <p className="mt-2 text-xs">
              {xiboConfigured
                ? "Xibo API is configured. You can trigger a sync manually or set up a cron job."
                : "Configure Xibo API credentials first to enable display sync."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
