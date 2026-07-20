import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

function TestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full bg-red-100 border-b border-red-300 px-4 py-2 text-center text-sm text-red-800">
        Production checkout is not configured. Complete Stripe go-live to accept real payments.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full bg-orange-100 border-b border-orange-300 px-4 py-2 text-center text-sm text-orange-800">
        Test mode — use card 4242 4242 4242 4242, any future expiry, any CVC.
      </div>
    );
  }
  return null;
}

export default function Checkout() {
  const [params] = useSearchParams();
  const orderId = params.get("order_id");
  const sessionId = params.get("session_id");
  const pricesParam = params.get("prices") || "";
  const email = params.get("email") || undefined;
  const priceIds = pricesParam.split(",").filter(Boolean);

  const nextRoute = params.get("next") || null;

  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // If returning from Stripe with session_id, confirm on server (webhook fallback)
  useEffect(() => {
    if (!sessionId || !orderId) return;
    setConfirming(true);
    supabase.functions
      .invoke("confirm-checkout-payment", {
        body: { sessionId, orderId, environment: clientToken?.startsWith("pk_live_") ? "live" : "sandbox" },
      })
      .then(() => setConfirmed(true))
      .finally(() => setConfirming(false));
  }, [sessionId, orderId]);

  // Auto-redirect to `next` route once payment is confirmed
  useEffect(() => {
    if (!sessionId || !nextRoute || !confirmed) return;
    const destination = nextRoute.includes("?")
      ? `${nextRoute}&order_id=${orderId}`
      : `${nextRoute}?order_id=${orderId}`;
    const timer = setTimeout(() => {
      window.location.href = destination;
    }, 500);
    return () => clearTimeout(timer);
  }, [confirmed, nextRoute, orderId, sessionId]);

  if (sessionId) {
    // If a `next` redirect was requested (e.g. /upsell after the initial $19.99), show a
    // "redirecting" screen while we wait for confirmation then auto-redirect via useEffect.
    if (nextRoute) {
      const destination = nextRoute.includes("?")
        ? `${nextRoute}&order_id=${orderId}`
        : `${nextRoute}?order_id=${orderId}`;
      return (
        <>
          <SEO title="Payment Received — MESTAR" description="Your personalized storybook is being created." />
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="font-display text-2xl mb-2">Payment confirmed — one moment…</h1>
            {confirmed && (
              <p className="text-muted-foreground">
                Redirecting you now…{" "}
                <Link to={destination} className="text-primary underline">Click here</Link> if it takes too long.
              </p>
            )}
          </div>
        </>
      );
    }

    return (
      <>
        <SEO title="Order Received — MESTAR" description="Your personalized storybook is being created." />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          {confirming ? (
            <>
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
              <h1 className="font-display text-2xl mb-2">Confirming your payment…</h1>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl md:text-4xl mb-4">Payment received! 🎉</h1>
              <p className="text-muted-foreground mb-6">
                We're generating your personalized story now. You'll get an email with your PDF shortly, and you can also watch progress in your Library.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg"><Link to={orderId ? `/library/${orderId}` : "/library"}>View My Story</Link></Button>
                <Button asChild variant="outline" size="lg"><Link to="/">Back to Home</Link></Button>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  if (!orderId || priceIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl mb-4">Nothing to check out ⭐</h1>
        <p className="text-muted-foreground mb-6">Add a personalized story to your cart first.</p>
        <Button asChild size="lg"><Link to="/products">Browse Stories</Link></Button>
      </div>
    );
  }

  const returnUrl = `${window.location.origin}/checkout?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}${nextRoute ? `&next=${encodeURIComponent(nextRoute)}` : ""}`;

  return (
    <>
      <SEO title="Checkout — MESTAR" description="Complete your personalized storybook purchase securely." />
      <TestModeBanner />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl md:text-3xl mb-6 text-center">Secure Checkout ⭐</h1>
        <StripeEmbeddedCheckout
          priceIds={priceIds}
          orderId={orderId}
          customerEmail={email}
          returnUrl={returnUrl}
        />
      </div>
    </>
  );
}
