// src/types/status.ts

export const ProductStatus = {
  PENDING: "pending",
  ENRICHED: "enriched",
  POSTED: "posted",
} as const;

export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];
