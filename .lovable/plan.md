

## Goal
Two fixes on the product page:
1. **"Everything Bundle" button** must take customers into the photo-upload / personalization step (same flow as the regular base product), not skip it
2. **"Surprise Me" button** that auto-fills all the personalization choices with sensible random picks so lazy users can go straight to checkout

## What I need to check first
Quick read of `src/pages/ProductDetail.tsx` to confirm:
- Where the bundle CTA currently sends users
- The shape of the personalization form (fields: child name, age, theme, strength, supporting character, photo upload)
- Where addon state lives so "Surprise Me" can flip the bundle on

I'll also peek at `src/lib/products.ts` (already in context — confirms addons + bundle pricing) and `src/stores/cartStore.ts` to make sure the bundle still flows through the same cart/personalization path.

## The fix

### Fix 1 — Everything Bundle routes through personalization
- Bundle button no longer jumps to checkout / cart directly
- Instead: sets `isBundle = true` in form state → scrolls user to the photo-upload + child-details section → same "Add to Cart" flow as base product
- Cart line carries the bundle flag + bundle price ($19.99) so checkout shows the right total

### Fix 2 — "Surprise Me" button
- New button placed near the top of the personalization form, styled as a soft secondary CTA (sparkle icon)
- One click auto-fills:
  - **Child name**: leaves blank (user must type real name) OR pre-fills "Your Child" placeholder — I'll leave name blank and only randomize the creative choices, since the name is personal
  - **Age**: random pick from 3–8
  - **Theme**: random from existing theme list (space, ocean, forest, dragons, etc. — whatever's already in the form)
  - **Strength**: random from existing list (kindness, bravery, curiosity, etc.)
  - **Supporting character**: 50/50 chance on/off; if on, random name from a small kid-friendly list (Luna, Max, Pip, Ollie, Bella)
  - **Addons**: turns ON the Everything Bundle by default (best value + most surprise)
- Toast confirmation: *"Surprise picks loaded — just add your child's name and photo!"*
- User can still edit any field after — it's a starting point, not a lock-in

### What stays the same
- Photo upload still required (can't randomize a real child's photo)
- Child's actual name still required (won't fake-fill)
- Checkout flow, cart drawer, Shopify integration — all untouched
- Pricing logic in `src/lib/products.ts` — no changes

## Files I'll touch
- `src/pages/ProductDetail.tsx` — bundle button behavior + add Surprise Me button + randomizer function

## What this does NOT change
- No backend changes, no database changes, no Shopify config changes
- No new dependencies
- Doesn't touch the story generation engine — it just pre-fills form inputs

Reply "go" and I'll make both changes in one pass.

