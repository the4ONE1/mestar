// Local product config — single bundled product + one optional add-on.
// Main product (Shopify variant): $19.99 — story + illustrations + coloring pages
// Add-on (separate Shopify variant): $9.99 — supporting character (2nd photo)

export const BASE_PRICE = 19.99;
export const SUPPORTING_CHARACTER_PRICE = 9.99;

// Shopify variant ID for the Supporting Character Add-On product.
// Created via Shopify admin — variant gid://shopify/ProductVariant/46218235412677
export const SUPPORTING_CHARACTER_VARIANT_ID =
  "gid://shopify/ProductVariant/46218235412677";

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
