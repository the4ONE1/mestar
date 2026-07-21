// Post-build SSG: renders each public route with react-dom/server and writes
// dist/<route>/index.html with real HTML + <head> for crawlers. Client-side
// hydration in main.tsx takes over for interactivity.

import { build } from "vite";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, resolve } from "path";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");
const serverDist = resolve(root, "dist-server");

// Public routes that benefit from SEO prerendering. Auth/checkout/admin excluded.
const ROUTES = [
  "/",
  "/about",
  "/faq",
  "/reviews",
  "/why-read-together",
  "/privacy-policy",
  "/membership",
  "/products",
  "/products/personalized-storybook",
  "/products/coloring-pages",
  "/products/supporting-character",
  "/products/karaoke-audiobook",
  "/products/basic-audiobook",
  "/products/paperback-storybook",
];

async function main() {
  if (!existsSync(dist)) {
    console.error("dist/ not found — run `vite build` first.");
    process.exit(1);
  }

  console.log("[prerender] building SSR bundle…");
  rmSync(serverDist, { recursive: true, force: true });
  await build({
    root,
    logLevel: "warn",
    build: {
      ssr: "src/entry-server.tsx",
      outDir: "dist-server",
      emptyOutDir: true,
      rollupOptions: { input: resolve(root, "src/entry-server.tsx") },
    },
  });

  // Minimal browser globals so top-level module code (e.g. supabase client
  // reading `localStorage`) doesn't crash during SSR import.
  const noopStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
  globalThis.localStorage = globalThis.localStorage || noopStorage;
  globalThis.sessionStorage = globalThis.sessionStorage || noopStorage;

  const entryPath = resolve(serverDist, "entry-server.js");
  const entryUrl = pathToFileURL(entryPath).href;
  const { render } = await import(entryUrl);

  const template = readFileSync(resolve(dist, "index.html"), "utf-8");

  let ok = 0;
  let fail = 0;
  for (const route of ROUTES) {
    try {
      const { html, head } = render(route);
      let out = template.replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`
      );
      if (head) {
        // Drop static default title/description; helmet supplies real ones.
        out = out.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
        out = out.replace(/<meta\s+name="description"[^>]*>\s*/i, "");
        out = out.replace("</head>", `${head}\n</head>`);
        // Helmet may emit multiple <title> tags (site default + page override).
        // Keep only the LAST one so crawlers see the page-specific title.
        const titles = out.match(/<title[^>]*>[\s\S]*?<\/title>/gi) || [];
        if (titles.length > 1) {
          for (let i = 0; i < titles.length - 1; i++) {
            out = out.replace(titles[i], "");
          }
        }
        // Same for meta description.
        const descs = out.match(/<meta[^>]+name="description"[^>]*>/gi) || [];
        if (descs.length > 1) {
          for (let i = 0; i < descs.length - 1; i++) {
            out = out.replace(descs[i], "");
          }
        }
      }
      const filePath =
        route === "/"
          ? resolve(dist, "index.html")
          : resolve(dist, route.replace(/^\//, ""), "index.html");
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, out);
      ok++;
      console.log(`[prerender] ✓ ${route}`);
    } catch (err) {
      fail++;
      console.warn(`[prerender] ✗ ${route}:`, err && err.message ? err.message : err);
    }
  }

  rmSync(serverDist, { recursive: true, force: true });
  console.log(`[prerender] done — ${ok} ok, ${fail} failed`);
}

main().catch((err) => {
  console.error("[prerender] fatal:", err);
  process.exit(1);
});
