import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { categories } from "@/data/sampleBusinesses";
import BusinessCard from "@/components/BusinessCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Directory = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .order("rating", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const matchesCategory = activeCategory === "All" || b.category === activeCategory;
      const matchesSearch =
        !search ||
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.short_description ?? "").toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, businesses]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="gradient-hero py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-5xl">
              Business Directory
            </h1>
            <p className="mt-3 text-primary-foreground/70">
              Find and connect with trusted local businesses
            </p>
            <div className="relative mx-auto mt-8 max-w-lg">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or keyword…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-full border-none bg-card pl-11 pr-4 text-card-foreground shadow-hero"
              />
            </div>
          </div>
        </section>

        <div className="border-b border-border bg-card">
          <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "gradient-hero text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <p className="mb-6 text-sm text-muted-foreground">
              {filtered.length} business{filtered.length !== 1 ? "es" : ""} found
            </p>
            {isLoading ? (
              <div className="py-20 text-center text-muted-foreground">Loading businesses…</div>
            ) : filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={{
                      ...business,
                      shortDescription: business.short_description ?? "",
                      reviewCount: business.review_count ?? 0,
                      rating: Number(business.rating) || 0,
                      image: business.image ?? "",
                      logo: business.logo ?? "",
                      address: business.address ?? "",
                      phone: business.phone ?? "",
                      email: business.email ?? "",
                      website: business.website ?? "",
                      hours: (business.hours as Record<string, string>) ?? {},
                      services: [],
                      reviews: [],
                      lat: business.lat ?? 0,
                      lng: business.lng ?? 0,
                      description: business.description ?? "",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg font-medium text-muted-foreground">No businesses found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Directory;
