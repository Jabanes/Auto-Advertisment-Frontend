// src/types/status.ts

export const ProductStatus = {
  PENDING: "pending",
  ENRICHED: "enriched",
  PROCESSING: "processing",
  FAILED: "failed",
  POSTED: "posted",

} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];
