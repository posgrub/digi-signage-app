import { NextResponse } from "next/server";
import { syncClientMenuToXibo } from "@/lib/xibo-menu-sync";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId required" },
        { status: 400 }
      );
    }

    const result = await syncClientMenuToXibo(clientId);

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Menu sync failed:", err);
    return NextResponse.json(
      { error: "Sync failed", details: String(err) },
      { status: 500 }
    );
  }
}
