"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";

interface BrokenImage {
  src: string;
  componentType: string;
  timestamp: number;
}

export function useBrokenImages() {
  const [brokenImages, setBrokenImages] = useState<BrokenImage[]>([]);
  const { toast } = useToast();

  const reportBrokenImage = useCallback(
    (src: string, componentType: string = "unknown") => {
      const brokenImage: BrokenImage = {
        src,
        componentType,
        timestamp: Date.now(),
      };

      setBrokenImages((prev) => {
        // Avoid duplicates
        const exists = prev.some((img) => img.src === src);
        if (exists) return prev;

        const updated = [...prev, brokenImage];

        // Show toast notification for first broken image in session
        if (prev.length === 0) {
          toast({
            variant: "destructive",
            title: "Broken Images Detected",
            description:
              "Some images were removed from gallery and are no longer available. You can replace them by clicking on the broken image placeholders.",
            duration: 8000,
          });
        }

        return updated;
      });
    },
    [toast]
  );

  const clearBrokenImage = useCallback((src: string) => {
    setBrokenImages((prev) => prev.filter((img) => img.src !== src));
  }, []);

  const clearAllBrokenImages = useCallback(() => {
    setBrokenImages([]);
  }, []);

  // Auto-cleanup old broken image reports (older than 1 hour)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      setBrokenImages((prev) => prev.filter((img) => img.timestamp > oneHourAgo));
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(cleanup);
  }, []);

  return {
    brokenImages,
    reportBrokenImage,
    clearBrokenImage,
    clearAllBrokenImages,
    hasBrokenImages: brokenImages.length > 0,
    brokenImageCount: brokenImages.length,
  };
}
