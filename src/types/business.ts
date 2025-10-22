export interface Business {
  businessId: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null;
  contactPhone?: string | null;
  businessEmail?: string | null;
  websiteUrl?: string | null;
  owner?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  brandColors?: string[];
  preferredStyle?: "realistic" | "illustrated" | "bw" | "colourful";

  // 🧠 AI personalization fields
  businessType?: "product_seller" | "service_provider" | "content_creator" | null;
  category?: string | null;
  targetAudience?: string | null;
  toneOfVoice?: string | null;
  visualStyle?: string | null;
  businessPersona?: {
    type?: "owner" | "brand" | null;
    name?: string | null;
    gender?: "male" | "female" | "neutral" | null;
  } | null;
  sellingPlatforms?: string[]; // e.g. ["facebook_marketplace", "instagram"]
  location?: string | null;
  languages?: string[]; // e.g. ["hebrew"]
  businessGoal?: "sale" | "brand_awareness" | "lead_generation" | null;
  slogan?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
