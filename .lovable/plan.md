## Goal
Find out why the last test produced 0 illustrations and 0 coloring pages, and make sure the next real order doesn't ship a text-only PDF.

## What we know
- Order `ceebdd24…` finished with status `complete` and a PDF URL.
- `selected_addons` = `{ illustrations: true, coloring: false, audiobook: false }` — so **coloring was off on purpose** (the dev harness defaults it to false; real customers toggle it at checkout).
- `illustration_storage_paths` = 5 empty strings → every call to the Lovable AI image model returned null.
- Logs for that run are no longer in the window, so the exact failure is unknown.

## Plan

1. **Patch the dev harness** (`supabase/functions/dev-trigger-order/index.ts`) so we can flip `coloring` and `illustrations` from the request body instead of having them hardcoded. Defaults stay the same; we just stop being forced to edit code to test.

2. **Add clearer logging** in `supabase/functions/create-storybook/index.ts` around `generateImage`:
   - Log the HTTP status + first 200 chars of the error body when the image model fails.
   - Log a one-line summary per page: `illustration 3/5: ok` or `illustration 3/5: failed (status 429)`.
   This way the next failed run tells us exactly what happened (rate limit vs. content filter vs. timeout).

3. **Re-run a fresh test order** with the same Mia + Pip setup but with `illustrations: true` AND `coloring: true`, then immediately pull the create-storybook logs and report:
   - How many of 5 illustrations rendered
   - How many of 5 coloring pages rendered
   - Any error pattern (all fail = systemic; some fail = content/prompt issue)

4. **Fix based on what the logs show.** Most likely fixes, in order of probability:
   - **Rate limiting** → add a small delay between image calls (we already serialize them, may need 500ms gap) and a single automatic retry on 429.
   - **Content-filter rejection** → soften the prompt template (e.g. remove any wording the safety filter dislikes) and retry once.
   - **Bad data URL from the child photo** → fall back to a text-only prompt for that page instead of failing.

5. **Add a safety net for customers**: if fewer than, say, 3 of 5 illustrations succeed on a paid order, mark the order `needs_review` instead of `complete` so we can regenerate before the customer downloads a half-empty book. (No change to the customer-facing UI — purely a backend guardrail.)

## Out of scope
- No change to the story text engine or the new supporting-character rule.
- No change to pricing, checkout, or the customer-facing form.

## Technical notes
- Files touched: `supabase/functions/dev-trigger-order/index.ts`, `supabase/functions/create-storybook/index.ts`.
- No DB schema changes; `needs_review` is just a new value for the existing `status` text column.
- Cost: one extra test story generation (~$0.10–0.20 in image credits).
