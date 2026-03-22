import React, { useState, useRef } from "react";
import { ImagePlus, Upload, X, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PostType, postTypeConfig } from "@/data/samplePosts";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { processFilesForUpload, validateFile, Attachment, getAttachmentPreviewUrl } from "@/lib/mediaUpload";

interface CreatePostModalProps {
  trigger: React.ReactNode;
}

const CreatePostModal = ({ trigger }: CreatePostModalProps) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<PostType>("update");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;
    setLoading(true);

    // Use first image as image_url if available
    let imageUrl: string | null = null;
    if (attachments.length > 0) {
      const firstImage = attachments.find((a) => a.mime_type.startsWith("image/"));
      if (firstImage) {
        imageUrl = firstImage.url;
      }
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      type,
      content: content.trim(),
      image_url: imageUrl,
      attachments: attachments,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Post created!", description: "Your post is now live on the feed." });
    setContent("");
    setAttachments([]);
    setUploadError(null);
    setOpen(false);
    queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setUploadError(null);

    try {
      // Validate all files first
      const invalidFiles = files.filter((f) => !validateFile(f).valid);
      if (invalidFiles.length > 0) {
        const errors = invalidFiles.map((f) => {
          const validation = validateFile(f);
          return `${f.name}: ${validation.error}`;
        });
        setUploadError(errors.join("\n"));
        setUploadingFiles(false);
        return;
      }

      const newAttachments = await processFilesForUpload(files, user!.id);
      if (newAttachments.length === 0) {
        setUploadError("No files were successfully uploaded");
      } else {
        setAttachments((prev) => [...prev, ...newAttachments]);
        toast({ title: `${newAttachments.length} file(s) uploaded successfully` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploadError(message);
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Create a Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            {(Object.keys(postTypeConfig) as PostType[]).map((t) => {
              const cfg = postTypeConfig[t];
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    type === t
                      ? `${cfg.bgClass} ${cfg.textClass} ring-2 ring-offset-1`
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                  style={type === t ? { "--tw-ring-color": cfg.color } as React.CSSProperties : {}}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
          <Textarea
            placeholder="What's happening at your business?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="resize-none"
          />

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-border rounded-lg p-3">
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload size={20} className="text-muted-foreground" />
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">Add Images or Videos</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Images: JPG, PNG, WebP (max 10MB) • Videos: MP4, WebM (max 150MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                disabled={uploadingFiles}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles}
                className="text-xs"
              >
                {uploadingFiles ? "Uploading..." : "Select Files"}
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {uploadError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="whitespace-pre-wrap text-xs">{uploadError}</AlertDescription>
            </Alert>
          )}

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Uploaded Files ({attachments.length})</p>
              <div className="grid grid-cols-4 gap-2">
                {attachments.map((att) => (
                  <div key={att.id} className="relative group">
                    <img
                      src={getAttachmentPreviewUrl(att)}
                      alt={att.filename}
                      className="w-full h-16 object-cover rounded border border-border"
                    />
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">
              <ImagePlus size={18} />
              <span className="text-xs">Photos/Videos</span>
            </button>
            <Button variant="hero" onClick={handleSubmit} disabled={!content.trim() || loading || uploadingFiles}>
              {loading ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
