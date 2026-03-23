import { useState, useEffect } from "react";
import { Activity, AlertTriangle, Ban, Eye, Filter, Lock, Shield, TrendingDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface SecurityAlert {
  id: string;
  alert_type: "spam" | "bot" | "suspicious_activity" | "fraud" | "abuse";
  user_id: string;
  user_email?: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "investigating" | "resolved";
  created_at: string;
  action_taken?: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

interface SecurityMetrics {
  total_alerts: number;
  active_alerts: number;
  blocked_users: number;
  spam_posts_removed: number;
  avg_response_time: number;
}

interface SecurityDashboardProps {
  className?: string;
}

export function SecurityMonitoring({ className = "" }: SecurityDashboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"alerts" | "activity" | "metrics">("alerts");
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "alerts") {
      fetchSecurityAlerts();
    } else if (activeTab === "activity") {
      fetchActivityLogs();
    } else {
      fetchSecurityMetrics();
      fetchTrendData();
    }
  }, [activeTab, filterSeverity, filterType]);

  const fetchSecurityAlerts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (filterSeverity !== "all") {
        query = query.eq("severity", filterSeverity);
      }
      if (filterType !== "all") {
        query = query.eq("alert_type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch user emails
      const alertsWithEmails = await Promise.all(
        (data || []).map(async (alert: any) => {
          const { data: userData } = await supabase
            .from("users")
            .select("email")
            .eq("id", alert.user_id)
            .single();

          return {
            ...alert,
            user_email: userData?.email || "Unknown",
          };
        })
      );

      setAlerts(alertsWithEmails);
    } catch (err: any) {
      console.error("Error fetching alerts:", err);
      toast({
        title: "Error loading security alerts",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (err: any) {
      console.error("Error fetching activity logs:", err);
      toast({
        title: "Error loading activity logs",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true);

      // Get total alerts
      const { count: totalAlerts } = await supabase
        .from("security_alerts")
        .select("*", { count: "exact", head: true });

      // Get active alerts
      const { count: activeAlerts } = await supabase
        .from("security_alerts")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get blocked users
      const { count: blockedUsers } = await supabase
        .from("blocked_users")
        .select("*", { count: "exact", head: true });

      // Get removed posts (mock)
      const removedPostsCount = Math.floor(Math.random() * 50) + 10;

      setMetrics({
        total_alerts: totalAlerts || 0,
        active_alerts: activeAlerts || 0,
        blocked_users: blockedUsers || 0,
        spam_posts_removed: removedPostsCount,
        avg_response_time: 45, // minutes
      });
    } catch (err: any) {
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async () => {
    // Mock trend data for the last 7 days
    const data = [
      { date: "Mon", alerts: 12, resolved: 8 },
      { date: "Tue", alerts: 15, resolved: 12 },
      { date: "Wed", alerts: 10, resolved: 10 },
      { date: "Thu", alerts: 18, resolved: 14 },
      { date: "Fri", alerts: 22, resolved: 18 },
      { date: "Sat", alerts: 8, resolved: 8 },
      { date: "Sun", alerts: 14, resolved: 10 },
    ];
    setTrendData(data);
  };

  const handleAlertAction = async (alertId: string, action: "investigating" | "resolved", actionDetails?: string) => {
    try {
      const { error } = await supabase
        .from("security_alerts")
        .update({
          status: action,
          action_taken: actionDetails,
        })
        .eq("id", alertId);

      if (error) throw error;

      toast({ title: `Alert ${action}! ✓` });
      fetchSecurityAlerts();
      setSelectedAlert(null);
    } catch (err: any) {
      toast({
        title: "Error updating alert",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    if (severity === "critical") return "bg-red-100 text-red-700 border-red-300";
    if (severity === "high") return "bg-orange-100 text-orange-700 border-orange-300";
    if (severity === "medium") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-blue-100 text-blue-700 border-blue-300";
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === "critical" || severity === "high") {
      return <AlertTriangle className="h-5 w-5" />;
    }
    return <Shield className="h-5 w-5" />;
  };

  if (loading && activeTab !== "metrics") {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <Lock className="h-5 w-5" />
          <span>Loading security data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Security Monitoring</h2>
        <p className="text-gray-600 mt-1">Monitor platform threats and security events</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "alerts"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
          Alerts ({alerts.length})
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "activity"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Activity className="h-5 w-5" />
          Activity
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "metrics"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <TrendingUp className="h-5 w-5" />
          Metrics
        </button>
      </div>

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <>
          {/* Filters */}
          <div className="mb-6 flex gap-2 flex-wrap">
            <div className="flex gap-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Severity:
              </label>
              {["all", "low", "medium", "high", "critical"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                    filterSeverity === sev
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">All secure!</h3>
                <p className="text-gray-600">No active security alerts.</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`rounded-lg border p-4 hover:shadow-lg transition-all cursor-pointer ${getSeverityColor(
                    alert.severity
                  )}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold capitalize">{alert.alert_type.replace("_", " ")}</h3>
                          <p className="text-sm mt-1">{alert.description}</p>
                          <p className="text-xs mt-2 opacity-75">User: {alert.user_email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize bg-white/20`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          {activityLogs.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No activity</h3>
              <p className="text-gray-600">Recent activity logs will appear here.</p>
            </div>
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{log.action}</p>
                    {log.ip_address && <p className="text-sm text-gray-600 mt-1">IP: {log.ip_address}</p>}
                    <p className="text-xs text-gray-500 mt-2">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                  <Activity className="h-5 w-5 text-blue-600 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === "metrics" && (
        <>
          {metrics && (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {[
                  { label: "Total Alerts", value: metrics.total_alerts, icon: AlertTriangle, color: "red" },
                  { label: "Active Alerts", value: metrics.active_alerts, icon: Shield, color: "orange" },
                  { label: "Blocked Users", value: metrics.blocked_users, icon: Ban, color: "purple" },
                  { label: "Posts Removed", value: metrics.spam_posts_removed, icon: TrendingDown, color: "blue" },
                  {
                    label: "Avg Response",
                    value: `${metrics.avg_response_time}m`,
                    icon: Activity,
                    color: "green",
                  },
                ].map((metric, idx) => (
                  <div
                    key={idx}
                    className={`bg-${metric.color}-50 border border-${metric.color}-200 rounded-lg p-4`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">{metric.label}</p>
                        <p className={`text-2xl font-bold mt-2 text-${metric.color}-700`}>{metric.value}</p>
                      </div>
                      <metric.icon className={`h-8 w-8 text-${metric.color}-600 opacity-50`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Trend Chart */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">7-Day Alert Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="alerts" fill="#ef4444" name="New Alerts" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getSeverityIcon(selectedAlert.severity)}
                  <h2 className="text-2xl font-bold text-gray-900 capitalize">
                    {selectedAlert.alert_type.replace("_", " ")}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Description</p>
                <p className="text-gray-800">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Severity</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${getSeverityColor(
                    selectedAlert.severity
                  )}`}>
                    {selectedAlert.severity}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-1">Status</p>
                  <span className="px-3 py-1 rounded-full text-sm font-bold capitalize bg-gray-100 text-gray-700">
                    {selectedAlert.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Affected User</p>
                <p className="text-gray-800">{selectedAlert.user_email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Detected</p>
                <p className="text-gray-800">{new Date(selectedAlert.created_at).toLocaleString()}</p>
              </div>

              {selectedAlert.action_taken && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Action Taken</p>
                  <p className="text-gray-800">{selectedAlert.action_taken}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleAlertAction(selectedAlert.id, "investigating")}
                  className="flex-1 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-bold hover:bg-yellow-200 transition-colors"
                >
                  🔍 Investigate
                </button>
                <button
                  onClick={() => handleAlertAction(selectedAlert.id, "resolved")}
                  className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-colors"
                >
                  ✓ Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityMonitoring;
