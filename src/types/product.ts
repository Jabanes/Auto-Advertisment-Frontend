import type { ProductStatus } from "./status";

/**
 * Represents a product document under:
 * /users/{uid}/businesses/{businessId}/products/{productId}
 */
export interface Product {
  id: string;
  name: string;
  price?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  generatedImageUrl?: string | null;
  advertisementText?: string | null;
  imagePrompt?: string | null;

  // 🔄 unified product lifecycle
  status: ProductStatus; // "pending" | "enriched" | "posted"

  // 🔗 relationships
  businessId?: string | null;

  // 🕓 timestamps
  postDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
