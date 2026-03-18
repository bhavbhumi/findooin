-- Admin RLS policies for jobs table
CREATE POLICY "Admins can manage all jobs"
ON public.jobs
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin RLS policies for events table
CREATE POLICY "Admins can manage all events"
ON public.events
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin RLS policies for listings table
CREATE POLICY "Admins can manage all listings"
ON public.listings
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin read access for job_applications
CREATE POLICY "Admins can view all job applications"
ON public.job_applications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin read access for event_registrations
CREATE POLICY "Admins can view all event registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin read access for listing_enquiries
CREATE POLICY "Admins can view all listing enquiries"
ON public.listing_enquiries
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));