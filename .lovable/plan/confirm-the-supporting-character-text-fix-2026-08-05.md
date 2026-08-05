# Confirm the supporting-character text fix

The last test proved the 2nd-character add-on works end to end: the pet photo drove both illustrations consistently, and Buddy actively helped Jaedan. The only defect was in the written story — it invented a species ("a playful sea otter", whiskers, chittering) that contradicted the uploaded golden retriever puppy. The story engine now carries an absolute appearance rule and is already deployed.

Next step is one verification run to prove the text obeys it.

## What I'll do

1. Reuse the same two test photos (child + puppy) and create one pending test order with only the supporting-character add-on.
2. Trigger the pipeline the same way the live webhook does.
3. Read the generated story text and check that Buddy is referred to only by name or a neutral relationship term — no species, breed, age, appearance, or species-specific body parts and sounds.
4. Confirm the puppy still matches the uploaded photo in the illustrations.
5. If any species word slips through, tighten the rule and re-run until the text is clean.
6. Delete the test order rows, test photos, and the temporary test-order patch in the synthetic webhook function.

## Notes

- This is a synthetic run, so no card is charged and nothing hits real customers.
- Costs a small amount of AI credits for one story plus two illustrations and two coloring pages.
- No customer-facing UI or pricing changes are involved.

## Technical detail

- Insert a `pending_payment` row in `storybook_orders` with `has_supporting_character = true`, `supporting_character_name = 'Buddy'`, and `selected_addons.character = true`; upload both photos to the `customer-photos` bucket and reference them via `child_photo_path` / `supporting_character_photo_path`.
- Drive generation through `synthetic-live-webhook-test` with the existing order id, which fires `generate-story` then `create-storybook` via `EdgeRuntime.waitUntil`.
- Grep the resulting `story_text` for 6 and appearance terms; inspect the assembled PDF pages as images.
- Revert the `orderId` passthrough in `supabase/functions/synthetic-live-webhook-test/index.ts` after the run so the test surface stays minimal.