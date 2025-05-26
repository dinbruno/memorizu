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
import { Settings2, ChevronLeft, ChevronRight, Play, Pause, ImageIcon, Plus, Trash2, Shuffle } from "lucide-react";
import { ImageGallery } from "../image-gallery";

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
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
}

export function CarouselComponent({ data, onUpdate, isEditable = false }: CarouselComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(data.autoplay);
  const [localData, setLocalData] = useState({ ...data });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const displayData = isEditable ? localData : data;

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && displayData.images.length > 1) {
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
  }, [isPlaying, displayData.autoplaySpeed, displayData.images.length]);

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
    const shuffled = [...displayData.images].sort(() => Math.random() - 0.5);
    if (onUpdate) {
      onUpdate({ ...displayData, images: shuffled });
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
                      alt={displayData.images[currentIndex]?.alt}
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
                    {displayData.images[currentIndex].caption}
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
              <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 rounded shadow-inner p-6 h-full overflow-hidden">
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
                          alt={displayData.images[currentIndex]?.alt}
                          className="w-full h-auto object-cover"
                          style={{ maxHeight: `${displayData.height - 200}px` }}
                        />

                        {/* Photo Tape */}
                        <div className="absolute -top-2 left-4 w-12 h-6 bg-yellow-200 opacity-80 transform -rotate-12 shadow-sm"></div>
                        <div className="absolute -top-2 right-4 w-12 h-6 bg-yellow-200 opacity-80 transform rotate-12 shadow-sm"></div>
                      </div>

                      {/* Handwritten Caption */}
                      {displayData.showCaptions && displayData.images[currentIndex]?.caption && (
                        <div className="mt-4 text-slate-700 text-lg transform -rotate-1">{displayData.images[currentIndex].caption}</div>
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
                  key={image.id}
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
                      <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />

                      {/* Gallery Spotlight */}
                      {index === currentIndex && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/20 to-transparent pointer-events-none"></div>
                      )}
                    </div>

                    {/* Name Plate */}
                    {index === currentIndex && image.caption && (
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
                  <div key={image.id} className="flex-shrink-0 w-full h-full relative">
                    <div className="relative h-full bg-gray-900 border-2 border-gray-600 mx-2">
                      <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />

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
                        alt={displayData.images[currentIndex - 1]?.alt}
                        className="w-full h-full object-cover rounded shadow-lg"
                      />
                      {displayData.images[currentIndex - 1]?.caption && (
                        <p className="mt-2 text-sm text-gray-600 font-serif italic">{displayData.images[currentIndex - 1].caption}</p>
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
                      alt={displayData.images[currentIndex]?.alt}
                      className="w-full h-full object-cover rounded shadow-lg"
                    />
                    {displayData.images[currentIndex]?.caption && (
                      <p className="mt-2 text-sm text-gray-600 font-serif italic">{displayData.images[currentIndex].caption}</p>
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
          <div className="relative h-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-6 overflow-hidden">
            {/* Push Pins */}
            <div className="absolute top-4 left-4 w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
            <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
            <div className="absolute bottom-4 left-4 w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>

            <div className="relative h-full">
              {/* Scattered Photos */}
              {displayData.images.slice(0, 6).map((image, index) => (
                <motion.div
                  key={image.id}
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
                    <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-32 h-32 object-cover" />

                    {/* Push Pin */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-400 rounded-full shadow-md"></div>

                    {/* Handwritten Caption */}
                    {image.caption && <div className="mt-2 text-xs text-gray-700 text-center">{image.caption}</div>}
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
                    alt={displayData.images[currentIndex]?.alt}
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
    <div className="relative w-full">
      {/* Settings Panel */}
      {isEditable && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-background shadow-sm">
              <Settings2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Carousel Settings</h4>

                {/* Title */}
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={localData.title || ""} onChange={(e) => handleSettingsChange("title", e.target.value)} placeholder="Carousel title" />
                </div>

                {/* Layout */}
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

                {/* Theme */}
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

                {/* Hover Effect */}
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

                {/* Autoplay */}
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

                {/* Random Rotation */}
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

                {/* Height */}
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Slider
                    value={[localData.height]}
                    onValueChange={([value]) => handleSettingsChange("height", value)}
                    min={200}
                    max={800}
                    step={50}
                  />
                  <div className="text-sm text-muted-foreground">{localData.height}px</div>
                </div>

                {/* Border Radius */}
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

                {/* Controls */}
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

              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Main Carousel Container */}
      <div className={cn("rounded-lg border p-6", getThemeClasses())}>
        {/* Title */}
        {displayData.title && <h3 className="text-2xl font-bold text-center mb-6">{displayData.title}</h3>}

        {/* Controls */}
        {isEditable && (
          <div className="flex justify-center gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={() => setIsGalleryOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Images
            </Button>
            {displayData.enableShuffle && (
              <Button variant="outline" size="sm" onClick={shuffleImages}>
                <Shuffle className="h-4 w-4 mr-2" />
                Shuffle
              </Button>
            )}
            {displayData.autoplay && (
              <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            )}
          </div>
        )}

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
        src={image.src || "/placeholder.svg"}
        alt={image.alt}
        className="w-full h-full object-cover"
        style={{
          borderRadius: `${data.borderRadius}px`,
          filter: image.filter || "none",
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
          {image.hoverText && <p className="text-lg font-medium">{image.hoverText}</p>}
        </motion.div>
      )}

      {/* Caption */}
      {data.showCaptions && image.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white text-sm">{image.caption}</p>
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
                <Input value={image.alt} onChange={(e) => onUpdate(index, { alt: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Caption</Label>
                <Input value={image.caption || ""} onChange={(e) => onUpdate(index, { caption: e.target.value })} />
              </div>

              <div className="space-y-2">
                <Label>Hover Text</Label>
                <Textarea value={image.hoverText || ""} onChange={(e) => onUpdate(index, { hoverText: e.target.value })} rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Rotation (degrees)</Label>
                <Slider value={[image.rotation || 0]} onValueChange={([value]) => onUpdate(index, { rotation: value })} min={-45} max={45} step={5} />
              </div>

              <div className="space-y-2">
                <Label>Scale</Label>
                <Slider value={[image.scale || 1]} onValueChange={([value]) => onUpdate(index, { scale: value })} min={0.5} max={2} step={0.1} />
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
