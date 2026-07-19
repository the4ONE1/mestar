import { loadStripe, Stripe } from "@stripe/stripe-js";

export type StripeEnv = "sandbox" | "live";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;
const sandboxClientToken = "pk_test_51Ttt4nGkH5A1tO6iihvLWbztPa7K6otQ5a1C5R7VoKLrLnk68hdUAlT3F6ImJeaKS5xwW2t4eGp4EHTT4cRAkEj800FVXSr0Zb";

export function getStripeEnvironment(forcedEnvironment?: StripeEnv | null): StripeEnv {
  if (forcedEnvironment === "sandbox" || forcedEnvironment === "live") return forcedEnvironment;
  if (clientToken?.startsWith("pk_test_")) return "sandbox";
  if (clientToken?.startsWith("pk_live_")) return "live";
  throw new Error(
    "Stripe is not configured for this build. Complete Stripe go-live to enable production checkout."
  );
}

const stripePromises: Partial<Record<StripeEnv, Promise<Stripe | null>>> = {};

export function getStripe(forcedEnvironment?: StripeEnv | null): Promise<Stripe | null> {
  const env = getStripeEnvironment(forcedEnvironment);
  const token = env === "sandbox" ? sandboxClientToken : clientToken;
  if (!stripePromises[env]) {
    stripePromises[env] = loadStripe(token as string);
  }
  return stripePromises[env]!;
}

// Map cart variantIds / addon flags to Stripe price lookup keys.
// NOTE: hardback_bundle_onetime is intentionally NOT exposed here. It's a
// physical product and Stripe's managed_payments (enabled on every session)
// rejects physical goods. Re-enable only after adding a separate shipping +
// tax_code path for it.
export const STRIPE_PRICE_IDS = {
  storybook: "personalized_storybook_onetime",
  supportingCharacter: "supporting_character_addon_onetime",
  coloring: "coloring_pages_addon_onetime",
  audiobookBasic: "audiobook_basic_onetime",
  audiobookKaraoke: "audiobook_karaoke_onetime",
} as const;
