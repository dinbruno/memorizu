/**
 * Safely format dates from Firestore Timestamps or Date objects
 */
export function formatDate(date: any, locale: string = "en-US"): string {
  if (!date) return "Unknown date";

  let dateObj: Date;

  // Handle Firestore Timestamp
  if (date && typeof date.toDate === "function") {
    dateObj = date.toDate();
  }
  // Handle JavaScript Date
  else if (date instanceof Date) {
    dateObj = date;
  }
  // Handle string dates
  else if (typeof date === "string") {
    dateObj = new Date(date);
  }
  // Handle numeric timestamps
  else if (typeof date === "number") {
    dateObj = new Date(date);
  }
  // Handle plain objects with seconds/nanoseconds (Firestore format)
  else if (date && typeof date === "object" && "seconds" in date) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    console.warn("Unknown date format:", date);
    return "Invalid date";
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid date object:", date);
    return "Invalid date";
  }

  try {
    return dateObj.toLocaleDateString(locale);
  } catch (error) {
    console.warn("Error formatting date:", error);
    return dateObj.toLocaleDateString(); // Fallback to default locale
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: any, locale: string = "en-US"): string {
  if (!date) return "Unknown date";

  let dateObj: Date;

  // Handle Firestore Timestamp
  if (date && typeof date.toDate === "function") {
    dateObj = date.toDate();
  }
  // Handle JavaScript Date
  else if (date instanceof Date) {
    dateObj = date;
  }
  // Handle string dates
  else if (typeof date === "string") {
    dateObj = new Date(date);
  }
  // Handle numeric timestamps
  else if (typeof date === "number") {
    dateObj = new Date(date);
  }
  // Handle plain objects with seconds/nanoseconds (Firestore format)
  else if (date && typeof date === "object" && "seconds" in date) {
    dateObj = new Date(date.seconds * 1000);
  } else {
    console.warn("Unknown date format:", date);
    return "Invalid date";
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid date object:", date);
    return "Invalid date";
  }

  try {
    return dateObj.toLocaleString(locale);
  } catch (error) {
    console.warn("Error formatting date time:", error);
    return dateObj.toLocaleString(); // Fallback to default locale
  }
}
