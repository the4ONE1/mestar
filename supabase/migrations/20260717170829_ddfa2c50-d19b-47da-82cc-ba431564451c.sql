
-- Gift cards table
CREATE TABLE public.gift_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  buyer_email TEXT NOT NULL,
  recipient_email TEXT,
  note TEXT,
  stripe_session_id TEXT UNIQUE,
  redeemed_order_id UUID REFERENCES public.storybook_orders(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 year'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.gift_cards TO service_role;

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

-- Deny all anon/authenticated access; edge functions use service role
CREATE POLICY "Deny anon access to gift_cards"
  ON public.gift_cards AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Deny authenticated access to gift_cards"
  ON public.gift_cards AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);

CREATE INDEX idx_gift_cards_code ON public.gift_cards(code);
CREATE INDEX idx_gift_cards_buyer_email ON public.gift_cards(buyer_email);

-- Add failure tracking + gift redemption columns to storybook_orders
ALTER TABLE public.storybook_orders
  ADD COLUMN IF NOT EXISTS failure_category TEXT,
  ADD COLUMN IF NOT EXISTS failure_hint TEXT,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gift_card_code TEXT;
