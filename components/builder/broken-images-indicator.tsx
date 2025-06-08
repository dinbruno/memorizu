"use client";

import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBrokenImages } from "@/hooks/use-broken-images";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function BrokenImagesIndicator() {
  const { brokenImages, clearAllBrokenImages, hasBrokenImages, brokenImageCount } = useBrokenImages();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!hasBrokenImages) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-destructive bg-destructive/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-sm">Broken Images</CardTitle>
              <Badge variant="destructive" className="text-xs">
                {brokenImageCount}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
                <RefreshCw className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={clearAllBrokenImages}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">Some images were removed from gallery</CardDescription>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {brokenImages.slice(0, 5).map((img, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0" />
                      <span className="truncate flex-1" title={img.src}>
                        {img.src.split("/").pop() || "Unknown image"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {img.componentType}
                      </Badge>
                    </div>
                  ))}
                  {brokenImageCount > 5 && <div className="text-xs text-muted-foreground text-center pt-1">+{brokenImageCount - 5} more...</div>}
                </div>

                <div className="mt-3 pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    💡 Click on broken image placeholders to replace them with new images from your gallery.
                  </p>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
