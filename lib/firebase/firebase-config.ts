import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDe68ul_xHJ626wZW3HycppA4lkOfa9JAc",
  authDomain: "memorizu-7bd4c.firebaseapp.com",
  projectId: "memorizu-7bd4c",
  storageBucket: "memorizu-7bd4c.firebasestorage.app",
  messagingSenderId: "648053807453",
  appId: "1:648053807453:web:e76b6d5f6298261dd070b4",
  measurementId: "G-LQXQ1NNHPH",
};

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
