import { Star } from "lucide-react";

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
  return (
    <div className="min-h-screen py-16">
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
              className="bg-card rounded-xl border border-border p-6 space-y-4"
            >
              <div className="flex gap-1">
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
      </div>
    </div>
  );
};

export default Reviews;
