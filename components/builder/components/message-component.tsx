"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBuilderTranslation } from "@/hooks/use-builder-translation";

interface MessageComponentProps {
  data: {
    title: string;
    message: string;
    signature: string;
    style: "simple" | "card" | "paper";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function MessageComponent({ data, onUpdate, isEditable = false }: MessageComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const t = useBuilderTranslation();

  const handleTitleEdit = () => {
    if (titleRef.current && onUpdate) {
      onUpdate({ ...data, title: titleRef.current.textContent || "" });
    }
  };

  const handleMessageEdit = () => {
    if (messageRef.current && onUpdate) {
      onUpdate({ ...data, message: messageRef.current.textContent || "" });
    }
  };

  const handleSignatureEdit = () => {
    if (signatureRef.current && onUpdate) {
      onUpdate({ ...data, signature: signatureRef.current.textContent || "" });
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

  const renderMessage = () => {
    const contentEditableProps = isEditable
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
          className: "outline-none focus:outline-none hover:bg-muted/20 transition-colors",
        }
      : {};

    if (data.style === "card") {
      return (
        <Card>
          <CardHeader>
            <CardTitle ref={titleRef} {...contentEditableProps} onBlur={handleTitleEdit} className={cn(contentEditableProps.className)}>
              {data.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p
              ref={messageRef}
              {...contentEditableProps}
              onBlur={handleMessageEdit}
              className={cn("leading-relaxed", contentEditableProps.className)}
            >
              {data.message}
            </p>
            <div
              ref={signatureRef}
              {...contentEditableProps}
              onBlur={handleSignatureEdit}
              className={cn("text-right italic", contentEditableProps.className)}
            >
              {data.signature}
            </div>
          </CardContent>
        </Card>
      );
    } else if (data.style === "paper") {
      return (
        <div className="bg-[#fffdf0] p-6 shadow-md transform rotate-1 max-w-2xl mx-auto">
          <h3
            ref={titleRef}
            {...contentEditableProps}
            onBlur={handleTitleEdit}
            className={cn("text-2xl font-bold mb-4", contentEditableProps.className)}
          >
            {data.title}
          </h3>
          <p
            ref={messageRef}
            {...contentEditableProps}
            onBlur={handleMessageEdit}
            className={cn("leading-relaxed mb-6", contentEditableProps.className)}
          >
            {data.message}
          </p>
          <div
            ref={signatureRef}
            {...contentEditableProps}
            onBlur={handleSignatureEdit}
            className={cn("text-right italic", contentEditableProps.className)}
          >
            {data.signature}
          </div>
        </div>
      );
    } else {
      // Simple style
      return (
        <div className="max-w-2xl mx-auto">
          <h3
            ref={titleRef}
            {...contentEditableProps}
            onBlur={handleTitleEdit}
            className={cn("text-2xl font-bold mb-4", contentEditableProps.className)}
          >
            {data.title}
          </h3>
          <p
            ref={messageRef}
            {...contentEditableProps}
            onBlur={handleMessageEdit}
            className={cn("leading-relaxed mb-6", contentEditableProps.className)}
          >
            {data.message}
          </p>
          <div
            ref={signatureRef}
            {...contentEditableProps}
            onBlur={handleSignatureEdit}
            className={cn("text-right italic", contentEditableProps.className)}
          >
            {data.signature}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="p-6 relative">
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background shadow-sm">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">{t.message.settings}</span>
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
                <Label htmlFor="style">{t.style}</Label>
                <Select value={localData.style} onValueChange={(value) => handleSettingsChange("style", value)}>
                  <SelectTrigger id="style" onClick={(e) => e.stopPropagation()}>
                    <SelectValue placeholder={t.message.selectStyle} />
                  </SelectTrigger>
                  <SelectContent onClick={(e) => e.stopPropagation()}>
                    <SelectItem value="simple">{t.simple}</SelectItem>
                    <SelectItem value="card">{t.card}</SelectItem>
                    <SelectItem value="paper">{t.paper}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                {t.message.saveChanges}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className="w-full flex justify-center">{renderMessage()}</div>
    </div>
  );
}
