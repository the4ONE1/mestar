import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import type { StripeEnv } from "@/lib/stripe";

interface Props {
  orderId: string;
  priceIds: string[];
  customerEmail?: string;
  returnUrl: string;
  recoveryToken?: string;
  environment?: StripeEnv;
}

export function StripeEmbeddedCheckout({ orderId, priceIds, customerEmail, returnUrl, recoveryToken, environment }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: {
        orderId,
        priceIds,
        customerEmail,
        returnUrl,
        environment: getStripeEnvironment(environment),
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
      <EmbeddedCheckoutProvider stripe={getStripe(environment)} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
