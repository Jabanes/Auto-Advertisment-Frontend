import type { Product } from "./product";
import type { Business } from "./business";

/**
 * Represents the main authenticated user.
 * Mirrors the Firestore `users/{uid}` document structure.
 */
export interface UserDTO {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  provider?: string;
  emailVerified?: boolean;
  createdAt?: string | null;
  lastLoginAt?: string | null;
}

/**
 * The structure returned from backend on successful login/register.
 * Includes full user profile + nested businesses and products.
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user: UserDTO;
  businesses: Business[];
  products: Product[];
  serverToken: string; // alias for Firebase ID token
}
