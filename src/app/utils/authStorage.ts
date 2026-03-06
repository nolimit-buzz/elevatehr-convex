const EXPIRY_SUFFIX = "_expiry";
const EXPIRY_DAYS = 20;

function expiryKey(key: string) {
  return `${key}${EXPIRY_SUFFIX}`;
}

/** Save a value to localStorage with a 20-day expiry. */
export function setWithExpiry(key: string, value: string, days = EXPIRY_DAYS) {
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(key, value);
  localStorage.setItem(expiryKey(key), String(expiresAt));
}

/**
 * Read a value from localStorage.
 * Returns null if the key doesn't exist or has expired (also clears expired entries).
 */
export function getWithExpiry(key: string): string | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(key);
  if (!value) return null;

  const expiry = localStorage.getItem(expiryKey(key));
  if (expiry && Date.now() > Number(expiry)) {
    // Expired — clean up
    removeWithExpiry(key);
    return null;
  }

  return value;
}

/** Remove a key and its associated expiry entry. */
export function removeWithExpiry(key: string) {
  localStorage.removeItem(key);
  localStorage.removeItem(expiryKey(key));
}
