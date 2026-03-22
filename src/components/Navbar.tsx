import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, BarChart3, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/feed", label: "Feed" },
    { to: "/events", label: "Events" },
    { to: "/directory", label: "Directory" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <span className="text-lg font-bold text-primary-foreground">L</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            LocalBiz <span className="text-secondary text-sm font-semibold">2.0</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors" title="Dashboard">
                <BarChart3 size={18} />
              </Link>
              {role === "admin" && (
                <Link to="/admin" className="text-muted-foreground hover:text-destructive transition-colors" title="Admin">
                  <Shield size={18} />
                </Link>
              )}
              <span className="ml-1 text-sm font-medium text-foreground">
                {profile?.full_name || user.email?.split("@")[0]}
              </span>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <Button asChild variant="hero" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                Dashboard
              </Link>
              {role === "admin" && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                  Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={handleSignOut}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button asChild variant="hero" size="sm" className="mt-3 w-full">
              <Link to="/auth" onClick={() => setIsOpen(false)}>Sign In</Link>
            </Button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
