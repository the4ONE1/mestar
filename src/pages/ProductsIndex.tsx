import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Palette, Users, Volume2, Mic, Package } from "lucide-react";
import SEO from "@/components/SEO";
import {
  BASE_PRICE,
  SUPPORTING_CHARACTER_PRICE,
  AUDIOBOOK_PRICE,
} from "@/lib/products";

type Product = {
  slug: string;
  title: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  comingSoon?: boolean;
  addon?: boolean;
  ctaLabel: string;
};

const PRODUCTS: Product[] = [
  {
    slug: "personalized-storybook",
    title: "Personalized Storybook",
    price: BASE_PRICE,
    icon: BookOpen,
    description:
      "A one-of-a-kind digital PDF storybook starring your child. Full-color illustrations + matching coloring pages included.",
    ctaLabel: "Personalize & Buy",
  },
  {
    slug: "supporting-character",
    title: "Supporting Character Add-On",
    price: SUPPORTING_CHARACTER_PRICE,
    icon: Users,
    description:
      "Add a sibling, best friend, or pet as a helpful sidekick in your child's story. Added during personalization.",
    addon: true,
    ctaLabel: "Add During Personalization",
  },
  {
    slug: "coloring-pages",
    title: "Coloring Pages Add-On",
    price: 4.99,
    icon: Palette,
    description:
      "Extra printable coloring pages to go with the story (a starter set is already included free with every storybook).",
    addon: true,
    ctaLabel: "Add During Personalization",
  },
  {
    slug: "karaoke-audiobook",
    title: "Karaoke Audiobook Add-On",
    price: AUDIOBOOK_PRICE,
    icon: Mic,
    description:
      "A gentle narrated read-aloud with karaoke-style word highlighting — perfect for early readers.",
    comingSoon: true,
    addon: true,
    ctaLabel: "Coming Soon",
  },
  {
    slug: "basic-audiobook",
    title: "Basic Audiobook Add-On",
    price: 4.99,
    icon: Volume2,
    description:
      "A simple narrated audio version of your child's story to listen to anywhere.",
    comingSoon: true,
    addon: true,
    ctaLabel: "Coming Soon",
  },
  {
    slug: "paperback-storybook",
    title: "Paperback Storybook",
    price: 0,
    icon: Package,
    description:
      "A beautifully bound printed paperback of your child's story, mailed right to your home.",
    comingSoon: true,
    ctaLabel: "Coming Soon",
  },
];

export default function ProductsIndex() {
  return (
    <div className="min-h-screen py-10">
      <SEO
        title="Shop All Products — MESTAR Personalized Storybooks"
        description="Browse every MESTAR product: personalized digital storybooks, coloring pages, supporting-character add-ons, karaoke audiobooks, and paperback storybooks coming soon."
        canonical="/products"
      />
      <div className="container max-w-5xl">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1 bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider rounded-full px-3 py-1 mb-3">
            <Sparkles className="h-3 w-3" /> Shop
          </span>
          <h1 className="font-display text-4xl font-bold mb-3">Every MESTAR Product</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything we offer today, plus what's on the way. Every purchase starts with a
            quick photo upload so your child becomes the hero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PRODUCTS.map(p => {
            const Icon = p.icon;
            return (
              <div
                key={p.slug}
                className={`rounded-2xl border p-6 flex flex-col ${
                  p.comingSoon
                    ? "border-dashed border-border bg-muted/30"
                    : "border-border bg-card"
                }`}
              >
                <Link to={`/products/${p.slug}`} className="flex items-start gap-4 mb-4 group">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    p.comingSoon ? "bg-muted" : "bg-primary/10"
                  }`}>
                    <Icon className={`h-6 w-6 ${p.comingSoon ? "text-muted-foreground" : "text-primary"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-display text-lg font-bold group-hover:text-primary transition-colors">{p.title}</h2>
                      {p.comingSoon && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          (Coming Soon)
                        </span>
                      )}
                      {p.addon && !p.comingSoon && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                          Add-On
                        </span>
                      )}
                    </div>
                    {p.price > 0 && (
                      <p className="text-xl font-bold text-primary">
                        {p.addon ? "+" : ""}${p.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
                <p className="text-sm text-muted-foreground mb-5 flex-1">{p.description}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild variant="outline" className="flex-1">
                    <Link to={`/products/${p.slug}`}>Learn more</Link>
                  </Button>
                  {p.comingSoon ? (
                    <Button disabled className="flex-1">
                      {p.ctaLabel}
                    </Button>
                  ) : (
                    <Button asChild className="flex-1">
                      <Link to="/product/personalized-storybook#personalize">
                        {p.ctaLabel} →
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Add-ons are selected during the personalization step for your storybook — they can't be
          purchased on their own.
        </div>
      </div>
    </div>
  );
}
