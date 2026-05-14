import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="grid gap-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Xibo CMS Connection</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              CMS URL: {process.env.XIBO_CMS_URL || "Not configured"}
            </p>
            <p>
              API Status:{" "}
              {process.env.XIBO_CLIENT_ID ? "Configured" : "Not configured"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Status:{" "}
              {process.env.DATABASE_URL ? "Connected" : "Not configured"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
