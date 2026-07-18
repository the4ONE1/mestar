import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sparkles, CheckCircle2, Star, Download, ShieldCheck, Clock,
  BookOpen, Palette, Users, Mic, Volume2, Package, ArrowRight,
} from "lucide-react";
import SEO from "@/components/SEO";

type Landing = {
  slug: string;
  title: string;         // SEO <title>
  h1: string;
  price: number;         // 0 = coming soon / not sellable yet
  metaDescription: string;
  shortPitch: string;
  icon: React.ComponentType<{ className?: string }>;
  bullets: string[];
  faqs: { q: string; a: string }[];
  comingSoon?: boolean;
  addon?: boolean;
  ctaLabel: string;
  ctaHref: string;       // where the buy button goes
  image: string;         // absolute or root-relative for og:image
  googleCategory: string;
};

const HERO_IMG =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/hfdVpZRvZ4hMNWvlpFRlEdIJbxm2/social-images/social-1775247101557-576.webp";

export const LANDINGS: Record<string, Landing> = {
  "personalized-storybook": {
    slug: "personalized-storybook",
    title: "Personalized Storybook for Kids — Your Child Is the Hero | MESTAR",
    h1: "A Personalized Storybook Where Your Child Is the Hero",
    price: 19.99,
    metaDescription:
      "Upload your child's photo, pick a theme, and get a printable PDF storybook where they're the hero — plus matching coloring pages. Delivered in minutes.",
    shortPitch:
      "One-of-a-kind digital PDF storybook starring your child. Full-color illustrations, age-appropriate story, and matching coloring pages included.",
    icon: BookOpen,
    bullets: [
      "Your child's name, photo, and personality woven into every page",
      "Age-tuned stories from toddlers to 11+",
      "5 magical themes: fairy tale, ocean, space, dinosaurs, prince & princess",
      "Matching coloring pages included free",
      "Instant printable PDF download — no shipping wait",
    ],
    faqs: [
      { q: "How fast will I get it?", a: "Most storybooks are ready to download in 5–10 minutes after checkout." },
      { q: "Is it a physical book?", a: "It's a high-resolution printable PDF you can print at home or at any print shop." },
      { q: "Can I add a sibling or friend?", a: "Yes — add the Supporting Character add-on during personalization and upload a second photo." },
    ],
    ctaLabel: "Personalize My Storybook",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books",
  },
  "coloring-pages": {
    slug: "coloring-pages",
    title: "Personalized Coloring Pages Add-On — MESTAR",
    h1: "Personalized Coloring Pages Starring Your Child",
    price: 4.99,
    metaDescription:
      "Extra printable coloring pages featuring your child in scenes from their story. Add-on to the MESTAR Personalized Storybook.",
    shortPitch:
      "Extra printable coloring pages designed to match your child's story. Complexity scales with age — chunky shapes for toddlers, detailed line art for older kids.",
    icon: Palette,
    bullets: [
      "Extra printable coloring pages beyond the free starter set",
      "Complexity matches your child's age group",
      "Same character, same story world — full continuity",
      "Print at home on any standard printer",
    ],
    faqs: [
      { q: "Is this a standalone product?", a: "No — coloring pages are added to the Personalized Storybook during personalization." },
      { q: "How many pages will I get?", a: "The exact count scales with age group and story length." },
    ],
    addon: true,
    ctaLabel: "Add During Personalization",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Toys & Games > Toys > Art & Drawing Toys",
  },
  "supporting-character": {
    slug: "supporting-character",
    title: "Supporting Character Add-On — Add a Sibling, Friend, or Pet | MESTAR",
    h1: "Add a Sibling, Best Friend, or Pet to the Story",
    price: 9.99,
    metaDescription:
      "Add a second character to your child's personalized storybook. Upload a photo of a sibling, friend, or pet — they'll help the hero through the adventure.",
    shortPitch:
      "Upload a second photo and give your child a sidekick. The supporting character always shows up when the hero needs help.",
    icon: Users,
    bullets: [
      "Upload a second photo (sibling, friend, parent, pet)",
      "Supporting character always helps — never a villain",
      "Keeps your child as the main hero",
      "Adds warmth and real-world connection to the story",
    ],
    faqs: [
      { q: "Can I add more than one supporting character?", a: "One supporting character per storybook keeps the story tight and focused on your child as the hero." },
      { q: "Does the pet count?", a: "Absolutely — pets make wonderful sidekicks." },
    ],
    addon: true,
    ctaLabel: "Add During Personalization",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books",
  },
  "karaoke-audiobook": {
    slug: "karaoke-audiobook",
    title: "Karaoke Audiobook Add-On — Read-Along for Kids | MESTAR",
    h1: "Karaoke Audiobook — Learn to Read While You Listen",
    price: 9.99,
    metaDescription:
      "Gentle narrated audiobook of your child's story with karaoke-style word highlighting — perfect for early readers learning to follow along.",
    shortPitch:
      "Narrated audiobook of your child's personalized story with karaoke-style word highlighting so early readers can follow along word-by-word.",
    icon: Mic,
    bullets: [
      "Warm, gentle professional narration",
      "Karaoke-style word-by-word highlighting",
      "Perfect for early readers ages 3–8",
      "Streams inside your MESTAR library",
    ],
    faqs: [
      { q: "When is it available?", a: "The karaoke audiobook is rolling out soon — check the personalization page for current availability." },
      { q: "Can I download the audio?", a: "You'll be able to stream it in your MESTAR library on any device." },
    ],
    comingSoon: true,
    addon: true,
    ctaLabel: "See on Personalization Page",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books > Audiobooks",
  },
  "basic-audiobook": {
    slug: "basic-audiobook",
    title: "Basic Audiobook Add-On (Coming Soon) | MESTAR",
    h1: "Basic Audiobook — Listen Anywhere",
    price: 4.99,
    metaDescription:
      "Simple narrated audio version of your child's personalized story. Coming soon to MESTAR.",
    shortPitch:
      "A simple narrated audio version of your child's personalized story to listen to anywhere — car rides, bedtime, quiet time.",
    icon: Volume2,
    bullets: [
      "Warm professional narration",
      "Great for road trips and bedtime",
      "Available in your MESTAR library",
    ],
    faqs: [
      { q: "How is this different from the karaoke version?", a: "The karaoke version highlights words as they're spoken — great for early readers. The basic version is audio only." },
    ],
    comingSoon: true,
    addon: true,
    ctaLabel: "Notify Me — Personalize Now",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books > Audiobooks",
  },
  "paperback-storybook": {
    slug: "paperback-storybook",
    title: "Paperback Personalized Storybook (Coming Soon) | MESTAR",
    h1: "Paperback Personalized Storybook — Mailed to Your Home",
    price: 0,
    metaDescription:
      "A beautifully bound paperback of your child's personalized MESTAR story, mailed to your home. Coming soon.",
    shortPitch:
      "A beautifully bound printed paperback of your child's personalized MESTAR story, mailed right to your home.",
    icon: Package,
    bullets: [
      "Professional binding, full-color print",
      "Keepsake quality — built to last",
      "Ships in protective packaging",
    ],
    faqs: [
      { q: "When will it be available?", a: "We're finalizing print partners now. Personalize the digital version and we'll notify you when paperback ships." },
    ],
    comingSoon: true,
    ctaLabel: "Personalize the Digital Version",
    ctaHref: "/product/personalized-storybook#personalize",
    image: HERO_IMG,
    googleCategory: "Media > Books",
  },
};

