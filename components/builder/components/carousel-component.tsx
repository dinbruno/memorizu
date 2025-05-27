"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Settings2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ImageIcon,
  Plus,
  Trash2,
  Shuffle,
  Images,
  Palette,
  Layout,
  Settings,
  Eye,
} from "lucide-react";
import { ImageGallery } from "../image-gallery";
import { ColorPicker } from "@/components/ui/color-picker";

interface CarouselImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  hoverText?: string;
  rotation?: number;
  scale?: number;
  filter?: string;
}

interface CarouselComponentProps {
  data: {
    title?: string;
    images: CarouselImage[];
    autoplay: boolean;
    autoplaySpeed: number;
    showDots: boolean;
    showArrows: boolean;
    showCaptions: boolean;
    enableHover: boolean;
    hoverEffect: "zoom" | "rotate" | "flip" | "slide" | "fade" | "tilt";
    layout: "picture-frame" | "photo-album" | "gallery-wall" | "film-strip" | "magazine-spread" | "memory-board" | "vintage-slideshow";
    theme: "default" | "vintage" | "modern" | "romantic" | "dark";
    borderRadius: number;
    spacing: number;
    height: number;
    transition: "slide" | "fade" | "cube" | "flip" | "coverflow";
    randomRotation: boolean;
    maxRotation: number;
    enableShuffle: boolean;
    overlayColor: string;
    overlayOpacity: number;
    // New customization options
    backgroundColor: string;
    width: string;
    maxWidth: string;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    borderWidth: number;
    borderColor: string;
    borderStyle: "solid" | "dashed" | "dotted" | "none";
    shadowSize: "none" | "sm" | "md" | "lg" | "xl";
    shadowColor: string;
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function CarouselComponent({ data, onUpdate, isEditable = false }: CarouselComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(data.autoplay);

  // Ensure all data has proper defaults
  const [localData, setLocalData] = useState(() => ({
    title: data.title || "",
    images: data.images || [],
    autoplay: data.autoplay ?? false,
    autoplaySpeed: data.autoplaySpeed ?? 3,
    showDots: data.showDots ?? true,
    showArrows: data.showArrows ?? true,
    showCaptions: data.showCaptions ?? true,
    enableHover: data.enableHover ?? true,
    hoverEffect: data.hoverEffect || "zoom",
    layout: data.layout || "picture-frame",
    theme: data.theme || "default",
    borderRadius: data.borderRadius ?? 12,
    spacing: data.spacing ?? 16,
    height: data.height ?? 400,
    transition: data.transition || "slide",
    randomRotation: data.randomRotation ?? false,
    maxRotation: data.maxRotation ?? 15,
    enableShuffle: data.enableShuffle ?? true,
    overlayColor: data.overlayColor || "#000000",
    overlayOpacity: data.overlayOpacity ?? 0.5,
    backgroundColor: data.backgroundColor || "transparent",
    width: data.width || "100%",
    maxWidth: data.maxWidth || "lg",
    marginTop: data.marginTop ?? 0,
    marginBottom: data.marginBottom ?? 0,
    marginLeft: data.marginLeft ?? 0,
    marginRight: data.marginRight ?? 0,
    paddingTop: data.paddingTop ?? 24,
    paddingBottom: data.paddingBottom ?? 24,
    paddingLeft: data.paddingLeft ?? 24,
    paddingRight: data.paddingRight ?? 24,
    borderWidth: data.borderWidth ?? 0,
    borderColor: data.borderColor || "#e5e7eb",
    borderStyle: data.borderStyle || "solid",
    shadowSize: data.shadowSize || "none",
    shadowColor: data.shadowColor || "#000000",
  }));

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create a safe data getter that ensures all values have defaults
  const getSafeData = () => {
    const sourceData = isEditable ? localData : data;
    return {
      title: sourceData.title || "",
      images: sourceData.images || [],
      autoplay: sourceData.autoplay ?? false,
      autoplaySpeed: sourceData.autoplaySpeed ?? 3,
      showDots: sourceData.showDots ?? true,
      showArrows: sourceData.showArrows ?? true,
      showCaptions: sourceData.showCaptions ?? true,
      enableHover: sourceData.enableHover ?? true,
      hoverEffect: sourceData.hoverEffect || "zoom",
      layout: sourceData.layout || "picture-frame",
      theme: sourceData.theme || "default",
      borderRadius: sourceData.borderRadius ?? 12,
      spacing: sourceData.spacing ?? 16,
      height: sourceData.height ?? 400,
      transition: sourceData.transition || "slide",
      randomRotation: sourceData.randomRotation ?? false,
      maxRotation: sourceData.maxRotation ?? 15,
      enableShuffle: sourceData.enableShuffle ?? true,
      overlayColor: sourceData.overlayColor || "#000000",
      overlayOpacity: sourceData.overlayOpacity ?? 0.5,
      backgroundColor: sourceData.backgroundColor || "transparent",
      width: sourceData.width || "100%",
      maxWidth: sourceData.maxWidth || "lg",
      marginTop: sourceData.marginTop ?? 0,
      marginBottom: sourceData.marginBottom ?? 0,
      marginLeft: sourceData.marginLeft ?? 0,
      marginRight: sourceData.marginRight ?? 0,
      paddingTop: sourceData.paddingTop ?? 24,
      paddingBottom: sourceData.paddingBottom ?? 24,
      paddingLeft: sourceData.paddingLeft ?? 24,
      paddingRight: sourceData.paddingRight ?? 24,
      borderWidth: sourceData.borderWidth ?? 0,
      borderColor: sourceData.borderColor || "#e5e7eb",
      borderStyle: sourceData.borderStyle || "solid",
      shadowSize: sourceData.shadowSize || "none",
      shadowColor: sourceData.shadowColor || "#000000",
    };
  };

  const displayData = getSafeData();

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && displayData.images.length > 1 && !isEditable) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % displayData.images.length);
      }, displayData.autoplaySpeed * 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, displayData.autoplaySpeed, displayData.images.length, isEditable]);

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    if (onUpdate) {
      onUpdate(updatedData);
    }
  };

  const handleImageUpdate = (index: number, updates: Partial<CarouselImage>) => {
    const updatedImages = [...localData.images];
    updatedImages[index] = { ...updatedImages[index], ...updates };
    handleSettingsChange("images", updatedImages);
  };

  const handleAddImage = (imageUrl: string) => {
    const newImage: CarouselImage = {
      id: Date.now().toString(),
      src: imageUrl,
      alt: "Carousel image",
      caption: "",
      hoverText: "",
      rotation: displayData.randomRotation ? Math.random() * displayData.maxRotation * 2 - displayData.maxRotation : 0,
      scale: 1,
      filter: "none",
    };
    const updatedImages = [...localData.images, newImage];
    handleSettingsChange("images", updatedImages);
  };

  const handleAddImages = (imageUrls: string[]) => {
    const newImages: CarouselImage[] = imageUrls.map((imageUrl) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      src: imageUrl,
      alt: "Carousel image",
      caption: "",
      hoverText: "",
      rotation: displayData.randomRotation ? Math.random() * displayData.maxRotation * 2 - displayData.maxRotation : 0,
      scale: 1,
      filter: "none",
    }));
    const updatedImages = [...localData.images, ...newImages];
    handleSettingsChange("images", updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...localData.images];
    updatedImages.splice(index, 1);
    handleSettingsChange("images", updatedImages);
    if (currentIndex >= updatedImages.length) {
      setCurrentIndex(Math.max(0, updatedImages.length - 1));
    }
  };

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayData.images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayData.images.length) % displayData.images.length);
  };

  const shuffleImages = () => {
    const shuffled = [...localData.images].sort(() => Math.random() - 0.5);
    if (onUpdate) {
      onUpdate({ ...localData, images: shuffled });
    }
    setCurrentIndex(0);
  };

  const getThemeClasses = () => {
    switch (displayData.theme) {
      case "vintage":
        return "bg-amber-50 border-amber-200";
      case "modern":
        return "bg-slate-50 border-slate-200";
      case "romantic":
        return "bg-rose-50 border-rose-200";
      case "dark":
        return "bg-slate-900 border-slate-700";
      default:
        return "bg-background border-border";
    }
  };

  const getShadowClass = () => {
    const shadowMap = {
      none: "",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg",
      xl: "shadow-xl",
    };
    return shadowMap[displayData.shadowSize] || "";
  };

  const getContainerStyles = () => ({
    backgroundColor: displayData.backgroundColor === "transparent" ? undefined : displayData.backgroundColor,
    width: displayData.width,
    maxWidth: displayData.maxWidth,
    marginTop: `${displayData.marginTop}px`,
    marginBottom: `${displayData.marginBottom}px`,
    marginLeft: `${displayData.marginLeft}px`,
    marginRight: `${displayData.marginRight}px`,
    paddingTop: `${displayData.paddingTop}px`,
    paddingBottom: `${displayData.paddingBottom}px`,
    paddingLeft: `${displayData.paddingLeft}px`,
    paddingRight: `${displayData.paddingRight}px`,
    borderWidth: `${displayData.borderWidth}px`,
    borderColor: displayData.borderColor,
    borderStyle: displayData.borderStyle,
    borderRadius: `${displayData.borderRadius}px`,
  });

  // Simple carousel for edit mode
  const renderSimpleCarousel = () => (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">{displayData.title || "Carousel"}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {displayData.images.length} {displayData.images.length === 1 ? "image" : "images"} • {displayData.layout} layout
        </p>
      </div>

      {displayData.images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {displayData.images.slice(0, 6).map((image, index) => (
            <motion.div
              key={image?.id || index}
              className="relative aspect-square bg-muted rounded-lg overflow-hidden border border-border/50 hover:border-border transition-colors group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <img src={image?.src || "/placeholder.svg"} alt={image?.alt || "Carousel image"} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">{index + 1}</span>
              </div>
              {index === 5 && displayData.images.length > 6 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">+{displayData.images.length - 6}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Images className="h-8 w-8 mb-2" />
          <p className="text-sm">No images added yet</p>
        </div>
      )}
    </div>
  );

  const renderSettingsPanel = () => (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="p-2 rounded-lg bg-primary/10">
          <Images className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Carousel Settings</h3>
          <p className="text-sm text-muted-foreground">Configure your image carousel</p>
        </div>
      </div>

      {/* Content Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings className="h-4 w-4" />
          Content
        </div>

        <div className="space-y-3 pl-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={localData.title || ""} onChange={(e) => handleSettingsChange("title", e.target.value)} placeholder="Carousel title" />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsGalleryOpen(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Images
            </Button>
            {localData.images.length > 1 && (
              <Button variant="outline" size="sm" onClick={shuffleImages}>
                <Shuffle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Layout Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layout className="h-4 w-4" />
          Layout & Style
        </div>

        <div className="space-y-3 pl-6">
          <div className="space-y-2">
            <Label>Layout Style</Label>
            <Select value={localData.layout} onValueChange={(value) => handleSettingsChange("layout", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="picture-frame">🖼️ Picture Frame</SelectItem>
                <SelectItem value="photo-album">📖 Photo Album</SelectItem>
                <SelectItem value="gallery-wall">🏛️ Gallery Wall</SelectItem>
                <SelectItem value="film-strip">🎞️ Film Strip</SelectItem>
                <SelectItem value="magazine-spread">📰 Magazine Spread</SelectItem>
                <SelectItem value="memory-board">📌 Memory Board</SelectItem>
                <SelectItem value="vintage-slideshow">📽️ Vintage Slideshow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={localData.theme} onValueChange={(value) => handleSettingsChange("theme", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="romantic">Romantic</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hover Effect</Label>
            <Select value={localData.hoverEffect} onValueChange={(value) => handleSettingsChange("hoverEffect", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zoom">Zoom</SelectItem>
                <SelectItem value="rotate">Rotate</SelectItem>
                <SelectItem value="flip">Flip</SelectItem>
                <SelectItem value="slide">Slide</SelectItem>
                <SelectItem value="fade">Fade</SelectItem>
                <SelectItem value="tilt">Tilt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Height (px)</Label>
            <Slider value={[localData.height]} onValueChange={([value]) => handleSettingsChange("height", value)} min={200} max={800} step={50} />
            <div className="text-sm text-muted-foreground">{localData.height}px</div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Appearance Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Palette className="h-4 w-4" />
          Appearance
        </div>

        <div className="space-y-3 pl-6">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <ColorPicker value={localData.backgroundColor} onChange={(color) => handleSettingsChange("backgroundColor", color)} />
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Slider
              value={[localData.borderRadius]}
              onValueChange={([value]) => handleSettingsChange("borderRadius", value)}
              min={0}
              max={50}
              step={5}
            />
            <div className="text-sm text-muted-foreground">{localData.borderRadius}px</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Border Width</Label>
              <Slider
                value={[localData.borderWidth]}
                onValueChange={([value]) => handleSettingsChange("borderWidth", value)}
                min={0}
                max={10}
                step={1}
              />
              <div className="text-sm text-muted-foreground">{localData.borderWidth}px</div>
            </div>
            <div className="space-y-2">
              <Label>Border Color</Label>
              <ColorPicker value={localData.borderColor} onChange={(color) => handleSettingsChange("borderColor", color)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Border Style</Label>
            <Select value={localData.borderStyle} onValueChange={(value) => handleSettingsChange("borderStyle", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Shadow</Label>
            <Select value={localData.shadowSize} onValueChange={(value) => handleSettingsChange("shadowSize", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
                <SelectItem value="xl">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Sizing & Spacing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings className="h-4 w-4" />
          Sizing & Spacing
        </div>

        <div className="space-y-3 pl-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Width</Label>
              <Select value={localData.width} onValueChange={(value) => handleSettingsChange("width", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100%">Full Width</SelectItem>
                  <SelectItem value="75%">75%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="25%">25%</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Width</Label>
              <Select value={localData.maxWidth} onValueChange={(value) => handleSettingsChange("maxWidth", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="sm">Small (640px)</SelectItem>
                  <SelectItem value="md">Medium (768px)</SelectItem>
                  <SelectItem value="lg">Large (1024px)</SelectItem>
                  <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Margins */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Margins</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Top</Label>
                <Slider
                  value={[localData.marginTop]}
                  onValueChange={([value]) => handleSettingsChange("marginTop", value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">{localData.marginTop}px</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bottom</Label>
                <Slider
                  value={[localData.marginBottom]}
                  onValueChange={([value]) => handleSettingsChange("marginBottom", value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">{localData.marginBottom}px</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Left</Label>
                <Slider
                  value={[localData.marginLeft]}
                  onValueChange={([value]) => handleSettingsChange("marginLeft", value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">{localData.marginLeft}px</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Right</Label>
                <Slider
                  value={[localData.marginRight]}
                  onValueChange={([value]) => handleSettingsChange("marginRight", value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">{localData.marginRight}px</div>
              </div>
            </div>
          </div>

          {/* Paddings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Padding</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Top</Label>
                <Slider
                  value={[localData.paddingTop]}
                  onValueChange={([value]) => handleSettingsChange("paddingTop", value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">{localData.paddingTop}px</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bottom</Label>
                <Slider
                  value={[localData.paddingBottom]}
                  onValueChange={([value]) => handleSettingsChange("paddingBottom", value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">{localData.paddingBottom}px</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Left</Label>
                <Slider
                  value={[localData.paddingLeft]}
                  onValueChange={([value]) => handleSettingsChange("paddingLeft", value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">{localData.paddingLeft}px</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Right</Label>
                <Slider
                  value={[localData.paddingRight]}
                  onValueChange={([value]) => handleSettingsChange("paddingRight", value)}
                  min={0}
                  max={100}
                  step={5}
                />
                <div className="text-xs text-muted-foreground">{localData.paddingRight}px</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Behavior Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Eye className="h-4 w-4" />
          Behavior
        </div>

        <div className="space-y-3 pl-6">
          <div className="flex items-center justify-between">
            <Label>Autoplay</Label>
            <Switch checked={localData.autoplay} onCheckedChange={(checked) => handleSettingsChange("autoplay", checked)} />
          </div>

          {localData.autoplay && (
            <div className="space-y-2">
              <Label>Autoplay Speed (seconds)</Label>
              <Slider
                value={[localData.autoplaySpeed]}
                onValueChange={([value]) => handleSettingsChange("autoplaySpeed", value)}
                min={1}
                max={10}
                step={0.5}
              />
              <div className="text-sm text-muted-foreground">{localData.autoplaySpeed}s</div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label>Random Rotation</Label>
            <Switch checked={localData.randomRotation} onCheckedChange={(checked) => handleSettingsChange("randomRotation", checked)} />
          </div>

          {localData.randomRotation && (
            <div className="space-y-2">
              <Label>Max Rotation (degrees)</Label>
              <Slider
                value={[localData.maxRotation]}
                onValueChange={([value]) => handleSettingsChange("maxRotation", value)}
                min={0}
                max={45}
                step={5}
              />
              <div className="text-sm text-muted-foreground">±{localData.maxRotation}°</div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Show Arrows</Label>
              <Switch checked={localData.showArrows} onCheckedChange={(checked) => handleSettingsChange("showArrows", checked)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Dots</Label>
              <Switch checked={localData.showDots} onCheckedChange={(checked) => handleSettingsChange("showDots", checked)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Show Captions</Label>
              <Switch checked={localData.showCaptions} onCheckedChange={(checked) => handleSettingsChange("showCaptions", checked)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Enable Hover Text</Label>
              <Switch checked={localData.enableHover} onCheckedChange={(checked) => handleSettingsChange("enableHover", checked)} />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSaveSettings} className="flex-1">
          Save Changes
        </Button>
        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderCarouselContent = () => {
    if (displayData.images.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-4" />
          <p>No images added yet</p>
          {isEditable && (
            <Button variant="outline" className="mt-4" onClick={() => setIsGalleryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Images
            </Button>
          )}
        </div>
      );
    }

    switch (displayData.layout) {
      case "picture-frame":
        return (
          <div className="relative h-full flex items-center justify-center">
            {/* Wooden Frame */}
            <div className="relative bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 p-8 rounded-lg shadow-2xl">
              {/* Frame Details */}
              <div className="absolute inset-2 border-4 border-amber-600 rounded-md shadow-inner"></div>
              <div className="absolute inset-4 border-2 border-amber-500 rounded-sm"></div>

              {/* Glass Effect */}
              <div className="relative bg-white p-4 rounded shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none"></div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative"
                  >
                    <img
                      src={displayData.images[currentIndex]?.src || "/placeholder.svg"}
                      alt={displayData.images[currentIndex]?.alt || "Carousel image"}
                      className="w-full h-full object-cover rounded-sm"
                      style={{ height: `${displayData.height - 120}px`, width: `${displayData.height - 120}px` }}
                    />

                    {/* Photo Corner Tabs */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-amber-100 border border-amber-300 rotate-45 shadow-sm"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-100 border border-amber-300 rotate-45 shadow-sm"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-amber-100 border border-amber-300 rotate-45 shadow-sm"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-100 border border-amber-300 rotate-45 shadow-sm"></div>
                  </motion.div>
                </AnimatePresence>

                {/* Caption Plate */}
                {displayData.showCaptions && displayData.images[currentIndex]?.caption && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-yellow-100 px-4 py-1 rounded text-xs font-serif shadow-lg">
                    {displayData.images[currentIndex]?.caption}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "photo-album":
        return (
          <div className="relative h-full">
            {/* Album Cover */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-lg shadow-2xl p-6 h-full">
              {/* Album Pages */}
              <div
                className="relative rounded shadow-inner p-6 h-full overflow-hidden"
                style={{
                  backgroundColor:
                    displayData.backgroundColor === "transparent" || displayData.backgroundColor === "#ffffff"
                      ? "#fef7ed"
                      : displayData.backgroundColor,
                }}
              >
                {/* Page Lines */}
                <div className="absolute left-12 top-0 bottom-0 w-px bg-red-300 opacity-50"></div>
                <div className="absolute left-14 top-0 bottom-0 w-px bg-blue-300 opacity-30"></div>

                {/* Current Photo */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ x: 300, opacity: 0, rotateY: -15 }}
                      animate={{ x: 0, opacity: 1, rotateY: 0 }}
                      exit={{ x: -300, opacity: 0, rotateY: 15 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="relative"
                    >
                      {/* Photo Corners */}
                      <div className="relative bg-white p-3 shadow-lg transform rotate-1 hover:rotate-0 transition-transform duration-300">
                        <img
                          src={displayData.images[currentIndex]?.src || "/placeholder.svg"}
                          alt={displayData.images[currentIndex]?.alt || "Carousel image"}
                          className="w-full h-auto object-cover"
                          style={{ maxHeight: `${displayData.height - 200}px` }}
                        />

                        {/* Photo Tape */}
                        <div className="absolute -top-2 left-4 w-12 h-6 bg-yellow-200 opacity-80 transform -rotate-12 shadow-sm"></div>
                        <div className="absolute -top-2 right-4 w-12 h-6 bg-yellow-200 opacity-80 transform rotate-12 shadow-sm"></div>
                      </div>

                      {/* Handwritten Caption */}
                      {displayData.showCaptions && displayData.images[currentIndex]?.caption && (
                        <div className="mt-4 text-slate-700 text-lg transform -rotate-1">{displayData.images[currentIndex]?.caption}</div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Page Number */}
                <div className="absolute bottom-4 right-6 text-slate-500 text-sm font-serif">
                  {currentIndex + 1} / {displayData.images.length}
                </div>
              </div>

              {/* Album Binding */}
              <div className="absolute left-0 top-4 bottom-4 w-2 bg-gradient-to-b from-slate-600 to-slate-800 rounded-l-lg shadow-inner"></div>
              <div className="absolute left-1 top-6 bottom-6 w-px bg-slate-500"></div>
            </div>
          </div>
        );

      case "gallery-wall":
        return (
          <div className="relative h-full bg-gradient-to-b from-gray-100 to-gray-200 p-8 rounded-lg overflow-hidden">
            {/* Gallery Lighting */}
            <div className="absolute top-0 left-1/4 right-1/4 h-8 bg-gradient-to-b from-yellow-200/30 to-transparent rounded-b-full"></div>

            <div className="relative grid grid-cols-3 gap-6 h-full">
              {displayData.images.slice(0, 9).map((image, index) => (
                <motion.div
                  key={image?.id || index}
                  className={cn("relative cursor-pointer group", index === currentIndex ? "col-span-2 row-span-2" : "col-span-1 row-span-1")}
                  onClick={() => setCurrentIndex(index)}
                  whileHover={{ scale: 1.02 }}
                  animate={{
                    scale: index === currentIndex ? 1.05 : 1,
                    zIndex: index === currentIndex ? 10 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Frame */}
                  <div className="relative bg-gradient-to-br from-amber-800 to-amber-900 p-4 shadow-xl rounded-sm h-full">
                    <div className="relative bg-white p-2 h-full shadow-inner">
                      <img src={image?.src || "/placeholder.svg"} alt={image?.alt || "Gallery image"} className="w-full h-full object-cover" />

                      {/* Gallery Spotlight */}
                      {index === currentIndex && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/20 to-transparent pointer-events-none"></div>
                      )}
                    </div>

                    {/* Name Plate */}
                    {index === currentIndex && image?.caption && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-yellow-100 px-3 py-1 rounded text-xs font-serif shadow-lg">
                        {image.caption}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "film-strip":
        return (
          <div className="relative h-full bg-black rounded-lg overflow-hidden">
            {/* Film Strip Background */}
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-800 to-gray-700">
              {/* Film Holes */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-black rounded-full left-1/2 transform -translate-x-1/2"
                  style={{ top: `${i * 10 + 5}%` }}
                ></div>
              ))}
            </div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-800 to-gray-700">
              {/* Film Holes */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-black rounded-full left-1/2 transform -translate-x-1/2"
                  style={{ top: `${i * 10 + 5}%` }}
                ></div>
              ))}
            </div>

            {/* Film Frames */}
            <div className="relative mx-8 h-full flex items-center overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {displayData.images.map((image, index) => (
                  <div key={image?.id || index} className="flex-shrink-0 w-full h-full relative">
                    <div className="relative h-full bg-gray-900 border-2 border-gray-600 mx-2">
                      <img src={image?.src || "/placeholder.svg"} alt={image?.alt || "Film frame"} className="w-full h-full object-cover" />

                      {/* Frame Number */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-mono">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "magazine-spread":
        return (
          <div className="relative h-full bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Magazine Binding */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-300 to-gray-500 transform -translate-x-1/2 shadow-lg z-10"></div>

            <div className="flex h-full">
              {/* Left Page */}
              <div className="w-1/2 p-8 bg-gradient-to-br from-white to-gray-50">
                <div className="h-full flex flex-col">
                  {/* Previous Image */}
                  {currentIndex > 0 && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
                      <img
                        src={displayData.images[currentIndex - 1]?.src || "/placeholder.svg"}
                        alt={displayData.images[currentIndex - 1]?.alt || "Magazine image"}
                        className="w-full h-full object-cover rounded shadow-lg"
                      />
                      {displayData.images[currentIndex - 1]?.caption && (
                        <p className="mt-2 text-sm text-gray-600 font-serif italic">{displayData.images[currentIndex - 1]?.caption}</p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right Page */}
              <div className="w-1/2 p-8 bg-gradient-to-bl from-white to-gray-50">
                <div className="h-full flex flex-col">
                  {/* Current Image */}
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1"
                  >
                    <img
                      src={displayData.images[currentIndex]?.src || "/placeholder.svg"}
                      alt={displayData.images[currentIndex]?.alt || "Magazine image"}
                      className="w-full h-full object-cover rounded shadow-lg"
                    />
                    {displayData.images[currentIndex]?.caption && (
                      <p className="mt-2 text-sm text-gray-600 font-serif italic">{displayData.images[currentIndex]?.caption}</p>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Page Numbers */}
            <div className="absolute bottom-4 left-8 text-xs text-gray-400 font-serif">{currentIndex * 2 + 1}</div>
            <div className="absolute bottom-4 right-8 text-xs text-gray-400 font-serif">{currentIndex * 2 + 2}</div>
          </div>
        );

      case "memory-board":
        return (
          <div
            className="relative h-full rounded-lg p-6 overflow-hidden"
            style={{
              backgroundColor:
                displayData.backgroundColor === "transparent" || displayData.backgroundColor === "#ffffff" ? "#fef3c7" : displayData.backgroundColor,
            }}
          >
            {/* Push Pins */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
            <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>

            <div className="relative h-full">
              {/* Scattered Photos */}
              {displayData.images.slice(0, 6).map((image, index) => (
                <motion.div
                  key={image?.id || index}
                  className="absolute cursor-pointer group"
                  style={{
                    left: `${(index * 15 + 10) % 70}%`,
                    top: `${(index * 20 + 5) % 60}%`,
                    transform: `rotate(${(index - 2) * 8}deg)`,
                    zIndex: index === currentIndex ? 10 : 1,
                  }}
                  onClick={() => setCurrentIndex(index)}
                  whileHover={{ scale: 1.1, rotate: 0 }}
                  animate={{
                    scale: index === currentIndex ? 1.2 : 1,
                    rotate: index === currentIndex ? 0 : (index - 2) * 8,
                  }}
                >
                  {/* Polaroid Style */}
                  <div className="bg-white p-3 pb-8 shadow-xl group-hover:shadow-2xl transition-shadow">
                    <img src={image?.src || "/placeholder.svg"} alt={image?.alt || "Memory photo"} className="w-32 h-32 object-cover" />

                    {/* Push Pin */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full shadow-md"></div>

                    {/* Handwritten Caption */}
                    {image?.caption && <div className="mt-2 text-xs text-gray-700 text-center">{image.caption}</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "vintage-slideshow":
        return (
          <div className="relative h-full bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 rounded-lg overflow-hidden">
            {/* Projector Light */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-yellow-200/30 to-transparent rounded-b-full"></div>

            {/* Screen */}
            <div className="relative mx-8 my-8 h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded shadow-2xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 1.2, rotateX: 15 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="relative h-full p-8"
                >
                  <img
                    src={displayData.images[currentIndex]?.src || "/placeholder.svg"}
                    alt={displayData.images[currentIndex]?.alt || "Carousel image"}
                    className="w-full h-full object-contain"
                    style={{ filter: "sepia(0.3) contrast(1.1) brightness(0.9)" }}
                  />

                  {/* Slide Number */}
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded font-mono">SLIDE {currentIndex + 1}</div>
                </motion.div>
              </AnimatePresence>

              {/* Projector Beam Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-100/10 via-transparent to-transparent pointer-events-none"></div>
            </div>

            {/* Projector Base */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg shadow-lg"></div>
          </div>
        );

      default:
        return (
          <div className="relative h-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: displayData.transition === "slide" ? 300 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: displayData.transition === "slide" ? -300 : 0 }}
                transition={{ duration: 0.5 }}
                className="h-full flex items-center justify-center"
              >
                <CarouselImageItem
                  image={displayData.images[currentIndex]}
                  index={currentIndex}
                  isActive={true}
                  data={displayData}
                  onUpdate={handleImageUpdate}
                  isEditable={isEditable}
                  onRemove={() => handleRemoveImage(currentIndex)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        );
    }
  };

  return (
    <div className={cn("relative w-full", getShadowClass())} style={getContainerStyles()}>
      {/* Settings Panel */}
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-background shadow-sm">
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto p-0">{renderSettingsPanel()}</PopoverContent>
        </Popover>
      )}

      {/* Main Content */}
      {isEditable ? (
        // Simple version for edit mode
        <div className="p-6">
          {displayData.title && <h3 className="text-2xl font-bold text-center mb-6">{displayData.title}</h3>}
          {renderSimpleCarousel()}
        </div>
      ) : (
        // Full carousel for view mode
        <div className="p-6">
          {/* Title */}
          {displayData.title && <h3 className="text-2xl font-bold text-center mb-6">{displayData.title}</h3>}

          {/* Carousel Content */}
          <div className="relative" style={{ height: `${displayData.height}px` }}>
            {renderCarouselContent()}

            {/* Navigation Arrows */}
            {displayData.showArrows && displayData.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          {/* Dots Navigation */}
          {displayData.showDots && displayData.images.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {displayData.images.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all",
                    index === currentIndex ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Gallery Modal */}
      <ImageGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectImage={handleAddImage}
        onSelectImages={handleAddImages}
        allowMultiple={true}
      />
    </div>
  );
}

// Individual Image Item Component
function CarouselImageItem({
  image,
  index,
  isActive,
  data,
  onUpdate,
  isEditable,
  onRemove,
}: {
  image: CarouselImage;
  index: number;
  isActive: boolean;
  data: any;
  onUpdate: (index: number, updates: Partial<CarouselImage>) => void;
  isEditable: boolean;
  onRemove: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Ensure image has proper defaults
  const safeImage = {
    id: image.id || "",
    src: image.src || "",
    alt: image.alt || "",
    caption: image.caption || "",
    hoverText: image.hoverText || "",
    rotation: image.rotation ?? 0,
    scale: image.scale ?? 1,
    filter: image.filter || "none",
  };

  const getHoverEffect = () => {
    if (!data.enableHover || !isHovered) return {};

    switch (data.hoverEffect) {
      case "zoom":
        return { scale: 1.1 };
      case "rotate":
        return { rotate: 5 };
      case "flip":
        return { rotateY: 180 };
      case "tilt":
        return { rotate: -5, scale: 1.05 };
      default:
        return { scale: 1.05 };
    }
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={getHoverEffect()}
      transition={{ duration: 0.3 }}
    >
      <img
        src={safeImage.src || "/placeholder.svg"}
        alt={safeImage.alt}
        className="w-full h-full object-cover"
        style={{
          borderRadius: `${data.borderRadius}px`,
          filter: safeImage.filter,
        }}
      />

      {/* Hover Overlay */}
      {data.enableHover && isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-center p-4"
          style={{ borderRadius: `${data.borderRadius}px` }}
        >
          {safeImage.hoverText && <p className="text-lg font-medium">{safeImage.hoverText}</p>}
        </motion.div>
      )}

      {/* Caption */}
      {data.showCaptions && safeImage.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm">{safeImage.caption}</p>
        </div>
      )}

      {/* Edit Controls */}
      {isEditable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Settings2 className="h-3 w-3" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Image Edit Modal */}
      {isEditing && (
        <Popover open={isEditing} onOpenChange={setIsEditing}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Edit Image</h4>

              <div className="space-y-2">
                <Label>Alt Text</Label>
                <Input value={safeImage.alt} onChange={(e) => onUpdate(index, { alt: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Input value={safeImage.caption} onChange={(e) => onUpdate(index, { caption: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Hover Text</Label>
                <Textarea value={safeImage.hoverText} onChange={(e) => onUpdate(index, { hoverText: e.target.value })} rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Rotation (degrees)</Label>
                <Slider value={[safeImage.rotation]} onValueChange={([value]) => onUpdate(index, { rotation: value })} min={-45} max={45} step={5} />
              </div>

              <div className="space-y-2">
                <Label>Scale</Label>
                <Slider value={[safeImage.scale]} onValueChange={([value]) => onUpdate(index, { scale: value })} min={0.5} max={2} step={0.1} />
              </div>

              <Button onClick={() => setIsEditing(false)} className="w-full">
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </motion.div>
  );
}
