import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sampleBusinesses } from "@/data/sampleBusinesses";
import BusinessCard from "./BusinessCard";

const FeaturedBusinesses = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  const featured = sampleBusinesses.filter((b) => b.rating >= 4.7);

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
              Top Rated
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Featured Businesses
            </h2>
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}
        >
          {featured.map((business, i) => (
            <motion.div
              key={business.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="min-w-[300px] max-w-[320px] snap-start flex-shrink-0"
            >
              <BusinessCard business={business} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBusinesses;
