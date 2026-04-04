

# Plan: Adjust Story Word Counts

## New Word Count Ranges

Evenly spaced between 1–3 (350–500) and 11+ (800–900):

| Age Group | Current | New |
|-----------|---------|-----|
| 1–3 | 350–500 | 350–500 (unchanged) |
| 4–7 | 400–575 | **500–635** |
| 8–10 | 460–660 | **650–770** |
| 11+ | 530–760 | **800–900** |

## Technical Change

**One file**: `supabase/functions/generate-story/index.ts`

Update the 4 word count ranges in the Layer 1 system prompt (lines 28–56). Also remove the "15% more complex" phrasing since we're now using explicit even spacing.

