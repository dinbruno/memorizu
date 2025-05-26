import { db } from "./firebase-config";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, orderBy, type DocumentData } from "firebase/firestore";

// User related functions
export async function getUserData(userId: string) {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

export async function createUserData(userId: string, userData: DocumentData) {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateUserData(userId: string, data: Partial<DocumentData>) {
  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      ...data,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}

// Page related functions
export async function createPage(userId: string, pageData: DocumentData) {
  const pagesCollection = collection(db, "users", userId, "pages");
  const newPageRef = doc(pagesCollection);

  await setDoc(newPageRef, {
    ...pageData,
    createdAt: new Date(),
    updatedAt: new Date(),
    published: false,
    publishedUrl: null,
  });

  return { id: newPageRef.id, ...pageData };
}

export async function getUserPages(userId: string) {
  const pagesCollection = collection(db, "users", userId, "pages");
  const q = query(pagesCollection, orderBy("updatedAt", "desc"));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getPageById(userId: string, pageId: string) {
  const pageRef = doc(db, "users", userId, "pages", pageId);
  const docSnap = await getDoc(pageRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

export async function updatePage(userId: string, pageId: string, pageData: Partial<DocumentData>) {
  const pageRef = doc(db, "users", userId, "pages", pageId);

  await updateDoc(pageRef, {
    ...pageData,
    updatedAt: new Date(),
  });
}

export async function deletePage(userId: string, pageId: string) {
  const pageRef = doc(db, "users", userId, "pages", pageId);
  await deleteDoc(pageRef);
}

export async function publishPage(userId: string, pageId: string) {
  const pageRef = doc(db, "users", userId, "pages", pageId);
  const publishedUrl = `${userId}/${pageId}`;

  await updateDoc(pageRef, {
    published: true,
    publishedUrl,
    publishedAt: new Date(),
  });

  return publishedUrl;
}

// Published pages
export async function getPublishedPage(userId: string, pageId: string) {
  const pageRef = doc(db, "users", userId, "pages", pageId);
  const docSnap = await getDoc(pageRef);

  if (docSnap.exists() && docSnap.data().published) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
}

// Publication pricing configuration
export async function getPublicationPricing() {
  const pricingRef = doc(db, "config", "publication");
  const docSnap = await getDoc(pricingRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Default pricing if not configured
    return {
      price: 19.99,
      currency: "brl",
      description: "Page Publication Fee",
    };
  }
}

export async function updatePublicationPricing(pricingData: { price: number; currency: string; description: string }) {
  const pricingRef = doc(db, "config", "publication");
  await setDoc(
    pricingRef,
    {
      ...pricingData,
      updatedAt: new Date(),
    },
    { merge: true }
  );
}
