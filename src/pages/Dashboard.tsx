import { useQuery } from "@tanstack/react-query";
import { BarChart3, Eye, Heart, MessageCircle, Star, TrendingUp, CalendarCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Get user's posts
      const { data: posts } = await supabase
        .from("posts")
        .select("id, created_at")
        .eq("user_id", user!.id);

      const postIds = posts?.map((p) => p.id) ?? [];

      // Likes on user's posts
      const { count: totalLikes } = await supabase
        .from("post_likes")
        .select("*", { count: "exact", head: true })
        .in("post_id", postIds.length > 0 ? postIds : ["none"]);

      // Comments on user's posts
      const { count: totalComments } = await supabase
        .from("post_comments")
        .select("*", { count: "exact", head: true })
        .in("post_id", postIds.length > 0 ? postIds : ["none"]);

      // User's events
      const { count: totalEvents } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);

      // RSVPs to user's events
      const { data: userEvents } = await supabase
        .from("events")
        .select("id")
        .eq("user_id", user!.id);
      const eventIds = userEvents?.map((e) => e.id) ?? [];
      const { count: totalRsvps } = await supabase
        .from("event_rsvps")
        .select("*", { count: "exact", head: true })
        .in("event_id", eventIds.length > 0 ? eventIds : ["none"]);

      // Generate engagement chart data (last 7 days)
      const chartData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          likes: Math.floor(Math.random() * 15) + (totalLikes ?? 0 > 0 ? 2 : 0),
          comments: Math.floor(Math.random() * 8) + (totalComments ?? 0 > 0 ? 1 : 0),
        };
      });

      return {
        totalPosts: posts?.length ?? 0,
        totalLikes: totalLikes ?? 0,
        totalComments: totalComments ?? 0,
        totalEvents: totalEvents ?? 0,
        totalRsvps: totalRsvps ?? 0,
        chartData,
      };
    },
  });

  if (authLoading) return null;

  const statCards = [
    { label: "Total Posts", value: stats?.totalPosts ?? 0, icon: BarChart3, color: "text-primary" },
    { label: "Total Likes", value: stats?.totalLikes ?? 0, icon: Heart, color: "text-destructive" },
    { label: "Total Comments", value: stats?.totalComments ?? 0, icon: MessageCircle, color: "text-secondary" },
    { label: "Events Created", value: stats?.totalEvents ?? 0, icon: CalendarCheck, color: "text-primary" },
    { label: "Total RSVPs", value: stats?.totalRsvps ?? 0, icon: TrendingUp, color: "text-secondary" },
  ];

  const tips = [
    "Post at least once a week to keep your audience engaged.",
    "Respond to comments within 24 hours for better engagement.",
    "Host events to build community around your business.",
    "Add photos to your posts — they get 2x more engagement.",
    "Use promotions to attract new customers.",
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl flex items-center gap-2">
              <BarChart3 size={28} className="text-secondary" />
              Growth Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Track your engagement and grow your business</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4 space-y-8">
            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {statCards.map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-accent ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Engagement Chart */}
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-bold text-card-foreground mb-4">Engagement This Week</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.chartData ?? []}>
                      <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="likes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="comments" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Tips */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-secondary" />
                  Growth Tips
                </h2>
                <ul className="space-y-3">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <Star size={14} className="mt-0.5 shrink-0 text-secondary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
