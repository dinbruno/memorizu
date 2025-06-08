import { storage } from "./firebase-config";
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from "firebase/storage";
import { auth } from "./firebase-config";

// Storage quota constants
export const STORAGE_QUOTA_BYTES = 30 * 1024 * 1024; // 30MB in bytes

export interface StorageQuota {
  used: number;
  limit: number;
  percentage: number;
  available: number;
}

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: Date;
  size: number;
}

export async function uploadImage(file: File, userId: string): Promise<UploadedImage> {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    if (auth.currentUser.uid !== userId) {
      throw new Error("User ID mismatch");
    }

    // Check storage quota before upload
    const hasQuota = await checkStorageQuota(userId, file.size);
    if (!hasQuota) {
      throw new Error("Storage quota exceeded. Maximum 30MB allowed per user.");
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const imageRef = ref(storage, `users/${userId}/images/${fileName}`);

    const snapshot = await uploadBytes(imageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return {
      id: fileName,
      url,
      name: file.name,
      uploadedAt: new Date(),
      size: file.size,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function getUserImages(userId: string): Promise<UploadedImage[]> {
  try {
    if (!auth.currentUser) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated. Please log in first.");
    }

    if (auth.currentUser.uid !== userId) {
      console.error("User ID mismatch:", auth.currentUser.uid, "vs", userId);
      throw new Error("User ID mismatch");
    }

    console.log("Fetching images for user:", userId);
    console.log("Current user:", auth.currentUser.uid);

    const imagesRef = ref(storage, `users/${userId}/images`);

    const result = await listAll(imagesRef);
    console.log("Found", result.items.length, "images");

    const images: UploadedImage[] = [];

    for (const itemRef of result.items) {
      try {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);

        images.push({
          id: itemRef.name,
          url,
          name: metadata.customMetadata?.originalName || itemRef.name,
          uploadedAt: new Date(metadata.timeCreated),
          size: metadata.size,
        });
      } catch (itemError) {
        console.error("Error processing item:", itemRef.name, itemError);
        continue;
      }
    }

    return images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  } catch (error) {
    console.error("Error fetching user images:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "storage/unauthorized") {
        throw new Error("Permission denied. Please check if you are logged in and have the correct permissions.");
      } else if (error.code === "storage/object-not-found") {
        console.log("No images folder found for user, returning empty array");
        return [];
      }
    }

    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("not authenticated")
    ) {
      throw new Error("Please log in to access your image gallery.");
    }

    return [];
  }
}

export async function deleteImage(userId: string, imageId: string): Promise<void> {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    if (auth.currentUser.uid !== userId) {
      throw new Error("User ID mismatch");
    }

    const imageRef = ref(storage, `users/${userId}/images/${imageId}`);
    await deleteObject(imageRef);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export interface UploadedMusic {
  id: string;
  url: string;
  name: string;
  title: string;
  artist: string;
  uploadedAt: Date;
  size: number;
  duration?: string;
  type: "upload" | "spotify";
  spotifyUrl?: string;
}

export async function uploadMusic(file: File, userId: string, metadata?: { title?: string; artist?: string }): Promise<UploadedMusic> {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    if (auth.currentUser.uid !== userId) {
      throw new Error("User ID mismatch");
    }

    // Check storage quota before upload
    const hasQuota = await checkStorageQuota(userId, file.size);
    if (!hasQuota) {
      throw new Error("Storage quota exceeded. Maximum 30MB allowed per user.");
    }

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const musicRef = ref(storage, `users/${userId}/music/${fileName}`);

    const snapshot = await uploadBytes(musicRef, file, {
      customMetadata: {
        originalName: file.name,
        title: metadata?.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: metadata?.artist || "",
        type: "upload",
      },
    });

    const url = await getDownloadURL(snapshot.ref);

    return {
      id: fileName,
      url,
      name: file.name,
      title: metadata?.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: metadata?.artist || "",
      uploadedAt: new Date(),
      size: file.size,
      type: "upload",
    };
  } catch (error) {
    console.error("Error uploading music:", error);
    throw error;
  }
}

export async function getUserMusic(userId: string): Promise<UploadedMusic[]> {
  const musicRef = ref(storage, `users/${userId}/music`);

  try {
    const result = await listAll(musicRef);
    const musicFiles: UploadedMusic[] = [];

    for (const itemRef of result.items) {
      try {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef);

        musicFiles.push({
          id: itemRef.name,
          url,
          name: metadata.customMetadata?.originalName || itemRef.name,
          title: metadata.customMetadata?.title || itemRef.name.replace(/\.[^/.]+$/, ""),
          artist: metadata.customMetadata?.artist || "",
          uploadedAt: new Date(metadata.timeCreated),
          size: metadata.size,
          type: (metadata.customMetadata?.type as "upload" | "spotify") || "upload",
          spotifyUrl: metadata.customMetadata?.spotifyUrl,
        });
      } catch (itemError) {
        console.error(`Error processing music file ${itemRef.name}:`, itemError);
        // Continue with other files instead of failing completely
      }
    }

    return musicFiles.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  } catch (error) {
    console.error("Error fetching user music:", error);
    return [];
  }
}

