import { defineMcp } from "@lovable.dev/mcp-js";
import listProducts from "./tools/list_products";
import getProduct from "./tools/get_product";
import listThemes from "./tools/list_themes";

export default defineMcp({
  name: "mestar-mcp",
  title: "MeStar",
  version: "0.1.0",
  instructions:
    "Public tools for MeStar (mestar.pro), a personalized digital storybook shop. Use `list_products` to see the catalog, `get_product` for details on a specific product by handle, and `list_story_themes` for the story themes available during personalization. This server exposes only public catalog data — no customer, order, or account information.",
  tools: [listProducts, getProduct, listThemes],
});
