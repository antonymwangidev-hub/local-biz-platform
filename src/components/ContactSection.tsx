import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ContactSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  return (
    <section ref={ref} className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-10 text-center"
          >
            <span className="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
              Get In Touch
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Have Questions?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Whether you're a business owner or a customer, we'd love to hear
              from you.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl border border-border bg-card p-8 shadow-card"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  Name
                </label>
                <Input placeholder="Your name" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                  Email
                </label>
                <Input type="email" placeholder="your@email.com" required />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-card-foreground">
                Message
              </label>
              <Textarea
                placeholder="How can we help you?"
                rows={5}
                required
              />
            </div>
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full gap-2"
              disabled={loading}
            >
              <Send size={18} />
              {loading ? "Sending…" : "Send Message"}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
