"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2 } from "lucide-react";

interface QuoteComponentProps {
  data: {
    text: string;
    author: string;
    align: "left" | "center" | "right";
    style: "classic" | "modern" | "minimal";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function QuoteComponent({ data, onUpdate, isEditable = false }: QuoteComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const authorRef = useRef<HTMLElement>(null);

  const handleQuoteEdit = () => {
    if (quoteRef.current && onUpdate) {
      onUpdate({ ...data, text: quoteRef.current.textContent || "" });
    }
  };

  const handleAuthorEdit = () => {
    if (authorRef.current && onUpdate) {
      onUpdate({ ...data, author: authorRef.current.textContent || "" });
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

  const styleClasses = {
    classic: "border-l-4 border-primary pl-4",
    modern: "bg-muted p-6 rounded-lg",
    minimal: "",
  };

  return (
    <div className="p-6 relative">
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background shadow-sm">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Quote settings</span>
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
              <div className="space-y-2">
                <Label htmlFor="style">Style</Label>
                <Select value={localData.style} onValueChange={(value) => handleSettingsChange("style", value)}>
                  <SelectTrigger id="style" onClick={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent onClick={(e) => e.stopPropagation()}>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <figure className={cn("max-w-2xl mx-auto w-full", alignClasses[data.align])}>
        <blockquote className={cn("text-xl italic", styleClasses[data.style])}>
          <q
            ref={quoteRef}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={handleQuoteEdit}
            className={cn("block mb-4", isEditable ? "outline-none focus:outline-none hover:bg-muted/20 transition-colors" : "")}
          >
            {data.text}
          </q>
        </blockquote>
        <figcaption className={cn("mt-2", data.align === "center" ? "text-center" : data.align === "right" ? "text-right" : "text-left")}>
          <cite
            ref={authorRef}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={handleAuthorEdit}
            className={cn("not-italic font-medium", isEditable ? "outline-none focus:outline-none hover:bg-muted/20 transition-colors" : "")}
          >
            {data.author}
          </cite>
        </figcaption>
      </figure>
    </div>
  );
}
