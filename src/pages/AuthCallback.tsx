import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User successfully authenticated
        toast({
          title: "Welcome!",
          description: "You have been successfully signed in.",
        });
        setTimeout(() => {
          navigate("/feed");
        }, 1000);
      } else {
        // Check URL for errors
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get("error");
        const errorDescription = params.get("error_description");
        
        if (errorParam) {
          setError(errorDescription || errorParam);
          toast({
            title: "Authentication Error",
            description: errorDescription || errorParam,
            variant: "destructive",
          });
          
          // Redirect to auth page after 3 seconds
          setTimeout(() => {
            navigate("/auth");
          }, 3000);
        }
      }
    }
  }, [user, loading, navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 animate-spin">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {error ? "Authentication Failed" : "Completing Sign In"}
        </h1>
        
        {error ? (
          <div>
            <p className="text-muted-foreground mb-4">
              {error}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the login page...
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Please wait while we set up your account...
          </p>
        )}
      </div>
    </div>
  );
}
