import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, CheckCircle, XCircle, Clock, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface VerificationRequest {
  id: string;
  business_id: string;
  user_id: string;
  document_url: string | null;
  document_type: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  businesses: { name: string; slug: string } | null;
  profiles: { full_name: string | null } | null;
}

const Admin = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && (!user || role !== "admin")) {
      navigate("/");
      return;
    }
  }, [user, role, authLoading, navigate]);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["verification-requests"],
    enabled: !!user && role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select(`*, businesses(name, slug), profiles:profiles!verification_requests_user_id_fkey(full_name)`)
        .order("created_at", { ascending: false });
      if (error) {
        // If the join fails, try without profile join
        const { data: fallback, error: err2 } = await supabase
          .from("verification_requests")
          .select(`*, businesses(name, slug)`)
          .order("created_at", { ascending: false });
        if (err2) throw err2;
        return (fallback ?? []).map((r: any) => ({ ...r, profiles: null })) as VerificationRequest[];
      }
      return data as unknown as VerificationRequest[];
    },
  });

  const handleAction = async (requestId: string, businessId: string, action: "approved" | "rejected") => {
    const notes = adminNotes[requestId] || null;
    const { error } = await supabase
      .from("verification_requests")
      .update({ status: action, admin_notes: notes, reviewed_by: user!.id })
      .eq("id", requestId);

    if (error) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
      return;
    }

    if (action === "approved") {
      await supabase.from("businesses").update({ is_verified: true }).eq("id", businessId);
    }

    toast({ title: action === "approved" ? "Business verified! ✓" : "Request rejected" });
    queryClient.invalidateQueries({ queryKey: ["verification-requests"] });
  };

  if (authLoading) return null;
  if (role !== "admin") return null;

  const pending = requests.filter((r) => r.status === "pending");
  const reviewed = requests.filter((r) => r.status !== "pending");

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle size={16} className="text-primary" />;
    if (status === "rejected") return <XCircle size={16} className="text-destructive" />;
    return <Clock size={16} className="text-secondary" />;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl flex items-center gap-2">
              <Shield size={28} className="text-destructive" />
              Admin Panel
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage business verifications and platform security</p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="pending">
              <TabsList className="mb-6">
                <TabsTrigger value="pending" className="gap-2">
                  <AlertTriangle size={14} />
                  Pending ({pending.length})
                </TabsTrigger>
                <TabsTrigger value="reviewed" className="gap-2">
                  <FileText size={14} />
                  Reviewed ({reviewed.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {isLoading ? (
                  <div className="py-20 text-center text-muted-foreground">Loading…</div>
                ) : pending.length > 0 ? (
                  <div className="space-y-4">
                    {pending.map((req) => (
                      <div key={req.id} className="rounded-xl border border-border bg-card p-6 shadow-card">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2">
                              {statusIcon(req.status)}
                              <h3 className="font-display text-lg font-bold text-card-foreground">
                                {req.businesses?.name ?? "Unknown Business"}
                              </h3>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Submitted by {req.profiles?.full_name ?? "Unknown"} · {format(new Date(req.created_at), "MMM d, yyyy")}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Document type: {req.document_type ?? "Not specified"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Textarea
                            placeholder="Admin notes (optional)"
                            value={adminNotes[req.id] ?? ""}
                            onChange={(e) => setAdminNotes({ ...adminNotes, [req.id]: e.target.value })}
                            rows={2}
                            className="resize-none text-sm"
                          />
                        </div>
                        <div className="mt-4 flex gap-3">
                          <Button
                            variant="hero"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleAction(req.id, req.business_id, "approved")}
                          >
                            <CheckCircle size={14} />
                            Approve & Verify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={() => handleAction(req.id, req.business_id, "rejected")}
                          >
                            <XCircle size={14} />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-muted-foreground">No pending verification requests</div>
                )}
              </TabsContent>

              <TabsContent value="reviewed">
                {reviewed.length > 0 ? (
                  <div className="space-y-3">
                    {reviewed.map((req) => (
                      <div key={req.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                        {statusIcon(req.status)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-card-foreground truncate">{req.businesses?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.status === "approved" ? "Verified" : "Rejected"} · {format(new Date(req.created_at), "MMM d")}
                          </p>
                        </div>
                        {req.admin_notes && (
                          <p className="text-xs text-muted-foreground max-w-xs truncate">{req.admin_notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-muted-foreground">No reviewed requests yet</div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
