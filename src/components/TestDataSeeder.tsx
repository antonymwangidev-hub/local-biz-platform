import { useState } from "react";
import { Loader, CheckCircle, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SeedProgress {
  status: "idle" | "seeding" | "complete" | "error";
  message: string;
  progress: number;
  totalSteps: number;
  currentStep: number;
}

export function TestDataSeeder() {
  const { toast } = useToast();
  const [seedProgress, setSeedProgress] = useState<SeedProgress>({
    status: "idle",
    message: "Ready to seed demo data",
    progress: 0,
    totalSteps: 8,
    currentStep: 0,
  });

  const updateProgress = (step: number, message: string) => {
    const progress = (step / 8) * 100;
    setSeedProgress({
      status: "seeding",
      message,
      progress,
      totalSteps: 8,
      currentStep: step,
    });
  };

  const sampleBusinesses = [
    {
      name: "Tech Innovations Hub",
      description: "Leading software development and digital solutions company",
      category: "Technology",
      location: "Downtown Tech Park",
      phone: "+1-234-567-8901",
      email: "contact@techinnovations.local",
      website: "https://techinnovations.local",
      rating: 4.8,
      reviews_count: 145,
      image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    },
    {
      name: "Urban Coffee Roasters",
      description: "Artisan coffee shop with locally sourced beans",
      category: "Food & Beverage",
      location: "Main Street Plaza",
      phone: "+1-234-567-8902",
      email: "hello@urbancoffee.local",
      website: "https://urbancoffee.local",
      rating: 4.7,
      reviews_count: 298,
      image_url: "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400&h=300&fit=crop",
    },
    {
      name: "Wellness & Fitness Center",
      description: "State-of-the-art gym with personal training programs",
      category: "Health & Fitness",
      location: "Fitness District",
      phone: "+1-234-567-8903",
      email: "info@wellnesscenter.local",
      website: "https://wellnesscenter.local",
      rating: 4.6,
      reviews_count: 187,
      image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
    },
    {
      name: "Creative Design Studio",
      description: "Full-service graphic and web design agency",
      category: "Design & Creative",
      location: "Creative Quarter",
      phone: "+1-234-567-8904",
      email: "studio@creativedesign.local",
      website: "https://creativedesign.local",
      rating: 4.9,
      reviews_count: 112,
      image_url: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    },
    {
      name: "Local Bakery Co.",
      description: "Fresh baked goods made daily with premium ingredients",
      category: "Food & Beverage",
      location: "Historic District",
      phone: "+1-234-567-8905",
      email: "bake@localbakery.local",
      website: "https://localbakery.local",
      rating: 4.5,
      reviews_count: 256,
      image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
    },
    {
      name: "Smart Home Solutions",
      description: "Home automation and IoT system installation",
      category: "Technology",
      location: "Tech Park West",
      phone: "+1-234-567-8906",
      email: "sales@smarthomesolutions.local",
      website: "https://smarthomesolutions.local",
      rating: 4.7,
      reviews_count: 89,
      image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    },
    {
      name: "Eco-Friendly Boutique",
      description: "Sustainable fashion and eco-conscious products",
      category: "Retail",
      location: "Green Street",
      phone: "+1-234-567-8907",
      email: "shop@ecoboutique.local",
      website: "https://ecoboutique.local",
      rating: 4.4,
      reviews_count: 167,
      image_url: "https://images.unsplash.com/photo-1441986300352-7e3dee05a7c4?w=400&h=300&fit=crop",
    },
    {
      name: "Professional Consulting Group",
      description: "Business strategy and management consulting services",
      category: "Business Services",
      location: "Corporate District",
      phone: "+1-234-567-8908",
      email: "consult@proconsulting.local",
      website: "https://proconsulting.local",
      rating: 4.8,
      reviews_count: 73,
      image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    },
    {
      name: "Yoga & Meditation Studio",
      description: "Holistic wellness with yoga, meditation, and wellness classes",
      category: "Health & Fitness",
      location: "Wellness Lane",
      phone: "+1-234-567-8909",
      email: "zen@yogastudio.local",
      website: "https://yogastudio.local",
      rating: 4.9,
      reviews_count: 203,
      image_url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
    },
    {
      name: "Digital Marketing Pro",
      description: "SEO, social media, and content marketing services",
      category: "Marketing & Advertising",
      location: "Marketing Hub",
      phone: "+1-234-567-8910",
      email: "team@digitalmarketingpro.local",
      website: "https://digitalmarketingpro.local",
      rating: 4.6,
      reviews_count: 141,
      image_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    },
  ];

  const samplePosts = [
    "🎉 Just launched our new product line! Check it out and let us know what you think!",
    "Thank you to everyone who attended our workshop yesterday. Great energy and amazing questions!",
    "Special offer this weekend: 30% off all items. Use code LOCALBIZ30 at checkout.",
    "We're hiring! Looking for talented individuals to join our team. DM for details.",
    "Shoutout to our amazing customers for the wonderful reviews. You make what we do worthwhile!",
    "New collaboration announcement coming soon! Stay tuned 📢",
    "Did you know? Our business is committed to sustainability. Learn more about our eco-friendly practices.",
    "Behind the scenes look at our production process. Quality is everything to us! 🎬",
    "Community event next month! Join us for networking and fun activities.",
    "Testimonial from a satisfied customer: 'Best service ever! Highly recommend!' ⭐⭐⭐⭐⭐",
  ];

  const seedTestData = async () => {
    try {
      setSeedProgress({
        status: "seeding",
        message: "Starting data seeding...",
        progress: 0,
        totalSteps: 8,
        currentStep: 0,
      });

      // Step 1: Get current user
      updateProgress(1, "Authenticating user...");
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      if (!userId) {
        throw new Error("User not authenticated. Please log in first.");
      }

      // Step 2: Create businesses
      updateProgress(2, "Creating sample businesses...");
      const { data: businesses, error: businessError } = await supabase
        .from("businesses")
        .insert(
          sampleBusinesses.map((b) => ({
            owner_id: userId,
            ...b,
          }))
        )
        .select();

      if (businessError) throw businessError;

      // Step 3: Create posts
      updateProgress(3, "Creating sample posts...");
      if (businesses && businesses.length > 0) {
        const postsToInsert = samplePosts.map((content, idx) => ({
          business_id: businesses[idx % businesses.length].id,
          content,
          post_type: ["update", "announcement", "story"][idx % 3],
          status: "published",
        }));

        const { error: postError } = await supabase.from("posts").insert(postsToInsert);
        if (postError) throw postError;
      }

      // Step 4: Create analytics data
      updateProgress(4, "Creating analytics data...");
      if (businesses && businesses.length > 0) {
        const analyticsToInsert = businesses.map((b) => ({
          business_id: b.id,
          views: Math.floor(Math.random() * 5000) + 100,
          engagement_rate: (Math.random() * 15 + 2).toFixed(2),
          bookings: Math.floor(Math.random() * 500) + 20,
          avg_rating: parseFloat((Math.random() * 2 + 3.5).toFixed(1)),
          period: "monthly",
        }));

        const { error: analyticsError } = await supabase.from("business_analytics").insert(analyticsToInsert);
        if (analyticsError) throw analyticsError;
      }

      // Step 5: Create events
      updateProgress(5, "Creating sample events...");
      const eventNames = [
        "Networking Breakfast",
        "Product Launch Party",
        "Community Workshop",
        "Annual Charity Gala",
        "Business Expo",
      ];
      if (businesses && businesses.length > 0) {
        const eventsToInsert = eventNames.map((name, idx) => ({
          business_id: businesses[idx % businesses.length].id,
          title: name,
          description: `Join us for ${name.toLowerCase()}! Limited spots available.`,
          event_date: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: `Venue ${idx + 1}`,
          max_capacity: Math.floor(Math.random() * 200) + 50,
          current_rsvp: Math.floor(Math.random() * 100),
        }));

        const { error: eventError } = await supabase.from("events").insert(eventsToInsert);
        if (eventError) throw eventError;
      }

      // Step 6: Create business groups
      updateProgress(6, "Creating community groups...");
      const groupNames = [
        "Tech Entrepreneurs",
        "Local Business Leaders",
        "Green Business Initiative",
        "Marketing & Growth",
        "Women in Business",
      ];
      const { data: groups, error: groupError } = await supabase
        .from("business_groups")
        .insert(
          groupNames.map((name, idx) => ({
            name,
            description: `Community group for ${name.toLowerCase()} professionals`,
            category: ["technology", "business", "sustainability", "marketing", "leadership"][idx],
            member_count: Math.floor(Math.random() * 100) + 20,
            image_url: sampleBusinesses[idx].image_url,
          }))
        )
        .select();

      if (groupError) throw groupError;

      // Step 7: Add members to groups
      updateProgress(7, "Adding group members...");
      if (businesses && businesses.length > 0 && groups && groups.length > 0) {
        const membersToInsert = [];
        for (let i = 0; i < groups.length; i++) {
          for (let j = 0; j < 3; j++) {
            membersToInsert.push({
              group_id: groups[i].id,
              business_id: businesses[(i + j) % businesses.length].id,
              joined_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            });
          }
        }
        const { error: memberError } = await supabase.from("group_members").insert(membersToInsert);
        if (memberError) throw memberError;
      }

      // Step 8: Create learning modules
      updateProgress(8, "Creating learning content...");
      const modules = [
        {
          category: "marketing",
          title: "Digital Marketing Fundamentals",
          description: "Learn the basics of online marketing",
          difficulty: "beginner",
        },
        {
          category: "operations",
          title: "Operational Excellence",
          description: "Optimize your business operations",
          difficulty: "intermediate",
        },
        {
          category: "growth",
          title: "Business Scaling Strategies",
          description: "Scale your business effectively",
          difficulty: "advanced",
        },
      ];

      const { error: moduleError } = await supabase.from("learning_modules").insert(modules);
      if (moduleError) throw moduleError;

      setSeedProgress({
        status: "complete",
        message: `✓ Successfully seeded demo data! Created ${sampleBusinesses.length} businesses and sample content.`,
        progress: 100,
        totalSteps: 8,
        currentStep: 8,
      });

      toast({
        title: "Demo data seeded successfully!",
        description: `Created ${sampleBusinesses.length} businesses with posts, events, and learning modules.`,
      });
    } catch (err: any) {
      console.error("Error seeding data:", err);
      setSeedProgress({
        status: "error",
        message: `Error: ${err.message}`,
        progress: 0,
        totalSteps: 8,
        currentStep: 0,
      });

      toast({
        title: "Error seeding data",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const clearTestData = async () => {
    try {
      if (!window.confirm("⚠️ This will delete all test data. Continue?")) return;

      // Delete in order of foreign key dependencies
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      if (!userId) throw new Error("User not authenticated");

      // Get all businesses owned by this user
      const { data: businesses } = await supabase.from("businesses").select("id").eq("owner_id", userId);

      if (businesses && businesses.length > 0) {
        const businessIds = businesses.map((b) => b.id);

        // Delete related data
        await supabase.from("posts").delete().in("business_id", businessIds);
        await supabase.from("events").delete().in("business_id", businessIds);
        await supabase.from("group_members").delete().in("business_id", businessIds);
        await supabase.from("business_analytics").delete().in("business_id", businessIds);

        // Delete businesses
        await supabase.from("businesses").delete().in("id", businessIds);
      }

      setSeedProgress({
        status: "idle",
        message: "Test data cleared. Ready to seed new data.",
        progress: 0,
        totalSteps: 8,
        currentStep: 0,
      });

      toast({ title: "Test data cleared ✓" });
    } catch (err: any) {
      toast({
        title: "Error clearing data",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Demo Data Seeder</h2>
        <p className="text-gray-600 mb-6">
          Populate the platform with sample businesses, posts, events, and learning content for demonstration purposes.
        </p>

        {/* Status Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {seedProgress.status === "seeding" && <Loader className="h-6 w-6 text-blue-600 animate-spin" />}
            {seedProgress.status === "complete" && <CheckCircle className="h-6 w-6 text-green-600" />}
            {seedProgress.status === "error" && <AlertCircle className="h-6 w-6 text-red-600" />}
            {seedProgress.status === "idle" && <RefreshCw className="h-6 w-6 text-gray-600" />}

            <div>
              <p className="font-bold text-gray-900">{seedProgress.message}</p>
              {seedProgress.status === "seeding" && (
                <p className="text-sm text-gray-600">
                  Step {seedProgress.currentStep} of {seedProgress.totalSteps}
                </p>
              )}
            </div>
          </div>

          {seedProgress.status === "seeding" && (
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${seedProgress.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Businesses", count: 10 },
            { label: "Posts", count: "10+" },
            { label: "Events", count: "5+" },
            { label: "Groups", count: "5+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stat.count}</p>
              <p className="text-xs text-gray-600 font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={seedTestData}
            disabled={seedProgress.status === "seeding"}
            className="flex-1 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {seedProgress.status === "seeding" ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Seed Demo Data
              </>
            )}
          </button>

          <button
            onClick={clearTestData}
            disabled={seedProgress.status === "seeding"}
            className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="h-5 w-5" />
            Clear
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          💡 Tip: Use this to populate the platform with demo data for testing and presentations.
        </p>
      </div>
    </div>
  );
}

export default TestDataSeeder;
