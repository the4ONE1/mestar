// Local product config — single bundled product + optional add-ons.
// Main product (Shopify variant): $19.99 — story + illustrations + coloring pages
// Add-on (separate Shopify variant): $9.99 — supporting character (2nd photo)
// Add-on (separate Shopify variant): $4.99 — karaoke audiobook

export const BASE_PRICE = 19.99;
export const SUPPORTING_CHARACTER_PRICE = 9.99;
export const AUDIOBOOK_PRICE = 4.99;

// Shopify variant ID for the Supporting Character Add-On product.
export const SUPPORTING_CHARACTER_VARIANT_ID =
  "gid://shopify/ProductVariant/46218235412677";

// Shopify variant ID for the Karaoke Audiobook Add-On product.
export const AUDIOBOOK_VARIANT_ID =
  "gid://shopify/ProductVariant/46302514806981";

export interface SupportingCharacterAddon {
  variantId: string;
  title: string;
  price: number;
  description: string;
}

export const SUPPORTING_CHARACTER_ADDON: SupportingCharacterAddon = {
  variantId: SUPPORTING_CHARACTER_VARIANT_ID,
  title: "Supporting Character Add-On",
  price: SUPPORTING_CHARACTER_PRICE,
  description:
    "Add a sibling, friend, pet, or even yourself as a supporting character by uploading a second photo.",
};

export const AUDIOBOOK_ADDON = {
  variantId: AUDIOBOOK_VARIANT_ID,
  title: "Audiobook Add-On — Karaoke Read-Aloud",
  price: AUDIOBOOK_PRICE,
  description:
    "Narrated audiobook of your child's story with karaoke-style word highlighting — perfect for early readers learning to follow along.",
};
