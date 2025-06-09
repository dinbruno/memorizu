"use client";

import type React from "react";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Upload } from "lucide-react";
import { ImageGallery } from "../image-gallery";
import { SafeImage } from "@/components/ui/safe-image";
import { useImages } from "@/contexts/images-context";
import { useEffect } from "react";
import { useBuilderTranslation } from "@/hooks/use-builder-translation";

interface ImageComponentProps {
  data: {
    src: string;
    alt: string;
    width: "small" | "medium" | "large" | "full";
    alignment: "left" | "center" | "right";
    rounded: boolean;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
}

export function ImageComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: ImageComponentProps) {
  const { loadImages } = useImages();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [localData, setLocalData] = useState({ ...data });
  const [altEditing, setAltEditing] = useState(false);
  const [editingAlt, setEditingAlt] = useState(data.alt);
  const t = useBuilderTranslation();

  // Load images when component mounts (if editable - for gallery selection)
  useEffect(() => {
    if (isEditable) {
      loadImages();
    }
  }, [isEditable, loadImages]);

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    if (onUpdate) {
      onUpdate(updatedData);
    }
  };

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
  };

  const handleImageSelect = (imageUrl: string) => {
    const updatedData = { ...data, src: imageUrl };
    if (onUpdate) {
      onUpdate(updatedData);
    }
    setIsGalleryOpen(false);
  };

  const handleAltDoubleClick = () => {
    if (isEditable) {
      setAltEditing(true);
    }
  };

  const handleAltBlur = () => {
    setAltEditing(false);
    if (onUpdate && editingAlt !== data.alt) {
      onUpdate({ ...data, alt: editingAlt });
    }
  };

  const handleAltKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setAltEditing(false);
      if (onUpdate && editingAlt !== data.alt) {
        onUpdate({ ...data, alt: editingAlt });
      }
    }
  };

  const widthClasses = {
    small: "w-48",
    medium: "w-64",
    large: "w-96",
    full: "w-full",
  };

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  if (isInlineEdit) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t.image.image}</Label>
          <div className="space-y-2">
            {data.src && (
              <div className="w-full h-32 bg-muted rounded border overflow-hidden">
                <SafeImage
                  src={data.src || "/placeholder.svg"}
                  alt={data.alt}
                  className="w-full h-full object-cover"
                  fallbackText={t.image.imageRemovedFromGallery}
                  isEditable={true}
                  onEdit={() => setIsGalleryOpen(true)}
                />
              </div>
            )}
            <Button variant="outline" onClick={() => setIsGalleryOpen(true)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {data.src ? t.image.changeImage : t.image.selectFromGallery}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t.image.altText}</Label>
          <Input value={localData.alt} onChange={(e) => handleSettingsChange("alt", e.target.value)} placeholder={t.image.describeImage} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.image.width}</Label>
            <Select value={localData.width} onValueChange={(value) => handleSettingsChange("width", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">{t.image.small}</SelectItem>
                <SelectItem value="medium">{t.image.medium}</SelectItem>
                <SelectItem value="large">{t.image.large}</SelectItem>
                <SelectItem value="full">{t.image.fullWidth}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.image.alignment}</Label>
            <Select value={localData.alignment} onValueChange={(value) => handleSettingsChange("alignment", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">{t.image.left}</SelectItem>
                <SelectItem value="center">{t.image.center}</SelectItem>
                <SelectItem value="right">{t.image.right}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rounded"
            checked={localData.rounded}
            onChange={(e) => handleSettingsChange("rounded", e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="rounded">{t.image.roundedCorners}</Label>
        </div>

        <Button onClick={handleSaveSettings} className="w-full">
          {t.image.applyChanges}
        </Button>

        <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelectImage={handleImageSelect} />
      </div>
    );
  }

  return (
    <div className="p-6 relative">
      {isEditable && !isInlineEdit && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background shadow-sm">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">{t.image.settings}</span>
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
                <Label>Image</Label>
                <div className="space-y-2">
                  {data.src && (
                    <div className="w-full h-32 bg-muted rounded border overflow-hidden">
                      <SafeImage
                        src={data.src || "/placeholder.svg"}
                        alt={data.alt}
                        className="w-full h-full object-cover"
                        fallbackText="Image removed from gallery"
                        isEditable={true}
                        onEdit={() => setIsGalleryOpen(true)}
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGalleryOpen(true);
                    }}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {data.src ? "Change Image" : "Select from Gallery"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input
                  value={localData.alt}
                  onChange={(e) => handleSettingsChange("alt", e.target.value)}
                  placeholder="Describe the image"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Select value={localData.width} onValueChange={(value) => handleSettingsChange("width", value)}>
                    <SelectTrigger onClick={(e) => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="full">Full Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alignment</Label>
                  <Select value={localData.alignment} onValueChange={(value) => handleSettingsChange("alignment", value)}>
                    <SelectTrigger onClick={(e) => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rounded"
                  checked={localData.rounded}
                  onChange={(e) => handleSettingsChange("rounded", e.target.checked)}
                  className="rounded"
                  onClick={(e) => e.stopPropagation()}
                />
                <Label htmlFor="rounded">Rounded corners</Label>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className={cn("flex", alignmentClasses[data.alignment])}>
        <div className={cn(widthClasses[data.width], "relative")}>
          <SafeImage
            src={data.src || "/placeholder.svg?height=300&width=400&query=image placeholder"}
            alt={data.alt}
            className={cn("w-full h-auto object-cover", data.rounded ? "rounded-lg" : "")}
            fallbackText="Image removed from gallery"
            isEditable={isEditable}
            onEdit={() => setIsGalleryOpen(true)}
          />
          {altEditing ? (
            <input
              type="text"
              value={editingAlt}
              onChange={(e) => setEditingAlt(e.target.value)}
              onBlur={handleAltBlur}
              onKeyDown={handleAltKeyDown}
              className="absolute bottom-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm"
              autoFocus
            />
          ) : (
            data.alt && (
              <div
                className={cn("absolute bottom-2 left-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm", isEditable ? "cursor-text" : "")}
                onDoubleClick={handleAltDoubleClick}
              >
                {data.alt}
              </div>
            )
          )}
        </div>
      </div>

      <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelectImage={handleImageSelect} />
    </div>
  );
}
