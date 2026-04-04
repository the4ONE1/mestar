

# Fixes from End-to-End Review

## Issues to Fix

### 1. Add "Paperback coming soon" to Product Detail page
The note only appears on About. Add it under the features list on ProductDetail.tsx (after line 340).

### 2. Fix mobile ghost button on homepage
The hero section's background image and overlay may be causing a ghost duplicate. Need to investigate the hero section's z-indexing and whether a second CTA button is being rendered underneath. Will check if it's just the background image showing through with text from the image itself.

### 3. Update Shopify product description
Use the `shopify--update_product` tool to:
- Remove "fully illustrated" from the description
- Add 11+ age group to the age group list
- Remove any references to "illustrated"

### 4. Check video section
The video references `/videos/product-demo.mp4` — if this doesn't exist, it shows a broken player. Will either remove the section or add a placeholder message.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/ProductDetail.tsx` | Add "Paperback coming soon" note |
| `src/pages/Index.tsx` | Investigate/fix ghost button on mobile, check video section |
| Shopify product (via tool) | Update description text |