export const LANDING_SLUGS = Object.keys(LANDINGS);

export default function ProductLanding() {
  const { slug = "" } = useParams();
  const landing = LANDINGS[slug];
  if (!landing) return <Navigate to="/products" replace />;

  const Icon = landing.icon;
  const canonical = `/products/${landing.slug}`;

  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: landing.h1,
    description: landing.metaDescription,
    image: landing.image,
    brand: { "@type": "Brand", name: "MESTAR" },
    category: landing.googleCategory,
    url: `https://mestar.pro${canonical}`,
  };
  if (!landing.comingSoon && landing.price > 0) {
    productJsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: landing.price.toFixed(2),
      availability: "https://schema.org/InStock",
      url: `https://mestar.pro${canonical}`,
    };
  } else {
    productJsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "USD",
      price: landing.price ? landing.price.toFixed(2) : "0.00",
      availability: "https://schema.org/PreOrder",
    };
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://mestar.pro/" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://mestar.pro/products" },
      { "@type": "ListItem", position: 3, name: landing.h1, item: `https://mestar.pro${canonical}` },
    ],
  };

  return (
    <div className="min-h-screen py-10">
      <SEO
        title={landing.title}
        description={landing.metaDescription}
        canonical={canonical}
        image={landing.image}
        type="product"
        jsonLd={[productJsonLd, faqJsonLd, breadcrumbJsonLd]}
      />

      <div className="container max-w-4xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-foreground">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{landing.h1}</span>
        </nav>

        {/* Hero */}
        <header className="mb-10">
          <div className="flex items-start gap-4 mb-4">
            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              landing.comingSoon ? "bg-muted" : "bg-primary/10"
            }`}>
              <Icon className={`h-7 w-7 ${landing.comingSoon ? "text-muted-foreground" : "text-primary"}`} />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1">
                  <Sparkles className="h-3 w-3" />
                  {landing.addon ? "Add-On" : "Product"}
                </span>
                {landing.comingSoon && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                    Coming Soon
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">{landing.h1}</h1>
              {landing.price > 0 && (
                <p className="text-2xl font-bold text-primary">
                  {landing.addon ? "+" : ""}${landing.price.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USD</span>
                </p>
              )}
            </div>
          </div>

          <p className="text-lg text-muted-foreground mb-6">{landing.shortPitch}</p>

          <Button asChild size="lg" disabled={landing.comingSoon} className="w-full sm:w-auto">
            <Link to={landing.ctaHref}>
              {landing.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          {/* Trust row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {[
              { icon: Clock, text: "Ready in minutes" },
              { icon: Download, text: "Printable PDF" },
              { icon: ShieldCheck, text: "Secure checkout" },
              { icon: Star, text: "Loved by families" },
            ].map(({ icon: I, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 text-center rounded-xl border border-border py-3">
                <I className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </header>

        {/* What's included */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold mb-4">What's Included</h2>
          <ul className="space-y-3">
            {landing.bullets.map(b => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {landing.faqs.map(f => (
              <div key={f.q} className="rounded-xl border border-border p-5">
                <h3 className="font-bold mb-2">{f.q}</h3>
                <p className="text-muted-foreground text-sm">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center bg-card border border-border rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold mb-3">Ready to make your child the hero?</h2>
          <p className="text-muted-foreground mb-5">
            Every MESTAR story starts with a quick photo upload — takes about 60 seconds.
          </p>
          <Button asChild size="lg" disabled={landing.comingSoon}>
            <Link to={landing.ctaHref}>
              {landing.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
