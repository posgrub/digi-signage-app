"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function MediaUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setStatus(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload-media", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setStatus({ type: "error", message: data.error || "Upload failed" });
          return;
        }

        setStatus({
          type: "success",
          message: `${data.name} uploaded${data.xiboMediaId ? " to Xibo" : ""}`,
        });

        // Refresh the page to show new media
        router.refresh();
      } catch {
        setStatus({ type: "error", message: "Upload failed. Check connection." });
      } finally {
        setUploading(false);
      }
    },
    [router]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [uploadFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all duration-150 cursor-pointer
        ${isDragging
          ? "border-copper bg-copper/5"
          : "border-border/50 hover:border-copper/40 hover:bg-muted/30"
        }
      `}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
        onChange={handleFileSelect}
      />

      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-copper animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading to Xibo CMS...</p>
        </div>
      ) : status ? (
        <div className="flex flex-col items-center gap-2">
          {status.type === "success" ? (
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          ) : (
            <AlertCircle className="h-8 w-8 text-destructive" />
          )}
          <p
            className={`text-sm ${status.type === "success" ? "text-emerald-400" : "text-destructive"}`}
          >
            {status.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setStatus(null);
            }}
          >
            Upload another
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className={`h-8 w-8 ${isDragging ? "text-copper" : "text-copper/40"}`} />
          <p className="text-sm text-muted-foreground">
            {isDragging
              ? "Drop file to upload"
              : "Drag & drop or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground/60">
            JPG, PNG, GIF, WebP, MP4, WebM — Max 50MB
          </p>
        </div>
      )}
    </div>
  );
}
