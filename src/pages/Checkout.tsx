import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import SEO from "@/components/SEO";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("order_id");
  const priceIdsRaw = searchParams.get("prices") || "";
  const email = searchParams.get("email") || undefined;
  const priceIds = priceIdsRaw.split(",").filter(Boolean);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!orderId || priceIds.length === 0) {
      navigate("/", { replace: true });
      return;
    }
    setReady(true);
  }, [orderId, priceIdsRaw]);

  if (!ready || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const returnUrl = `${window.location.origin}/order-complete?order_id=${orderId}&session_id={CHECKOUT_SESSION_ID}`;

  return (
    <>
      <SEO title="Secure Checkout — MESTAR" description="Complete your personalized storybook purchase securely." />
      <PaymentTestModeBanner />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl md:text-3xl mb-6 text-center">Secure Checkout ⭐</h1>
        <StripeEmbeddedCheckout
          orderId={orderId}
          priceIds={priceIds}
          customerEmail={email}
          returnUrl={returnUrl}
        />
      </div>
    </>
  );
};

export default Checkout;
