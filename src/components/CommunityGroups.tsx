import { useState, useEffect } from "react";
import { Users, MessageSquare, Plus, Settings, Trash2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface BusinessGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url: string | null;
  member_count: number;
  post_count: number;
  created_at: string;
  is_member?: boolean;
}

export interface GroupPost {
  id: string;
  group_id: string;
  business_id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  business_name?: string;
  business_logo?: string;
}

interface CommunityGroupsProps {
  businessId?: string;
  className?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  retail: "🛍️",
  food: "🍽️",
  services: "💼",
  health: "⚕️",
  technology: "💻",
  education: "🎓",
  entertainment: "🎭",
  fitness: "💪",
  other: "📌",
};

export function CommunityGroups({ businessId, className = "" }: CommunityGroupsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [groups, setGroups] = useState<BusinessGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<BusinessGroup | null>(null);
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [postingTo, setPostingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupPosts(selectedGroup.id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setGroups(data || []);
    } catch (err: any) {
      console.error("Error fetching groups:", err);
      toast({
        title: "Error loading groups",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupPosts = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from("group_posts")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch business info for each post
      const postsWithInfo = await Promise.all(
        (data || []).map(async (post: any) => {
          const { data: businessData } = await supabase
            .from("businesses")
            .select("name, logo_url")
            .eq("id", post.business_id)
            .single();

          return {
            ...post,
            business_name: businessData?.name,
            business_logo: businessData?.logo_url,
          };
        })
      );

      setGroupPosts(postsWithInfo);
    } catch (err: any) {
      console.error("Error fetching group posts:", err);
    }
  };

  const handleJoinGroup = async (group: BusinessGroup) => {
    if (!user || !businessId) {
      toast({ title: "Please sign in and have a business", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("group_members").insert({
        group_id: group.id,
        business_id: businessId,
      });

      if (error) throw error;

      toast({ title: "Joined group! 🎉" });
      fetchGroups();
    } catch (err: any) {
      toast({
        title: "Error joining group",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handlePostToGroup = async (groupId: string) => {
    if (!user || !businessId || !newPostContent.trim()) {
      toast({ title: "Please sign in and have a business", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("group_posts").insert({
        group_id: groupId,
        business_id: businessId,
        content: newPostContent,
      });

      if (error) throw error;

      toast({ title: "Post shared with group! 📤" });
      setNewPostContent("");
      setPostingTo(null);
      fetchGroupPosts(groupId);
    } catch (err: any) {
      toast({
        title: "Error posting to group",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <Users className="h-5 w-5" />
          <span>Loading communities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communities & Groups</h2>
          <p className="text-gray-600 mt-1">Join industry groups and share knowledge</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="h-5 w-5" />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Available Groups</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {groups.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No groups available yet</p>
                </div>
              ) : (
                groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors ${
                      selectedGroup?.id === group.id ? "bg-blue-50 border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {group.logo_url ? (
                        <img
                          src={group.logo_url}
                          alt={group.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                          {CATEGORY_ICONS[group.category] || "📌"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{group.name}</h4>
                        <p className="text-xs text-gray-500">{group.member_count} members</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Group Details & Posts */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <div className="space-y-4">
              {/* Group Header */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4 mb-4">
                  {selectedGroup.logo_url ? (
                    <img
                      src={selectedGroup.logo_url}
                      alt={selectedGroup.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center text-4xl">
                      {CATEGORY_ICONS[selectedGroup.category] || "📌"}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedGroup.name}</h3>
                    <p className="text-gray-600 mb-3">{selectedGroup.description}</p>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        {selectedGroup.member_count} members
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MessageSquare className="h-4 w-4" />
                        {selectedGroup.post_count} posts
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinGroup(selectedGroup)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Join Group
                  </button>
                </div>
              </div>

              {/* New Post Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <textarea
                  placeholder="Share your thoughts with the group..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setNewPostContent("")}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePostToGroup(selectedGroup.id)}
                    disabled={!newPostContent.trim()}
                    className="ml-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-semibold"
                  >
                    Share
                  </button>
                </div>
              </div>

              {/* Group Posts */}
              <div className="space-y-3">
                {groupPosts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600">No posts yet. Be the first to share!</p>
                  </div>
                ) : (
                  groupPosts.map((post) => (
                    <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {post.business_logo ? (
                          <img
                            src={post.business_logo}
                            alt={post.business_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{post.business_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">{post.content}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <button className="hover:text-primary transition-colors">
                          ❤️ {post.likes_count} likes
                        </button>
                        <button className="hover:text-primary transition-colors">
                          💬 {post.comments_count} comments
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a group to get started</h3>
              <p className="text-gray-600">Choose a group from the list to view discussions and participate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommunityGroups;
