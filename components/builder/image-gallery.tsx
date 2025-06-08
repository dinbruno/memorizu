"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Upload, X, Search, Trash2, ImageIcon, Grid3X3, List, Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import {
  uploadImage,
  getUserImages,
  deleteImage,
  type UploadedImage,
  getUserStorageQuota,
  checkStorageQuota,
  formatFileSize as formatFileSizeUtil,
} from "@/lib/firebase/storage-service";

interface ImageGalleryProps {
  onSelectImage?: (imageUrl: string) => void;
  onSelectImages?: (imageUrls: string[]) => void;
  onClose: () => void;
  isOpen: boolean;
  allowMultiple?: boolean;
}

export function ImageGallery({ onSelectImage, onSelectImages, onClose, isOpen, allowMultiple = false }: ImageGalleryProps) {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const loadImages = useCallback(async () => {
    if (!user) {
      console.error("No user found when trying to load images");
      setImages([]);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to access your image gallery",
      });
      return;
    }

    try {
      setIsLoading(true);
      console.log("Loading images for user:", user.uid);
      const userImages = await getUserImages(user.uid);
      console.log("Successfully loaded", userImages.length, "images");
      setImages(userImages);
    } catch (error) {
      console.error("Error loading images:", error);
      let errorMessage = "Failed to load images";

      if (error instanceof Error) {
        if (error.message.includes("not authenticated")) {
          errorMessage = "Please log in to access your image gallery";
        } else if (error.message.includes("Permission denied")) {
          errorMessage = "Permission denied. Please check your login status.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (isOpen) {
      loadImages();
    } else {
      // Clear selection when gallery is closed
      setSelectedImages(new Set());
    }
  }, [isOpen, loadImages]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) return;

    setIsUploading(true);

    try {
      // Check total size of files to upload
      const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);

      // Check if user has enough quota for all files
      const hasQuota = await checkStorageQuota(user.uid, totalSize);
      if (!hasQuota) {
        const quota = await getUserStorageQuota(user.uid);
        throw new Error(`Storage quota exceeded. Available space: ${formatFileSizeUtil(quota.available)}`);
      }

      const uploadPromises = Array.from(files).map((file) => {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5MB)`);
        }
        return uploadImage(file, user.uid);
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setImages((prev) => [...uploadedImages, ...prev]);

      toast({
        title: "Success",
        description: `${uploadedImages.length} image(s) uploaded successfully`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: (error as Error).message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!user) return;

    try {
      await deleteImage(user.uid, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setSelectedImages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete image",
      });
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (allowMultiple) {
      setSelectedImages((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(imageUrl)) {
          newSet.delete(imageUrl);
        } else {
          newSet.add(imageUrl);
        }
        return newSet;
      });
    } else {
      onSelectImage?.(imageUrl);
      onClose();
    }
  };

  const handleConfirmSelection = () => {
    if (allowMultiple && onSelectImages) {
      onSelectImages(Array.from(selectedImages));
      setSelectedImages(new Set());
      onClose();
    }
  };

  const handleSelectAll = () => {
    if (allowMultiple) {
      const allImageUrls = filteredImages.map((img) => img.url);
      setSelectedImages(new Set(allImageUrls));
    }
  };

  const handleClearSelection = () => {
    setSelectedImages(new Set());
  };

  const filteredImages = images.filter((image) => image.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[999999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Image Gallery</h2>
            <p className="text-sm text-muted-foreground">
              {allowMultiple
                ? `Select multiple images${selectedImages.size > 0 ? ` (${selectedImages.size} selected)` : ""}`
                : "Select an image or upload new ones"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {allowMultiple && selectedImages.size > 0 && (
              <Button onClick={handleConfirmSelection} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add {selectedImages.size} Image{selectedImages.size !== 1 ? "s" : ""}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="gallery" className="flex-1 flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="gallery">Gallery ({images.length})</TabsTrigger>
                <TabsTrigger value="upload">Upload New</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="gallery" className="flex-1 flex flex-col m-0 px-6 pb-6">
              {/* Controls */}
              <div className="flex items-center gap-4 py-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search images..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                {allowMultiple && filteredImages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={selectedImages.size === filteredImages.length}>
                      Select All
                    </Button>
                    {selectedImages.size > 0 && (
                      <Button variant="outline" size="sm" onClick={handleClearSelection}>
                        Clear
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Images Grid/List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No images found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Try a different search term" : "Upload your first image to get started"}
                    </p>
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-4 gap-4">
                    {filteredImages.map((image) => {
                      const isSelected = selectedImages.has(image.url);
                      return (
                        <motion.div
                          key={image.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer transition-all ${
                            isSelected ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary"
                          }`}
                          onClick={() => handleImageSelect(image.url)}
                        >
                          <img src={image.url || "/placeholder.svg"} alt={image.name} className="w-full h-full object-cover" />
                          <div
                            className={`absolute inset-0 transition-colors ${isSelected ? "bg-primary/20" : "bg-black/0 group-hover:bg-black/20"}`}
                          />

                          {/* Selection indicator */}
                          {allowMultiple && (
                            <div
                              className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? "bg-primary border-primary" : "border-white bg-black/20 opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              {isSelected && <Check className="h-4 w-4 text-white" />}
                            </div>
                          )}

                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(image.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <p className="text-white text-xs truncate">{image.name}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredImages.map((image) => {
                      const isSelected = selectedImages.has(image.url);
                      return (
                        <Card
                          key={image.id}
                          className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted/50"}`}
                          onClick={() => handleImageSelect(image.url)}
                        >
                          <CardContent className="flex items-center gap-4 p-4">
                            {allowMultiple && (
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "bg-primary border-primary" : "border-gray-300"
                                }`}
                              >
                                {isSelected && <Check className="h-4 w-4 text-white" />}
                              </div>
                            )}
                            <img src={image.url || "/placeholder.svg"} alt={image.name} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1">
                              <h4 className="font-medium">{image.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatFileSize(image.size)}</span>
                                <span>{image.uploadedAt.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(image.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="upload" className="flex-1 m-0 p-6">
              <div className="flex flex-col items-center justify-center h-full">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center w-full max-w-md hover:border-primary/50 transition-colors"
                  onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Upload Images</h3>
                  <p className="text-sm text-muted-foreground mb-4">Drag and drop images here, or click to select files</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  <Button asChild disabled={isUploading}>
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {isUploading ? "Uploading..." : "Select Images"}
                    </label>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">Maximum file size: 5MB per image</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </motion.div>
  );
}
