## Goal
Verify the updated "Supporting Character Rules" in `generate-story` produce a story where the 2nd character gives critical positive help that's essential to the main character's solution — without breaking the main character's hero role.

## Steps

1. **Fire a test order** via the `dev-trigger-order` edge function with:
   - Main character: a child hero (e.g. "Mia", age 6)
   - Supporting character: a clearly secondary character (e.g. a friendly fox named "Pip")
   - Theme: simple problem-to-solve plot (e.g. "lost in the forest at sunset")
   - Audiobook: off (faster, story text is what we're checking)

2. **Wait for `generate-story` to finish** (~20–40s), then pull the generated story pages from the database.

3. **Read the story end-to-end** and check against the new rules:
   - Pip (2nd character) shows up and actively helps (advice or action)
   - Pip's contribution is **critical** — without it Mia couldn't solve it
   - Pip does **not** solve the problem, take over, or act as villain
   - Mia makes the final decision and performs the resolving action
   - Mia gets the credit at the end

4. **Report back** with:
   - A link to the generated book in the library
   - A short pass/fail on each of the 5 checks above
   - Any rule tweaks needed if the model under- or over-shoots

## Notes
- Read-only test for the rule change — no code edits planned unless the output misses a check, in which case I'll come back with a small prompt tweak proposal before changing anything.
- Cost: one short story generation (no audio, no illustrations needed for this check — but I'll let illustrations run since they're part of the normal pipeline; say the word if you want me to skip them to save credits).
