import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UserSession = {
  role: "admin" | "client";
  userId: string;
  clientId: number | null;
  clientName: string | null;
  email: string | null;
};

/**
 * Get the current user's role and client scope.
 *
 * Logic:
 * 1. If user has publicMetadata.role === "client" → they're a client user
 * 2. If user has publicMetadata.clientId → use that
 * 3. Otherwise, check if their email matches a client's contactEmail → auto-link
 * 4. If nothing matches → they're an admin
 */
export async function getUserSession(): Promise<UserSession> {
  const user = await currentUser();

  if (!user) {
    return { role: "admin", userId: "", clientId: null, clientName: null, email: null };
  }

  const metadata = user.publicMetadata as Record<string, unknown>;
  const email = user.emailAddresses?.[0]?.emailAddress || null;

  // Check if explicitly set as client
  if (metadata?.role === "client" && metadata?.clientId) {
    const clientId = metadata.clientId as number;
    const [client] = await db
      .select({ name: clients.name })
      .from(clients)
      .where(eq(clients.id, clientId));

    return {
      role: "client",
      userId: user.id,
      clientId,
      clientName: client?.name || null,
      email,
    };
  }

  // Auto-detect: check if their email matches a client record
  if (email) {
    const [matchedClient] = await db
      .select({ id: clients.id, name: clients.name, clerkUserId: clients.clerkUserId })
      .from(clients)
      .where(eq(clients.contactEmail, email));

    if (matchedClient) {
      // Link the Clerk user ID if not already linked
      if (!matchedClient.clerkUserId) {
        await db
          .update(clients)
          .set({ clerkUserId: user.id, updatedAt: new Date() })
          .where(eq(clients.id, matchedClient.id));
      }

      return {
        role: "client",
        userId: user.id,
        clientId: matchedClient.id,
        clientName: matchedClient.name,
        email,
      };
    }
  }

  // Default: admin
  return { role: "admin", userId: user.id, clientId: null, clientName: null, email };
}
