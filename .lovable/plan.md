## Goal
Simulate a fully paid order end-to-end (without real payment) to confirm the post-checkout pipeline still works: story generation → illustrations → PDF assembly → audiobook → delivery email → library page.

## How it will work
One of your two recent `pending_payment` test orders (the `fieldgar369@gmail.com` carts from June 2 & 3) will be promoted to a "paid" state by directly invoking the same backend functions that the Shopify webhook would call after a real payment. No real money moves, no Shopify charge, no customer impact.

## Steps

1. **Pick the test order**  
   Use the most recent one: `d696aab7-c3a2-42a6-a00f-da7cf8af7eed` (June 3, fieldgar369@gmail.com, coloring + illustrations add-ons selected).  
   - Optionally add `audiobook: true` to its `selected_addons` so the audiobook pipeline is exercised too.  
   - Set `customer_email` to a mailbox you can actually check (e.g. `mestar.orders@gmail.com`) so the delivery email lands somewhere you can see.

2. **Mark as paid + kick off generation**  
   Call the `create-storybook` edge function (the same function the Shopify webhook calls on `orders/paid`) with that order ID. This:
   - Flips status from `pending_payment` → `generating`
   - Runs the story engine (Layer 1)
   - Generates illustrations
   - Generates coloring pages (Layer 2)
   - Generates audiobook (if enabled)
   - Assembles the PDF
   - Sends the delivery email
   - Sets status to `complete`

3. **Watch it run**  
   Tail the edge function logs in real time so we catch any errors as they happen (story gen, image gen, PDF assembly, email send).

4. **Verify the customer-facing outputs**  
   - PDF: open the download link from the order-complete page  
   - Audiobook: open `/library/<order-id>` and confirm karaoke playback works  
   - Email: confirm the delivery email arrived with the correct download links  
   - Order row: confirm `status = complete`, `pdf_url` populated, `story_title` set

5. **Report back**  
   Plain-English summary: "Everything works ✅" or "Step X broke, here's why and here's the fix."

## What you'll need to do
Just approve the plan. After that I'll do everything and report results. Generation takes ~2–4 minutes depending on add-ons.

## What this WON'T do
- Will not charge anything
- Will not create a Shopify order
- Will not touch any real customer's data
- Will not change any production code — purely a runtime test of the existing pipeline