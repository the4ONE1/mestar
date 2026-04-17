

The user wants to integrate Stripe to start accepting real payments (replacing the Shopify checkout dependency). Per the payments knowledge, I should run `recommend_payment_provider` first, but this is a digital product (personalized PDF storybooks) — Paddle would normally be a fit, but the user specifically asked for Stripe.

Per the knowledge, even when users mention Stripe by name, I should recommend the **built-in Stripe payments** (`enable_stripe_payments`) — not the BYOK integration. The built-in version requires no Stripe account setup to start testing, and the user can claim/connect their account later for live payments.

## Plan: Integrate Lovable's Built-In Stripe Payments

### What This Gives You
- A real Stripe-powered checkout (test mode immediately, live mode after account claim)
- No Stripe account needed to start — Lovable provisions a sandbox for you instantly
- Replaces the Shopify checkout flow that's currently powering the cart
- You only pay Stripe's standard fees (~2.9% + 30¢ for US cards) when you go live — no Lovable surcharge

### Step-By-Step

**1. Confirm prerequisites**
- You'll need a **Pro plan or higher** on Lovable (Payments requires it). If you're not on Pro, you'll be prompted to upgrade.
- Lovable Cloud is already enabled on this project ✅

**2. Run eligibility check**
- I'll call `recommend_payment_provider` to confirm Stripe fits your product type (personalized digital storybooks). This is a quick automated check.

**3. Enable Stripe**
- I'll call `enable_stripe_payments`. This provisions a Stripe sandbox tied to your project — instant, no account claim required.

**4. Create your products in Stripe**
- I'll create the four MESTAR SKUs in Stripe via the products tool:
  - Base story — $9.99
  - Add-on: Illustrations — $4.99
  - Add-on: Coloring pages — $4.99
  - Add-on: Supporting character — $4.99
  - Everything Bundle — $19.99
- All as one-time payments (not subscriptions).

**5. Replace Shopify checkout in the app**
- Rip out the Shopify cart/checkout code from `src/lib/shopify.ts`, `src/stores/cartStore.ts`, and `src/components/CartDrawer.tsx`
- Replace with a Stripe Checkout flow:
  - "Checkout" button calls a new edge function `create-checkout` that builds a Stripe Checkout Session with the cart's line items + personalization metadata
  - User is redirected to Stripe's hosted checkout page
  - On success, Stripe redirects to `/order-complete?session_id=...`
- Add a `stripe-webhook` edge function that listens for `checkout.session.completed` and triggers `create-storybook` with the personalization data (so generation only fires after real payment)
- Update `OrderComplete.tsx` to verify the session and show generation progress

**6. Test in sandbox**
- Place a test order with Stripe's test card `4242 4242 4242 4242`
- Confirm the storybook generates and PDF downloads
- Verify all four pricing tiers + bundle work

**7. Going live (later, when you're ready)**
- Claim your Stripe account through Lovable (one-click, takes ~5 min to verify)
- Switch from sandbox to live mode — same code, different keys (handled automatically)
- Real payments start flowing

### What I Need From You
Just confirm you want to proceed with **built-in Stripe payments** (no Stripe account needed to start). I'll handle the rest.

### What Gets Removed
- Shopify cart logic (`src/lib/shopify.ts`, parts of `cartStore.ts`)
- Shopify checkout button behavior in `CartDrawer.tsx`
- The Shopify integration itself can stay connected for now (harmless), or we can disconnect it later

### Order of Build
1. Eligibility check + enable Stripe (1 tool call each)
2. Create 5 products in Stripe
3. Build `create-checkout` edge function
4. Build `stripe-webhook` edge function (triggers story generation on paid orders)
5. Refactor cart store + CartDrawer to use Stripe instead of Shopify
6. Update OrderComplete to verify Stripe session
7. Test end-to-end with test card

Ready to proceed?

