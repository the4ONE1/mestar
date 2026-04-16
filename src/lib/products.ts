// Local product config — pricing add-on model (replaces Shopify-driven pricing)
// Storefront still loads product imagery/title from Shopify, but pricing is computed here.

export type AddonKey = "illustrations" | "coloring" | "character" | "audiobook";

export interface AddonOption {
  key: AddonKey;
  label: string;
  description: string;
  price: number; // in USD
  defaultIncluded?: boolean; // included with base
}

export const BASE_PRICE = 9.99;

export const ADDONS: AddonOption[] = [
  {
    key: "illustrations",
    label: "Full-color illustrations",
    description: "5 painted storybook illustrations — one for each scene.",
    price: 4.99,
  },
  {
    key: "coloring",
    label: "Bonus coloring pages",
    description: "5 printable black-and-white pages of the story scenes.",
    price: 4.99,
  },
  {
    key: "character",
    label: "Add a supporting character",
    description: "Include a sibling, friend, or pet in the adventure.",
    price: 4.99,
  },
  {
    key: "audiobook",
    label: "Interactive audiobook",
    description: "Page-flip reader, narration, word highlighting + sound-it-out for early readers.",
    price: 19.99,
  },
];

export const BUNDLE_PRICE = 29.99;
export const BUNDLE_INCLUDES: AddonKey[] = ["illustrations", "coloring", "character", "audiobook"];

export type AddonState = Record<AddonKey, boolean>;

export const DEFAULT_ADDON_STATE: AddonState = {
  illustrations: false,
  coloring: false,
  character: false,
  audiobook: false,
};

export function calculateTotal(addons: AddonState, isBundle: boolean): number {
  if (isBundle) return BUNDLE_PRICE;
  let total = BASE_PRICE;
  for (const a of ADDONS) {
    if (addons[a.key]) total += a.price;
  }
  return Math.round(total * 100) / 100;
}

export function bundleSavings(): number {
  const all = ADDONS.reduce((s, a) => s + a.price, 0) + BASE_PRICE;
  return Math.round((all - BUNDLE_PRICE) * 100) / 100;
}
