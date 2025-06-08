"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Settings2, Trash2, Upload, GripVertical } from "lucide-react";
import { ImageGallery } from "../image-gallery";
import { useImages } from "@/contexts/images-context";
import { SafeImage } from "@/components/ui/safe-image";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Custom styles for the handwriting font effect
const handwritingStyle = {
  fontFamily: 'cursive, "Comic Sans MS", "Brush Script MT", fantasy',
  fontStyle: "italic",
};

interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  id?: string; // Make id optional for backwards compatibility
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

// Sortable Image Item Component
function SortableImageItem({
  image,
  index,
  onRemove,
  onEdit,
  onChange,
  isInlineEdit = false,
  displayData,
  getRandomRotation,
  getRandomOffset,
}: {
  image: GalleryImage;
  index: number;
  onRemove: (index: number) => void;
  onEdit: (index: number) => void;
  onChange: (index: number, field: string, value: string) => void;
  isInlineEdit?: boolean;
  displayData?: any;
  getRandomRotation?: (index: number) => number;
  getRandomOffset?: (index: number) => number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id || `fallback-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isInlineEdit) {
    return (
      <div ref={setNodeRef} style={style} className="mb-3">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value={`image-${index}`} className="border rounded-md border-b-0">
            <AccordionTrigger className="hover:no-underline px-3 py-2">
              <div className="flex items-center gap-3 w-full">
                <div
                  {...attributes}
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Image preview in header */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded border overflow-hidden flex-shrink-0">
                  <SafeImage
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    fallbackText="Image removed"
                    showBrokenIndicator={false}
                    disableInteraction={true}
                  />
                </div>

                <div className="flex-1 text-left">
                  <h5 className="font-medium text-sm">Image {index + 1}</h5>
                  <p className="text-xs text-muted-foreground truncate">{image.caption || image.alt || "No caption"}</p>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <div
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-1 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                    onClick={() => onEdit(index)}
                    title="Replace with image from gallery"
                  >
                    <Upload className="h-4 w-4" />
                  </div>
                  <div
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-6 w-6 cursor-pointer"
                    onClick={() => onRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Full Image Preview</Label>
                  <div className="w-full h-24 sm:h-32 bg-muted rounded border overflow-hidden">
                    <SafeImage
                      src={image.src || "/placeholder.svg"}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                      fallbackText="Image removed from gallery"
                      isEditable={true}
                      onEdit={() => onEdit(index)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Alt Text</Label>
                  <Input value={image.alt} onChange={(e) => onChange(index, "alt", e.target.value)} placeholder="Alt text" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Caption</Label>
                  <Input value={image.caption} onChange={(e) => onChange(index, "caption", e.target.value)} placeholder="Caption" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }

  // For display mode (polaroid-clothesline or grid)
  if (displayData?.layout === "polaroid-clothesline" && getRandomRotation && getRandomOffset) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          transform: isDragging
            ? CSS.Transform.toString(transform)
            : `rotate(${getRandomRotation(index)}deg) translateY(${getRandomOffset(index)}px)`,
          transformOrigin: "top center",
        }}
        className="relative group transition-all duration-300 hover:scale-105 hover:z-10"
      >
        {/* Clothespin */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-3 h-6 bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-sm shadow-sm border border-yellow-300">
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />
          </div>
        </div>

        {/* Drag handle for polaroids */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-black/50 rounded p-1"
        >
          <GripVertical className="h-4 w-4 text-white" />
        </div>

        {/* Polaroid frame */}
        <div className="bg-white p-2 sm:p-3 pb-6 sm:pb-12 shadow-xl border border-gray-200 transition-shadow duration-300 group-hover:shadow-2xl">
          <div className="relative overflow-hidden bg-gray-100">
            <SafeImage
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              className="w-32 h-24 sm:w-40 sm:h-30 md:w-48 md:h-36 object-cover transition-all duration-300 group-hover:brightness-110"
              fallbackText="Image removed from gallery"
            />
          </div>

          {/* Caption area */}
          <div className="mt-2 sm:mt-3 text-center">
            {image.caption && (
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed" style={handwritingStyle}>
                {image.caption}
              </p>
            )}
          </div>
        </div>

        {/* Tape pieces for extra realism */}
        <div className="absolute -top-2 -left-1 w-6 h-4 bg-yellow-100/80 border border-yellow-200 transform rotate-12 shadow-sm" />
        <div className="absolute -top-2 -right-1 w-6 h-4 bg-yellow-100/80 border border-yellow-200 transform -rotate-12 shadow-sm" />
      </div>
    );
  }

  // Grid layout
  return (
    <div ref={setNodeRef} style={style} className="group relative overflow-hidden rounded-md">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-black/50 rounded p-1"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </div>
      <SafeImage
        src={image.src || "/placeholder.svg"}
        alt={image.alt}
        className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover"
        fallbackText="Image removed from gallery"
      />
      {image.caption && <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 text-center">{image.caption}</p>}
    </div>
  );
}

export function GalleryComponent({ data, onUpdate, isEditable = false, isInlineEdit = false }: GalleryComponentProps) {
  const { loadImages } = useImages();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [localData, setLocalData] = useState(() => {
    // Ensure all images have unique IDs
    const imagesWithIds = data.images.map((img, index) => ({
      ...img,
      id: img.id || `image-${index}-${Date.now()}`,
    }));
    return { ...data, layout: data.layout || "polaroid-clothesline", images: imagesWithIds };
  });

  // Sync localData with props changes to prevent image loss
  useEffect(() => {
    const imagesWithIds = data.images.map((img, index) => ({
      ...img,
      id: img.id || `image-${index}-${Date.now()}`,
    }));

    setLocalData({
      ...data,
      layout: data.layout || "polaroid-clothesline",
      images: imagesWithIds,
    });
  }, [data]);

  // Load images when component mounts (if editable - for gallery selection)
  useEffect(() => {
    if (isEditable) {
      loadImages();
    }
  }, [isEditable, loadImages]);
  const [titleEditing, setTitleEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(data.title);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use localData for displaying content when editing, otherwise use data with ensured IDs
  const displayData = isEditable
    ? localData
    : (() => {
        const imagesWithIds = data.images.map((img, index) => ({
          ...img,
          id: img.id || `image-${index}-${Date.now()}`,
        }));
        return { ...data, layout: data.layout || "polaroid-clothesline", images: imagesWithIds };
      })();

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
    setEditingImageIndex(null); // Adding new images
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
        id: `image-new-${Date.now()}`,
      };
      handleSettingsChange("images", [...localData.images, newImage]);
    }
    setIsGalleryOpen(false);
    setEditingImageIndex(null);
  };

  const handleMultipleImageSelect = (imageUrls: string[]) => {
    // Add multiple new images
    const newImages = imageUrls.map((url, index) => ({
      src: url,
      alt: "Gallery image",
      caption: "Image from gallery",
      id: `image-multi-${Date.now()}-${index}`,
    }));
    handleSettingsChange("images", [...localData.images, ...newImages]);
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      let oldIndex = -1;
      let newIndex = -1;

      // Find indices by comparing IDs, handling fallback IDs
      localData.images.forEach((img, index) => {
        const imgId = img.id || `fallback-${index}`;
        if (imgId === active.id) oldIndex = index;
        if (imgId === over.id) newIndex = index;
      });

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedImages = arrayMove(localData.images, oldIndex, newIndex);
        handleSettingsChange("images", reorderedImages);
      }
    }
  };

  const gapClasses = {
    small: "gap-1 sm:gap-2",
    medium: "gap-2 sm:gap-3 md:gap-4",
    large: "gap-4 sm:gap-6 md:gap-8",
  };

  const getGridCols = (columns: number) => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
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
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={localData.images.map((img) => img.id || `fallback-${localData.images.indexOf(img)}`)}
                strategy={verticalListSortingStrategy}
              >
                {localData.images.map((image, index) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    index={index}
                    onRemove={handleRemoveImage}
                    onEdit={handleEditImageFromGallery}
                    onChange={handleImageChange}
                    isInlineEdit={true}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
          onSelectImage={editingImageIndex !== null ? handleImageSelect : undefined}
          onSelectImages={editingImageIndex === null ? handleMultipleImageSelect : undefined}
          allowMultiple={editingImageIndex === null}
        />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 relative">
      {isEditable && !isInlineEdit && (
        <Popover open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-1 right-1 sm:top-2 sm:right-2 h-8 w-8 rounded-full bg-background shadow-sm">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Gallery settings</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-w-[90vw]">
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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={localData.images.map((img) => img.id || `fallback-${localData.images.indexOf(img)}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    {localData.images.map((image, index) => {
                      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
                        id: image.id || `fallback-${index}`,
                      });

                      const style = {
                        transform: CSS.Transform.toString(transform),
                        transition,
                        opacity: isDragging ? 0.5 : 1,
                      };

                      return (
                        <div key={image.id} ref={setNodeRef} style={style} className="mb-2">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={`image-${index}`} className="border rounded-md border-b-0">
                              <AccordionTrigger className="hover:no-underline px-3 py-2">
                                <div className="flex items-center gap-2 w-full">
                                  <div
                                    {...attributes}
                                    {...listeners}
                                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>

                                  {/* Image preview in header */}
                                  <div className="w-10 h-10 bg-muted rounded border overflow-hidden flex-shrink-0">
                                    <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
                                  </div>

                                  <div className="flex-1 text-left">
                                    <h5 className="font-medium text-sm">Image {index + 1}</h5>
                                    <p className="text-xs text-muted-foreground truncate">{image.caption || image.alt || "No caption"}</p>
                                  </div>

                                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                    <div
                                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-3 py-1 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                                      onClick={() => handleEditImageFromGallery(index)}
                                      title="Replace with image from gallery"
                                    >
                                      <Upload className="h-4 w-4" />
                                    </div>
                                    <div
                                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-6 w-6 cursor-pointer"
                                      onClick={() => handleRemoveImage(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-3 pb-3">
                                <div className="space-y-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Full Image Preview</Label>
                                    <div className="w-full h-24 bg-muted rounded border overflow-hidden">
                                      <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-full object-cover" />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Alt Text</Label>
                                    <Input
                                      value={image.alt}
                                      onChange={(e) => handleImageChange(index, "alt", e.target.value)}
                                      placeholder="Alt text"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Caption</Label>
                                    <Input
                                      value={image.caption}
                                      onChange={(e) => handleImageChange(index, "caption", e.target.value)}
                                      placeholder="Caption"
                                    />
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </div>
              <Button onClick={handleSaveSettings} className="w-full">
                Save Changes
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className="space-y-4 sm:space-y-6">
        {titleEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-lg sm:text-xl md:text-2xl font-bold w-full bg-transparent border-none outline-none focus:ring-0"
            autoFocus
          />
        ) : (
          <h3
            className={cn("text-lg sm:text-xl md:text-2xl font-bold text-center", isEditable ? "cursor-text" : "")}
            onDoubleClick={handleTitleDoubleClick}
          >
            {displayData.title}
          </h3>
        )}

        {displayData.layout === "polaroid-clothesline" ? (
          <div className="relative">
            {/* Polaroid photos */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 pt-4 pb-4">
              {isEditable ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext
                    items={displayData.images.map((img) => img.id || `fallback-${displayData.images.indexOf(img)}`)}
                    strategy={rectSortingStrategy}
                  >
                    {displayData.images.map((image, index) => (
                      <SortableImageItem
                        key={image.id}
                        image={image}
                        index={index}
                        onRemove={handleRemoveImage}
                        onEdit={handleEditImageFromGallery}
                        onChange={handleImageChange}
                        displayData={displayData}
                        getRandomRotation={getRandomRotation}
                        getRandomOffset={getRandomOffset}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                displayData.images.map((image, index) => (
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
                    <div className="bg-white p-2 sm:p-3 pb-6 sm:pb-12 shadow-xl border border-gray-200 transition-shadow duration-300 group-hover:shadow-2xl">
                      <div className="relative overflow-hidden bg-gray-100">
                        <img
                          src={image.src || "/placeholder.svg"}
                          alt={image.alt}
                          className="w-32 h-24 sm:w-40 sm:h-30 md:w-48 md:h-36 object-cover transition-all duration-300 group-hover:brightness-110"
                        />
                      </div>

                      {/* Caption area */}
                      <div className="mt-2 sm:mt-3 text-center">
                        {image.caption && (
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed" style={handwritingStyle}>
                            {image.caption}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tape pieces for extra realism */}
                    <div className="absolute -top-2 -left-1 w-6 h-4 bg-yellow-100/80 border border-yellow-200 transform rotate-12 shadow-sm" />
                    <div className="absolute -top-2 -right-1 w-6 h-4 bg-yellow-100/80 border border-yellow-200 transform -rotate-12 shadow-sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className={cn("grid", getGridCols(displayData.columns), gapClasses[displayData.gap], "w-full")}>
            {isEditable ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={displayData.images.map((img) => img.id || `fallback-${displayData.images.indexOf(img)}`)}
                  strategy={rectSortingStrategy}
                >
                  {displayData.images.map((image, index) => (
                    <SortableImageItem
                      key={image.id}
                      image={image}
                      index={index}
                      onRemove={handleRemoveImage}
                      onEdit={handleEditImageFromGallery}
                      onChange={handleImageChange}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              displayData.images.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-md">
                  <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover" />
                  {image.caption && <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 text-center">{image.caption}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ImageGallery
        isOpen={isGalleryOpen}
        onClose={() => {
          setIsGalleryOpen(false);
          setEditingImageIndex(null);
        }}
        onSelectImage={editingImageIndex !== null ? handleImageSelect : undefined}
        onSelectImages={editingImageIndex === null ? handleMultipleImageSelect : undefined}
        allowMultiple={editingImageIndex === null}
      />
    </div>
  );
}
