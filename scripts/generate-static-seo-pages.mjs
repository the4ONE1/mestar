import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const SITE_URL = "https://mestar.pro";
const PRODUCT_PATH = "/product/my-star-stories-personalized-bedtime-story-5-coloring-pages";
const SHELL = readFileSync(resolve("index.html"), "utf8");
const OUT_DIR = resolve("public");
const DEFAULT_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/hfdVpZRvZ4hMNWvlpFRlEdIJbxm2/social-images/social-1775247101557-576.webp";

const pages = [
  {
    path: "/",
    title: "MESTAR — Personalized Storybooks Starring Your Child",
    description:
      "Create a personalized children's storybook in minutes. Upload a photo, pick a theme, and download a print-ready PDF starring your child.",
    h1: "MESTAR — Personalized Storybooks Starring Your Child",
    body: [
      "Create a personalized children's storybook in minutes. Upload a photo, choose an adventure theme, and download a print-ready digital PDF where your child is the hero.",
      "Each MESTAR order includes a custom storybook plus matching printable coloring pages. Stories are non-violent, age-appropriate, and designed for reading together.",
      "Start with a child photo, name, age group, and theme such as fairy tale, ocean adventure, outer space, dinosaurs, or prince and princess.",
    ],
    links: [
      [PRODUCT_PATH, "Personalize a storybook"],
      ["/about", "About MESTAR"],
      ["/reviews", "Read reviews"],
      ["/faq", "Questions and answers"],
    ],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "MESTAR",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.ico`,
      description: "Personalized digital PDF storybooks where your child is the hero.",
    },
  },
  {
    path: "/about",
    title: "About MESTAR — Personalized Children's Storybooks",
    description:
      "Learn the story behind MESTAR: AI-personalized PDF storybooks where your child is the hero. Safe, age-appropriate, and made to be treasured.",
    h1: "About MESTAR",
    body: [
      "MESTAR creates personalized digital storybooks that place your child at the center of a magical adventure.",
      "Every child deserves to see themselves as the hero. Our stories are crafted to build confidence, spark imagination, and make bedtime feel meaningful.",
      "Each story is age-appropriate, non-violent, empowering, and delivered as an instant PDF with bonus coloring pages.",
    ],
    links: [[PRODUCT_PATH, "Create your story"], ["/why-read-together", "Why reading together matters"], ["/faq", "FAQ"]],
  },
  {
    path: "/why-read-together",
    title: "Why Read Together — The Power of Bedtime Stories | MESTAR",
    description:
      "Reading together builds bonds, sparks imagination, and grows confidence. Discover why personalized stories where your child is the hero matter most.",
    h1: "Why Reading Together Is the Best Gift for Your Child",
    body: [
      "Reading together creates closeness children carry with them for life. It gives them your time, attention, and a story they can remember.",
      "Personalized stories make that moment even stronger because your child hears their own name and sees themselves as the brave problem-solver.",
      "MESTAR storybooks are designed for bedtime reading, confidence, imagination, and family connection.",
    ],
    links: [[PRODUCT_PATH, "Create their story"], ["/about", "About MESTAR"], ["/reviews", "Reviews"]],
    type: "article",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Why Reading Together Is the Best Gift for Your Child",
      author: { "@type": "Organization", name: "MESTAR" },
      publisher: { "@type": "Organization", name: "MESTAR", logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` } },
      mainEntityOfPage: `${SITE_URL}/why-read-together`,
    },
  },
  {
    path: "/reviews",
    title: "Reviews — What Families Say About MESTAR Storybooks",
    description:
      "Real reviews from parents and kids who received MESTAR personalized storybooks. See why families love making their child the hero of the story.",
    h1: "MESTAR Reviews from Families",
    body: [
      "Families love watching their child react to becoming the hero of their own personalized storybook.",
      "Parents describe the stories as magical, personal, and meaningful, with coloring pages that keep the adventure going after reading time.",
      "MESTAR storybooks are created for birthdays, bedtime surprises, family gifts, and everyday confidence-building moments.",
    ],
    links: [[PRODUCT_PATH, "Create your story"], ["/faq", "Read questions"], ["/about", "About MESTAR"]],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "MESTAR Personalized Storybook",
      description: "Personalized children's PDF storybook starring your child, with matching coloring pages.",
      brand: { "@type": "Brand", name: "MESTAR" },
      aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: "3", bestRating: "5", worstRating: "1" },
    },
  },
  {
    path: "/faq",
    title: "FAQ — Personalized Storybook Questions Answered | MESTAR",
    description:
      "Answers to common questions about MESTAR's personalized PDF storybooks: how personalization works, what you get, safety, delivery, and refunds.",
    h1: "Frequently Asked Questions About MESTAR",
    body: [
      "With each order, you receive a personalized digital PDF storybook starring your child plus bonus coloring pages featuring scenes from the adventure.",
      "To personalize the story, upload a clear child photo, enter their first name, choose age group and gender, and pick a story theme.",
      "Stories are non-violent, age-appropriate, and created to make your child the hero and problem-solver.",
    ],
    links: [[PRODUCT_PATH, "Start your story"], ["/privacy-policy", "Privacy policy"], ["/about", "About MESTAR"]],
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What do I get with my order?", acceptedAnswer: { "@type": "Answer", text: "A personalized digital PDF storybook where your child is the hero, plus bonus coloring pages." } },
        { "@type": "Question", name: "How does personalization work?", acceptedAnswer: { "@type": "Answer", text: "Upload a child photo, enter their name, choose age group and gender, and pick a story theme." } },
        { "@type": "Question", name: "Is the content safe?", acceptedAnswer: { "@type": "Answer", text: "Yes. Stories are age-appropriate, non-violent, and empowering." } },
      ],
    },
  },
  {
    path: PRODUCT_PATH,
    title: "Personalized Bedtime Story + Coloring Pages | MESTAR",
    description:
      "Create a personalized digital PDF storybook starring your child, with full-color illustrations and matching printable coloring pages included.",
    h1: "Personalized Bedtime Story + Coloring Pages Included",
    body: [
      "Make your child the hero of a one-of-a-kind digital storybook. Upload a photo, choose their name, age group, and adventure theme, then receive a personalized PDF.",
      "Your order includes a custom storybook, full-color illustrations, and matching printable coloring pages.",
      "This is a digital PDF product with instant download. There is no physical shipping.",
    ],
    links: [["/faq", "Product questions"], ["/reviews", "Family reviews"], ["/privacy-policy", "Photo privacy"]],
    type: "product",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Personalized Bedtime Story + Coloring Pages Included",
      description: "A personalized digital PDF storybook starring your child, with matching coloring pages.",
      image: [DEFAULT_IMAGE],
      brand: { "@type": "Brand", name: "MESTAR" },
      category: "Media > Books > Digital Books",
      offers: { "@type": "Offer", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${SITE_URL}${PRODUCT_PATH}` },
    },
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy — MESTAR",
    description:
      "How MESTAR handles your family's information: photos, payment, and personal details. Read our privacy commitments in plain English.",
    h1: "MESTAR Privacy Policy",
    body: [
      "MESTAR collects only the information needed to create and deliver your child's personalized storybook: first name, age group, gender selection, photo, story preferences, and email address.",
      "Uploaded photos are used only for generating your child's story and coloring pages. Photos are permanently deleted after 30 days.",
      "Payments are handled through secure checkout. MESTAR does not see or store credit card details.",
    ],
    links: [[PRODUCT_PATH, "Create a storybook"], ["/faq", "FAQ"], ["/about", "About MESTAR"]],
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function attrs(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");
}

function headFor(page) {
  const canonical = `${SITE_URL}${page.path}`;
  const type = page.type || "website";
  const jsonLd = page.jsonLd || {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: "MESTAR", url: SITE_URL },
  };

  return [
    `<title data-rh="true">${escapeHtml(page.title)}</title>`,
    `<meta data-rh="true" name="description" content="${escapeHtml(page.description)}" />`,
    `<link data-rh="true" rel="canonical" href="${canonical}" />`,
    `<meta data-rh="true" property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta data-rh="true" property="og:description" content="${escapeHtml(page.description)}" />`,
    `<meta data-rh="true" property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:image" content="${DEFAULT_IMAGE}">`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:image" content="${DEFAULT_IMAGE}">`,
    `<meta data-rh="true" name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta data-rh="true" name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `<script data-rh="true" type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ].join("\n    ");
}

function crawlableBody(page) {
  const links = page.links
    .map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`)
    .join("");
  const paragraphs = page.body.map((text) => `<p>${escapeHtml(text)}</p>`).join("");
  return `<main><h1>${escapeHtml(page.h1)}</h1>${paragraphs}<nav aria-label="Important pages"><ul>${links}</ul></nav></main>`;
}

function replaceHead(html, page) {
  return html.replace(/<title[\s\S]*?<\/title>/, "__SEO_HEAD__")
    .replace(/\s*<meta[^>]+name=["']description["'][^>]*>/gi, "")
    .replace(/\s*<link[^>]+rel=["']canonical["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+property=["']og:title["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+property=["']og:description["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+property=["']og:url["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+property=["']og:type["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+property=["']og:image["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+name=["']twitter:card["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+name=["']twitter:image["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+name=["']twitter:title["'][^>]*>/gi, "")
    .replace(/\s*<meta[^>]+name=["']twitter:description["'][^>]*>/gi, "")
    .replace(/\s*<script[^>]+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, "")
    .replace("__SEO_HEAD__", headFor(page));
}

for (const page of pages) {
  if (page.path === "/") continue;
  const filePath = page.path === "/" ? resolve(OUT_DIR, "index.html") : resolve(OUT_DIR, `.${page.path}/index.html`);
  const html = replaceHead(SHELL, page).replace(/<div id="root">[\s\S]*?<\/div>\s*<script type="module"/, `<div id="root">${crawlableBody(page)}</div>\n    <script type="module"`);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
}

console.log(`Generated ${pages.length} static SEO entry pages.`);
