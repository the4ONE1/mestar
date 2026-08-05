Turn Ads Back On — Readiness + Tracking Setup

Goal: Get Google Ads and Meta ads running again, but only after confirming the live site can reliably take money and deliver stories.

Current status (not ready yet):
- Payments are live (Stripe pk_live in production env).
- 1 failed order in the last 24 hours: order for Milo failed because create-storybook timed out (150s idle limit). A paying customer would not have received their storybook.
- 28 story-delivery emails are still pending in the email queue (some from 7+ hours ago). Customers may not be receiving their delivery emails.
- 5 owner-alert emails are also pending.
- No Google Ads, Meta Pixel, or GA4 tracking IDs are configured in the env files. Ads cannot be measured without these.
- The site has a synthetic live-webhook test endpoint and a known good live webhook path, so we can verify the full pipeline without a real Stripe charge.

Plan:

1. Fix delivery before any ads run
   a. Investigate and clear the stuck email queue so the pending 33 emails either send or fail with a clear reason. This is the highest priority; running ads while customers don't get their storybooks is a money-losing disaster.
   b. Check the failed Milo order (IDLE_TIMEOUT in create-storybook). Decide if it needs a retry or if the resume/batch logic already handles it. If it's a real stuck customer order, fix it.
   c. Confirm the every-10-minute health check is correctly alerting when this happens.

2. Verify the live purchase-to-delivery path without a real charge
   a. Use the existing synthetic-live-webhook-test edge function to send a signed Stripe payload to the live webhook endpoint.
   b. Confirm the order moves through queued → generating_story → generating_images → assembling_pdf → complete.
   c. Confirm the story-delivery email is queued and the email queue drains it.
   d. No real customer payment or AI generation credit will be used for this verification.

3. Set up conversion tracking for Google Ads and Meta
   a. The frontend already supports GA4, GTM, Meta Pixel, and Google Ads via env vars in src/components/Analytics.tsx. We only need to add the IDs.
   b. Add VITE_GA_ID and VITE_GOOGLE_ADS_ID (and VITE_GOOGLE_ADS_CONVERSION_LABEL if they have a conversion label) for Google Ads tracking.
   c. Add VITE_META_PIXEL_ID for Meta/Facebook Pixel tracking.
   d. Verify the tracking snippets load on the published site and that the existing Google Ads conversion event in Checkout.tsx still fires.

4. Publish the readiness + tracking update
   a. Publish the latest code to mystarstories.app once the email queue and tracking IDs are resolved.
   b. Do a final spot-check on the published homepage and checkout flow.

5. Give the green light for ad campaigns
   a. Provide a short readiness report: whether orders, emails, and tracking are all working.
   b. Reconfirm the recommended ad URLs from /ad-links (homepage, product page, reviews, why-read-together) for Google and Meta campaigns.

Out of scope / things I will NOT do without your explicit go-ahead:
- Run a real Stripe test order that costs you money.
- Spend AI/generation credits on a test story.
- Change product prices, landing pages, or the ad creative itself.

Credit budget note: this plan is designed to use minimal credits. Steps 1 and 2 are diagnostic and webhook-only. Step 3 is configuration. Step 4 is a publish. The only potential cost would be if a stuck order requires retrying generation, but I will ask before doing that.
