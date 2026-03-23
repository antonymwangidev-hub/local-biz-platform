import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Lock, Play, Award, Zap, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: "marketing" | "operations" | "customer-service" | "growth" | "technology";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration_minutes: number;
  lessons: Lesson[];
  is_completed?: boolean;
  progress_percentage?: number;
  completion_badge?: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url?: string;
  order: number;
  is_completed?: boolean;
}

interface LearningHubProps {
  businessId?: string;
  className?: string;
}

const CATEGORIES = {
  marketing: { label: "Marketing", icon: "📢", color: "from-pink-400 to-pink-600" },
  operations: { label: "Operations", icon: "⚙️", color: "from-gray-400 to-gray-600" },
  "customer-service": { label: "Customer Service", icon: "🎯", color: "from-blue-400 to-blue-600" },
  growth: { label: "Growth", icon: "📈", color: "from-green-400 to-green-600" },
  technology: { label: "Technology", icon: "💻", color: "from-purple-400 to-purple-600" },
};

const DIFFICULTIES = {
  beginner: { label: "Beginner", color: "bg-green-100 text-green-700" },
  intermediate: { label: "Intermediate", color: "bg-yellow-100 text-yellow-700" },
  advanced: { label: "Advanced", color: "bg-red-100 text-red-700" },
};

