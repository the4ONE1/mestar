import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SHOPIFY_URL =
  "https://qqn01v-hw.myshopify.com/api/2025-07/graphql.json";
const SHOPIFY_TOKEN = "a7d13cd4d2b2db881f5d07e70855125f";

const QUERY = `
  query ListProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          images(first: 1) { edges { node { url } } }
        }
      }
    }
  }
`;

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List personalized storybook products available in the My Star Stories shop, with title, handle, price, and description.",
  inputSchema: {
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20)
      .describe("Maximum number of products to return (1-50)."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  handler: async ({ limit }) => {
    const res = await fetch(SHOPIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_TOKEN,
      },
      body: JSON.stringify({ query: QUERY, variables: { first: limit } }),
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
    const products =
      data?.data?.products?.edges?.map((e: any) => ({
        title: e.node.title,
        handle: e.node.handle,
        url: `https://mestar.pro/product/${e.node.handle}`,
        price: `${e.node.priceRange.minVariantPrice.amount} ${e.node.priceRange.minVariantPrice.currencyCode}`,
        description: e.node.description,
        image: e.node.images?.edges?.[0]?.node?.url ?? null,
      })) ?? [];

    return {
      content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
      structuredContent: { products },
    };
  },
});
