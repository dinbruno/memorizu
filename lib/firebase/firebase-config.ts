import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDe68ul_xHJ626wZW3HycppA4lkOfa9JAc",
  authDomain: "memorizu-7bd4c.firebaseapp.com",
  projectId: "memorizu-7bd4c",
  storageBucket: "memorizu-7bd4c.firebasestorage.app",
  messagingSenderId: "648053807453",
  appId: "1:648053807453:web:e76b6d5f6298261dd070b4",
  measurementId: "G-LQXQ1NNHPH",
}

// Initialize Firebase
let firebaseApp

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
} else {
  firebaseApp = getApps()[0]
}

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const storage = getStorage(firebaseApp)

// Initialize Analytics conditionally (only in browser)
export const initializeAnalytics = async () => {
  if (typeof window !== "undefined") {
    const analyticsSupported = await isSupported()
    if (analyticsSupported) {
      return getAnalytics(firebaseApp)
    }
  }
  return null
}

export default firebaseApp
