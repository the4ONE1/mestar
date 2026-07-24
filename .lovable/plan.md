I'll build a simple internal page at `/ad-links` that lists 6 high-converting landing page URLs for Google Ads, each with a one-click copy button.

### What I will build

1. **New page** `src/pages/AdLinks.tsx` with a clean, centered layout.
2. **6 ad-optimized links** (each in its own card with a label, URL, and "Copy" button):
   - `https://mestar.pro/` — Homepage / Hero Demo
   - `https://mestar.pro/products/personalized-storybook` — Personalized Storybook
   - `https://mestar.pro/products/coloring-pages` — Bonus Coloring Book Add-On
   - `https://mestar.pro/products/supporting-character` — Supporting Character Add-On
   - `https://mestar.pro/reviews` — Reviews / Social Proof
   - `https://mestar.pro/why-read-together` — Why Read Together
3. **One-click copy behavior**: each button copies its URL to the clipboard and briefly shows "Copied!" so you know it worked.
4. **Route**: add `/ad-links` to `src/App.tsx`.
5. **SEO basics**: `<title>`, `<meta name="description">`, and `<link rel="canonical">` on the page so it is also crawler-friendly.

### Notes
- The page will be public but not linked in the main navigation, so it stays out of the customer path.
- I will use the current canonical domain `https://mestar.pro` for all URLs.
- If you want a different set of 6 links, just reply with the changes and I will adjust the plan before building.
