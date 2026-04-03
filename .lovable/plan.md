

# ⭐ My Star Stories — Shopify Storefront

## Design Theme
- **Whimsical & playful** with **warm gold & navy** color palette
- Starry night sky feel, soft rounded elements, storybook typography
- Mobile-first (your viewport is ~376px wide)

## Pages & Structure

### 1. Homepage
- **Navigation bar** with "Star Stories" logo/name, links to About & FAQ, and a shopping cart icon
- **Hero section** — Dreamy headline like "Your Child Is the Star ⭐" with a warm gold CTA button ("Shop Now"), navy background with subtle star accents
- **Product section** — Displays the personalized storybook product pulled live from your Shopify store (image, title, price, "Add to Cart" button)
- Product card links to a detail page

### 2. Product Detail Page (`/product/[handle]`)
- Large product images (carousel of your 3 images)
- Full description, price ($19.99), and "Add to Cart" button
- Whimsical styling matching the homepage

### 3. About Page (`/about`)
- Tell the story behind Star Stories — why you created personalized bedtime adventures
- Warm, inviting layout with the gold & navy theme

### 4. FAQ Page (`/faq`)
- Common questions: How does personalization work? What age groups? How is it delivered? etc.
- Accordion-style expandable answers

## Shopping Cart & Checkout
- **Cart drawer** (slides in from the right) showing items, quantities, and total
- Real Shopify checkout — clicking "Checkout" opens Shopify's secure checkout in a new tab
- Cart persists across page refreshes

## Technical Approach
- Products loaded from Shopify Storefront API (real data, no mocks)
- Zustand for cart state management
- Fully responsive design

