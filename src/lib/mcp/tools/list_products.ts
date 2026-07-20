import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { fetchProducts } from "../../shopify";

export default defineTool({
  name: "list_products",
  title: "List products",
  description:
    "List MeStar's public product catalog (personalized digital storybooks and add-ons) with title, price, handle, and description.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const products = await fetchProducts();
    const simplified = products.map((p) => ({
      id: p.node.id,
      title: p.node.title,
      handle: p.node.handle,
      description: p.node.description,
      price: `${p.node.priceRange.minVariantPrice.amount} ${p.node.priceRange.minVariantPrice.currencyCode}`,
      url: `https://mestar.pro/product/${p.node.handle}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(simplified, null, 2) }],
      structuredContent: { products: simplified },
    };
  },
});
