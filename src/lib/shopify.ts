// Shopify has been fully removed. This module keeps the same TypeScript
// surface the rest of the app was already importing (ShopifyProduct type,
// fetchProducts, fetchProductByHandle, cart mutation helpers) but every
// function now serves a local, hard-coded product catalog and treats the
// cart as a purely in-memory concept. Real checkout is handled by Stripe
// via `src/pages/Checkout.tsx` — the URLs returned here are placeholders
// and are never opened.

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: {
      minVariantPrice: { amount: string; currencyCode: string };
    };
    images: {
      edges: Array<{ node: { url: string; altText: string | null } }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

// ---------------------------------------------------------------------------
// Local catalog
// ---------------------------------------------------------------------------
// Single primary product — the personalized storybook. Add-ons (supporting
// character, audiobook) are wired up separately via src/lib/products.ts and
// mapped to Stripe price ids in src/lib/stripe.ts.

const LOCAL_VARIANT_ID = "gid://mestar/ProductVariant/personalized-storybook";

const LOCAL_PRODUCTS: ShopifyProduct[] = [
  {
    node: {
      id: "gid://mestar/Product/personalized-storybook",
      title: "Personalized Storybook — Your Child Is the Star",
      description:
        "A one-of-a-kind digital PDF storybook starring your child. Upload a photo, choose a theme, and download a print-ready book plus matching coloring pages in minutes.",
      handle: "personalized-storybook",
      priceRange: {
        minVariantPrice: { amount: "19.99", currencyCode: "USD" },
      },
      images: {
        edges: [
          { node: { url: "/images/sample-page-1.jpg", altText: "Sample storybook page 1" } },
          { node: { url: "/images/sample-page-2.jpg", altText: "Sample storybook page 2" } },
          { node: { url: "/images/sample-page-3.jpg", altText: "Sample storybook page 3" } },
          { node: { url: "/images/sample-page-4.jpg", altText: "Sample storybook page 4" } },
        ],
      },
      variants: {
        edges: [
          {
            node: {
              id: LOCAL_VARIANT_ID,
              title: "Default",
              price: { amount: "19.99", currencyCode: "USD" },
              availableForSale: true,
              selectedOptions: [{ name: "Format", value: "Digital PDF" }],
            },
          },
        ],
      },
      options: [{ name: "Format", values: ["Digital PDF"] }],
    },
  },
];

// ---------------------------------------------------------------------------
// Product fetch API (local, synchronous under the hood but async-shaped
// to preserve the existing call sites)
// ---------------------------------------------------------------------------

export async function fetchProducts(_first = 20): Promise<ShopifyProduct[]> {
  return LOCAL_PRODUCTS;
}

export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  return LOCAL_PRODUCTS.find((p) => p.node.handle === handle) ?? null;
}

// ---------------------------------------------------------------------------
// Cart helpers — local no-ops. Kept only because the cart store still calls
// them; Stripe embedded checkout is the real payment path.
// ---------------------------------------------------------------------------

export interface CartItem {
  lineId: string | null;
  product: ShopifyProduct;
  variantId: string;
  variantTitle: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

const LOCAL_CART_ID = "local-cart";
const LOCAL_CHECKOUT_URL = "/checkout"; // never actually opened

function localLineId(variantId: string): string {
  return `local-line:${variantId}`;
}

export async function createShopifyCart(
  item: CartItem,
): Promise<{ cartId: string; checkoutUrl: string; lineId: string } | null> {
  return { cartId: LOCAL_CART_ID, checkoutUrl: LOCAL_CHECKOUT_URL, lineId: localLineId(item.variantId) };
}

export async function recreateShopifyCart(
  items: CartItem[],
): Promise<{ cartId: string; checkoutUrl: string; lineIdByVariantId: Record<string, string> } | null> {
  if (items.length === 0) return null;
  return {
    cartId: LOCAL_CART_ID,
    checkoutUrl: LOCAL_CHECKOUT_URL,
    lineIdByVariantId: Object.fromEntries(items.map((i) => [i.variantId, localLineId(i.variantId)])),
  };
}

export async function addLineToShopifyCart(
  _cartId: string,
  item: CartItem,
): Promise<{ success: boolean; lineId?: string; cartNotFound?: boolean }> {
  return { success: true, lineId: localLineId(item.variantId) };
}

export async function updateShopifyCartLine(
  _cartId: string,
  _lineId: string,
  _quantity: number,
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  return { success: true };
}

export async function removeLineFromShopifyCart(
  _cartId: string,
  _lineId: string,
): Promise<{ success: boolean; cartNotFound?: boolean }> {
  return { success: true };
}

export async function fetchCart(_cartId: string) {
  // Return a shape the cart store treats as "still has items" so it doesn't
  // wipe the local cart on sync.
  return {
    id: LOCAL_CART_ID,
    checkoutUrl: LOCAL_CHECKOUT_URL,
    totalQuantity: 1,
    lines: { edges: [] as Array<{ node: { id: string; merchandise: { id: string } } }> },
  };
}

export async function attachCartAttributes(
  _cartId: string,
  _attributes: Array<{ key: string; value: string }>,
): Promise<boolean> {
  return true;
}
