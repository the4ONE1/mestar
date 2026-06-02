
# Fix: Weird font on live mestar.pro headings

## Why it's happening

Your site uses two Google Fonts:
- **Baloo 2** — for all headings
- **Nunito** — for body text

Right now they're loaded from a single line at the top of `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:...&family=Nunito:...');
```

This works in the Lovable preview (everything is cached and warm) but on a real visitor's browser at `mestar.pro` the `@import` is the **slowest possible way to load a web font** — it blocks until the CSS file has fully downloaded, *then* fetches the font CSS, *then* fetches each font file. If anything is slow or blocked, the browser falls back to a default serif font, which is why your headings look "weird."

## The fix (one tiny change)

Move the Google Fonts loader from `src/index.css` into the `<head>` of `index.html` as a proper `<link>` tag with `preconnect`. This is the pattern Google itself recommends:

1. **Edit `index.html`** — add 3 lines inside `<head>`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@300;400;500;600;700&display=swap" rel="stylesheet">
   ```

2. **Edit `src/index.css`** — delete the old `@import` line at the top.

## What this changes

- ✅ Headings on `mestar.pro` will load in **Baloo 2** consistently
- ✅ Page loads faster (font request starts in parallel with everything else, instead of after the CSS finishes)
- ✅ `display=swap` ensures text always shows — first in a system fallback, then swaps to Baloo 2 the instant it arrives, instead of staying invisible or wrong
- ❌ No design changes, no other files affected, no risk of breaking anything else

After I apply this you'll need to **hard-refresh `mestar.pro`** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows) once to clear the old cached version — then the correct font will stick for all visitors forever.
