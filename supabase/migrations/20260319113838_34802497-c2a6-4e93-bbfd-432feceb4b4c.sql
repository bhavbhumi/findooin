
-- Add content_intent enum for SEBI 2026 compliance
CREATE TYPE public.content_intent AS ENUM ('education', 'sentiment_signal', 'awareness');

-- Add content_intent column to opinions table
ALTER TABLE public.opinions ADD COLUMN content_intent public.content_intent NOT NULL DEFAULT 'sentiment_signal';
