## What I already know

- The audiobook code path is wired correctly: `create-storybook` → seeds `storybook_audio` rows → fires `generate-audiobook` → ElevenLabs TTS → uploads MP3 + word timings → Library page polls and plays.
- The last real **paid** audiobook order (May 14, "jaedan's Outer Space") has all 5 pages fully generated with audio + word timings. That order plays fine.
- Yesterday's 11+ word-count **test order** (`d696aab7…`) has 5 audio rows seeded but no audio files. That's because the test used a one-off dev trigger that called `generate-story` directly and bypassed `create-storybook`, so `generate-audiobook` was never fired. It's not broken — it just wasn't run.
- `generate-audiobook` has no recent logs (nothing has called it since May 14).

So nothing in the data currently proves the audiobook feature is broken. To be sure, the safest move is to actually run the audiobook pipeline now on the test order and watch what happens end-to-end.

## Plan

1. **Trigger `generate-audiobook` directly** for the test order `d696aab7-c3a2-42a6-a00f-da7cf8af7eed` using its existing 5 seeded page rows. No code changes, no new functions, no customer impact, no Shopify charge.
2. **Tail the edge function logs** in real time to catch any ElevenLabs error, auth error, or storage upload error.
3. **Re-check the database** after it finishes — confirm all 5 rows now have `audio_storage_path` and `word_timings` populated.
4. **Open the Library page** for that order (`/library/d696aab7-…`) in the preview and confirm the karaoke player loads, plays audio, and highlights words.
5. **Report back in plain English** with one of three outcomes:
   - ✅ Works end-to-end → the feature is fine; what you saw was just the test order missing its audiobook step. No fix needed.
   - ⚠️ Works partially (e.g. some pages fail) → identify which step is flaky and propose a targeted fix.
   - ❌ Fails outright → share the exact error from the logs and propose a fix (most likely ElevenLabs API key, quota, or storage permissions).

## What this will NOT do

- No edits to any code, prompts, or config.
- No new edge functions, no cleanup needed afterward.
- No real customer affected; no Shopify order created or charged.
- No audiobook regeneration for the May 14 order — it's already complete.

## Technical detail (for reference)

- Call: `POST /functions/v1/generate-audiobook` with `{ "orderId": "d696aab7-c3a2-42a6-a00f-da7cf8af7eed" }` and `Authorization: Bearer <service role>`.
- Expected duration: ~30–60 seconds for 5 pages (sequential ElevenLabs calls).
- Verification query: `SELECT page_number, audio_storage_path IS NOT NULL FROM storybook_audio WHERE order_id = 'd696aab7-…' ORDER BY page_number`.
- Visual check: load `/library/d696aab7-c3a2-42a6-a00f-da7cf8af7eed` in the preview pane.

Approve and I'll run it.
