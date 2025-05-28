"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { componentLibrary } from "@/lib/component-library";

interface BuilderDropzoneProps {
  onAddComponent: (component: any) => void;
  isEmpty: boolean;
}

export function BuilderDropzone({ onAddComponent, isEmpty }: BuilderDropzoneProps) {
  const { t } = useLanguage();
  const [isActive, setIsActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsActive(true);
  };

  const handleDragLeave = () => {
    setIsActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsActive(false);

    const componentId = e.dataTransfer.getData("componentId");
    const component = componentLibrary.find((c) => c.id === componentId);

    if (component) {
      onAddComponent(component);
    }
  };

  return (
    <>
      {isEmpty && (
        <motion.div
          className={`builder-dropzone rounded-md border-2 border-dashed flex flex-col items-center justify-center p-6 ${
            isActive ? "builder-dropzone-active" : ""
          } ${isEmpty ? "min-h-[300px]" : "min-h-[100px]"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <>
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-center mb-2">Select a component from the panel</p>
          </>
        </motion.div>
      )}
    </>
  );
}
