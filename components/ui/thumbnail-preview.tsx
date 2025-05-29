import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ThumbnailPreviewProps {
  thumbnailUrl: string;
  pageTitle: string;
  isVisible: boolean;
  ImageComponent?: React.ComponentType<{ src: string; alt: string; className?: string }>;
}

export function ThumbnailPreview({ thumbnailUrl, pageTitle, isVisible, ImageComponent }: ThumbnailPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  if (!thumbnailUrl) return null;

  const Image = ImageComponent || "img";

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-background border rounded-lg shadow-lg p-4 max-w-[300px] z-50"
          >
            <div className="text-sm font-medium mb-2">Thumbnail Generated!</div>
            <div className="aspect-video bg-muted rounded-md overflow-hidden">
              <Image src={thumbnailUrl} alt={`Thumbnail for ${pageTitle}`} className="w-full h-full object-contain bg-white" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">Preview of how your page will appear in the dashboard.</div>
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
              <Image src={thumbnailUrl} alt={`${pageTitle} thumbnail`} className="w-full h-auto object-contain bg-white rounded shadow-sm" />
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
