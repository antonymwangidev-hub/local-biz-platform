import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postTypeConfig, PostType } from "@/data/samplePosts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PostCardPost {
  id: string;
  businessId: string;
  businessName: string;
  businessLogo: string;
  businessSlug?: string;
  type: PostType;
  content: string;
  image?: string;
  likes: number;
  isLiked?: boolean;
  comments: { id: string; userName: string; content: string; createdAt: string }[];
  createdAt: string;
}

interface PostCardProps {
  post: PostCardPost;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments);

  const config = postTypeConfig[post.type];
  const timeAgo = getTimeAgo(post.createdAt);

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Sign in to like posts", variant: "destructive" });
      return;
    }
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast({ title: "Sign in to comment", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: post.id, user_id: user.id, content: newComment.trim() })
      .select("id, created_at")
      .single();
    if (!error && data) {
      setComments([
        ...comments,
        { id: data.id, userName: "You", content: newComment.trim(), createdAt: data.created_at },
      ]);
      setNewComment("");
    }
  };

  const detailLink = post.businessSlug ? `/business/${post.businessSlug}` : "#";

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Link to={detailLink} className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-accent bg-muted">
          {post.businessLogo ? (
            <img src={post.businessLogo} alt={post.businessName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-accent-foreground">
              {post.businessName[0]}
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link to={detailLink} className="text-sm font-semibold text-card-foreground hover:text-primary transition-colors truncate block">
            {post.businessName}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${config.bgClass} ${config.textClass}`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-line">{post.content}</p>
      </div>

      {post.image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={post.image} alt="Post" className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
        <button onClick={handleLike} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent">
          <motion.div animate={liked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={18} className={liked ? "fill-destructive text-destructive" : "text-muted-foreground"} />
          </motion.div>
          <span className={liked ? "font-medium text-destructive" : "text-muted-foreground"}>{likeCount}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent">
          <MessageCircle size={18} />
          <span>{comments.length}</span>
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent ml-auto">
          <Share2 size={18} />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-border">
            <div className="space-y-3 p-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {comment.userName[0]}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-card-foreground">{comment.userName}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              ))}
              {user && (
                <div className="flex gap-2 pt-1">
                  <Input placeholder="Write a comment…" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} className="h-8 text-xs" />
                  <Button size="icon" variant="ghost" onClick={handleComment} className="h-8 w-8 shrink-0">
                    <Send size={14} />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default PostCard;
