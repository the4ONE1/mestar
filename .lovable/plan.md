## Goal

Run one end-to-end paid-order bypass test on an 11+ child and confirm the new story lands in the 1,600–2,000 word target range.

## Steps

1. **Pick a test order**
  Use the existing pending 11+ test order `d696aab7-c3a2-42a6-a00f-da7cf8af7eed` (Jaedan, 11+, 0
  - Switch its `customer_email` to a mailbox you can actually check (please tell me which inbox — e.g. `mestar.orders@gmail.com`) so the delivery email lands somewhere visible.
  - Keep its existing add-ons (illustrations + coloring). Skip audiobook for this test so we isolate the story-length fix and don't burn extra time/credits.
2. &nbsp;
3. &nbsp;
  [fieldgar369@gmail.com](mailto:fieldgar369@gmail.com)).
4. **Trigger generation**
  Call the `create-storybook` edge function with that order ID — the same function the Shopify webhook calls on `orders/paid`. This runs story → illustrations → coloring → PDF → email and flips status to `complete`.
5. **Watch the run**
  Tail the `create-storybook` and `generate-story` edge function logs in real time so we catch any failure as it happens.
6. **Measure the result**
  Once status = `complete`, query the database for the new `story_text` and count the words. Report:
  - Actual word count
  - Whether it hit the 1,600–2,000 target
  - Story title
7. **Verify customer-facing output**
  - PDF download link works
  - Delivery email arrived
  - Order row shows `status = complete`, `pdf_url` populated
8. **Report back**
  Plain-English summary: "✅ Hit target at N words" or "❌ Came in at N words — here's what I'll tighten next."

## What this WON'T do

- No real Shopify charge, no customer impact
- No production code changes during the test (the prompt fix is already deployed)
- No audiobook generation this run

## What I need from you

1. **Which email address** should receive the delivery email so you can check it? (Or just say "skip the email check" and I'll only verify the DB + PDF.)
2. Approve and I'll run it. Generation typically takes ~2–4 minutes.