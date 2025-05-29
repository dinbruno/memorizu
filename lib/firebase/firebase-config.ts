import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required Firebase config values (not env vars directly)
const requiredConfigKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];

for (const key of requiredConfigKeys) {
  if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
    throw new Error(`Missing required Firebase configuration: ${key}. Please check your environment variables.`);
  }
}

// Initialize Firebase
let firebaseApp;

try {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw new Error("Failed to initialize Firebase. Please check your configuration.");
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Initialize Analytics conditionally (only in browser)
export const initializeAnalytics = async () => {
  try {
    if (typeof window !== "undefined") {
      const analyticsSupported = await isSupported();
      if (analyticsSupported) {
        return getAnalytics(firebaseApp);
      }
    }
    return null;
  } catch (error) {
    console.error("Error initializing Firebase Analytics:", error);
    // Don't throw error as analytics is not critical for app functionality
    return null;
  }
};

export default firebaseApp;