export function LearningHub({ businessId, className = "" }: LearningHubProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<LearningModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");

  useEffect(() => {
    fetchModules();
  }, [filter, difficulty]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      let query = supabase.from("learning_modules").select("*").order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("category", filter);
      }

      if (difficulty !== "all") {
        query = query.eq("difficulty", difficulty);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        (data || []).map(async (module: any) => {
          const { data: lessonsData } = await supabase
            .from("lessons")
            .select("*")
            .eq("module_id", module.id)
            .order("order", { ascending: true });

          return {
            ...module,
            lessons: lessonsData || [],
            progress_percentage: calculateProgress(lessonsData || []),
          };
        })
      );

      setModules(modulesWithLessons);
    } catch (err: any) {
      console.error("Error fetching modules:", err);
      toast({
        title: "Error loading modules",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (lessons: Lesson[]) => {
    if (lessons.length === 0) return 0;
    const completed = lessons.filter((l) => l.is_completed).length;
    return Math.round((completed / lessons.length) * 100);
  };

  const handleCompleteLesson = async (lesson: Lesson) => {
    if (!user) {
      toast({ title: "Please sign in to track progress", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from("user_lesson_progress")
        .insert({
          user_id: user.id,
          lesson_id: lesson.id,
          completed_at: new Date().toISOString(),
        });

      if (error && error.code !== "23505") throw error; // Ignore duplicate key error

      toast({ title: "Lesson completed! 🎉", description: "Great work!" });
      fetchModules();
    } catch (err: any) {
      console.error("Error marking lesson complete:", err);
    }
  };

  const handleCompleteModule = async (module: LearningModule) => {
    if (!user) {
      toast({ title: "Please sign in to earn badges", variant: "destructive" });
      return;
    }

    try {
      // Award completion badge
      const { error } = await supabase.from("user_badges").insert({
        user_id: user.id,
        badge_id: module.completion_badge || "",
      });

      if (error && error.code !== "23505") throw error;

      toast({
        title: "Module Completed! 🏆",
        description: "You earned a completion badge!",
      });
      fetchModules();
    } catch (err: any) {
      console.error("Error completing module:", err);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <BookOpen className="h-5 w-5" />
          <span>Loading learning modules...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Learning Hub</h2>
        <p className="text-gray-600 mt-1">Master skills and grow your business with expert-led modules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters & Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    filter === "all"
                      ? "bg-primary text-white font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Categories
                </button>
                {Object.entries(CATEGORIES).map(([key, { label, icon }]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      filter === key
                        ? "bg-primary text-white font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">Difficulty</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setDifficulty("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    difficulty === "all"
                      ? "bg-primary text-white font-bold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Levels
                </button>
                {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all capitalize ${
                      difficulty === key
                        ? "bg-primary text-white font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedModule ? (
            /* Module Details */
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedModule(null);
                  setSelectedLesson(null);
                }}
                className="text-primary font-semibold hover:underline"
              >
                ← Back to Modules
              </button>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {/* Module Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedModule.title}</h2>
                      <p className="text-gray-600">{selectedModule.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${DIFFICULTIES[selectedModule.difficulty as keyof typeof DIFFICULTIES]?.color || ""}`}>
                      {DIFFICULTIES[selectedModule.difficulty as keyof typeof DIFFICULTIES]?.label}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Duration</p>
                      <p className="text-lg font-bold text-gray-900">{selectedModule.duration_minutes} min</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Lessons</p>
                      <p className="text-lg font-bold text-gray-900">{selectedModule.lessons.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Progress</p>
                      <p className="text-lg font-bold text-primary">{selectedModule.progress_percentage || 0}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Course Progress</p>
                      <p className="text-sm font-bold text-gray-700">{selectedModule.progress_percentage || 0}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${selectedModule.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Lessons */}
                <div className="space-y-2 border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-900 mb-4">📚 Lessons</h3>
                  {selectedModule.lessons.map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedLesson?.id === lesson.id
                          ? "border-primary bg-blue-50"
                          : "border-gray-200 hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {lesson.is_completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">Lesson {idx + 1}: {lesson.title}</p>
                          <p className="text-xs text-gray-500">
                            {lesson.is_completed ? "Completed ✓" : "Not started"}
                          </p>
                        </div>
                        {lesson.video_url && <Play className="h-4 w-4 text-gray-400" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Complete Module Button */}
                {selectedModule.progress_percentage === 100 && (
                  <button
                    onClick={() => handleCompleteModule(selectedModule)}
                    className="mt-6 w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
                  >
                    <Award className="h-5 w-5" />
                    Earn Completion Badge
                  </button>
                )}
              </div>

              {/* Lesson Content */}
              {selectedLesson && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h3>
                    {selectedLesson.is_completed && <CheckCircle className="h-6 w-6 text-green-600" />}
                  </div>

                  {selectedLesson.video_url && (
                    <div className="mb-6 bg-black rounded-lg overflow-hidden">
                      <video
                        src={selectedLesson.video_url}
                        controls
                        className="w-full h-96 object-cover"
                      />
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none mb-6 text-gray-700">
                    {selectedLesson.content.split("\n").map((para, idx) => (
                      <p key={idx} className="mb-3">
                        {para}
                      </p>
                    ))}
                  </div>

                  <button
                    onClick={() => handleCompleteLesson(selectedLesson)}
                    disabled={selectedLesson.is_completed}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      selectedLesson.is_completed
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {selectedLesson.is_completed ? "✓ Lesson Completed" : "Mark as Completed"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Modules Grid */
            <div className="space-y-4">
              {modules.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No modules available</h3>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </div>
              ) : (
                modules.map((module) => {
                  const categoryConfig = CATEGORIES[module.category as keyof typeof CATEGORIES];
                  return (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-primary transition-all text-left"
                    >
                      <div className="flex gap-4">
                        <div className={`flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br ${categoryConfig?.color || ""} flex items-center justify-center text-3xl`}>
                          {categoryConfig?.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{module.title}</h3>
                          <p className="text-gray-600 text-sm mb-3">{module.description}</p>
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {module.duration_minutes} min
                            </span>
                            <span className="text-xs font-semibold text-gray-600">
                              {module.lessons.length} lessons
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${DIFFICULTIES[module.difficulty as keyof typeof DIFFICULTIES]?.color || ""}`}>
                              {DIFFICULTIES[module.difficulty as keyof typeof DIFFICULTIES]?.label}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${module.progress_percentage || 0}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{module.progress_percentage || 0}% complete</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LearningHub;
