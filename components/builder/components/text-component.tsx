"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Type } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";

interface TextComponentProps {
  data: {
    text: string;
    align: "left" | "center" | "right";
    size: "small" | "medium" | "large";
    color: string;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function TextComponent({ data, onUpdate, isEditable = false }: TextComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [text, setText] = useState(data.text);
  const [localData, setLocalData] = useState({ ...data });
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(data.text);
    setLocalData({ ...data });
  }, [data]);

  const handleDoubleClick = () => {
    if (isEditable) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onUpdate && text !== data.text) {
      onUpdate({ ...data, text });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      if (onUpdate && text !== data.text) {
        onUpdate({ ...data, text });
      }
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-xl",
  };

  const textAligns = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const renderSettingsPanel = () => (
    <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="p-2 rounded-lg bg-primary/10">
          <Type className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Text Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your text appearance</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-size" className="text-sm font-medium">
            Text Size
          </Label>
          <Select value={localData.size} onValueChange={(value) => handleSettingsChange("size", value)}>
            <SelectTrigger id="text-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-align" className="text-sm font-medium">
            Text Alignment
          </Label>
          <Select value={localData.align} onValueChange={(value) => handleSettingsChange("align", value)}>
            <SelectTrigger id="text-align">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ColorPicker label="Text Color" value={localData.color || "#000000"} onChange={(color) => handleSettingsChange("color", color)} />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleSaveSettings} className="flex-1">
          Save Changes
        </Button>
        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <motion.div
      className={cn("group relative", isEditable ? "cursor-text hover:bg-muted/20 transition-colors" : "")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4" onDoubleClick={handleDoubleClick}>
        {/* Settings Button - only show when editable */}
        {isEditable && (
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <motion.div
                className="absolute z-20 top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/95 backdrop-blur-sm shadow-md border border-border/30 hover:border-primary/30 transition-all duration-200"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Text settings</span>
                </Button>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              {renderSettingsPanel()}
            </PopoverContent>
          </Popover>
        )}

        {isEditing ? (
          <div
            ref={textRef}
            contentEditable
            suppressContentEditableWarning
            className={cn("outline-none focus:outline-none", textSizes[data.size], textAligns[data.align])}
            style={{ color: data.color || "inherit" }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            dangerouslySetInnerHTML={{ __html: text }}
            onInput={(e) => setText(e.currentTarget.innerHTML)}
          />
        ) : (
          <div
            className={cn(textSizes[data.size], textAligns[data.align])}
            style={{ color: data.color || "inherit" }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}
      </div>
    </motion.div>
  );
}
