## Goal
Give you a single file you can open in your browser that shows every MESTAR product with a **"Copy"** button next to each field (title, description, price, link, image, etc.) — formatted exactly the way Google Merchant Center asks for it. Plus a **"Download CSV Feed"** button so you can upload all 4 sellable products to Merchant Center in one shot instead of typing anything.

## What you'll get
A file saved to your downloads area: `mestar-merchant-center.html`

When you open it, you'll see:

1. **Big green button at the top:** "Download Google Merchant CSV Feed" → gives you `mestar-products.csv` ready to upload directly to Merchant Center under **Products → Add products → Add multiple products → File upload**.
2. **A card for each product** with these fields, each with its own one-click **Copy** button:
   - `id` (unique product ID)
   - `title` (≤150 chars, SEO-optimized)
   - `description` (≤5000 chars, keyword-rich)
   - `link` (product URL on mestar.pro)
   - `image_link` (main product image)
   - `availability` (in_stock)
   - `price` (USD)
   - `brand` (MESTAR)
   - `condition` (new)
   - `google_product_category` (Media > Books)
   - `product_type` (your internal category)
   - `identifier_exists` (no — custom-made goods)
   - `age_group` / `gender` (kids / unisex)

## Products included (the 4 that are actually for sale)
1. Personalized Storybook — $19.99 — `/product/personalized-storybook`
2. Coloring Pages Add-On — $4.99 — `/product/coloring-pages`
3. Supporting Character Add-On — $9.99 — `/product/supporting-character`
4. Karaoke Audiobook Add-On — $9.99 — `/product/karaoke-audiobook`

The two "Coming Soon" items (Basic Audiobook, Hardback Bundle) will be **excluded** — Merchant Center will disapprove products that aren't purchasable yet. I'll add them back the day they go live.

## How you'll use it (dead simple)
1. I'll drop the file into your downloads panel.
2. You click it → it opens in your browser.
3. Click the green **Download CSV Feed** button.
4. In Google Merchant Center: **Products → Add products → File → Upload the CSV**.
5. Done. If Merchant Center wants you to edit anything by hand later, just come back to the HTML file and click Copy next to whatever field you need.

## Technical notes (you can ignore these)
- File is a self-contained static HTML page with inline JS for the copy buttons and CSV blob download — no server, no dependencies, works offline.
- CSV uses Google's official feed spec (tab-separated with `.csv` extension is also accepted; I'll use standard comma-separated for maximum compatibility).
- Saved to `/mnt/documents/mestar-merchant-center.html` so it appears in your artifacts panel for one-click download.
- Nothing in the actual mestar.pro codebase changes.
