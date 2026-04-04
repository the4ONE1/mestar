import { BookOpen, Heart, Star, Clock, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Builds Unbreakable Bonds",
    description: "Snuggling up with a story creates moments of closeness that children carry with them for life. It tells them: you matter, and I'm here.",
  },
  {
    icon: Clock,
    title: "The Gift of Undivided Attention",
    description: "In a world full of screens and schedules, sitting down to read together says more than words ever could. It's pure, focused love.",
  },
  {
    icon: Sparkles,
    title: "Sparks Imagination & Confidence",
    description: "When children hear stories — especially ones where they're the hero — they start to believe they can do anything. That belief stays with them forever.",
  },
];

const WhyReadTogether = () => {
  return (
    <div className="min-h-screen py-16">
      <div className="container max-w-3xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Why It Matters</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            The Best Gift You Can Give a Child Is{" "}
            <span className="text-primary">Your Time</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The second best? A story where they're the hero.
          </p>
        </div>

        {/* Quote block */}
        <div className="bg-card border border-primary/20 rounded-2xl p-8 md:p-10 text-center mb-16">
          <Star className="h-8 w-8 text-primary fill-primary mx-auto mb-4" />
          <blockquote className="font-display text-xl md:text-2xl font-bold text-foreground leading-relaxed mb-4">
            "Children won't remember the toys you bought them. They'll remember the time you spent with them — and the stories you shared."
          </blockquote>
          <p className="text-muted-foreground text-sm">
            Every Star Stories book is designed to be read together, turning bedtime into the best part of the day.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-6 mb-16">
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-6 flex gap-5 items-start"
            >
              <div className="bg-primary/10 rounded-lg p-3 shrink-0">
                <benefit.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Give them both gifts tonight.
          </p>
          <a
            href="/#products"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-display font-bold rounded-full px-8 py-3 hover:opacity-90 transition-opacity"
          >
            <Sparkles className="h-4 w-4" />
            Create Their Story
          </a>
        </div>
      </div>
    </div>
  );
};

export default WhyReadTogether;
