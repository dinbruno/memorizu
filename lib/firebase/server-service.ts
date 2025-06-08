// Hybrid service that tries Admin SDK first, falls back to client SDK
import { getPageById, updatePage, getUserData, updateUserData, getPublicationPricing } from "./firestore-service";

// Flag to track if Admin SDK is available
let adminSdkAvailable = false;
let adminService: any = null;

// Try to load Admin SDK
async function loadAdminService() {
  if (adminService !== null) {
    return adminService;
  }

  try {
    // Try to import and use admin service
    const adminModule = await import("./admin-service");
    adminService = adminModule;
    adminSdkAvailable = true;
    console.log("Firebase Admin SDK loaded successfully");
    return adminService;
  } catch (error) {
    console.warn("Firebase Admin SDK not available, using client SDK fallback:", error instanceof Error ? error.message : error);
    adminSdkAvailable = false;
    adminService = false; // Mark as failed
    return null;
  }
}

// Server-safe functions that use Admin SDK when available, client SDK as fallback
export async function serverGetPageById(userId: string, pageId: string) {
  const admin = await loadAdminService();

  if (admin && adminSdkAvailable) {
    try {
      return await admin.adminGetPageById(userId, pageId);
    } catch (error) {
      console.warn("Admin SDK failed, falling back to client SDK:", error instanceof Error ? error.message : error);
      adminSdkAvailable = false;
    }
  }

  // Fallback to client SDK
  return await getPageById(userId, pageId);
}

export async function serverUpdatePage(userId: string, pageId: string, pageData: Partial<any>) {
  const admin = await loadAdminService();

  if (admin && adminSdkAvailable) {
    try {
      return await admin.adminUpdatePage(userId, pageId, pageData);
    } catch (error) {
      console.warn("Admin SDK failed, falling back to client SDK:", error instanceof Error ? error.message : error);
      adminSdkAvailable = false;
    }
  }

  // Fallback to client SDK
  return await updatePage(userId, pageId, pageData);
}

export async function serverGetUserData(userId: string) {
  const admin = await loadAdminService();

  if (admin && adminSdkAvailable) {
    try {
      return await admin.adminGetUserData(userId);
    } catch (error) {
      console.warn("Admin SDK failed, falling back to client SDK:", error instanceof Error ? error.message : error);
      adminSdkAvailable = false;
    }
  }

  // Fallback to client SDK
  return await getUserData(userId);
}

export async function serverUpdateUserData(userId: string, data: Partial<any>) {
  const admin = await loadAdminService();

  if (admin && adminSdkAvailable) {
    try {
      return await admin.adminUpdateUserData(userId, data);
    } catch (error) {
      console.warn("Admin SDK failed, falling back to client SDK:", error instanceof Error ? error.message : error);
      adminSdkAvailable = false;
    }
  }

  // Fallback to client SDK
  return await updateUserData(userId, data);
}

export async function serverGetPublicationPricing() {
  const admin = await loadAdminService();

  if (admin && adminSdkAvailable) {
    try {
      return await admin.adminGetPublicationPricing();
    } catch (error) {
      console.warn("Admin SDK failed, falling back to client SDK:", error instanceof Error ? error.message : error);
      adminSdkAvailable = false;
    }
  }

  // Fallback to client SDK
  return await getPublicationPricing();
}
