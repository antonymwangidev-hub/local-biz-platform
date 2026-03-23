import { useState, useEffect } from "react";
import { Award, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge_name: string;
  badge_icon_url: string | null;
  badge_description: string;
  badge_category: string;
}

interface BadgeShowcaseProps {
  businessId?: string;
  className?: string;
}

export function BadgeShowcase({ businessId, className = "" }: BadgeShowcaseProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchUserBadges();
  }, [user, businessId]);

  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("user_badges")
        .select(
          `
          id,
          earned_at,
          badge_id,
          badges (
            id,
            name,
            description,
            icon_url,
            category
          )
        `
        )
        .order("earned_at", { ascending: false });

      if (businessId) {
        // Filter badges for specific business if needed
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Map the response to our UserBadge type
      const mappedBadges = (data || []).map((item: any) => ({
        id: item.id,
        badge_id: item.badge_id,
        earned_at: item.earned_at,
        badge_name: item.badges?.name || "Unknown Badge",
        badge_icon_url: item.badges?.icon_url,
        badge_description: item.badges?.description || "",
        badge_category: item.badges?.category || "profile",
      }));

      setBadges(mappedBadges);
    } catch (err: any) {
      console.error("Error fetching badges:", err);
      toast({
        title: "Error loading badges",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons: Record<string, string> = {
    profile: "👤",
    engagement: "💬",
    event: "🎉",
    review: "⭐",
    community: "🤝",
    collaboration: "🔗",
  };

  const categoryLabels: Record<string, string> = {
    profile: "Profile",
    engagement: "Engagement",
    event: "Events",
    review: "Reviews",
    community: "Community",
    collaboration: "Collaborations",
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <Award className="h-5 w-5" />
          <span>Loading badges...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
        <span className="ml-auto bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
          {badges.length} earned
        </span>
      </div>

      {/* Empty State */}
      {badges.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No badges earned yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Start engaging with the community, complete events, and get reviews to earn badges!
          </p>
        </div>
      ) : (
        <>
          {/* Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className="group relative p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-200"
              >
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full p-1">
                  <Sparkles className="h-3 w-3" />
                </div>
                
                {/* Badge Icon */}
                {badge.badge_icon_url ? (
                  <img
                    src={badge.badge_icon_url}
                    alt={badge.badge_name}
                    className="w-12 h-12 mx-auto mb-2 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                    {categoryIcons[badge.badge_category] || "🏆"}
                  </div>
                )}

                {/* Badge Name */}
                <h3 className="text-sm font-bold text-gray-900 text-center mb-1 line-clamp-2">
                  {badge.badge_name}
                </h3>

                {/* Badge Category */}
                <p className="text-xs text-gray-600 text-center">
                  {categoryLabels[badge.badge_category] || badge.badge_category}
                </p>

                {/* Earned Date */}
                <p className="text-xs text-gray-500 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold">TOTAL BADGES</p>
                  <p className="text-2xl font-bold text-blue-900">{badges.length}</p>
                </div>
                <Award className="h-8 w-8 text-blue-400 opacity-50" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 font-semibold">LATEST</p>
                  <p className="text-lg font-bold text-purple-900">
                    {badges.length > 0
                      ? new Date(badges[0].earned_at).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400 opacity-50" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-semibold">CATEGORIES</p>
                  <p className="text-2xl font-bold text-green-900">
                    {new Set(badges.map((b) => b.badge_category)).size}
                  </p>
                </div>
                <Sparkles className="h-8 w-8 text-green-400 opacity-50" />
              </div>
            </div>
          </div>

          {/* Badge Details Modal */}
          {selectedBadge && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedBadge(null)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  {selectedBadge.badge_icon_url ? (
                    <img
                      src={selectedBadge.badge_icon_url}
                      alt={selectedBadge.badge_name}
                      className="w-24 h-24 mx-auto mb-4 rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-yellow-100 flex items-center justify-center text-5xl">
                      {categoryIcons[selectedBadge.badge_category] || "🏆"}
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedBadge.badge_name}
                  </h2>

                  <p className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    {categoryLabels[selectedBadge.badge_category]}
                  </p>

                  <p className="text-gray-600 mb-6">{selectedBadge.badge_description}</p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-600 mb-1">Earned on</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(selectedBadge.earned_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedBadge(null)}
                    className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BadgeShowcase;
