import { storage } from "./firebase-config";
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from "firebase/storage";

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: Date;
  size: number;
}

export async function uploadImage(file: File, userId: string): Promise<UploadedImage> {
  try {
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
  const imagesRef = ref(storage, `users/${userId}/images`);

  try {
    const result = await listAll(imagesRef);
    const images: UploadedImage[] = [];

    for (const itemRef of result.items) {
      const url = await getDownloadURL(itemRef);
      const metadata = await getMetadata(itemRef);

      images.push({
        id: itemRef.name,
        url,
        name: metadata.customMetadata?.originalName || itemRef.name,
        uploadedAt: new Date(metadata.timeCreated),
        size: metadata.size,
      });
    }

    return images.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  } catch (error) {
    console.error("Error fetching user images:", error);
    return [];
  }
}

export async function deleteImage(userId: string, imageId: string): Promise<void> {
  try {
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
    const { db } = await import("./firebase-config");
    const { collection, getDocs, orderBy, query } = await import("firebase/firestore");

    const musicCollection = collection(db, "users", userId, "spotify-music");
    const q = query(musicCollection, orderBy("uploadedAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt.toDate(),
    })) as UploadedMusic[];
  } catch (error) {
    console.error("Error fetching user Spotify music:", error);
    return [];
  }
}

export async function deleteSpotifyMusic(userId: string, musicId: string): Promise<void> {
  try {
    const { db } = await import("./firebase-config");
    const { doc, deleteDoc } = await import("firebase/firestore");

    const musicRef = doc(db, "users", userId, "spotify-music", musicId);
    await deleteDoc(musicRef);
  } catch (error) {
    console.error("Error deleting Spotify music:", error);
    throw error;
  }
}
