

# Replace Shopify with Built-in Payments (Stripe via Lovable)

## What's happening

You're ditching Shopify and replacing it with a built-in payment system so customers can buy directly on your website — no Shopify needed. Lovable has a built-in Stripe integration that requires **no account setup from you** to get started. You'll get a test mode immediately, then claim your account when ready to go live.

**Why Stripe over Paddle**: Your product (personalized AI storybooks) would work with Paddle too, but Paddle requires an extra review process with no guaranteed approval. Stripe is simpler and faster to get running.

## What you'll keep
- Your intro video, product pages, personalization form, story generation engine — all stays the same
- The backend (story generation, PDF creation, storage) is untouched

## What changes

### Step 1: Enable built-in Stripe payments
- Activate Lovable's Stripe integration on your project
- This creates a test environment immediately

### Step 2: Create your product in Stripe
- Set up your storybook product with pricing (matching your current price)
- One-time payment for a digital download

### Step 3: Replace Shopify code with Stripe checkout
- **Remove** `src/lib/shopify.ts` (all Shopify API code)
- **Rewrite** `src/stores/cartStore.ts` to use a simple local cart (no Shopify sync)
- **Update** `src/pages/ProductDetail.tsx` — remove Shopify product fetching, use your own product data
- **Update** `src/pages/Index.tsx` — remove Shopify product fetching, show products from your own data
- **Update** `src/components/CartDrawer.tsx` — simplified checkout that creates a Stripe session
- **Remove** `src/hooks/useCartSync.ts` (no longer needed)

### Step 4: Build checkout flow
- Create an edge function that generates a Stripe checkout session
- After payment, redirect back to your site's order-complete page
- Trigger story generation automatically after successful payment

### Step 5: Disconnect Shopify
- Remove the Shopify connection from your project

## Also: Etsy, Amazon, Gumroad later
Since you don't have accounts on those platforms yet, we'll focus on getting Stripe working on your site first. Once that's live, you can create accounts on Etsy/Amazon and we can add "Also available on" links to your site pointing to those stores.

## Technical details
- New edge function: `create-checkout-session` — creates Stripe payment session
- New edge function: `stripe-webhook` — listens for successful payments, triggers story generation
- Product data stored in a new database table instead of fetched from Shopify
- Cart becomes purely local (no external sync needed)

