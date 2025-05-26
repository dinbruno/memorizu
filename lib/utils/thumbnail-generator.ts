import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/firebase-config";

declare global {
  interface Window {
    html2canvas: any;
  }
}

/**
 * Load html2canvas dynamically to avoid SSR issues
 */
const loadHtml2Canvas = async () => {
  if (typeof window !== "undefined") {
    if (!window.html2canvas) {
      try {
        // Try to load html2canvas from CDN if not installed via npm
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });

        window.html2canvas = (window as any).html2canvas;
      } catch (error) {
        console.warn("Failed to load html2canvas from CDN, trying npm import:", error);
        try {
          const html2canvas = await import("html2canvas");
          window.html2canvas = html2canvas.default;
        } catch (importError) {
          console.error("Failed to load html2canvas:", importError);
          throw new Error("html2canvas is not available");
        }
      }
    }
    return window.html2canvas;
  }
  throw new Error("Window is not available");
};

/**
 * Pre-process images to avoid CORS issues
 */
async function preprocessImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img[src*="firebasestorage.googleapis.com"]');

  for (const img of Array.from(images)) {
    const imgElement = img as HTMLImageElement;
    try {
      // Try to load image with CORS
      const corsImage = new Image();
      corsImage.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        corsImage.onload = resolve;
        corsImage.onerror = reject;
        corsImage.src = imgElement.src;
      });

      // If successful, update the original image
      imgElement.crossOrigin = "anonymous";
    } catch (error) {
      console.warn("Failed to load image with CORS, using placeholder:", imgElement.src);
      // Replace with placeholder
      imgElement.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==";
    }
  }
}

/**
 * Generate thumbnail from a DOM element
 */
export async function generateThumbnail(
  element: HTMLElement,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<Blob> {
  const html2canvas = await loadHtml2Canvas();

  // Pre-process images to handle CORS issues
  await preprocessImages(element);

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: false, // Changed to false to avoid CORS issues
    backgroundColor: "#ffffff", // Set a default background instead of null
    scale: 0.5, // Reduce scale for smaller file size
    width: options.width || element.scrollWidth,
    height: options.height || element.scrollHeight,
    logging: false, // Disable logging to reduce console noise
    foreignObjectRendering: true, // Better handling of external content
    imageTimeout: 15000, // Increase timeout for image loading
    ignoreElements: (element: HTMLElement) => {
      // Ignore UI elements like toolbars, buttons, etc.
      return (
        element.classList.contains("ignore-thumbnail") ||
        element.tagName === "BUTTON" ||
        element.classList.contains("absolute") ||
        element.classList.contains("group-hover:opacity-100")
      );
    },
    onclone: (clonedDoc: Document) => {
      // Process cloned document to handle Firebase Storage images
      const images = clonedDoc.querySelectorAll('img[src*="firebasestorage.googleapis.com"]');
      images.forEach((img: Element) => {
        const imgElement = img as HTMLImageElement;
        // Add crossorigin attribute to Firebase images
        imgElement.crossOrigin = "anonymous";

        // If image fails to load, replace with placeholder
        imgElement.onerror = () => {
          imgElement.src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==";
        };
      });

      // Handle background images with Firebase Storage URLs
      const elementsWithBg = clonedDoc.querySelectorAll("*");
      elementsWithBg.forEach((el: Element) => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const backgroundImage = computedStyle.backgroundImage;

        if (backgroundImage && backgroundImage.includes("firebasestorage.googleapis.com")) {
          // Remove problematic background images
          element.style.backgroundImage = "none";
          element.style.backgroundColor = computedStyle.backgroundColor || "#f3f4f6";
        }
      });
    },
  });

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        resolve(blob!);
      },
      "image/jpeg",
      options.quality || 0.8
    );
  });
}

/**
 * Upload thumbnail to Firebase Storage
 */
export async function uploadThumbnail(userId: string, pageId: string, thumbnailBlob: Blob): Promise<string> {
  const thumbnailPath = `thumbnails/${userId}/${pageId}.jpg`;
  const thumbnailRef = ref(storage, thumbnailPath);

  try {
    // Delete existing thumbnail if it exists
    await deleteObject(thumbnailRef).catch(() => {
      // Ignore error if file doesn't exist
    });
  } catch (error) {
    // File doesn't exist, continue
  }

  // Upload new thumbnail
  await uploadBytes(thumbnailRef, thumbnailBlob, {
    contentType: "image/jpeg",
    customMetadata: {
      userId,
      pageId,
      generatedAt: new Date().toISOString(),
    },
  });

  // Get download URL
  const downloadURL = await getDownloadURL(thumbnailRef);
  return downloadURL;
}

/**
 * Delete thumbnail from Firebase Storage
 */
export async function deleteThumbnail(userId: string, pageId: string): Promise<void> {
  const thumbnailPath = `thumbnails/${userId}/${pageId}.jpg`;
  const thumbnailRef = ref(storage, thumbnailPath);

  try {
    await deleteObject(thumbnailRef);
  } catch (error) {
    console.warn("Failed to delete thumbnail:", error);
    // Don't throw error if file doesn't exist
  }
}

/**
 * Generate thumbnail with fallback strategies
 */
async function generateThumbnailWithFallback(element: HTMLElement, options: any): Promise<Blob> {
  const strategies = [
    // Strategy 1: Standard approach with preprocessing
    async () => {
      await preprocessImages(element);
      return generateThumbnail(element, options);
    },

    // Strategy 2: Without CORS, simplified approach
    async () => {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(element, {
        useCORS: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 0.3, // Even smaller scale
        logging: false,
        ignoreElements: (el: HTMLElement) => {
          return (
            el.classList.contains("ignore-thumbnail") ||
            el.tagName === "BUTTON" ||
            el.classList.contains("absolute") ||
            el.classList.contains("group-hover:opacity-100") ||
            (el.tagName === "IMG" && el.getAttribute("src")?.includes("firebasestorage"))
          );
        },
      });

      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob: Blob | null) => resolve(blob!), "image/jpeg", 0.7);
      });
    },

    // Strategy 3: Text-only fallback
    async () => {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(element, {
        useCORS: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 0.2,
        logging: false,
        ignoreElements: (el: HTMLElement) => {
          return el.tagName === "IMG" || el.style.backgroundImage || el.classList.contains("ignore-thumbnail") || el.tagName === "BUTTON";
        },
      });

      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob: Blob | null) => resolve(blob!), "image/jpeg", 0.6);
      });
    },
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`Trying thumbnail generation strategy ${i + 1}...`);
      const result = await strategies[i]();
      console.log(`Strategy ${i + 1} succeeded`);
      return result;
    } catch (error) {
      console.warn(`Strategy ${i + 1} failed:`, error);
      if (i === strategies.length - 1) {
        throw error;
      }
    }
  }

  throw new Error("All thumbnail generation strategies failed");
}

/**
 * Generate and upload page thumbnail
 */
export async function generateAndUploadThumbnail(userId: string, pageId: string, canvasElement: HTMLElement): Promise<string> {
  try {
    console.log("Generating thumbnail for page:", pageId);

    // Generate thumbnail with fallback strategies
    const thumbnailBlob = await generateThumbnailWithFallback(canvasElement, {
      width: 800,
      height: 600,
      quality: 0.8,
    });

    console.log("Thumbnail generated, size:", thumbnailBlob.size);

    // Upload to Firebase Storage
    const thumbnailURL = await uploadThumbnail(userId, pageId, thumbnailBlob);

    console.log("Thumbnail uploaded:", thumbnailURL);

    return thumbnailURL;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw new Error("Failed to generate thumbnail");
  }
}
