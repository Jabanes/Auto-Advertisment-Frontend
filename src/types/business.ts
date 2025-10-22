/**
 * Represents a business document under /users/{uid}/businesses/{businessId}
 */
export interface Business {
  businessId: string;                // Unique identifier for the business
  name: string;                      // Business name
  description?: string | null;       // Short description of the business
  logoUrl?: string | null;           // URL to business logo
  address?: {                        // Physical address of the business
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null;
  contactPhone?: string | null;      // Contact phone number
  businessEmail?: string | null;     // Business email address
  websiteUrl?: string | null;        // Business website URL
  owner?: {                          // Owner details
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  brandColors?: string[];            // Array of HEX color codes for brand
  preferredStyle?: "realistic" | "illustrated" | "bw" | "colourful"; // Preferred ad style
  createdAt?: string | null;         // ISO string or Firestore timestamp string
  updatedAt?: string | null;         // ISO string or Firestore timestamp string
}
