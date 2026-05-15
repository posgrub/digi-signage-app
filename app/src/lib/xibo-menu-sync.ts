import { xibo } from "./xibo-client";
import { db } from "@/db";
import { clients, menuCategories, menuItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * Syncs local menu data to Xibo CMS Menu Board.
 *
 * Flow:
 * 1. Ensure client has a Xibo Menu Board (create if missing)
 * 2. Sync categories → Xibo Menu Board Categories
 * 3. Sync items → Xibo Menu Board Products
 *
 * Xibo Menu Board structure:
 *   Menu Board → Categories → Products
 *   Layout Widget pulls from Menu Board → screens auto-update
 */

export async function syncClientMenuToXibo(clientId: number) {
  const [client] = await db
    .select()
    .from(clients)
    .where(eq(clients.id, clientId));

  if (!client) throw new Error(`Client ${clientId} not found`);

  // Step 1: Ensure Menu Board exists
  let menuBoardId = client.xiboMenuBoardId;

  if (!menuBoardId) {
    // Create new Menu Board in Xibo
    const board = await xibo.createMenuBoard(client.name);
    menuBoardId = board.menuBoardId || board.id;

    // Save the ID back
    await db
      .update(clients)
      .set({ xiboMenuBoardId: menuBoardId, updatedAt: new Date() })
      .where(eq(clients.id, clientId));
  }

  // Step 2: Sync categories
  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.clientId, clientId))
    .orderBy(asc(menuCategories.sortOrder));

  for (const category of categories) {
    if (category.xiboMenuBoardCategoryId) {
      // Update existing
      await xibo.updateMenuBoardCategory(category.xiboMenuBoardCategoryId, {
        name: category.name,
        // Xibo doesn't have visibility per category — we skip hidden ones
      });
    } else {
      // Create new
      const xiboCategory = await xibo.createMenuBoardCategory(menuBoardId!, {
        name: category.name,
      });
      const xiboCatId =
        xiboCategory.menuBoardCategoryId || xiboCategory.id;

      // Save Xibo ID back
      await db
        .update(menuCategories)
        .set({ xiboMenuBoardCategoryId: xiboCatId, updatedAt: new Date() })
        .where(eq(menuCategories.id, category.id));

      category.xiboMenuBoardCategoryId = xiboCatId;
    }
  }

  // Step 3: Sync products (items)
  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.clientId, clientId))
    .orderBy(asc(menuItems.sortOrder));

  for (const item of items) {
    const category = categories.find((c) => c.id === item.categoryId);
    if (!category?.xiboMenuBoardCategoryId) continue;

    const productData = {
      name: item.name,
      description: item.description || "",
      price: item.price,
      allergyInfo: item.allergens || "",
      availability: item.isVisible ? 1 : 0,
    };

    if (item.xiboMenuBoardProductId) {
      // Update existing
      await xibo.updateMenuBoardProduct(
        item.xiboMenuBoardProductId,
        productData
      );
    } else {
      // Create new
      const xiboProduct = await xibo.createMenuBoardProduct(
        category.xiboMenuBoardCategoryId,
        productData
      );
      const xiboProdId =
        xiboProduct.menuBoardProductId || xiboProduct.id;

      // Save Xibo ID back
      await db
        .update(menuItems)
        .set({ xiboMenuBoardProductId: xiboProdId, updatedAt: new Date() })
        .where(eq(menuItems.id, item.id));
    }
  }

  return { menuBoardId, categoriesSynced: categories.length, itemsSynced: items.length };
}
