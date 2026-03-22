import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostCard from "./PostCard";
import { samplePosts } from "@/data/samplePosts";

const FeedPreview = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const previewPosts = samplePosts.slice(0, 3);

  return (
    <section ref={ref} className="bg-accent/30 py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
            Live Feed
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            See What's Happening Locally
          </h2>
          <p className="mt-4 text-muted-foreground">
            Businesses share promotions, updates, and events in real time.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-2xl gap-5">
          {previewPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Button asChild variant="hero" size="lg" className="gap-2">
            <Link to="/feed">
              View Full Feed
              <ArrowRight size={16} />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeedPreview;
