import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Eye, MessageCircle, Star, Calendar, Zap, ArrowUp, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  profile_views: number;
  engagement_score: number;
  bookings: number;
  avg_rating: number;
  story_interactions: number;
  posts_count: number;
  followers_count: number;
}

interface MetricTrend {
  date: string;
  views: number;
  engagement: number;
  interactions: number;
}

interface AnalyticsDashboardProps {
  businessId?: string;
  className?: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function AnalyticsDashboard({ businessId, className = "" }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<MetricTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, businessId, selectedPeriod]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const bid = businessId || user?.id;
      if (!bid) return;

      // Fetch business analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from("business_analytics")
        .select("*")
        .eq("business_id", bid)
        .single();

      if (analyticsError && analyticsError.code !== "PGRST116") throw analyticsError;

      // Fetch posts count
      const { count: postsCount } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("business_id", bid);

      // Generate mock trend data (in production, this would come from a metrics table)
      const mockTrends = generateTrendData(selectedPeriod);

      setStats({
        profile_views: analyticsData?.profile_views || 0,
        engagement_score: analyticsData?.engagement_score || 0,
        bookings: analyticsData?.bookings_count || 0,
        avg_rating: analyticsData?.avg_rating || 4.5,
        story_interactions: analyticsData?.story_interactions || 0,
        posts_count: postsCount || 0,
        followers_count: analyticsData?.followers_count || 0,
      });

      setTrends(mockTrends);
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      toast({
        title: "Error loading analytics",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (period: "week" | "month" | "year"): MetricTrend[] => {
    const data: MetricTrend[] = [];
    const days = period === "week" ? 7 : period === "month" ? 30 : 365;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      data.push({
        date: dateStr,
        views: Math.floor(Math.random() * 500) + 50,
        engagement: Math.floor(Math.random() * 100) + 10,
        interactions: Math.floor(Math.random() * 50) + 5,
      });
    }
    return data;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast({ title: "Analytics refreshed" });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-600">No analytics data available yet</p>
      </div>
    );
  }

  const engagementRate = ((stats.engagement_score / (stats.profile_views || 1)) * 100).toFixed(1);
  const topMetric = Math.max(stats.profile_views, stats.engagement_score, stats.bookings);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your business growth and engagement</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(["week", "month", "year"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded font-semibold transition-all capitalize ${
                  selectedPeriod === period
                    ? "bg-primary text-white shadow"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Eye className="h-5 w-5" />}
          title="Profile Views"
          value={stats.profile_views}
          change="+12%"
          color="blue"
        />
        <MetricCard
          icon={<MessageCircle className="h-5 w-5" />}
          title="Engagement Score"
          value={stats.engagement_score}
          change="+8%"
          color="green"
        />
        <MetricCard
          icon={<Calendar className="h-5 w-5" />}
          title="Bookings"
          value={stats.bookings}
          change="+5%"
          color="amber"
        />
        <MetricCard
          icon={<Star className="h-5 w-5" />}
          title="Avg Rating"
          value={stats.avg_rating.toFixed(1)}
          change={stats.avg_rating > 4 ? "⭐ Excellent" : "⭐ Good"}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views & Engagement Trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} name="Profile Views" />
              <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Interaction Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Engagement Mix</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Posts", value: stats.posts_count },
                  { name: "Story Interactions", value: stats.story_interactions },
                  { name: "Followers", value: stats.followers_count },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1, 2].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Bars */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Breakdown</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { category: "Views", value: Math.min(stats.profile_views, 500) },
              { category: "Engagement", value: Math.min(stats.engagement_score, 500) },
              { category: "Bookings", value: Math.min(stats.bookings * 50, 500) },
              { category: "Stories", value: Math.min(stats.story_interactions, 500) },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights & Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3">AI-Powered Insights</h3>
            <div className="space-y-2 text-sm text-gray-700">
              {stats.profile_views > 200 && (
                <p className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Your profile views are trending up! Keep posting regularly to maintain momentum.
                </p>
              )}
              {stats.engagement_score > 50 && (
                <p className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-blue-600" />
                  Your engagement rate is excellent. Consider hosting an event to boost visibility further.
                </p>
              )}
              {stats.bookings < 5 && (
                <p className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-orange-600" />
                  Increase bookings by responding faster to inquiries and posting promotional offers.
                </p>
              )}
              {stats.avg_rating >= 4.5 && (
                <p className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-600" />
                  Excellent rating! Encourage customers to leave more reviews to build trust.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Create a Post"
          description="Share updates, promotions, or announcements"
          icon="📱"
          actionText="New Post"
          bgColor="from-blue-50 to-blue-100"
        />
        <ActionCard
          title="Host an Event"
          description="Create an event to increase engagement"
          icon="🎉"
          actionText="Create Event"
          bgColor="from-purple-50 to-purple-100"
        />
        <ActionCard
          title="Boost Visibility"
          description="Post stories and respond to reviews"
          icon="🚀"
          actionText="Start Boost"
          bgColor="from-green-50 to-green-100"
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  color: "blue" | "green" | "amber" | "purple";
}

function MetricCard({ icon, title, value, change, color }: MetricCardProps) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-600",
    green: "bg-green-50 border-green-200 text-green-600",
    amber: "bg-amber-50 border-amber-200 text-amber-600",
    purple: "bg-purple-50 border-purple-200 text-purple-600",
  };

  return (
    <div className={`${colorMap[color]} rounded-lg border-2 p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-gray-600 text-sm font-semibold mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-xs font-semibold text-gray-600">{change}</p>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  actionText: string;
  bgColor: string;
}

function ActionCard({ title, description, icon, actionText, bgColor }: ActionCardProps) {
  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow`}>
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button className="w-full bg-gray-900 text-white font-semibold py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm">
        {actionText}
      </button>
    </div>
  );
}

export default AnalyticsDashboard;
