import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-foreground text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
              <span className="text-lg font-bold text-primary-foreground">L</span>
            </div>
            <span className="font-display text-xl font-bold">
              LocalBiz <span className="text-secondary text-sm">2.0</span>
            </span>
          </div>
          <p className="text-sm opacity-70">
            The social platform for local businesses and their communities.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider opacity-50">
            Platform
          </h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/feed" className="hover:opacity-100 transition-opacity">Community Feed</Link></li>
            <li><Link to="/directory" className="hover:opacity-100 transition-opacity">Browse Businesses</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider opacity-50">
            Account
          </h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/auth" className="hover:opacity-100 transition-opacity">Sign In</Link></li>
            <li><Link to="/auth" className="hover:opacity-100 transition-opacity">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider opacity-50">
            Legal
          </h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
            <li><Link to="/" className="hover:opacity-100 transition-opacity">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-xs opacity-50">
        © {new Date().getFullYear()} LocalBiz Connect 2.0. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
