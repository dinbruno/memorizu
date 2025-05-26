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
  const imageRef = ref(storage, `users/${userId}/images/${imageId}`);
  await deleteObject(imageRef);
}
