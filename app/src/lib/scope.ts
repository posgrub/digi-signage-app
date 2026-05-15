import { getUserSession } from "./auth";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the client scope for the current user.
 *
 * - Admin: returns null clientId (sees all data)
 * - Client: returns their clientId (sees only their data)
 */
export async function getClientScope(): Promise<{
  isAdmin: boolean;
  clientId: number | null;
  clientName: string | null;
}> {
  const session = await getUserSession();

  if (session.role === "client" && session.clientId) {
    return {
      isAdmin: false,
      clientId: session.clientId,
      clientName: session.clientName,
    };
  }

  return { isAdmin: true, clientId: null, clientName: null };
}

/**
 * For pages that need a single client context (Menu Editor, 86 Board, etc).
 * - Client user: always returns their clientId
 * - Admin user: returns selected client or first client
 */
export async function getActiveClientId(
  selectedClientId?: number
): Promise<{
  clientId: number | null;
  clientName: string | null;
  isAdmin: boolean;
}> {
  const scope = await getClientScope();

  // Client users always scoped to their own
  if (!scope.isAdmin && scope.clientId) {
    return {
      clientId: scope.clientId,
      clientName: scope.clientName,
      isAdmin: false,
    };
  }

  // Admin with specific client selected
  if (selectedClientId) {
    const [c] = await db
      .select({ id: clients.id, name: clients.name })
      .from(clients)
      .where(eq(clients.id, selectedClientId));
    return {
      clientId: c?.id || null,
      clientName: c?.name || null,
      isAdmin: true,
    };
  }

  // Admin default: first client
  const [first] = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .limit(1);

  return {
    clientId: first?.id || null,
    clientName: first?.name || null,
    isAdmin: true,
  };
}
