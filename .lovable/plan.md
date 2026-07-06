## Goal
Replace the Shopify checkout entirely with Lovable's seamless Stripe payments. Shopify will no longer handle the purchase flow for MESTAR.

## What changes

**1. Enable Stripe (seamless)**
- Turn on Lovable's built-in Stripe (no account, no API keys needed).
- Creates a fresh test environment immediately so we can test without real money.
- Full compliance handling (tax + fraud + disputes handled by Stripe) will be set as the default since MESTAR is a digital product — you can change or turn this off per transaction later.

**2. Recreate your products in Stripe**
- Your existing Shopify/old Stripe price IDs will NOT carry over (seamless Stripe is a new environment).
- I'll batch-create the MESTAR products (Layer 1 story, Layer 2 coloring, bundles, etc.) with the prices you provide.
- Each product gets a Stripe tax code matched to "digital product / e-book" for correct tax handling.

**3. Replace the checkout flow**
- Rip out the Shopify cart + Storefront API checkout (`createShopifyCart`, cart drawer's Shopify sync, checkout URL logic).
- Replace with a Stripe Checkout session created from a Lovable Cloud edge function.
- "Buy" / "Add to Cart" buttons will call the edge function and redirect to Stripe Checkout, then back to a success page that triggers story generation.

**4. Order fulfillment via webhook**
- New edge function receives Stripe `checkout.session.completed` webhooks.
- Writes the order to Lovable Cloud (new `orders` table with RLS + GRANTs).
- Kicks off the AI story generation using the personalization data captured pre-checkout.

**5. Product data source**
- Products render from a local config (or a `products` table in Lovable Cloud) instead of Shopify's Storefront API.
- Product pages, images, and copy stay the same visually — only the data source changes.

**6. Disconnect Shopify**
- After Stripe checkout is verified working end-to-end, disconnect the Shopify store from the project (does NOT delete anything in your Shopify admin — just removes the link).
- Remove Shopify-related code, env references, and the MCP tool wiring that pointed at Shopify.

## What you need to do
- Confirm you want to proceed (this is a big swap).
- Have your product list + prices ready (name, price in USD, short description, whether it's one-time or subscription). If they match your current MESTAR lineup exactly, I can pull from what's already on the site.

## What stays the same
- Your site design, personalization form, story engine (Layer 1 + Layer 2), AI generation, PDF delivery, custom domain `mestar.pro`.
- Lovable Cloud backend, auth (if any), and the MCP agent integration (I'll repoint its order/product tools at the new Stripe + Cloud data).

## SEO / visibility note
Switching checkout doesn't hurt SEO — product URLs stay the same. I'll keep JSON-LD `Product` + `Offer` schema on each product page so Google still shows price + availability in search results.

## Technical section (for reference)
- Tool calls: `payments--enable_stripe_payments` → `batch_create_product` (after enable) → `shopify--disconnect_store` at the end.
- New files: `supabase/functions/create-checkout/index.ts`, `supabase/functions/stripe-webhook/index.ts`, `orders` migration with GRANTs + RLS.
- Removed/gutted: `src/stores/cartStore.ts` Shopify sync bits, Shopify Storefront API helpers, `.lovable/mcp/manifest.json` Shopify tool refs.
- Env: `STRIPE_SECRET_KEY` / webhook secret are managed by the seamless integration — you won't touch them.
