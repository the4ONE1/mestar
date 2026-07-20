import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sparkles, Volume2, Palette, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const STRIPE_KARAOKE_PRICE = import.meta.env.VITE_STRIPE_PRICE_KARAOKE as string | undefined;
const STRIPE_COLORING_PRICE = import.meta.env.VITE_STRIPE_PRICE_COLORING as string | undefined;

const KARAOKE_PRICE = 5.99;
const COLORING_PRICE = 4.99;

export default function Upsell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order_id");

  const [wantsKaraoke, setWantsKaraoke] = useState(false);
  const [wantsColoring, setWantsColoring] = useState(false);
  const [childName, setChildName] = useState("your child");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate("/", { replace: true });
      return;
    }
    try {
      const saved = localStorage.getItem("mestar-pending-story");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.childName) setChildName(parsed.childName);
        // Persist orderId back so order-complete can pick it up later
        if (!parsed.orderId) {
          localStorage.setItem(
            "mestar-pending-story",
            JSON.stringify({ ...parsed, orderId }),
          );
        }
      }
    } catch {
      /* ignore */
    }
  }, [orderId, navigate]);

  // Persist upsell selections so the order-complete page knows what was bought
  const persistAddons = (karaoke: boolean, coloring: boolean) => {
    try {
      const saved = localStorage.getItem("mestar-pending-story");
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        "mestar-pending-story",
        JSON.stringify({
          ...parsed,
          orderId,
          selectedAddons: { audiobook: karaoke, coloringPages: coloring },
        }),
      );
    } catch {
      /* ignore */
    }
  };

  const addonsTotal = (wantsKaraoke ? KARAOKE_PRICE : 0) + (wantsColoring ? COLORING_PRICE : 0);

  const handleCompleteOrder = () => {
    if (!orderId) return;

    const selectedPrices: string[] = [];
    if (wantsKaraoke && STRIPE_KARAOKE_PRICE) selectedPrices.push(STRIPE_KARAOKE_PRICE);
    if (wantsColoring && STRIPE_COLORING_PRICE) selectedPrices.push(STRIPE_COLORING_PRICE);

    persistAddons(wantsKaraoke, wantsColoring);

    if (selectedPrices.length === 0) {
      // No add-ons selected — treat same as "skip"
      navigate(`/order-complete?order_id=${orderId}`);
      return;
    }

    if (selectedPrices.length > 0) {
      setLoading(true);
      navigate(
        `/checkout?order_id=${orderId}&prices=${encodeURIComponent(selectedPrices.join(","))}&next=${encodeURIComponent("/order-complete")}`,
      );
    } else {
      // Price IDs not configured — still navigate to order-complete
      navigate(`/order-complete?order_id=${orderId}`);
    }
  };

  const handleSkip = () => {
    if (!orderId) return;
    persistAddons(false, false);
    navigate(`/order-complete?order_id=${orderId}`);
  };

  return (
    <div className="min-h-screen py-10">
      <SEO
        title="Personalise Your Adventure Further — MESTAR"
        description="Add interactive read-along audio and custom coloring pages to your child's personalised storybook."
        noindex
      />

      <div className="container max-w-2xl">
        {/* Thank-you header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-3">
            Thank you! 🎉
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            <strong className="text-foreground capitalize">{childName}'s</strong> book is generating now.
            Personalise the adventure even further with these one-time add-ons:
          </p>
        </div>

        {/* Upsell cards */}
        <div className="space-y-4 mb-8">
          {/* Karaoke Audiobook */}
          <label
            htmlFor="karaoke"
            className={`group flex items-start gap-4 bg-card rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${
              wantsKaraoke
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="mt-0.5">
              <Checkbox
                id="karaoke"
                checked={wantsKaraoke}
                onCheckedChange={(checked) => setWantsKaraoke(!!checked)}
                className="h-5 w-5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Volume2 className="h-5 w-5 text-primary shrink-0" />
                <span className="font-display font-bold text-lg leading-tight">
                  Interactive Karaoke Read-Along Audiobook
                </span>
                <span className="ml-auto font-bold text-primary text-base shrink-0">
                  +${KARAOKE_PRICE.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A warm, narrated audiobook of{" "}
                <strong className="text-foreground capitalize">{childName}'s</strong> story with{" "}
                <strong className="text-foreground">karaoke-style word-by-word highlighting</strong>{" "}
                using millisecond timestamps — perfect for early readers learning to follow along.
                Powered by ElevenLabs AI voice, synced with every sentence in real time.
              </p>
            </div>
          </label>

          {/* Coloring Pages */}
          <label
            htmlFor="coloring"
            className={`group flex items-start gap-4 bg-card rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 ${
              wantsColoring
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="mt-0.5">
              <Checkbox
                id="coloring"
                checked={wantsColoring}
                onCheckedChange={(checked) => setWantsColoring(!!checked)}
                className="h-5 w-5"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Palette className="h-5 w-5 text-primary shrink-0" />
                <span className="font-display font-bold text-lg leading-tight">
                  Custom Printable Black-and-White Coloring Pages
                </span>
                <span className="ml-auto font-bold text-primary text-base shrink-0">
                  +${COLORING_PRICE.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every storybook scene transformed into a{" "}
                <strong className="text-foreground">crisp printable outline</strong> keeping{" "}
                <strong className="text-foreground capitalize">{childName}'s</strong> likeness intact —
                so they can colour themselves as the hero. Print at home on any standard printer.
              </p>
            </div>
          </label>
        </div>

        {/* Dynamic order summary */}
        {addonsTotal > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-3 mb-5 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Add-ons total</span>
            <span className="text-xl font-extrabold text-primary">${addonsTotal.toFixed(2)}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCompleteOrder}
            disabled={loading}
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300 disabled:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Redirecting to checkout…
              </>
            ) : addonsTotal > 0 ? (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Complete Order — ${addonsTotal.toFixed(2)}
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Complete Order (No Add-Ons)
              </>
            )}
          </Button>

          <Button
            onClick={handleSkip}
            variant="ghost"
            size="lg"
            className="w-full text-muted-foreground hover:text-foreground rounded-full"
          >
            Skip and View Base Book
          </Button>
        </div>

        {/* Reassurance */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Add-ons are delivered to the same PDF / library as your base book.
          All prices are one-time — no subscriptions.
        </p>

        <div className="text-center mt-4">
          <Link
            to={`/order-complete?order_id=${orderId}`}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline"
          >
            View order status
          </Link>
        </div>
      </div>
    </div>
  );
}
