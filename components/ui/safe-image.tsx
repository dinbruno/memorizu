"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ImageOff, Upload } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useBrokenImages } from "@/hooks/use-broken-images";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onImageError?: () => void;
  onImageLoad?: () => void;
  showBrokenIndicator?: boolean;
  enableFallback?: boolean;
  fallbackText?: string;
  isEditable?: boolean;
  onEdit?: () => void;
  draggable?: boolean;
  disableInteraction?: boolean; // New prop to disable buttons when inside clickable elements
  [key: string]: any;
}

export function SafeImage({
  src,
  alt,
  className,
  style,
  onImageError,
  onImageLoad,
  showBrokenIndicator = true,
  enableFallback = true,
  fallbackText = "Image not available",
  isEditable = false,
  onEdit,
  draggable = false,
  disableInteraction = false,
  ...props
}: SafeImageProps) {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">("loading");
  const [imageUrl, setImageUrl] = useState(src);
  const { reportBrokenImage, clearBrokenImage } = useBrokenImages();

  useEffect(() => {
    setImageUrl(src);
    setImageState("loading");
  }, [src]);

  const handleImageLoad = () => {
    setImageState("loaded");
    clearBrokenImage(src);
    onImageLoad?.();
  };

  const handleImageError = () => {
    setImageState("error");
    reportBrokenImage(src, "component");
    onImageError?.();
  };

  const retryLoad = () => {
    setImageState("loading");
    // Force reload by adding timestamp
    setImageUrl(`${src}?retry=${Date.now()}`);
  };

  if (imageState === "error" && enableFallback) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center bg-muted border-2 border-dashed border-muted-foreground/25 text-muted-foreground relative group",
          className
        )}
        style={style}
        {...props}
      >
        <ImageOff className="h-8 w-8 mb-2" />
        <p className="text-xs text-center px-2">{fallbackText}</p>

        {showBrokenIndicator && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full">
            <AlertTriangle className="h-3 w-3" />
          </div>
        )}

        {!disableInteraction && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={retryLoad} className="text-xs">
                Retry
              </Button>
              {isEditable && onEdit && (
                <Button variant="secondary" size="sm" onClick={onEdit} className="text-xs">
                  <Upload className="h-3 w-3 mr-1" />
                  Replace
                </Button>
              )}
            </div>
          </div>
        )}

        {disableInteraction && isEditable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/5">
            <p className="text-xs text-muted-foreground text-center px-2 leading-tight">Open accordion to replace</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt={alt}
        className={cn(className, imageState === "loading" ? "opacity-50" : "")}
        style={style}
        onLoad={handleImageLoad}
        onError={handleImageError}
        draggable={draggable}
        {...props}
      />

      {imageState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}
