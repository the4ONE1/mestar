

# Payments Status & Privacy Policy Plan

## Payments: Already Working ✅

Your store is fully set up to receive payments. The Shopify integration is live with:
- Real Shopify storefront connected (`qqn01v-hw.myshopify.com`)
- Cart system with real Shopify checkout
- Customers click "Add to Cart" → open cart → "Checkout with Shopify" → pay on Shopify's secure checkout page

**One thing to confirm**: your Shopify store needs an active billing plan to process real payments. If you're still on a development/sandbox store, you'll need to claim it first (just ask me to "claim store" when you're ready).

---

## Add Privacy Policy Page

### New file: `src/pages/PrivacyPolicy.tsx`

A clean, readable privacy policy page covering:

- **What we collect**: Child's name, age group, gender, photo, email, story preferences
- **How we use it**: Solely for generating the personalized storybook and coloring pages
- **Photo policy** (prominent): All uploaded photos are used exclusively for story and coloring page generation and are **permanently deleted after 30 days**
- **Payment info**: Handled securely by Shopify — My Star Stories never sees or stores payment details
- **No sharing**: We do not sell, share, or distribute any personal data to third parties
- **Contact**: How to reach out with questions

### Update: `src/App.tsx`
- Add route `/privacy-policy`

### Update: `src/components/Footer.tsx`
- Add "Privacy Policy" link alongside the existing nav links

---

## Summary

| Change | File |
|--------|------|
| New Privacy Policy page | `src/pages/PrivacyPolicy.tsx` |
| Add route | `src/App.tsx` |
| Add footer link | `src/components/Footer.tsx` |

