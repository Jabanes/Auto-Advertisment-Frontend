// src/types/business.ts
export interface Business {
  businessId: string;
  name: string;
  description?: string | null;
  slogan?: string | null;
  logoUrl?: string | null;

  // 🏠 Business Address
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  } | null;

  // ☎️ Contact Information
  contactPhone?: string | null;
  businessEmail?: string | null;
  websiteUrl?: string | null;

  // 🎨 Branding
  brandColors?: string[];
  preferredStyle?: string | null;
  visualStyle?: string | null;

  owner?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;

  // 🤖 AI Context & Personalization
  businessType?: string | null;
  category?: string | null;
  targetAudience?: string | null;
  toneOfVoice?: string | null;
  businessPersona?: {
    type?: string | null;
    name?: string | null;
    gender?: string | null;
  } | null;
  businessGoal?: string | null;
  preserveOriginalProduct?: boolean | null;
  sellingPlatforms?: string[] | null;
  location?: string | null;
  languages?: string[] | null;

  // 🌐 Social Links
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;

  // 🕒 Metadata
  createdAt?: string | null;
  updatedAt?: string | null;
}
