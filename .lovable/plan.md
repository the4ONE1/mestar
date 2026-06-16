## The short answer

**Yes — easy and safe.** The story generator already has a dedicated "SUPPORTING CHARACTER RULES" section in the Layer 1 prompt (lines 146–155 of `supabase/functions/generate-story/index.ts`). We just rewrite that one block. No other code, no database, no illustration logic, no coloring logic is affected.

## What it says today

```
If included:
- They encourage but do not solve.
- Loved one makes the key decision.
- Loved one receives credit for resolution.
```

So today the 2nd character is allowed to just hang around. Your new rule tightens that.

## What it will say after the change

```
If a supporting character is included:
- They MUST actively help the main character in a meaningful way.
- Their help must take the form of either:
    (a) positive advice, encouragement, or a key insight, OR
    (b) a concrete helpful action (sharing a tool, showing the way,
        offering a clue, lending a hand).
- Their contribution must be CRITICAL to the main character reaching
  the solution — without it, the main character could not have solved
  the challenge as they did.
- HOWEVER, the main character is still the hero:
    * The main character makes the final key decision.
    * The main character performs the resolving action.
    * The main character receives the credit for the resolution.
- The supporting character never solves the problem for them,
  never takes over, and never overshadows the main character.
- The supporting character is never a villain, obstacle, or
  source of conflict.
```

## Why this is safe

1. **One file, one block.** Only the "SUPPORTING CHARACTER RULES" text changes. No function signatures, no schema, no Layer 2 (coloring) or Layer 3 (illustrations) prompts touched.
2. **No conflict with existing rules.** The "main character is the hero / makes the decision / gets the credit" guardrails stay intact, so the trait-integration and resolution structure still work.
3. **No impact when there's no 2nd character.** The rule is gated on "If a supporting character is included" — solo-hero stories behave exactly as before.
4. **No impact on illustration distribution.** The page-by-page rule ("Page 2 = both characters, Page 4 = supporting only", etc.) lives separately and stays untouched.

## What I'll do when you approve

1. Edit `supabase/functions/generate-story/index.ts`, replacing only the SUPPORTING CHARACTER RULES block with the version above.
2. Deploy `generate-story`.
3. Run one test story with a supporting character via `dev-trigger-order` and read the output to confirm the 2nd character is shown actively helping while the main child still solves it.

## One thing to confirm with you

Do you also want this rule to apply when the supporting character is a **pet or animal** (e.g. a dog, a dragon, a parrot)? My recommendation: **yes** — same rule, the pet helps via action/clue rather than spoken advice. Say the word and I'll include pets in the rule wording.
