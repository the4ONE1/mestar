import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fetchProductByHandle } from "../../shopify";

export default defineTool({
  name: "get_product",
  title: "Get product details",
  description:
    "Get full public details for a single MeStar product by its URL handle (e.g. 'personalized-storybook').",
  inputSchema: {
    handle: z.string().min(1).describe("Product handle from the product URL, e.g. 'personalized-storybook'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ handle }) => {
    const product = await fetchProductByHandle(handle);
    if (!product) {
      return {
        content: [{ type: "text", text: `No product found with handle: ${handle}` }],
        isError: true,
      };
    }
    const p = product.node;
    const details = {
      id: p.id,
      title: p.title,
      handle: p.handle,
      description: p.description,
      price: `${p.priceRange.minVariantPrice.amount} ${p.priceRange.minVariantPrice.currencyCode}`,
      images: p.images.edges.map((e) => e.node.url),
      options: p.options,
      url: `https://mestar.pro/product/${p.handle}`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
      structuredContent: { product: details },
    };
  },
});
