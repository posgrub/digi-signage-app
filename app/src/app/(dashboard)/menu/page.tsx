export const dynamic = "force-dynamic";

import { db } from "@/db";
import { menuCategories, menuItems, clients } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import {
  createCategory,
  createMenuItem,
  toggleCategoryVisibility,
  toggleItemVisibility,
  deleteCategory,
  deleteMenuItem,
} from "@/lib/actions/menu";
import Link from "next/link";

export default async function MenuPage() {
  // For now, get the first client (will be scoped by Clerk org later)
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .limit(1);

  if (allClients.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Menu Editor</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your digital menu board content
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No clients yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              <Link href="/clients/new" className="text-copper hover:text-copper/80">
                Add a client
              </Link>{" "}
              first to start managing menus.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientId = allClients[0].id;
  const clientName = allClients[0].name;

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

  // Group items by category
  const itemsByCategory = new Map<number, typeof items>();
  for (const item of items) {
    const existing = itemsByCategory.get(item.categoryId) || [];
    existing.push(item);
    itemsByCategory.set(item.categoryId, existing);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Menu Editor</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {clientName} — manage categories and items
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Menu Content */}
        <div className="space-y-4">
          {categories.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <UtensilsCrossed className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No menu categories yet. Add one to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => {
              const catItems = itemsByCategory.get(category.id) || [];
              const toggleVis = toggleCategoryVisibility.bind(
                null,
                category.id,
                !category.isVisible
              );
              const deleteCat = deleteCategory.bind(null, category.id);

              return (
                <Card
                  key={category.id}
                  className={!category.isVisible ? "opacity-50" : ""}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {category.name}
                        </CardTitle>
                        {!category.isVisible && (
                          <Badge variant="outline" className="text-[9px]">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <form action={toggleVis}>
                          <button
                            type="submit"
                            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                            title={
                              category.isVisible ? "Hide category" : "Show category"
                            }
                          >
                            {category.isVisible ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </form>
                        <form action={deleteCat}>
                          <button
                            type="submit"
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-xs text-muted-foreground">
                        {category.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {catItems.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60 py-2">
                        No items in this category.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {catItems.map((item) => {
                          const toggleItem = toggleItemVisibility.bind(
                            null,
                            item.id,
                            !item.isVisible
                          );
                          const deleteItem = deleteMenuItem.bind(null, item.id);

                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 ${
                                !item.isVisible ? "opacity-50" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">
                                      {item.name}
                                    </span>
                                    {item.isNew && (
                                      <Sparkles className="h-3 w-3 text-copper shrink-0" />
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-[11px] text-muted-foreground truncate">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 ml-3">
                                <span className="text-sm font-mono font-medium text-copper">
                                  ${item.price}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <form action={toggleItem}>
                                    <button
                                      type="submit"
                                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      {item.isVisible ? (
                                        <Eye className="h-3 w-3" />
                                      ) : (
                                        <EyeOff className="h-3 w-3" />
                                      )}
                                    </button>
                                  </form>
                                  <form action={deleteItem}>
                                    <button
                                      type="submit"
                                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </form>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Item Form (inline) */}
                    <details className="mt-3">
                      <summary className="text-xs text-copper cursor-pointer hover:text-copper/80 flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Add item
                      </summary>
                      <form action={createMenuItem} className="mt-3 space-y-2">
                        <input type="hidden" name="clientId" value={clientId} />
                        <input
                          type="hidden"
                          name="categoryId"
                          value={category.id}
                        />
                        <div className="grid grid-cols-[1fr_80px] gap-2">
                          <Input
                            name="name"
                            required
                            placeholder="Item name"
                            className="h-8 text-sm"
                          />
                          <Input
                            name="price"
                            required
                            placeholder="12.99"
                            className="h-8 text-sm font-mono"
                          />
                        </div>
                        <Input
                          name="description"
                          placeholder="Description (optional)"
                          className="h-8 text-sm"
                        />
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              name="isNew"
                              className="rounded h-3 w-3"
                            />
                            Mark as new
                          </label>
                          <Button
                            type="submit"
                            size="sm"
                            className="h-7 text-xs bg-copper text-copper-foreground hover:bg-copper/90"
                          >
                            Add
                          </Button>
                        </div>
                        <input type="hidden" name="imageUrl" value="" />
                        <input type="hidden" name="allergens" value="" />
                      </form>
                    </details>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Add Category Sidebar */}
        <div>
          <Card className="sticky top-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plus className="h-4 w-4 text-copper" />
                Add Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createCategory} className="space-y-3">
                <input type="hidden" name="clientId" value={clientId} />
                <div>
                  <Label htmlFor="catName" className="text-xs">
                    Category Name
                  </Label>
                  <Input
                    id="catName"
                    name="name"
                    required
                    placeholder="e.g., Appetizers, Entrees, Drinks"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="catDesc" className="text-xs">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="catDesc"
                    name="description"
                    rows={2}
                    placeholder="Shown on the menu board"
                    className="text-sm"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-copper text-copper-foreground hover:bg-copper/90"
                >
                  Create Category
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
