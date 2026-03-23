import { useState, useEffect } from "react";
import { MessageCircle, MapPin, Tag, Heart, AlertCircle, Plus, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface CollaborationRequest {
  id: string;
  requesting_business_id: string;
  collaboration_type: "partnership" | "cross-promotion" | "event" | "mentorship";
  title: string;
  description: string;
  status: "open" | "interested" | "matched" | "in-progress" | "completed";
  interested_businesses: Array<{ id: string; name: string; category: string }>;
  matched_business_id: string | null;
  budget_range: string | null;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  requester_name?: string;
  requester_logo?: string;
  requester_category?: string;
}

interface CollaborationBoardProps {
  businessId?: string;
  showMyRequests?: boolean;
  className?: string;
}

const COLLAB_TYPES = {
  partnership: { label: "Partnership", icon: "🤝", color: "from-blue-400 to-blue-600" },
  "cross-promotion": { label: "Cross-Promotion", icon: "📢", color: "from-purple-400 to-purple-600" },
  event: { label: "Event", icon: "🎉", color: "from-pink-400 to-pink-600" },
  mentorship: { label: "Mentorship", icon: "🎓", color: "from-green-400 to-green-600" },
};

export function CollaborationBoard({
  businessId,
  showMyRequests = false,
  className = "",
}: CollaborationBoardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("open");
  const [showInterested, setShowInterested] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRequests();
  }, [selectedType, selectedStatus, showMyRequests, businessId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let query = supabase.from("collaborations").select("*");

      if (showMyRequests && businessId) {
        query = query.eq("requesting_business_id", businessId);
      }

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      if (selectedType !== "all") {
        query = query.eq("collaboration_type", selectedType);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch requester business info for each collaboration
      const requestsWithInfo = await Promise.all(
        (data || []).map(async (collab: any) => {
          const { data: businessData } = await supabase
            .from("businesses")
            .select("name, logo_url, category")
            .eq("id", collab.requesting_business_id)
            .single();

          return {
            ...collab,
            requester_name: businessData?.name,
            requester_logo: businessData?.logo_url,
            requester_category: businessData?.category,
          };
        })
      );

      setRequests(requestsWithInfo);
    } catch (err: any) {
      console.error("Error fetching collaborations:", err);
      toast({
        title: "Error loading collaborations",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInterested = async (collabId: string) => {
    if (!user || !businessId) {
      toast({ title: "Please sign in and have a business", variant: "destructive" });
      return;
    }

    try {
      // Add current business to interested list
      const collaboration = requests.find((r) => r.id === collabId);
      if (!collaboration) return;

      const updatedInterested = [
        ...(collaboration.interested_businesses || []),
        { id: businessId, name: user.email || "Anonymous", category: "Unknown" },
      ];

      const { error } = await supabase
        .from("collaborations")
        .update({ interested_businesses: updatedInterested })
        .eq("id", collabId);

      if (error) throw error;

      toast({ title: "Interest registered! Waiting for matching..." });
      setShowInterested({ ...showInterested, [collabId]: true });
      fetchRequests();
    } catch (err: any) {
      toast({
        title: "Error registering interest",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getMatchedPercentage = (interestedCount: number) => {
    return Math.min(100, interestedCount * 25);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <MessageCircle className="h-5 w-5" />
          <span>Loading collaborations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collaboration Hub</h2>
          <p className="text-gray-600 mt-1">Find partners and grow together</p>
        </div>
        {!showMyRequests && (
          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="h-5 w-5" />
            Post Request
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {/* Type Filter */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
              selectedType === "all" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Types
          </button>
          {Object.entries(COLLAB_TYPES).map(([type, { label, icon }]) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all whitespace-nowrap ${
                selectedType === type ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg ml-auto">
          {["open", "interested", "matched", "in-progress"].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1 rounded text-sm font-semibold transition-all capitalize ${
                selectedStatus === status ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Collaborations List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No collaborations found</h3>
          <p className="text-gray-600">
            {showMyRequests ? "You haven't posted any requests yet" : "Be the first to post a collaboration request!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const typeConfig = COLLAB_TYPES[request.collaboration_type as keyof typeof COLLAB_TYPES];
            const matchPercentage = getMatchedPercentage(request.interested_businesses?.length || 0);

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {request.requester_logo && (
                      <img
                        src={request.requester_logo}
                        alt={request.requester_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${typeConfig.color}`}
                        >
                          {typeConfig.icon} {typeConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        by <span className="font-semibold">{request.requester_name}</span>
                      </p>
                    </div>
                  </div>
                  {request.status === "matched" && (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      ✓ Matched
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-700 mb-4">{request.description}</p>

                {/* Meta Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                  {request.requester_category && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>{request.requester_category}</span>
                    </div>
                  )}
                  {request.budget_range && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">💰</span>
                      <span>{request.budget_range}</span>
                    </div>
                  )}
                  {request.deadline && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-lg">📅</span>
                      <span>{new Date(request.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="h-4 w-4" />
                    <span>{request.interested_businesses?.length || 0} interested</span>
                  </div>
                </div>

                {/* Match Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">Interest Progress</p>
                    <p className="text-xs font-bold text-primary">{matchPercentage.toFixed(0)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${matchPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Interested Businesses Preview */}
                {request.interested_businesses && request.interested_businesses.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      Interested Businesses ({request.interested_businesses.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {request.interested_businesses.slice(0, 5).map((business) => (
                        <span
                          key={business.id}
                          className="px-2 py-1 bg-white rounded-full text-xs font-semibold text-blue-700 border border-blue-200"
                        >
                          {business.name}
                        </span>
                      ))}
                      {request.interested_businesses.length > 5 && (
                        <span className="px-2 py-1 bg-blue-100 rounded-full text-xs font-semibold text-blue-700">
                          +{request.interested_businesses.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {!showMyRequests && (
                  <button
                    onClick={() => handleInterested(request.id)}
                    disabled={showInterested[request.id] || request.status === "matched"}
                    className={`w-full py-2 rounded-lg font-bold transition-all ${
                      showInterested[request.id] || request.status === "matched"
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:shadow-lg"
                    }`}
                  >
                    {showInterested[request.id] ? "✓ Interest Registered" : "I'm Interested"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CollaborationBoard;
