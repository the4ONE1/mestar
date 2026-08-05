Turn Ads Back On — Tracking Setup Only

Goal: Get Google Ads and Meta ads running again without repeating completed end-to-end tests or generating any paid content.

Current status (corrected after re-checking with proper deduplication):
- Payments are live (Stripe pk_live in production env).
- Email queue is healthy: 31 unique emails sent in the last 24 hours, 0 pending/stuck. The earlier "pending" count was from counting intermediate rows; after deduplicating by message_id, nothing is stuck.
- The one failed order in the last 24 hours is a test order (Milo, sent to mestar.orders@gmail.com) that hit the create-storybook idle timeout. Not a real customer.
- Payment webhooks are firing: 9 successful pipeline starts and 2 addon fulfillments recorded in the last 24 hours.
- Missing: Google Ads, Meta Pixel, and GA4 tracking IDs are not configured in the env files. The frontend code in src/components/Analytics.tsx is ready to load them as soon as the IDs are set.

Plan:

1. Set up conversion tracking for Google Ads and Meta
   a. Add VITE_GA_ID (Google Analytics 4) and VITE_GOOGLE_ADS_ID for Google Ads. Add VITE_GOOGLE_ADS_CONVERSION_LABEL if they have a conversion label.
   b. Add VITE_META_PIXEL_ID for Meta/Facebook Pixel tracking.
   c. These are the only changes needed; src/components/Analytics.tsx already injects the snippets when these env vars are present, and the Google Ads conversion event in src/pages/Checkout.tsx already fires after payment confirmation.

2. Publish the tracking update
   a. Publish the latest code to mystarstories.app once the env vars are set.
   b. Spot-check the published site to confirm the tracking snippets are present in the page source.

3. Give the green light for ad campaigns
   a. Confirm the readiness checklist passed.
   b. Reconfirm the recommended ad URLs from /ad-links (homepage, product page, reviews, why-read-together) for Google and Meta campaigns.

What I need from you:
- Your Google Ads ID (starts with AW-)
- Your Google Ads conversion label (the part after the / in the conversion action tag)
- Your GA4 measurement ID (starts with G-)
- Your Meta Pixel ID (numeric)

If you don't have these handy, I can walk you through where to find each one in the respective dashboards.

Out of scope / things I will NOT do without your explicit go-ahead:
- Run a real Stripe test order that costs you money.
- Spend AI/generation credits on a test story.
- Repeat the already completed end-to-end or email testing.
- Change product prices, landing pages, or the ad creative itself.

Credit budget note: no tests or content generation will be run. The only implementation will be adding the tracking IDs you provide and publishing that update.
