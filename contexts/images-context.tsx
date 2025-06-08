"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useFirebase } from "@/lib/firebase/firebase-provider";
import { getUserImages, deleteImage, uploadImage, type UploadedImage } from "@/lib/firebase/storage-service";
import { useToast } from "@/hooks/use-toast";

interface ImagesContextType {
  images: UploadedImage[];
  isLoading: boolean;
  isUploading: boolean;
  loadImages: () => Promise<void>;
  uploadImages: (files: FileList) => Promise<void>;
  deleteImageById: (imageId: string) => Promise<void>;
  refreshImages: () => Promise<void>;
  clearCache: () => void;
}

const ImagesContext = createContext<ImagesContextType | undefined>(undefined);

interface ImagesProviderProps {
  children: ReactNode;
}

export function ImagesProvider({ children }: ImagesProviderProps) {
  const { user } = useFirebase();
  const { toast } = useToast();

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [lastUserId, setLastUserId] = useState<string | null>(null);

  // Load images from Firebase
  const loadImages = useCallback(async () => {
    if (!user) {
      setImages([]);
      setCacheLoaded(false);
      setLastUserId(null);
      return;
    }

    // If cache is already loaded for this user, don't reload
    if (cacheLoaded && lastUserId === user.uid) {
      return;
    }

    try {
      setIsLoading(true);
      console.log("Loading images for user:", user.uid);
      const userImages = await getUserImages(user.uid);
      console.log("Successfully loaded", userImages.length, "images");

      setImages(userImages);
      setCacheLoaded(true);
      setLastUserId(user.uid);
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
      setCacheLoaded(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, cacheLoaded, lastUserId]);

  // Force refresh images (bypass cache)
  const refreshImages = useCallback(async () => {
    setCacheLoaded(false);
    await loadImages();
  }, [loadImages]);

  // Upload new images
  const uploadImages = useCallback(
    async (files: FileList) => {
      if (!user) return;

      setIsUploading(true);
      try {
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

        // Add new images to the beginning of the array
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
    },
    [user, toast]
  );

  // Delete image
  const deleteImageById = useCallback(
    async (imageId: string) => {
      if (!user) return;

      try {
        await deleteImage(user.uid, imageId);

        // Remove from local state
        setImages((prev) => prev.filter((img) => img.id !== imageId));

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
    },
    [user, toast]
  );

  // Clear cache (useful when user logs out)
  const clearCache = useCallback(() => {
    setImages([]);
    setCacheLoaded(false);
    setLastUserId(null);
  }, []);

  // Load images when user changes
  useEffect(() => {
    if (user && user.uid !== lastUserId) {
      setCacheLoaded(false);
      loadImages();
    } else if (!user) {
      clearCache();
    }
  }, [user, lastUserId, loadImages, clearCache]);

  const value: ImagesContextType = {
    images,
    isLoading,
    isUploading,
    loadImages,
    uploadImages,
    deleteImageById,
    refreshImages,
    clearCache,
  };

  return <ImagesContext.Provider value={value}>{children}</ImagesContext.Provider>;
}

export function useImages() {
  const context = useContext(ImagesContext);
  if (context === undefined) {
    throw new Error("useImages must be used within an ImagesProvider");
  }
  return context;
}
