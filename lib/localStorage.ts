/**
 * Safe localStorage utilities with error handling and validation
 */

/**
 * Safely get and parse JSON from localStorage
 * @param key - localStorage key
 * @param defaultValue - default value if parsing fails
 * @returns parsed data or default value
 */
export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }

    const parsed = JSON.parse(item);
    return parsed;
  } catch (error) {
    console.error(`Error parsing localStorage item "${key}":`, error);
    // Clear corrupted data
    localStorage.removeItem(key);
    return defaultValue;
  }
}

/**
 * Safely set JSON data to localStorage
 * @param key - localStorage key
 * @param value - value to store
 * @returns true if successful, false otherwise
 */
export function setLocalStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 * @param key - localStorage key
 */
export function removeLocalStorageItem(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item "${key}":`, error);
  }
}

/**
 * Clear all localStorage data for the app
 */
export function clearAppLocalStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const keys = ["chat-messages", "chat-history", "theme"];
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
    console.log("App localStorage cleared successfully");
  } catch (error) {
    console.error("Error clearing app localStorage:", error);
  }
}

/**
 * Debug function to check localStorage contents
 */
export function debugLocalStorage(): void {
  if (typeof window === "undefined") {
    console.log("localStorage not available (SSR)");
    return;
  }

  try {
    const keys = ["chat-messages", "chat-history", "theme"];
    console.log("=== localStorage Debug ===");

    keys.forEach((key) => {
      const item = localStorage.getItem(key);
      if (item === null) {
        console.log(`${key}: null`);
      } else {
        console.log(
          `${key}: ${item.substring(0, 100)}${item.length > 100 ? "..." : ""}`
        );
        try {
          JSON.parse(item);
          console.log(`${key}: Valid JSON`);
        } catch (error) {
          console.error(`${key}: Invalid JSON -`, error);
        }
      }
    });
    console.log("=== End Debug ===");
  } catch (error) {
    console.error("Error debugging localStorage:", error);
  }
}

/**
 * Force clear all localStorage and reload page
 */
export function forceClearAndReload(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.clear();
    console.log("localStorage completely cleared, reloading page...");
    window.location.reload();
  } catch (error) {
    console.error("Error force clearing localStorage:", error);
  }
}

/**
 * Validate message object structure
 * @param message - message object to validate
 * @returns true if valid, false otherwise
 */
export function isValidMessage(message: unknown): message is {
  id: string;
  role: "user" | "assistant";
  content: string;
  time?: string;
} {
  return (
    message !== null &&
    typeof message === "object" &&
    typeof (message as Record<string, unknown>).id === "string" &&
    typeof (message as Record<string, unknown>).role === "string" &&
    typeof (message as Record<string, unknown>).content === "string" &&
    ((message as Record<string, unknown>).role === "user" ||
      (message as Record<string, unknown>).role === "assistant")
  );
}

/**
 * Validate chat object structure
 * @param chat - chat object to validate
 * @returns true if valid, false otherwise
 */
export function isValidChat(chat: unknown): chat is {
  id: string;
  title: string;
  createdAt: Date;
  lastMessage?: string;
} {
  return (
    chat !== null &&
    typeof chat === "object" &&
    typeof (chat as Record<string, unknown>).id === "string" &&
    typeof (chat as Record<string, unknown>).title === "string" &&
    (chat as Record<string, unknown>).createdAt instanceof Date
  );
}
