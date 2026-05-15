"use server";

import { db } from "@/db";
import { promos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPromo(formData: FormData) {
  const clientId = parseInt(formData.get("clientId") as string);
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const promoType = formData.get("promoType") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const daysOfWeek = formData.get("daysOfWeek") as string;
  const allLocations = formData.get("allLocations") !== "false";
  const locationId = formData.get("locationId")
    ? parseInt(formData.get("locationId") as string)
    : null;

  await db.insert(promos).values({
    clientId,
    title,
    description: description || null,
    promoType: promoType as "daily_special" | "happy_hour" | "event" | "announcement" | "advertisement" | "seasonal",
    status: startDate ? "scheduled" : "draft",
    imageUrl: imageUrl || null,
    startDate: startDate || null,
    endDate: endDate || null,
    startTime: startTime || null,
    endTime: endTime || null,
    daysOfWeek: daysOfWeek || null,
    allLocations,
    locationId,
  });

  redirect("/promos");
}

export async function updatePromoStatus(
  id: number,
  status: "draft" | "scheduled" | "active" | "expired" | "cancelled"
) {
  await db
    .update(promos)
    .set({ status, updatedAt: new Date() })
    .where(eq(promos.id, id));
  revalidatePath("/promos");
}

export async function deletePromo(id: number) {
  await db.delete(promos).where(eq(promos.id, id));
  revalidatePath("/promos");
}
