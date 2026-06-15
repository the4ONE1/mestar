## Goal

Add a permanent, reusable dev-only test trigger that simulates a fully paid order end-to-end — including audiobook generation — so test runs match real customer behavior.

## What I'll build

A new edge function **`dev-trigger-order`** that mirrors what the Shopify "order paid" webhook does, but skips Shopify entirely. You pass it the same personalization details you'd type in the form, and it runs the complete pipeline:

```text
dev-trigger-order
   ├─ create pending order row in DB (forces audiobook = true)
   ├─ call generate-story
   ├─ call create-storybook (PDF + illustrations)
   └─ create-storybook auto-fires generate-audiobook
```

By the time it returns, the order has: story, PDF, illustrations, and audiobook (audio files + word-by-word timings on all pages) — exactly like a real paid order.

## Inputs (with sensible defaults)

You send a small JSON body, all optional:
- `childName` (default: "Test Kid")
- `childAge` (default: "8-10")
- `theme` (default: "space adventure")
- `strength` (default: "courage")
- `hasSupportingCharacter` / `supportingCharacterName` (default: false / none)
- `customerEmail` (default: your account email)
- `forceAudiobook` (default: **true**)

Returns: `{ orderId, libraryUrl }` so you can open `/library/<orderId>` immediately to hear the audiobook.

## Security

- Server-to-server auth only: requires `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` (same pattern as `generate-story` and `create-storybook`).
- Cannot be called from the browser without the service-role key, so no risk of customers triggering free test orders.
- Marked with a `status: "dev_test"` order tag in the DB so test orders are easy to spot and exclude from reports later.

## What this changes vs. doesn't

Changes:
- New file: `supabase/functions/dev-trigger-order/index.ts`

Doesn't change:
- No edits to `generate-story`, `create-storybook`, `generate-audiobook`, or the Shopify webhook.
- No DB schema migration.
- Real paid orders behave exactly as before.

## How you'll use it

After it's deployed, I can trigger a test run for you on demand (any age, any theme) and confirm the audiobook plays at `/library/<orderId>`. No more one-off shortcut scripts; this becomes the standard way we test.

## Out of scope

- A UI button to trigger test orders (can add later if useful).
- Auto-cleanup of old test orders (can add a scheduled purge later).
