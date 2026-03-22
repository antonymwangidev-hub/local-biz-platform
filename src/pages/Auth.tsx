import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Store, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type Mode = "login" | "signup";
type Role = "customer" | "business";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/feed");
    return null;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({ title: "Signing in with Google..." });
    } catch (err: any) {
      toast({ 
        title: "Google sign-in failed", 
        description: err.message || "Please try again", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast({ title: "Welcome back!" });
        navigate("/feed");
      } else {
        await signUp(email, password, fullName, role);
        toast({
          title: "Account created successfully! 🎉",
          description: "Welcome to LocalBiz Connect! Redirecting to your feed...",
        });
        // Auto-redirect to feed after successful sign-up
        setTimeout(() => {
          navigate("/feed");
        }, 1500);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero relative overflow-hidden items-center justify-center">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary-foreground/5" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-foreground/5" />
        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
            <span className="text-3xl font-bold text-primary-foreground font-display">L</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-primary-foreground leading-tight">
            LocalBiz Connect <span className="text-secondary">2.0</span>
          </h1>
          <p className="mt-4 text-primary-foreground/70 text-lg">
            Your community's social hub for local businesses.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors lg:hidden">
            ← Back to home
          </Link>
          <h2 className="font-display text-3xl font-bold text-foreground">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {mode === "login" ? "Sign in to your account to continue" : "Join the local business community"}
          </p>

          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-all hover:border-primary/30 hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {mode === "signup" && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setRole("customer")}
                className={`flex items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                  role === "customer"
                    ? "border-primary bg-accent text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <User size={20} />
                <div className="text-left">
                  <div className="font-semibold text-card-foreground">Customer</div>
                  <div className="text-xs text-muted-foreground">Browse & book</div>
                </div>
              </button>
              <button
                onClick={() => setRole("business")}
                className={`flex items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                  role === "business"
                    ? "border-primary bg-accent text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <Store size={20} />
                <div className="text-left">
                  <div className="font-semibold text-card-foreground">Business</div>
                  <div className="text-xs text-muted-foreground">List & grow</div>
                </div>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Full name"
                  className="pl-10"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                className="pl-10"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full gap-2" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
