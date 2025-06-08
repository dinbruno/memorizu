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
  X,
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
  x?: number;
  y?: number;
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
    layout: "memory-board" | "slideshow" | "masonry" | "collage";
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
    // Grid layout options
    gridColumns: number;
    gridGap: number;
    showImageNumbers: boolean;
    // Collage background
    collageBackground: string;
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
    showDots: data.showDots ?? (data.layout === "collage" || data.layout === "masonry" ? false : true),
    showArrows: data.showArrows ?? (data.layout === "collage" || data.layout === "masonry" ? false : true),
    showCaptions: data.showCaptions ?? true,
    enableHover: data.enableHover ?? true,
    hoverEffect: data.hoverEffect || "zoom",
    layout: data.layout || "memory-board",
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
    gridColumns: data.gridColumns ?? 3,
    gridGap: data.gridGap ?? 16,
    showImageNumbers: data.showImageNumbers ?? false,
    collageBackground: data.collageBackground ?? "transparent",
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
      layout: sourceData.layout || "memory-board",
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
      gridColumns: sourceData.gridColumns ?? 3,
      gridGap: sourceData.gridGap ?? 16,
      showImageNumbers: sourceData.showImageNumbers ?? false,
      collageBackground: sourceData.collageBackground ?? "transparent",
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
    let updatedData = { ...localData, [field]: value };

    // Auto-adjust dots and arrows for collage and masonry layouts
    if (field === "layout") {
      if (value === "collage" || value === "masonry") {
        updatedData = {
          ...updatedData,
          showDots: false,
          showArrows: false,
        };
      }
    }

    setLocalData(updatedData);

    // Apply changes immediately if onUpdate is available
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
    const imageIndex = localData.images.length;
    const newImage: CarouselImage = {
      id: Date.now().toString(),
      src: imageUrl,
      alt: "Carousel image",
      caption: "",
      hoverText: "",
      rotation: displayData.randomRotation ? Math.random() * displayData.maxRotation * 2 - displayData.maxRotation : 0,
      scale: 1,
      filter: "none",
      x: (imageIndex * 15 + 10) % 70,
      y: (imageIndex * 20 + 5) % 60,
    };
    const updatedImages = [...localData.images, newImage];
    handleSettingsChange("images", updatedImages);
  };

  const handleAddImages = (imageUrls: string[]) => {
    const startIndex = localData.images.length;
    const newImages: CarouselImage[] = imageUrls.map((imageUrl, index) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      src: imageUrl,
      alt: "Carousel image",
      caption: "",
      hoverText: "",
      rotation: displayData.randomRotation ? Math.random() * displayData.maxRotation * 2 - displayData.maxRotation : 0,
      scale: 1,
      filter: "none",
      x: ((startIndex + index) * 15 + 10) % 70,
      y: ((startIndex + index) * 20 + 5) % 60,
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

  const randomizePositions = () => {
    const updatedImages = localData.images.map((image) => ({
      ...image,
      x: Math.random() * 70,
      y: Math.random() * 60,
      rotation: displayData.randomRotation ? Math.random() * displayData.maxRotation * 2 - displayData.maxRotation : image.rotation || 0,
    }));
    handleSettingsChange("images", updatedImages);
  };

  const resetPositions = () => {
    const updatedImages = localData.images.map((image, index) => ({
      ...image,
      x: (index * 15 + 10) % 70,
      y: (index * 20 + 5) % 60,
      rotation: displayData.randomRotation ? Math.random() * displayData.maxRotation * 2 - displayData.maxRotation : 0,
    }));
    handleSettingsChange("images", updatedImages);
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

      {/* Image Management Section */}
      {localData.images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Images className="h-4 w-4" />
            Manage Images ({localData.images.length})
          </div>

          <div className="space-y-3 ">
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {localData.images.map((image, index) => (
                <ImageThumbnail
                  key={image.id || index}
                  image={image}
                  index={index}
                  isActive={index === currentIndex}
                  layout={localData.layout}
                  onEdit={(updates: Partial<CarouselImage>) => handleImageUpdate(index, updates)}
                  onRemove={() => handleRemoveImage(index)}
                  onSelect={() => setCurrentIndex(index)}
                />
              ))}
            </div>

            {localData.layout === "memory-board" && (
              <div className="space-y-2 border-t pt-2">
                <Label className="text-sm font-medium">Memory Board Layout Tools</Label>
                <div className="flex gap-2 flex-col">
                  <Button variant="outline" size="sm" onClick={randomizePositions} className="flex-1">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Randomize Positions
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetPositions} className="flex-1">
                    <Layout className="h-4 w-4 mr-2" />
                    Reset Positions
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">💡 Click on any image above to edit its position, or drag images in the preview</p>
              </div>
            )}
          </div>
        </div>
      )}

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
                <SelectItem value="slideshow">🎥 Slideshow</SelectItem>
                <SelectItem value="masonry">🧱 Masonry</SelectItem>
                <SelectItem value="collage">🎨 Collage</SelectItem>
                <SelectItem value="memory-board">📌 Memory Board</SelectItem>
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

          {localData.layout === "collage" && (
            <div className="space-y-2">
              <Label>Collage Background</Label>
              <Select value={localData.collageBackground} onValueChange={(value) => handleSettingsChange("collageBackground", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="gradient">Light Gradient</SelectItem>
                  <SelectItem value="#ffffff">White</SelectItem>
                  <SelectItem value="#f8fafc">Light Gray</SelectItem>
                  <SelectItem value="#f1f5f9">Slate</SelectItem>
                  <SelectItem value="#fef3c7">Warm</SelectItem>
                  <SelectItem value="#ecfdf5">Cool</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
          Close Settings
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
      case "slideshow":
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img
                  src={displayData.images[currentIndex]?.src || "/placeholder.svg"}
                  alt={displayData.images[currentIndex]?.alt || "Slideshow image"}
                  className="max-w-full max-h-full object-contain"
                  style={{ borderRadius: `${displayData.borderRadius}px` }}
                />

                {/* Caption overlay */}
                {displayData.showCaptions && displayData.images[currentIndex]?.caption && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded">
                    <p className="text-sm">{displayData.images[currentIndex]?.caption}</p>
                  </div>
                )}

                {/* Image counter */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  {currentIndex + 1} / {displayData.images.length}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        );

      case "masonry":
        return (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {displayData.images.map((image, index) => (
              <motion.div
                key={image?.id || index}
                className="relative group cursor-pointer break-inside-avoid mb-4"
                onClick={() => setCurrentIndex(index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative overflow-hidden" style={{ borderRadius: `${displayData.borderRadius}px` }}>
                  <img
                    src={image?.src || "/placeholder.svg"}
                    alt={image?.alt || "Masonry image"}
                    className="w-full h-auto object-cover"
                    style={{ borderRadius: `${displayData.borderRadius}px` }}
                  />

                  {/* Active indicator */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 ring-2 ring-primary bg-primary/10" style={{ borderRadius: `${displayData.borderRadius}px` }} />
                  )}

                  {/* Caption */}
                  {displayData.showCaptions && image?.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs">{image.caption}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case "collage":
        return (
          <div
            className="relative w-full h-full rounded-lg overflow-hidden p-4"
            style={{
              background:
                displayData.collageBackground === "transparent"
                  ? "transparent"
                  : displayData.collageBackground === "gradient"
                  ? "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)"
                  : displayData.collageBackground,
            }}
          >
            {displayData.images.slice(0, 8).map((image, index) => {
              // Create dynamic positioning for collage effect
              const positions = [
                { top: "10%", left: "5%", rotation: -5, scale: 1.1 },
                { top: "15%", right: "10%", rotation: 8, scale: 0.9 },
                { top: "40%", left: "15%", rotation: -12, scale: 1.0 },
                { top: "35%", right: "5%", rotation: 15, scale: 1.2 },
                { bottom: "25%", left: "8%", rotation: 7, scale: 0.95 },
                { bottom: "20%", right: "15%", rotation: -10, scale: 1.05 },
                { bottom: "5%", left: "30%", rotation: 3, scale: 0.85 },
                { bottom: "10%", right: "25%", rotation: -8, scale: 1.15 },
              ];

              const position = positions[index] || positions[0];

              return (
                <motion.div
                  key={image?.id || index}
                  className="absolute cursor-pointer group"
                  style={{
                    ...position,
                    transform: `rotate(${position.rotation}deg) scale(${position.scale})`,
                    zIndex: index === currentIndex ? 10 : 1,
                  }}
                  onClick={() => setCurrentIndex(index)}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: position.scale }}
                  transition={{ delay: index * 0.2, type: "spring" }}
                  whileHover={{ scale: position.scale * 1.1, rotate: 0 }}
                >
                  {/* Polaroid style */}
                  <div className="bg-white p-3 pb-8 shadow-xl group-hover:shadow-2xl transition-shadow">
                    <img src={image?.src || "/placeholder.svg"} alt={image?.alt || "Collage image"} className="w-32 h-32 object-cover" />

                    {/* Tape effect */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-yellow-200 opacity-80 rotate-12"></div>

                    {/* Active indicator */}
                    {index === currentIndex && <div className="absolute inset-0 ring-2 ring-primary bg-primary/10 rounded" />}

                    {/* Caption */}
                    {image?.caption && <div className="mt-2 text-xs text-gray-700 text-center truncate">{image.caption}</div>}
                  </div>
                </motion.div>
              );
            })}
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
              {displayData.images.slice(0, 6).map((image, index) => {
                const safeImage = {
                  id: image?.id || index.toString(),
                  src: image?.src || "/placeholder.svg",
                  alt: image?.alt || "Memory photo",
                  caption: image?.caption || "",
                  x: image?.x ?? (index * 15 + 10) % 70,
                  y: image?.y ?? (index * 20 + 5) % 60,
                  rotation: image?.rotation ?? (index - 2) * 8,
                };

                return (
                  <motion.div
                    key={safeImage.id}
                    className="absolute cursor-pointer group select-none"
                    style={{
                      left: `${safeImage.x}%`,
                      top: `${safeImage.y}%`,
                      zIndex: index === currentIndex ? 10 : 1,
                    }}
                    drag={isEditable}
                    dragMomentum={false}
                    dragElastic={0}
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    onDragEnd={(event, info) => {
                      if (!isEditable) return;

                      const target = event.target as HTMLElement;
                      const container = target?.closest('[class*="relative h-full"]') as HTMLElement;
                      if (!container) return;

                      const containerRect = container.getBoundingClientRect();
                      const newX = Math.max(0, Math.min(70, ((info.point.x - containerRect.left) / containerRect.width) * 100));
                      const newY = Math.max(0, Math.min(60, ((info.point.y - containerRect.top) / containerRect.height) * 100));

                      handleImageUpdate(index, { x: newX, y: newY });
                    }}
                    onClick={() => setCurrentIndex(index)}
                    whileHover={{ scale: 1.1, rotate: 0 }}
                    whileDrag={{ scale: 1.1, rotate: 0, zIndex: 20 }}
                    animate={{
                      scale: index === currentIndex ? 1.2 : 1,
                      rotate: index === currentIndex ? 0 : safeImage.rotation,
                    }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  >
                    {/* Polaroid Style */}
                    <div className="bg-white p-3 pb-8 shadow-xl group-hover:shadow-2xl transition-shadow">
                      <img src={safeImage.src} alt={safeImage.alt} className="w-32 h-32 object-cover pointer-events-none" draggable={false} />

                      {/* Push Pin */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full shadow-md"></div>

                      {/* Drag Indicator */}
                      {isEditable && (
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-4 h-4 bg-black/20 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}

                      {/* Handwritten Caption */}
                      {safeImage.caption && <div className="mt-2 text-xs text-gray-700 text-center">{safeImage.caption}</div>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
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

// Position Edit Modal Component
function PositionEditModal({
  image,
  index,
  onSave,
  onClose,
}: {
  image: CarouselImage & { x: number; y: number; rotation: number };
  index: number;
  onSave: (newPosition: { x: number; y: number }) => void;
  onClose: () => void;
}) {
  const [tempPosition, setTempPosition] = useState({ x: image.x, y: image.y });
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-[600px] h-[500px] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Image Position</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Drag the image to position it on the memory board. Current: {Math.round(tempPosition.x)}%, {Math.round(tempPosition.y)}%
        </div>

        {/* Simulated Memory Board */}
        <div className="relative w-full h-80 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg border-2 border-dashed border-yellow-400 overflow-hidden">
          {/* Push Pins for reference */}
          <div className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-yellow-500 rounded-full"></div>

          {/* Draggable Image */}
          <motion.div
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              left: `${tempPosition.x}%`,
              top: `${tempPosition.y}%`,
              transform: `rotate(${image.rotation}deg)`,
            }}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(event, info) => {
              setIsDragging(false);
              const target = event.target as HTMLElement;
              const container = target?.closest('[class*="bg-gradient-to-br"]') as HTMLElement;
              if (!container) return;

              const containerRect = container.getBoundingClientRect();
              const newX = Math.max(0, Math.min(75, ((info.point.x - containerRect.left) / containerRect.width) * 100));
              const newY = Math.max(0, Math.min(65, ((info.point.y - containerRect.top) / containerRect.height) * 100));

              setTempPosition({ x: newX, y: newY });
            }}
            whileDrag={{ scale: 1.1, zIndex: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Polaroid Style */}
            <div className="bg-white p-2 pb-6 shadow-lg">
              <img src={image.src} alt={image.alt} className="w-24 h-24 object-cover pointer-events-none" draggable={false} />

              {/* Push Pin */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-red-400 rounded-full"></div>

              {/* Image number */}
              <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1 py-0.5 rounded">#{index + 1}</div>

              {/* Drag indicator */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                {isDragging ? "Release to place" : "Drag me!"}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <Button onClick={() => onSave(tempPosition)} className="flex-1">
            Save Position
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// Image Thumbnail Component for Settings Panel
function ImageThumbnail({
  image,
  index,
  isActive,
  layout,
  onEdit,
  onRemove,
  onSelect,
}: {
  image: CarouselImage;
  index: number;
  isActive: boolean;
  layout: string;
  onEdit: (updates: Partial<CarouselImage>) => void;
  onRemove: () => void;
  onSelect: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPositionEditing, setIsPositionEditing] = useState(false);

  // Extract filename from src for default alt text
  const getImageName = (src: string) => {
    if (!src) return "Image";
    const filename = src.split("/").pop() || src;
    return filename.split(".")[0] || "Image";
  };

  const safeImage = {
    id: image.id || "",
    src: image.src || "/placeholder.svg",
    alt: image.alt || getImageName(image.src || ""),
    caption: image.caption || "",
    x: image.x ?? 0,
    y: image.y ?? 0,
    rotation: image.rotation ?? 0,
  };

  return (
    <div
      className={cn(
        "relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all",
        isActive ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
      )}
    >
      <div className="aspect-square relative bg-muted" onClick={onSelect}>
        <img src={safeImage.src} alt={safeImage.alt} className="w-full h-full object-cover" />

        {/* Active indicator */}
        {isActive && (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">Active</div>
          </div>
        )}

        {/* Index number */}
        <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">{index + 1}</div>

        {/* Controls */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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

      {/* Quick info */}
      <div className="p-2 bg-muted/30 text-xs">
        <div className="truncate font-medium">{safeImage.caption || safeImage.alt || `Image ${index + 1}`}</div>
        {layout === "memory-board" && (
          <div className="text-muted-foreground mt-1">
            Position: {Math.round(safeImage.x)}%, {Math.round(safeImage.y)}%
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <Popover open={isEditing} onOpenChange={setIsEditing}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <h4 className="font-medium">Edit Image #{index + 1}</h4>
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Input value={safeImage.caption} onChange={(e) => onEdit({ caption: e.target.value })} placeholder="Add a caption..." />
              </div>

              {layout === "memory-board" && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Position on Board</Label>

                    <div className="text-xs text-muted-foreground mb-2">
                      Current position: {Math.round(safeImage.x)}%, {Math.round(safeImage.y)}%
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setIsPositionEditing(true);
                      }}
                      className="w-full"
                    >
                      <Layout className="h-4 w-4 mr-2" />
                      Edit Position Visually
                    </Button>

                    <div className="space-y-2">
                      <Label className="text-xs">Rotation (degrees)</Label>
                      <Slider value={[safeImage.rotation]} onValueChange={([value]) => onEdit({ rotation: value })} min={-45} max={45} step={5} />
                      <div className="text-xs text-muted-foreground">{Math.round(safeImage.rotation)}°</div>
                    </div>
                  </div>
                </>
              )}

              <Button onClick={() => setIsEditing(false)} className="w-full">
                Done
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Position Editing Modal */}
      {isPositionEditing && (
        <PositionEditModal
          image={safeImage}
          index={index}
          onSave={(newPosition) => {
            onEdit(newPosition);
            setIsPositionEditing(false);
          }}
          onClose={() => setIsPositionEditing(false)}
        />
      )}
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
    x: image.x ?? 0,
    y: image.y ?? 0,
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

              {data.layout === "memory-board" && (
                <>
                  <div className="space-y-2">
                    <Label>Position X (%)</Label>
                    <Slider value={[safeImage.x]} onValueChange={([value]) => onUpdate(index, { x: value })} min={0} max={80} step={1} />
                    <div className="text-xs text-muted-foreground">{Math.round(safeImage.x)}%</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Position Y (%)</Label>
                    <Slider value={[safeImage.y]} onValueChange={([value]) => onUpdate(index, { y: value })} min={0} max={70} step={1} />
                    <div className="text-xs text-muted-foreground">{Math.round(safeImage.y)}%</div>
                  </div>
                </>
              )}

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
