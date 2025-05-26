import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ThumbnailPreviewProps {
  thumbnailUrl?: string;
  pageTitle: string;
  isVisible?: boolean;
}

export function ThumbnailPreview({ thumbnailUrl, pageTitle, isVisible = false }: ThumbnailPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!thumbnailUrl) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = thumbnailUrl;
    link.download = `${pageTitle}-thumbnail.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-20 right-4 z-50"
          >
            <div className="bg-background border rounded-lg shadow-lg p-3 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Thumbnail Generated</span>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(true)} className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>

              <div className="aspect-video bg-muted rounded cursor-pointer overflow-hidden" onClick={() => setShowPreview(true)}>
                <img
                  src={thumbnailUrl}
                  alt={`${pageTitle} thumbnail`}
                  className="w-full h-full object-contain bg-white hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex gap-1 mt-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="flex-1 h-7 text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 h-7 text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Page Thumbnail Preview</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-2xl bg-muted rounded-lg p-4">
              <img src={thumbnailUrl} alt={`${pageTitle} thumbnail`} className="w-full h-auto object-contain bg-white rounded shadow-sm" />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">{pageTitle}</p>
              <p>This is how your page thumbnail will appear in the dashboard</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
