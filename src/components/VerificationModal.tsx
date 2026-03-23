import { useState } from "react";
import { Shield, Upload, CheckCircle, Clock, AlertCircle, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface VerificationStatus {
  status: "pending" | "verified" | "rejected" | "expired";
  submitted_at: string;
  verified_at?: string;
  document_type: "government_id" | "business_registration" | "bank_statement";
  admin_notes?: string;
  verification_badge_shown?: boolean;
}

interface VerificationModalProps {
  businessId: string;
  onClose: () => void;
  className?: string;
}

export function VerificationModal({ businessId, onClose, className = "" }: VerificationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"choose" | "upload" | "review">("choose");
  const [documentType, setDocumentType] = useState<"government_id" | "business_registration" | "bank_statement" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  const documentTypes = [
    {
      id: "government_id",
      label: "Government ID",
      description: "Driver's license, passport, or national ID",
      icon: "🪪",
      info: "Verify business owner identity",
    },
    {
      id: "business_registration",
      label: "Business Registration",
      description: "Business license or registration certificate",
      icon: "📋",
      info: "Verify business legitimacy",
    },
    {
      id: "bank_statement",
      label: "Bank Statement",
      description: "Recent bank statement (optional)",
      icon: "🏦",
      info: "Enable payment features",
    },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({ title: "File too large (max 10MB)", variant: "destructive" });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!documentType || !file || !user) return;

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${documentType}-${Date.now()}.${fileExt}`;
      const filePath = `verifications/${businessId}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      // Submit verification request
      const { error: insertError } = await supabase.from("verifications").insert({
        business_id: businessId,
        document_type: documentType,
        document_url: publicUrl.publicUrl,
        status: "pending",
      });

      if (insertError) throw insertError;

      toast({
        title: "Document submitted! ✓",
        description: "Your verification is pending admin review. You'll be notified once approved.",
      });

      setVerificationStatus({
        status: "pending",
        submitted_at: new Date().toISOString(),
        document_type: documentType as "government_id" | "business_registration" | "bank_statement",
      });

      setCurrentStep("review");
      setFile(null);
    } catch (err: any) {
      toast({
        title: "Error uploading document",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Business Verification</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8">
          {currentStep === "choose" && (
            <div className="space-y-4">
              <p className="text-gray-700 mb-6">
                Get verified to unlock exclusive features, boost visibility, and earn the trusted badge!
              </p>

              <div className="space-y-3">
                {documentTypes.map((docType) => (
                  <button
                    key={docType.id}
                    onClick={() => {
                      setDocumentType(docType.id as any);
                      setCurrentStep("upload");
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{docType.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{docType.label}</h3>
                        <p className="text-sm text-gray-600">{docType.description}</p>
                        <p className="text-xs text-blue-600 font-semibold mt-2">{docType.info}</p>
                      </div>
                      <div className="text-primary">→</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-900">
                  <strong>🔒 Your documents are secure:</strong> We encrypt all files and only admins review them. Your data is never shared.
                </p>
              </div>
            </div>
          )}

          {currentStep === "upload" && documentType && (
            <div className="space-y-4">
              <button
                onClick={() => setCurrentStep("choose")}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                ← Back
              </button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-900 font-semibold mb-2">
                  {documentTypes.find((d) => d.id === documentType)?.label}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                  Click to upload or drag and drop
                </p>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  Select File
                </label>
              </div>

              {file && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>✓ Selected:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Requirements:</strong> Document must be clear, readable, and show your full name and all relevant details.
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  file && !uploading
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-gray-100 text-gray-500 cursor-not-allowed"
                }`}
              >
                {uploading ? "Uploading..." : "Submit Document"}
              </button>
            </div>
          )}

          {currentStep === "review" && verificationStatus && (
            <div className="space-y-4 text-center">
              <div className="text-5xl mb-4">
                {verificationStatus.status === "pending" && "⏳"}
                {verificationStatus.status === "verified" && "✅"}
                {verificationStatus.status === "rejected" && "❌"}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {verificationStatus.status === "pending" && "Pending Review"}
                {verificationStatus.status === "verified" && "Verified! 🎉"}
                {verificationStatus.status === "rejected" && "Not Verified"}
              </h3>

              <p className="text-gray-600">
                {verificationStatus.status === "pending" &&
                  "Your document has been submitted and is under review by our admin team. This typically takes 24-48 hours."}
                {verificationStatus.status === "verified" &&
                  "Congratulations! Your business is now verified. You can now enable all premium features."}
                {verificationStatus.status === "rejected" &&
                  "Your document didn't meet our requirements. Please review the notes below and resubmit."}
              </p>

              {verificationStatus.admin_notes && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <p className="text-sm font-semibold text-red-900 mb-1">Admin Notes:</p>
                  <p className="text-sm text-red-800">{verificationStatus.admin_notes}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-semibold text-gray-900">Status Details:</p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {documentTypes.find((d) => d.id === verificationStatus.document_type)?.label}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Submitted:</strong> {new Date(verificationStatus.submitted_at).toLocaleDateString()}
                </p>
                {verificationStatus.verified_at && (
                  <p className="text-sm text-gray-600">
                    <strong>Verified:</strong> {new Date(verificationStatus.verified_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export interface VerificationStatusProps {
  businessId: string;
  status: VerificationStatus | null;
  className?: string;
}

export function VerificationBadge({ businessId, status, className = "" }: VerificationStatusProps) {
  const [showModal, setShowModal] = useState(false);

  if (status?.status === "verified") {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 bg-blue-100 border-2 border-blue-400 rounded-full ${className}`}>
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <span className="text-xs font-bold text-blue-700">Verified</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded-full hover:border-primary hover:bg-blue-50 transition-all ${className}`}
      >
        <Shield className="h-4 w-4 text-gray-600" />
        <span className="text-xs font-bold text-gray-700">
          {status?.status === "pending" ? "Pending" : "Verify"}
        </span>
      </button>
      {showModal && (
        <VerificationModal businessId={businessId} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

export default VerificationModal;
