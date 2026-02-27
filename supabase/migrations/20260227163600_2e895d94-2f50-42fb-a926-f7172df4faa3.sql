
-- Event category enum
CREATE TYPE public.event_category AS ENUM (
  'webinar',
  'investor_meet',
  'agm_egm',
  'nfo_ipo_launch',
  'earnings_call',
  'regulatory_update',
  'training_certification',
  'industry_conference',
  'other'
);

-- Event mode enum
CREATE TYPE public.event_mode AS ENUM ('virtual', 'physical', 'hybrid');

-- Event status enum
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

-- Registration status enum
CREATE TYPE public.registration_status AS ENUM ('registered', 'waitlisted', 'cancelled', 'attended');

-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category public.event_category NOT NULL DEFAULT 'webinar',
  event_mode public.event_mode NOT NULL DEFAULT 'virtual',
  banner_url TEXT,
  venue_name TEXT,
  venue_address TEXT,
  virtual_link TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER,
  registration_count INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT true,
  status public.event_status NOT NULL DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event speakers
CREATE TABLE public.event_speakers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  speaker_profile_id UUID,
  speaker_name TEXT NOT NULL,
  speaker_title TEXT,
  speaker_avatar_url TEXT,
  topic TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Event registrations
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status public.registration_status NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX idx_event_registrations_event ON public.event_registrations(event_id);

-- Updated_at trigger for events
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Events RLS
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (status = 'published' OR organizer_id = auth.uid());

CREATE POLICY "Issuers and intermediaries can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() = organizer_id
    AND (
      public.has_role(auth.uid(), 'issuer')
      OR public.has_role(auth.uid(), 'intermediary')
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Organizers can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = organizer_id);

-- Event speakers RLS
CREATE POLICY "Anyone can view event speakers"
  ON public.event_speakers FOR SELECT
  USING (true);

CREATE POLICY "Organizer can manage speakers"
  ON public.event_speakers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_speakers.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Organizer can update speakers"
  ON public.event_speakers FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_speakers.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Organizer can delete speakers"
  ON public.event_speakers FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_speakers.event_id AND organizer_id = auth.uid())
  );

-- Event registrations RLS
CREATE POLICY "Users can view own registrations"
  ON public.event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Organizers can view event registrations"
  ON public.event_registrations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.events WHERE id = event_registrations.event_id AND organizer_id = auth.uid())
  );

CREATE POLICY "Authenticated users can register"
  ON public.event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own registration"
  ON public.event_registrations FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime for registrations
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
