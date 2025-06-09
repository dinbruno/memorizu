"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuilderTranslation } from "@/hooks/use-builder-translation";

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
  const t = useBuilderTranslation();

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
                  <Label htmlFor="text">{t.button.buttonText}</Label>
                  <Input
                    id="text"
                    value={localData.text}
                    onChange={(e) => handleChange("text", e.target.value)}
                    placeholder={t.button.textPlaceholder}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">{t.button.url}</Label>
                  <Input
                    id="url"
                    value={localData.url}
                    onChange={(e) => handleChange("url", e.target.value)}
                    placeholder={t.button.urlPlaceholder}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variant">{t.style}</Label>
                  <Select value={localData.variant} onValueChange={(value) => handleChange("variant", value)}>
                    <SelectTrigger id="variant" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder={t.button.selectStyle} />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="default">{t.button.default}</SelectItem>
                      <SelectItem value="destructive">{t.button.destructive}</SelectItem>
                      <SelectItem value="outline">{t.outline}</SelectItem>
                      <SelectItem value="secondary">{t.button.secondary}</SelectItem>
                      <SelectItem value="ghost">{t.button.ghost}</SelectItem>
                      <SelectItem value="link">{t.button.link}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">{t.size}</Label>
                  <Select value={localData.size} onValueChange={(value) => handleChange("size", value)}>
                    <SelectTrigger id="size" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder={t.button.selectSize} />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="default">{t.button.default}</SelectItem>
                      <SelectItem value="sm">{t.button.small}</SelectItem>
                      <SelectItem value="lg">{t.button.large}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="align">{t.alignment}</Label>
                  <Select value={localData.align} onValueChange={(value) => handleChange("align", value)}>
                    <SelectTrigger id="align" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder={t.button.selectAlignment} />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="left">{t.left}</SelectItem>
                      <SelectItem value="center">{t.center}</SelectItem>
                      <SelectItem value="right">{t.right}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {t.save}
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
            <span className="sr-only">{t.button.settings}</span>
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
