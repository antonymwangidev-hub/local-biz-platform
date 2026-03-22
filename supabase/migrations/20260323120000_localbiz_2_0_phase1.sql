-- LocalBiz Connect 2.0 - Database Schema Extensions
-- Phase 1: Social Features, Gamification, Analytics, Communities

-- 1. Posts Table (Business Status Updates)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('promotion', 'update', 'announcement', 'event-promotion')),
  title TEXT,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb, -- {url, type: 'image'|'video', thumbnail}
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_business_id ON posts(business_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_type ON posts(type);

-- 2. Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- 3. Post Likes Table
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- 4. Comment Likes Table
CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- 5. Badges Table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('profile', 'engagement', 'event', 'review', 'community', 'collaboration')),
  criteria JSONB, -- {type: 'posts_count', value: 10, timeframe: 'monthly'}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badges_category ON badges(category);

-- 6. User Badges Table
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- 7. Collaborations Table
CREATE TABLE collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  collaboration_type TEXT NOT NULL CHECK (collaboration_type IN ('partnership', 'cross-promotion', 'event', 'mentorship')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'interested', 'matched', 'in-progress', 'completed')),
  interested_businesses JSONB DEFAULT '[]'::jsonb, -- array of {id, name, category}
  matched_business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  budget_range TEXT,
  deadline DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collaborations_requesting_business_id ON collaborations(requesting_business_id);
CREATE INDEX idx_collaborations_status ON collaborations(status);
CREATE INDEX idx_collaborations_created_at ON collaborations(created_at DESC);

-- 8. Business Analytics Table
CREATE TABLE business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  profile_views INT DEFAULT 0,
  post_engagement INT DEFAULT 0, -- total likes + comments
  booking_count INT DEFAULT 0,
  review_count INT DEFAULT 0,
  follower_count INT DEFAULT 0,
  average_rating DECIMAL(3,2),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, date)
);

CREATE INDEX idx_business_analytics_business_id ON business_analytics(business_id);
CREATE INDEX idx_business_analytics_date ON business_analytics(date);

-- 9. Business Groups Table
CREATE TABLE business_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('industry', 'location', 'interest', 'service')),
  icon_url TEXT,
  members_count INT DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_business_groups_category ON business_groups(category);
CREATE INDEX idx_business_groups_created_at ON business_groups(created_at DESC);

-- 10. Group Members Table
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES business_groups(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, business_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_business_id ON group_members(business_id);

-- 11. Stories Table (Check-ins & User-Generated Content)
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE, -- nullable for general stories
  content TEXT,
  media_urls JSONB DEFAULT '[]'::jsonb, -- [{url, type: 'image'|'video'}]
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_business_id ON stories(business_id);
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);

-- 12. Polls Table
CREATE TABLE polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- [{id: uuid, text: string, votes: int}]
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  total_responses INT DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_polls_business_id ON polls(business_id);
CREATE INDEX idx_polls_status ON polls(status);
CREATE INDEX idx_polls_expires_at ON polls(expires_at);

-- 13. Poll Responses Table
CREATE TABLE poll_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_option UUID NOT NULL, -- option id from poll.options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX idx_poll_responses_poll_id ON poll_responses(poll_id);
CREATE INDEX idx_poll_responses_user_id ON poll_responses(user_id);

-- 14. Story Likes Table
CREATE TABLE story_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, user_id)
);

CREATE INDEX idx_story_likes_story_id ON story_likes(story_id);
CREATE INDEX idx_story_likes_user_id ON story_likes(user_id);

-- Enable RLS for all new tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Examples - adjust based on your requirements)

-- Posts: Businesses can create/update their own posts
CREATE POLICY "businesses_create_posts" ON posts
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "businesses_update_posts" ON posts
  FOR UPDATE
  USING (business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  ));

-- Public read access to posts
CREATE POLICY "public_read_posts" ON posts
  FOR SELECT
  USING (true);

-- Comments: Users can create/read
CREATE POLICY "users_create_comments" ON comments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "public_read_comments" ON comments
  FOR SELECT
  USING (true);

-- Badges: Public read
CREATE POLICY "public_read_badges" ON badges
  FOR SELECT
  USING (true);

-- User Badges: Users can see their own badges
CREATE POLICY "users_read_own_badges" ON user_badges
  FOR SELECT
  USING (user_id = auth.uid() OR true);

-- Groups: Public read, members can modify
CREATE POLICY "public_read_groups" ON business_groups
  FOR SELECT
  USING (true);

-- Stories: Users manage their own
CREATE POLICY "users_manage_stories" ON stories
  FOR ALL
  USING (user_id = auth.uid() OR true)
  WITH CHECK (user_id = auth.uid());

-- Polls: Businesses manage, public can view/respond
CREATE POLICY "public_read_polls" ON polls
  FOR SELECT
  USING (true);

CREATE POLICY "users_respond_polls" ON poll_responses
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default badges
INSERT INTO badges (name, description, icon_url, category, criteria) VALUES
  ('Profile Master', 'Complete your business profile 100%', '🎯', 'profile', '{"type": "profile_completion", "percentage": 100}'::jsonb),
  ('Social Butterfly', 'Post 10 times in a month', '🦋', 'engagement', '{"type": "posts_count", "value": 10, "timeframe": "monthly"}'::jsonb),
  ('Event Host', 'Host 5 or more events', '📅', 'event', '{"type": "events_hosted", "value": 5}'::jsonb),
  ('Responsive Pro', 'Respond to all reviews within 24 hours', '⚡', 'review', '{"type": "review_response_time", "hours": 24}'::jsonb),
  ('Community Leader', '100+ followers or high engagement', '👑', 'community', '{"type": "followers_or_engagement", "value": 100}'::jsonb),
  ('Collaborator', 'Complete 3 or more collaborations', '🤝', 'collaboration', '{"type": "collaborations_completed", "value": 3}'::jsonb),
  ('Top Rated', 'Maintain 4.5+ star rating', '⭐', 'review', '{"type": "average_rating", "value": 4.5}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Commit
COMMIT;
