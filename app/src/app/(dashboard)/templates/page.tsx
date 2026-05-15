export const dynamic = "force-dynamic";

import { db } from "@/db";
import { menuTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye, ExternalLink } from "lucide-react";
import { getActiveClientId } from "@/lib/scope";
import { saveTemplate } from "@/lib/actions/templates";
import Link from "next/link";

const presets = [
  { name: "Classic Red", style: "classic", primary: "#dc2626", secondary: "#1a1a1a", accent: "#fbbf24", text: "#ffffff", font: "Inter" },
  { name: "Dark Elegant", style: "elegant", primary: "#1e293b", secondary: "#0f172a", accent: "#f59e0b", text: "#f1f5f9", font: "Poppins" },
  { name: "Bold Orange", style: "bold", primary: "#ea580c", secondary: "#18181b", accent: "#ffffff", text: "#ffffff", font: "Oswald" },
  { name: "Forest Green", style: "nature", primary: "#166534", secondary: "#14532d", accent: "#fde047", text: "#ffffff", font: "Poppins" },
  { name: "Midnight Blue", style: "midnight", primary: "#1e3a5f", secondary: "#0c1929", accent: "#38bdf8", text: "#e2e8f0", font: "Inter" },
  { name: "Warm Copper", style: "copper", primary: "#92400e", secondary: "#1c1917", accent: "#fbbf24", text: "#fef3c7", font: "Oswald" },
];

export default async function TemplatesPage() {
  const { clientId, clientName, isAdmin } = await getActiveClientId();

  if (!clientId) {
    return (
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Menu Board Design</h2>
        <p className="text-muted-foreground mt-2">Add a client first.</p>
      </div>
    );
  }

  const [template] = await db
    .select()
    .from(menuTemplates)
    .where(eq(menuTemplates.clientId, clientId));

  const current = template || {
    templateStyle: "classic",
    primaryColor: "#dc2626",
    secondaryColor: "#1a1a1a",
    accentColor: "#fbbf24",
    textColor: "#ffffff",
    fontFamily: "Inter",
    logoUrl: "",
    columns: 2,
    showPrices: true,
    showDescriptions: true,
  };

  const renderUrl = `/render/${clientId}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Menu Board Design
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {clientName} — customize how your menu looks on screen
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={renderUrl} target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Live Preview
            </Button>
          </Link>
          <Link
            href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://signage.poseztech.com"}${renderUrl}`}
            target="_blank"
          >
            <Button variant="outline" size="sm" className="text-xs text-copper border-copper/30">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Screen URL
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Presets */}
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Quick Presets
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {presets.map((preset) => (
                <form key={preset.name} action={saveTemplate}>
                  <input type="hidden" name="clientId" value={clientId} />
                  <input type="hidden" name="templateStyle" value={preset.style} />
                  <input type="hidden" name="primaryColor" value={preset.primary} />
                  <input type="hidden" name="secondaryColor" value={preset.secondary} />
                  <input type="hidden" name="accentColor" value={preset.accent} />
                  <input type="hidden" name="textColor" value={preset.text} />
                  <input type="hidden" name="fontFamily" value={preset.font} />
                  <input type="hidden" name="logoUrl" value={current.logoUrl || ""} />
                  <input type="hidden" name="columns" value={current.columns} />
                  <input type="hidden" name="showPrices" value="true" />
                  <input type="hidden" name="showDescriptions" value="true" />
                  <button
                    type="submit"
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02] ${
                      current.templateStyle === preset.style
                        ? "border-copper ring-1 ring-copper/30"
                        : "border-border/50 hover:border-copper/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="h-6 w-6 rounded"
                        style={{ background: preset.primary }}
                      />
                      <div
                        className="h-6 w-6 rounded"
                        style={{ background: preset.secondary }}
                      />
                      <div
                        className="h-6 w-6 rounded border border-border/30"
                        style={{ background: preset.accent }}
                      />
                    </div>
                    <p className="text-sm font-medium">{preset.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {preset.font}
                    </p>
                    {current.templateStyle === preset.style && (
                      <Badge className="mt-1 text-[9px] bg-copper/10 text-copper border-copper/20">
                        Active
                      </Badge>
                    )}
                  </button>
                </form>
              ))}
            </div>
          </div>

          {/* Preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-copper" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden border border-border/50">
                <iframe
                  src={renderUrl}
                  className="w-full h-full"
                  style={{ transform: "scale(1)", transformOrigin: "top left" }}
                  title="Menu Board Preview"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                This is exactly what your TV screen will display. Changes update in real-time.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Custom Settings */}
        <div>
          <Card className="sticky top-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-copper" />
                Customize
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={saveTemplate} className="space-y-4">
                <input type="hidden" name="clientId" value={clientId} />
                <input
                  type="hidden"
                  name="templateStyle"
                  value={current.templateStyle}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Header Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        name="primaryColor"
                        defaultValue={current.primaryColor}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        defaultValue={current.primaryColor}
                        className="h-8 text-xs font-mono"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Background</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        name="secondaryColor"
                        defaultValue={current.secondaryColor}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        defaultValue={current.secondaryColor}
                        className="h-8 text-xs font-mono"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Accent / Prices</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        name="accentColor"
                        defaultValue={current.accentColor}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        defaultValue={current.accentColor}
                        className="h-8 text-xs font-mono"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Text Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        name="textColor"
                        defaultValue={current.textColor}
                        className="h-8 w-8 rounded cursor-pointer border-0"
                      />
                      <Input
                        defaultValue={current.textColor}
                        className="h-8 text-xs font-mono"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Font</Label>
                  <select
                    name="fontFamily"
                    defaultValue={current.fontFamily}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm mt-1"
                  >
                    <option value="Inter">Inter (Clean)</option>
                    <option value="Poppins">Poppins (Modern)</option>
                    <option value="Oswald">Oswald (Bold)</option>
                    <option value="Bebas Neue">Bebas Neue (Impact)</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Columns</Label>
                  <select
                    name="columns"
                    defaultValue={current.columns}
                    className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm mt-1"
                  >
                    <option value="1">1 Column</option>
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Logo URL</Label>
                  <Input
                    name="logoUrl"
                    defaultValue={current.logoUrl || ""}
                    placeholder="https://..."
                    className="h-8 text-xs mt-1"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      name="showPrices"
                      value="true"
                      defaultChecked={current.showPrices}
                      className="rounded h-3 w-3"
                    />
                    Show prices
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      name="showDescriptions"
                      value="true"
                      defaultChecked={current.showDescriptions}
                      className="rounded h-3 w-3"
                    />
                    Show descriptions
                  </label>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-copper text-copper-foreground hover:bg-copper/90"
                >
                  Save Design
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
