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
 * Get the actual content bounds of components
 */
function getContentBounds(element: HTMLElement): { width: number; height: number; x: number; y: number } {
  const components = element.querySelectorAll('[data-component="true"]');

  if (components.length === 0) {
    // If no components found, try to find the content area
    const contentArea = element.querySelector(".min-h-full") || element;
    return {
      width: Math.min(contentArea.scrollWidth || 1200, 1200),
      height: Math.min(contentArea.scrollHeight || 800, 800),
      x: 0,
      y: 0,
    };
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = 0,
    maxY = 0;
  let hasValidBounds = false;

  components.forEach((comp) => {
    const rect = comp.getBoundingClientRect();
    const parentRect = element.getBoundingClientRect();

    // Skip components that are not visible
    if (rect.width === 0 || rect.height === 0) return;

    const x = rect.left - parentRect.left + element.scrollLeft;
    const y = rect.top - parentRect.top + element.scrollTop;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + rect.width);
    maxY = Math.max(maxY, y + rect.height);
    hasValidBounds = true;
  });

  if (!hasValidBounds) {
    return {
      width: Math.min(element.scrollWidth, 1200),
      height: Math.min(element.scrollHeight, 800),
      x: 0,
      y: 0,
    };
  }

  // Add padding and ensure minimum dimensions
  const padding = 20;
  const width = Math.max(maxX - minX + padding * 2, 400);
  const height = Math.max(maxY - minY + padding * 2, 300);

  return {
    x: Math.max(0, minX - padding),
    y: Math.max(0, minY - padding),
    width: Math.min(width, 1200),
    height: Math.min(height, 800),
  };
}

/**
 * Wait for images to load
 */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll("img");
  const imagePromises = Array.from(images).map((img) => {
    if (img.complete) return Promise.resolve();

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 3000); // 3s timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  });

  await Promise.all(imagePromises);
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

  // Wait for images to load
  await waitForImages(element);

  // Pre-process images to handle CORS issues
  await preprocessImages(element);

  // Get the actual content bounds
  const bounds = getContentBounds(element);

  console.log("Content bounds:", bounds);

  const canvas = await html2canvas(element, {
    useCORS: false, // Disable CORS to avoid black images
    allowTaint: true, // Allow tainted canvas
    backgroundColor: "#ffffff", // Force white background
    scale: 0.8, // Slightly reduce scale for better compatibility
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    logging: true, // Enable logging for debugging
    foreignObjectRendering: false, // Disable for better compatibility
    imageTimeout: 5000, // Reduce timeout
    removeContainer: true, // Clean up after rendering
    ignoreElements: (element: HTMLElement) => {
      return (
        element.classList.contains("ignore-thumbnail") ||
        element.tagName === "BUTTON" ||
        element.classList.contains("absolute") ||
        element.classList.contains("group-hover:opacity-100") ||
        element.classList.contains("opacity-0") ||
        element.style.display === "none" ||
        element.style.visibility === "hidden"
      );
    },
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      console.log("Cloning element for thumbnail:", clonedElement);

      // Force white background on the cloned element
      clonedElement.style.backgroundColor = "#ffffff";

      // Remove all problematic elements
      const problematicElements = clonedDoc.querySelectorAll(
        '.ignore-thumbnail, button, .absolute, [style*="position: absolute"], [style*="position: fixed"]'
      );
      problematicElements.forEach((el) => el.remove());

      // Fix all images
      const allImages = clonedDoc.querySelectorAll("img");
      allImages.forEach((img: HTMLImageElement) => {
        // Remove any problematic attributes
        img.removeAttribute("crossorigin");
        img.style.maxWidth = "100%";
        img.style.height = "auto";

        // If image has Firebase URL, replace with placeholder
        if (img.src && img.src.includes("firebasestorage.googleapis.com")) {
          img.src =
            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==";
        }
      });

      // Remove all background images that might cause issues
      const allElements = clonedDoc.querySelectorAll("*");
      allElements.forEach((el: Element) => {
        const element = el as HTMLElement;
        const computedStyle = window.getComputedStyle(element);

        // Remove problematic background images
        if (computedStyle.backgroundImage && computedStyle.backgroundImage !== "none") {
          element.style.backgroundImage = "none";
          element.style.backgroundColor = computedStyle.backgroundColor || "transparent";
        }

        // Ensure visibility
        if (computedStyle.opacity === "0" || computedStyle.visibility === "hidden") {
          element.style.opacity = "1";
          element.style.visibility = "visible";
        }
      });

      // Add some content if the element is empty
      if (!clonedElement.textContent?.trim() && clonedElement.children.length === 0) {
        const placeholder = clonedDoc.createElement("div");
        placeholder.style.cssText = `
          width: 400px;
          height: 300px;
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          color: #6c757d;
          font-size: 16px;
        `;
        placeholder.textContent = "Empty Page";
        clonedElement.appendChild(placeholder);
      }
    },
  });

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        resolve(blob!);
      },
      "image/jpeg",
      options.quality || 0.9 // Higher quality
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

    // Strategy 2: Simple full element capture
    async () => {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(element, {
        useCORS: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scale: 0.5,
        logging: true,
        removeContainer: true,
        ignoreElements: (el: HTMLElement) => {
          return (
            el.classList.contains("ignore-thumbnail") ||
            el.tagName === "BUTTON" ||
            el.classList.contains("absolute") ||
            el.classList.contains("group-hover:opacity-100")
          );
        },
        onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
          // Force visible styles
          clonedElement.style.backgroundColor = "#ffffff";
          clonedElement.style.minHeight = "400px";
          clonedElement.style.minWidth = "600px";
          clonedElement.style.padding = "20px";

          // Remove problematic elements
          const problematic = clonedDoc.querySelectorAll(".ignore-thumbnail, button, .absolute");
          problematic.forEach((el) => el.remove());

          // Replace Firebase images with placeholders
          const images = clonedDoc.querySelectorAll("img");
          images.forEach((img: HTMLImageElement) => {
            if (img.src.includes("firebasestorage.googleapis.com")) {
              img.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==";
            }
          });
        },
      });

      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob: Blob | null) => resolve(blob!), "image/jpeg", 0.8);
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
 * Simple test thumbnail generation
 */
