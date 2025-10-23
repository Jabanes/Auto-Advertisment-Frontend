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
  status: ProductStatus; // "pending" | "processing" | "enriched" | "posted" | "failed"

  // 🔗 relationships
  businessId?: string | null;

  // 🧠 AI enrichment configuration
  productType?: string | null;                 // e.g. "physical", "digital", "service"
  productCategory?: string | null;             // e.g. "shoes", "course", "food", "tech"
  marketingGoal?: string | null;               // e.g. "sale", "brand_awareness", "lead_generation"
  visualMood?: string | null;                  // e.g. "bright", "dark", "luxury", "minimal"
  photoStyle?: string | null;                  // e.g. "realistic", "studio", "lifestyle", "creative"
  backgroundStyle?: string | null;             // e.g. "plain white", "environmental", "on model"
  targetAudience?: string | null;              // e.g. "צעירים עד גיל 30", "אנשי מקצוע בתחום ה-IT"
  includePriceInAd?: boolean | null;           // האם לכלול מחיר בטקסט השיווקי
  emphasizeBrandIdentity?: boolean | null;     // האם להדגיש את זהות העסק (brand voice)
  preserveOriginalProduct?: boolean | null;    // לשמור על המוצר המקורי בתמונה או לשנותו חופשי
  aspectRatio?: string | null;                 // e.g. "1:1", "16:9", "9:16"
  toneOfVoice?: string | null;                 // אם רוצים להגדיר טון ספציפי שונה מהעסק
  secondaryLanguage?: string | null;           // אם רוצים שהטקסט השיווקי יופק גם בשפה נוספת

  // 🕓 timestamps
  postDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
