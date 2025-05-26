"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Settings2, Upload } from "lucide-react";
import { ImageGallery } from "../image-gallery";

interface HeroComponentProps {
  data: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    buttonText: string;
    buttonUrl: string;
    overlay: boolean;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
}

export function HeroComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: HeroComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
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

  const handleImageSelect = (imageUrl: string) => {
    const updatedData = { ...localData, backgroundImage: imageUrl };
    setLocalData(updatedData);
    if (onUpdate) {
      onUpdate({ ...data, backgroundImage: imageUrl });
    }
    setIsGalleryOpen(false);
  };

  if (isInlineEdit) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={localData.title} onChange={(e) => handleSettingsChange("title", e.target.value)} placeholder="Hero title" />
        </div>

        <div className="space-y-2">
          <Label>Subtitle</Label>
          <Input value={localData.subtitle} onChange={(e) => handleSettingsChange("subtitle", e.target.value)} placeholder="Hero subtitle" />
        </div>

        <div className="space-y-2">
          <Label>Background Image</Label>
          <div className="space-y-2">
            {localData.backgroundImage && (
              <div className="w-full h-32 bg-muted rounded border overflow-hidden">
                <img src={localData.backgroundImage || "/placeholder.svg"} alt="Background preview" className="w-full h-full object-cover" />
              </div>
            )}
            <Button variant="outline" onClick={() => setIsGalleryOpen(true)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              {localData.backgroundImage ? "Change Background" : "Select Background from Gallery"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input value={localData.buttonText} onChange={(e) => handleSettingsChange("buttonText", e.target.value)} placeholder="Button text" />
          </div>

          <div className="space-y-2">
            <Label>Button URL</Label>
            <Input value={localData.buttonUrl} onChange={(e) => handleSettingsChange("buttonUrl", e.target.value)} placeholder="Button URL" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="overlay" checked={localData.overlay} onCheckedChange={(checked) => handleSettingsChange("overlay", checked)} />
          <Label htmlFor="overlay">Dark overlay</Label>
        </div>

        <Button onClick={handleSaveSettings} className="w-full">
          Apply Changes
        </Button>

        <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelectImage={handleImageSelect} />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {isEditable && !isInlineEdit && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Hero settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backgroundImage">Background Image</Label>
                <div className="space-y-2">
                  {localData.backgroundImage && (
                    <div className="w-full h-32 bg-muted rounded border overflow-hidden">
                      <img src={localData.backgroundImage || "/placeholder.svg"} alt="Background preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <Button variant="outline" onClick={() => setIsGalleryOpen(true)} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    {localData.backgroundImage ? "Change Background" : "Select Background from Gallery"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={localData.buttonText}
                  onChange={(e) => handleSettingsChange("buttonText", e.target.value)}
                  placeholder="Learn More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="buttonUrl">Button URL</Label>
                <Input
                  id="buttonUrl"
                  value={localData.buttonUrl}
                  onChange={(e) => handleSettingsChange("buttonUrl", e.target.value)}
                  placeholder="#section"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="overlay" checked={localData.overlay} onCheckedChange={(checked) => handleSettingsChange("overlay", checked)} />
                <Label htmlFor="overlay">Dark overlay</Label>
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div
        className="relative h-[60vh] flex items-center justify-center bg-cover bg-center w-full"
        style={{ backgroundImage: `url(${data.backgroundImage})` }}
      >
        {data.overlay && <div className="absolute inset-0 bg-black/50" />}
        <div className="relative z-10 text-center px-4 py-16 max-w-3xl mx-auto">
          <h2
            ref={titleRef}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={handleTitleEdit}
            className={cn(
              "text-4xl md:text-5xl font-bold text-white mb-4 text-center",
              isEditable ? "outline-none focus:outline-none hover:bg-black/20 transition-colors" : ""
            )}
          >
            {data.title}
          </h2>
          <p
            ref={subtitleRef}
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={handleSubtitleEdit}
            className={cn(
              "text-xl text-white/90 mb-8 text-center",
              isEditable ? "outline-none focus:outline-none hover:bg-black/20 transition-colors" : ""
            )}
          >
            {data.subtitle}
          </p>
          {data.buttonText && (
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <a href={data.buttonUrl}>{data.buttonText}</a>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ImageGallery isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} onSelectImage={handleImageSelect} />
    </div>
  );
}
