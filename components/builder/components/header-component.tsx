"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2 } from "lucide-react";

interface HeaderComponentProps {
  data: {
    title: string;
    subtitle: string;
    align: "left" | "center" | "right";
    showDivider: boolean;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function HeaderComponent({ data, onUpdate, isEditable = false }: HeaderComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const handleTitleEdit = () => {
    if (titleRef.current && onUpdate) {
      onUpdate({ ...data, title: titleRef.current.textContent || "" });
    }
  };

  const handleSubtitleEdit = () => {
    if (subtitleRef.current && onUpdate) {
      onUpdate({ ...data, subtitle: subtitleRef.current.textContent || "" });
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

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className="p-6 relative">
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background shadow-sm">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Header settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80"
            onInteractOutside={(e) => {
              // Only close if clicking outside, not on interactive elements
              const target = e.target as Element;
              if (!target.closest("[data-radix-select-content]") && !target.closest("[data-radix-popover-content]")) {
                setIsSettingsOpen(false);
              } else {
                e.preventDefault();
              }
            }}
          >
            <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2">
                <Label htmlFor="align">Alignment</Label>
                <Select value={localData.align} onValueChange={(value) => handleSettingsChange("align", value)}>
                  <SelectTrigger id="align" onClick={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent onClick={(e) => e.stopPropagation()}>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showDivider"
                  checked={localData.showDivider}
                  onCheckedChange={(checked) => handleSettingsChange("showDivider", checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Label htmlFor="showDivider">Show divider</Label>
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className={cn("space-y-2 w-full", alignClasses[data.align])}>
        <h1
          ref={titleRef}
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={handleTitleEdit}
          className={cn("text-3xl font-bold tracking-tight", isEditable ? "outline-none focus:outline-none hover:bg-muted/20 transition-colors" : "")}
        >
          {data.title}
        </h1>
        <p
          ref={subtitleRef}
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={handleSubtitleEdit}
          className={cn("text-muted-foreground", isEditable ? "outline-none focus:outline-none hover:bg-muted/20 transition-colors" : "")}
        >
          {data.subtitle}
        </p>
        {data.showDivider && <div className="h-px bg-border my-4 mx-auto max-w-xs" />}
      </div>
    </div>
  );
}
