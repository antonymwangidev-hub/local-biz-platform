import { useState } from "react";
import { Check, Copy, Eye, EyeOff, Shield, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeploymentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  publicUrl: string;
  googleOAuthId?: string;
  emailServiceKey?: string;
  stripePublishableKey?: string;
  environment: "development" | "staging" | "production";
}

export function ProductionDeploymentConfig() {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState(false);
  const [config, setConfig] = useState<DeploymentConfig>({
    supabaseUrl: process.env.VITE_SUPABASE_URL || "",
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || "",
    publicUrl: process.env.VITE_PUBLIC_URL || "",
    googleOAuthId: process.env.VITE_GOOGLE_OAUTH_ID || "",
    stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
    environment: "development",
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard ✓` });
  };

  const renderEnvVar = (label: string, key: keyof DeploymentConfig) => (
    <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-bold text-gray-700">{label}</label>
        <button
          onClick={() => copyToClipboard(config[key], label)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Copy to clipboard"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <div className="font-mono text-xs bg-white rounded p-3 border border-gray-200 break-all text-gray-600">
        {showSecrets ? config[key] : key.includes("Key") || key.includes("password") ? "••••••••••••••" : config[key]}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Production Deployment</h2>
        <p className="text-gray-600 mt-2">
          Configure environment variables and deployment settings for production deployment.
        </p>
      </div>

      {/* Environment Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">1. Select Environment</h3>
        <div className="flex gap-4">
          {(["development", "staging", "production"] as const).map((env) => (
            <button
              key={env}
              onClick={() => setConfig({ ...config, environment: env })}
              className={`px-6 py-3 rounded-lg font-bold capitalize transition-all ${
                config.environment === env
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {env === "production" && "🚀 "}
              {env === "staging" && "🧪 "}
              {env === "development" && "🛠️ "}
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Supabase Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          2. Supabase Configuration
        </h3>
        <div className="space-y-4">
          {renderEnvVar("Supabase URL", "supabaseUrl")}
          {renderEnvVar("Supabase Anon Key", "supabaseAnonKey")}

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ How to find:</strong> Go to Supabase Project Settings → API → Copy URL and anon key
            </p>
          </div>
        </div>
      </div>

      {/* OAuth Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-green-600" />
          3. OAuth & Third-Party Services
        </h3>
        <div className="space-y-4">
          {renderEnvVar("Google OAuth Client ID", "googleOAuthId")}

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-2">
            <p className="text-sm text-blue-800 font-bold">ℹ️ How to configure:</p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>• Go to Google Cloud Console → APIs & Services</li>
              <li>• Create OAuth 2.0 credentials (Web application)</li>
              <li>• Add authorized redirect URIs (your domain + /auth/callback)</li>
              <li>• Copy Client ID to environment variable</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Application URLs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">4. Application URLs</h3>
        <div className="space-y-4">
          {renderEnvVar("Public URL", "publicUrl")}

          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> Set to your production domain (e.g., https://localbiz.app)
            </p>
          </div>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">5. Environment File (.env.production)</h3>
          <button
            onClick={() => setShowSecrets(!showSecrets)}
            className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors"
          >
            {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSecrets ? "Hide" : "Show"} Values
          </button>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 font-mono text-xs text-gray-100 overflow-x-auto">
          <pre>{`# Supabase
VITE_SUPABASE_URL=${config.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${showSecrets ? config.supabaseAnonKey : "••••••••••••••"}

# Application
VITE_PUBLIC_URL=${config.publicUrl}
VITE_ENVIRONMENT=${config.environment}

# OAuth
VITE_GOOGLE_OAUTH_ID=${showSecrets ? config.googleOAuthId : "••••••••••••••"}

# Email Service (Optional)
VITE_EMAIL_SERVICE_KEY=${showSecrets ? config.emailServiceKey : "••••••••••••••"}

# Stripe (Optional - for future payments)
VITE_STRIPE_PUBLISHABLE_KEY=${showSecrets ? config.stripePublishableKey : "••••••••••••••"}
`}</pre>
        </div>

        <button
          onClick={() => {
            const envContent = `# Supabase
VITE_SUPABASE_URL=${config.supabaseUrl}
VITE_SUPABASE_ANON_KEY=${config.supabaseAnonKey}

# Application
VITE_PUBLIC_URL=${config.publicUrl}
VITE_ENVIRONMENT=${config.environment}

# OAuth
VITE_GOOGLE_OAUTH_ID=${config.googleOAuthId}

# Email Service (Optional)
VITE_EMAIL_SERVICE_KEY=${config.emailServiceKey}

# Stripe (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=${config.stripePublishableKey}
`;
            navigator.clipboard.writeText(envContent);
            toast({ title: "Environment file content copied ✓" });
          }}
          className="mt-4 w-full py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy All to Clipboard
        </button>
      </div>

      {/* Deployment Checklist */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">6. Pre-Deployment Checklist</h3>
        <div className="space-y-3">
          {[
            "All environment variables configured",
            "Database migrations applied to production",
            "RLS policies verified and enabled",
            "Email verification enabled",
            "Google OAuth redirects configured",
            "CORS settings updated for production domain",
            "SSL certificate installed",
            "Backups configured",
            "Monitoring and logging enabled",
            "Rate limiting configured",
            "Admin user created and verified",
            "Test all core features end-to-end",
          ].map((item, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
              />
              <span className="text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Deployment Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">7. Deployment Instructions</h3>
        <div className="space-y-6">
          {[
            {
              step: "Build Application",
              commands: ["npm run build", "# Creates optimized production build in dist/"],
            },
            {
              step: "Set Environment Variables",
              commands: [
                "# On Vercel/Netlify/Railway: Add via dashboard",
                "# Or use: cp .env.production .env.local",
              ],
            },
            {
              step: "Deploy to Hosting",
              commands: [
                "# Vercel: vercel deploy --prod",
                "# Netlify: netlify deploy --prod",
                "# Railway: railway deploy",
              ],
            },
            {
              step: "Run Database Migrations",
              commands: [
                "# In Supabase Dashboard: SQL Editor",
                "# Or: supabase db push --linked",
              ],
            },
            {
              step: "Verify Production",
              commands: [
                "# Check all pages load correctly",
                "# Test authentication flow",
                "# Verify real-time features work",
                "# Monitor error logs in Supabase",
              ],
            },
          ].map((section, idx) => (
            <div key={idx}>
              <p className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                {section.step}
              </p>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-100 ml-7">
                {section.commands.map((cmd, cmdIdx) => (
                  <div key={cmdIdx} className="text-gray-400">
                    {cmd}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Best Practices */}
      <div className="bg-green-50 rounded-lg border border-green-200 p-6">
        <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <Check className="h-5 w-5" />
          Production Best Practices
        </h3>
        <ul className="space-y-2 text-green-800">
          <li>✓ Enable HTTPS and HTTP/2</li>
          <li>✓ Set up CDN for static assets</li>
          <li>✓ Configure auto-scaling and load balancing</li>
          <li>✓ Set up monitoring, alerting, and analytics</li>
          <li>✓ Enable database backups with point-in-time recovery</li>
          <li>✓ Configure CORS for your domain only</li>
          <li>✓ Use environment-specific keys and secrets</li>
          <li>✓ Implement rate limiting and DDoS protection</li>
          <li>✓ Set up error tracking (Sentry, LogRocket)</li>
          <li>✓ Regular security audits and penetration testing</li>
        </ul>
      </div>

      {/* Support */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Need Help?
        </h3>
        <p className="text-blue-800 mb-3">Resources for deployment:</p>
        <ul className="space-y-2 text-blue-800">
          <li>
            • Supabase Docs:{" "}
            <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="underline">
              https://supabase.com/docs
            </a>
          </li>
          <li>
            • Vercel Deployment:{" "}
            <a href="https://vercel.com/docs" target="_blank" rel="noopener noreferrer" className="underline">
              https://vercel.com/docs
            </a>
          </li>
          <li>
            • Railway Docs:{" "}
            <a href="https://railway.app/docs" target="_blank" rel="noopener noreferrer" className="underline">
              https://railway.app/docs
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default ProductionDeploymentConfig;
