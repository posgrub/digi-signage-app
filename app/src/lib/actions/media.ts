"use server";

import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addMediaRecord(data: {
  clientId: number;
  name: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  url: string;
}) {
  await db.insert(mediaAssets).values(data);
  revalidatePath("/media");
}

export async function deleteMedia(id: number) {
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  revalidatePath("/media");
}
