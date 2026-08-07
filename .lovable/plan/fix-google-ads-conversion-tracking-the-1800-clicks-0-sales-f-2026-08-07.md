# Fix Google Ads conversion tracking + the "1800 clicks, 0 sales" funnel

## What I verified just now (facts, not guesses)

1. **The Google tag is NOT in the page's HTML.** I downloaded the live homepage
   (`https://mystarstories.app/`) and searched it: the string `AW-18330852845` appears **0 times**.
   The tag only gets added by JavaScript *after* the page loads (`src/components/Analytics.tsx`).
   Real browsers do run it (I confirmed `gtag` exists after load), but Google Ads' tag checker reads
   the raw HTML — so it reports "snippet not added / not detected". That is exactly the message you got.

2. **Nobody has even started a checkout.** In the orders table, the newest order of any kind is
   **Aug 5** and the newest `pending_payment` (created the moment someone clicks through to checkout)
   is **Jul 27**. So of ~1800 ad clicks, **zero people reached the payment step**. This is not a
   payment bug — visitors are leaving before checkout. The conversion tag has had nothing to fire on.

3. **Two things block a first-time visitor on mobile** (I tested at your phone's screen size):
   - A **full-screen intro takeover** covers the entire first screen for 8 seconds. No headline,
     no price, no "Buy" — just two before/after images and a "Skip →" link.
   - The homepage order form's button is **disabled until a photo is uploaded**. A cold ad visitor
     must upload their child's photo before they can see anything about the product or price.

## What I'll change

### A. Make Google Ads detect the tag (fixes your Ads error)
- Put the real Google tag snippet (`AW-18330852845`) directly in `index.html` `<head>`, so it's in
  the served HTML on every page, including the pre-rendered SEO pages.
- Remove the duplicate JS-injected Google Ads copy from `Analytics.tsx` so the tag isn't loaded twice
  (double-loading can cause inflated or dropped events).
- Keep the purchase conversion (`AW-18330852845/iLbSCIKbtN0cEO276qRE`) firing on payment
  confirmation, and also fire it on the `/order-complete` page as a backup in case a buyer closes
  the confirmation screen too fast.
- Add standard funnel events so Ads/Analytics can optimize before you have sales:
  `begin_checkout` when checkout opens, and a `lead` event when someone submits the homepage form.

### B. Remove the two things stopping visitors from buying
- **Intro takeover:** show it only as part of the normal page (top of the homepage), not as a
  full-screen blocker. Ad visitors land on the headline, the before/after proof, the price, and the
  form immediately.
- **Order form:** let the visitor type the name and pick a theme and continue, with the photo upload
  moved to the next step where they've already committed. The photo is still required before payment —
  it's just no longer the first thing a stranger has to do.

### C. So this never goes unnoticed again
- Once the above is live I'll re-fetch the published HTML and confirm `AW-18330852845` is present in
  the source, then tell you exactly where in Google Ads to click "Verify" / re-check the tag.

## One thing I need from you (optional but strongly recommended)
GA4 is still not connected — there's no Measurement ID in the project, so you have **no data** on
where those 1800 people dropped off. If you send me your GA4 ID (looks like `G-XXXXXXXXXX`), I'll wire
it in during the same change and you'll be able to see the drop-off instead of us guessing.

## Technical notes
- `index.html`: add gtag loader + `gtag('config','AW-18330852845')` in `<head>`.
- `src/components/Analytics.tsx`: drop the Google Ads injection block; keep GA4/GTM/Meta hooks and
  `trackGoogleAdsConversion`; add `trackEvent` helper.
- `src/pages/Checkout.tsx`: fire `begin_checkout`; keep the existing purchase conversion.
- `src/pages/OrderComplete.tsx`: fire the purchase conversion once, de-duplicated by session/order id.
- `src/pages/Index.tsx`: remove the `showIntro` full-screen branch (render the showcase inline);
  change the form's `isValid` so photo isn't required at this step.
- `src/pages/Preview.tsx`: require the photo there before creating the pending order.
- No backend, database, or Stripe changes.
