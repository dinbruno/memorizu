import { db } from "./firebase-config";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, type DocumentData } from "firebase/firestore";

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

    console.log("updatePage - Original data:", pageData);
    const sanitizedData = sanitizeDataForFirestore(pageData);
    console.log("updatePage - Sanitized data:", sanitizedData);

    const finalData = {
      ...sanitizedData,
      updatedAt: new Date(),
    };
    console.log("updatePage - Final data to save:", finalData);

    await updateDoc(pageRef, finalData);
    console.log("updatePage - Successfully updated document");
  } catch (error) {
    console.error("Error updating page:", error);
    throw error;
  }
}

export async function deletePage(userId: string, pageId: string) {
  try {
    const pageRef = doc(db, "users", userId, "pages", pageId);
    await deleteDoc(pageRef);
  } catch (error) {
    console.error("Error deleting page:", error);
    throw error;
  }
}

export async function publishPage(userId: string, pageId: string) {
  try {
    const pageRef = doc(db, "users", userId, "pages", pageId);
    const publishedUrl = `${userId}/${pageId}`;

    await updateDoc(pageRef, {
      published: true,
      publishedUrl,
      publishedAt: new Date(),
    });

    return publishedUrl;
  } catch (error) {
    console.error("Error publishing page:", error);
    throw error;
  }
}

// Published pages
export async function getPublishedPage(userId: string, pageId: string) {
  try {
    const pageRef = doc(db, "users", userId, "pages", pageId);
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
