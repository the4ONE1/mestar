import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Volume2, Headphones, Palette, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const STRIPE_CLASSIC_PRICE = import.meta.env.VITE_STRIPE_PRICE_CLASSIC as string | undefined;
const STRIPE_INTERACTIVE_PRICE = import.meta.env.VITE_STRIPE_PRICE_INTERACTIVE as string | undefined;
const STRIPE_COLORING_PRICE = import.meta.env.VITE_STRIPE_PRICE_COLORING as string | undefined;

const CLASSIC_PRICE = 4.99;
const INTERACTIVE_PRICE = 9.99;
const COLORING_PRICE = 4.99;

type AudioTier = "none" | "classic" | "interactive";

export default function Upsell() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("order_id");

  const [audioTier, setAudioTier] = useState<AudioTier>("none");
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
        if (!parsed.orderId) {
          localStorage.setItem(
            "mestar-pending-story",
            JSON.stringify({ ...parsed, orderId }),
          );
        }
      }
    } catch { /* ignore */ }
  }, [orderId, navigate]);

  const persistAddons = (tier: AudioTier, coloring: boolean) => {
    try {
      const saved = localStorage.getItem("mestar-pending-story");
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        "mestar-pending-story",
        JSON.stringify({
          ...parsed,
          orderId,
          audiobookTier: tier === "none" ? null : tier,
          selectedAddons: {
            audiobook: tier !== "none",
            audiobookTier: tier === "none" ? null : tier,
            coloringPages: coloring,
          },
        }),
      );
    } catch { /* ignore */ }
  };

  const audioPrice = audioTier === "interactive" ? INTERACTIVE_PRICE : audioTier === "classic" ? CLASSIC_PRICE : 0;
  const addonsTotal = audioPrice + (wantsColoring ? COLORING_PRICE : 0);

  const handleCompleteOrder = () => {
    if (!orderId) return;

    const selectedPrices: string[] = [];
    if (audioTier === "interactive" && STRIPE_INTERACTIVE_PRICE) selectedPrices.push(STRIPE_INTERACTIVE_PRICE);
    else if (audioTier === "classic" && STRIPE_CLASSIC_PRICE) selectedPrices.push(STRIPE_CLASSIC_PRICE);
    if (wantsColoring && STRIPE_COLORING_PRICE) selectedPrices.push(STRIPE_COLORING_PRICE);

    persistAddons(audioTier, wantsColoring);

    if (selectedPrices.length === 0) {
      navigate(`/order-complete?order_id=${orderId}`);
      return;
    }

    setLoading(true);
    navigate(
      `/checkout?order_id=${orderId}&prices=${encodeURIComponent(selectedPrices.join(","))}&next=${encodeURIComponent("/order-complete")}`,
    );
  };

  const handleSkip = () => {
    if (!orderId) return;
    persistAddons("none", false);
    navigate(`/order-complete?order_id=${orderId}`);
  };

  const audioCard = (
    tier: "classic" | "interactive",
    title: string,
    price: number,
    Icon: typeof Volume2,
    body: React.ReactNode,
    badge?: string,
  ) => {
    const selected = audioTier === tier;
    return (
      <button
        type="button"
        onClick={() => setAudioTier(selected ? "none" : tier)}
        className={`w-full text-left group flex items-start gap-4 bg-card rounded-2xl border-2 p-5 transition-all duration-200 ${
          selected ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
        }`}
      >
        <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? "border-primary bg-primary" : "border-muted-foreground/40"
        }`}>
          {selected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Icon className="h-5 w-5 text-primary shrink-0" />
            <span className="font-display font-bold text-base sm:text-lg leading-tight">{title}</span>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                {badge}
              </span>
            )}
            <span className="ml-auto font-bold text-primary text-base shrink-0">+${price.toFixed(2)}</span>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen py-10">
      <SEO
        title="Personalise Your Adventure Further — MESTAR"
        description="Add narrated audio, interactive read-along, and printable coloring pages to your child's personalised storybook."
        noindex
      />

      <div className="container max-w-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold mb-3">Thank you! 🎉</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            <strong className="text-foreground capitalize">{childName}'s</strong> book is generating now.
            Make it even more magical with a one-time add-on:
          </p>
        </div>

        <div className="mb-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Choose an audiobook (optional)</p>
        </div>

        <div className="space-y-3 mb-6">
          {audioCard(
            "classic",
            "Classic Audiobook",
            CLASSIC_PRICE,
            Headphones,
            <>
              A warm, natural narration of <strong className="text-foreground capitalize">{childName}'s</strong> story.
              Simple play, pause, and seek — perfect for bedtime listening.
            </>,
          )}
          {audioCard(
            "interactive",
            "Interactive Read-Along",
            INTERACTIVE_PRICE,
            Volume2,
            <>
              Karaoke word highlighting, tap-any-word replay, syllable breakdown, and sound-it-out reading help while <strong className="text-foreground capitalize">{childName}'s</strong> story plays.
            </>,
            "Best for Learning",
          )}

        </div>


        <div className="mb-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Extras</p>
        </div>
        <button
          type="button"
          onClick={() => setWantsColoring((v) => !v)}
          className={`w-full text-left group flex items-start gap-4 bg-card rounded-2xl border-2 p-5 transition-all duration-200 mb-6 ${
            wantsColoring ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
          }`}
        >
          <div className={`mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 ${
            wantsColoring ? "border-primary bg-primary" : "border-muted-foreground/40"
          }`}>
            {wantsColoring && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Palette className="h-5 w-5 text-primary shrink-0" />
              <span className="font-display font-bold text-base sm:text-lg leading-tight">
                Bonus Coloring Book (8 extra pages)
              </span>
              <span className="ml-auto font-bold text-primary text-base shrink-0">+${COLORING_PRICE.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Adds 8 bonus printable coloring pages inspired by your theme, on top of the scene-based pages already included with every story.
            </p>
          </div>
        </button>

        {addonsTotal > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl px-5 py-3 mb-5 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Add-ons total</span>
            <span className="text-xl font-extrabold text-primary">${addonsTotal.toFixed(2)}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCompleteOrder}
            disabled={loading}
            size="lg"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-lg rounded-full py-7 shadow-xl shadow-primary/30 hover:scale-105 transition-all duration-300 disabled:scale-100"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Redirecting to checkout…</>
            ) : addonsTotal > 0 ? (
              <><Sparkles className="h-5 w-5 mr-2" />Complete Order — ${addonsTotal.toFixed(2)}<ArrowRight className="h-5 w-5 ml-2" /></>
            ) : (
              <><CheckCircle2 className="h-5 w-5 mr-2" />Complete Order (No Add-Ons)</>
            )}
          </Button>

          <Button onClick={handleSkip} variant="ghost" size="lg" className="w-full text-muted-foreground hover:text-foreground rounded-full">
            Skip and View Base Book
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Add-ons unlock instantly in your Library after payment. One-time purchase — no subscriptions.
        </p>

        <div className="text-center mt-4">
          <Link to={`/order-complete?order_id=${orderId}`} className="text-xs text-muted-foreground/60 hover:text-muted-foreground underline">
            View order status
          </Link>
        </div>
      </div>
    </div>
  );
}
