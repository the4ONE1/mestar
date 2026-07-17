import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BASE_PRICE, SUPPORTING_CHARACTER_PRICE, AUDIOBOOK_PRICE } from "@/lib/products";

const PRODUCTS = [
  {
    title: "Personalized Storybook",
    price: BASE_PRICE,
    handle: "personalized-storybook",
    tag: "Bestseller",
    description:
      "A one-of-a-kind digital PDF storybook starring your child. Includes full-color illustrations and matching printable coloring pages.",
    cta: "Personalize Now →",
    available: true,
  },
  {
    title: "Supporting Character Add-On",
    price: SUPPORTING_CHARACTER_PRICE,
    handle: "personalized-storybook",
    tag: "Add-on",
    description:
      "Add a sibling, friend, pet, or even yourself as a supporting character by uploading a second photo.",
    cta: "Add During Checkout →",
    available: true,
  },
  {
    title: "Karaoke Audiobook Add-On",
    price: AUDIOBOOK_PRICE,
    handle: "personalized-storybook",
    tag: "Coming Soon",
    description:
      "Narrated audiobook of your child's story with karaoke-style word highlighting — perfect for early readers.",
    cta: "Under construction",
    available: false,
  },
];

export default function ProductsIndex() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10 md:py-16">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            Our Products
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every book is a one-of-a-kind digital PDF starring your child. Choose your product below to get started.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <Card key={i} className="p-6 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <Badge variant={p.available ? "default" : "secondary"}>{p.tag}</Badge>
                <span className="font-display text-2xl font-bold text-primary">
                  ${p.price.toFixed(2)}
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold mb-2">{p.title}</h2>
              <p className="text-sm text-muted-foreground mb-6 flex-1">
                {p.description}
              </p>
              {p.available ? (
                <Link
                  to={`/product/${p.handle}`}
                  className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  {p.cta}
                </Link>
              ) : (
                <div className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-muted text-muted-foreground font-medium cursor-not-allowed">
                  {p.cta}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-muted-foreground">
          One-time purchase — no subscription required. Instant digital download.
        </div>
      </div>
    </main>
  );
}
