-- Add attachments column to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add attachments column to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add attachments column to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_events_attachments ON public.events USING GIN (attachments);
CREATE INDEX IF NOT EXISTS idx_posts_attachments ON public.posts USING GIN (attachments);
CREATE INDEX IF NOT EXISTS idx_businesses_attachments ON public.businesses USING GIN (attachments);
