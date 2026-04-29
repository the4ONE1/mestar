import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Sparkles } from "lucide-react";
import { fetchProducts } from "@/lib/shopify";
import SEO from "@/components/SEO";

const reviews = [
  {
    name: "Sarah M.",
    child: "her daughter Lily",
    text: "My daughter was absolutely thrilled to see herself as the hero of her own fairy tale! The coloring pages were a huge bonus — she spent the whole afternoon coloring them. Worth every penny!",
  },
  {
    name: "James T.",
    child: "his son Noah",
    text: "I ordered this for my son's birthday and it was the highlight of the party. He kept saying 'That's ME!' while we read it together. The story quality blew me away — it didn't feel generic at all.",
  },
  {
    name: "Michelle R.",
    child: "her twins",
    text: "I ordered separate stories for each of my twins and they both loved having their own unique adventure. The dinosaur theme was a huge hit! Already planning to order more as gifts for their cousins.",
  },
];

const Reviews = () => {
  const [firstHandle, setFirstHandle] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts(1).then((products) => {
      if (products.length > 0) setFirstHandle(products[0].node.handle);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen py-16">
      <SEO
        title="Reviews — What Families Say About MESTAR Storybooks"
        description="Real reviews from parents and kids who received MESTAR personalized storybooks. See why families love making their child the hero of the story."
        canonical="/reviews"
      />
      <div className="container max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">Happy Families</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold mb-4">
            What Parents Are <span className="text-primary">Saying</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Real stories from real families ⭐
          </p>
        </div>

        <div className="space-y-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-6 space-y-4 text-center sm:text-left"
            >
              <div className="flex gap-1 justify-center sm:justify-start">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="h-5 w-5 text-primary fill-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed italic">
                "{review.text}"
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                — {review.name}, ordered for {review.child}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Join these happy families!</p>
          {firstHandle ? (
            <Link
              to={`/product/${firstHandle}`}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-4 w-4" />
              Create Your Story Now ⭐
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="h-4 w-4" />
              Create Your Story Now ⭐
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
