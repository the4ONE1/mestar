import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const Checkout = () => {
  return (
    <>
      <SEO title="Checkout — MESTAR" description="Checkout is temporarily unavailable while we upgrade our payment system." />
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl md:text-4xl mb-4">Checkout Temporarily Unavailable ⭐</h1>
        <p className="text-muted-foreground mb-2">
          We're upgrading our payment system to give you a smoother experience.
        </p>
        <p className="text-muted-foreground mb-8">
          Your personalization details are saved. Please check back very soon — we'll be live again shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/products">Browse Stories</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Checkout;
