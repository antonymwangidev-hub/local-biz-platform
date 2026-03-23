import { useState, useEffect } from "react";
import { MapPin, Search, Layers, Navigation, AlertCircle, Star, MessageCircle, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Business {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviews_count: number;
  distance?: number;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

interface BusinessWithContent extends Business {
  posts_count: number;
  events_count: number;
  latest_post?: string;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export function ARLocalDiscovery() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"ar" | "map">("map");
  const [businesses, setBusinesses] = useState<BusinessWithContent[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessWithContent[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithContent | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [radiusFilter, setRadiusFilter] = useState(5); // km
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [businesses, searchQuery, categoryFilter, radiusFilter, userLocation]);

  const initializeMap = async () => {
    try {
      setLoading(true);

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setUserLocation(coords);
          },
          () => {
            // Default to downtown if location not available
            setUserLocation({
              latitude: 40.7128,
              longitude: -74.006,
            });
          }
        );
      }

      // Fetch businesses
      const { data, error } = await supabase.from("businesses").select("*");

      if (error) throw error;

      // Fetch additional metrics for each business
      const businessesWithContent = await Promise.all(
        (data || []).map(async (business: any) => {
          const { count: postsCount } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id);

          const { count: eventsCount } = await supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .eq("business_id", business.id);

          const { data: latestPost } = await supabase
            .from("posts")
            .select("content")
            .eq("business_id", business.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          return {
            ...business,
            posts_count: postsCount || 0,
            events_count: eventsCount || 0,
            latest_post: latestPost?.content,
            latitude: business.latitude || 40.7128 + Math.random() * 0.01,
            longitude: business.longitude || -74.006 + Math.random() * 0.01,
          };
        })
      );

      setBusinesses(businessesWithContent);

      // Extract unique categories
      const uniqueCategories = [...new Set(businessesWithContent.map((b) => b.category))];
      setCategories(uniqueCategories);
    } catch (err: any) {
      console.error("Error loading map data:", err);
      toast({
        title: "Error loading businesses",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    let filtered = businesses;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((b) => b.category === categoryFilter);
    }

    // Distance filter (if location available)
    if (userLocation) {
      filtered = filtered.map((b) => ({
        ...b,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.latitude || 0,
          b.longitude || 0
        ),
      }));

      filtered = filtered.filter((b) => (b.distance || 0) <= radiusFilter);
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredBusinesses(filtered);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <MapPin className="h-16 w-16 text-blue-600 mx-auto" />
          </div>
          <p className="text-lg font-bold text-gray-900">Loading AR Local Discovery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            AR Local Discovery
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                viewMode === "map"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Layers className="h-4 w-4" />
              Map View
            </button>
            <button
              onClick={() => setViewMode("ar")}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
                viewMode === "ar"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Navigation className="h-4 w-4" />
              AR View
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Distance Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-gray-700">Radius:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={radiusFilter}
                onChange={(e) => setRadiusFilter(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm font-bold text-gray-700">{radiusFilter} km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map/AR Area */}
        <div className="flex-1 bg-gray-200 relative">
          {viewMode === "map" ? (
            // Map View
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 relative overflow-hidden">
              {/* Simulated Map with Business Markers */}
              <svg className="w-full h-full" viewBox="0 0 1000 800">
                {/* Grid Background */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#d1d5db" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="1000" height="800" fill="url(#grid)" />

                {/* User Location */}
                {userLocation && (
                  <>
                    <circle
                      cx={userLocation.longitude * 100 + 500}
                      cy={userLocation.latitude * 100 + 400}
                      r="15"
                      fill="#3b82f6"
                      opacity="0.8"
                    />
                    <circle
                      cx={userLocation.longitude * 100 + 500}
                      cy={userLocation.latitude * 100 + 400}
                      r="25"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                  </>
                )}

                {/* Business Markers */}
                {filteredBusinesses.map((business, idx) => (
                  <g
                    key={business.id}
                    onClick={() => setSelectedBusiness(business)}
                    className="cursor-pointer hover:opacity-100 opacity-75 transition-opacity"
                  >
                    {/* Marker Pin */}
                    <circle
                      cx={(business.longitude || 0) * 100 + 500}
                      cy={(business.latitude || 0) * 100 + 400}
                      r="12"
                      fill={
                        business.category === "Technology"
                          ? "#8b5cf6"
                          : business.category === "Food & Beverage"
                          ? "#f59e0b"
                          : "#10b981"
                      }
                    />

                    {/* Rating Badge */}
                    <circle
                      cx={(business.longitude || 0) * 100 + 515}
                      cy={(business.latitude || 0) * 100 + 385}
                      r="8"
                      fill="white"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                    />
                    <text
                      x={(business.longitude || 0) * 100 + 515}
                      y={(business.latitude || 0) * 100 + 390}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#f59e0b"
                    >
                      {business.rating}
                    </text>

                    {/* Tooltip */}
                    <title>{business.name}</title>
                  </g>
                ))}
              </svg>

              {/* Map Controls */}
              <div className="absolute bottom-4 left-4 space-y-2">
                <button className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow">
                  <span className="text-lg">🔍+</span>
                </button>
                <button className="bg-white rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow">
                  <span className="text-lg">🔍−</span>
                </button>
              </div>

              {/* AR Toggle Hint */}
              <div className="absolute bottom-4 right-4 bg-purple-600 text-white rounded-lg p-4 shadow-lg">
                <p className="text-sm font-bold">💜 Try AR View!</p>
                <p className="text-xs">See businesses in augmented reality</p>
              </div>
            </div>
          ) : (
            // AR View Simulation
            <div className="w-full h-full bg-gradient-to-b from-blue-300 to-blue-100 relative overflow-hidden flex items-center justify-center">
              <video autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />

              {/* AR Business Overlays */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white drop-shadow-lg z-10">
                  <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">AR View Demo</h3>
                  <p className="text-sm mb-4">
                    In production, this would use WebGL/Three.js for immersive AR
                  </p>
                  <p className="text-xs opacity-75">
                    Point your device at nearby businesses to see info overlays
                  </p>
                </div>
              </div>

              {/* Floating Business Cards in AR */}
              {filteredBusinesses.slice(0, 3).map((business, idx) => (
                <div
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className={`absolute transform transition-all cursor-pointer ${
                    idx === 0
                      ? "top-20 left-10 scale-100"
                      : idx === 1
                      ? "top-1/3 right-20 scale-75 opacity-80"
                      : "bottom-20 left-1/3 scale-50 opacity-60"
                  }`}
                >
                  <div className="bg-white rounded-lg shadow-2xl p-4 max-w-xs border-2 border-purple-600">
                    <p className="font-bold text-gray-900">{business.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold text-gray-700">
                        {business.rating} ({business.reviews_count})
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{business.category}</p>
                    {business.distance && (
                      <p className="text-xs text-blue-600 font-bold mt-1">
                        📍 {business.distance.toFixed(1)} km away
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Business List Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-600">{filteredBusinesses.length} businesses nearby</p>
          </div>

          <div className="space-y-2 p-4">
            {filteredBusinesses.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No businesses found</p>
              </div>
            ) : (
              filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all transform hover:scale-105 ${
                    selectedBusiness?.id === business.id
                      ? "bg-blue-50 border-primary"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{business.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">{business.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs font-bold text-gray-700">{business.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{business.posts_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-600">{business.events_count}</span>
                        </div>
                      </div>
                    </div>
                    {business.distance && (
                      <div className="text-right text-xs font-bold text-blue-600">
                        {business.distance.toFixed(1)} km
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Business Details Panel */}
      {selectedBusiness && (
        <div className="fixed bottom-0 right-0 w-96 bg-white rounded-t-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">{selectedBusiness.name}</h3>
            <button
              onClick={() => setSelectedBusiness(null)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3">
            {selectedBusiness.image_url && (
              <img
                src={selectedBusiness.image_url}
                alt={selectedBusiness.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{selectedBusiness.rating}</p>
                <p className="text-xs text-gray-600">{selectedBusiness.reviews_count} reviews</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-600">{selectedBusiness.distance?.toFixed(1)} km</p>
                <p className="text-xs text-gray-600">Away</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-bold mb-1">Location</p>
              <p className="text-sm font-semibold text-gray-900">{selectedBusiness.location}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors text-sm">
                View Profile
              </button>
              <button className="py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors text-sm">
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ARLocalDiscovery;
