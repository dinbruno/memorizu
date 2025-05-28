"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonComponentProps {
  data: {
    text: string;
    url: string;
    variant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size: "default" | "sm" | "lg";
    align: "left" | "center" | "right";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function ButtonComponent({ data, onUpdate, isEditable = false }: ButtonComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });

  const handleChange = (field: string, value: string) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
  };

  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div className={cn("p-4 flex w-full", alignClasses[data.align])}>
      {isEditable ? (
        <div className="relative">
          <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <PopoverTrigger asChild>
              <Button variant={data.variant as any} size={data.size as any}>
                {data.text}
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
                  <Label htmlFor="text">Button Text</Label>
                  <Input
                    id="text"
                    value={localData.text}
                    onChange={(e) => handleChange("text", e.target.value)}
                    placeholder="Button text"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={localData.url}
                    onChange={(e) => handleChange("url", e.target.value)}
                    placeholder="https://example.com"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variant">Style</Label>
                  <Select value={localData.variant} onValueChange={(value) => handleChange("variant", value)}>
                    <SelectTrigger id="variant" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="destructive">Destructive</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="ghost">Ghost</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size</Label>
                  <Select value={localData.size} onValueChange={(value) => handleChange("size", value)}>
                    <SelectTrigger id="size" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="align">Alignment</Label>
                  <Select value={localData.align} onValueChange={(value) => handleChange("align", value)}>
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
                <Button onClick={handleSave} className="w-full">
                  Save Changes
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background shadow-sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings2 className="h-3 w-3" />
            <span className="sr-only">Button settings</span>
          </Button>
        </div>
      ) : (
        <Button variant={data.variant as any} size={data.size as any} asChild>
          <a href={data.url}>{data.text}</a>
        </Button>
      )}
    </div>
  );
}
