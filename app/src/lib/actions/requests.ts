"use server";

import { db } from "@/db";
import { changeRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createChangeRequest(formData: FormData) {
  const clientId = parseInt(formData.get("clientId") as string);
  const locationId = formData.get("locationId")
    ? parseInt(formData.get("locationId") as string)
    : null;
  const requestedBy = formData.get("requestedBy") as string;
  const description = formData.get("description") as string;
  const attachments = formData.get("attachments") as string;

  await db.insert(changeRequests).values({
    clientId,
    locationId,
    requestedBy,
    description,
    attachments: attachments || null,
    status: "pending",
  });

  redirect("/requests");
}

export async function updateRequestStatus(
  id: number,
  status: "pending" | "in_progress" | "completed" | "rejected",
  adminNotes?: string
) {
  await db
    .update(changeRequests)
    .set({
      status,
      adminNotes: adminNotes || null,
      resolvedAt:
        status === "completed" || status === "rejected" ? new Date() : null,
    })
    .where(eq(changeRequests.id, id));
}
