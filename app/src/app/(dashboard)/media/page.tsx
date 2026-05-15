export const dynamic = "force-dynamic";

import { db } from "@/db";
import { mediaAssets, clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Image, Film, Trash2, Upload, FileImage } from "lucide-react";
import { deleteMedia } from "@/lib/actions/media";

export default async function MediaPage() {
  const allClients = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .limit(1);

  const clientId = allClients.length > 0 ? allClients[0].id : null;

  const assets = clientId
    ? await db
        .select()
        .from(mediaAssets)
        .where(eq(mediaAssets.clientId, clientId))
        .orderBy(desc(mediaAssets.createdAt))
    : [];

  const images = assets.filter((a) => a.fileType === "image");
  const videos = assets.filter((a) => a.fileType === "video");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Media Library
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {assets.length} file{assets.length !== 1 ? "s" : ""} —{" "}
            {images.length} images, {videos.length} videos
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs">
            <Image className="h-3 w-3 mr-1" />
            {images.length}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Film className="h-3 w-3 mr-1" />
            {videos.length}
          </Badge>
        </div>
      </div>

      {/* Upload area */}
      <Card className="mb-6 border-dashed border-copper/30">
        <CardContent className="py-8 text-center">
          <Upload className="h-8 w-8 text-copper/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Upload images and videos for your menu boards and promotions
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Supported: JPG, PNG, MP4, WebM — Max 50MB per file
          </p>
          <p className="text-xs text-copper/60 mt-3">
            Media upload via the app will be available once Xibo API credentials
            are configured. For now, upload directly in{" "}
            <a
              href={process.env.XIBO_CMS_URL || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Xibo CMS
            </a>
            .
          </p>
        </CardContent>
      </Card>

      {/* Media Grid */}
      {assets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileImage className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No media uploaded yet.</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Upload food photos, promo images, and videos for your screens.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => {
            const deleteAction = deleteMedia.bind(null, asset.id);
            return (
              <Card key={asset.id} className="group overflow-hidden">
                <div className="aspect-video bg-muted/50 flex items-center justify-center">
                  {asset.url && asset.fileType === "image" ? (
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      {asset.fileType === "video" ? (
                        <Film className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                      ) : (
                        <Image className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {asset.fileType}
                      </p>
                    </div>
                  )}
                </div>
                <CardContent className="py-3 px-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {asset.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {asset.fileSize
                          ? `${(asset.fileSize / 1024 / 1024).toFixed(1)} MB`
                          : ""}{" "}
                        · {asset.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                  {asset.xiboMediaId && (
                    <Badge
                      variant="secondary"
                      className="text-[9px] mt-1 bg-copper/5 text-copper/70 border border-copper/10"
                    >
                      Xibo #{asset.xiboMediaId}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
