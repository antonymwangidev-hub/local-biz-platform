import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Megaphone, CalendarCheck, Users, Award, BarChart3, MessageSquare } from "lucide-react";

const features = [
  {
    icon: Megaphone,
    title: "Social Feed",
    description: "Post promotions, updates, and events. Engage customers with likes and comments.",
  },
  {
    icon: CalendarCheck,
    title: "Events & RSVP",
    description: "Host workshops and events. Customers RSVP and get confirmations instantly.",
  },
  {
    icon: Users,
    title: "Collaborations",
    description: "Find partner businesses for cross-promotions and joint campaigns.",
  },
  {
    icon: Award,
    title: "Badges & Rewards",
    description: "Earn achievement badges for engagement. Climb the local business leaderboard.",
  },
  {
    icon: BarChart3,
    title: "Growth Insights",
    description: "Track views, bookings, and engagement with AI-powered suggestions.",
  },
  {
    icon: MessageSquare,
    title: "Community Groups",
    description: "Join micro-communities by industry. Share tips and best practices.",
  },
];

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
            Platform Features
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            More Than a Directory
          </h2>
          <p className="mt-4 text-muted-foreground">
            LocalBiz Connect 2.0 is a full social ecosystem for local businesses and their communities.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:gradient-hero group-hover:text-primary-foreground">
                <feature.icon size={24} />
              </div>
              <h3 className="mb-2 font-display text-lg font-bold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
