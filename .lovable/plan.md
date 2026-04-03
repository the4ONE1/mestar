

# Plan: Digital Product Overhaul + Personalization Form + Upsell

## What We're Doing

1. **Remove all shipping/physical product references** — this is a downloadable PDF, not a shipped item
2. **Add a personalization form** on the product detail page where customers enter their child's name, age, theme, and upload a photo — all before adding to cart
3. **Add an in-cart upsell** for a second photo (supporting character) at an additional charge
4. **Prepare for story generation ruleset** — you'll upload that next, and we'll wire it in

## Changes by File

### 1. `src/pages/Index.tsx`
- Remove "FREE Shipping" announcement bar
- Remove "Free Shipping" and "Gift Ready" trust badges; replace with "Instant Download" and "Digital PDF"
- Update urgency CTA: remove shipping language, use "Download instantly after purchase"
- Update "How It Works" step 3 from "Gift the Magic" to "Download & Enjoy"

### 2. `src/pages/ProductDetail.tsx` — Major Changes
- Add a **personalization form** above the "Add to Cart" button with:
  - Child's name (text input, required)
  - Child's age (dropdown: 2-10)
  - Story theme (dropdown: e.g. "Space Adventure", "Enchanted Forest", "Under the Sea", "Dinosaur Quest")
  - Photo upload (file input for child's photo, required)
- Photo stored as base64 or object URL in cart item (client-side only for now)
- Form validation: all fields required before "Add to Cart" enables
- Update feature bullets to reflect digital product (remove physical references)
- Store personalization data alongside the cart item

### 3. `src/stores/cartStore.ts`
- Extend `CartItem` type with optional `personalization` field:
  ```
  { childName, childAge, theme, photoUrl, supportingCharacterPhotoUrl? }
  ```
- Personalization data persists in localStorage with the cart

### 4. `src/components/CartDrawer.tsx`
- Show personalization details (name, age, theme) under each cart item
- Add **upsell section**: after cart items, show a callout card:
  - "Add a Supporting Character! Upload a second photo to include a friend, sibling, or pet as a supporting character in the story"
  - Upload button + small additional price indicator
  - When uploaded, the photo attaches to the cart item's personalization data
- Remove any shipping-related language

### 5. `src/pages/FAQ.tsx`
- Update FAQ answers to consistently say "digital PDF" / "instant download"
- Already mostly correct, minor wording tweaks

### 6. `src/pages/About.tsx`
- Minor copy update: mention it's a digital product/instant download

### 7. Upsell Pricing
- The upsell (second photo/supporting character) needs a price. Since this is a Shopify cart, we have two options:
  - **Option A**: Create a second Shopify product/variant for the upsell and add it as a separate cart line
  - **Option B**: Handle it client-side as metadata (no extra charge through Shopify, just data)
  - We'll use **Option A** — create a second product variant or product in Shopify for the supporting character add-on so it flows through checkout properly

### 8. Story Generation (Future Step)
- After you upload your story generation ruleset, we'll create a processing pipeline that takes the personalization inputs + ruleset and generates the PDF
- For now, the form captures all inputs and stores them with the order

## Technical Details

- Personalization data stored in Zustand cart store, persisted to localStorage
- Photo handled as base64 data URL (kept client-side; actual story generation will happen server-side later)
- Upsell implemented as a Shopify product added via Storefront API `cartLinesAdd`
- All "shipping" references across 5 files will be replaced with digital delivery language

