/**
 * Represents a business document under /users/{uid}/businesses/{businessId}
 */
export interface Business {
  businessId: string;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
