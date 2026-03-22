
-- Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  capacity INTEGER,
  price NUMERIC DEFAULT 0,
  image_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'going',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RSVPs viewable by everyone" ON public.event_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can RSVP" ON public.event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own RSVP" ON public.event_rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can cancel RSVP" ON public.event_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Verification requests
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  document_url TEXT,
  document_type TEXT DEFAULT 'business_registration',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification requests" ON public.verification_requests FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can submit verification" ON public.verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update verification" ON public.verification_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Add verified column to businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Profile views tracking for dashboard
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  viewer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile views viewable by business owner" ON public.profile_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Anyone can create profile view" ON public.profile_views FOR INSERT WITH CHECK (true);

-- Storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-docs', 'verification-docs', false);

CREATE POLICY "Users can upload verification docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verification-docs' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view own verification docs" ON storage.objects FOR SELECT USING (bucket_id = 'verification-docs' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all verification docs" ON storage.objects FOR SELECT USING (bucket_id = 'verification-docs' AND public.has_role(auth.uid(), 'admin'));
