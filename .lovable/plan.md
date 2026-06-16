## Goal
Fire one end-to-end test story per age group to surface any remaining issues (illustration parsing, coloring page generation, story length, supporting-character rule, PDF assembly) before we ship.

## Test matrix

| # | Age group | Expected scenes | Supporting char? | Theme | Strength |
|---|-----------|-----------------|------------------|-------|----------|
| 1 | 1-3   | 1 illustration + 1 coloring | No  | "playing in the backyard and meeting a friendly butterfly" | kindness |
| 2 | 4-7   | 2 illustrations + 2 coloring | Yes ("Bramble the bunny") | "lost mitten in the snowy park" | perseverance |
| 3 | 8-10  | 3 illustrations + 3 coloring | Yes ("Captain Luma the owl") | "broken telescope on the night of the meteor shower" | curiosity |
| 4 | 11+   | 4 illustrations + 4 coloring | No  | "first day volunteering at the animal shelter" | empathy |

Each run uses `dev-trigger-order` with `forceIllustrations: true` and `forceColoring: true`.

## Per-test checks

For every order I will verify:
1. **Status** reaches `complete` (not `failed`, not stuck `processing`).
2. **Scene count** matches the age-group rule above (illustrations + coloring).
3. **Storage paths** are populated for every page (`illustration_storage_paths` and `coloring_storage_paths` arrays full, no nulls).
4. **Supporting-character rule** (tests 2 & 3 only): the second character actively helps and the child still makes the final decision — read the story text.
5. **PDF assembly** completes and `pdf_url` is set.
6. **Edge function logs**: scan `generate-story` and `create-storybook` for any warnings or retries even when the run succeeded.

## Reporting

I'll deliver a single summary table:
- Order ID + library link per age group
- Pass/fail for each of the 6 checks
- Any anomalies found (with the exact log line) + a proposed fix for each

No code changes in this plan — purely diagnostic. If a test fails I'll stop and come back with a fix plan rather than patching mid-run.

## Cost
4 stories × ~10 image calls each ≈ $0.50–0.80 in AI credits total.

## Out of scope
- No changes to story rules, pricing, checkout, or UI.
- No re-test of the supporting-character rule beyond the two runs above (already validated in the prior Mia/Pip test).