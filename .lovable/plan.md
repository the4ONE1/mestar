

# Plan: Coloring Page Distribution for Second Character

## What This Changes

When a customer uploads a second character (supporting character), the 5 coloring pages will follow a specific distribution:
- **3 pages**: Main character only (Pages 1, 3, 5)
- **1 page**: Both characters together (Page 2)
- **1 page**: Second character only (Page 4)

Both characters maintain absolute appearance consistency throughout all pages.

## Technical Details

**File to change:** `supabase/functions/generate-story/index.ts`

**Change 1 — Layer 2 System Prompt (Coloring Engine)**

Update the `SUPPORTING CHARACTER` section within the `CHARACTER CONSISTENCY RULE` block (~lines 319-324) to add explicit page distribution rules:

```
3. SUPPORTING CHARACTER (if included):
   - Define their appearance once with the same specificity
   - Copy their EXACT description into every prompt where they appear
   - Must be visually distinct from the main character
   - Must also remain identical across all pages

   PAGE DISTRIBUTION (when supporting character is included):
   - COLOR_PAGE_1: Main character ONLY
   - COLOR_PAGE_2: BOTH characters together in the scene
   - COLOR_PAGE_3: Main character ONLY
   - COLOR_PAGE_4: Supporting character ONLY (solo scene)
   - COLOR_PAGE_5: Main character ONLY

   For the BOTH page:
   - Both characters share the scene interacting together
   - Main character remains the focal point (slightly larger or foreground)
   - Include BOTH character reference blocks verbatim

   For the SOLO supporting character page:
   - Supporting character is the central figure
   - Use their EXACT reference description
   - Show them in an action moment from the story
```

**Change 2 — Layer 2 Prompt Structure Output section (~lines 360-394)**

Add a note to the prompt structure reminding the model to follow page distribution:

```
If a supporting character is included, follow the PAGE DISTRIBUTION rules:
Pages 1, 3, 5 = main character only.
Page 2 = both characters together.
Page 4 = supporting character only.
Include the appropriate CHARACTER_REFERENCE and/or SUPPORTING_CHARACTER_REFERENCE in each prompt accordingly.
```

**Change 3 — Layer 2 Quality Control Rule (~lines 397-410)**

Add verification step:
```
- If supporting character is included, verify page distribution:
  Pages 1, 3, 5 show main character only
  Page 2 shows both characters together
  Page 4 shows supporting character only
```

No functionality changes — same API, same inputs, same outputs. Only the AI prompts are updated to specify how the second character appears across the coloring pages.

