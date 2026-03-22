import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import CreatePostModal from "@/components/CreatePostModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PostType } from "@/data/samplePosts";

type FilterType = "all" | PostType;

const Feed = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["feed-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          businesses(name, slug, logo),
          post_likes(id, user_id),
          post_comments(id, user_id, content, created_at)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;

      // Fetch profiles for all user_ids
      const userIds = new Set<string>();
      (data ?? []).forEach((p: any) => {
        userIds.add(p.user_id);
        p.post_comments?.forEach((c: any) => userIds.add(c.user_id));
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", Array.from(userIds));

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.user_id, p])
      );

      return (data ?? []).map((post: any) => {
        const profile = profileMap.get(post.user_id);
        return {
          ...post,
          _profile: profile ?? null,
          post_comments: (post.post_comments ?? []).map((c: any) => ({
            ...c,
            _profile: profileMap.get(c.user_id) ?? null,
          })),
        };
      });
    },
  });

  const filtered = useMemo(
    () => (filter === "all" ? posts : posts.filter((p: any) => p.type === filter)),
    [filter, posts]
  );

  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All Posts" },
    { value: "promotion", label: "🔥 Promotions" },
    { value: "update", label: "📢 Updates" },
    { value: "event", label: "🎉 Events" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl flex items-center gap-2">
                  <Sparkles size={28} className="text-secondary" />
                  Community Feed
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  See what local businesses are up to
                </p>
              </div>
              {user && (
                <CreatePostModal
                  trigger={
                    <Button variant="hero" className="gap-2">
                      <Plus size={18} />
                      <span className="hidden sm:inline">Create Post</span>
                    </Button>
                  }
                />
              )}
            </div>
            <div className="mt-6 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filter === f.value
                      ? "gradient-hero text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-2xl gap-5">
              {isLoading ? (
                <div className="py-20 text-center text-muted-foreground">Loading posts…</div>
              ) : filtered.length > 0 ? (
                filtered.map((post: any, i: number) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <PostCard
                      post={{
                        id: post.id,
                        businessId: post.business_id ?? "",
                        businessName: post.businesses?.name ?? post._profile?.full_name ?? "Unknown",
                        businessLogo: post.businesses?.logo ?? "",
                        businessSlug: post.businesses?.slug,
                        type: post.type as PostType,
                        content: post.content,
                        image: post.image_url ?? undefined,
                        likes: post.post_likes.length,
                        isLiked: user ? post.post_likes.some((l: any) => l.user_id === user.id) : false,
                        comments: post.post_comments.map((c: any) => ({
                          id: c.id,
                          userName: c._profile?.full_name ?? "Anonymous",
                          content: c.content,
                          createdAt: c.created_at,
                        })),
                        createdAt: post.created_at,
                      }}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  {posts.length === 0
                    ? "No posts yet. Be the first to share something!"
                    : "No posts in this category yet."}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Feed;
