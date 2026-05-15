"use server";

import { db } from "@/db";
import { clients, locations, screens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { xibo } from "@/lib/xibo-client";
import { inviteClientUser } from "@/lib/clerk-admin";

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const notes = formData.get("notes") as string;
  const provisionXibo = formData.get("provisionXibo") === "on";
  const sendInvite = formData.get("sendInvite") === "on";

  if (!name || !contactEmail) {
    throw new Error("Restaurant name and email are required");
  }

  let xiboFolderId: number | null = null;
  let xiboUserGroupId: number | null = null;

  // Xibo provisioning
  if (provisionXibo) {
    try {
      const folder = await xibo.createFolder(`Client - ${name}`);
      xiboFolderId = folder.folderId || folder.id;

      if (xiboFolderId) {
        await Promise.all([
          xibo.createFolder("Layouts", xiboFolderId),
          xibo.createFolder("Media", xiboFolderId),
          xibo.createFolder("Playlists", xiboFolderId),
          xibo.createFolder("Schedules", xiboFolderId),
        ]);
      }

      await xibo.createDisplayGroup(
        `${name} - All Locations`,
        `All displays for ${name}`
      );
    } catch (err) {
      console.error("Xibo provisioning failed:", err);
    }
  }

  // Create client record
  const [newClient] = await db
    .insert(clients)
    .values({
      name,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      notes: notes || null,
      xiboFolderId,
      xiboUserGroupId,
    })
    .returning();

  // Send Clerk invitation to client (always sends — email is required)
  try {
    await inviteClientUser(contactEmail, name);
  } catch (err) {
    console.error("Clerk invitation failed:", err);
    // Don't block client creation if invitation fails
  }

  redirect(`/clients/${newClient.id}`);
}

export async function updateClient(id: number, formData: FormData) {
  const name = formData.get("name") as string;
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const notes = formData.get("notes") as string;

  await db
    .update(clients)
    .set({
      name,
      contactName: contactName || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      notes: notes || null,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id));

  redirect(`/clients/${id}`);
}

export async function deleteClient(id: number) {
  await db.delete(clients).where(eq(clients.id, id));
  redirect("/clients");
}

export async function createLocation(formData: FormData) {
  const clientId = parseInt(formData.get("clientId") as string);
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const networkType = formData.get("networkType") as string;
  const contactName = formData.get("contactName") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const provisionXibo = formData.get("provisionXibo") === "on";

  let xiboDisplayGroupId: number | null = null;

  const [client] = await db
    .select({ name: clients.name })
    .from(clients)
    .where(eq(clients.id, clientId));

  if (provisionXibo && client) {
    try {
      const group = await xibo.createDisplayGroup(
        `${client.name} - ${name}`,
        `Displays at ${name} for ${client.name}`
      );
      xiboDisplayGroupId = group.displayGroupId || group.id;

      const [clientRecord] = await db
        .select({ xiboFolderId: clients.xiboFolderId })
        .from(clients)
        .where(eq(clients.id, clientId));

      if (clientRecord?.xiboFolderId) {
        const locFolder = await xibo.createFolder(
          `Location - ${name}`,
          clientRecord.xiboFolderId
        );
        const locFolderId = locFolder.folderId || locFolder.id;
        if (locFolderId) {
          await Promise.all([
            xibo.createFolder("Layouts", locFolderId),
            xibo.createFolder("Media", locFolderId),
            xibo.createFolder("Playlists", locFolderId),
            xibo.createFolder("Schedules", locFolderId),
          ]);
        }
      }
    } catch (err) {
      console.error("Xibo location provisioning failed:", err);
    }
  }

  await db.insert(locations).values({
    clientId,
    name,
    address: address || null,
    networkType: networkType || null,
    contactName: contactName || null,
    contactPhone: contactPhone || null,
    xiboDisplayGroupId,
  });

  redirect(`/clients/${clientId}`);
}

export async function createScreen(formData: FormData) {
  const locationId = parseInt(formData.get("locationId") as string);
  const clientId = parseInt(formData.get("clientId") as string);
  const name = formData.get("name") as string;
  const hostname = formData.get("hostname") as string;
  const displayType = formData.get("displayType") as string;
  const orientation = formData.get("orientation") as string;
  const rustdeskId = formData.get("rustdeskId") as string;
  const tvModel = formData.get("tvModel") as string;

  await db.insert(screens).values({
    locationId,
    name,
    hostname: hostname || null,
    displayType: displayType || null,
    orientation: (orientation as "landscape" | "portrait") || "landscape",
    rustdeskId: rustdeskId || null,
    tvModel: tvModel || null,
  });

  redirect(`/clients/${clientId}`);
}
