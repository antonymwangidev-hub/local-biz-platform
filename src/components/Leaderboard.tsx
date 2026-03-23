import { useEffect, useState } from "react";
import { Trophy, Flame, Target, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LeaderboardEntry {
  business_id: string;
  business_name: string;
  business_logo: string | null;
  engagement_score: number;
  posts_count: number;
  badges_count: number;
  followers_count: number;
  rank: number;
}

interface LeaderboardProps {
  limit?: number;
  category?: "engagement" | "posts" | "badges" | "followers";
  timeframe?: "week" | "month" | "all-time";
  className?: string;
}

export function Leaderboard({
  limit = 10,
  category = "engagement",
  timeframe = "month",
  className = "",
}: LeaderboardProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory, limit, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Get business analytics data
      let query = supabase
        .from("business_analytics")
        .select(`
          business_id,
          businesses (
            id,
            name,
            logo_url
          ),
          engagement_score,
          posts_count,
          followers_count
        `)
        .order(getSortField(selectedCategory), { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Get badge counts for each business
      let entriesWithBadges = await Promise.all(
        (data || []).map(async (item: any, idx) => {
          const { count } = await supabase
            .from("user_badges")
            .select("*", { count: "exact" })
            .eq("business_id", item.business_id);

          return {
            business_id: item.business_id,
            business_name: item.businesses?.name || "Unknown",
            business_logo: item.businesses?.logo_url,
            engagement_score: item.engagement_score || 0,
            posts_count: item.posts_count || 0,
            badges_count: count || 0,
            followers_count: item.followers_count || 0,
            rank: idx + 1,
          };
        })
      );

      setEntries(entriesWithBadges);
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      toast({
        title: "Error loading leaderboard",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSortField = (cat: string) => {
    switch (cat) {
      case "posts":
        return "posts_count";
      case "badges":
        return "badges_count";
      case "followers":
        return "followers_count";
      default:
        return "engagement_score";
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-400 to-yellow-500";
    if (rank === 2) return "from-gray-300 to-gray-400";
    if (rank === 3) return "from-orange-400 to-orange-500";
    return "from-blue-50 to-blue-100";
  };

  const categories = [
    { value: "engagement", label: "Engagement", icon: "💬" },
    { value: "posts", label: "Posts", icon: "📱" },
    { value: "badges", label: "Badges", icon: "🏆" },
    { value: "followers", label: "Followers", icon: "👥" },
  ];

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <Trophy className="h-5 w-5" />
          <span>Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Crown className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
        <span className="ml-auto text-sm text-gray-600">
          {timeframe === "week" && "This Week"}
          {timeframe === "month" && "This Month"}
          {timeframe === "all-time" && "All Time"}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value as any)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-all ${
              selectedCategory === cat.value
                ? "bg-primary text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      {entries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No data yet</h3>
          <p className="text-gray-600">Leaderboard data will appear as businesses engage with the platform</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <div
              key={entry.business_id}
              className={`bg-gradient-to-r ${getRankColor(
                entry.rank
              )} rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow border border-gray-200`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white font-bold text-lg">
                <span className="text-xl">{getRankMedal(entry.rank)}</span>
              </div>

              {/* Business Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {entry.business_logo && (
                  <img
                    src={entry.business_logo}
                    alt={entry.business_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{entry.business_name}</h3>
                  <p className="text-xs text-gray-600">Business</p>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex gap-6 text-right">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">POSTS</p>
                  <p className="text-lg font-bold text-gray-900">{entry.posts_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">BADGES</p>
                  <p className="text-lg font-bold text-gray-900">{entry.badges_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">FOLLOWERS</p>
                  <p className="text-lg font-bold text-gray-900">{entry.followers_count}</p>
                </div>
              </div>

              {/* Main Score */}
              <div className="flex flex-col items-center gap-1 ml-4">
                <Flame className="h-5 w-5 text-orange-500" />
                <p className="text-sm font-bold text-gray-900">{entry.engagement_score}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-2xl mb-1">🥇</p>
          <p className="text-xs font-semibold text-gray-700">1st Place</p>
        </div>
        <div className="text-center">
          <p className="text-2xl mb-1">🥈</p>
          <p className="text-xs font-semibold text-gray-700">2nd Place</p>
        </div>
        <div className="text-center">
          <p className="text-2xl mb-1">🥉</p>
          <p className="text-xs font-semibold text-gray-700">3rd Place</p>
        </div>
        <div className="text-center">
          <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-gray-700">Engagement</p>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
