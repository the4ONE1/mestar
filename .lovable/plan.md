## What I found (the diagnosis)

Pulled Jaedan's actual stories from the database:

| Story | Age group | Spec says | Actual | Gap |
|---|---|---|---|---|
| Jaedan's Ocean Adventure & Pirates (Jun 3) | 11+ | 800–900 | **570 words** | ~30% short |
| jaedan's Outer Space (May 14) | 11+ | 800–900 | **729 words** | ~10% short |

**Verdict:** Gemini is undershooting the word target — sometimes badly. The spec itself is fine; the model just doesn't reliably hit it. So bumping the spec alone won't be enough — we also need to make the word-count instruction harder to ignore.

## What I'll change

### 1. Raise the targets (1–3 stays put, per your call)

Edit the `LAYER_1_SYSTEM_PROMPT` in `supabase/functions/generate-story/index.ts`:

| Age | Current | New |
|---|---|---|
| 1–3 | 350–500 | **unchanged** |
| 4–7 | 500–635 | **700–900** |
| 8–10 | 650–770 | **1,100–1,400** |
| 11+ | 800–900 | **1,600–2,000** |

### 2. Make Gemini actually hit the target

Two reinforcements so the model stops undershooting:
- Add a **MANDATORY MINIMUM WORD COUNT** rule near the top of the prompt, stated as a hard requirement (not a soft range), with an instruction to count and expand if under the minimum before outputting.
- Pass the exact min/max into the per-request user message (the same place we already inject the scene-count override), so it's reinforced at request time, not just buried in the system prompt.

### 3. Verify it worked

After deploying, re-run the paid-order test (the same bypass flow from the earlier plan) for an 11+ child and check the actual word count in the DB. If it lands in the new range, we're done. If it's still short, we tighten the prompt again (e.g. "If under N words, continue writing additional scenes/dialogue until you reach N").

## What this WON'T touch

- Coloring engine (Layer 2) and illustration engine (Layer 3) — unchanged
- Scene counts per age group — unchanged
- 1–3 word count — unchanged, per your decision
- Frontend, pricing, cart, checkout — untouched

## What you need to do

Just approve. After implementation I'll run one 11+ test order end-to-end and report the actual word count back to you.
