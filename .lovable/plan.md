## Plan: Make the $9.99 Premium Audiobook Actually Premium

### What I confirmed
- The Library page already has a basic word-highlight/tap-word system, but the visible experience is too close to the simple read-along.
- Both Classic and Interactive currently use the same generated audio data.
- The live environment currently only lists one audiobook price lookup key, so the two audiobook products need to be separated cleanly.

### Changes I will make
1. **Separate the products clearly**
   - Keep **Classic Audiobook** as the lower-priced simple listening option.
   - Keep **Interactive Read-Along** as the premium $9.99 option.
   - Make sure checkout stores which tier was purchased so the customer lands in the correct player.

2. **Upgrade the premium player UI**
   - Add a clearly visible “Learning Mode” experience for Interactive.
   - Keep karaoke-style highlighting active while narration plays.
   - Add tappable words with replay behavior.
   - Add helpful reading tools beside the active/tapped word, such as:
     - word replay
     - syllable-style breakdown
     - simple phonics hint
     - child-friendly “sound it out” prompt
   - Keep Classic as a clean simple player without those learning tools.

3. **Improve the premium sample link behavior**
   - Make `?tier=interactive` reliably force the premium learning player for sample/demo links.
   - Make `?tier=classic` reliably show the basic player.

4. **Make the upsell copy match reality**
   - Rename/copy so the customer understands:
     - Classic = narration/player
     - Interactive = karaoke highlighting + tap words + reading help
   - Avoid selling the premium tier as educational unless the page truly shows the educational tools.

5. **Verify end-to-end**
   - Test the Library page with the existing sample order link in both Classic and Interactive modes.
   - Confirm the premium page visibly shows karaoke/learning tools and the basic page does not.

### Technical notes
- Files likely touched: `src/pages/Library.tsx`, `src/pages/Upsell.tsx`, and Stripe price environment mapping if needed.
- I will not change unrelated story generation, image generation, or PDF behavior.