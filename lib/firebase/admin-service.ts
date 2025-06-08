import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // For local development, you can use a service account key file
    // For production, use environment variables
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
      try {
        const parsedServiceAccount = JSON.parse(serviceAccount);
        return initializeApp({
          credential: cert(parsedServiceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } catch (error) {
        console.error("Error parsing service account:", error);
      }
    }

    // Fallback: try to initialize with default credentials (works in Firebase hosting)
    try {
      return initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (error) {
      console.error("Error initializing Firebase Admin:", error);
      throw new Error("Failed to initialize Firebase Admin SDK");
    }
  } else {
    return getApps()[0];
  }
}

// Initialize admin app
const adminApp = initializeFirebaseAdmin();
export const adminDb = getFirestore(adminApp);

// Admin service functions that bypass Firestore rules
export async function adminGetPageById(userId: string, pageId: string) {
  try {
    const pageRef = adminDb.collection("users").doc(userId).collection("pages").doc(pageId);
    const docSnap = await pageRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Admin: Error getting page by ID:", error);
    throw error;
  }
}

export async function adminUpdatePage(userId: string, pageId: string, pageData: Partial<any>) {
  try {
    const pageRef = adminDb.collection("users").doc(userId).collection("pages").doc(pageId);

    const finalData = {
      ...pageData,
      updatedAt: new Date(),
    };

    await pageRef.update(finalData);
  } catch (error) {
    console.error("Admin: Error updating page:", error);
    throw error;
  }
}

export async function adminGetUserData(userId: string) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    const docSnap = await userRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Admin: Error getting user data:", error);
    throw error;
  }
}

export async function adminUpdateUserData(userId: string, data: Partial<any>) {
  try {
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.set(
      {
        ...data,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Admin: Error updating user data:", error);
    throw error;
  }
}

export async function adminGetPublicationPricing() {
  try {
    const pricingRef = adminDb.collection("config").doc("publication");
    const docSnap = await pricingRef.get();

    if (docSnap.exists) {
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
    console.error("Admin: Error getting publication pricing:", error);
    // Return default pricing on error to prevent app breaking
    return {
      price: 1.0,
      currency: "brl",
      description: "Page Publication Fee",
    };
  }
}
