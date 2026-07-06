import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_order_status",
  title: "Get order status",
  description:
    "Look up the status of a My Star Stories personalized storybook order by its order ID. Returns child name, story title, status, whether it has an audiobook, and (once ready) the PDF download URL.",
  inputSchema: {
    order_id: z
      .string()
      .uuid()
      .describe("The order UUID returned when the order was placed."),
  },
  annotations: {
    readOnlyHint: true,
    idempotentHint: true,
    openWorldHint: true,
  },
  handler: async ({ order_id }) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !anonKey) {
      return {
        content: [
          { type: "text", text: "Backend is not configured." },
        ],
        isError: true,
      };
    }

    const res = await fetch(
      `${supabaseUrl}/functions/v1/get-order-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ order_id }),
      },
    );

    const text = await res.text();
    if (!res.ok) {
      return {
        content: [
          { type: "text", text: `Order lookup failed (${res.status}): ${text}` },
        ],
        isError: true,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    return {
      content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }],
      structuredContent:
        typeof parsed === "object" && parsed !== null
          ? (parsed as Record<string, unknown>)
          : { result: parsed },
    };
  },
});
