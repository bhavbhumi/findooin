
CREATE TABLE public.ticket_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_admin_reply BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view replies on own tickets"
ON public.ticket_replies FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_replies.ticket_id AND st.user_id = auth.uid()));

CREATE POLICY "Admins can view all replies"
ON public.ticket_replies FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can reply on own tickets"
ON public.ticket_replies FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND is_admin_reply = false AND EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_replies.ticket_id AND st.user_id = auth.uid()));

CREATE POLICY "Admins can reply on any ticket"
ON public.ticket_replies FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ticket_replies_ticket_id ON public.ticket_replies(ticket_id);
