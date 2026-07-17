import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  orderId: string;
  priceIds: string[];
  customerEmail?: string;
  returnUrl: string;
  recoveryToken?: string;
}

export function StripeEmbeddedCheckout({ orderId, priceIds, customerEmail, returnUrl, recoveryToken }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        orderId,
        priceIds,
        customerEmail,
        returnUrl,
        environment: getStripeEnvironment(),
        recoveryToken,
      },
    });
    if (error || !data?.clientSecret) {
      throw new Error(error?.message || "Failed to create checkout session");
    }
    return data.clientSecret as string;
  };


  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
