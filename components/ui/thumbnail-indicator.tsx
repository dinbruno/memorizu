import { Camera, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThumbnailIndicatorProps {
  isGenerating: boolean;
  hasGenerated: boolean;
}

export function ThumbnailIndicator({ isGenerating, hasGenerated }: ThumbnailIndicatorProps) {
  return (
    <AnimatePresence>
      {(isGenerating || hasGenerated) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-background border rounded-lg shadow-lg p-3 flex items-center gap-2">
            {isGenerating ? (
              <>
                <Camera className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Generating thumbnail...</span>
              </>
            ) : hasGenerated ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Thumbnail generated!</span>
              </>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
