import CryptoJS from "crypto-js";

const EXPIRY_SUFFIX = "_expiry";
const EXPIRY_DAYS = 20;

export const PROFILE_KEY = "elevate_hr_profile";
// Obfuscated key for sessionStorage encryption (obfuscation for "not plain" requirement)
const SECRET_KEY = "elevate_hr_session_secret_safe_key";

function expiryKey(key: string) {
  return `${key}${EXPIRY_SUFFIX}`;
}

// ─── Token (localStorage + 20-day expiry) ───────────────────────────────────

/** Save a value to localStorage with a 20-day expiry. */
export function setWithExpiry(key: string, value: string, days = EXPIRY_DAYS) {
  const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
  localStorage.setItem(key, value);
  localStorage.setItem(expiryKey(key), String(expiresAt));
}

/**
 * Read a value from localStorage.
 * Returns null if the key doesn't exist or has expired (also clears expired entries).
 * When the token is expired the profile is also cleared automatically.
 */
export function getWithExpiry(key: string): string | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(key);
  if (!value) return null;

  const expiry = localStorage.getItem(expiryKey(key));
  if (expiry && Date.now() > Number(expiry)) {
    // Expired — clean up token and profile together
    removeWithExpiry(key);
    removeProfile();
    return null;
  }

  return value;
}

/** Remove a key and its associated expiry entry. */
export function removeWithExpiry(key: string) {
  localStorage.removeItem(key);
  localStorage.removeItem(expiryKey(key));
}

// ─── Profile (sessionStorage — sensitive PII, cleared on tab/browser close) ──

/** Save the user profile object to sessionStorage (encrypted). */
export function setProfile(profile: object) {
  if (typeof window === "undefined") return;
  const cipherText = CryptoJS.AES.encrypt(JSON.stringify(profile), SECRET_KEY).toString();
  sessionStorage.setItem(PROFILE_KEY, cipherText);
}

/**
 * Read the user profile from sessionStorage (decrypted).
 * Returns the parsed object or null if not present.
 */
export function getProfile<T = Record<string, unknown>>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(raw, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData) as T;
  } catch (error) {
    console.error("Profile decryption failed:", error);
    return null;
  }
}

/** Remove the user profile from sessionStorage. */
export function removeProfile() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PROFILE_KEY);
}

