import { createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

/**
 * Create a Clerk account for a client and send them an invitation.
 * Returns the Clerk user ID to store in the client record.
 */
export async function inviteClientUser(email: string, clientName: string) {
  // Create an invitation — Clerk sends the email automatically
  const invitation = await clerk.invitations.createInvitation({
    emailAddress: email,
    publicMetadata: {
      role: "client",
      clientName,
    },
    notify: true,
  });

  return {
    invitationId: invitation.id,
    email: invitation.emailAddress,
    status: invitation.status,
  };
}

/**
 * Look up a Clerk user by email to get their user ID.
 */
export async function getClerkUserByEmail(email: string) {
  const users = await clerk.users.getUserList({
    emailAddress: [email],
  });

  return users.data.length > 0 ? users.data[0] : null;
}

/**
 * Set a user's public metadata (role, client ID).
 */
export async function setUserRole(
  userId: string,
  metadata: { role: string; clientId?: number; clientName?: string }
) {
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: metadata,
  });
}

/**
 * Get the current user's role and client info from their metadata.
 */
export function getUserRole(publicMetadata: Record<string, unknown>) {
  const role = (publicMetadata?.role as string) || "admin";
  const clientId = publicMetadata?.clientId as number | undefined;
  return { role, clientId };
}
