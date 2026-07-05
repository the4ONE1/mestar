# Goal

Fix the four reliability issues uncovered in the age 11+ test run without changing any customer-facing behavior, UI, pricing, story content, or the happy-path flow. Every change is defensive: it only kicks in when something is already going wrong.

# Safety guarantees

- No UI changes.
- No changes to story text, illustration art style, coloring rules, or prompts.
- No changes to the order flow, cart, checkout, Shopify integration, or email sending.
- No database schema changes (no new columns, no migrations). The `needs_review` status is just a string written into the existing `status` field — already a free-text column.
- No changes to function signatures or how the frontend calls anything.
- All retries have hard caps so a function can never loop forever or blow past Supabase's execution time limit.
- If every retry still fails, behavior is the same as today (the call returns null / the illustration is skipped) — just with logs and a status flag so we can see it.

# What changes (4 small, isolated edits)

### 1. `generate-story` — stop silently swallowing Layer 2 / Layer 3 errors
Today: `r.ok ? r.json() : null` — if the AI call fails, we get `null` and move on with no log.
Change: wrap each of the two chat calls in a small helper that
- logs the HTTP status + first 500 chars of the error body when non-OK,
- retries up to 2 times on 429 / 5xx with waits of 2s then 5s,
- still returns `null` after final failure (same as today) so nothing downstream breaks.

### 2. `create-storybook` — stronger retry on image generation 429s
Today: one retry after 1.5s, then gives up.
Change: up to 3 retries with waits of 1.5s → 4s → 10s. Still sequential, still gives up gracefully after the last attempt (same fallback path as today: scene is skipped, PDF still builds).

### 3. `create-storybook` — add a "needs_review" safety net
After all illustrations are attempted, compare rendered count vs expected scene count.
- If rendered < expected (or coloring pages were purchased but zero coloring prompts came back) → set `status = 'needs_review'` instead of `'complete'`.
- PDF, storage upload, and email all still happen exactly as today, so the customer is not blocked. This is purely an internal flag so you can spot broken orders in the dashboard instead of them looking fine.

### 4. `create-storybook` — trim `illustration_storage_paths` to actual scene count
Today: array is always padded to length 5, making diagnostics confusing.
Change: store only the real slots (length = expected scene count for that age). Pure cosmetic; nothing reads the trailing nulls.

# What is explicitly NOT changing

- The "MESTAR ILLUSTRATION ENGINE" prompt, art style, likeness-lock text.
- The age-band scene counts (1/2/3/4).
- Coloring page logic, Layer 1 story rules, second-character rules.
- `dev-trigger-order`, the Shopify webhook, the order-status endpoint, the customer email.
- Anything in `src/` (frontend untouched).

# Files touched

- `supabase/functions/generate-story/index.ts` — add `callChatWithRetry` helper, swap two call sites.
- `supabase/functions/create-storybook/index.ts` — extend image retry loop, add post-loop count check that sets `needs_review`, trim storage-paths array.

# Verification after deploy

1. Re-run all 4 age-band test orders via `dev-trigger-order` with `forceIllustrations: true` + `forceColoring: true`.
2. Confirm: all 4 finish with rendered count == expected, status = `complete`, storage paths length matches scene count.
3. Check edge function logs for the new retry log lines (should be quiet on a clean run).
4. As a negative test, temporarily lower the image-gen retry cap in a one-off run to confirm the `needs_review` flag actually fires when illustrations are missing (then revert).

# Risk assessment

- Worst case if a retry helper has a bug: a chat/image call fails the same way it does today (returns null, scene skipped). No regression vs current behavior.
- Worst case for `needs_review`: an order that would have been marked `complete` is marked `needs_review` instead — still delivered to the customer, just flagged for your review. No customer-visible difference unless you wire up an alert later.
