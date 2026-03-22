import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Active Businesses", value: "500+", icon: TrendingUp },
  { label: "Community Members", value: "12K+", icon: Users },
  { label: "Posts This Week", value: "340", icon: Sparkles },
];

const HeroSection = () => (
  <section className="relative overflow-hidden gradient-hero py-20 md:py-28">
    <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-foreground/5" />
    <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary-foreground/5" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-3xl" />

    <div className="container relative mx-auto px-4">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm"
        >
          <Sparkles size={14} className="text-secondary" />
          The social platform for local business
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground md:text-6xl"
        >
          Where Local Businesses{" "}
          <span className="text-secondary">Connect & Grow</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg text-primary-foreground/75 md:text-xl"
        >
          Post updates, host events, collaborate with neighbors, and engage your
          community — all from one powerful platform.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button asChild variant="warm" size="lg" className="gap-2 px-8">
            <Link to="/feed">
              <Sparkles size={18} />
              Explore the Feed
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link to="/auth">
              Get Started Free
              <ArrowRight size={16} />
            </Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-primary-foreground/10 px-4 py-3 backdrop-blur-sm">
              <s.icon size={18} className="mx-auto mb-1 text-secondary" />
              <div className="text-xl font-bold text-primary-foreground">{s.value}</div>
              <div className="text-[11px] text-primary-foreground/60">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
