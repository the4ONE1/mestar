import { defineMcp } from "@lovable.dev/mcp-js";
import listProductsTool from "./tools/list-products";
import getProductTool from "./tools/get-product";
import getOrderStatusTool from "./tools/get-order-status";

export default defineMcp({
  name: "my-star-stories-mcp",
  title: "My Star Stories",
  version: "0.1.0",
  instructions:
    "Tools for the My Star Stories personalized children's storybook shop. Use `list_products` to browse the catalog, `get_product` for full details on a specific product by handle, and `get_order_status` to check the progress of a placed order by its UUID.",
  tools: [listProductsTool, getProductTool, getOrderStatusTool],
});
