export const dynamic = "force-dynamic";

import { db } from "@/db";
import { menuItems, menuCategories, clients } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toggleItemVisibility } from "@/lib/actions/menu";
import { Ban, CheckCircle } from "lucide-react";

export default async function EightySixPage() {
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .limit(1);

  if (allClients.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">86 Board</h2>
        <p className="text-muted-foreground">No clients configured.</p>
      </div>
    );
  }

  const clientId = allClients[0].id;

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.clientId, clientId))
    .orderBy(asc(menuCategories.sortOrder));

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.clientId, clientId))
    .orderBy(asc(menuItems.sortOrder));

  const itemsByCategory = new Map<number, typeof items>();
  for (const item of items) {
    const existing = itemsByCategory.get(item.categoryId) || [];
    existing.push(item);
    itemsByCategory.set(item.categoryId, existing);
  }

  const unavailableCount = items.filter((i) => !i.isVisible).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">86 Board</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Tap to mark items sold out or available. Changes update screens
            instantly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unavailableCount > 0 && (
            <Badge
              variant="destructive"
              className="text-xs"
            >
              {unavailableCount} item{unavailableCount !== 1 ? "s" : ""} 86&apos;d
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const catItems = itemsByCategory.get(category.id) || [];
          if (catItems.length === 0) return null;

          return (
            <div key={category.id}>
              <h3 className="text-xs uppercase tracking-[0.1em] font-medium text-muted-foreground mb-2 px-1">
                {category.name}
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {catItems.map((item) => {
                  const toggleAction = toggleItemVisibility.bind(
                    null,
                    item.id,
                    !item.isVisible
                  );

                  return (
                    <form key={item.id} action={toggleAction}>
                      <button
                        type="submit"
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
                          item.isVisible
                            ? "bg-card border-border/50 hover:border-destructive/50 hover:bg-destructive/5"
                            : "bg-destructive/10 border-destructive/30 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {item.isVisible ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                            ) : (
                              <Ban className="h-4 w-4 text-destructive shrink-0" />
                            )}
                            <span
                              className={`text-sm font-medium truncate ${
                                !item.isVisible
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground ml-2 shrink-0">
                            ${item.price}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 ml-6">
                          {item.isVisible
                            ? "Tap to 86"
                            : "Tap to mark available"}
                        </p>
                      </button>
                    </form>
                  );
                })}
              </div>
            </div>
          );
        })}

        {categories.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-sm">
                No menu items yet. Add categories and items in the Menu Editor
                first.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
