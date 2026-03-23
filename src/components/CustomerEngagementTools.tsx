import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Plus, BarChart3, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CheckInStory {
  id: string;
  business_id: string;
  customer_id: string;
  content: string;
  media_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  customer_name?: string;
  business_name?: string;
}

export interface Poll {
  id: string;
  business_id: string;
  question: string;
  options: string[];
  results: Record<string, number>;
  total_votes: number;
  created_at: string;
  expires_at: string | null;
  business_name?: string;
}

interface CustomerEngagementProps {
  businessId?: string;
  className?: string;
}

export function CustomerEngagementTools({ businessId, className = "" }: CustomerEngagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"stories" | "polls">("stories");
  const [stories, setStories] = useState<CheckInStory[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewStory, setShowNewStory] = useState(false);
  const [showNewPoll, setShowNewPoll] = useState(false);
  const [storyContent, setStoryContent] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    if (activeTab === "stories") {
      fetchStories();
    } else {
      fetchPolls();
    }
  }, [activeTab, businessId]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("check_in_stories")
        .select("*")
        .order("created_at", { ascending: false });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch customer and business names
      const storiesWithInfo = await Promise.all(
        (data || []).map(async (story: any) => {
          const { data: customerData } = await supabase
            .from("users")
            .select("email")
            .eq("id", story.customer_id)
            .single();

          return {
            ...story,
            customer_name: customerData?.email || "Anonymous",
          };
        })
      );

      setStories(storiesWithInfo);
    } catch (err: any) {
      console.error("Error fetching stories:", err);
      toast({
        title: "Error loading stories",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPolls = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("polls")
        .select("*")
        .order("created_at", { ascending: false });

      if (businessId) {
        query = query.eq("business_id", businessId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPolls(data || []);
    } catch (err: any) {
      console.error("Error fetching polls:", err);
      toast({
        title: "Error loading polls",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async () => {
    if (!user || !businessId || !storyContent.trim()) {
      toast({ title: "Please provide a check-in story", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("check_in_stories").insert({
        business_id: businessId,
        customer_id: user.id,
        content: storyContent,
      });

      if (error) throw error;

      toast({ title: "Check-in story posted! 📸" });
      setStoryContent("");
      setShowNewStory(false);
      fetchStories();
    } catch (err: any) {
      toast({
        title: "Error creating story",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePoll = async () => {
    if (!user || !businessId || !pollQuestion.trim()) {
      toast({ title: "Please enter a poll question", variant: "destructive" });
      return;
    }

    const validOptions = pollOptions.filter((o) => o.trim());
    if (validOptions.length < 2) {
      toast({ title: "Poll needs at least 2 options", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("polls").insert({
        business_id: businessId,
        question: pollQuestion,
        options: validOptions,
        results: validOptions.reduce((acc, opt) => ({ ...acc, [opt]: 0 }), {}),
      });

      if (error) throw error;

      toast({ title: "Poll created! 📊" });
      setPollQuestion("");
      setPollOptions(["", "", "", ""]);
      setShowNewPoll(false);
      fetchPolls();
    } catch (err: any) {
      toast({
        title: "Error creating poll",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleVoteInPoll = async (pollId: string, option: string) => {
    if (!user) {
      toast({ title: "Please sign in to vote", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("poll_responses").insert({
        poll_id: pollId,
        user_id: user.id,
        option_selected: option,
      });

      if (error) throw error;

      setUserVotes({ ...userVotes, [pollId]: pollOptions.indexOf(option) });
      toast({ title: "Vote recorded! ✓" });
      fetchPolls();
    } catch (err: any) {
      toast({
        title: "Error recording vote",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleLikeStory = async (story: CheckInStory) => {
    if (!user) {
      toast({ title: "Please sign in to like stories", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("story_likes").insert({
        story_id: story.id,
        user_id: user.id,
      });

      if (error) throw error;

      fetchStories();
    } catch (err: any) {
      toast({
        title: "Error liking story",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <MessageCircle className="h-5 w-5" />
          <span>Loading engagement tools...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Engagement</h2>
          <p className="text-gray-600 mt-1">Stories, polls, and customer interactions</p>
        </div>
        {activeTab === "stories" && (
          <button
            onClick={() => setShowNewStory(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Post Story
          </button>
        )}
        {activeTab === "polls" && (
          <button
            onClick={() => setShowNewPoll(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Poll
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("stories")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all ${
            activeTab === "stories"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          📸 Check-in Stories ({stories.length})
        </button>
        <button
          onClick={() => setActiveTab("polls")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all ${
            activeTab === "polls"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          📊 Polls ({polls.length})
        </button>
      </div>

      {/* Check-In Stories */}
      {activeTab === "stories" && (
        <div className="space-y-4">
          {showNewStory && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <textarea
                placeholder="Share what you're doing at this business..."
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none resize-none"
                rows={4}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setShowNewStory(false);
                    setStoryContent("");
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStory}
                  disabled={!storyContent.trim()}
                  className="ml-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-semibold"
                >
                  Post Story
                </button>
              </div>
            </div>
          )}

          {stories.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No stories yet</h3>
              <p className="text-gray-600">Be the first to check in and share your experience!</p>
            </div>
          ) : (
            stories.map((story) => (
              <div key={story.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{story.customer_name}</h4>
                    <p className="text-xs text-gray-500">
                      {new Date(story.created_at).toLocaleDateString()} at{" "}
                      {new Date(story.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{story.content}</p>
                {story.media_url && (
                  <img
                    src={story.media_url}
                    alt="Story"
                    className="w-full h-48 rounded-lg object-cover mb-3"
                  />
                )}
                <div className="flex gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleLikeStory(story)}
                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    {story.likes_count} likes
                  </button>
                  <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {story.comments_count} comments
                  </button>
                  <button className="flex items-center gap-1 hover:text-green-500 transition-colors ml-auto">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Polls */}
      {activeTab === "polls" && (
        <div className="space-y-4">
          {showNewPoll && (
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <input
                type="text"
                placeholder="Ask a question..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:outline-none mb-3"
              />
              <div className="space-y-2 mb-3">
                <label className="block text-sm font-semibold text-gray-700">Options</label>
                {pollOptions.map((option, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[idx] = e.target.value;
                      setPollOptions(newOptions);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowNewPoll(false);
                    setPollQuestion("");
                    setPollOptions(["", "", "", ""]);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePoll}
                  disabled={!pollQuestion.trim() || pollOptions.filter((o) => o.trim()).length < 2}
                  className="ml-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors font-semibold"
                >
                  Create Poll
                </button>
              </div>
            </div>
          )}

          {polls.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No polls yet</h3>
              <p className="text-gray-600">Create a poll to get customer feedback!</p>
            </div>
          ) : (
            polls.map((poll) => (
              <div key={poll.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg text-gray-900 mb-4">{poll.question}</h3>
                <div className="space-y-3">
                  {poll.options.map((option, idx) => {
                    const votes = poll.results[option] || 0;
                    const percentage = poll.total_votes > 0 ? (votes / poll.total_votes) * 100 : 0;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleVoteInPoll(poll.id, option)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-blue-50 transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{option}</span>
                          <span className="text-sm font-bold text-gray-600">{votes} votes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
                  Total votes: {poll.total_votes}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerEngagementTools;
