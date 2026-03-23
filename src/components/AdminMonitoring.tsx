import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, XCircle, MessageSquare, Trash2, Eye, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Report {
  id: string;
  reporter_id: string;
  reported_item_id: string;
  item_type: "post" | "business" | "user" | "review";
  reason: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
  reporter_name?: string;
  item_name?: string;
}

export interface VerificationRequest {
  id: string;
  business_id: string;
  document_type: string;
  status: "pending" | "verified" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
  business_name?: string;
  document_url?: string;
}

interface AdminDashboardProps {
  className?: string;
}

export function AdminMonitoring({ className = "" }: AdminDashboardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"reports" | "verifications">("reports");
  const [reports, setReports] = useState<Report[]>([]);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("open");

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
    } else {
      fetchVerifications();
    }
  }, [activeTab, filterStatus]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let query = supabase.from("reports").select("*").order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch reporter and item names
      const reportsWithInfo = await Promise.all(
        (data || []).map(async (report: any) => {
          const { data: reporterData } = await supabase
            .from("users")
            .select("email")
            .eq("id", report.reporter_id)
            .single();

          return {
            ...report,
            reporter_name: reporterData?.email || "Anonymous",
          };
        })
      );

      setReports(reportsWithInfo);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      toast({
        title: "Error loading reports",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("verifications")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch business names
      const verificationsWithInfo = await Promise.all(
        (data || []).map(async (v: any) => {
          const { data: businessData } = await supabase
            .from("businesses")
            .select("name")
            .eq("id", v.business_id)
            .single();

          return {
            ...v,
            business_name: businessData?.name || "Unknown Business",
          };
        })
      );

      setVerifications(verificationsWithInfo);
    } catch (err: any) {
      console.error("Error fetching verifications:", err);
      toast({
        title: "Error loading verifications",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: "investigating" | "resolved" | "dismissed", notes?: string) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status: action,
          resolved_at: action !== "investigating" ? new Date().toISOString() : undefined,
          admin_notes: notes,
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({ title: `Report ${action}! ✓` });
      fetchReports();
      setSelectedReport(null);
    } catch (err: any) {
      toast({
        title: "Error updating report",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleVerificationAction = async (
    verificationId: string,
    action: "verified" | "rejected",
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from("verifications")
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes,
        })
        .eq("id", verificationId);

      if (error) throw error;

      toast({ title: `Verification ${action}! ✓` });
      fetchVerifications();
      setSelectedVerification(null);
    } catch (err: any) {
      toast({
        title: "Error updating verification",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getReportIcon = (status: string) => {
    if (status === "open") return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (status === "investigating") return <Clock className="h-5 w-5 text-yellow-600" />;
    if (status === "resolved") return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="animate-pulse flex items-center gap-2 text-gray-500">
          <Shield className="h-5 w-5" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Monitoring</h2>
        <p className="text-gray-600 mt-1">Manage reports and verify businesses</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all ${
            activeTab === "reports"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          🚨 Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab("verifications")}
          className={`px-4 py-3 font-semibold border-b-2 transition-all ${
            activeTab === "verifications"
              ? "border-primary text-primary"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          ✅ Verifications ({verifications.length})
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        {activeTab === "reports" && (
          <>
            {["all", "open", "investigating", "resolved", "dismissed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                  filterStatus === status
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </>
        )}
        {activeTab === "verifications" && (
          <>
            {["all", "pending", "verified", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                  filterStatus === status
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === "reports" && (
          <>
            {reports.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No reports</h3>
                <p className="text-gray-600">All clear! No user reports to review.</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-primary transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{getReportIcon(report.status)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 capitalize">{report.item_type} Report</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Reason:</strong> {report.reason}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Reported by {report.reporter_name} on{" "}
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          report.status === "open"
                            ? "bg-red-100 text-red-700"
                            : report.status === "investigating"
                            ? "bg-yellow-100 text-yellow-700"
                            : report.status === "resolved"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "verifications" && (
          <>
            {verifications.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No verifications pending</h3>
                <p className="text-gray-600">All business verification requests are complete.</p>
              </div>
            ) : (
              verifications.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setSelectedVerification(v)}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-primary transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {v.status === "verified" && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {v.status === "pending" && <Clock className="h-5 w-5 text-yellow-600" />}
                      {v.status === "rejected" && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{v.business_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Document:</strong> {v.document_type}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Submitted {new Date(v.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          v.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : v.status === "verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {v.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Type</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{selectedReport.item_type}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Reason</p>
                <p className="text-gray-800">{selectedReport.reason}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Reported By</p>
                <p className="text-gray-800">{selectedReport.reporter_name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Current Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                  selectedReport.status === "open"
                    ? "bg-red-100 text-red-700"
                    : selectedReport.status === "investigating"
                    ? "bg-yellow-100 text-yellow-700"
                    : selectedReport.status === "resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {selectedReport.status}
                </span>
              </div>

              {selectedReport.admin_notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Admin Notes</p>
                  <p className="text-gray-800">{selectedReport.admin_notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleReportAction(selectedReport.id, "investigating")}
                  className="flex-1 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-bold hover:bg-yellow-200 transition-colors"
                >
                  Investigate
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, "resolved")}
                  className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-colors"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, "dismissed")}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Details Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Verification Request</h2>
                <button
                  onClick={() => setSelectedVerification(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Business</p>
                <p className="text-lg font-bold text-gray-900">{selectedVerification.business_name}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Document Type</p>
                <p className="text-gray-800 capitalize">{selectedVerification.document_type}</p>
              </div>

              {selectedVerification.document_url && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold mb-2">Document Preview</p>
                  <a
                    href={selectedVerification.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Document
                  </a>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600 font-semibold mb-1">Submitted</p>
                <p className="text-gray-800">{new Date(selectedVerification.submitted_at).toLocaleString()}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => handleVerificationAction(selectedVerification.id, "verified")}
                  className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200 transition-colors"
                >
                  ✓ Verify
                </button>
                <button
                  onClick={() => handleVerificationAction(selectedVerification.id, "rejected")}
                  className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMonitoring;
