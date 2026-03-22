// LocalBiz Connect 2.0 - Extended Supabase Types
// Auto-generated types for all tables including social features

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Posts Table Types
export type Post = {
  id: string
  business_id: string
  type: 'promotion' | 'update' | 'announcement' | 'event-promotion'
  title: string | null
  content: string
  attachments: { url: string; type: 'image' | 'video'; thumbnail?: string }[]
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
  updated_at: string
}

export type PostInsert = Omit<Post, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count' | 'shares_count'>
export type PostUpdate = Partial<PostInsert>

// Comments Table Types
export type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  likes_count: number
  created_at: string
  updated_at: string
}

export type CommentInsert = Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'likes_count'>
export type CommentUpdate = Partial<CommentInsert>

// Post Likes Types
export type PostLike = {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export type PostLikeInsert = Omit<PostLike, 'id' | 'created_at'>

// Badges Types
export type Badge = {
  id: string
  name: string
  description: string
  icon_url: string | null
  category: 'profile' | 'engagement' | 'event' | 'review' | 'community' | 'collaboration'
  criteria: Json
  created_at: string
}

export type BadgeInsert = Omit<Badge, 'id' | 'created_at'>

// User Badges Types
export type UserBadge = {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

export type UserBadgeInsert = Omit<UserBadge, 'id' | 'earned_at'>

// Collaborations Types
export type Collaboration = {
  id: string
  requesting_business_id: string
  collaboration_type: 'partnership' | 'cross-promotion' | 'event' | 'mentorship'
  title: string
  description: string
  status: 'open' | 'interested' | 'matched' | 'in-progress' | 'completed'
  interested_businesses: { id: string; name: string; category: string }[]
  matched_business_id: string | null
  budget_range: string | null
  deadline: string | null
  created_at: string
  updated_at: string
}

export type CollaborationInsert = Omit<Collaboration, 'id' | 'created_at' | 'updated_at'>
export type CollaborationUpdate = Partial<CollaborationInsert>

// Business Analytics Types
export type BusinessAnalytics = {
  id: string
  business_id: string
  profile_views: number
  post_engagement: number
  booking_count: number
  review_count: number
  follower_count: number
  average_rating: number | null
  date: string
  created_at: string
}

export type BusinessAnalyticsInsert = Omit<BusinessAnalytics, 'id' | 'created_at'>

// Business Groups Types
export type BusinessGroup = {
  id: string
  name: string
  description: string | null
  category: 'industry' | 'location' | 'interest' | 'service'
  icon_url: string | null
  members_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export type BusinessGroupInsert = Omit<BusinessGroup, 'id' | 'created_at' | 'updated_at' | 'members_count'>

// Group Members Types
export type GroupMember = {
  id: string
  group_id: string
  business_id: string
  role: 'member' | 'moderator' | 'admin'
  joined_at: string
}

export type GroupMemberInsert = Omit<GroupMember, 'id' | 'joined_at'>

// Stories Types
export type Story = {
  id: string
  user_id: string
  business_id: string | null
  content: string | null
  media_urls: { url: string; type: 'image' | 'video' }[]
  views_count: number
  likes_count: number
  is_featured: boolean
  expires_at: string
  created_at: string
}

export type StoryInsert = Omit<Story, 'id' | 'created_at' | 'views_count' | 'likes_count'>

// Polls Types
export type Poll = {
  id: string
  business_id: string
  question: string
  options: { id: string; text: string; votes: number }[]
  status: 'active' | 'closed'
  total_responses: number
  expires_at: string
  created_at: string
}

export type PollInsert = Omit<Poll, 'id' | 'created_at' | 'total_responses'>

// Poll Responses Types
export type PollResponse = {
  id: string
  poll_id: string
  user_id: string
  selected_option: string
  created_at: string
}

export type PollResponseInsert = Omit<PollResponse, 'id' | 'created_at'>

// Story Likes Types
export type StoryLike = {
  id: string
  story_id: string
  user_id: string
  created_at: string
}

export type StoryLikeInsert = Omit<StoryLike, 'id' | 'created_at'>

// Extended User Profile with Gamification
export type ExtendedUserProfile = {
  user_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  badges: Badge[]
  badge_count: number
  follower_count: number
  following_count: number
  created_at: string
}

// Extended Business Profile with Analytics
export type ExtendedBusinessProfile = {
  id: string
  name: string
  category: string
  description: string | null
  logo: string | null
  rating: number | null
  review_count: number | null
  badges: Badge[]
  badge_count: number
  follower_count: number
  analytics: BusinessAnalytics | null
  latest_posts: Post[]
  created_at: string
}

// Feed Item (Union Type for Timeline)
export type FeedItem = {
  id: string
  type: 'post' | 'event' | 'collaboration' | 'story'
  data: Post | Event | Collaboration | Story
  business?: { name: string; logo: string | null }
  user?: { full_name: string | null; avatar_url: string | null }
  created_at: string
}

// Event Type (for reference)
export type Event = {
  id: string
  business_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  location: string | null
  capacity: number | null
  price: number | null
  image_url: string | null
  created_at: string
}

// API Response Types
export type ApiResponse<T> = {
  data: T | null
  error: string | null
  status: number
}

export type PagedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Dashboard Stats
export type DashboardStats = {
  totalPosts: number
  totalEngagement: number
  profileViews: number
  bookings: number
  reviews: number
  averageRating: number | null
  badges: Badge[]
  trendingMetrics: {
    date: string
    value: number
  }[]
}

// Suggestions/Recommendations
export type BusinessSuggestion = {
  businessId: string
  businessName: string
  score: number
  reason: string
  category: string
  mutualConnections?: number
}

export type EngagementSuggestion = {
  type: string
  title: string
  description: string
  action: string
  impact: string
}
