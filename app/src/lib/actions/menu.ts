"use server";

import { db } from "@/db";
import { menuCategories, menuItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const clientId = parseInt(formData.get("clientId") as string);
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  // Get next sort order
  const existing = await db
    .select({ sortOrder: menuCategories.sortOrder })
    .from(menuCategories)
    .where(eq(menuCategories.clientId, clientId))
    .orderBy(menuCategories.sortOrder);

  const nextOrder = existing.length > 0 ? existing[existing.length - 1].sortOrder + 1 : 0;

  await db.insert(menuCategories).values({
    clientId,
    name,
    description: description || null,
    sortOrder: nextOrder,
  });

  revalidatePath(`/menu`);
}

export async function updateCategory(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  await db
    .update(menuCategories)
    .set({
      name,
      description: description || null,
      updatedAt: new Date(),
    })
    .where(eq(menuCategories.id, id));

  revalidatePath(`/menu`);
}

export async function toggleCategoryVisibility(id: number, isVisible: boolean) {
  await db
    .update(menuCategories)
    .set({ isVisible, updatedAt: new Date() })
    .where(eq(menuCategories.id, id));

  revalidatePath(`/menu`);
}

export async function deleteCategory(id: number) {
  await db.delete(menuCategories).where(eq(menuCategories.id, id));
  revalidatePath(`/menu`);
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

  const nextOrder = existing.length > 0 ? existing[existing.length - 1].sortOrder + 1 : 0;

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
  });

  revalidatePath(`/menu`);
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

  revalidatePath(`/menu`);
}

export async function toggleItemVisibility(id: number, isVisible: boolean) {
  await db
    .update(menuItems)
    .set({ isVisible, updatedAt: new Date() })
    .where(eq(menuItems.id, id));

  revalidatePath(`/menu`);
}

export async function deleteMenuItem(id: number) {
  await db.delete(menuItems).where(eq(menuItems.id, id));
  revalidatePath(`/menu`);
}
