
-- Listing type enum
CREATE TYPE public.listing_type AS ENUM ('product', 'service');

-- Listing status enum
CREATE TYPE public.listing_status AS ENUM ('draft', 'active', 'paused', 'archived');

-- Product categories
CREATE TYPE public.product_category AS ENUM (
  'mutual_fund', 'insurance', 'pms', 'aif', 'bonds', 'fixed_deposit', 'nps', 'ipo_nfo', 'other_product'
);

-- Service categories
CREATE TYPE public.service_category AS ENUM (
  'advisory', 'compliance', 'auditing', 'tax_planning', 'wealth_management', 'portfolio_management', 'financial_planning', 'legal', 'other_service'
);

-- Listings table
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_type public.listing_type NOT NULL DEFAULT 'product',
  product_category public.product_category,
  service_category public.service_category,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  highlights text[] DEFAULT '{}',
  pricing_info jsonb DEFAULT '{}',
  media_urls text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  location text,
  certifications text[] DEFAULT '{}',
  min_investment numeric,
  returns_info text,
  risk_level text,
  tenure text,
  status public.listing_status NOT NULL DEFAULT 'draft',
  view_count integer NOT NULL DEFAULT 0,
  enquiry_count integer NOT NULL DEFAULT 0,
  review_count integer NOT NULL DEFAULT 0,
  average_rating numeric(2,1) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can view active listings
CREATE POLICY "Anyone can view active listings" ON public.listings
  FOR SELECT USING (status = 'active' OR user_id = auth.uid());

-- RLS: Issuers and intermediaries can create listings
CREATE POLICY "Issuers and intermediaries can create listings" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      has_role(auth.uid(), 'issuer') OR
      has_role(auth.uid(), 'intermediary') OR
      has_role(auth.uid(), 'admin')
    )
  );

-- RLS: Owners can update own listings
CREATE POLICY "Owners can update own listings" ON public.listings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS: Owners can delete own listings
CREATE POLICY "Owners can delete own listings" ON public.listings
  FOR DELETE USING (auth.uid() = user_id);

-- Listing reviews table
CREATE TABLE public.listing_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(listing_id, reviewer_id)
);

ALTER TABLE public.listing_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.listing_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can review" ON public.listing_reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id AND reviewer_id != (SELECT user_id FROM public.listings WHERE id = listing_id));

CREATE POLICY "Users can update own reviews" ON public.listing_reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews" ON public.listing_reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- Listing enquiries table
CREATE TABLE public.listing_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  enquirer_id uuid NOT NULL,
  message text NOT NULL DEFAULT '',
  contact_preference text DEFAULT 'message',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.listing_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listing owners can view enquiries" ON public.listing_enquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_enquiries.listing_id AND user_id = auth.uid())
  );

CREATE POLICY "Enquirers can view own enquiries" ON public.listing_enquiries
  FOR SELECT USING (auth.uid() = enquirer_id);

CREATE POLICY "Authenticated users can enquire" ON public.listing_enquiries
  FOR INSERT WITH CHECK (auth.uid() = enquirer_id);

CREATE POLICY "Listing owners can update enquiry status" ON public.listing_enquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_enquiries.listing_id AND user_id = auth.uid())
  );

-- Trigger for updated_at on listings
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to update listing stats after review
CREATE OR REPLACE FUNCTION public.update_listing_review_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.listings SET
      review_count = (SELECT COUNT(*) FROM public.listing_reviews WHERE listing_id = NEW.listing_id),
      average_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.listing_reviews WHERE listing_id = NEW.listing_id), 0)
    WHERE id = NEW.listing_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.listings SET
      review_count = (SELECT COUNT(*) FROM public.listing_reviews WHERE listing_id = OLD.listing_id),
      average_rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.listing_reviews WHERE listing_id = OLD.listing_id), 0)
    WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER update_listing_review_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.listing_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_listing_review_stats();
