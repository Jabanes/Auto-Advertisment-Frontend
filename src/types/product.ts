// src/types/product.ts

import { ProductStatus } from "./status";

export interface Product {
  id: string;
  name: string;
  price?: number | null;
  imageUrl?: string | null;
  generatedImageUrl?: string | null;
  advertisementText?: string | null;
  imagePrompt?: string | null;
  status: ProductStatus; // ✅ match backend enum
  postDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  businessId?: string | null;
}
