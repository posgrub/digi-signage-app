"use server";

import { db } from "@/db";
import { menuTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function saveTemplate(formData: FormData) {
  const clientId = parseInt(formData.get("clientId") as string);
  const templateStyle = formData.get("templateStyle") as string;
  const primaryColor = formData.get("primaryColor") as string;
  const secondaryColor = formData.get("secondaryColor") as string;
  const accentColor = formData.get("accentColor") as string;
  const textColor = formData.get("textColor") as string;
  const fontFamily = formData.get("fontFamily") as string;
  const logoUrl = formData.get("logoUrl") as string;
  const columns = parseInt(formData.get("columns") as string) || 2;
  const showPrices = formData.get("showPrices") !== "false";
  const showDescriptions = formData.get("showDescriptions") !== "false";

  const [existing] = await db
    .select()
    .from(menuTemplates)
    .where(eq(menuTemplates.clientId, clientId));

  if (existing) {
    await db
      .update(menuTemplates)
      .set({
        templateStyle,
        primaryColor,
        secondaryColor,
        accentColor,
        textColor,
        fontFamily,
        logoUrl: logoUrl || null,
        columns,
        showPrices,
        showDescriptions,
        updatedAt: new Date(),
      })
      .where(eq(menuTemplates.clientId, clientId));
  } else {
    await db.insert(menuTemplates).values({
      clientId,
      templateStyle,
      primaryColor,
      secondaryColor,
      accentColor,
      textColor,
      fontFamily,
      logoUrl: logoUrl || null,
      columns,
      showPrices,
      showDescriptions,
    });
  }

  revalidatePath("/templates");
  revalidatePath(`/render/${clientId}`);
}
