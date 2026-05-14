import { NextResponse } from "next/server";
import { db } from "@/db";
import { screens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { xibo } from "@/lib/xibo-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all displays from Xibo CMS
    const xiboDisplays = await xibo.getDisplays();

    if (!Array.isArray(xiboDisplays)) {
      return NextResponse.json(
        { error: "Invalid response from Xibo API" },
        { status: 502 }
      );
    }

    let updated = 0;

    // Update local screen records with Xibo status
    for (const display of xiboDisplays) {
      const xiboId = display.displayId;
      const isOnline = display.loggedIn ? 1 : 0;
      const lastCheckIn = display.lastAccessed
        ? new Date(display.lastAccessed)
        : null;

      const result = await db
        .update(screens)
        .set({
          isOnline,
          lastCheckIn,
          updatedAt: new Date(),
        })
        .where(eq(screens.xiboDisplayId, xiboId));

      if (result.length > 0) updated++;
    }

    return NextResponse.json({
      synced: xiboDisplays.length,
      updated,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Display sync failed:", err);
    return NextResponse.json(
      { error: "Sync failed", details: String(err) },
      { status: 500 }
    );
  }
}
