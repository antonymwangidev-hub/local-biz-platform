import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

// Extended Post Card for Social Feed (2.0)
export interface SocialPost {
  id: string;
  business_id: string;
  type: "promotion" | "update" | "announcement" | "event-promotion";
  title: string | null;
  content: string;
  attachments: Array<{
    url: string;
    type: "image" | "video";
    thumbnail?: string;
  }>;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  // Extended fields
  business_name?: string;
  business_logo?: string;
  user_liked?: boolean;
}

interface SocialPostCardProps {
  post: SocialPost;
  onDelete?: () => void;
  onLikeChange?: (newCount: number) => void;
}

export function SocialPostCard({ post, onDelete, onLikeChange }: SocialPostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiking, setIsLiking] = useState(false);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count);
  const [isLiked, setIsLiked] = useState(post.user_liked ?? false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments, post.id]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*, user_id")
        .eq("post_id", post.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      toast({
        title: "Error loading comments",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Please sign in to like posts", variant: "destructive" });
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    try {
      const userId = user.id;

      if (isLiked) {
        // Unlike
        await supabase
          .from("post_likes")
          .delete()
          .match({ post_id: post.id, user_id: userId });
        setIsLiked(false);
        setLocalLikesCount(Math.max(0, localLikesCount - 1));
      } else {
        // Like
        await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: userId,
        });
        setIsLiked(true);
        setLocalLikesCount(localLikesCount + 1);
      }
      onLikeChange?.(localLikesCount);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment,
        })
        .select()
        .single();

      if (error) throw error;

      setComments([data, ...comments]);
      setNewComment("");
      toast({ title: "Comment added" });
    } catch (err: any) {
      toast({
        title: "Error adding comment",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await supabase.from("posts").delete().eq("id", post.id);
      toast({ title: "Post deleted" });
      onDelete?.();
    } catch (err: any) {
      toast({
        title: "Error deleting post",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getPostTypeStyle = (type: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      promotion: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "💰 Promotion" },
      update: { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "📰 Update" },
      announcement: { bg: "bg-red-50 border-red-200", text: "text-red-700", label: "📢 Announcement" },
      "event-promotion": { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", label: "🎉 Event" },
    };
    return styles[type] || styles.update;
  };

  const postStyle = getPostTypeStyle(post.type);

  return (
    <div className={`border-2 rounded-xl p-5 bg-white hover:shadow-lg transition-shadow ${postStyle.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {post.business_logo && (
            <img
              src={post.business_logo}
              alt={post.business_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg">{post.business_name}</h3>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${postStyle.text}`}>
            {postStyle.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {post.title && <h2 className="font-bold text-xl mb-2">{post.title}</h2>}
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Media Gallery */}
      {post.attachments && post.attachments.length > 0 && (
        <div
          className={`grid gap-2 mb-4 rounded-xl overflow-hidden ${
            post.attachments.length === 1
              ? "grid-cols-1"
              : post.attachments.length === 2
                ? "grid-cols-2"
                : "grid-cols-2"
          }`}
        >
          {post.attachments.slice(0, 4).map((attachment, idx) => (
            <div key={idx} className="aspect-square bg-gray-200 overflow-hidden relative group">
              {attachment.type === "image" ? (
                <img
                  src={attachment.url}
                  alt={`Post attachment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <video
                    src={attachment.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>
              )}
              {post.attachments.length > 4 && idx === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">+{post.attachments.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between text-sm font-medium text-gray-600 mb-4 pb-4 border-b-2 border-gray-200">
        <span>❤️ {localLikesCount} likes</span>
        <span>💬 {post.comments_count} comments</span>
        <span>📤 {post.shares_count} shares</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 justify-center gap-2 font-semibold transition-colors ${
            isLiked
              ? "text-red-500 bg-red-50 hover:bg-red-100"
              : "hover:bg-gray-100"
          }`}
          onClick={handleLike}
          disabled={isLiking}
        >
          <Heart
            size={20}
            className={isLiked ? "fill-red-500" : ""}
          />
          {isLiked ? "Unlike" : "Like"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center gap-2 font-semibold hover:bg-gray-100"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={20} />
          Comment
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center gap-2 font-semibold hover:bg-gray-100"
        >
          <Share2 size={20} />
          Share
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t-2 border-gray-200 pt-4 space-y-4">
          {/* New Comment Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            />
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="px-4"
            >
              Post
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loadingComments ? (
              <p className="text-sm text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-bold text-gray-600 mb-1">User #{comment.user_id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialPostCard;
