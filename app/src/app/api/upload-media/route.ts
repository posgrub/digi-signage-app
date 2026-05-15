import { NextResponse } from "next/server";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { getActiveClientId } from "@/lib/scope";
import { xibo } from "@/lib/xibo-client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { clientId } = await getActiveClientId();
    if (!clientId) {
      return NextResponse.json({ error: "No client context" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm", "video/quicktime",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, GIF, WebP, MP4, or WebM." },
        { status: 400 }
      );
    }

    const fileType = file.type.startsWith("video/") ? "video" : "image";

    // Upload to Xibo CMS library
    let xiboMediaId: number | null = null;
    try {
      const xiboForm = new FormData();
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: file.type });
      xiboForm.append("files", blob, file.name);
      xiboForm.append("name", file.name.replace(/\.[^/.]+$/, "")); // name without extension

      const xiboResult = await xibo.uploadMedia(xiboForm);
      xiboMediaId = xiboResult?.mediaId || xiboResult?.id || null;
    } catch (err) {
      console.error("Xibo upload failed (saving locally anyway):", err);
    }

    // Save record to database
    const [record] = await db
      .insert(mediaAssets)
      .values({
        clientId,
        name: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        url: null, // No local URL — file lives in Xibo
        xiboMediaId,
      })
      .returning();

    return NextResponse.json({
      success: true,
      id: record.id,
      xiboMediaId,
      name: record.name,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    return NextResponse.json(
      { error: "Upload failed", details: String(err) },
      { status: 500 }
    );
  }
}
