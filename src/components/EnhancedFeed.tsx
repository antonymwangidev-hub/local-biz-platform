import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SocialPostCard, SocialPost } from "./SocialPostCard";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EnhancedFeedProps {
  businessId?: string;
  limit?: number;
  showFilters?: boolean;
}

type PostFilter = "all" | "update" | "promotion" | "announcement" | "event-promotion";

export function EnhancedFeed({
  businessId,
  limit = 20,
  showFilters = true,
}: EnhancedFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PostFilter>("all");
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Fetch posts from Supabase
  const fetchPosts = async (pageOffset = 0) => {
    try {
      setError(null);
      let query = supabase
        .from("posts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(pageOffset, pageOffset + limit - 1);

      // Filter by business if specified
      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      // Filter by post type
      if (filter !== "all") {
        query = query.eq("type", filter);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Map database records to SocialPost format
      const mappedPosts = (data || []).map((post: any) => ({
        ...post,
        title: post.title || null,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        updated_at: post.updated_at || post.created_at,
        attachments: post.attachments || [],
      })) as SocialPost[];

      if (pageOffset === 0) {
        setPosts(mappedPosts);
      } else {
        setPosts((prev) => [...prev, ...mappedPosts]);
      }

      // Check if there are more posts
      const totalFetched = pageOffset + (data?.length || 0);
      setHasMore(totalFetched < (count || 0));
    } catch (err: any) {
      setError(err.message || "Failed to load posts");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchPosts(0);
  }, [filter, businessId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`posts:${businessId || "all"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
          filter: businessId ? `business_id=eq.${businessId}` : undefined,
        },
        (payload) => {
          const newPost = payload.new as any;
          const mappedPost: SocialPost = {
            ...newPost,
            title: newPost.title || null,
            likes_count: newPost.likes_count || 0,
            comments_count: newPost.comments_count || 0,
            shares_count: newPost.shares_count || 0,
            updated_at: newPost.updated_at || newPost.created_at,
            attachments: newPost.attachments || [],
          };
          if (filter === "all" || mappedPost.type === filter) {
            setPosts((prev) => [mappedPost, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts",
          filter: businessId ? `business_id=eq.${businessId}` : undefined,
        },
        (payload) => {
          const deletedPost = payload.old as any;
          setPosts((prev) => prev.filter((p) => p.id !== deletedPost.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, filter]);

  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchPosts(newOffset);
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const filterOptions: { value: PostFilter; label: string; icon: string }[] = [
    { value: "all", label: "All Posts", icon: "📱" },
    { value: "update", label: "Updates", icon: "📰" },
    { value: "promotion", label: "Promotions", icon: "💰" },
    { value: "announcement", label: "Announcements", icon: "📢" },
    { value: "event-promotion", label: "Events", icon: "🎉" },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      {showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-semibold ${
                filter === option.value
                  ? "bg-primary text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && offset === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
          <p className="text-gray-600">
            {filter === "all"
              ? "Be the first to share something amazing!"
              : `No ${filter} posts yet.`}
          </p>
        </div>
      )}

      {/* Posts Grid */}
      <div className="space-y-4">
        {posts.map((post) => (
          <SocialPostCard
            key={post.id}
            post={post}
            onDelete={() => handlePostDelete(post.id)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && posts.length > 0 && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 font-semibold transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More Posts"
            )}
          </button>
        </div>
      )}

      {/* End of Feed Message */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You've reached the end! 🎉</p>
        </div>
      )}
    </div>
  );
}

export default EnhancedFeed;
