import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SHOPIFY_URL =
  "https://qqn01v-hw.myshopify.com/api/2025-07/graphql.json";
const SHOPIFY_TOKEN = "a7d13cd4d2b2db881f5d07e70855125f";

const QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      description
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 5) { edges { node { url altText } } }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
    }
  }
`;

export default defineTool({
  name: "get_product",
  title: "Get product",
  description:
    "Fetch full details for a single My Star Stories product by its Shopify handle (slug).",
  inputSchema: {
    handle: z
      .string()
      .min(1)
      .describe("The product handle / slug, e.g. 'personalized-storybook'."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  handler: async ({ handle }) => {
    const res = await fetch(SHOPIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query: QUERY, variables: { handle } }),
    });

    if (!res.ok) {
      return {
        content: [
          { type: "text", text: `Shopify request failed: ${res.status}` },
        ],
        isError: true,
      };
    }

    const data = await res.json();
    const p = data?.data?.productByHandle;
    if (!p) {
      return {
        content: [{ type: "text", text: `Product not found: ${handle}` }],
        isError: true,
      };
    }

    const product = {
      title: p.title,
      handle: p.handle,
      url: `https://mestar.pro/product/${p.handle}`,
      description: p.description,
      price: `${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}`,
      images: p.images.edges.map((e: any) => e.node.url),
      variants: p.variants.edges.map((e: any) => ({
        id: e.node.id,
        title: e.node.title,
        available: e.node.availableForSale,
        price: `${e.node.price.amount} ${e.node.price.currencyCode}`,
        options: e.node.selectedOptions,
      })),
    };

    return {
      content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
      structuredContent: { product },
    };
  },
});
