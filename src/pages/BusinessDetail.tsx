import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { sampleBusinesses } from "@/data/sampleBusinesses";
import StarRating from "@/components/StarRating";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const BusinessDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const business = sampleBusinesses.find((b) => b.slug === slug);

  if (!business) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Business Not Found
            </h1>
            <Link to="/directory" className="mt-4 inline-block text-primary hover:underline">
              ← Back to Directory
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-64 md:h-80">
          <img
            src={business.image}
            alt={business.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <div className="absolute bottom-6 left-0 right-0">
            <div className="container mx-auto px-4">
              <Link
                to="/directory"
                className="mb-3 inline-flex items-center gap-1 text-sm text-primary-foreground/80 hover:text-primary-foreground"
              >
                <ArrowLeft size={14} /> Back to Directory
              </Link>
              <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                {business.name}
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <StarRating rating={business.rating} />
                <span className="text-sm text-primary-foreground/80">
                  {business.rating} ({business.reviewCount} reviews)
                </span>
                <span className="rounded-full bg-primary-foreground/20 px-3 py-0.5 text-xs text-primary-foreground">
                  {business.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* About */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  About
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {business.description}
                </p>
              </section>

              {/* Services */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Services
                </h2>
                <div className="space-y-3">
                  {business.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground">
                          {service.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                        {service.duration > 0 && (
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} /> {service.duration} min
                          </span>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-lg font-bold text-foreground">
                          {service.price === 0
                            ? "Free"
                            : `$${service.price}`}
                        </span>
                        <div className="mt-1">
                          <Button size="sm" variant="hero">
                            Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reviews */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Reviews
                </h2>
                <div className="space-y-4">
                  {business.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-border bg-card p-5"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
                            {review.customerName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-card-foreground">
                              {review.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(review.date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size={14} />
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Contact Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">
                  Contact Info
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                    {business.address}
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Phone size={16} className="shrink-0 text-primary" />
                    {business.phone}
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Mail size={16} className="shrink-0 text-primary" />
                    {business.email}
                  </li>
                  <li className="flex items-center gap-3 text-muted-foreground">
                    <Globe size={16} className="shrink-0 text-primary" />
                    {business.website}
                  </li>
                </ul>
              </div>

              {/* Hours */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">
                  Business Hours
                </h3>
                <ul className="space-y-2 text-sm">
                  {days.map((day) => (
                    <li
                      key={day}
                      className="flex justify-between text-muted-foreground"
                    >
                      <span className="font-medium text-card-foreground">
                        {day}
                      </span>
                      <span>{business.hours[day]}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Map Placeholder */}
              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  title="Business location"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${business.lng - 0.01},${business.lat - 0.01},${business.lng + 0.01},${business.lat + 0.01}&layer=mapnik&marker=${business.lat},${business.lng}`}
                />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessDetail;
