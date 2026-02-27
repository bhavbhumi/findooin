
-- Card exchanges table for Lead Capture
CREATE TABLE public.card_exchanges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_owner_id uuid NOT NULL,
  viewer_id uuid,
  viewer_name text,
  context text NOT NULL DEFAULT 'direct',
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  action text NOT NULL DEFAULT 'view',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.card_exchanges ENABLE ROW LEVEL SECURITY;

-- Card owners can see who viewed/saved their card
CREATE POLICY "Card owners can view own exchanges"
  ON public.card_exchanges FOR SELECT
  USING (card_owner_id = auth.uid());

-- Anyone (including anon) can insert a card exchange record
CREATE POLICY "Anyone can log card exchange"
  ON public.card_exchanges FOR INSERT
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_card_exchanges_owner ON public.card_exchanges(card_owner_id, created_at DESC);
CREATE INDEX idx_card_exchanges_event ON public.card_exchanges(event_id) WHERE event_id IS NOT NULL;
