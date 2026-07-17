import { loadStripe, Stripe } from "@stripe/stripe-js";

export type StripeEnv = "sandbox" | "live";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function getStripeEnvironment(): StripeEnv {
  if (clientToken?.startsWith("pk_test_")) return "sandbox";
  if (clientToken?.startsWith("pk_live_")) return "live";
  throw new Error(
    "Stripe is not configured for this build. Complete Stripe go-live to enable production checkout."
  );
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    getStripeEnvironment();
    stripePromise = loadStripe(clientToken as string);
  }
  return stripePromise;
}

// Map cart variantIds / addon flags to Stripe price lookup keys.
export const STRIPE_PRICE_IDS = {
  storybook: "personalized_storybook_onetime",
  supportingCharacter: "supporting_character_addon_onetime",
  coloring: "coloring_pages_addon_onetime",
  audiobookBasic: "audiobook_basic_onetime",
  audiobookKaraoke: "audiobook_karaoke_onetime",
  hardbackBundle: "hardback_bundle_onetime",
} as const;