async function generateTestThumbnail(element: HTMLElement): Promise<Blob> {
  const html2canvas = await loadHtml2Canvas();

  console.log("Generating test thumbnail for element:", element);
  console.log("Element styles:", window.getComputedStyle(element));

  const canvas = await html2canvas(element, {
    useCORS: false,
    allowTaint: true,
    backgroundColor: "#ffffff",
    scale: 0.5,
    logging: true,
    removeContainer: true,
    width: Math.min(element.scrollWidth || 800, 800),
    height: Math.min(element.scrollHeight || 600, 600),
  });

  console.log("Canvas generated:", canvas);
  console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob: Blob | null) => {
        console.log("Blob generated:", blob);
        resolve(blob!);
      },
      "image/jpeg",
      0.8
    );
  });
}

/**
 * Generate and upload page thumbnail
 */
export async function generateAndUploadThumbnail(userId: string, pageId: string, canvasElement: HTMLElement): Promise<string> {
  try {
    console.log("Generating thumbnail for page:", pageId);
    console.log("Element to capture:", canvasElement);

    // Try simple test first
    let thumbnailBlob: Blob;
    try {
      console.log("Trying simple test thumbnail...");
      thumbnailBlob = await generateTestThumbnail(canvasElement);
      console.log("Test thumbnail successful, size:", thumbnailBlob.size);
    } catch (testError) {
      console.warn("Test thumbnail failed, trying fallback strategies:", testError);
      // Generate thumbnail with fallback strategies
      thumbnailBlob = await generateThumbnailWithFallback(canvasElement, {
        width: 1200,
        height: 800,
        quality: 0.9,
      });
    }

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
