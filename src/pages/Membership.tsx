import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, BookOpen, Users, Crown } from "lucide-react";

const Membership = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
      <Helmet>
        <title>MESTAR Story Club Membership — Monthly Personalized Stories</title>
        <meta
          name="description"
          content="Join the MESTAR Story Club and receive a new personalized storybook starring your child every month. Launching soon — join the waitlist."
        />
        <link rel="canonical" href="https://mestar.pro/membership" />
        <meta property="og:title" content="MESTAR Story Club Membership" />
        <meta
          property="og:description"
          content="A new personalized storybook starring your child, delivered every month."
        />
        <meta property="og:url" content="https://mestar.pro/membership" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="flex justify-center mb-4">
        <Crown className="h-12 w-12 text-primary" aria-hidden="true" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        MESTAR Story Club — Coming Soon
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
        A brand-new personalized adventure starring your child, delivered
        automatically every month. Same magical MESTAR quality — now on a
        subscription so bedtime never runs out of new stories.
      </p>

      <div className="grid gap-6 sm:grid-cols-3 mb-12 text-left sm:text-center">
        <div className="p-6 rounded-xl border bg-card">
          <BookOpen className="h-8 w-8 mx-auto mb-3 text-primary" aria-hidden="true" />
          <h2 className="font-semibold mb-2">New story monthly</h2>
          <p className="text-sm text-muted-foreground">
            A fresh theme, plot, and set of illustrations every month — always
            personalized to your child.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-primary" aria-hidden="true" />
          <h2 className="font-semibold mb-2">Included add-ons</h2>
          <p className="text-sm text-muted-foreground">
            Bonus coloring pages and premium quality upgrades bundled at a lower
            monthly rate than one-off orders.
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card">
          <Users className="h-8 w-8 mx-auto mb-3 text-primary" aria-hidden="true" />
          <h2 className="font-semibold mb-2">Family library</h2>
          <p className="text-sm text-muted-foreground">
            Every story you receive is saved to your personal library — always
            re-downloadable as a PDF.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg">
          <Link to="/products">Order a story now</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/about">Learn more about MESTAR</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Launch coming soon. Existing customers will get first access and
        founding-member pricing.
      </p>
    </div>
  );
};

export default Membership;
