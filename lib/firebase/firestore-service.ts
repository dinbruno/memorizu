import { db } from "./firebase-config";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, where, type DocumentData } from "firebase/firestore";

// User related functions
export async function getUserData(userId: string) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
}

export async function createUserData(userId: string, userData: DocumentData) {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error creating user data:", error);
    throw error;
  }
}

export async function updateUserData(userId: string, data: Partial<DocumentData>) {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...data,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

// Slug utility functions
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

// Check if slug is available globally (using global slugs collection)
export async function checkSlugAvailability(userId: string, slug: string, excludePageId?: string): Promise<boolean> {
  try {
    // Check if slug exists in global slugs collection
    const slugRef = doc(db, "globalSlugs", slug);
    const slugDoc = await getDoc(slugRef);

    if (!slugDoc.exists()) {
      return true; // Slug is available
    }

    const slugData = slugDoc.data();

    // If excluding a page (for updates), check if it's the same page
    if (excludePageId && slugData.pageId === excludePageId && slugData.userId === userId) {
      return true; // Same page, allow update
    }

    return false; // Slug already exists
  } catch (error) {
    console.error("Error checking slug availability:", error);

    // Fallback: check if it's a permission error and try alternative approach
    if (error instanceof Error && error.message.includes("Missing or insufficient permissions")) {
      return await checkSlugAvailabilityFallback(userId, slug, excludePageId);
    }

    throw error;
  }
}

// Fallback method: check only in user's own pages
async function checkSlugAvailabilityFallback(userId: string, slug: string, excludePageId?: string): Promise<boolean> {
  try {
    // Check only in the current user's pages
    const pagesCollection = collection(db, "users", userId, "pages");
    const q = query(pagesCollection, where("customSlug", "==", slug));
    const querySnapshot = await getDocs(q);

    // If excluding a page (for updates), filter it out
    const existingPages = querySnapshot.docs.filter((doc) => {
      return doc.id !== excludePageId;
    });

    return existingPages.length === 0;
  } catch (error) {
    console.error("Error in fallback slug check:", error);
    // If all else fails, assume slug is available to not block users
    return true;
  }
}

// Function to register a slug in the global collection (called when publishing)
export async function registerGlobalSlug(slug: string, userId: string, pageId: string): Promise<void> {
  try {
    const slugRef = doc(db, "globalSlugs", slug);
    await setDoc(slugRef, {
      slug,
      userId,
      pageId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error registering global slug:", error);
    // Don't throw error to not block publishing
  }
}

// Function to unregister a slug from the global collection
export async function unregisterGlobalSlug(slug: string): Promise<void> {
  try {
    const slugRef = doc(db, "globalSlugs", slug);
    await deleteDoc(slugRef);
  } catch (error) {
    console.error("Error unregistering global slug:", error);
    // Don't throw error to not block operations
  }
}

export async function getPageBySlug(userId: string, slug: string) {
  try {
    const pagesCollection = collection(db, "users", userId, "pages");
    const q = query(pagesCollection, where("customSlug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    return null;
  } catch (error) {
    console.error("Error getting page by slug:", error);
    throw error;
  }
}

// Function to sanitize data for Firestore (remove unsupported types like Symbol, Function, etc.)
function sanitizeDataForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeDataForFirestore(item));
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const valueType = typeof value;

      // Skip unsupported types
      if (valueType === "symbol" || valueType === "function" || valueType === "undefined") {
        console.warn(`Skipping unsupported type "${valueType}" for key "${key}"`);
        continue;
      }

      // Handle blob URLs (they are temporary and shouldn't be saved)
      if (typeof value === "string" && (value.startsWith("blob:") || value.includes("createObjectURL"))) {
        console.warn(`Removing blob URL for key "${key}": ${value}`);
        sanitized[key] = "";
        continue;
      }

      // Handle Date objects
      if (value instanceof Date) {
        sanitized[key] = value;
        continue;
      }

      // Handle File objects (they can't be serialized)
      if (value instanceof File || value instanceof Blob) {
        console.warn(`Removing File/Blob object for key "${key}"`);
        continue;
      }

      sanitized[key] = sanitizeDataForFirestore(value);
    }
    return sanitized;
  }

  // Return primitive values as-is (string, number, boolean)
  return obj;
}

// Page related functions
export async function createPage(userId: string, pageData: DocumentData) {
  try {
    const pagesCollection = collection(db, "users", userId, "pages");
    const newPageRef = doc(pagesCollection);

    const sanitizedData = sanitizeDataForFirestore(pageData);

    await setDoc(newPageRef, {
      ...sanitizedData,
      createdAt: new Date(),
      updatedAt: new Date(),
      published: false,
      publishedUrl: null,
    });

    return { id: newPageRef.id, ...pageData };
  } catch (error) {
    console.error("Error creating page:", error);
    throw error;
  }
}

export async function getUserPages(userId: string) {
  try {
    const pagesCollection = collection(db, "users", userId, "pages");
    const q = query(pagesCollection, orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting user pages:", error);
    throw error;
  }
}

export async function getPageById(userId: string, pageId: string) {
  try {
    const pageRef = doc(db, "users", userId, "pages", pageId);
    const docSnap = await getDoc(pageRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting page by ID:", error);
    throw error;
  }
}

export async function updatePage(userId: string, pageId: string, pageData: Partial<DocumentData>) {
  try {
    const pageRef = doc(db, "users", userId, "pages", pageId);

    const sanitizedData = sanitizeDataForFirestore(pageData);

    const finalData = {
      ...sanitizedData,
      updatedAt: new Date(),
    };

    await updateDoc(pageRef, finalData);
  } catch (error) {
    console.error("Error updating page:", error);
    throw error;
  }
}

export async function deletePage(userId: string, pageId: string) {
  try {
    // Get page data first to check if it has a custom slug
    const pageRef = doc(db, "users", userId, "pages", pageId);
    const pageDoc = await getDoc(pageRef);

    if (pageDoc.exists()) {
      const pageData = pageDoc.data();

      // Delete the page
      await deleteDoc(pageRef);

      // Clean up global slug if it exists
      if (pageData.customSlug) {
        await unregisterGlobalSlug(pageData.customSlug);
      }
    }
  } catch (error) {
    console.error("Error deleting page:", error);
    throw error;
  }
}

// Bulk delete unpaid pages (drafts)
export async function deleteUnpaidPages(userId: string, pageIds: string[]): Promise<{ success: string[]; failed: string[] }> {
  const results: { success: string[]; failed: string[] } = { success: [], failed: [] };

  for (const pageId of pageIds) {
    try {
      await deletePage(userId, pageId);
      results.success.push(pageId);
    } catch (error) {
      console.error(`Error deleting page ${pageId}:`, error);
      results.failed.push(pageId);
    }
  }

  return results;
}

// Get unpaid pages (drafts)
export async function getUnpaidPages(userId: string) {
  try {
    const pagesCollection = collection(db, "users", userId, "pages");
    const q = query(pagesCollection, where("published", "==", false), orderBy("updatedAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting unpaid pages:", error);
    throw error;
  }
}

export async function publishPage(userId: string, pageId: string, customSlug?: string) {
  try {
    const pageRef = doc(db, "users", userId, "pages", pageId);

    // If custom slug is provided, validate it
    if (customSlug) {
      const isAvailable = await checkSlugAvailability(userId, customSlug, pageId);
      if (!isAvailable) {
        throw new Error("Slug already exists");
      }
    }

    // Use only the custom slug for the URL, or fallback to just pageId
    const publishedUrl = customSlug ? customSlug : pageId;

    const updateData: any = {
      published: true,
      publishedUrl,
      publishedAt: new Date(),
    };

    if (customSlug) {
      updateData.customSlug = customSlug;
    }

    await updateDoc(pageRef, updateData);

    // Register slug globally if custom slug is provided
    if (customSlug) {
      await registerGlobalSlug(customSlug, userId, pageId);
    }

    return publishedUrl;
  } catch (error) {
    console.error("Error publishing page:", error);
    throw error;
  }
}

// Published pages - now supports both ID and slug
export async function getPublishedPage(userId: string, identifier: string) {
  try {
    // First try to get by slug
    const pageBySlug = await getPageBySlug(userId, identifier);
    if (pageBySlug && (pageBySlug as any).published) {
      return pageBySlug;
    }

    // If not found by slug, try by ID
    const pageRef = doc(db, "users", userId, "pages", identifier);
    const docSnap = await getDoc(pageRef);

    if (docSnap.exists() && docSnap.data().published) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting published page:", error);
    throw error;
  }
}

// Publication pricing configuration
export async function getPublicationPricing() {
  try {
    const pricingRef = doc(db, "config", "publication");
    const docSnap = await getDoc(pricingRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Default pricing if not configured
      return {
        price: 1.0,
        currency: "brl",
        description: "Page Publication Fee",
      };
    }
  } catch (error) {
    console.error("Error getting publication pricing:", error);
    // Return default pricing on error to prevent app breaking
    return {
      price: 1.0,
      currency: "brl",
      description: "Page Publication Fee",
    };
  }
}

export async function updatePublicationPricing(pricingData: { price: number; currency: string; description: string }) {
  try {
    const pricingRef = doc(db, "config", "publication");
    await setDoc(
      pricingRef,
      {
        ...pricingData,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating publication pricing:", error);
    throw error;
  }
}

// Find page by custom slug across all users (for direct slug access)
export async function getPageByCustomSlug(slug: string) {
  try {
    // Get all users - this should now work with the updated rules
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    // Search through users for the slug
    for (const userDoc of usersSnapshot.docs) {
      try {
        const pagesCollection = collection(db, "users", userDoc.id, "pages");
        const q = query(pagesCollection, where("customSlug", "==", slug), where("published", "==", true), where("paymentStatus", "==", "paid"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const pageDoc = querySnapshot.docs[0];
          const pageData = pageDoc.data();

          return {
            id: pageDoc.id,
            userId: userDoc.id,
            ...pageData,
          };
        }
      } catch (queryError: any) {
        // Handle permission errors for individual user queries gracefully
        if (queryError?.code === "permission-denied") {
          continue;
        }
        console.error(`Error querying pages for user ${userDoc.id}:`, queryError);
        continue; // Skip this user and continue with the next one
      }
    }

    return null;
  } catch (error: any) {
    console.error("Error getting page by custom slug:", error);

    // Provide more specific error handling
    if (error?.code === "permission-denied") {
      console.error("Permission denied accessing users collection. Check Firestore rules.");
      throw new Error("Access denied. Please check if the page is published and accessible.");
    }

    throw error;
  }
}

// Find published page by ID across all users (for direct pageId access)
export async function getPublishedPageById(pageId: string) {
  try {
    // Get all users - this should now work with the updated rules
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    // Search through users for the page
    for (const userDoc of usersSnapshot.docs) {
      try {
        const pageRef = doc(db, "users", userDoc.id, "pages", pageId);
        const pageSnap = await getDoc(pageRef);

        if (pageSnap.exists()) {
          const pageData = pageSnap.data();

          // Only return if page is published and paid (security check)
          if (pageData.published && pageData.paymentStatus === "paid") {
            return {
              id: pageSnap.id,
              userId: userDoc.id,
              ...pageData,
            };
          }
        }
      } catch (docError: any) {
        // Handle permission errors for individual documents gracefully
        if (docError?.code === "permission-denied") {
          continue;
        }
        console.error(`Error accessing page for user ${userDoc.id}:`, docError);
        continue; // Skip this user and continue with the next one
      }
    }

    return null;
  } catch (error: any) {
    console.error("Error getting published page by ID:", error);

    // Provide more specific error handling
    if (error?.code === "permission-denied") {
      console.error("Permission denied accessing users collection. Check Firestore rules.");
      throw new Error("Access denied. Please check if the page is published and accessible.");
    }

    throw error;
  }
}

// Migration function to populate global slugs collection with existing slugs
export async function migrateExistingSlugsToGlobal(): Promise<void> {
  try {
    let migratedCount = 0;
    let errorCount = 0;

    // Get all users
    const usersCollection = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollection);

    for (const userDoc of usersSnapshot.docs) {
      try {
        const pagesCollection = collection(db, "users", userDoc.id, "pages");
        const q = query(pagesCollection, where("published", "==", true));
        const pagesSnapshot = await getDocs(q);

        for (const pageDoc of pagesSnapshot.docs) {
          const pageData = pageDoc.data();

          if (pageData.customSlug) {
            try {
              await registerGlobalSlug(pageData.customSlug, userDoc.id, pageDoc.id);
              migratedCount++;
            } catch (slugError) {
              errorCount++;
              console.error(`Error migrating slug: ${pageData.customSlug} for page ${pageDoc.id}`, slugError);
            }
          }
        }
      } catch (userError) {
        console.error(`Error processing user: ${userDoc.id}`, userError);
      }
    }

    console.log(`Migration completed. Migrated ${migratedCount} slugs. Encountered ${errorCount} errors.`);
  } catch (error) {
    console.error("Error migrating existing slugs to global:", error);
    throw error;
  }
}

export async function getTransactionsByUserId(userId: string) {
  try {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return transactions;
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
}
