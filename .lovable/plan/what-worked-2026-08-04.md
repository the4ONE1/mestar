What Happened, and the Two Fixes Needed

## What worked

Publish went out and the live site responds. I then ran a synthetic live payment test with no real charge, and the live path passed end to end:

- The live Stripe webhook signature verified and returned 200
- The order pipeline fired automatically
- The story was written ("SyntheticLive's space adventure")
- 3 illustrations were generated
- The PDF was built, uploaded, and the order was marked complete at 23:04
- The confirmation email link was generated

So real customer payments do reach the generation pipeline correctly.

## What broke

After the first PDF was delivered, the system started a follow-up "resume pass" to fill in the pictures it hadn't finished yet. Two problems surfaced:

1. **The resume pass downgrades a finished order back to "in progress."** Before rebuilding, it sets the order's status to "assembling_pdf". The pass then crashed on the platform's CPU limit while re-assembling the PDF, so the order is now permanently stuck showing "in progress" even though a working PDF already exists. This is exactly the stuck "Order in progress" screen with green checkmarks you saw before.

2. **The bonus coloring book pages never got made.** The first run produced 3 of 3 illustrations and 0 of 8 bonus pages; the resume pass produced the 3 scene coloring pages, then ran out of CPU before it could touch the 8 bonus pages.

## Fix 1: A resume pass must never un-complete an order

Change the storybook builder so a resume pass keeps the order at "complete" the entire time it works. It should only replace the PDF file and URL when the new build finishes successfully. If a resume pass crashes, the customer keeps the working PDF and the page keeps showing "complete" instead of hanging.

Also add a repair step so any order that is already stuck in "assembling_pdf" or "generating_images" while it already has a PDF is moved back to "complete".

## Fix 2: Keep each pass small enough to finish

Reduce how much work a single pass attempts so it finishes inside the platform's CPU and time limits, and let the passes chain until everything is filled in:

- Cap images generated per pass to a small batch instead of racing a wall-clock budget
- Raise the resume pass limit so a full book with bonus pages can complete across several short passes
- Skip re-assembling the PDF on a pass that added no new images

## Cleanup

Delete the temporary test function I deployed for the live webhook check. It was deployed with authentication disabled for the test and must not stay in the project.

## Ruled out: running out of AI credits

Checked the gateway logs directly. Every AI call in the last 7 days returned success, including all the image calls during the failed test at 23:02-23:05. There were no out-of-credit or rate-limit errors. The failure was the platform CPU limit, not billing.

However, the balance is worth acting on: 40.18 credits remain (daily, monthly and top-up allowances are all at zero; this is the bonus grant). Each generated picture costs about 0.56 credits, so a full book with bonus coloring pages costs roughly 8 credits — about five more books before generation begins failing with billing errors. Also included in this work: make the builder mark an order "needs attention" with a clear reason if an AI call ever is refused for credits, instead of silently delivering an incomplete PDF.


## Verify

Repair the stuck test order, run one more synthetic live webhook test, and confirm the order reaches "complete" with all illustrations, all scene coloring pages, and all 8 bonus pages present in the PDF — with no stuck "in progress" screen.

## Technical detail

- `supabase/functions/create-storybook/index.ts`: remove the pre-assembly `status: "assembling_pdf"` write on resume passes; gate the final status write so a resume pass never regresses `complete`; replace `IMAGE_GENERATION_BUDGET_MS` racing with a per-pass image cap; raise the `pass < 4` ceiling; short-circuit when no new images were produced.
- Add a one-time SQL repair for orders where `pdf_url IS NOT NULL AND status <> 'complete'`.
- Delete `supabase/functions/synthetic-live-webhook-test/` and its `config.toml` entry after verification.
