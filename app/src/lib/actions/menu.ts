"use server";

import { db } from "@/db";
import { menuCategories, menuItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { xibo } from "@/lib/xibo-client";

// Helper: sync a single item's visibility to Xibo immediately
async function syncItemToXibo(itemId: number) {
  try {
    const [item] = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.id, itemId));
    if (item?.xiboMenuBoardProductId) {
      await xibo.updateMenuBoardProduct(item.xiboMenuBoardProductId, {
        name: item.name,
        price: item.price,
        description: item.description || "",
        availability: item.isVisible ? 1 : 0,
      });
    }
  } catch (err) {
    console.error("Xibo item sync failed:", err);
  }
}

// Helper: sync a category to Xibo
async function syncCategoryToXibo(categoryId: number) {
  try {
    const [cat] = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.id, categoryId));
    if (cat?.xiboMenuBoardCategoryId) {
      await xibo.updateMenuBoardCategory(cat.xiboMenuBoardCategoryId, {
        name: cat.name,
      });
    }
  } catch (err) {
    console.error("Xibo category sync failed:", err);
  }
}

export async function createCategory(formData: FormData) {
  const clientId = parseInt(formData.get("clientId") as string);
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  const existing = await db
    .select({ sortOrder: menuCategories.sortOrder })
    .from(menuCategories)
    .where(eq(menuCategories.clientId, clientId))
    .orderBy(menuCategories.sortOrder);

  const nextOrder =
    existing.length > 0 ? existing[existing.length - 1].sortOrder + 1 : 0;

  await db.insert(menuCategories).values({
    clientId,
    name,
    description: description || null,
    sortOrder: nextOrder,
  });

  // Note: Xibo category created on next full sync (needs menuBoardId context)
  revalidatePath("/menu");
}

export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  await db
    .update(menuCategories)
    .set({ name, description: description || null, updatedAt: new Date() })
    .where(eq(menuCategories.id, id));

  await syncCategoryToXibo(id);
  revalidatePath("/menu");
}

export async function toggleCategoryVisibility(id: number, isVisible: boolean) {
  await db
    .update(menuCategories)
    .set({ isVisible, updatedAt: new Date() })
    .where(eq(menuCategories.id, id));

  // Toggle visibility on all items in this category too
  const items = await db
    .select({ id: menuItems.id, xiboMenuBoardProductId: menuItems.xiboMenuBoardProductId })
    .from(menuItems)
    .where(eq(menuItems.categoryId, id));

  for (const item of items) {
    if (item.xiboMenuBoardProductId) {
      try {
        await xibo.updateMenuBoardProduct(item.xiboMenuBoardProductId, {
          availability: isVisible ? 1 : 0,
        });
      } catch (err) {
        console.error("Xibo category visibility sync failed:", err);
      }
    }
  }

  revalidatePath("/menu");
}

export async function deleteCategory(id: number) {
  // Delete from Xibo first
  const [cat] = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.id, id));

  if (cat?.xiboMenuBoardCategoryId) {
    try {
      // Delete all products in this category from Xibo
      const items = await db
        .select({ xiboMenuBoardProductId: menuItems.xiboMenuBoardProductId })
        .from(menuItems)
        .where(eq(menuItems.categoryId, id));

      for (const item of items) {
        if (item.xiboMenuBoardProductId) {
          await xibo.deleteMenuBoardProduct(item.xiboMenuBoardProductId);
        }
      }

      // Delete the category itself from Xibo
      await xibo.deleteMenuBoardCategory(cat.xiboMenuBoardCategoryId);
    } catch (err) {
      console.error("Xibo category delete failed:", err);
    }
  }

  // DB cascade deletes items
  await db.delete(menuCategories).where(eq(menuCategories.id, id));
  revalidatePath("/menu");
}

export async function createMenuItem(formData: FormData) {
  const clientId = parseInt(formData.get("clientId") as string);
  const categoryId = parseInt(formData.get("categoryId") as string);
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const allergens = formData.get("allergens") as string;
  const isNew = formData.get("isNew") === "on";

  const existing = await db
    .select({ sortOrder: menuItems.sortOrder })
    .from(menuItems)
    .where(eq(menuItems.categoryId, categoryId))
    .orderBy(menuItems.sortOrder);

  const nextOrder =
    existing.length > 0 ? existing[existing.length - 1].sortOrder + 1 : 0;

  // Check if parent category has a Xibo ID — if so, create product in Xibo too
  const [category] = await db
    .select({ xiboMenuBoardCategoryId: menuCategories.xiboMenuBoardCategoryId })
    .from(menuCategories)
    .where(eq(menuCategories.id, categoryId));

  let xiboMenuBoardProductId: number | null = null;

  if (category?.xiboMenuBoardCategoryId) {
    try {
      const xiboProduct = await xibo.createMenuBoardProduct(
        category.xiboMenuBoardCategoryId,
        { name, description: description || "", price, allergyInfo: allergens || "", availability: 1 }
      );
      xiboMenuBoardProductId = xiboProduct.menuBoardProductId || xiboProduct.id || null;
    } catch (err) {
      console.error("Xibo product create failed:", err);
    }
  }

  await db.insert(menuItems).values({
    clientId,
    categoryId,
    name,
    description: description || null,
    price,
    imageUrl: imageUrl || null,
    allergens: allergens || null,
    isNew,
    sortOrder: nextOrder,
    xiboMenuBoardProductId,
  });

  revalidatePath("/menu");
}

export async function updateMenuItem(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const allergens = formData.get("allergens") as string;
  const isNew = formData.get("isNew") === "on";

  await db
    .update(menuItems)
    .set({
      name,
      description: description || null,
      price,
      imageUrl: imageUrl || null,
      allergens: allergens || null,
      isNew,
      updatedAt: new Date(),
    })
    .where(eq(menuItems.id, id));

  await syncItemToXibo(id);
  revalidatePath("/menu");
}

export async function toggleItemVisibility(id: number, isVisible: boolean) {
  await db
    .update(menuItems)
    .set({ isVisible, updatedAt: new Date() })
    .where(eq(menuItems.id, id));

  // Push to Xibo immediately — critical for 86 board
  await syncItemToXibo(id);
  revalidatePath("/menu");
}

export async function deleteMenuItem(id: number) {
  // Delete from Xibo first
  const [item] = await db
    .select({ xiboMenuBoardProductId: menuItems.xiboMenuBoardProductId })
    .from(menuItems)
    .where(eq(menuItems.id, id));

  if (item?.xiboMenuBoardProductId) {
    try {
      await xibo.deleteMenuBoardProduct(item.xiboMenuBoardProductId);
    } catch (err) {
      console.error("Xibo product delete failed:", err);
    }
  }

  await db.delete(menuItems).where(eq(menuItems.id, id));
  revalidatePath("/menu");
}