export async function deleteMusic(userId: string, musicId: string): Promise<void> {
  try {
    const musicRef = ref(storage, `users/${userId}/music/${musicId}`);
    await deleteObject(musicRef);
  } catch (error) {
    console.error("Error deleting music:", error);
    throw error;
  }
}

export async function saveMusicMetadata(userId: string, musicData: Omit<UploadedMusic, "uploadedAt">): Promise<void> {
  try {
    // Verificar autenticação
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    if (auth.currentUser.uid !== userId) {
      throw new Error("User ID mismatch");
    }

    // For Spotify tracks, we'll save metadata to Firestore since there's no file to upload
    const { db } = await import("./firebase-config");
    const { doc, setDoc } = await import("firebase/firestore");

    const musicRef = doc(db, "users", userId, "spotify-music", musicData.id);
    await setDoc(musicRef, {
      ...musicData,
      uploadedAt: new Date(),
    });
  } catch (error) {
    console.error("Error saving music metadata:", error);
    throw error;
  }
}

export async function getUserSpotifyMusic(userId: string): Promise<UploadedMusic[]> {
  try {
    // Verificar autenticação
    if (!auth.currentUser) {
      console.error("No authenticated user found for Spotify music");
      throw new Error("User not authenticated. Please log in first.");
    }

    if (auth.currentUser.uid !== userId) {
      console.error("User ID mismatch for Spotify music:", auth.currentUser.uid, "vs", userId);
      throw new Error("User ID mismatch");
    }

    console.log("Fetching Spotify music for user:", userId);

    const { db } = await import("./firebase-config");
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");

    const musicCollection = collection(db, "users", userId, "spotify-music");
    const q = query(musicCollection, orderBy("uploadedAt", "desc"));
    const querySnapshot = await getDocs(q);

    console.log("Found", querySnapshot.docs.length, "Spotify tracks");

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt.toDate(),
    })) as UploadedMusic[];
  } catch (error) {
    console.error("Error fetching user Spotify music:", error);

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "permission-denied") {
        throw new Error("Permission denied. Please check if you are logged in and have the correct permissions.");
      }
    }

    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      error.message.includes("not authenticated")
    ) {
      throw new Error("Please log in to access your Spotify music.");
    }

    return [];
  }
}

export async function deleteSpotifyMusic(userId: string, musicId: string): Promise<void> {
  try {
    // Verificar autenticação
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    if (auth.currentUser.uid !== userId) {
      throw new Error("User ID mismatch");
    }

    const { db } = await import("./firebase-config");
    const { doc, deleteDoc } = await import("firebase/firestore");

    const musicRef = doc(db, "users", userId, "spotify-music", musicId);
    await deleteDoc(musicRef);
  } catch (error) {
    console.error("Error deleting Spotify music:", error);
    throw error;
  }
}

// Storage quota functions
export async function getUserStorageUsage(userId: string): Promise<number> {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }

    if (auth.currentUser.uid !== userId) {
      throw new Error("User ID mismatch");
    }

    let totalSize = 0;

    // Calculate images storage
    try {
      const imagesRef = ref(storage, `users/${userId}/images`);
      const imagesResult = await listAll(imagesRef);

      for (const itemRef of imagesResult.items) {
        try {
          const metadata = await getMetadata(itemRef);
          totalSize += metadata.size;
        } catch (itemError) {
          console.error("Error getting metadata for image:", itemRef.name, itemError);
        }
      }
    } catch (error) {
      console.log("No images folder or error accessing images:", error);
    }

    // Calculate music storage
    try {
      const musicRef = ref(storage, `users/${userId}/music`);
      const musicResult = await listAll(musicRef);

      for (const itemRef of musicResult.items) {
        try {
          const metadata = await getMetadata(itemRef);
          totalSize += metadata.size;
        } catch (itemError) {
          console.error("Error getting metadata for music:", itemRef.name, itemError);
        }
      }
    } catch (error) {
      console.log("No music folder or error accessing music:", error);
    }

    return totalSize;
  } catch (error) {
    console.error("Error calculating storage usage:", error);
    throw error;
  }
}

export async function getUserStorageQuota(userId: string): Promise<StorageQuota> {
  try {
    const used = await getUserStorageUsage(userId);
    const limit = STORAGE_QUOTA_BYTES;
    const percentage = Math.round((used / limit) * 100);
    const available = limit - used;

    return {
      used,
      limit,
      percentage,
      available,
    };
  } catch (error) {
    console.error("Error getting storage quota:", error);
    throw error;
  }
}

export async function checkStorageQuota(userId: string, fileSize: number): Promise<boolean> {
  try {
    const quota = await getUserStorageQuota(userId);
    return fileSize <= quota.available;
  } catch (error) {
    console.error("Error checking storage quota:", error);
    return false;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
