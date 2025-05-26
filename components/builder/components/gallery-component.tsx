"use client";

import type React from "react";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings2, Trash2, Upload } from "lucide-react";
import { ImageGallery } from "../image-gallery";

// Custom styles for the handwriting font effect
const handwritingStyle = {
  fontFamily: 'cursive, "Comic Sans MS", "Brush Script MT", fantasy',
  fontStyle: "italic",
};

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
}

interface GalleryComponentProps {
  data: {
    title: string;
    images: GalleryImage[];
    columns: number;
    gap: "small" | "medium" | "large";
    layout: "grid" | "polaroid-clothesline";
  };
  onUpdate?: (data: any) => void;
  isEditable?: boolean;
  isInlineEdit?: boolean;
}

export function GalleryComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: GalleryComponentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [localData, setLocalData] = useState({ ...data, layout: data.layout || "polaroid-clothesline" });
  const [titleEditing, setTitleEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(data.title);

  // Use localData for displaying content when editing, otherwise use data
  const displayData = isEditable ? localData : { ...data, layout: data.layout || "polaroid-clothesline" };

  // Generate random rotation for polaroids
  const getRandomRotation = (index: number) => {
    // Use index as seed for consistent rotation
    const rotations = [-8, -5, -3, -1, 1, 3, 5, 8, -6, 6, -4, 4, -2, 2];
    return rotations[index % rotations.length];
  };

  // Generate random vertical offset for clothesline effect
  const getRandomOffset = (index: number) => {
    const offsets = [0, 10, -5, 15, -10, 5, -15, 8, -8, 12, -12, 3, -3, 7];
    return offsets[index % offsets.length];
  };

  const handleSettingsChange = (field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    if (onUpdate) {
      onUpdate(updatedData);
    }
  };

  const handleImageChange = (index: number, field: string, value: string) => {
    const updatedImages = [...localData.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    handleSettingsChange("images", updatedImages);
  };

  const handleAddImageFromGallery = () => {
    setEditingImageIndex(null); // Adding a new image
    setIsGalleryOpen(true);
  };

  const handleEditImageFromGallery = (index: number) => {
    setEditingImageIndex(index); // Editing an existing image
    setIsGalleryOpen(true);
  };

  const handleImageSelect = (imageUrl: string) => {
    if (editingImageIndex !== null) {
      // Replace existing image
      const updatedImages = [...localData.images];
      updatedImages[editingImageIndex] = {
        ...updatedImages[editingImageIndex],
        src: imageUrl,
      };
      handleSettingsChange("images", updatedImages);
    } else {
      // Add new image
      const newImage = {
        src: imageUrl,
        alt: "Gallery image",
        caption: "Image from gallery",
      };
      handleSettingsChange("images", [...localData.images, newImage]);
    }
    setIsGalleryOpen(false);
    setEditingImageIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...localData.images];
    updatedImages.splice(index, 1);
    handleSettingsChange("images", updatedImages);
  };

  const handleSaveSettings = () => {
    if (onUpdate) {
      onUpdate(localData);
    }
    setIsSettingsOpen(false);
  };

  const handleTitleDoubleClick = () => {
    if (isEditable) {
      setTitleEditing(true);
    }
  };

  const handleTitleBlur = () => {
    setTitleEditing(false);
    if (onUpdate && editingTitle !== data.title) {
      onUpdate({ ...data, title: editingTitle });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setTitleEditing(false);
      if (onUpdate && editingTitle !== data.title) {
        onUpdate({ ...data, title: editingTitle });
      }
    }
  };

  const gapClasses = {
    small: "gap-2",
    medium: "gap-4",
    large: "gap-8",
  };

  const getGridCols = (columns: number) => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-3";
    }
  };

  if (isInlineEdit) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Gallery Title</Label>
          <Input value={localData.title} onChange={(e) => handleSettingsChange("title", e.target.value)} placeholder="Gallery title" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Layout Style</Label>
            <Select value={localData.layout} onValueChange={(value) => handleSettingsChange("layout", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="polaroid-clothesline">Polaroid Clothesline</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {localData.layout === "grid" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Columns</Label>
                <Select value={localData.columns.toString()} onValueChange={(value) => handleSettingsChange("columns", Number.parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gap Size</Label>
                <Select value={localData.gap} onValueChange={(value) => handleSettingsChange("gap", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Images ({localData.images.length})</Label>
            <Button variant="outline" size="sm" onClick={handleAddImageFromGallery}>
              <Upload className="h-4 w-4 mr-2" />
              Add from Gallery
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-3">
            {localData.images.map((image, index) => (
              <div key={index} className="border rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">Image {index + 1}</h5>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditImageFromGallery(index)} title="Replace with image from gallery">
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveImage(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Image Preview</Label>
                    <div className="w-full h-20 bg-muted rounded border overflow-hidden">
                      <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <Input value={image.alt} onChange={(e) => handleImageChange(index, "alt", e.target.value)} placeholder="Alt text" />
                  <Input value={image.caption} onChange={(e) => handleImageChange(index, "caption", e.target.value)} placeholder="Caption" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSaveSettings} className="w-full">
          Apply Changes
        </Button>

        <ImageGallery
          isOpen={isGalleryOpen}
          onClose={() => {
            setIsGalleryOpen(false);
            setEditingImageIndex(null);
          }}
          onSelectImage={handleImageSelect}
        />
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
              <span className="sr-only">Gallery settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="layout">Layout Style</Label>
                <Select value={localData.layout} onValueChange={(value) => handleSettingsChange("layout", value)}>
                  <SelectTrigger id="layout">
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="polaroid-clothesline">Polaroid Clothesline</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {localData.layout === "grid" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="columns">Columns</Label>
                    <Select value={localData.columns.toString()} onValueChange={(value) => handleSettingsChange("columns", Number.parseInt(value))}>
                      <SelectTrigger id="columns">
                        <SelectValue placeholder="Select columns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gap">Gap Size</Label>
                    <Select value={localData.gap} onValueChange={(value) => handleSettingsChange("gap", value)}>
                      <SelectTrigger id="gap">
                        <SelectValue placeholder="Select gap size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Images</h4>
                  <Button variant="outline" size="sm" onClick={handleAddImageFromGallery}>
                    <Upload className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {localData.images.map((image, index) => (
                  <div key={index} className="border rounded-md p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium">Image {index + 1}</h5>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleEditImageFromGallery(index)} title="Replace with image from gallery">
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveImage(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Image Preview</Label>
                        <div className="w-full h-16 bg-muted rounded border overflow-hidden">
                          <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <Input value={image.alt} onChange={(e) => handleImageChange(index, "alt", e.target.value)} placeholder="Alt text" />
                      <Input value={image.caption} onChange={(e) => handleImageChange(index, "caption", e.target.value)} placeholder="Caption" />
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className="space-y-6">
        {titleEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-2xl font-bold w-full bg-transparent border-none outline-none focus:ring-0"
            autoFocus
          />
        ) : (
          <h3 className={cn("text-2xl font-bold text-center", isEditable ? "cursor-text" : "")} onDoubleClick={handleTitleDoubleClick}>
            {displayData.title}
          </h3>
        )}

        {displayData.layout === "polaroid-clothesline" ? (
          <div className="relative">
            {/* Polaroid photos */}
            <div className="flex flex-wrap justify-center gap-6 pt-4 pb-4">
              {displayData.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group transition-all duration-300 hover:scale-105 hover:z-10"
                  style={{
                    transform: `rotate(${getRandomRotation(index)}deg) translateY(${getRandomOffset(index)}px)`,
                    transformOrigin: "top center",
                  }}
                >
                  {/* Clothespin */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="w-3 h-6 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-sm shadow-sm border border-yellow-300">
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />
                    </div>
                  </div>

                  {/* Polaroid frame */}
                  <div className="bg-white p-3 pb-12 shadow-xl border border-gray-200 transition-shadow duration-300 group-hover:shadow-2xl">
                    <div className="relative overflow-hidden bg-gray-100">
                      <img
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        className="w-48 h-36 object-cover transition-all duration-300 group-hover:brightness-110"
                      />
                    </div>

                    {/* Caption area */}
                    <div className="mt-3 text-center">
                      {image.caption && (
                        <p className="text-sm text-gray-700 leading-relaxed" style={handwritingStyle}>
                          {image.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tape pieces for extra realism */}
                  <div className="absolute -top-2 -left-1 w-6 h-4 bg-yellow-100/80 border border-yellow-200 transform rotate-12 shadow-sm" />
                  <div className="absolute -top-2 -right-1 w-6 h-4 bg-yellow-100/80 border border-yellow-200 transform -rotate-12 shadow-sm" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn("grid", getGridCols(displayData.columns), gapClasses[displayData.gap])}>
            {displayData.images.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-md">
                <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-auto object-cover aspect-[4/3]" />
                {image.caption && <p className="text-sm text-muted-foreground mt-2 text-center">{image.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageGallery
        isOpen={isGalleryOpen}
        onClose={() => {
          setIsGalleryOpen(false);
          setEditingImageIndex(null);
        }}
        onSelectImage={handleImageSelect}
      />
    </div>
  );
}
